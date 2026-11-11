import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Bookmark, Check, Download, Pin, PinOff, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button, ActionIcon } from "../../Button";
import { FloatingPanel } from "./Floating";
import { EXPORT_FORMATS } from "./dataTable.utils";
import type { ExportFormat, ExportScope, PinSide, SavedView } from "./dataTable.types";

/* Ported from hims-ui-new components/ui/Table/TableMenus.tsx */

/* ---------------------------------------------------------------------- */
/* Small controls                                                         */
/* ---------------------------------------------------------------------- */

const Switch = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="dt-switch">
        <span>{label}</span>
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="dt-switch__track">
            <span className="dt-switch__thumb" />
        </button>
    </label>
);

interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

const RadioList = ({ name, label, value, options, onChange }: { name: string; label: string; value: string; options: RadioOption[]; onChange: (v: string) => void }) => (
    <fieldset className="dt-radios">
        <legend className="ui-label">{label}</legend>
        {options.map((o) => (
            <label key={o.value} className={`dt-radios__item ${o.disabled ? "is-disabled" : ""}`}>
                <input type="radio" className="ui-radio mt-0.5" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
                <span className="min-w-0">
                    <span className="block text-[0.8125rem] text-foreground">{o.label}</span>
                    {o.description && <span className="block text-xs text-muted">{o.description}</span>}
                </span>
            </label>
        ))}
    </fieldset>
);

/* ---------------------------------------------------------------------- */
/* Columns: visibility · order · pinning · density                        */
/* ---------------------------------------------------------------------- */

export interface ColumnInfo {
    id: string;
    header: string;
    hideable: boolean;
}

export interface ColumnsMenuProps {
    /** Every column in its current order. */
    columns: ColumnInfo[];
    hidden: Set<string>;
    pins: Record<string, PinSide>;
    onToggle: (id: string) => void;
    onMove: (id: string, dir: -1 | 1) => void;
    onPin: (id: string, side: PinSide | null) => void;
    onReset: () => void;
    dense: boolean;
    onDense: (v: boolean) => void;
    zebra: boolean;
    onZebra: (v: boolean) => void;
}

export const ColumnsMenu = ({ columns, hidden, pins, onToggle, onMove, onPin, onReset, dense, onDense, zebra, onZebra }: ColumnsMenuProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    return (
        <>
            <Button ref={ref} size="sm" variant="outline" leftIcon={SlidersHorizontal} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                Columns
            </Button>
            <FloatingPanel anchorRef={ref} open={open} onClose={() => setOpen(false)} role="dialog" aria-label="Column options" className="w-[23rem] max-w-[calc(100vw-1rem)] p-3">
                <div className="mb-2 flex items-center justify-between">
                    <p className="ui-label !mb-0">Columns</p>
                    <Button size="xs" variant="ghost" leftIcon={RotateCcw} onClick={onReset}>Reset</Button>
                </div>
                <p className="ui-help !mt-0 mb-2">Show or hide columns, pin them to an edge and reorder them with the arrows (or drag a header).</p>
                <ul className="mb-3 flex max-h-72 flex-col gap-0.5 overflow-y-auto">
                    {columns.map((c, i) => {
                        const pin = pins[c.id];
                        return (
                            <li key={c.id} className="dt-colrow">
                                <div className="min-w-0 flex-1">
                                    {c.hideable ? (
                                        <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] text-foreground">
                                            <input type="checkbox" className="ui-check" checked={!hidden.has(c.id)} onChange={() => onToggle(c.id)} />
                                            <span className="truncate">{c.header}</span>
                                        </label>
                                    ) : (
                                        <span className="flex items-center gap-2 text-[0.8125rem] text-text-secondary"><Check size={16} className="text-muted" />{c.header}</span>
                                    )}
                                </div>
                                <ActionIcon
                                    icon={pin ? PinOff : Pin}
                                    label={pin ? `Unpin ${c.header}` : `Pin ${c.header} to the left`}
                                    tone={pin ? "primary" : "neutral"}
                                    size="xs"
                                    onClick={() => onPin(c.id, pin ? null : "left")}
                                />
                                <ActionIcon icon={ArrowUp} label={`Move ${c.header} up`} disabled={i === 0} onClick={() => onMove(c.id, -1)} size="xs" tone="neutral" />
                                <ActionIcon icon={ArrowDown} label={`Move ${c.header} down`} disabled={i === columns.length - 1} onClick={() => onMove(c.id, 1)} size="xs" tone="neutral" />
                            </li>
                        );
                    })}
                </ul>
                <div className="flex flex-col gap-3 border-t border-border pt-3">
                    <Switch label="Dense rows" checked={dense} onChange={onDense} />
                    <Switch label="Zebra stripes" checked={zebra} onChange={onZebra} />
                </div>
            </FloatingPanel>
        </>
    );
};

/* ---------------------------------------------------------------------- */
/* Saved views                                                            */
/* ---------------------------------------------------------------------- */

