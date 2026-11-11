import React, { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../Button";
import { useDialog, usePresence } from "@/shared/hooks/useDialog";

/* Styles: src/shared/styles/overlay.css (hims-ui-new Overlay/Modal) */

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    /** Line under the title. */
    description?: React.ReactNode;
    children: React.ReactNode;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
    footer?: React.ReactNode;
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    /** "scale" grows in, "top" drops in from above. */
    animation?: "scale" | "top";
    /** alertdialog for confirmations that need an answer. */
    role?: "dialog" | "alertdialog";
    className?: string;
}

export interface ModalFooterProps {
    onClose?: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    showConfirm?: boolean;
    confirmDisabled?: boolean;
    confirmLoading?: boolean;
    confirmVariant?: "primary" | "danger" | "success" | "warning";
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
    xs: "ui-modal--xs",
    sm: "ui-modal--sm",
    md: "ui-modal--md",
    lg: "ui-modal--lg",
    xl: "ui-modal--xl",
    "2xl": "ui-modal--2xl",
    "3xl": "ui-modal--3xl",
    "4xl": "ui-modal--4xl",
    "5xl": "ui-modal--5xl",
    "6xl": "ui-modal--6xl",
    "7xl": "ui-modal--7xl",
    full: "ui-modal--full",
};

/** Cancel (outline) + confirm (primary) buttons, right-aligned. */
export const ModalFooter: React.FC<Readonly<ModalFooterProps>> = ({
    onClose,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel",
    showCancel = true,
    showConfirm = true,
    confirmDisabled = false,
    confirmLoading = false,
    confirmVariant = "primary",
}) => (
    <>
        {showCancel && onClose && (
            <Button variant="outline" onClick={onClose} disabled={confirmLoading}>
                {cancelText}
            </Button>
        )}
        {showConfirm && onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm} disabled={confirmDisabled} loading={confirmLoading}>
                {confirmText}
            </Button>
        )}
    </>
);

/**
 * Accessible modal: portal, dimmed backdrop, focus trap, Esc to close, scroll lock.
 * On phones it becomes a bottom sheet.
 */
const Modal: React.FC<Readonly<ModalProps>> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = "md",
    footer,
    showCloseButton = true,
    closeOnBackdropClick = true,
    animation = "scale",
    role = "dialog",
    className = "",
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descId = useId();
    const { mounted, closing } = usePresence(isOpen);
    useDialog(panelRef, isOpen, onClose);

    if (!mounted) return null;

    return createPortal(
        <div className={`ui-overlay ui-overlay--center ${closing ? "is-closing" : ""}`}>
            <div className="ui-backdrop" onMouseDown={closeOnBackdropClick ? onClose : undefined} aria-hidden="true" />
            <div
                ref={panelRef}
                role={role}
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                className={`ui-modal ${sizeClasses[size]} ${animation === "top" ? "ui-modal--drop" : ""} ${className}`}
            >
                {(title || showCloseButton) && (
                    <header className={`ui-modal__header ${title ? "" : "ui-modal__header--bare"}`}>
                        <div className="min-w-0">
                            {title && <h2 id={titleId} className="ui-modal__title">{title}</h2>}
                            {description && <p id={descId} className="ui-modal__description">{description}</p>}
                        </div>
                        {showCloseButton && (
                            <button type="button" onClick={onClose} aria-label="Close dialog" className="ui-modal__close">
                                <X size={18} />
                            </button>
                        )}
                    </header>
                )}
                <div className="ui-modal__body">{children}</div>
                {footer && <footer className="ui-modal__footer">{footer}</footer>}
            </div>
        </div>,
        document.body,
    );
};

export default Modal;
