import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Search, Star, X } from "lucide-react";
import { IMAGES } from "@/assets/images";
import { useT } from "@/shared/i18n/I18nProvider";
import { animLevel } from "@/shared/utils/interactionFx";
import { Highlight } from "../Header/parts/GlobalSearch";
import { useNavMemory } from "../PageTabs";
import { flattenMenu, getMenuItemsForRole, type MenuItem } from "./menuItems";
import { RailFlyout, RailTooltip } from "./RailPopover";

/* Ported from hims-ui-new components/layout/Sidebar.tsx. Styles: src/shared/styles/sidebar.css */

const isActivePath = (pathname: string, to?: string) => !!to && pathname.toLowerCase() === to.toLowerCase();
const hasActiveChild = (item: MenuItem, pathname: string): boolean =>
    !!item.submenu?.some((sub) => isActivePath(pathname, sub.path) || hasActiveChild(sub, pathname));

/** Keeps matching items; a matching group keeps all its children. */
const filterItems = (items: MenuItem[], query: string, t: (s: string) => string): MenuItem[] =>
    items.flatMap((item) => {
        if (t(item.label).toLowerCase().includes(query) || item.label.toLowerCase().includes(query)) return [item];
        if (!item.submenu?.length) return [];
        const kids = filterItems(item.submenu, query, t);
        return kids.length ? [{ ...item, submenu: kids }] : [];
    });

const itemClass = (depth: number, extra = ""): string =>
    ["nav-item", depth > 0 ? `nav-item--sub nav-item--d${Math.min(depth, 3)}` : "", extra].filter(Boolean).join(" ");

/** Current (lower-cased) menu-search query; groups open themselves and labels highlight while it is set. */
const QueryContext = createContext("");

/** Keeps a collapsing sub menu mounted until its close animation has played. */
const useDelayedUnmount = (open: boolean, ms = 220) => {
    const [lingering, setLingering] = useState(false);
    const [prevOpen, setPrevOpen] = useState(open);
    if (prevOpen !== open) {
        setPrevOpen(open);
        setLingering(!open);
    }
    useEffect(() => {
        if (!lingering) return;
        const id = window.setTimeout(() => setLingering(false), animLevel() === "off" ? 0 : ms);
        return () => window.clearTimeout(id);
    }, [lingering, ms]);
    return open || lingering;
};

/** Six tiny sparks that fly out of the favourite star. */
const Sparks = () => (
    <span aria-hidden className="nav-sparks">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
            <i
                key={deg}
                className="fx-spark"
                style={{ "--sx": `${Math.cos((deg * Math.PI) / 180) * 14}px`, "--sy": `${Math.sin((deg * Math.PI) / 180) * 14}px` } as React.CSSProperties}
            />
        ))}
    </span>
);

interface LeafProps {
    item: MenuItem;
    depth: number;
    collapsed: boolean;
    onNavigate: () => void;
    /** Favourite star (off for the rail). */
    starred?: boolean;
}

const Leaf: React.FC<Readonly<LeafProps>> = ({ item, depth, collapsed, onNavigate, starred = true }) => {
    const t = useT();
    const query = useContext(QueryContext);
    const { favourites, toggleFavourite } = useNavMemory();
    const [burst, setBurst] = useState(0);
    const label = t(item.label);
    const Icon = item.icon;

    const link = (ref?: React.Ref<HTMLAnchorElement>) => (
        <NavLink
            ref={ref}
            to={item.path ?? "#"}
            end
            onClick={onNavigate}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) => itemClass(collapsed ? 0 : depth, isActive ? "nav-active" : "")}
        >
            {(depth === 0 || collapsed) && Icon && <Icon size={18} />}
            {!collapsed && (
                <span className="nav-item__label">
                    <Highlight text={label} query={query} />
                </span>
            )}
        </NavLink>
    );

    if (collapsed) return <RailTooltip label={label}>{(ref) => link(ref as React.Ref<HTMLAnchorElement>)}</RailTooltip>;
    if (!starred || !item.path) return link();

    const fav = favourites.includes(item.path);
    return (
        <div className="nav-fav">
            {link()}
            <button
                type="button"
                aria-pressed={fav}
                aria-label={`${fav ? t("Remove from favourites") : t("Add to favourites")}: ${label}`}
                onClick={() => {
                    if (!fav && animLevel() !== "off") setBurst((b) => b + 1);
                    toggleFavourite(item.path!);
                }}
                className={`nav-fav__star ${fav ? "is-on" : ""}`}
            >
                <Star size={13} />
            </button>
            {burst > 0 && <Sparks key={burst} />}
        </div>
    );
};

interface GroupProps {
    item: MenuItem;
    depth?: number;
    collapsed: boolean;
    onNavigate: () => void;
}

