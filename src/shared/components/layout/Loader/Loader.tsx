import type { HTMLAttributes } from "react";

/* Styles: src/shared/styles/components.css (hims-ui-new Loading/States) */

export const Spinner = ({ size = "md", label = "Loading", className = "" }: { size?: "sm" | "md" | "lg"; label?: string; className?: string }) => (
    <span role="status" aria-label={label} className={`ui-spinner ui-spinner--${size} ${className}`} />
);

/** Grey placeholder bar with a shimmer. Size it with className (e.g. "h-4 w-1/2"). */
export const Skeleton = ({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) => (
    <div aria-hidden className={`ui-skeleton ${className}`} {...rest} />
);

/** Placeholder rows shaped like a table while data loads. */
export const TableSkeleton = ({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) => (
    <div aria-busy="true" aria-label="Loading table" className="ui-table-skeleton">
        {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="ui-table-skeleton__row">
                {Array.from({ length: columns }, (_, c) => (
                    <Skeleton key={c} className={c === 0 ? "h-3 w-1/4" : "h-3 flex-1"} />
                ))}
            </div>
        ))}
    </div>
);

/** Full-area loader used while a page (lazy route) loads. */
const Loader = ({ label = "Loading…" }: { label?: string }) => (
    <div className="ui-page-loader">
        <Spinner size="lg" label={label} />
        <span className="ui-page-loader__text">{label}</span>
    </div>
);

export default Loader;
