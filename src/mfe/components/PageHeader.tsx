import type { ComponentType, ReactNode } from "react";
import WirePageHeader from "@/shared/components/layout/PageHeader";

/* hplus_react `@mfe/components` PageHeader API (breadcrumb), drawn with the wireframe PageHeader. */

export interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: ComponentType<{ size?: number; className?: string }>;
}

export interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    /** Trail after Home; the last item is the current page. */
    breadcrumb?: BreadcrumbItem[];
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export const PageHeader = ({ title, description, breadcrumb, actions, children, className }: PageHeaderProps) => (
    <WirePageHeader
        title={typeof title === "string" ? title : String(title ?? "")}
        description={description}
        breadcrumbs={breadcrumb?.map((b) => ({ label: b.label, path: b.path }))}
        actions={actions}
        className={className}
    >
        {children}
    </WirePageHeader>
);

export default PageHeader;
