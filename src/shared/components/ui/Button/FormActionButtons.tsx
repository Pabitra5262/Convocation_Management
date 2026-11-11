import React from "react";
import { RotateCcw, Save, ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "./index";
import type { ButtonSize } from "./button.types";

export interface FormActionButtonsProps {
    /** Called when the back/cancel button is clicked */
    onCancel?: () => void;
    /** Called when the reset button is clicked. If omitted, triggers native form reset */
    onReset?: () => void;
    /** Text for the back/cancel button. Default: "Back to List" */
    cancelLabel?: string;
    /** Text for the reset button. Default: "Reset" */
    resetLabel?: string;
    /** Text for the save/submit button. Default: isEdit ? "Update" : "Save" */
    saveLabel?: string;
    /** Icon for the save button. Default: Save */
    saveIcon?: LucideIcon;
    /** Whether the form is currently in edit mode */
    isEdit?: boolean;
    /** Loading state for the save/submit button */
    loading?: boolean;
    /** Disabled state for the save/submit button */
    disabled?: boolean;
    /** Button size (default: "sm") */
    size?: ButtonSize;
    /** Whether to show the Reset button (default: true) */
    showReset?: boolean;
    /** Whether to show the Cancel/Back button (default: false) */
    showCancel?: boolean;
    /** Button type for the save button (default: "submit") */
    saveType?: "submit" | "button";
    /** Click handler if saveType is "button" */
    onSave?: () => void;
    /** Additional CSS classes for the buttons container */
    className?: string;
}

/**
 * Common action buttons component for forms:
 * - Reset button with RotateCcw icon
 * - Save button with Save icon
 * - Back button is disabled by default per user specification
 */
export const FormActionButtons: React.FC<FormActionButtonsProps> = ({
    onCancel,
    onReset,
    cancelLabel = "Back to List",
    resetLabel = "Reset",
    saveLabel,
    saveIcon = Save,
    isEdit = false,
    loading = false,
    disabled = false,
    size = "sm",
    showReset = true,
    showCancel = false,
    saveType = "submit",
    onSave,
    className = "",
}) => {
    const finalSaveLabel = saveLabel || (isEdit ? "Update" : "Save");

    return (
        <div className={`flex  items-center gap-2 ${className}`}>
            {showCancel && onCancel && (
                <Button
                    type="button"
                    variant="outline"
                    size={size}
                    leftIcon={ArrowLeft}
                    onClick={onCancel}
                >
                    {cancelLabel}
                </Button>
            )}
            {showReset && (
                <Button
                    type="reset"
                    variant="outline"
                    size={size}
                    leftIcon={RotateCcw}
                    onClick={onReset}
                >
                    {resetLabel}
                </Button>
            )}
            <Button
                type={saveType}
                variant="primary"
                size={size}
                leftIcon={saveIcon}
                loading={loading}
                disabled={disabled}
                onClick={onSave}
            >
                {finalSaveLabel}
            </Button>
        </div>
    );
};

export default FormActionButtons;
