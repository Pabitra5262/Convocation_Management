import { useEffect, useRef, useState } from "react";

/**
 * Open/close state for a header drop-down: closes on a click outside `rootRef`
 * or on Esc (focus returns to the trigger).
 */
export const usePopover = <T extends HTMLElement = HTMLDivElement>() => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<T | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return { open, setOpen, toggle: () => setOpen((o) => !o), rootRef, triggerRef };
};

/** Moves focus between the menu items with the arrow keys. */
export const onMenuArrowKeys = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem'], [role='menuitemradio']"));
    const i = items.indexOf(document.activeElement as HTMLElement);
    e.preventDefault();
    const next = i < 0 ? 0 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
};
