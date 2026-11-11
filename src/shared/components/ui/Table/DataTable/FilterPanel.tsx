import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { EyeOff, Filter } from "lucide-react";
import { Button } from "../../Button";
import { Badge } from "../../Badge";
import { usePersistentState } from "@/shared/hooks/usePersistentState";

/* Ported from hims-ui-new components/ui/Card/FilterPanel.tsx. Styles: src/shared/styles/table.css */

export interface FilterPanelProps {
    /** Filter controls. Give each field a `wrapperClassName="min-w-56 flex-1"` so they share the row. */
    children: ReactNode;
    /** Apply / Reset buttons. */
    actions: ReactNode;
    onSubmit: () => void;
    title?: string;
    /** Number of filters currently applied (shown as a badge). */
    appliedCount?: number;
    /** Live-region text announced after filtering, e.g. "12 requests shown". */
    status?: string;
    /** Remembers the hidden / shown choice per page. Defaults to the current route. */
    storageKey?: string;
    /** Controlled visibility. When given, the parent owns the hidden state. */
    hidden?: boolean;
    onHiddenChange?: (hidden: boolean) => void;
    /** Show the floating "Filters" button while hidden (default). Turn off when a table toolbar toggle brings the panel back. */
    floatingButton?: boolean;
    className?: string;
}

/**
 * White card with a saffron edge strip and a "Filters" heading. It can be hidden to give the data more room;
 * a floating "Filters" button then appears at the top-right and shows the applied-filter count,
 * so a filtered list is never silently hidden. Hiding does not clear the filters.
 */
export const FilterPanel = ({
    children,
    actions,
    onSubmit,
    title = "Filters",
    appliedCount = 0,
    status,
    storageKey,
    hidden: hiddenProp,
    onHiddenChange,
    floatingButton = true,
    className = "",
}: FilterPanelProps) => {
    const { pathname } = useLocation();
    const [innerHidden, setInnerHidden] = usePersistentState<boolean>(`arf.filters.hidden.${storageKey ?? pathname}`, false);
    const hidden = hiddenProp ?? innerHidden;
    const setHidden = (h: boolean) => {
        onHiddenChange?.(h);
        if (hiddenProp === undefined) setInnerHidden(h);
    };
    const [announce, setAnnounce] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);
    const moveFocus = useRef<"fab" | "panel" | null>(null);

    // After toggling, put focus where the user will look next.
    useEffect(() => {
        if (moveFocus.current === "fab" && hidden) fabRef.current?.focus();
        if (moveFocus.current === "panel" && !hidden) {
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
            formRef.current?.querySelector<HTMLElement>("select, input, button")?.focus({ preventScroll: true });
        }
        moveFocus.current = null;
    }, [hidden]);

    const hide = () => {
        moveFocus.current = "fab";
        setHidden(true);
        setAnnounce("Filters hidden");
    };
    const show = () => {
        moveFocus.current = "panel";
        setHidden(false);
        setAnnounce("Filters shown");
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    const fabLabel = `Show filters${appliedCount ? `, ${appliedCount} applied` : ""}`;

    return (
        <>
            {!hidden && (
                <form ref={formRef} aria-label={title} onSubmit={submit} className={`filter-panel ${className}`}>
                    <span aria-hidden className="filter-panel__edge" />
                    <div className="filter-panel__head">
                        <Filter size={16} className="text-primary" />
                        <span className="text-[0.8125rem] font-medium text-foreground">{title}</span>
                        {appliedCount > 0 && <Badge tone="primary">{appliedCount} applied</Badge>}
                        <Button type="button" size="sm" variant="ghost" leftIcon={EyeOff} className="ml-auto" onClick={hide}>
                            <span className="max-sm:sr-only">Hide filters</span>
                        </Button>
                    </div>
                    <div className="filter-panel__body">
                        {children}
                        <div className="flex gap-2">{actions}</div>
                    </div>
                    <p role="status" className="sr-only">{status}</p>
                </form>
            )}

            {hidden && floatingButton &&
                createPortal(
                    <button
                        ref={fabRef}
                        type="button"
                        aria-label={fabLabel}
                        data-tip={fabLabel}
                        onClick={show}
                        className={`filter-fab ${appliedCount > 0 ? "has-filters" : ""}`}
                    >
                        <Filter size={16} className="text-primary" />
                        <span className="max-sm:sr-only">Filters</span>
                        {appliedCount > 0 && <span className="hdr-count">{appliedCount}</span>}
                    </button>,
                    document.body,
                )}

            <p role="status" className="sr-only">{announce}</p>
        </>
    );
};

export default FilterPanel;
