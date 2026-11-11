import { Check, ChevronDown, Info } from "lucide-react";
import { useT } from "@/shared/i18n/I18nProvider";
import { onMenuArrowKeys, usePopover } from "./usePopover";

export interface RoleSwitcherProps {
    roles: string[];
    value: string;
    onChange: (role: string) => void;
}

/** "Role [HED Admin ▾]" box beside the profile. Rendered only when the user holds more than one role. */
export const RoleSwitcher = ({ roles, value, onChange }: RoleSwitcherProps) => {
    const t = useT();
    const { open, setOpen, toggle, rootRef, triggerRef } = usePopover();
    if (roles.length < 2) return null;

    return (
        <div className="hdr-role" ref={rootRef}>
            <span className="hdr-role__label max-md:hidden">
                {t("Role")}
                <span
                    tabIndex={0}
                    role="img"
                    aria-label="About roles"
                    data-tip="You are acting as this role. Use the list to change it."
                    className="hdr-role__info"
                >
                    <Info size={15} />
                </span>
            </span>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Role: ${value}. Change role`}
                className="hdr-role__btn"
            >
                <span key={value} className="fx-slide-x max-w-32 truncate">{value}</span>
                <ChevronDown size={15} className={`hdr-role__chevron ${open ? "is-open" : ""}`} />
            </button>

            {open && (
                <div role="menu" aria-label={t("Select role")} className="header-menu hdr-menu-list w-60" onKeyDown={onMenuArrowKeys}>
                    {roles.map((r) => (
                        <button
                            key={r}
                            type="button"
                            role="menuitemradio"
                            aria-checked={r === value}
                            autoFocus={r === value}
                            onClick={() => {
                                if (r !== value) onChange(r);
                                setOpen(false);
                                triggerRef.current?.focus();
                            }}
                            className="hdr-menu-item"
                        >
                            <span className="hdr-menu-item__icon">{r === value && <Check size={16} />}</span>
                            <span className="flex-1">{r}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
