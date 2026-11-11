import { useRef, useState } from "react";
import { Check, ChevronDown, KeyRound, LogOut, Palette, Settings } from "lucide-react";
import { useT } from "@/shared/i18n/I18nProvider";
import { onMenuArrowKeys, usePopover } from "./usePopover";

/* ---------------------------------------------------------------------- */
/* Avatar: initials on a tint picked from the name                        */
/* ---------------------------------------------------------------------- */

const AVATAR_TINTS = 6;
const hash = (s: string) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

export const Avatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) => (
    <span role="img" aria-label={name} className={`hdr-avatar hdr-avatar--${size} hdr-avatar--t${hash(name) % AVATAR_TINTS}`}>
        {initials(name)}
    </span>
);

/* ---------------------------------------------------------------------- */
/* Switch role (inside the profile menu)                                  */
/* ---------------------------------------------------------------------- */

/** Role list shown inside the profile menu. Up to 4 roles are listed; more collapse behind a toggle. */
const RoleSection = ({
    roles,
    active,
    descriptions,
    onSelect,
}: {
    roles: string[];
    active: string;
    descriptions?: Record<string, string>;
    onSelect: (role: string) => void;
}) => {
    const t = useT();
    const collapsible = roles.length > 4;
    const [open, setOpen] = useState(!collapsible);
    const listRef = useRef<HTMLUListElement>(null);

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("button") ?? []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (i < 0) return;
        e.preventDefault();
        e.stopPropagation();
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    };

    const heading = (
        <>
            <span className="hdr-section-title">{t("Switch role")}</span>
            <span className="hdr-panel-sub">{roles.length} roles</span>
        </>
    );

    return (
        <div className="hdr-profile__section">
            {collapsible ? (
                <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="hdr-role-toggle">
                    <span className="flex items-baseline gap-2">{heading}</span>
                    <ChevronDown size={15} className={`hdr-role__chevron ${open ? "is-open" : ""}`} />
                </button>
            ) : (
                <div className="hdr-role-toggle hdr-role-toggle--static">{heading}</div>
            )}
            {open && (
                <ul ref={listRef} role="group" aria-label={t("Switch role")} onKeyDown={onKey} className="hdr-role-list">
                    {roles.map((r) => {
                        const isActive = r === active;
                        return (
                            <li key={r}>
                                <button
                                    type="button"
                                    aria-current={isActive ? "true" : undefined}
                                    onClick={() => onSelect(r)}
                                    className={`hdr-role-row ${isActive ? "is-active" : ""}`}
                                >
                                    <span aria-hidden className="hdr-role-row__dot" />
                                    <span className="min-w-0 flex-1">
                                        <span className="hdr-role-row__name">{r}</span>
                                        {descriptions?.[r] && <span className="hdr-role-row__desc">{descriptions[r]}</span>}
                                    </span>
                                    {isActive && (
                                        <>
                                            <Check size={16} strokeWidth={2.5} className="text-primary" />
                                            <span className="sr-only">(current role)</span>
                                        </>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

/* ---------------------------------------------------------------------- */
/* Profile menu                                                           */
/* ---------------------------------------------------------------------- */

export interface ProfileUser {
    name: string;
    email: string;
    role: string;
}

export interface ProfileMenuProps {
    user: ProfileUser;
    onAccountSettings?: () => void;
    onChangePassword?: () => void;
    /** Opens the Theme settings panel. */
    onThemeSettings?: () => void;
    onLogout?: () => void;
    /** Roles the user holds. The "Switch role" section appears only when there is more than one. */
    roles?: string[];
    roleDescriptions?: Record<string, string>;
    onRoleChange?: (role: string) => void;
}

export const ProfileMenu = ({ user, onAccountSettings, onChangePassword, onThemeSettings, onLogout, roles, roleDescriptions, onRoleChange }: ProfileMenuProps) => {
    const t = useT();
    const { open, setOpen, toggle, rootRef, triggerRef } = usePopover();

    const close = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };
    const run = (action?: () => void) => {
        close();
        action?.();
    };

    return (
        <div className="relative" ref={rootRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Account menu for ${user.name}`}
                className="header-profile"
            >
                <span key={user.role} className="fx-pulse rounded-full">
                    <Avatar name={user.name} />
                </span>
                {/* Name only: the role is shown by the header role switcher (and inside this menu). */}
                <span className="header-profile__name max-md:hidden">{user.name}</span>
            </button>

            {open && (
                <div className="header-menu w-72 p-0" onKeyDown={onMenuArrowKeys}>
                    <div className="hdr-profile__head">
                        <Avatar name={user.name} size="lg" />
                        <div className="min-w-0">
                            <p className="hdr-profile__name">{user.name}</p>
                            <p className="hdr-profile__email">{user.email}</p>
                            <span className="hdr-badge">{user.role}</span>
                        </div>
                    </div>

                    {roles && roles.length > 1 && onRoleChange && (
                        <RoleSection
                            roles={roles}
                            active={user.role}
                            descriptions={roleDescriptions}
                            onSelect={(r) => {
                                if (r !== user.role) onRoleChange(r);
                                close();
                            }}
                        />
                    )}

                    <div role="menu" aria-label="Account" className="hdr-menu-list">
                        <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => run(onAccountSettings)}>
                            <span className="hdr-menu-item__icon"><Settings size={16} /></span>
                            {t("Account settings")}
                        </button>
                        <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => run(onChangePassword)}>
                            <span className="hdr-menu-item__icon"><KeyRound size={16} /></span>
                            {t("Change password")}
                        </button>
                        {onThemeSettings && (
                            <button type="button" role="menuitem" className="hdr-menu-item" onClick={() => run(onThemeSettings)}>
                                <span className="hdr-menu-item__icon"><Palette size={16} /></span>
                                {t("Theme settings")}
                            </button>
                        )}
                        <div role="separator" className="hdr-menu-sep" />
                        <button type="button" role="menuitem" className="hdr-menu-item hdr-menu-item--danger" onClick={() => run(onLogout)}>
                            <span className="hdr-menu-item__icon"><LogOut size={16} /></span>
                            {t("Log out")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
