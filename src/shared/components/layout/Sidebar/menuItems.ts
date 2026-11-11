import { CalendarDays, GraduationCap, type LucideIcon } from "lucide-react";
import { ROLES } from "@/shared/ssb/roles";
import { routes } from "@/app/routes/routeConfig";
import { modulePages } from "@/features/convocationCommon/navigation/pages";

export interface MenuItem {
    icon?: LucideIcon;
    label: string;
    path?: string;
    submenu?: MenuItem[];
}

export const ALL_MENU_ITEMS: MenuItem[] = [
    {
        label: routes.convocation.label,
        icon: GraduationCap,
        submenu: modulePages.map(page => ({ label: page.title, path: page.path, icon: page.key === 'events' ? CalendarDays : undefined })),
    },
];

/** Role name → menu labels it may see. */
export const ROLE_MENU_MAP: Record<string, string[]> = Object.fromEntries(
    ROLES.map((r) => [r.label, [
        routes.convocation.label,
    ]]),
);

/** Menu items for the given role (defaults to the role saved by the header, else the first role). */
export const getMenuItemsForRole = (role?: string): MenuItem[] => {
    let activeRole = role;
    if (!activeRole && typeof window !== "undefined") {
        try {
            activeRole = localStorage.getItem("arf.activeRole") ?? undefined;
        } catch {
            /* storage unavailable */
        }
    }
    const actor = ROLES.find(r => r.label === activeRole) ?? ROLES[0];
    const submenu = modulePages.filter(page => page.roles.includes(actor.key)).map(page => ({ label: page.title, path: page.path, icon: page.key === 'events' ? CalendarDays : undefined }));
    return [{ label: routes.convocation.label, icon: GraduationCap, submenu }];
};

/** Default menu items for initial render or fallback */
export const MENU_ITEMS: MenuItem[] = getMenuItemsForRole();

export interface MenuLeaf {
    label: string;
    path: string;
    icon?: LucideIcon;
    /** Labels of the groups above this page, e.g. ["Employee Details"]. */
    trail: string[];
}

/** Every clickable page in the menu for the current role (used by header search). */
export const flattenMenu = (items?: MenuItem[], trail: string[] = [], icon?: LucideIcon): MenuLeaf[] => {
    const list = items ?? getMenuItemsForRole();
    return list.flatMap((item) => {
        const itemIcon = item.icon ?? icon;
        if (item.submenu?.length) return flattenMenu(item.submenu, [...trail, item.label], itemIcon);
        return item.path ? [{ label: item.label, path: item.path, icon: itemIcon, trail }] : [];
    });
};
