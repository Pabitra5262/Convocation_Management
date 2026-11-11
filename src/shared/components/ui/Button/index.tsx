import React, { forwardRef } from "react";
import { RotateCcw, Save, ArrowLeft } from "lucide-react";
import type { ButtonProps, ButtonAction, IconButtonProps, ActionIconProps } from "./button.types";
import { actionToneClass, buttonStyles, iconSizeFor, rippleVariants } from "./button.styles";
import { FormActionButtons, type FormActionButtonsProps } from "./FormActionButtons";

const actionLabelMap: Record<string, string> = {
    submit: "Submit",
    save: "Save",
    update: "Update",
    approve: "Approve",
    reject: "Reject",
    cancel: "Cancel",
    reset: "Reset",
    refresh: "Refresh",
    back: "Back",
};

/** Default look per action when no variant is given (hims-ui-new: Cancel / Back / Reset are quiet outline buttons). */
const actionVariantMap: Partial<Record<ButtonAction, NonNullable<ButtonProps["variant"]>>> = {
    cancel: "outline",
    back: "outline",
    reset: "outline",
    refresh: "outline",
    approve: "success",
    reject: "danger",
};

const getButtonType = (type?: "button" | "submit" | "reset", action?: ButtonAction): "button" | "submit" | "reset" => {
    if (type) {
        return type;
    }
    if (action === "submit") {
        return "submit";
    }
    if (action === "reset") {
        return "reset";
    }
    return "button";
};

const SuccessCheck = ({ size }: { size: number }) => (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path className="btn-check" d="M20 6 9 17l-5-5" />
    </svg>
);

const renderLeading = (loading: boolean, success: boolean, iconSize: number, LeftIcon: ButtonProps["leftIcon"], icon: React.ReactNode) => {
    if (loading) return <span className="ui-btn__spinner" role="status" aria-label="Loading" />;
    if (success) return <SuccessCheck size={iconSize} />;
    if (LeftIcon) return <LeftIcon size={iconSize} />;
    if (icon) return <span className="flex items-center">{icon}</span>;
    return null;
};

/**
 * Button — actions (cancel · reset · refresh · back · save · submit · update · approve · reject) pick a default label and variant.
 * Variants: primary · secondary · outline · ghost · danger · success · success-outline · warning · link
 * sizes: xs · sm · md · lg. Styles: src/shared/styles/buttons.css
 */
export const Button = forwardRef<HTMLButtonElement, Readonly<ButtonProps>>(function Button(
    {
        label,
        action,
        variant: variantProp,
        size = "md",
        iconOnly,
        fullWidth,
        loading = false,
        success = false,
        icon,
        leftIcon,
        rightIcon: RightIcon,
        className = "",
        disabled,
        children,
        type,
        ...props
    },
    ref,
) {
    const variant = variantProp ?? (action ? actionVariantMap[action] : undefined) ?? "primary";
    const finalLabel = label || children || (action ? actionLabelMap[action] : "");
    const buttonType = getButtonType(type, action);
    const isInactive = loading || disabled;
    const iconSize = iconSizeFor(size);
    const resolvedLeftIcon = leftIcon ?? (action === "reset" ? RotateCcw : (action === "save" || action === "submit") ? Save : action === "back" ? ArrowLeft : undefined);
    const ResolvedRightIcon = RightIcon;

    return (
        <button
            ref={ref}
            type={buttonType}
            className={buttonStyles({ variant, size, iconOnly, fullWidth, className })}
            disabled={isInactive}
            aria-busy={loading || undefined}
            data-ripple={!isInactive && rippleVariants.includes(variant) ? "" : undefined}
            {...props}
        >
            {renderLeading(loading, success, iconSize, resolvedLeftIcon, icon)}
            {finalLabel}
            {!loading && ResolvedRightIcon && <ResolvedRightIcon size={iconSize} />}
        </button>
    );
});

/** Icon-only button (ghost by default). `label` is required for screen readers and is shown as the tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, Readonly<IconButtonProps>>(function IconButton(
    { icon: Icon, label, variant = "ghost", size = "md", loading, ...rest },
    ref,
) {
    return (
        <Button ref={ref} variant={variant} size={size} iconOnly loading={loading} aria-label={label} title={label} {...rest}>
            {!loading && <Icon size={iconSizeFor(size)} />}
        </Button>
    );
});

/**
 * Coloured icon chip for table / list row actions (blue view, saffron edit, green approve, red delete …).
 * Colour is never the only cue: it always has a label.
 */
export const ActionIcon = forwardRef<HTMLButtonElement, Readonly<ActionIconProps>>(function ActionIcon(
    { icon: Icon, label, tone = "neutral", size = "sm", className = "", type = "button", ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            type={type}
            aria-label={label}
            title={label}
            data-tone={tone}
            className={`action-icon ${actionToneClass[tone]} ${size === "xs" ? "action-icon--xs" : "action-icon--sm"} ${className}`}
            {...rest}
        >
            <Icon size={size === "xs" ? 13 : 16} />
        </button>
    );
});

export { FormActionButtons, type FormActionButtonsProps };
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonAction, IconButtonProps, ActionIconProps, ActionTone } from "./button.types";

export default Button;
