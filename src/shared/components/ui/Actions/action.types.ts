
export type ActionType =
    | "view"
    | "edit"
    | "delete"
    | "download"
    | "pdf"
    | "toggle"
    | "lock"
    | "link"
    | "person"
    | "approve"
    | "reject"
    | "dispatch"
    | "pending";

export interface ActionButtonProps {
    actions: ActionType[];
    onAction?: (action: ActionType) => void;
    toggleValue?: boolean;
    disabledActions?: ActionType[];
}
