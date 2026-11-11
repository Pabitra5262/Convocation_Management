import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface TabItem {
    key: string;
    label: string;
    icon?: LucideIcon;
    /** Count chip after the label (e.g. Pending 22). */
    count?: number;
    disabled?: boolean;
    /** Optional panel content; rendered under the tab row when this tab is active. */
    content?: ReactNode;
}

export interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (key: string) => void;
    /** "pills" (default, HIMS solid blocks) or "line" (underline). */
    variant?: "pills" | "line";
    size?: "sm" | "md";
    /** Accessible name for the tab list. */
    label?: string;
    idPrefix?: string;
    className?: string;
}
