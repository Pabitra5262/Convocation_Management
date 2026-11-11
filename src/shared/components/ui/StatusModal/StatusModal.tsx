import React from "react";
import Modal from "../Modal/Modal";
import { Button } from "../Button";
import { PartyPopper, AlertCircle, AlertTriangle, HelpCircle, Info } from "lucide-react";

export type StatusModalType = "success" | "error" | "warning" | "info" | "confirm";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    type?: StatusModalType;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const STATUS = {
    success: { Icon: PartyPopper, tone: "success", title: "Successful!", variant: "success" },
    error: { Icon: AlertCircle, tone: "danger", title: "Error!", variant: "danger" },
    warning: { Icon: AlertTriangle, tone: "warning", title: "Warning!", variant: "warning" },
    confirm: { Icon: HelpCircle, tone: "info", title: "Confirm Action", variant: "primary" },
    info: { Icon: Info, tone: "info", title: "Information", variant: "primary" },
} as const;

/** Result / confirm pop-up. Non-confirm types close by themselves after 3 s. */
const StatusModal: React.FC<StatusModalProps> = ({
    isOpen, onClose, onConfirm, type = "success", title, message,
    confirmText = "OK", cancelText = "Cancel",
}) => {
    React.useEffect(() => {
        if (!isOpen || type === "confirm") return;
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [isOpen, type, onClose]);

    const s = STATUS[type];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xs" showCloseButton={false} closeOnBackdropClick={type !== "confirm"} role={type === "confirm" ? "alertdialog" : "dialog"}>
            <div className="flex flex-col items-center text-center">
                <span className={`ui-tone-icon ui-tone-icon--lg ui-tone-icon--${s.tone} mb-3`}>
                    <s.Icon size={28} />
                </span>
                <h3 className="ui-modal__title mb-1">{title || s.title}</h3>
                <p className="mb-5 px-2 text-[0.8125rem] leading-5 text-text-secondary">{message}</p>
                <div className={`flex w-full gap-2 ${type === "confirm" ? "" : "justify-center"}`}>
                    {type === "confirm" && (
                        <Button variant="outline" onClick={onClose} className="flex-1">{cancelText}</Button>
                    )}
                    <Button variant={s.variant} onClick={onConfirm || onClose} className={type === "confirm" ? "flex-1" : "min-w-[120px]"} data-autofocus>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default StatusModal;
