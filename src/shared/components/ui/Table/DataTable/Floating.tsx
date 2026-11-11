import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { MenuItem } from "./dataTable.types";

/* Ported from hims-ui-new Overlay/Floating.tsx + Overlay/Menu.tsx */

type Placement = "bottom-start" | "bottom-end";

interface Position {
    top: number;
    left: number;
}

/** Places a fixed panel under its anchor, flips above when there is no room, and keeps it inside the viewport. */
const useAnchoredPosition = (anchorRef: RefObject<HTMLElement | null>, open: boolean, placement: Placement, offset = 6) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<Position | null>(null);

    useLayoutEffect(() => {
        if (!open) return;
        const place = () => {
            const anchor = anchorRef.current?.getBoundingClientRect();
            const panel = panelRef.current;
            if (!anchor || !panel) return;
            const w = panel.offsetWidth;
            const h = panel.offsetHeight;
            let left = placement === "bottom-end" ? anchor.right - w : anchor.left;
            left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
            let top = anchor.bottom + offset;
            if (top + h > window.innerHeight - 8 && anchor.top - offset - h > 8) top = anchor.top - offset - h;
            setPos((p) => (p && p.top === top && p.left === left ? p : { top, left }));
        };
        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        const ro = new ResizeObserver(place);
        if (panelRef.current) ro.observe(panelRef.current);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
            ro.disconnect();
        };
    }, [open, anchorRef, placement, offset]);

    return { panelRef, pos: open ? pos : null };
};

export interface FloatingPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    anchorRef: RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
    placement?: Placement;
    children: ReactNode;
}

/** Portal-rendered, viewport-aware panel; closes on a click outside or Esc. */
export const FloatingPanel = ({ anchorRef, open, onClose, placement = "bottom-end", className = "", children, ...rest }: FloatingPanelProps) => {
    const { panelRef, pos } = useAnchoredPosition(anchorRef, open, placement);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
            onClose();
        };
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
                anchorRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey, true);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey, true);
        };
    }, [open, onClose, anchorRef, panelRef]);

    if (!open) return null;
    return createPortal(
        <div
            ref={panelRef}
            data-popover=""
            style={{ position: "fixed", top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? "visible" : "hidden" }}
            className={`dt-popover ${className}`}
            {...rest}
        >
            {children}
        </div>,
        document.body,
    );
};

/** WAI-ARIA menu: arrow keys, Home / End, Enter / Space to activate. */
export const MenuList = ({ items, onClose, label }: { items: MenuItem[]; onClose: () => void; label?: string }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const enabled = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);

    useEffect(() => {
        enabled()[0]?.focus();
    }, []);

    const onKeyDown = (e: KeyboardEvent) => {
        const els = enabled();
        const i = els.indexOf(document.activeElement as HTMLElement);
        const go = (n: number) => {
            e.preventDefault();
            els[(n + els.length) % els.length]?.focus();
        };
        if (e.key === "ArrowDown") go(i + 1);
        else if (e.key === "ArrowUp") go(i - 1);
        else if (e.key === "Home") go(0);
        else if (e.key === "End") go(els.length - 1);
        else if (e.key === "Tab") onClose();
    };

    return (
        <div ref={listRef} role="menu" aria-label={label} onKeyDown={onKeyDown} className="min-w-44 p-1">
            {items.map((item) => {
                const ItemIcon = item.icon;
                return (
                    <div key={item.id}>
                        {item.separator && <div role="separator" className="my-1 h-px bg-border" />}
                        <button
                            type="button"
                            role="menuitem"
                            tabIndex={-1}
                            aria-disabled={item.disabled || undefined}
                            onClick={() => {
                                if (item.disabled) return;
                                item.onSelect?.();
                                onClose();
                            }}
                            className={`hdr-menu-item ${item.danger ? "hdr-menu-item--danger" : ""} ${item.disabled ? "opacity-50" : ""}`}
                        >
                            {ItemIcon && <span className="hdr-menu-item__icon"><ItemIcon size={16} /></span>}
                            <span className="flex-1">{item.label}</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export interface DropdownMenuProps {
    items: MenuItem[];
    label?: string;
    placement?: Placement;
    trigger: (props: { ref: RefObject<HTMLButtonElement | null>; onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
}

export const DropdownMenu = ({ items, label, placement = "bottom-end", trigger }: DropdownMenuProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    const close = () => {
        setOpen(false);
        ref.current?.focus();
    };
    return (
        <>
            {trigger({ ref, onClick: () => setOpen((o) => !o), "aria-expanded": open, "aria-haspopup": "menu" })}
            <FloatingPanel anchorRef={ref} open={open} onClose={close} placement={placement}>
                <MenuList items={items} onClose={close} label={label} />
            </FloatingPanel>
        </>
    );
};
