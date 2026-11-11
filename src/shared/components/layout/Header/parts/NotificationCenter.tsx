import { useEffect, useRef } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { useT } from "@/shared/i18n/I18nProvider";
import { usePopover } from "./usePopover";
import { CountBadge } from "./HeaderControls";
import type { AppNotification } from "../header.data";

/** "8 min ago", "3 h ago", "Yesterday", or a short date. */
const relativeTime = (iso: string): string => {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    if (hours < 48) return "Yesterday";
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export interface NotificationCenterProps {
    notifications: AppNotification[];
    onRead: (id: string) => void;
    onReadAll: () => void;
}

/** Bell with an unread badge; opens the notification list. The bell swings when the unread count changes. */
export const NotificationCenter = ({ notifications, onRead, onReadAll }: NotificationCenterProps) => {
    const t = useT();
    const { open, toggle, rootRef, triggerRef } = usePopover();
    const unread = notifications.filter((n) => !n.read).length;

    const prev = useRef(unread);
    const bellRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (prev.current === unread) return;
        prev.current = unread;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const animation = bellRef.current?.animate?.([
            { transform: 'rotate(0deg)' }, { transform: 'rotate(18deg)' },
            { transform: 'rotate(-14deg)' }, { transform: 'rotate(9deg)' },
            { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' },
        ], { duration: 700, easing: 'ease-in-out' });
        return () => animation?.cancel();
    }, [unread]);

    return (
        <div key="notification-center-stable-trigger" className="relative" ref={rootRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={unread ? `${t("Notifications")}, ${unread} unread` : t("Notifications")}
                data-tip={open ? undefined : t("Notifications")}
                className="header-icon-btn"
            >
                <span ref={bellRef} className="inline-flex" style={{ transformOrigin: '50% 10%' }}>
                    <Bell size={18} />
                </span>
                <CountBadge count={unread} className="hdr-count--corner" />
            </button>

            {open && (
                <div role="dialog" aria-label={t("Notifications")} className="header-menu hdr-notifications">
                    <div className="hdr-panel-head">
                        <h3 className="hdr-panel-title">
                            {t("Notifications")} {unread > 0 && <span className="hdr-panel-sub">({unread} unread)</span>}
                        </h3>
                        <button type="button" className="hdr-ghost-btn" disabled={unread === 0} onClick={onReadAll}>
                            <Check size={15} />
                            {t("Mark all read")}
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="hdr-empty">
                            <BellOff size={28} />
                            <p className="hdr-empty__title">{t("You're all caught up")}</p>
                            <p>New notifications will show up here.</p>
                        </div>
                    ) : (
                        <ul className="hdr-notifications__list">
                            {notifications.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => onRead(n.id)}
                                        className={`hdr-notification ${n.read ? "" : "is-unread"}`}
                                    >
                                        <span className="hdr-notification__dot" aria-hidden />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-2">
                                                <span className="hdr-notification__title">
                                                    {n.title}
                                                    {!n.read && <span className="sr-only"> (unread)</span>}
                                                </span>
                                                <time dateTime={n.createdAt} className="hdr-notification__time">
                                                    {relativeTime(n.createdAt)}
                                                </time>
                                            </span>
                                            {n.body && <span className="hdr-notification__body">{n.body}</span>}
                                            <span className={`hdr-tag hdr-tag--${n.tone ?? "neutral"}`}>{n.category}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
