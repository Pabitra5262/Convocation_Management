import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

/* Collapsed-rail overlays (hims-ui-new Tooltip / FloatingPanel with placement="right").
   The sidebar clips its overflow, so both render into <body>, beside the anchor. Styles: shared/styles/sidebar.css */

const useBesideAnchor = (anchorRef: RefObject<HTMLElement | null>, active: boolean) => {
    const [pos, setPos] = useState<{ left: number; top: number; mid: number } | null>(null);
    useLayoutEffect(() => {
        if (!active || !anchorRef.current) {
            setPos(null);
            return;
        }
        const place = () => {
            const r = anchorRef.current?.getBoundingClientRect();
            if (r) setPos({ left: r.right + 10, top: r.top, mid: r.top + r.height / 2 });
        };
        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [active, anchorRef]);
    return pos;
};

/** Label to the right of a rail icon, shown on hover or keyboard focus. */
export const RailTooltip = ({ label, disabled, children }: { label: string; disabled?: boolean; children: (ref: RefObject<HTMLElement | null>) => ReactNode }) => {
    const ref = useRef<HTMLElement | null>(null);
    const [show, setShow] = useState(false);
    const pos = useBesideAnchor(ref, show && !disabled);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const on = () => setShow(true);
        const off = () => setShow(false);
        el.addEventListener("mouseenter", on);
        el.addEventListener("mouseleave", off);
        el.addEventListener("focus", on);
        el.addEventListener("blur", off);
        el.addEventListener("click", off);
        return () => {
            el.removeEventListener("mouseenter", on);
            el.removeEventListener("mouseleave", off);
            el.removeEventListener("focus", on);
            el.removeEventListener("blur", off);
            el.removeEventListener("click", off);
        };
    }, []);

    return (
        <>
            {children(ref)}
            {pos &&
                createPortal(
                    <span role="tooltip" className="rail-tip" style={{ left: pos.left, top: pos.mid }}>
                        {label}
                    </span>,
                    document.body,
                )}
        </>
    );
};

/** Menu panel to the right of a rail group: closes on Esc (focus back to the icon) or a click outside. */
export const RailFlyout = ({
    anchorRef,
    open,
    onClose,
    label,
    children,
}: {
    anchorRef: RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
    label: string;
    children: ReactNode;
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const pos = useBesideAnchor(anchorRef, open);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!panelRef.current?.contains(t) && !anchorRef.current?.contains(t)) onClose();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                anchorRef.current?.focus();
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []);
                if (!items.length) return;
                e.preventDefault();
                const i = items.indexOf(document.activeElement as HTMLElement);
                items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
            }
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose, anchorRef]);

    if (!open || !pos) return null;
    return createPortal(
        <div ref={panelRef} role="menu" aria-label={label} className="rail-flyout" style={{ left: pos.left, top: pos.top }}>
            <p className="rail-flyout__title">{label}</p>
            {children}
        </div>,
        document.body,
    );
};
