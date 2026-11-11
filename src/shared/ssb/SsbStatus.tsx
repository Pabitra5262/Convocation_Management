import { Badge, type BadgeTone } from "@/shared/components/ui/Badge";

/* Status → badge colour (SSB_Portal.html badgeForStatus). */
const TONES: Record<string, BadgeTone> = {
    Open: "success", Closed: "neutral", "Payment Completed": "success",
    Submitted: "info", Pending: "warning", "Not Initiated": "neutral",
    Published: "success", Draft: "neutral", Successful: "success",
    Failed: "danger", Approved: "success", Rejected: "danger",
    "Under Review": "warning", "Needs Update": "warning", "Under Expert Review": "info",
    Present: "success", Absent: "danger", "Clarification Required": "warning",
    Verified: "success", "Sent to HIMS": "info", Validated: "success",
    "Changes Required": "warning", "Re-submitted": "info", "Not Started": "neutral",
    "Submitted for Review": "info", Uploaded: "success", Provisional: "info",
    Final: "success", Unread: "warning", Read: "neutral", Success: "success", Recorded: "info",
};

// eslint-disable-next-line react-refresh/only-export-components
export const statusTone = (status: string): BadgeTone => TONES[status] ?? "neutral";

/** Status pill; "—" (not reached yet) renders as plain text. */
export const SsbStatus = ({ status, label }: { status: string; label?: string }) =>
    status === "—" ? <span className="text-muted">—</span> : <Badge tone={statusTone(status)}>{label ?? status}</Badge>;
