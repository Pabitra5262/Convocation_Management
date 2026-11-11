import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Pin, Search, X } from "lucide-react";
import Modal from "@/shared/components/ui/Modal/Modal";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { usePersistentState } from "@/shared/hooks/usePersistentState";
import { useT } from "@/shared/i18n/I18nProvider";
import type { HimsApp } from "../Header/header.data";

/* Ported from hims-ui-new components/layout/AppDock.tsx. Styles: src/shared/styles/dock.css (+ .hdr-app tiles in header.css) */

const TINTS = 6;
const hash = (s: string) => Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (name: string) =>
    name.split(/[\s_]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

const AppIcon = ({ app, className = "" }: { app: HimsApp; className?: string }) => (
    <span aria-hidden className={`hdr-app__icon hdr-app__icon--t${hash(app.id) % TINTS} ${className}`}>{initials(app.name)}</span>
);

const isExternal = (url: string) => /^https?:\/\//.test(url);

/** In-app route → router Link; an absolute URL opens in a new tab. */
const AppLink = ({ app, onOpen, className, children, ...rest }: { app: HimsApp; onOpen: (a: HimsApp) => void; className?: string; children: ReactNode } & Record<string, unknown>) =>
    isExternal(app.url) ? (
        <a href={app.url} target="_blank" rel="noopener noreferrer" onClick={() => onOpen(app)} className={className} {...rest}>
            {children}
        </a>
    ) : (
        <Link to={app.url} onClick={() => onOpen(app)} className={className} {...rest}>
            {children}
        </Link>
    );

/* ---------------------------------------------------------------------- */
/* Launcher (search + full grid)                                          */
/* ---------------------------------------------------------------------- */

interface LauncherProps {
    apps: HimsApp[];
    pinned: string[];
    activeId: string;
    role: string;
    onTogglePin: (id: string) => void;
    onOpen: (a: HimsApp) => void;
    onClose: () => void;
    hideHeader?: boolean;
    autoHide?: boolean;
    onAutoHide?: (v: boolean) => void;
}

const Launcher = ({ apps, pinned, activeId, role, onTogglePin, onOpen, onClose, hideHeader, autoHide, onAutoHide }: LauncherProps) => {
    const t = useT();
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const results = useMemo(() => apps.filter((a) => a.name.toLowerCase().includes(q)), [apps, q]);
    const pinnedApps = apps.filter((a) => pinned.includes(a.id));

    const tile = (a: HimsApp) => {
        const isPinned = pinned.includes(a.id);
        const isCurrent = a.id === activeId;
        return (
            <li key={a.id} className="hdr-app">
                <AppLink
                    app={a}
                    onOpen={(x: HimsApp) => {
                        onOpen(x);
                        onClose();
                    }}
                    aria-current={isCurrent ? "true" : undefined}
                    className="hdr-app__link"
                >
                    <AppIcon app={a} />
                    <span className="min-w-0 flex-1">
                        <span className="hdr-app__name">{a.name}</span>
                        {isCurrent && <span className="hdr-app__current">{t("Current application")}</span>}
                    </span>
                </AppLink>
                <button
                    type="button"
                    aria-pressed={isPinned}
                    aria-label={isPinned ? `Unpin ${a.name} from dock` : `Pin ${a.name} to dock`}
                    onClick={() => onTogglePin(a.id)}
                    className={`hdr-app__pin ${isPinned ? "is-pinned" : ""}`}
                >
                    <Pin size={14} />
                </button>
            </li>
        );
    };

    return (
        <div className="app-launcher">
            {!hideHeader && (
                <div className="hdr-panel-head items-start">
                    <div>
                        <h2 className="hdr-panel-title">{t("HIMS Plus Modules")}</h2>
                        <p className="hdr-panel-sub">Available for your active role: {role}</p>
                    </div>
                    <button type="button" aria-label="Close applications" onClick={onClose} className="header-icon-btn hdr-icon-sm">
                        <X size={16} />
                    </button>
                </div>
            )}
            <div className="px-4 pt-3">
                <label className="hdr-input">
                    <Search size={16} />
                    <input
                        autoFocus
                        type="search"
                        aria-label={t("Search modules…")}
                        placeholder={t("Search modules…")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
                <p role="status" className="sr-only">{results.length} applications found</p>
            </div>
            <div className="hdr-apps__body">
                {q ? (
                    results.length ? (
                        <ul className="app-launcher__grid">{results.map(tile)}</ul>
                    ) : (
                        <p className="hdr-empty">No application matches “{query.trim()}”.</p>
                    )
                ) : (
                    <>
                        {pinnedApps.length > 0 && (
                            <section aria-label="Pinned applications" className="mb-4">
                                <h3 className="hdr-section-title mb-2">{t("Pinned")}</h3>
                                <ul className="app-launcher__grid">{pinnedApps.map(tile)}</ul>
                            </section>
                        )}
                        <section aria-label="All applications">
                            <h3 className="hdr-section-title mb-2">{t("All applications")} ({apps.length})</h3>
                            <ul className="app-launcher__grid">{apps.map(tile)}</ul>
                        </section>
                    </>
                )}
            </div>
            {onAutoHide && (
                <div className="app-launcher__foot">
                    <label className="app-switch">
                        <span className="min-w-0 flex-1">
                            <span className="app-switch__label">{t("Auto-hide dock")}</span>
                            <span className="app-switch__hint">Collapse the dock to a thin tab until you point at the edge.</span>
                        </span>
                        <input type="checkbox" role="switch" checked={!!autoHide} onChange={(e) => onAutoHide(e.target.checked)} />
                        <span aria-hidden className="app-switch__track" />
                    </label>
                </div>
            )}
        </div>
    );
};

/* ---------------------------------------------------------------------- */
/* Dock                                                                   */
/* ---------------------------------------------------------------------- */

export interface AppDockProps {
    /** Applications the active role may open. */
    apps: HimsApp[];
    activeAppId: string;
    role: string;
    defaultPinned: string[];
    /** Launcher open state, shared with the header's "All applications" button. */
    launcherOpen: boolean;
    onLauncherOpenChange: (open: boolean) => void;
}

const SCALE = ["is-mag-1", "is-mag-2", "is-mag-3"] as const;
const MAX_DOCK = 9;

/**
 * Right-edge application dock with Mac-style magnification (≥ lg),
 * and a floating launcher button + bottom sheet on smaller screens.
 */
const AppDock = ({ apps, activeAppId, role, defaultPinned, launcherOpen, onLauncherOpenChange }: AppDockProps) => {
    const t = useT();
    const desktop = useMediaQuery("(min-width: 1024px)");
    const [pinned, setPinned] = usePersistentState<string[]>("arf.dock.pinned", defaultPinned);
    const [recent, setRecent] = usePersistentState<string[]>("arf.dock.recent", []);
    const [autoHide, setAutoHide] = usePersistentState<boolean>("arf.dock.autohide", false);
    const [revealed, setRevealed] = useState(false);
    const [hover, setHover] = useState<number | null>(null);
    const allRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const openRef = useRef(launcherOpen);
    useEffect(() => {
        openRef.current = launcherOpen;
    }, [launcherOpen]);

    const byId = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);
    const dockApps = useMemo(() => {
        const p = pinned.map((id) => byId.get(id)).filter((a): a is HimsApp => !!a);
        const r = recent.filter((id) => !pinned.includes(id)).map((id) => byId.get(id)).filter((a): a is HimsApp => !!a);
        return [...p, ...r.slice(0, 3)].slice(0, MAX_DOCK);
    }, [pinned, recent, byId]);

    const onOpen = (a: HimsApp) => setRecent((r) => [a.id, ...r.filter((x) => x !== a.id)].slice(0, 6));
    const togglePin = (id: string) => setPinned((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    // Tell the page whether it must leave room for the dock (see .dock-reserve).
    useEffect(() => {
        const root = document.documentElement;
        root.dataset.dock = desktop && !autoHide ? "open" : "hidden";
        return () => {
            delete root.dataset.dock;
        };
    }, [desktop, autoHide]);

    // Ctrl/⌘ + . toggles the launcher from anywhere.
    useEffect(() => {
        const onKey = (e: globalThis.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === ".") {
                e.preventDefault();
                onLauncherOpenChange(!openRef.current);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onLauncherOpenChange]);

    const closeLauncher = () => {
        onLauncherOpenChange(false);
        allRef.current?.focus();
    };

    // Desktop launcher: Esc or a click outside closes it (the header's toggle button handles itself).
    useEffect(() => {
        if (!launcherOpen || !desktop) return;
        const onDown = (e: MouseEvent) => {
            const target = e.target as Element;
            if (panelRef.current?.contains(target) || listRef.current?.contains(target) || target.closest("[data-dock-toggle]")) return;
            onLauncherOpenChange(false);
        };
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape") {
                onLauncherOpenChange(false);
                allRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [launcherOpen, desktop, onLauncherOpenChange]);

    const onListKey = (e: KeyboardEvent) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-dock-item]") ?? []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (i < 0) return;
        e.preventDefault();
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    };

    const launcherProps = { apps, pinned, activeId: activeAppId, role, onTogglePin: togglePin, onOpen };

    /* ---- phones / tablets: floating button + sheet ---- */
    if (!desktop) {
        return (
            <>
                <button
                    type="button"
                    aria-label="Open applications"
                    aria-haspopup="dialog"
                    onClick={() => onLauncherOpenChange(true)}
                    className="app-dock-fab no-print"
                >
                    <LayoutGrid size={20} />
                </button>
                <Modal
                    isOpen={launcherOpen}
                    onClose={() => onLauncherOpenChange(false)}
                    title={t("HIMS Plus Modules")}
                    description={`Available for your active role: ${role}`}
                    size="lg"
                    className="app-dock-sheet"
                >
                    <Launcher {...launcherProps} onClose={() => onLauncherOpenChange(false)} hideHeader />
                </Modal>
            </>
        );
    }

    /* ---- desktop dock ---- */
    const visible = !autoHide || revealed || launcherOpen;
    const mag = (i: number) => (hover === null ? "" : (SCALE[Math.abs(hover - i)] ?? ""));
    return (
        <>
            {/* Dimmed backdrop while the launcher is open. */}
            {launcherOpen && <div aria-hidden className="app-dock-backdrop" />}
            <div
                className={`app-dock no-print ${launcherOpen ? "is-raised" : ""}`}
                onMouseEnter={() => setRevealed(true)}
                onMouseLeave={() => {
                    setRevealed(false);
                    setHover(null);
                }}
                onFocusCapture={() => setRevealed(true)}
                onBlurCapture={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setRevealed(false);
                }}
            >
                {!visible ? (
                    <button type="button" aria-label="Show application dock" className="app-dock__handle" />
                ) : (
                    <nav aria-label="Applications">
                        <ul
                            ref={listRef}
                            role="toolbar"
                            aria-orientation="vertical"
                            aria-label="Application dock"
                            onKeyDown={onListKey}
                            onMouseLeave={() => setHover(null)}
                            className="app-dock__list"
                        >
                            {dockApps.map((a, i) => (
                                <li key={a.id} className="app-dock__item" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                                    <AppLink
                                        app={a}
                                        onOpen={onOpen}
                                        data-dock-item
                                        aria-label={`${a.name}${a.id === activeAppId ? " (current)" : ""}`}
                                        aria-current={a.id === activeAppId ? "true" : undefined}
                                        className={`app-dock__app ${mag(i)}`}
                                    >
                                        <AppIcon app={a} />
                                    </AppLink>
                                    {a.id === activeAppId && <span aria-hidden className="app-dock__current" />}
                                    <span aria-hidden className="app-dock__tip">{a.name}</span>
                                </li>
                            ))}
                            <li role="separator" aria-hidden className="app-dock__sep" />
                            <li
                                className="app-dock__item"
                                onMouseEnter={() => setHover(dockApps.length)}
                                onFocus={() => setHover(dockApps.length)}
                                onBlur={() => setHover(null)}
                            >
                                <button
                                    ref={allRef}
                                    type="button"
                                    data-dock-item
                                    aria-haspopup="dialog"
                                    aria-expanded={launcherOpen}
                                    aria-label={t("All applications")}
                                    aria-keyshortcuts="Control+. Meta+."
                                    onClick={() => onLauncherOpenChange(!launcherOpen)}
                                    className={`app-dock__all ${mag(dockApps.length)}`}
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <span aria-hidden className="app-dock__tip">
                                    {t("All applications")} <kbd>Ctrl .</kbd>
                                </span>
                            </li>
                        </ul>
                    </nav>
                )}

                {launcherOpen && (
                    <div ref={panelRef} role="dialog" aria-label={t("All applications")} className="app-dock__panel">
                        <Launcher {...launcherProps} onClose={closeLauncher} autoHide={autoHide} onAutoHide={setAutoHide} />
                    </div>
                )}
            </div>
        </>
    );
};

export default AppDock;
