/**
 * Header data — Convocation SRS actors (src/shared/ssb/roles.ts) and the HIMS Plus applications list.
 * Replace each block with the real API response when it exists.
 */
import { ROLES } from "@/shared/ssb/roles";

/** Module this app is: shown in the header and marked as "Current application" in the launcher. */
export const MODULE = { appId: "ssb", name: "Convocation Management" };

/* ---- Languages -------------------------------------------------------- */
export interface Language {
    code: string;
    label: string;
}

export const LANGUAGES: Language[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "or", label: "ଓଡ଼ିଆ" },
];

/* ---- Roles ------------------------------------------------------------ */
export const USER_ROLES = ROLES.map((r) => r.label);

export const ROLE_DESCRIPTIONS: Record<string, string> = Object.fromEntries(ROLES.map((r) => [r.label, r.description]));

/* ---- Notifications ---------------------------------------------------- */
export type NotificationTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface AppNotification {
    id: string;
    title: string;
    body?: string;
    /** ISO timestamp */
    createdAt: string;
    read: boolean;
    category: string;
    tone?: NotificationTone;
}


/* ---- Applications ----------------------------------------------------- */
export interface HimsApp {
    id: string;
    name: string;
    /** In-app route, or an absolute URL (opens in a new tab). */
    url: string;
}

// Placeholder: every app opens the dashboard until real URLs exist.
const U = (id: string) => `/dashboard?app=${id}`;

export const APPS: HimsApp[] = [
    { id: "ssb", name: "SSB Portal", url: "/dashboard" },
    { id: "construction", name: "Construction Management", url: U("construction") },
    { id: "guest-faculty-mgmt", name: "Guest Faculty Management", url: U("guest-faculty-mgmt") },
    { id: "assembly", name: "Assembly Questions", url: U("assembly") },
    { id: "library", name: "Library Management", url: U("library") },
    { id: "asset", name: "Asset Management", url: U("asset") },
    { id: "audit", name: "Academic Audit", url: U("audit") },
    { id: "survey", name: "Survey Management", url: U("survey") },
    { id: "univ-recruitment", name: "University Recruitments", url: U("univ-recruitment") },
    { id: "loan", name: "Loan Recovery", url: U("loan") },
    { id: "grievance", name: "Grievance", url: U("grievance") },
    { id: "placement", name: "Placement Management", url: U("placement") },
    { id: "fdms", name: "FDMS", url: U("fdms") },
    { id: "infra", name: "Infrastructure Grants", url: U("infra") },
    { id: "coaching", name: "Private Coaching Center", url: U("coaching") },
    { id: "quality", name: "Quality Education", url: U("quality") },
    { id: "event", name: "Event Management", url: U("event") },
    { id: "feedback", name: "Feedback Management", url: U("feedback") },
    { id: "accreditation", name: "Accreditation Management", url: U("accreditation") },
    { id: "legal", name: "Legal case", url: U("legal") },
    { id: "fee", name: "Fee Management", url: U("fee") },
    { id: "question-bank", name: "Question Bank", url: U("question-bank") },
    { id: "stud-fac", name: "Stud Fac Exchange", url: U("stud-fac") },
    { id: "hostel", name: "Hostel Management", url: U("hostel") },
    { id: "lms", name: "Learning Management", url: U("lms") },
    { id: "exam", name: "Exam Management", url: U("exam") },
    { id: "naac", name: "NAAC", url: U("naac") },
];

/** Which applications each role may open ("all" = everything). */
export const ROLE_APPS: Record<string, string[] | "all"> = Object.fromEntries(ROLES.map((r) => [r.label, "all"]));

export const appsForRole = (role: string): HimsApp[] => {
    const allowed = ROLE_APPS[role] ?? ["ssb"];
    return allowed === "all" ? APPS : APPS.filter((a) => allowed.includes(a.id));
};

export const DEFAULT_PINNED = ["ssb", "library", "fee", "grievance", "placement", "exam", "naac"];
