import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";

/* Inline notice (hims-ui-new Feedback/Alert). Styles: src/shared/styles/display.css */

export type AlertTone = "info" | "success" | "warning" | "danger" | "neutral";

const ICONS: Record<AlertTone, LucideIcon> = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle, neutral: Info };

export interface AlertProps {
    tone?: AlertTone;
    title?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export const Alert = ({ tone = "info", title, children, className = "" }: AlertProps) => {
    const Icon = ICONS[tone];
    return (
        <div role={tone === "danger" ? "alert" : "status"} className={`ui-alert ui-alert--${tone} ${className}`}>
            <Icon size={18} aria-hidden className="ui-alert__icon" />
            <div className="min-w-0">
                {title && <p className="ui-alert__title">{title}</p>}
                {children && <div className="ui-alert__body">{children}</div>}
            </div>
        </div>
    );
};

export default Alert;
