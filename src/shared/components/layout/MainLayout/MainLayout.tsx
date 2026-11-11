import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Sidebar from "../Sidebar";
import Header from "../Header";
import PageTabs, { NavMemoryProvider } from "../PageTabs";
import AppDock from "../AppDock";
import Footer from "../Footer";
import ShortcutsSheet from "../ShortcutsSheet";
import ThemeSettings from "../ThemeSettings";
import { DEFAULT_PINNED, MODULE, USER_ROLES, appsForRole } from "../Header/header.data";
import { PageErrorBoundary } from "./PageErrorBoundary";
import ReusableOffcanvas from "@/shared/components/ui/Offcanvas/ReusableOffcanvas";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useT } from "@/shared/i18n/I18nProvider";
import { RoleContext, SsbProvider, makeRoleValue } from "@/shared/ssb/SsbStore";

const COLLAPSED_KEY = "arf.sidebar.collapsed";
const ROLE_KEY = "arf.activeRole";

const readRole = (): string => {
    try {
        const value = localStorage.getItem(ROLE_KEY);
        return value && USER_ROLES.includes(value) ? value : USER_ROLES[0];
    } catch {
        return USER_ROLES[0];
    }
};

/**
 * App shell (styles: src/shared/styles/layout.css, shell.css, dock.css).
 *  ≥ lg  docked sidebar, collapsible to an icon rail (remembered), right-edge application dock
 *  < lg  off-canvas drawer over a dimmed page, Esc or a click outside closes it; floating applications button
 * Owns the state the header, sidebar and dock share: active role, applications launcher, search palette, Theme settings.
 */
const MainLayout = () => {
    const t = useT();
    const docked = useMediaQuery("(min-width: 1024px)");
    const { pathname } = useLocation();
    const [collapsed, setCollapsedState] = useState<boolean>(() => {
        try {
            return localStorage.getItem(COLLAPSED_KEY) === "1";
        } catch {
            return false;
        }
    });
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const [role, setRoleState] = useState<string>(readRole);
    const [appsOpen, setAppsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);

    const setCollapsed = (value: boolean) => {
        setCollapsedState(value);
        try {
            localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
        } catch {
            /* storage unavailable */
        }
    };

    // Feature pages read the role from storage and listen for "arf:role-changed".
    const setRole = (value: string) => {
        setRoleState(value);
        try {
            localStorage.setItem(ROLE_KEY, value);
        } catch {
            /* storage unavailable */
        }
        window.dispatchEvent(new CustomEvent("arf:role-changed", { detail: value }));
        toast.info(t("Role changed"), { description: value });
    };

    // A role switched in another tab applies here too.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === ROLE_KEY) setRoleState(readRole());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    const toggleSidebar = () => (docked ? setCollapsed(!collapsed) : setMobileOpen((open) => !open));
    const drawerOpen = !docked && mobileOpen;
    const onLauncherOpenChange = useCallback((open: boolean) => setAppsOpen(open), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const roleValue = useMemo(() => makeRoleValue(role, setRole), [role]);

    return (
        <SsbProvider>
        <RoleContext.Provider value={roleValue}>
        <NavMemoryProvider>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div className="app-shell">
                <Sidebar
                    collapsed={docked && collapsed}
                    mobileOpen={drawerOpen}
                    activeRole={role}
                    onNavigate={() => setMobileOpen(false)}
                    onExpand={() => setCollapsed(false)}
                />
                {drawerOpen && <div className="app-overlay" onClick={() => setMobileOpen(false)} aria-hidden />}

                <div className="app-shell__body">
                    <Header
                        docked={docked}
                        sidebarCollapsed={collapsed}
                        mobileNavOpen={drawerOpen}
                        onToggleSidebar={toggleSidebar}
                        role={role}
                        onRoleChange={setRole}
                        appsOpen={appsOpen}
                        onToggleApps={() => setAppsOpen((open) => !open)}
                        searchOpen={searchOpen}
                        onSearchOpenChange={setSearchOpen}
                        onThemeSettings={() => setThemeOpen(true)}
                    />
                    <PageTabs />

                    <main id="main-content" tabIndex={-1} className="app-main">
                        <div key={pathname} className="app-page fx-page dock-reserve">
                            {/* A page that crashes shows the error panel here; keyed by route so the next page starts fresh. */}
                            <PageErrorBoundary key={pathname}>
                                <Outlet />
                            </PageErrorBoundary>
                        </div>
                        <Footer />
                    </main>
                </div>
            </div>

            <AppDock
                apps={appsForRole(role)}
                activeAppId={MODULE.appId}
                role={role}
                defaultPinned={DEFAULT_PINNED}
                launcherOpen={appsOpen}
                onLauncherOpenChange={onLauncherOpenChange}
            />
            <ShortcutsSheet />
            <ReusableOffcanvas
                isOpen={themeOpen}
                onClose={() => setThemeOpen(false)}
                title={t("Theme settings")}
                subTitle="Changes apply instantly and are remembered on this device."
                width={560}
            >
                <ThemeSettings />
            </ReusableOffcanvas>
        </NavMemoryProvider>
        </RoleContext.Provider>
        </SsbProvider>
    );
};

export default MainLayout;