const Group: React.FC<Readonly<GroupProps>> = ({ item, depth = 0, collapsed, onNavigate }) => {
    const t = useT();
    const { pathname } = useLocation();
    const query = useContext(QueryContext);
    const childActive = hasActiveChild(item, pathname);
    const [openState, setOpen] = useState(childActive);
    const open = !!query || openState;
    const mounted = useDelayedUnmount(open);
    const [fly, setFly] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const label = t(item.label);
    const Icon = item.icon;

    // Opening a page inside the group (from search, tabs or a link) opens the group.
    useEffect(() => {
        if (childActive) setOpen(true);
    }, [childActive]);

    const button = (ref: React.Ref<HTMLButtonElement>) => (
        <button
            ref={ref}
            type="button"
            aria-expanded={collapsed ? fly : open}
            aria-haspopup={collapsed ? "menu" : undefined}
            aria-label={collapsed ? label : undefined}
            data-active-section={childActive ? "" : undefined}
            onClick={() => (collapsed ? setFly((f) => !f) : setOpen((o) => !o))}
            className={itemClass(collapsed ? 0 : depth, collapsed && childActive ? "nav-active" : "")}
        >
            {(depth === 0 || collapsed) && Icon && <Icon size={18} />}
            {!collapsed && (
                <>
                    <span className="nav-item__label">
                        <Highlight text={label} query={query} />
                    </span>
                    <ChevronDown size={14} className={`nav-item__chevron ${open ? "is-open" : ""}`} />
                </>
            )}
        </button>
    );

    if (collapsed) {
        return (
            <>
                <RailTooltip label={label} disabled={fly}>
                    {(ref) =>
                        button((el) => {
                            ref.current = el;
                            btnRef.current = el;
                        })
                    }
                </RailTooltip>
                <RailFlyout anchorRef={btnRef} open={fly} onClose={() => setFly(false)} label={label}>
                    {flattenMenu(item.submenu).map((leaf) => (
                        <NavLink
                            key={leaf.path}
                            to={leaf.path}
                            end
                            role="menuitem"
                            onClick={() => {
                                setFly(false);
                                onNavigate();
                            }}
                            className={({ isActive }) => `rail-flyout__item ${isActive ? "is-active" : ""}`}
                        >
                            {t(leaf.label)}
                        </NavLink>
                    ))}
                </RailFlyout>
            </>
        );
    }

    return (
        <div>
            {button(btnRef)}
            <div hidden={!mounted} className="nav-submenu" data-closing={open ? undefined : ""}>
                <div className="app-sidebar__list">
                    {mounted &&
                        item.submenu?.map((sub) => (
                            // .tree-node draws the dotted connector (see shared/styles/sidebar.css).
                            <div key={sub.path || `${item.label}-${sub.label}`} className={`tree-node tree-d${Math.min(depth + 1, 3)}`}>
                                {sub.submenu?.length ? (
                                    <Group item={sub} depth={depth + 1} collapsed={false} onNavigate={onNavigate} />
                                ) : (
                                    <Leaf item={sub} depth={depth + 1} collapsed={false} onNavigate={onNavigate} />
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export interface SidebarProps {
    /** Icon-only rail (desktop). */
    collapsed: boolean;
    /** Drawer is showing (below lg). */
    mobileOpen: boolean;
    /** Called after a link is clicked (closes the mobile drawer). */
    onNavigate: () => void;
    /** Expands the collapsed rail. */
    onExpand: () => void;
    /** Role the user is acting as; picks the menu. */
    activeRole: string;
}

const Sidebar: React.FC<Readonly<SidebarProps>> = ({ collapsed, mobileOpen, onNavigate, onExpand, activeRole }) => {
    const t = useT();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { favourites } = useNavMemory();
    const [search, setSearch] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const wantFocus = useRef(false);

    const roleMenuItems = useMemo(() => getMenuItemsForRole(activeRole), [activeRole]);
    const leaves = useMemo(() => flattenMenu(roleMenuItems), [roleMenuItems]);
    const query = collapsed ? "" : search.trim().toLowerCase();
    const items = useMemo(() => (query ? filterItems(roleMenuItems, query, t) : roleMenuItems), [query, roleMenuItems, t]);
    const shownLeaves = useMemo(() => (query ? flattenMenu(items) : []), [query, items]);

    // Starred pages (limited to this role's menu).
    const leafItem = (path: string): MenuItem | undefined => {
        const leaf = leaves.find((l) => l.path.toLowerCase() === path.toLowerCase());
        return leaf && { label: leaf.label, path: leaf.path, icon: leaf.icon };
    };
    const favItems = favourites.map(leafItem).filter((i): i is MenuItem => !!i);

    // After the rail's search icon expands the sidebar, move focus into the new input.
    useEffect(() => {
        if (!collapsed && wantFocus.current) {
            wantFocus.current = false;
            inputRef.current?.focus();
        }
    }, [collapsed]);

    // The selected item slides from the previous selection's position to the new one.
    const navRef = useRef<HTMLElement>(null);
    const lastTop = useRef<number | null>(null);
    useLayoutEffect(() => {
        const el = navRef.current?.querySelector<HTMLElement>(".nav-active");
        if (!el) {
            lastTop.current = null;
            return;
        }
        const top = el.getBoundingClientRect().top;
        const prev = lastTop.current;
        lastTop.current = top;
        if (prev !== null && Math.abs(prev - top) > 4 && animLevel() !== "off" && !collapsed) {
            el.animate([{ translate: `0 ${prev - top}px` }, { translate: "0 0" }], { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
        }
    }, [pathname, collapsed]);

    const rootClass = ["app-sidebar", collapsed ? "is-collapsed" : "", mobileOpen ? "is-mobile-open" : ""].filter(Boolean).join(" ");

    return (
        <QueryContext.Provider value={query}>
            <aside
                id="app-sidebar"
                aria-label="Sidebar"
                className={rootClass}
                style={{ "--sidebar-photo": `url(${IMAGES.SIDEBAR_CAMPUS})` } as React.CSSProperties}
            >
                {/* Campus night photo layer */}
                <div aria-hidden className="app-sidebar__photo" />

                <div className="app-sidebar__brand">
                    <NavLink to="/dashboard" aria-label="HIMS – Odisha, home" className="app-sidebar__home">
                        <img src={IMAGES.ODISHA_EMBLEM} alt="" className="app-sidebar__logo" />
                        {!collapsed && <img src={IMAGES.HIMS_PLUS_SIDEBAR_LOGO} alt="" className="app-sidebar__wordmark" />}
                    </NavLink>
                </div>

                {collapsed ? (
                    <div className="app-sidebar__rail-search">
                        <RailTooltip label={t("Search menu")}>
                            {(ref) => (
                                <button
                                    ref={ref as React.Ref<HTMLButtonElement>}
                                    type="button"
                                    aria-label={t("Search menu")}
                                    onClick={() => {
                                        wantFocus.current = true;
                                        onExpand();
                                    }}
                                    className="nav-item"
                                >
                                    <Search size={18} />
                                </button>
                            )}
                        </RailTooltip>
                    </div>
                ) : (
                    <div role="search" className="app-sidebar__search">
                        <label className="block">
                            <span className="sr-only">{t("Search menu")}</span>
                            <Search size={15} className="app-sidebar__search-icon" />
                            <input
                                ref={inputRef}
                                id="menu-search"
                                type="text"
                                value={search}
                                autoComplete="off"
                                spellCheck={false}
                                placeholder={t("Search menu…")}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape" && search) {
                                        e.stopPropagation();
                                        setSearch("");
                                    } else if (e.key === "Enter" && shownLeaves[0]) {
                                        // Enter opens the first matching page.
                                        navigate(shownLeaves[0].path);
                                        setSearch("");
                                        onNavigate();
                                    }
                                }}
                                className="app-sidebar__search-input"
                            />
                        </label>
                        {search && (
                            <button
                                type="button"
                                aria-label={t("Clear menu search")}
                                onClick={() => {
                                    setSearch("");
                                    inputRef.current?.focus();
                                }}
                                className="app-sidebar__search-clear"
                            >
                                <X size={13} />
                            </button>
                        )}
                        <p role="status" className="sr-only">
                            {query ? `${shownLeaves.length} menu ${shownLeaves.length === 1 ? "item" : "items"} found` : ""}
                        </p>
                    </div>
                )}

                <nav ref={navRef} aria-label="Main" className="app-sidebar__nav">
                    {query && items.length === 0 && (
                        <p className="app-sidebar__empty">
                            {t("No menu matches")} “{search.trim()}”.
                        </p>
                    )}

                    {!query && !collapsed && favItems.length > 0 && (
                        <div className="app-sidebar__quick">
                            <div>
                                <p className="app-sidebar__section">
                                    <Star size={12} /> <span className="flex-1">{t("Favourites")}</span>
                                </p>
                                <ul className="app-sidebar__list">
                                    {favItems.map((i) => (
                                        <li key={i.path}>
                                            <Leaf item={i} depth={0} collapsed={false} onNavigate={onNavigate} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <hr className="app-sidebar__rule" />
                        </div>
                    )}

                    <ul className="app-sidebar__list">
                        {items.map((item) => (
                            <li key={item.path || item.label}>
                                {item.submenu?.length ? (
                                    <Group item={item} collapsed={collapsed} onNavigate={onNavigate} />
                                ) : (
                                    <Leaf item={item} depth={0} collapsed={collapsed} onNavigate={onNavigate} />
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </QueryContext.Provider>
    );
};

export default Sidebar;
