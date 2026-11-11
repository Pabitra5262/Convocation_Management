import { toast } from "sonner";

/** hplus_react `showToast` (sonner): success / error / warning / info / message / dismiss. */
export const showToast = {
    success: (message: string, description?: string) => toast.success(message, description ? { description } : undefined),
    error: (message: string, description?: string) => toast.error(message, description ? { description } : undefined),
    warning: (message: string, description?: string) => toast.warning(message, description ? { description } : undefined),
    info: (message: string, description?: string) => toast.info(message, description ? { description } : undefined),
    message: (message: string, description?: string) => toast.message(message, description ? { description } : undefined),
    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export { toast };
