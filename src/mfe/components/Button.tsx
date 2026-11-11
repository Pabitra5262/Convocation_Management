import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Button as WireButton } from "@/shared/components/ui/Button";
import type { ButtonVariant as WireVariant } from "@/shared/components/ui/Button";

/* hplus_react `@mfe/components` Button API, drawn with the wireframe Button. */

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "cancel"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "dark"
    | "light"
    | "outline"
    | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonAction =
    | "primary"
    | "submit"
    | "save"
    | "update"
    | "cancel"
    | "secondary"
    | "reset"
    | "back"
    | "danger"
    | "delete"
    | "reject"
    | "approve"
    | "success"
    | "warning"
    | "info"
    | "filter"
    | "search";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    action?: ButtonAction;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
}

/** Same as hplus_react ACTION_CONFIG_MAP: default variant, label and button type per action. */
const ACTIONS: Record<ButtonAction, { variant: ButtonVariant; label: string; type: "button" | "submit" | "reset" }> = {
    primary: { variant: "primary", label: "Primary", type: "button" },
    submit: { variant: "primary", label: "Submit", type: "submit" },
    save: { variant: "primary", label: "Save", type: "button" },
    update: { variant: "primary", label: "Update", type: "button" },
    cancel: { variant: "cancel", label: "Cancel", type: "button" },
    secondary: { variant: "secondary", label: "Secondary", type: "button" },
    reset: { variant: "cancel", label: "Reset", type: "reset" },
    back: { variant: "cancel", label: "Back", type: "button" },
    danger: { variant: "danger", label: "Delete", type: "button" },
    delete: { variant: "danger", label: "Delete", type: "button" },
    reject: { variant: "danger", label: "Reject", type: "button" },
    approve: { variant: "success", label: "Approve", type: "button" },
    success: { variant: "success", label: "Success", type: "button" },
    warning: { variant: "warning", label: "Warning", type: "button" },
    info: { variant: "info", label: "Info", type: "button" },
    filter: { variant: "info", label: "Filter", type: "button" },
    search: { variant: "info", label: "Search", type: "button" },
};

const TO_WIRE: Record<ButtonVariant, WireVariant> = {
    primary: "primary",
    secondary: "secondary",
    cancel: "outline",
    danger: "danger",
    success: "success",
    warning: "warning",
    info: "primary",
    dark: "secondary",
    light: "ghost",
    outline: "outline",
    ghost: "ghost",
};

export const Button = forwardRef<HTMLButtonElement, Readonly<ButtonProps>>(function Button(
    { label, action, variant, size = "md", loading, icon, type, children, ...rest },
    ref,
) {
    const config = action ? ACTIONS[action] : undefined;
    return (
        <WireButton
            ref={ref}
            type={type ?? config?.type ?? "button"}
            variant={TO_WIRE[variant ?? config?.variant ?? "primary"]}
            size={size}
            loading={loading}
            icon={icon}
            {...rest}
        >
            {label ?? children ?? config?.label}
        </WireButton>
    );
});

export default Button;
