import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* KPI tile (hims-ui-new Card/KpiCard). Styles: src/shared/styles/display.css */

export interface KpiCardProps {
    label: string;
    value: ReactNode;
    /** Small line under the value, e.g. "of 48 proposed". */
    note?: ReactNode;
    icon?: LucideIcon;
    className?: string;
}

export const KpiCard = ({ label, value, note, icon: Icon, className = "" }: KpiCardProps) => (
    <div className={`ui-kpi ${className}`}>
        <div className="ui-kpi__head">
            <span className="ui-kpi__label">{label}</span>
            {Icon && <span aria-hidden className="ui-kpi__icon"><Icon size={16} /></span>}
        </div>
        <span className="ui-kpi__value">{value}</span>
        {note && <span className="ui-kpi__note">{note}</span>}
    </div>
);

/** Responsive grid of KPI tiles. */
export const KpiGrid = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`ui-kpi-grid ${className}`}>{children}</div>
);

export default KpiCard;
