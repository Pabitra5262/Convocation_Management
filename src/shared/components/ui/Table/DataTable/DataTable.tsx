import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsUpDown,
    Eye,
    Filter as FilterIcon,
    GripVertical,
    Maximize2,
    Minimize2,
    MoreHorizontal,
    Pencil,
    Rows3,
    Search,
    Trash2,
    X,
    type LucideIcon,
} from "lucide-react";
import { Button, IconButton, ActionIcon, type ActionTone } from "../../Button";
import ReusableOffcanvas from "../../Offcanvas/ReusableOffcanvas";
import { TableSkeleton } from "@/shared/components/layout/Loader/Loader";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { usePersistentState } from "@/shared/hooks/usePersistentState";
import { DropdownMenu } from "./Floating";
import { ColumnsMenu, ExportMenu, ViewsMenu } from "./TableMenus";
import { Pagination } from "./Pagination";
import { EmptyState, ErrorState, NoResults } from "./TableStates";
import { compareValues, exportTable, newId } from "./dataTable.utils";
import type { Column, DataTableProps, ExportFormat, ExportScope, PinSide, SavedView, SortState } from "./dataTable.types";

/* Ported from hims-ui-new components/ui/Table/DataTable.tsx. Styles: src/shared/styles/table.css */

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;
const hideBelowClass = { md: "max-md:hidden", lg: "max-lg:hidden", xl: "max-xl:hidden" } as const;
const DEFAULT_COL_WIDTH = 160;
const MIN_COL_WIDTH = 72;
const MAX_COL_WIDTH = 640;
const LEAD_W = 40;
const ACTIONS_W = 144;

/** Cursor shown everywhere while a column is being dragged wider / narrower. */
const setBodyCursor = (cursor: string) => {
    document.body.style.cursor = cursor;
};

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

function defaultCell<T>(c: Column<T>, row: T): ReactNode {
    const v = c.accessor?.(row);
    if (v == null || v === "") return <span className="text-muted-foreground">—</span>;
    if (v instanceof Date) return v.toLocaleDateString();
    return String(v);
}

/** Value that can be owned by the parent (controlled) or by the table. */
function useControllable<V>(value: V | undefined, initial: V, onChange?: (v: V) => void): [V, (v: V) => void] {
    const [inner, setInner] = useState(initial);
    const controlled = value !== undefined;
    const set = useCallback(
        (v: V) => {
            if (!controlled) setInner(v);
            onChange?.(v);
        },
        [controlled, onChange],
    );
    return [controlled ? value : inner, set];
}

/** Checkbox that can show the "some selected" dash. */
const RowCheckbox = ({ checked, indeterminate, onChange, label, disabled }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string; disabled?: boolean }) => (
    <input
        type="checkbox"
        className="ui-check"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        ref={(el) => {
            if (el) el.indeterminate = !!indeterminate && !checked;
        }}
    />
);

const nextSort = (current: SortState | null, id: string): SortState | null => {
    if (current?.id !== id) return { id, dir: "asc" };
    return current.dir === "asc" ? { id, dir: "desc" } : null;
};

const sortIcon = (dir: SortState["dir"] | null) => {
    if (dir === "asc") return ChevronUp;
    if (dir === "desc") return ChevronDown;
    return ChevronsUpDown;
};

const ariaSort = (dir: SortState["dir"] | null) => {
    if (dir === "asc") return "ascending";
    if (dir === "desc") return "descending";
    return "none";
};

