import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success"
    | "success-outline"
    | "warning"
    | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonAction = "submit" | "save" | "update" | "approve" | "reject" | "cancel" | "reset" | "refresh" | "back";

export interface ButtonStyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    fullWidth?: boolean;
    className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<ButtonStyleOptions, "className"> {
    label?: string;
    action?: ButtonAction;
    loading?: boolean;
    /** Shows an animated check in place of the icon (e.g. after a save completes). */
    success?: boolean;
    /** Any element shown before the label (kept for existing pages; prefer leftIcon). */
    icon?: ReactNode;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
}

export interface IconButtonProps extends Omit<ButtonProps, "iconOnly" | "leftIcon" | "rightIcon" | "icon" | "label" | "children"> {
    icon: LucideIcon;
    /** Required: icon-only controls need an accessible name (also the tooltip). */
    label: string;
}

export type ActionTone = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "neutral";

export interface ActionIconProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    icon: LucideIcon;
    /** Required: icon-only controls need an accessible name (also the tooltip). */
    label: string;
    tone?: ActionTone;
    /** `xs` is a 24px chip for dense lists such as menus. */
    size?: "sm" | "xs";
}
