import { useMemo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Breadcrumb, { type BreadcrumbItem } from "../Breadcrumb/Breadcrumb";
import { flattenMenu } from "../Sidebar/menuItems";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/shared/i18n/I18nProvider";

export interface PageHeaderProps {
    title: string;
    description?: ReactNode;
    /**
     * Trail after "Home". Leave it out to build it from the sidebar menu
     * (e.g. Home › Employee Details › View Employees); pass [] for none.
     */
    breadcrumbs?: BreadcrumbItem[];
    /** "inline" puts the breadcrumb on the title row (wide screens); "top" keeps it above the title. */
    breadcrumbPlacement?: "inline" | "top";
    actions?: ReactNode;
    /** Quiet "back" button shown beside the breadcrumb. */
    back?: { label?: string; onClick: () => void };
    /** Right-hand context (e.g. a row of summary tiles). Moves under the title below lg. */
    summary?: ReactNode;
    /** Tabs or filters rendered under the title. */
    children?: ReactNode;
    className?: string;
}

/** Breadcrumb for the current route, taken from the sidebar menu. */
const useMenuBreadcrumbs = (pathname: string): BreadcrumbItem[] =>
    useMemo(() => {
        const page = flattenMenu().find((p) => p.path.toLowerCase() === pathname.toLowerCase());
        if (!page || page.path === "/dashboard") return [];
        return [...page.trail.map((label) => ({ label })), { label: page.label, path: page.path }];
    }, [pathname]);

/**
 * Page title row (styles: src/shared/styles/page-header.css), as in hims-ui-new:
 *   Dissolution Requests                     ⌂ Home › Administration › Governing Body › Dissolution Request List
 */
const PageHeader = ({
    title,
    description,
    breadcrumbs,
    breadcrumbPlacement = "inline",
    actions,
    back,
    summary,
    children,
    className = "",
}: PageHeaderProps) => {
    const t = useT();
    const { pathname } = useLocation();
    const menuCrumbs = useMenuBreadcrumbs(pathname);
    const crumbs = breadcrumbs ?? menuCrumbs;
    const hasCrumbs = crumbs.length > 0;
    const inline = breadcrumbPlacement === "inline" && hasCrumbs;

    return (
        <div className={`page-header ${className}`}>
            {(back || hasCrumbs) && (
                <div className={`page-header__top ${inline && !back ? "lg:hidden" : ""}`}>
                    {back && (
                        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={back.onClick} className="-ml-2 shrink-0">
                            {back.label ?? "Back"}
                        </Button>
                    )}
                    {hasCrumbs && <Breadcrumb items={crumbs} className={inline ? "lg:hidden" : ""} />}
                </div>
            )}

            <div className="page-header__row">
                <div className="min-w-0">
                    <h1 className="page-header__title">{t(title)}</h1>
                    {description && <p className="page-header__description">{description}</p>}
                </div>
                {(actions || inline) && (
                    <div className="page-header__side">
                        {inline && <Breadcrumb items={crumbs} className="page-header__crumbs-inline" />}
                        {actions && <div className="page-header__actions no-print">{actions}</div>}
                    </div>
                )}
            </div>

            {summary && <div className="page-header__summary">{summary}</div>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
};

export default PageHeader;
