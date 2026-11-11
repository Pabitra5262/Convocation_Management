import { forwardRef, useEffect, useState, type ButtonHTMLAttributes } from "react";
import { Check, Globe, Maximize2, Minimize2, type LucideIcon } from "lucide-react";
import { onMenuArrowKeys, usePopover } from "./usePopover";
import type { Language } from "../header.data";
import { useT } from "@/shared/i18n/I18nProvider";

/* ---------------------------------------------------------------------- */
/* Icon button with a tooltip (styles: .header-icon-btn, [data-tip])      */
/* ---------------------------------------------------------------------- */

export interface HeaderIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    label: string;
    /** Tooltip text; defaults to the label. Pass "" for none. */
    tip?: string;
}

export const HeaderIconButton = forwardRef<HTMLButtonElement, HeaderIconButtonProps>(function HeaderIconButton(
    { icon: Icon, label, tip, className = "", children, ...rest },
    ref,
) {
    const tooltip = tip ?? label;
    return (
        <button
            ref={ref}
            type="button"
            aria-label={label}
            data-tip={tooltip || undefined}
            className={`header-icon-btn ${className}`}
            {...rest}
        >
            <Icon size={18} />
            {children}
        </button>
    );
});

export const HeaderDivider = () => <span aria-hidden className="app-header__divider max-sm:hidden" />;

/** Small numeric pill (unread count etc.). */
export const CountBadge = ({ count, className = "" }: { count: number; className?: string }) =>
    count > 0 ? <span aria-hidden className={`hdr-count ${className}`}>{count > 99 ? "99+" : count}</span> : null;

/* ---------------------------------------------------------------------- */
/* Fullscreen                                                             */
/* ---------------------------------------------------------------------- */

export const FullscreenToggle = () => {
    const t = useT();
    const [full, setFull] = useState<boolean>(() => typeof document !== "undefined" && !!document.fullscreenElement);

    useEffect(() => {
        const onChange = () => setFull(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    const toggle = () => {
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void document.documentElement.requestFullscreen?.();
        }
    };

    return (
        <HeaderIconButton
            key={String(full)}
            icon={full ? Minimize2 : Maximize2}
            label={full ? t("Exit full screen") : t("Enter full screen")}
            className="fx-spin-in max-md:hidden"
            onClick={toggle}
        />
    );
};

/* ---------------------------------------------------------------------- */
/* Language                                                               */
/* ---------------------------------------------------------------------- */

export interface LanguageSelectorProps {
    languages: Language[];
    value: string;
    onChange: (code: string) => void;
}

export const LanguageSelector = ({ languages, value, onChange }: LanguageSelectorProps) => {
    const t = useT();
    const { open, setOpen, toggle, rootRef, triggerRef } = usePopover();
    const current = languages.find((l) => l.code === value);

    return (
        <div className="relative" ref={rootRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Language: ${current?.label ?? value}`}
                data-tip={open ? undefined : t("Language")}
                className="hdr-lang"
            >
                <Globe size={18} />
                <span className="max-lg:hidden">{value.toUpperCase()}</span>
            </button>
            {open && (
                <div role="menu" aria-label={t("Language")} className="header-menu hdr-menu-list w-44" onKeyDown={onMenuArrowKeys}>
                    {languages.map((l) => (
                        <button
                            key={l.code}
                            type="button"
                            role="menuitemradio"
                            aria-checked={l.code === value}
                            autoFocus={l.code === value}
                            onClick={() => {
                                onChange(l.code);
                                setOpen(false);
                                triggerRef.current?.focus();
                            }}
                            className="hdr-menu-item"
                        >
                            <span className="hdr-menu-item__icon">{l.code === value && <Check size={16} />}</span>
                            <span className="flex-1">{l.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
