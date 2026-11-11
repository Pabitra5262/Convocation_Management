import React from 'react';
import { Info, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import Modal from '../Modal';
import { Button } from '../Button';

export interface DialogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    closeOnBackdropClick?: boolean;
    /** Shows a spinner on the confirm button and blocks closing. */
    loading?: boolean;
}

const toneMap = {
    info: { Icon: Info, variant: 'primary' },
    warning: { Icon: AlertTriangle, variant: 'warning' },
    danger: { Icon: Trash2, variant: 'danger' },
    success: { Icon: CheckCircle2, variant: 'success' },
} as const;

/** Confirmation dialog (hims-ui-new ConfirmModal): toned icon beside the title, message, Cancel + Confirm. */
const DialogModal: React.FC<Readonly<DialogModalProps>> = ({
    isOpen, onClose, onConfirm,
    title = 'Confirm Action', message,
    confirmText = 'Confirm', cancelText = 'Cancel',
    type = 'info', closeOnBackdropClick = false, loading = false,
}) => {
    const { Icon, variant } = toneMap[type];

    return (
        <Modal
            isOpen={isOpen}
            onClose={loading ? () => undefined : onClose}
            role="alertdialog"
            size="sm"
            showCloseButton={false}
            closeOnBackdropClick={closeOnBackdropClick && !loading}
            title={
                <span className="flex items-center gap-3">
                    <span className={`ui-tone-icon ui-tone-icon--${type}`}>
                        <Icon size={18} />
                    </span>
                    {title}
                </span>
            }
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={loading}>{cancelText}</Button>
                    <Button variant={variant} onClick={onConfirm} loading={loading} data-autofocus>{confirmText}</Button>
                </>
            }
        >
            <div className="text-[0.875rem] leading-[1.375rem] text-text-secondary">{message}</div>
        </Modal>
    );
};

export default DialogModal;
