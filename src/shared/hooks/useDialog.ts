import { useEffect, useRef, useState, type RefObject } from "react";

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Behaviour shared by Modal / Offcanvas (ported from hims-ui-new DialogShell):
 * Esc closes, page scroll is locked, Tab stays inside the panel, focus moves in on open
 * and returns to the opener on close.
 */
export const useDialog = (ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, closeOnEsc = true) => {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const opener = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const panel = ref.current;
        const first = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
        (first ?? panel)?.focus({ preventScroll: true });

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && closeOnEsc) {
                e.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (e.key !== "Tab" || !ref.current) return;
            const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const firstEl = items[0];
            const lastEl = items[items.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        };
        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
            opener?.focus?.({ preventScroll: true });
        };
    }, [open, ref, closeOnEsc]);
};

/** Keeps a panel mounted for `ms` after `open` turns false so its close animation can play. */
export const usePresence = (open: boolean, ms = 200) => {
    const [mounted, setMounted] = useState(open);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        let timer: number | undefined;
        const raf = requestAnimationFrame(() => {
            if (open) {
                setMounted(true);
                setClosing(false);
            } else {
                setClosing(true);
                timer = window.setTimeout(() => {
                    setMounted(false);
                    setClosing(false);
                }, ms);
            }
        });
        return () => {
            cancelAnimationFrame(raf);
            if (timer) window.clearTimeout(timer);
        };
    }, [open, ms]);

    return { mounted: mounted || open, closing: closing && !open };
};
