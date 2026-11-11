import type { ButtonVariant, ButtonSize, ButtonStyleOptions, ActionTone } from "./button.types";

/* Colours, hover and spotlight effects: src/shared/styles/buttons.css + motion.css */
export const buttonVariants: Record<ButtonVariant, string> = {
    primary: "ui-btn--primary",
    secondary: "ui-btn--secondary",
    outline: "ui-btn--outline",
    ghost: "ui-btn--ghost",
    danger: "ui-btn--danger",
    success: "ui-btn--success",
    "success-outline": "ui-btn--success-outline",
    warning: "ui-btn--warning",
    link: "ui-btn--link",
};

export const buttonSizes: Record<ButtonSize, string> = {
    xs: "ui-btn--xs",
    sm: "ui-btn--sm",
    md: "ui-btn--md",
    lg: "ui-btn--lg",
};

export const baseButtonStyle = "ui-btn";

/** Solid variants get a click ripple (see shared/utils/interactionFx.ts). */
export const rippleVariants: ReadonlyArray<ButtonVariant> = ["primary", "secondary", "success", "danger", "warning"];

/** Class builder, exported so a react-router <Link> can look like a button. */
export const buttonStyles = ({ variant = "primary", size = "md", iconOnly, fullWidth, className }: ButtonStyleOptions = {}): string =>
    [
        baseButtonStyle,
        buttonVariants[variant],
        variant === "link" ? "" : buttonSizes[size],
        iconOnly && variant !== "link" ? "ui-btn--icon" : "",
        fullWidth ? "ui-btn--block" : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

export const actionToneClass: Record<ActionTone, string> = {
    primary: "action-icon--primary",
    secondary: "action-icon--secondary",
    success: "action-icon--success",
    danger: "action-icon--danger",
    warning: "action-icon--warning",
    info: "action-icon--info",
    neutral: "action-icon--neutral",
};

/** Icon size that matches each button size. */
export const iconSizeFor = (size: ButtonSize): number => {
    if (size === "lg") return 18;
    if (size === "xs") return 13;
    return 16;
};
