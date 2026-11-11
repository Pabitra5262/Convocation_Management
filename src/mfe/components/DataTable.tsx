import { useMemo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DataTable as WireDataTable, type Column } from "@/shared/components/ui/Table";

/* hplus_react `@mfe/components` DataTable API (TableColumnDef, getRowId, serverSidePagination …),
   drawn with the wireframe DataTable. Types match packages/components/ui/Table/DataTable/types.ts. */

export interface TableColumnDef<T> {
    id?: string;
    accessorKey?: keyof T | string;
    accessorFn?: (row: T) => unknown;
    header: string;
    Header?: () => ReactNode;
    Cell?: (ctx: { row: { original: T; index: number } }) => ReactNode;
    size?: number;
    enableSorting?: boolean;
    enableHiding?: boolean;
    resizable?: boolean;
    align?: "left" | "right" | "center";
    hideBelow?: "md" | "lg" | "xl";
    sticky?: "right";
    defaultHidden?: boolean;
    cardFooter?: boolean;
    cardCell?: (ctx: { row: { original: T; index: number } }) => ReactNode;
}

export interface TableServerPagination {
    totalRows: number;
    /** 0-based */
    pageIndex: number;
    pageSize: number;
    onPageChange: (newPageIndex: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    pageSizeOptions?: number[];
}

export type TableSortState = { id: string; dir: "asc" | "desc" } | null;

export interface TableBulkAction {
    id: string;
    label: string;
    icon?: LucideIcon;
    danger?: boolean;
    onClick: (keys: string[]) => void;
}

export interface TableMenuItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    danger?: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

export interface TableRowActions<T> {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    more?: (row: T) => TableMenuItem[];
}

export type TableExportFormat = "csv" | "excel" | "pdf";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T extends Record<string, any>> {
    columns: TableColumnDef<T>[];
    data: T[];
    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;
    caption?: string;
    getRowId?: (row: T, index: number) => string;
    rowLabel?: (row: T) => string;
    searchPlaceholder?: string;
    serverSidePagination?: TableServerPagination;
    pageSizeOptions?: number[];
    sort?: TableSortState;
    onSortChange?: (sort: TableSortState) => void;
    search?: string;
    onSearchChange?: (q: string) => void;
    selectable?: boolean;
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    bulkActions?: TableBulkAction[];
    actions?: TableRowActions<T>;
    renderExpanded?: ((row: T) => ReactNode) | null;
    /** Row click opens a side panel; by default every column's label and value. null turns it off. */
    renderPreview?: ((row: T) => ReactNode) | null;
    previewTitle?: (row: T) => string;
    previewFooter?: (row: T, close: () => void) => ReactNode;
    filterToggle?: { hidden: boolean; onToggle: () => void; appliedCount?: number };
    extraViewState?: { get: () => unknown; apply: (value: unknown) => void };
    viewsKey?: string;
    filters?: ReactNode;
    toolbarActions?: ReactNode;
    /** @deprecated use `toolbarActions`. */
    renderTopToolbarCustomActions?: () => ReactNode;
    enableExport?: boolean;
    exportType?: "all" | "pdf" | "excel" | "none";
    onExport?: (rows: T[], columns: TableColumnDef<T>[], format: TableExportFormat) => void;
    onExportPDF?: (rows: T[]) => void;
    onExportExcel?: (rows: T[]) => void;
    exportFileName?: string;
    zebra?: boolean;
    dense?: boolean;
    stickyHeader?: boolean;
    maxHeight?: string;
    allowFullscreen?: boolean;
    emptyState?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    /** Accepted for API parity (the wireframe table has no exit animation). */
    exitingKeys?: string[];
    className?: string;
}

const ACTION_COLUMN = /^(mrt-row-.*|actions?)$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPath = (row: any, key: string) => (key.includes(".") ? key.split(".").reduce((acc, part) => acc?.[part], row) : row?.[key]);

type Primitive = string | number | boolean | Date | null | undefined;
const toPrimitive = (v: unknown): Primitive =>
    v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v instanceof Date ? (v as Primitive) : undefined;
const toText = (v: unknown) => {
    const p = toPrimitive(v);
    if (p == null || p === "") return "—";
    if (p instanceof Date) return p.toLocaleDateString();
    if (typeof p === "boolean") return p ? "Yes" : "No";
    return String(p);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    caption,
    getRowId,
    serverSidePagination,
    renderExpanded,
    renderPreview,
    toolbarActions,
    renderTopToolbarCustomActions,
    onExport,
    onExportPDF,
    onExportExcel,
    exportFileName = "export_data",
    enableExport: _enableExport,
    exportType: _exportType,
    pageSizeOptions: _pageSizeOptions,
    exitingKeys: _exitingKeys,
    ...rest
}: Readonly<DataTableProps<T>>) {
    const index = useMemo(() => new Map(data.map((r, i) => [r, i])), [data]);

    const cols = useMemo(
        () =>
            columns.map((def, i) => {
                const id = String(def.id ?? def.accessorKey ?? `col-${i}`);
                const getter = def.accessorFn ?? (def.accessorKey ? (row: T) => getPath(row, String(def.accessorKey)) : undefined);
                const isAction = ACTION_COLUMN.test(id);
                const Cell = def.Cell;
                const col: Column<T> & { _getter?: (row: T) => unknown } = {
                    id,
                    header: def.header,
                    accessor: getter ? (row: T) => toPrimitive(getter(row)) : undefined,
                    cell: Cell ? (row: T, rowIndex: number) => Cell({ row: { original: row, index: rowIndex } }) : undefined,
                    sortable: def.enableSorting ?? (Boolean(getter) && !isAction),
                    hideable: def.enableHiding ?? !isAction,
                    align: def.align,
                    hideBelow: def.hideBelow,
                    sticky: def.sticky ?? (isAction ? "right" : undefined),
                    defaultHidden: def.defaultHidden,
                    resizable: def.resizable,
                    cardFooter: def.cardFooter ?? isAction,
                    _getter: getter,
                };
                return col;
            }),
        [columns],
    );

    const rowKey = (row: T) => {
        const i = index.get(row) ?? 0;
        return getRowId ? getRowId(row, i) : String(row.id ?? row.key ?? i);
    };

    // Same default as hplus_react: a row opens a side panel listing every column's label and value.
    const defaultPreview = (row: T) => (
        <dl className="grid grid-cols-2 gap-4 text-sm">
            {cols
                .filter((c) => c._getter && !ACTION_COLUMN.test(c.id))
                .map((c) => (
                    <div key={c.id} className="min-w-0">
                        <dt className="text-xs text-muted">{c.header}</dt>
                        <dd className="mt-0.5 break-words">{toText(c._getter?.(row))}</dd>
                    </div>
                ))}
        </dl>
    );
    const preview = renderPreview === null ? undefined : (renderPreview ?? defaultPreview);

    const exportHandler =
        onExport || onExportPDF || onExportExcel
            ? (rows: T[], exportCols: Column<T>[], format: TableExportFormat) => {
                  if (onExport) {
                      return onExport(
                          rows,
                          columns.filter((def, i) => exportCols.some((c) => c.id === String(def.id ?? def.accessorKey ?? `col-${i}`))),
                          format,
                      );
                  }
                  if (format === "pdf" && onExportPDF) return onExportPDF(rows);
                  if (format === "excel" && onExportExcel) return onExportExcel(rows);
              }
            : undefined;

    return (
        <WireDataTable
            {...rest}
            data={data}
            columns={cols}
            rowKey={rowKey}
            caption={caption ?? exportFileName.replaceAll(/[-_]+/g, " ")}
            exportFileName={exportFileName}
            renderExpanded={renderExpanded ?? undefined}
            renderPreview={preview}
            toolbarActions={
                toolbarActions || renderTopToolbarCustomActions ? (
                    <>
                        {toolbarActions}
                        {renderTopToolbarCustomActions?.()}
                    </>
                ) : undefined
            }
            onExport={exportHandler}
            pagination={
                serverSidePagination
                    ? {
                          page: serverSidePagination.pageIndex + 1,
                          pageSize: serverSidePagination.pageSize,
                          total: serverSidePagination.totalRows,
                          pageSizeOptions: serverSidePagination.pageSizeOptions,
                      }
                    : undefined
            }
            onPageChange={serverSidePagination ? (p) => serverSidePagination.onPageChange(p - 1) : undefined}
            onPageSizeChange={serverSidePagination?.onPageSizeChange}
        />
    );
}

export default DataTable;
