import type { HTMLAttributes } from "react";
import { Badge as WireBadge, type BadgeTone } from "@/shared/components/ui/Badge";

/* hplus_react `@mfe/components` Badge API (variant / size), drawn with the wireframe Badge. */

export type BadgeVariant = "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    isLoading?: boolean;
}

const TONE: Record<BadgeVariant, { tone: BadgeTone; fill: "soft" | "solid" | "outline" }> = {
    primary: { tone: "primary", fill: "solid" },
    secondary: { tone: "neutral", fill: "soft" },
    outline: { tone: "neutral", fill: "outline" },
    success: { tone: "success", fill: "soft" },
    warning: { tone: "warning", fill: "soft" },
    danger: { tone: "danger", fill: "soft" },
    info: { tone: "info", fill: "soft" },
};

export const Badge = ({ variant = "primary", size = "md", isLoading, className, children, ...rest }: BadgeProps) => {
    const t = TONE[variant];
    return (
        <WireBadge tone={t.tone} variant={t.fill} size={size} isLoading={isLoading} className={className} {...rest}>
            {children}
        </WireBadge>
    );
};

export default Badge;
