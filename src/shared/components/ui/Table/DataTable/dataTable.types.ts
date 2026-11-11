import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* Ported from hims-ui-new components/ui/Table/DataTable.tsx */

export type SortDirection = "asc" | "desc";

export interface SortState {
    id: string;
    dir: SortDirection;
}

export type PinSide = "left" | "right";

export interface Column<T> {
    id: string;
    header: string;
    /** Value used for sorting, searching and export. Also the default cell content. */
    accessor?: (row: T) => string | number | boolean | Date | null | undefined;
    cell?: (row: T, index: number) => ReactNode;
    sortable?: boolean;
    align?: "left" | "right" | "center";
    /** Tailwind width class, e.g. `w-48`. */
    width?: string;
    /** Column can be hidden / reordered through the Columns menu (default true). */
    hideable?: boolean;
    defaultHidden?: boolean;
    /** Hide this column below a breakpoint (the mobile card layout still shows it). */
    hideBelow?: "md" | "lg" | "xl";
    /** Start pinned to the left or right edge (users can change it in the Columns menu). */
    sticky?: PinSide;
    /** Disable drag-resizing for this column. */
    resizable?: boolean;
    /** Mobile card layout: render this column in the action row at the bottom instead of the detail grid. */
    cardFooter?: boolean;
}

export interface MenuItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    onSelect?: () => void;
    danger?: boolean;
    disabled?: boolean;
    /** Renders a divider before this item. */
    separator?: boolean;
}

export interface BulkAction {
    id: string;
    label: string;
    icon?: LucideIcon;
    danger?: boolean;
    onClick: (keys: string[]) => void;
}

/** A row action shown as a coloured icon chip (with a tooltip) in the Actions column. */
export interface RowActionItem {
    id: string;
    label: string;
    icon: LucideIcon;
    tone?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "neutral";
    onClick: () => void;
}

export interface RowActions<T> {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    /** Page-specific icon actions (e.g. Apply, Review), shown after View / Edit / Delete. */
    custom?: (row: T) => RowActionItem[];
    /** Extra actions in a "more" (…) menu. */
    more?: (row: T) => MenuItem[];
}

export interface DataTablePagination {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOptions?: number[];
}

export type ExportFormat = "csv" | "excel" | "pdf";
export type ExportScope = "page" | "all" | "selected";

export interface SavedView {
    id: string;
    name: string;
    search: string;
    sort: SortState | null;
    hidden: string[];
    order: string[];
    pins: Record<string, PinSide>;
    widths: Record<string, number>;
    dense: boolean;
    zebra: boolean;
    /** Page-level state (e.g. applied filters) supplied through `extraViewState`. */
    extra?: unknown;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    rowKey: (row: T) => string;
    /** Human readable name of a row for aria-labels, e.g. the employee's name. */
    rowLabel?: (row: T) => string;
    /** Accessible table name; also the default export title and saved-views key. */
    caption: string;

    loading?: boolean;
    error?: boolean;
    onRetry?: () => void;

    /** Providing `pagination` switches to server-driven mode: the table renders `data` as-is. */
    pagination?: DataTablePagination;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    sort?: SortState | null;
    onSortChange?: (sort: SortState | null) => void;
    search?: string;
    onSearchChange?: (q: string) => void;
    searchPlaceholder?: string;

    selectable?: boolean;
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    bulkActions?: BulkAction[];

    actions?: RowActions<T>;
    renderExpanded?: (row: T) => ReactNode;

    /** Click (or Enter on) a row to open this side panel. */
    renderPreview?: (row: T) => ReactNode;
    previewTitle?: (row: T) => string;
    previewFooter?: (row: T, close: () => void) => ReactNode;

    /** Adds a filter icon to the toolbar that shows / hides a page-level FilterPanel. */
    filterToggle?: { hidden: boolean; onToggle: () => void; appliedCount?: number };
    /** Page-level state (e.g. applied filters) to store inside saved views. */
    extraViewState?: { get: () => unknown; apply: (value: unknown) => void };
    /** Storage key for saved views; defaults to the caption. */
    viewsKey?: string;

    /** Slot for filter controls rendered beside the search box. */
    filters?: ReactNode;
    toolbarActions?: ReactNode;
    /** Buttons for the whole table (e.g. Print, Download report), in a row inside the card, above the table. */
    cardActions?: ReactNode;
    /** Replace the built-in export. Receives the rows for the chosen scope, every exportable column and the format. */
    onExport?: (rows: T[], columns: Column<T>[], format: ExportFormat) => void;
    exportFileName?: string;

    zebra?: boolean;
    dense?: boolean;
    stickyHeader?: boolean;
    /** Show the full-screen toggle in the toolbar (default true). */
    allowFullscreen?: boolean;
    /** Max height of the scroll area, e.g. "32rem" (enables a sticky header inside the card). */
    maxHeight?: string;
    emptyState?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    /** Next step shown under the empty message, e.g. an "Add" button. */
    emptyAction?: ReactNode;
    className?: string;
}
