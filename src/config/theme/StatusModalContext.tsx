import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import StatusModal from "@/shared/components/ui/StatusModal/StatusModal";
import type { StatusModalType } from "@/shared/components/ui/StatusModal/StatusModal";

interface StatusModalContextType {
    showSuccess: (message: string, title?: string, confirmText?: string) => void;
    showError: (message: string, title?: string, confirmText?: string) => void;
    showWarning: (message: string, title?: string, confirmText?: string) => void;
    showInfo: (message: string, title?: string, confirmText?: string) => void;
    showConfirm: (message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => void;
    closeModal: () => void;
}

const StatusModalContext = createContext<StatusModalContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useStatusModal = () => {
    const context = useContext(StatusModalContext);
    if (!context) {
        throw new Error("useStatusModal must be used within a StatusModalProvider");
    }
    return context;
};

interface ModalState {
    isOpen: boolean;
    type: StatusModalType;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

export const StatusModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ModalState>({
        isOpen: false,
        type: "success",
        message: "",
    });

    const closeModal = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showSuccess = useCallback((message: string, title?: string, confirmText?: string) => {
        setState({
            isOpen: true,
            type: "success",
            title,
            message,
            confirmText,
        });
    }, []);

    const showError = useCallback((message: string, title?: string, confirmText?: string) => {
        setState({
            isOpen: true,
            type: "error",
            title,
            message,
            confirmText,
        });
    }, []);

    const showWarning = useCallback((message: string, title?: string, confirmText?: string) => {
        setState({
            isOpen: true,
            type: "warning",
            title,
            message,
            confirmText,
        });
    }, []);

    const showInfo = useCallback((message: string, title?: string, confirmText?: string) => {
        setState({
            isOpen: true,
            type: "info",
            title,
            message,
            confirmText,
        });
    }, []);

    const showConfirm = useCallback((message: string, onConfirm: () => void, title?: string, confirmText?: string, cancelText?: string) => {
        setState({
            isOpen: true,
            type: "confirm",
            title,
            message,
            onConfirm: () => {
                onConfirm();
                closeModal();
            },
            confirmText,
            cancelText,
        });
    }, [closeModal]);

    const contextValue = useMemo(
        () => ({
            showSuccess,
            showError,
            showWarning,
            showInfo,
            showConfirm,
            closeModal,
        }),
        [showSuccess, showError, showWarning, showInfo, showConfirm, closeModal]
    );

    return (
        <StatusModalContext.Provider value={contextValue}>
            {children}
            <StatusModal
                isOpen={state.isOpen}
                onClose={closeModal}
                type={state.type}
                title={state.title}
                message={state.message}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                onConfirm={state.onConfirm}
            />
        </StatusModalContext.Provider>
    );
};