export function DataTable<T>({
    data, columns, rowKey, rowLabel, caption,
    loading, error, onRetry,
    pagination, onPageChange, onPageSizeChange,
    sort: sortProp, onSortChange,
    search: searchProp, onSearchChange, searchPlaceholder = "Search…",
    selectable, selectedKeys, onSelectionChange, bulkActions,
    actions, renderExpanded, renderPreview, previewTitle, previewFooter,
    extraViewState, viewsKey, filterToggle,
    filters, toolbarActions, cardActions, onExport, exportFileName = "export",
    zebra: zebraProp = true, dense: denseProp = false, stickyHeader = true, allowFullscreen = true, maxHeight,
    emptyState, emptyTitle, emptyDescription, emptyAction, className = "",
}: Readonly<DataTableProps<T>>) {
    const uid = useId().replace(/:/g, "");
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const server = !!pagination;

    /* ---- full-screen mode (overlay portalled to <body>) ---- */
    const [full, setFull] = useState(false);
    useEffect(() => {
        if (!full) return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            // Let an open menu / dialog consume Escape first.
            if (e.key === "Escape" && !document.querySelector("[data-popover], .ui-overlay")) setFull(false);
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = overflow;
            document.removeEventListener("keydown", onKey);
        };
    }, [full]);

    /* ---- view state: density, columns (visibility / order / pins / widths) ---- */
    const defaultHidden = useMemo(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)), [columns]);
    const defaultPins = useMemo(
        () => Object.fromEntries(columns.filter((c) => c.sticky).map((c) => [c.id, c.sticky as PinSide])) as Record<string, PinSide>,
        [columns],
    );
    const [zebra, setZebra] = useState(zebraProp);
    const [dense, setDense] = useState(denseProp);
    const [hidden, setHidden] = useState<Set<string>>(() => new Set(defaultHidden));
    const [order, setOrder] = useState<string[]>(() => columns.map((c) => c.id));
    const [pins, setPins] = useState<Record<string, PinSide>>(() => defaultPins);
    const [widths, setWidths] = useState<Record<string, number>>({});
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Keep hidden state in sync if columns update with defaultHidden
    useEffect(() => {
        setHidden((prev) => {
            const next = new Set(prev);
            let changed = false;
            for (const c of columns) {
                if (c.defaultHidden && !prev.has(c.id)) {
                    next.add(c.id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [columns]);

    /* ---- data state (controlled or internal) ---- */
    const [sort, setSort] = useControllable<SortState | null>(sortProp, null, onSortChange);
    const [search, setSearch] = useControllable<string>(searchProp, "", onSearchChange);
    const [selection, setSelection] = useControllable<string[]>(selectedKeys, [], onSelectionChange);
    const [clientPage, setClientPage] = useState(1);
    const [clientSize, setClientSize] = useState(10);
    const selected = useMemo(() => new Set(selection), [selection]);

    /* ---- column model ---- */
    const ordered = useMemo(() => {
        const byId = new Map(columns.map((c) => [c.id, c]));
        const ids = [...order.filter((id) => byId.has(id)), ...columns.map((c) => c.id).filter((id) => !order.includes(id))];
        return ids.map((id) => byId.get(id) as Column<T>);
    }, [columns, order]);
    const visibleOrdered = ordered.filter((c) => !hidden.has(c.id));
    // Pinned columns are grouped to the edges: left pins, then the free columns, then right pins.
    const leftPinned = visibleOrdered.filter((c) => pins[c.id] === "left");
    const rightPinned = visibleOrdered.filter((c) => pins[c.id] === "right");
    const freeCols = visibleOrdered.filter((c) => !pins[c.id]);
    const renderCols = [...leftPinned, ...freeCols, ...rightPinned];
    const fixedLayout = Object.keys(widths).length > 0;
    const colW = (c: Column<T>) => widths[c.id] ?? DEFAULT_COL_WIDTH;

    const moveColumn = (id: string, dir: -1 | 1) => {
        const ids = ordered.map((c) => c.id);
        const i = ids.indexOf(id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= ids.length) return;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        setOrder(ids);
    };
    const dropColumn = (fromId: string, toId: string) => {
        const ids = ordered.map((c) => c.id).filter((id) => id !== fromId);
        const at = ids.indexOf(toId);
        ids.splice(at < 0 ? ids.length : at, 0, fromId);
        setOrder(ids);
    };
    const toggleHidden = (id: string) =>
        setHidden((h) => {
            const n = new Set(h);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    const pinColumn = (id: string, side: PinSide | null) =>
        setPins((p) => {
            const n = { ...p };
            if (side) n[id] = side;
            else delete n[id];
            return n;
        });
    const resetColumns = () => {
        setHidden(new Set(defaultHidden));
        setOrder(columns.map((c) => c.id));
        setPins(defaultPins);
        setWidths({});
    };

    /* ---- measured offsets for pinned columns (sticky left / right in px) ---- */
    const tableRef = useRef<HTMLTableElement>(null);
    /** Header cell for a column id (or one of the "__expand" / "__select" / "__actions" helpers). */
    const headerCell = (k: string) => tableRef.current?.querySelector<HTMLTableCellElement>(`th[data-col="${CSS.escape(k)}"]`) ?? null;
    const [offsets, setOffsets] = useState<{ left: Record<string, number>; right: Record<string, number> }>({ left: {}, right: {} });
    const hasActions = !!actions && !!(actions.onView || actions.onEdit || actions.onDelete || actions.custom || actions.more);
    const leftKey = leftPinned.map((c) => c.id).join();
    const rightKey = rightPinned.map((c) => c.id).join();
    const measure = useCallback(() => {
        const w = (k: string) => headerCell(k)?.getBoundingClientRect().width ?? 0;
        const left: Record<string, number> = {};
        const right: Record<string, number> = {};
        let acc = (renderExpanded ? w("__expand") : 0) + (selectable ? w("__select") : 0);
        for (const id of leftKey ? leftKey.split(",") : []) {
            left[id] = acc;
            acc += w(id);
        }
        let accR = hasActions ? w("__actions") : 0;
        for (const id of (rightKey ? rightKey.split(",") : []).reverse()) {
            right[id] = accR;
            accR += w(id);
        }
        setOffsets((prev) => (JSON.stringify(prev) === JSON.stringify({ left, right }) ? prev : { left, right }));
    }, [leftKey, rightKey, renderExpanded, selectable, hasActions]);
    // The observer also fires once when it starts, so this measures after every layout-affecting change.
    useEffect(() => {
        const el = tableRef.current;
        if (!el) return;
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [measure, isDesktop, full]);

    /* ---- column resizing (pointer + keyboard) ---- */
    const snapshotWidths = () => {
        if (Object.keys(widths).length) return widths;
        const snap: Record<string, number> = {};
        for (const c of renderCols) snap[c.id] = Math.round(headerCell(c.id)?.getBoundingClientRect().width ?? DEFAULT_COL_WIDTH);
        return snap;
    };
    const startResize = (e: React.PointerEvent, c: Column<T>) => {
        e.preventDefault();
        e.stopPropagation();
        const base = snapshotWidths();
        const startX = e.clientX;
        const startW = base[c.id] ?? DEFAULT_COL_WIDTH;
        setWidths(base);
        const move = (ev: PointerEvent) => {
            const w = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, startW + ev.clientX - startX));
            setWidths((p) => ({ ...p, [c.id]: Math.round(w) }));
        };
        const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            setBodyCursor("");
        };
        setBodyCursor("col-resize");
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
    };
    const keyResize = (e: React.KeyboardEvent, c: Column<T>) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const base = snapshotWidths();
            const w = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, (base[c.id] ?? DEFAULT_COL_WIDTH) + (e.key === "ArrowRight" ? 16 : -16)));
            setWidths({ ...base, [c.id]: w });
        } else if (e.key === "Enter" || e.key === "Escape") {
            (e.target as HTMLElement).blur();
        }
    };
    const resetWidth = (id: string) =>
        setWidths((p) => {
            const n = { ...p };
            delete n[id];
            return n;
        });

    /* ---- column drag-to-reorder (grip in the header) ---- */
    const [dragId, setDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    /* ---- client-side pipeline: search → sort → page ---- */
    const processed = useMemo(() => {
        if (server) return data;
        let rows = data;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter((r) =>
                columns.some((c) => {
                    const v = c.accessor?.(r);
                    return v != null && String(v).toLowerCase().includes(q);
                }),
            );
        }
        if (sort) {
            const acc = columns.find((c) => c.id === sort.id)?.accessor;
            if (acc) rows = [...rows].sort((a, b) => compareValues(acc(a), acc(b)) * (sort.dir === "asc" ? 1 : -1));
        }
        return rows;
    }, [data, columns, search, sort, server]);

    const page = server ? pagination.page : clientPage;
    const pageSize = server ? pagination.pageSize : clientSize;
    const total = server ? pagination.total : processed.length;
    const pageRows = server ? processed : processed.slice((page - 1) * pageSize, page * pageSize);

    /* ---- handlers ---- */
    const changePage = (p: number) => (server ? onPageChange?.(p) : setClientPage(p));
    const changeSize = (s: number) => {
        if (server) onPageSizeChange?.(s);
        else {
            setClientSize(s);
            setClientPage(1);
        }
    };
    const changeSearch = (q: string) => {
        setSearch(q);
        if (!server) setClientPage(1);
    };
    const cycleSort = (id: string) => {
        setSort(nextSort(sort, id));
        if (!server) setClientPage(1);
    };

    const pageKeys = pageRows.map(rowKey);
    const allOnPage = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
    const someOnPage = pageKeys.some((k) => selected.has(k));
    const toggleAll = () => {
        const next = new Set(selected);
        if (allOnPage) pageKeys.forEach((k) => next.delete(k));
        else pageKeys.forEach((k) => next.add(k));
        setSelection([...next]);
    };
    const toggleRow = (k: string) => {
        const next = new Set(selected);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        setSelection([...next]);
    };
    const toggleExpand = (k: string) =>
        setExpanded((s) => {
            const n = new Set(s);
            if (n.has(k)) n.delete(k);
            else n.add(k);
            return n;
        });

    /* ---- saved views ---- */
    const [views, setViews] = usePersistentState<SavedView[]>(`arf.table.views.${viewsKey ?? caption}`, []);
    const [activeView, setActiveView] = useState<string | null>(null);
    const saveView = (name: string) => {
        const v: SavedView = {
            id: newId(), name, search, sort, hidden: [...hidden], order: ordered.map((c) => c.id), pins, widths, dense, zebra,
            extra: extraViewState?.get(),
        };
        setViews((p) => [...p, v]);
        setActiveView(v.id);
    };
    const applyView = (v: SavedView) => {
        setSearch(v.search);
        setSort(v.sort);
        setHidden(new Set(v.hidden));
        setOrder(v.order);
        setPins(v.pins);
        setWidths(v.widths);
        setDense(v.dense);
        setZebra(v.zebra);
        if (v.extra !== undefined) extraViewState?.apply(v.extra);
        setClientPage(1);
        setActiveView(v.id);
    };

    /* ---- export ---- */
    const exportColumns = ordered.filter((c) => c.accessor);
    const rowsFor = (scope: ExportScope): T[] => {
        if (scope === "selected") return data.filter((r) => selected.has(rowKey(r)));
        if (scope === "page") return pageRows;
        return processed;
    };
    const doExport = (format: ExportFormat, scope: ExportScope) => {
        const rows = rowsFor(scope);
        if (onExport) {
            onExport(rows, exportColumns, format);
            return;
        }
        exportTable({
            format,
            filename: exportFileName,
            title: caption,
            headers: exportColumns.map((c) => c.header),
            rows: rows.map((r) => exportColumns.map((c) => c.accessor?.(r))),
        });
    };

    /* ---- row preview panel ---- */
    const [previewKey, setPreviewKey] = useState<string | null>(null);
    const previewIndex = previewKey ? pageRows.findIndex((r) => rowKey(r) === previewKey) : -1;
    const previewRow = previewIndex >= 0 ? pageRows[previewIndex] : null;
    const rowClick = (e: React.MouseEvent, k: string) => {
        if (!renderPreview) return;
        if ((e.target as HTMLElement).closest('button, a, input, label, select, textarea, [role="button"], [role="menuitem"]')) return;
        if (window.getSelection()?.toString()) return; // user is selecting text
        setPreviewKey(k);
    };
    const rowKeyDown = (e: React.KeyboardEvent, k: string) => {
        if (renderPreview && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setPreviewKey(k);
        }
    };

    /* ---- row actions ---- */
    const label = (r: T) => rowLabel?.(r) ?? rowKey(r);
    const renderActions = (row: T) => {
        if (!actions) return null;
        const name = label(row);
        const btn = (icon: LucideIcon, text: string, tone: ActionTone, onClick: () => void) => (
            // Tooltip above the icon (below would be clipped on the last rows); title="" avoids a second, native tooltip.
            <span key={text} data-tip={text} data-tip-pos="top">
                <ActionIcon icon={icon} tone={tone} label={`${text} ${name}`} title="" onClick={onClick} />
            </span>
        );
        const more = actions.more?.(row);
        return (
            <div className="flex items-center justify-start gap-1">
                {actions.onView && btn(Eye, "View", "primary", () => actions.onView?.(row))}
                {actions.onEdit && btn(Pencil, "Edit", "info", () => actions.onEdit?.(row))}
                {actions.onDelete && btn(Trash2, "Delete", "danger", () => actions.onDelete?.(row))}
                {actions.custom?.(row).map((a) => btn(a.icon, a.label, a.tone ?? "neutral", a.onClick))}
                {more && more.length > 0 && (
                    <DropdownMenu
                        label={`More actions for ${name}`}
                        items={more}
                        trigger={(p) => <ActionIcon icon={MoreHorizontal} tone="neutral" label={`More actions for ${name}`} {...p} />}
                    />
                )}
            </div>
        );
    };

    /* ---- toolbar ---- */
    const bulkCount = selection.length;
    const toolbar = (
        <div className="dt-toolbar no-print">
            {bulkCount > 0 && bulkActions ? (
                <div className="dt-bulk fx-slide-x" role="region" aria-label="Bulk actions">
                    <span key={bulkCount} className="dt-bulk__count" aria-live="polite">{bulkCount} selected</span>
                    {bulkActions.map((a) => (
                        <Button key={a.id} size="sm" variant={a.danger ? "danger" : "outline"} leftIcon={a.icon} onClick={() => a.onClick(selection)}>
                            {a.label}
                        </Button>
                    ))}
                    <Button size="sm" variant="ghost" leftIcon={X} onClick={() => setSelection([])}>Clear</Button>
                </div>
            ) : (
                <div className="dt-toolbar__search">
                    <label className="ui-field dt-search">
                        <Search size={15} className="shrink-0 text-muted" />
                        <input
                            aria-label="Search table"
                            type="search"
                            value={search}
                            onChange={(e) => changeSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                        />
                    </label>
                    {filters}
                </div>
            )}
            <div className="dt-toolbar__tools">
                {toolbarActions}
                <ViewsMenu
                    views={views}
                    activeId={activeView}
                    onApply={applyView}
                    onSave={saveView}
                    onDelete={(id) => {
                        setViews((p) => p.filter((v) => v.id !== id));
                        if (activeView === id) setActiveView(null);
                    }}
                />
                <span data-tip={dense ? "Normal rows" : "Dense rows"}>
                    <IconButton
                        icon={Rows3}
                        label={dense ? "Switch to normal row height" : "Switch to dense rows"}
                        size="sm"
                        variant="outline"
                        aria-pressed={dense}
                        onClick={() => setDense((d) => !d)}
                        className={dense ? "dt-tool-on" : ""}
                    />
                </span>
                <ColumnsMenu
                    columns={ordered.map((c) => ({ id: c.id, header: c.header, hideable: c.hideable !== false }))}
                    hidden={hidden}
                    pins={pins}
                    onToggle={toggleHidden}
                    onMove={moveColumn}
                    onPin={pinColumn}
                    onReset={resetColumns}
                    dense={dense}
                    onDense={setDense}
                    zebra={zebra}
                    onZebra={setZebra}
                />
                <ExportMenu counts={{ page: pageRows.length, all: processed.length, selected: data.filter((r) => selected.has(rowKey(r))).length }} serverMode={server} onExport={doExport} />
                {allowFullscreen && (
                    <Button size="sm" variant="outline" leftIcon={full ? Minimize2 : Maximize2} aria-pressed={full} onClick={() => setFull((f) => !f)}>
                        <span className="max-sm:sr-only">{full ? "Exit full screen" : "Full screen"}</span>
                    </Button>
                )}
                {filterToggle && !full && (
                    <span className="relative inline-flex" data-tip={filterToggle.hidden ? "Show filters" : "Hide filters"}>
                        <IconButton
                            icon={FilterIcon}
                            label={filterToggle.hidden ? "Show filters" : "Hide filters"}
                            size="sm"
                            variant="outline"
                            aria-pressed={!filterToggle.hidden}
                            onClick={filterToggle.onToggle}
                            className={filterToggle.hidden ? "" : "dt-tool-on"}
                        />
                        {filterToggle.appliedCount ? <span className="hdr-count dt-filter-count">{filterToggle.appliedCount}</span> : null}
                    </span>
                )}
            </div>
        </div>
    );

    /* ---- body states ---- */
    const colSpan = renderCols.length + (selectable ? 1 : 0) + (renderExpanded ? 1 : 0) + (hasActions ? 1 : 0);
    const noData = !loading && !error && pageRows.length === 0;
    const emptyContent =
        emptyState ??
        (search ? (
            <NoResults query={search} onClear={() => changeSearch("")} />
        ) : (
            <EmptyState action={emptyAction} title={emptyTitle ?? "Nothing here yet"} description={emptyDescription ?? "Records you add will appear in this table."} />
        ));
    let stateContent: ReactNode = null;
    if (loading) stateContent = <TableSkeleton rows={Math.min(pageSize, 8)} columns={Math.min(renderCols.length, 5)} />;
    else if (error) stateContent = <ErrorState onRetry={onRetry} compact />;
    else if (noData) stateContent = emptyContent;

    const rowHeight = dense ? "dt-row--dense" : "";

    /** Sticky + measured offset + width for a pinned / resized column cell. */
    const colStyle = (c: Column<T>): CSSProperties => {
        const s: CSSProperties = {};
        if (fixedLayout) {
            s.width = colW(c);
            s.minWidth = colW(c);
            s.maxWidth = colW(c);
        }
        if (pins[c.id] === "left") s.left = offsets.left[c.id] ?? 0;
        if (pins[c.id] === "right") s.right = offsets.right[c.id] ?? 0;
        return s;
    };
    const pinCls = (c: Column<T>) => {
        const side = pins[c.id];
        if (!side) return "";
        const edge = side === "left" ? leftPinned[leftPinned.length - 1]?.id === c.id : rightPinned[0]?.id === c.id;
        return cx("dt-pinned", edge && (side === "left" ? "dt-pinned--edge-left" : "dt-pinned--edge-right"));
    };
    const tableWidth = fixedLayout
        ? (renderExpanded ? LEAD_W : 0) + (selectable ? LEAD_W : 0) + (hasActions ? ACTIONS_W : 0) + renderCols.reduce((a, c) => a + colW(c), 0)
        : undefined;

    /* ---- desktop table ---- */
    const table = (
        <div className={cx("dt-scroll", full && "dt-scroll--full")} style={maxHeight && !full ? { maxHeight } : undefined}>
            <table
                ref={tableRef}
                className={cx("dt-table", zebra && "dt-table--zebra", stickyHeader && "dt-table--sticky")}
                style={fixedLayout ? { tableLayout: "fixed", width: tableWidth, minWidth: "100%" } : undefined}
                aria-busy={loading || undefined}
            >
                <caption className="sr-only">{caption}</caption>
                <thead>
                    <tr>
                        {renderExpanded && <th data-col="__expand" scope="col" className="dt-th dt-th--lead"><span className="sr-only">Expand</span></th>}
                        {selectable && (
                            <th data-col="__select" scope="col" className="dt-th dt-th--lead">
                                <RowCheckbox label="Select all rows on this page" checked={allOnPage} indeterminate={someOnPage} onChange={toggleAll} disabled={pageRows.length === 0} />
                            </th>
                        )}
                        {renderCols.map((c) => {
                            const dir = sort?.id === c.id ? sort.dir : null;
                            const reorderable = c.hideable !== false && !pins[c.id];
                            const SortIcon = sortIcon(dir);
                            return (
                                <th
                                    key={c.id}
                                    data-col={c.id}
                                    scope="col"
                                    aria-sort={c.sortable ? ariaSort(dir) : undefined}
                                    style={colStyle(c)}
                                    onDragOver={(e) => {
                                        if (dragId && dragId !== c.id) {
                                            e.preventDefault();
                                            setOverId(c.id);
                                        }
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (dragId && dragId !== c.id) dropColumn(dragId, c.id);
                                        setDragId(null);
                                        setOverId(null);
                                    }}
                                    className={cx(
                                        "dt-th group/th",
                                        alignClass[c.align ?? "left"],
                                        !fixedLayout && c.width,
                                        c.hideBelow && hideBelowClass[c.hideBelow],
                                        pinCls(c),
                                        overId === c.id && "dt-th--drop",
                                        dragId === c.id && "opacity-50",
                                    )}
                                >
                                    <span className={cx("inline-flex max-w-full items-center gap-1", c.align === "right" && "justify-end")}>
                                        {reorderable && (
                                            <span
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.effectAllowed = "move";
                                                    e.dataTransfer.setData("text/plain", c.id);
                                                    setDragId(c.id);
                                                }}
                                                onDragEnd={() => {
                                                    setDragId(null);
                                                    setOverId(null);
                                                }}
                                                title={`Drag to reorder ${c.header}`}
                                                aria-hidden
                                                className="dt-grip"
                                            >
                                                <GripVertical size={13} />
                                            </span>
                                        )}
                                        {c.sortable ? (
                                            <button type="button" onClick={() => cycleSort(c.id)} className={cx("dt-sort", dir && "is-sorted")}>
                                                <span className="truncate">{c.header}</span>
                                                <span key={dir ?? "none"} className="fx-spin-in inline-flex">
                                                    <SortIcon size={13} className={dir ? "text-primary" : "text-muted"} />
                                                </span>
                                                <span className="sr-only">{dir ? `sorted ${dir === "asc" ? "ascending" : "descending"}` : "sort"}</span>
                                            </button>
                                        ) : (
                                            <span className="truncate">{c.header}</span>
                                        )}
                                    </span>
                                    {c.resizable !== false && (
                                        <span
                                            role="separator"
                                            aria-orientation="vertical"
                                            aria-label={`Resize ${c.header} column. Use left and right arrow keys; double-click to reset.`}
                                            aria-valuenow={Math.round(widths[c.id] ?? DEFAULT_COL_WIDTH)}
                                            aria-valuemin={MIN_COL_WIDTH}
                                            aria-valuemax={MAX_COL_WIDTH}
                                            tabIndex={0}
                                            onPointerDown={(e) => startResize(e, c)}
                                            onKeyDown={(e) => keyResize(e, c)}
                                            onDoubleClick={() => resetWidth(c.id)}
                                            className="dt-resizer"
                                        >
                                            <span className="dt-resizer__line" />
                                        </span>
                                    )}
                                </th>
                            );
                        })}
                        {hasActions && (
                            <th data-col="__actions" scope="col" className="dt-th dt-th--actions">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody key={`${sort?.id ?? ""}-${sort?.dir ?? ""}`} className={sort ? "dt-sorted" : undefined}>
                    {stateContent ? (
                        <tr>
                            <td colSpan={colSpan} className="p-0">{stateContent}</td>
                        </tr>
                    ) : (
                        pageRows.map((row, i) => {
                            const k = rowKey(row);
                            const isSel = selected.has(k);
                            const isOpen = expanded.has(k);
                            return (
                                <Fragment key={k}>
                                    <tr
                                        aria-selected={selectable ? isSel : undefined}
                                        tabIndex={renderPreview ? 0 : undefined}
                                        onClick={(e) => rowClick(e, k)}
                                        onKeyDown={(e) => rowKeyDown(e, k)}
                                        className={cx("dt-row", rowHeight, renderPreview && "dt-row--clickable", isOpen && "dt-row--expanded", isSel && "is-selected")}
                                    >
                                        {renderExpanded && (
                                            <td className="dt-td dt-td--lead">
                                                <IconButton
                                                    icon={ChevronRight}
                                                    label={`${isOpen ? "Collapse" : "Expand"} details for ${label(row)}`}
                                                    size="sm"
                                                    aria-expanded={isOpen}
                                                    aria-controls={`${uid}-${k}`}
                                                    className={cx("dt-chevron", isOpen && "is-open")}
                                                    onClick={() => toggleExpand(k)}
                                                />
                                            </td>
                                        )}
                                        {selectable && (
                                            <td className="dt-td dt-td--lead">
                                                <RowCheckbox label={`Select ${label(row)}`} checked={isSel} onChange={() => toggleRow(k)} />
                                            </td>
                                        )}
                                        {renderCols.map((c) => (
                                            <td
                                                key={c.id}
                                                style={colStyle(c)}
                                                className={cx("dt-td", fixedLayout && "overflow-hidden", alignClass[c.align ?? "left"], c.hideBelow && hideBelowClass[c.hideBelow], pinCls(c))}
                                            >
                                                {c.cell ? c.cell(row, i) : defaultCell(c, row)}
                                            </td>
                                        ))}
                                        {hasActions && <td className="dt-td dt-td--actions">{renderActions(row)}</td>}
                                    </tr>
                                    {renderExpanded && isOpen && (
                                        <tr id={`${uid}-${k}`} className="dt-expanded">
                                            <td colSpan={colSpan}>
                                                <div className="fx-slide-x">{renderExpanded(row)}</div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );

    /* ---- mobile card list: a deliberate layout, not a shrunken table ---- */
    const cards = (
        <div className="dt-cards">
            {stateContent ?? pageRows.map((row, i) => {
                const k = rowKey(row);
                const [first, ...others] = renderCols;
                const rest = others.filter((c) => !c.cardFooter);
                const footer = others.filter((c) => c.cardFooter);
                const isSel = selected.has(k);
                const isOpen = expanded.has(k);
                return (
                    <article
                        key={k}
                        aria-label={label(row)}
                        onClick={(e) => rowClick(e, k)}
                        onKeyDown={(e) => rowKeyDown(e, k)}
                        className={cx("dt-card", renderPreview && "cursor-pointer", isSel && "is-selected")}
                    >
                        <div className="flex items-start gap-3">
                            {selectable && <span className="pt-0.5"><RowCheckbox label={`Select ${label(row)}`} checked={isSel} onChange={() => toggleRow(k)} /></span>}
                            <div className="min-w-0 flex-1 text-sm font-medium text-foreground">{first && (first.cell ? first.cell(row, i) : defaultCell(first, row))}</div>
                            {hasActions && renderActions(row)}
                        </div>
                        <dl className={cx("dt-card__grid", selectable && "pl-7")}>
                            {rest.map((c) => (
                                <div key={c.id} className="min-w-0">
                                    <dt className="text-xs text-muted">{c.header}</dt>
                                    <dd className="truncate text-[0.8125rem] text-foreground">{c.cell ? c.cell(row, i) : defaultCell(c, row)}</dd>
                                </div>
                            ))}
                        </dl>
                        {footer.length > 0 && (
                            <div className={cx("mt-3 flex items-center justify-end gap-2", selectable && "pl-7")}>
                                {footer.map((c) => <span key={c.id}>{c.cell ? c.cell(row, i) : defaultCell(c, row)}</span>)}
                            </div>
                        )}
                        {renderExpanded && (
                            <div className={selectable ? "pl-7" : undefined}>
                                <Button size="sm" variant="link" className="mt-2" rightIcon={isOpen ? ChevronUp : ChevronDown} aria-expanded={isOpen} onClick={() => toggleExpand(k)}>
                                    {isOpen ? "Hide details" : "Show details"}
                                </Button>
                                {isOpen && <div className="dt-card__expanded">{renderExpanded(row)}</div>}
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );

    const root = (
        <div
            role={full ? "region" : undefined}
            aria-label={full ? `${caption} (full screen)` : undefined}
            className={full ? "dt-root dt-root--full" : cx("dt-root", className)}
        >
            {toolbar}
            {isDesktop ? table : <div className={full ? "min-h-0 flex-1 overflow-y-auto" : undefined}>{cards}</div>}
            <div className="dt-footer no-print">
                <Pagination page={page} pageSize={pageSize} total={total} onPageChange={changePage} onPageSizeChange={changeSize} pageSizeOptions={pagination?.pageSizeOptions} />
            </div>
        </div>
    );

    const boxed = (
        <div className="dt-box">
            {cardActions && <div className="dt-box__actions no-print">{cardActions}</div>}
            {root}
        </div>
    );

    return (
        <>
            {full ? createPortal(root, document.body) : boxed}
            {renderPreview && (
                <ReusableOffcanvas
                    isOpen={!!previewRow}
                    onClose={() => setPreviewKey(null)}
                    title={previewRow ? previewTitle?.(previewRow) ?? label(previewRow) : ""}
                    subTitle={previewRow ? `Record ${previewIndex + 1} of ${pageRows.length} on this page` : undefined}
                    footer={
                        previewRow && (
                            <>
                                <Button variant="ghost" leftIcon={ChevronLeft} disabled={previewIndex <= 0} onClick={() => setPreviewKey(rowKey(pageRows[previewIndex - 1]))}>Previous</Button>
                                <Button variant="ghost" rightIcon={ChevronRight} disabled={previewIndex >= pageRows.length - 1} onClick={() => setPreviewKey(rowKey(pageRows[previewIndex + 1]))}>Next</Button>
                                {previewFooter?.(previewRow, () => setPreviewKey(null))}
                            </>
                        )
                    }
                >
                    {previewRow && renderPreview(previewRow)}
                </ReusableOffcanvas>
            )}
        </>
    );
}

export default DataTable;
