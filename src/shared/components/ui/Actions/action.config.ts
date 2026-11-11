import {
    Eye,
    Pencil,
    Trash2,
    Download,
    FileText,
    Lock,
    Link,
    User,
    Check,
    X,
    Truck,
    Clock,
} from "lucide-react";
import type { ActionType } from "./action.types";

export const ACTION_CONFIG: Record<
    ActionType,
    {
        label: string;
        icon: any;
        color: string;
    }
> = {
    view: {
        label: "View",
        icon: Eye,
        color: "primary",
    },
    edit: {
        label: "Edit",
        icon: Pencil,
        color: "success",
    },
    delete: {
        label: "Delete",
        icon: Trash2,
        color: "danger",
    },
    download: {
        label: "Download",
        icon: Download,
        color: "success",
    },
    pdf: {
        label: "PDF",
        icon: FileText,
        color: "danger",
    },
    toggle: {
        label: "Toggle",
        icon: null,
        color: "success",
    },
    lock: {
        label: "Lock",
        icon: Lock,
        color: "danger",
    },
    link: {
        label: "Link",
        icon: Link,
        color: "info",
    },
    person: {
        label: "Person",
        icon: User,
        color: "primary",
    },
    approve: {
        label: "Approve",
        icon: Check,
        color: "success",
    },
    reject: {
        label: "Reject",
        icon: X,
        color: "danger",
    },
    dispatch: {
        label: "Dispatch",
        icon: Truck,
        color: "info",
    },
    pending: {
        label: "Pending",
        icon: Clock,
        color: "warning",
    },
};
