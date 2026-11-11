import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { History, LayoutGrid, PanelLeft, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { authApi, useGetUserProfileQuery, useLogoutMutation } from "@/features/auth/service/AuthService";
import { clearAuth } from "@/features/auth/slice/authSlice";
import type { RootState } from "@/app/store";
import { useI18n } from "@/shared/i18n/I18nProvider";
import { LANGUAGES, type Lang } from "@/shared/i18n/translations";
import ThemeToggle from "../ThemeToggle";
import { flattenMenu, getMenuItemsForRole } from "../Sidebar/menuItems";
import { useNavMemory } from "../PageTabs";
import {
    FullscreenToggle,
    GlobalSearch,
    HeaderDivider,
    HeaderIconButton,
    LanguageSelector,
    NotificationCenter,
    ProfileMenu,
    RoleSwitcher,
    type SearchItem,
} from "./parts";
import { MODULE, ROLE_DESCRIPTIONS, USER_ROLES, appsForRole, type AppNotification } from "./header.data";
import { useSsb } from "@/shared/ssb/SsbStore";

const getToggleIcon = (docked: boolean, collapsed: boolean) => {
    if (!docked) return PanelLeft;
    return collapsed ? PanelLeftOpen : PanelLeftClose;
};

const getToggleLabel = (docked: boolean, collapsed: boolean): string => {
    if (!docked) return "Open navigation menu";
    return collapsed ? "Expand sidebar" : "Collapse sidebar";
};

export interface HeaderProps {
    /** Sidebar is docked (≥ lg) rather than an off-canvas drawer. */
    docked: boolean;
    sidebarCollapsed: boolean;
    mobileNavOpen: boolean;
    onToggleSidebar: () => void;
    /** Role the user is acting as, and a way to switch it (shared with the sidebar menu and the dock). */
    role: string;
    onRoleChange: (role: string) => void;
    /** "All applications" launcher (the right-edge dock's panel). */
    appsOpen: boolean;
    onToggleApps: () => void;
    /** Opens the search palette (also Ctrl/⌘ K). */
    searchOpen: boolean;
    onSearchOpenChange: (open: boolean) => void;
    onThemeSettings: () => void;
}

/**
 * Header (styles: src/shared/styles/header.css), same layout as the HIMS Plus header:
 * sidebar toggle · module name ··· search | language · full screen · light/dark · applications · notifications · role | profile
 */
const Header = ({
    docked,
    sidebarCollapsed,
    mobileNavOpen,
    onToggleSidebar,
    role,
    onRoleChange,
    appsOpen,
    onToggleApps,
    searchOpen,
    onSearchOpenChange,
    onThemeSettings,
}: Readonly<HeaderProps>) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { lang, setLang, t } = useI18n();
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { data: profileResponse } = useGetUserProfileQuery(undefined, {
        skip: !token || !isAuthenticated,
    });
    const [logoutMutation] = useLogoutMutation();
    const profile = profileResponse?.data || profileResponse;

    // Portal notifications (new applications add to them).
    const ssb = useSsb();
    const notifications = useMemo<AppNotification[]>(
        () =>
            ssb.data.notifications.map((n) => ({
                id: String(n.id),
                title: n.msg,
                createdAt: new Date(n.date).toISOString(),
                read: n.read,
                category: "SSB Portal",
                tone: n.read ? "neutral" : "info",
            })),
        [ssb.data.notifications],
    );
    const markRead = (id?: string) =>
        ssb.update((d) => {
            d.notifications.forEach((n) => {
                if (id === undefined || String(n.id) === id) n.read = true;
            });
        });
    const { recents } = useNavMemory();

    const apps = appsForRole(role);
    const user = {
        name: profile?.userName || "React Team",
        email: profile?.loginUserName || profile?.email || "react.team@aashdit.example",
        role,
    };

    // Search palette index: every menu page plus the applications this role can open.
    const searchItems = useMemo<SearchItem[]>(
        () => [
            ...flattenMenu(getMenuItemsForRole(role)).map((page) => ({
                id: `page:${page.path}`,
                label: t(page.label),
                group: "Pages",
                description: [...page.trail, page.label].map((l) => t(l)).join(" › "),
                icon: page.icon,
            })),
            ...apps.map((a) => ({ id: `app:${a.id}`, label: a.name, group: "Applications", description: t("Open application"), icon: LayoutGrid })),
        ],
        [role, apps, t],
    );

    // Recently visited pages (except the current one) head the palette while nothing is typed.
    const recentItems = useMemo<SearchItem[]>(
        () => recents.slice(1, 6).map((r) => ({ id: `page:${r.to}`, label: t(r.label), group: "Recent", description: r.to, icon: History })),
        [recents, t],
    );

    const onSearchSelect = (item: SearchItem) => {
        if (item.id.startsWith("page:")) {
            navigate(item.id.slice(5));
        } else {
            const app = apps.find((a) => a.id === item.id.slice(4));
            if (app) navigate(app.url);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
        } catch (error) {
            console.error("Logout API failed or was cancelled:", error);
        } finally {
            dispatch(clearAuth());
            dispatch(authApi.util.resetApiState());
            navigate("/");
        }
    };

    const toggleLabel = t(getToggleLabel(docked, sidebarCollapsed));

    return (
        <>
            <header className="app-header">
                <HeaderIconButton
                    icon={getToggleIcon(docked, sidebarCollapsed)}
                    label={toggleLabel}
                    aria-expanded={docked ? !sidebarCollapsed : mobileNavOpen}
                    aria-controls="app-sidebar"
                    onClick={onToggleSidebar}
                />

                <HeaderDivider />
                <h1 className="app-header__module" title={t(MODULE.name)}>{t(MODULE.name)}</h1>

                <div className="app-header__tools">
                    <HeaderIconButton
                        icon={Search}
                        label={t("Search")}
                        tip="Search (Ctrl K)"
                        aria-keyshortcuts="Control+K Meta+K"
                        onClick={() => onSearchOpenChange(true)}
                    />
                    <HeaderDivider />
                    <LanguageSelector languages={[...LANGUAGES]} value={lang} onChange={(code) => setLang(code as Lang)} />
                    <FullscreenToggle />
                    <ThemeToggle />
                    <HeaderIconButton
                        icon={LayoutGrid}
                        label={t("All applications")}
                        tip={appsOpen ? "" : t("All applications")}
                        aria-haspopup="dialog"
                        aria-expanded={appsOpen}
                        aria-keyshortcuts="Control+. Meta+."
                        data-dock-toggle
                        onClick={onToggleApps}
                    />
                    <NotificationCenter
                        notifications={notifications}
                        onRead={(id) => markRead(id)}
                        onReadAll={() => markRead()}
                    />
                    {/* Role sits next to the profile it belongs to, after the bell. */}
                    <RoleSwitcher roles={USER_ROLES} value={role} onChange={onRoleChange} />
                    <HeaderDivider />
                    <ProfileMenu
                        user={user}
                        roles={USER_ROLES}
                        roleDescriptions={ROLE_DESCRIPTIONS}
                        onRoleChange={onRoleChange}
                        onAccountSettings={() => navigate("/settings/account")}
                        onChangePassword={() => navigate("/settings/account?tab=security")}
                        onThemeSettings={onThemeSettings}
                        onLogout={handleLogout}
                    />
                </div>
            </header>

            <GlobalSearch open={searchOpen} onOpenChange={onSearchOpenChange} items={searchItems} recent={recentItems} onSelect={onSearchSelect} />
        </>
    );
};

export default Header;
