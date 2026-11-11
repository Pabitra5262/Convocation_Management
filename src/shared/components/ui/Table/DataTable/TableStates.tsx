import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw, SearchX, type LucideIcon } from "lucide-react";
import { Button } from "../../Button";

/* Ported from hims-ui-new Loading/States.tsx */

export interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    compact?: boolean;
    tone?: "neutral" | "danger";
}

export const EmptyState = ({ icon: Icon = Inbox, title, description, action, compact, tone = "neutral" }: EmptyStateProps) => (
    <div className={`dt-empty ${compact ? "dt-empty--compact" : ""}`}>
        <span className={`dt-empty__icon dt-empty__icon--${tone}`}>
            <Icon size={compact ? 20 : 26} />
        </span>
        <h3 className="dt-empty__title">{title}</h3>
        {description && <p className="dt-empty__text">{description}</p>}
        {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
);

export const NoResults = ({ query, onClear }: { query?: string; onClear?: () => void }) => (
    <EmptyState
        icon={SearchX}
        title="No results found"
        description={query ? `Nothing matches “${query}”. Try a different keyword or remove some filters.` : "Try adjusting your search or filters."}
        action={onClear && <Button variant="outline" onClick={onClear}>Clear search & filters</Button>}
    />
);

export const ErrorState = ({ onRetry, compact }: { onRetry?: () => void; compact?: boolean }) => (
    <div role="alert">
        <EmptyState
            compact={compact}
            tone="danger"
            icon={AlertTriangle}
            title="Something went wrong"
            description={compact ? undefined : "We could not load this data. Please try again."}
            action={onRetry && <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={onRetry}>Try again</Button>}
        />
    </div>
);
