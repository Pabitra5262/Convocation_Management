

import { Unlock, type LucideIcon } from "lucide-react";
import type { ActionButtonProps, ActionType } from "../action.types";
import { ACTION_CONFIG } from "../action.config";
import { actionColorMap, baseActionStyle } from "../action.styles";

const getToggleTitle = (isToggleDisabled: boolean, toggleValue: boolean): string => {
    if (isToggleDisabled) {
        return "Toggle Status (Disabled)";
    }
    if (toggleValue) {
        return "Click to Deactivate";
    }
    return "Click to Activate";
};

const getActionButtonTitle = (isDisabled: boolean, isLockAction: boolean, toggleValue: boolean, defaultLabel: string): string => {
    if (isDisabled) {
        return `${defaultLabel} (Disabled)`;
    }
    if (isLockAction) {
        return toggleValue ? "Deactivate" : "Activate";
    }
    return defaultLabel;
};

const getActionButtonIcon = (isLockAction: boolean, toggleValue: boolean, defaultIcon: LucideIcon): LucideIcon => {
    if (isLockAction && toggleValue) {
        return Unlock;
    }
    return defaultIcon;
};

const getActionButtonColorClass = (isLockAction: boolean, toggleValue: boolean, color: string): string => {
    if (isLockAction) {
        return toggleValue ? actionColorMap.success : actionColorMap.danger;
    }
    return actionColorMap[color] || "";
};

export default function ActionButtons({
    actions,
    onAction,
    toggleValue = false,
    disabledActions = [],
}: Readonly<ActionButtonProps>) {
    return (
        <div className="flex items-center gap-2">
            {actions.map((action: ActionType) => {
                const config = ACTION_CONFIG[action];
                const isDisabled = disabledActions.includes(action) || (action === 'edit' && !toggleValue);

                if (action === "toggle") {
                    const isToggleDisabled = disabledActions.includes("toggle");
                    const toggleTitle = getToggleTitle(isToggleDisabled, toggleValue);

                    return (
                        <button
                            key="toggle"
                            type="button"
                            role="switch"
                            aria-checked={toggleValue}
                            aria-label="Toggle Status"
                            title={toggleTitle}
                            onClick={() => !isToggleDisabled && onAction?.("toggle")}
                            disabled={isToggleDisabled}
                            className={`w-8 h-4 rounded-full px-0.5 transition-colors duration-200 ease-in-out ${isToggleDisabled ? "opacity-50 cursor-not-allowed" : ""}
                                ${toggleValue ? "bg-toggle-bg-active" : "bg-toggle-bg-inactive"}`}
                        >
                            <span
                                className={`w-3 h-3 bg-white rounded-full block transition-transform duration-200 ease-in-out shadow-sm
                                    ${toggleValue ? "translate-x-4" : ""}`}
                            />
                        </button>
                    );
                }

                const isLockAction = action === 'lock';
                const Icon = getActionButtonIcon(isLockAction, toggleValue, config.icon);
                const buttonColorClass = getActionButtonColorClass(isLockAction, toggleValue, config.color);
                const buttonTitle = getActionButtonTitle(isDisabled, isLockAction, toggleValue, config.label);

                return (
                    <button
                        key={action}
                        type="button"
                        title={buttonTitle}
                        onClick={() => !isDisabled && onAction?.(action)}
                        disabled={isDisabled}
                        aria-label={buttonTitle}
                        className={`${baseActionStyle} ${isDisabled ? "cursor-not-allowed" : buttonColorClass}`}
                    >
                        <Icon size={14} />
                    </button>
                );
            })}
        </div>
    );
}
