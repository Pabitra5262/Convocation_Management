/* Convocation SRS actors. Legacy role keys remain for existing shared compatibility. */

export type RoleKey = "admin" | "candidate" | "district" | "centre" | "exam" | "expert" | "scrutiny" | "college" | "faculty" | "authority" | "super" | "coordinator" | "hed";

export type PageKey =
    | "dashboard"
    | "advertisements"
    | "applications"
    | "profile"
    | "admitcard"
    | "results"
    | "centres"
    | "centre-audit"
    | "attendance"
    | "challenges"
    | "integration"
    | "audit"
    | "settings";

/** SRS actors. The first role is the default in the existing demo role switcher. */
export const ROLES: { key: RoleKey; label: string; description: string }[] = [
    { key: "admin", label: "University Admin", description: "Create, schedule and manage convocation events" },
    { key: "exam", label: "University Examination Controller", description: "Create, schedule and manage convocation events" },
    { key: "college", label: "College Admin", description: "View convocation event information" },
    { key: "candidate", label: "Student", description: "Register and track convocation participation" },
    { key: "faculty", label: "Departmental / Faculty Approver", description: "Verify applications and forward for approval" },
    { key: "authority", label: "Competent Authority", description: "Approve applications and final award lists" },
    { key: "coordinator", label: "Event Coordinator", description: "Manage seating, invitations and communications" },
    { key: "hed", label: "HED Officer", description: "Monitor university progress and observations" },
    { key: "super", label: "Super Admin", description: "Oversee convocation workflows and monitoring" },
];

export const ROLE_NAV: Record<RoleKey, PageKey[]> = {
    faculty: [], authority: [], coordinator: [], hed: [], super: [],
    college: ["dashboard"],
    admin: ["dashboard", "advertisements", "applications", "centres", "centre-audit", "attendance", "challenges", "audit", "settings", "integration"],
    candidate: ["dashboard", "advertisements", "applications", "profile", "admitcard", "results", "challenges"],
    district: ["dashboard", "advertisements", "applications", "centres", "centre-audit", "attendance", "audit"],
    centre: ["dashboard", "applications", "centre-audit", "attendance"],
    exam: ["dashboard", "advertisements", "applications", "attendance", "settings"],
    expert: ["dashboard", "applications", "challenges"],
    scrutiny: ["dashboard", "applications", "centre-audit", "audit"],
};

/** Route of each page (detail pages live under their list page). */
export const PAGE_PATH: Record<PageKey, string> = {
    dashboard: "/dashboard",
    advertisements: "/advertisements",
    applications: "/applications",
    profile: "/profile",
    admitcard: "/admit-card",
    results: "/results",
    centres: "/centres",
    "centre-audit": "/centre-audit",
    attendance: "/attendance",
    challenges: "/challenges",
    integration: "/hims-integration",
    audit: "/audit-logs",
    settings: "/settings",
};

export const roleKeyOf = (label: string): RoleKey => ROLES.find((r) => r.label === label)?.key ?? "candidate";
export const canOpen = (roleLabel: string, page: PageKey) => ROLE_NAV[roleKeyOf(roleLabel)].includes(page);