export interface ViewsMenuProps {
    views: SavedView[];
    activeId: string | null;
    onApply: (v: SavedView) => void;
    onSave: (name: string) => void;
    onDelete: (id: string) => void;
}

export const ViewsMenu = ({ views, activeId, onApply, onSave, onDelete }: ViewsMenuProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const ref = useRef<HTMLButtonElement>(null);
    const active = views.find((v) => v.id === activeId);
    const save = () => {
        const n = name.trim();
        if (!n) return;
        onSave(n);
        setName("");
    };
    return (
        <>
            <Button ref={ref} size="sm" variant="outline" leftIcon={Bookmark} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                <span className="max-w-32 truncate">{active ? active.name : "Views"}</span>
            </Button>
            <FloatingPanel anchorRef={ref} open={open} onClose={() => setOpen(false)} role="dialog" aria-label="Saved views" className="w-80 max-w-[calc(100vw-1rem)] p-3">
                <p className="ui-label !mb-1">Saved views</p>
                <p className="ui-help !mt-0 mb-2">A view remembers filters, search, sort, columns, widths, pinning and density.</p>
                {views.length === 0 ? (
                    <p className="mb-3 rounded-md bg-surface-hover px-3 py-3 text-[0.8125rem] text-muted">No saved views yet.</p>
                ) : (
                    <ul className="mb-3 flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                        {views.map((v) => (
                            <li key={v.id} className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onApply(v);
                                        setOpen(false);
                                    }}
                                    aria-current={v.id === activeId ? "true" : undefined}
                                    className={`dt-view ${v.id === activeId ? "is-active" : ""}`}
                                >
                                    <Bookmark size={15} className={v.id === activeId ? "fill-current text-primary" : "text-muted"} />
                                    <span className="truncate">{v.name}</span>
                                </button>
                                <ActionIcon icon={Trash2} tone="danger" label={`Delete view ${v.name}`} onClick={() => onDelete(v.id)} size="xs" />
                            </li>
                        ))}
                    </ul>
                )}
                <form
                    className="flex items-end gap-2 border-t border-border pt-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                >
                    <label className="min-w-0 flex-1">
                        <span className="ui-label">Save current view as</span>
                        <input className="ui-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pending – Khordha" maxLength={40} />
                    </label>
                    <Button type="submit" size="sm" disabled={!name.trim()}>Save</Button>
                </form>
            </FloatingPanel>
        </>
    );
};

/* ---------------------------------------------------------------------- */
/* Export                                                                 */
/* ---------------------------------------------------------------------- */

export interface ExportMenuProps {
    counts: { page: number; all: number; selected: number };
    /** In server mode only the loaded rows exist client-side. */
    serverMode?: boolean;
    onExport: (format: ExportFormat, scope: ExportScope) => void;
}

const resolveScope = (scope: ExportScope, counts: ExportMenuProps["counts"], serverMode?: boolean): ExportScope => {
    if (scope === "selected" && counts.selected === 0) return "page";
    if (scope === "all" && serverMode) return "page";
    return scope;
};

export const ExportMenu = ({ counts, serverMode, onExport }: ExportMenuProps) => {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<ExportFormat>("csv");
    const [scope, setScope] = useState<ExportScope>("all");
    const ref = useRef<HTMLButtonElement>(null);
    const effectiveScope = resolveScope(scope, counts, serverMode);

    return (
        <>
            <Button ref={ref} size="sm" variant="outline" leftIcon={Download} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)} disabled={counts.page === 0}>
                Export
            </Button>
            <FloatingPanel anchorRef={ref} open={open} onClose={() => setOpen(false)} role="dialog" aria-label="Export options" className="w-80 max-w-[calc(100vw-1rem)] p-3">
                <div className="flex flex-col gap-4">
                    <RadioList
                        name="export-format"
                        label="Format"
                        value={format}
                        onChange={(v) => setFormat(v as ExportFormat)}
                        options={EXPORT_FORMATS.map((f) => ({ value: f.value, label: f.label, description: f.description }))}
                    />
                    <RadioList
                        name="export-scope"
                        label="Rows"
                        value={effectiveScope}
                        onChange={(v) => setScope(v as ExportScope)}
                        options={[
                            { value: "page", label: `This page (${counts.page})` },
                            { value: "all", label: `All filtered rows (${counts.all})`, disabled: serverMode, description: serverMode ? "Not available for server-paged lists" : undefined },
                            { value: "selected", label: `Selected rows (${counts.selected})`, disabled: counts.selected === 0 },
                        ]}
                    />
                    <p className="ui-help !mt-0">Every field is included, even columns hidden in the table.</p>
                    <Button
                        leftIcon={Download}
                        onClick={() => {
                            onExport(format, effectiveScope);
                            setOpen(false);
                        }}
                    >
                        Export
                    </Button>
                </div>
            </FloatingPanel>
        </>
    );
};
