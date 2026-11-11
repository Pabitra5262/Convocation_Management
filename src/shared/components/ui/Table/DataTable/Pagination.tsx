import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button, IconButton } from "../../Button";
import { pageWindow } from "./dataTable.utils";

/* Ported from hims-ui-new Navigation/Pagination */

export interface PaginationProps {
    /** 1-based */
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

/** "1–10 of 248 records · Rows [10] … ‹ Previous 1 2 3 … 25 Next ›" */
export const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 25, 50, 100], className = "" }: PaginationProps) => {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(total, page * pageSize);

    return (
        <nav aria-label="Pagination" className={`dt-pagination ${className}`}>
            <div className="dt-pagination__info">
                <p aria-live="polite" className="tabular-nums">
                    <span className="font-medium text-foreground">{from.toLocaleString()}–{to.toLocaleString()}</span> of{" "}
                    <span className="font-medium text-foreground">{total.toLocaleString()}</span> records
                </p>
                {onPageSizeChange && (
                    <label className="flex items-center gap-2">
                        <span className="max-sm:sr-only">Rows</span>
                        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="dt-pagination__size">
                            {pageSizeOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </label>
                )}
            </div>
            <div className="dt-pagination__pages">
                <IconButton icon={ChevronsLeft} label="First page" size="xs" variant="outline" disabled={page <= 1} onClick={() => onPageChange(1)} className="max-sm:hidden" />
                <Button size="xs" variant="outline" leftIcon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    Previous
                </Button>
                <ul className="hidden items-center gap-1 px-1 md:flex">
                    {pageWindow(page, pages).map((p, i) =>
                        p === "…" ? (
                            <li key={`gap-${i}`} aria-hidden className="w-8 text-center text-muted">…</li>
                        ) : (
                            <li key={p}>
                                <button
                                    type="button"
                                    onClick={() => onPageChange(p)}
                                    aria-label={`Page ${p}`}
                                    aria-current={p === page ? "page" : undefined}
                                    className="dt-page"
                                >
                                    {p}
                                </button>
                            </li>
                        ),
                    )}
                </ul>
                <span className="px-2 tabular-nums md:hidden">Page {page} / {pages}</span>
                <Button size="xs" variant="outline" rightIcon={ChevronRight} disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
                    Next
                </Button>
                <IconButton icon={ChevronsRight} label="Last page" size="xs" variant="outline" disabled={page >= pages} onClick={() => onPageChange(pages)} className="max-sm:hidden" />
            </div>
        </nav>
    );
};

export default Pagination;
