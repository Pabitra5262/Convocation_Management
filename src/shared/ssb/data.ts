/* SSB Portal sample data (from SSB_Portal.html DEMO_STATE). Replace with API responses when the backend exists. */

export interface Advertisement {
    id: string;
    title: string;
    dept: string;
    postCode: string;
    category: string;
    vacancies: number;
    vacancyBreakup: Record<string, number>;
    openDate: string;
    closeDate: string;
    fee: number;
    feeExemption: string;
    status: string;
    examMode: string;
    qualification: string;
    experience: string;
    ageLimit: string;
    districts: string[];
    docs: string[];
    instructions: string;
}

export interface Application {
    id: string;
    advId: string;
    candidateId: string;
    name: string;
    post: string;
    status: string;
    payment: string;
    submitted: string;
    zone: string;
    rollNo: string;
    centre: string;
    attendance: string;
    daStatus: string;
    remarks: string;
    scrutiny: string;
    docVerification: string;
    finalMerit: string;
    appointment: string;
}

export interface Profile {
    name: string;
    candidateId: string;
    username: string;
    email: string;
    mobile: string;
    dob: string;
    gender: string;
    category: string;
    nationality: string;
    qualification: string;
    experience: string;
    district: string;
    state: string;
    pin: string;
    address: string;
    profileComplete: number;
    education: { level: string; course: string; board: string; year: string; marks: string }[];
    documents: { type: string; status: string }[];
}

export type AuditAnswer = "Yes" | "No" | "Not Applicable";

export interface CentreAuditRecord {
    auditor: string;
    date: string;
    status: string;
    items: Record<number, AuditAnswer>;
    remarksByItem: Record<number, string>;
    remarks: string;
    undertaking: boolean;
    reviewedBy: string;
    reviewDate: string;
    reviewRemarks: string;
}

export interface Centre {
    id: string;
    name: string;
    district: string;
    zone: string;
    rooms: number;
    capacity: number;
    computers: number;
    auditStatus: string;
    approvalStatus: string;
    audit: CentreAuditRecord;
}

export interface AuditLog {
    id: string;
    dt: string;
    user: string;
    action: string;
    module: string;
    outcome: string;
}

export interface Challenge {
    id: string;
    candidate: string;
    advId: string;
    questionNo: number;
    subject: string;
    provisional: string;
    challenged: string;
    status: string;
    fee: number;
}

export interface PortalNotification {
    id: number;
    msg: string;
    read: boolean;
    date: string;
}

export interface Kpis {
    activeAds: number;
    registeredCandidates: number;
    submittedApplications: number;
    paymentCompleted: number;
    awaitingVerification: number;
    districtsCovered: number;
    proposedCentres: number;
    approvedCentres: number;
    totalCapacity: number;
    admitCardsPublished: number;
    attendanceSubmitted: number;
    answerKeyChallengesPending: number;
    resultsPublished: number;
    docVerification: number;
    appointmentsIssued: number;
}

export interface SsbData {
    advertisements: Advertisement[];
    applications: Application[];
    profile: Profile;
    kpis: Kpis;
    notifications: PortalNotification[];
    centres: Centre[];
    auditLogs: AuditLog[];
    answerKeyChallenges: Challenge[];
}

export const AUDIT_CHECKLIST = [
    "Computer bypassing / security checks completed?",
    "Examination interface loaded and tested?",
    "System free from unauthorised material that could assist copying?",
    "Functional CCTV available and tested?",
    "Drinking water available?",
    "Generator / power backup or alternative arrangement available?",
    "Computers / devices operational and adequate for allocated candidates?",
    "Network / internet connectivity tested where required?",
    "Seating plan and room arrangement completed?",
    "Candidate identity verification arrangements ready?",
    "Invigilators and support staff arranged?",
    "Fire safety / emergency arrangements available?",
    "Accessible facilities available where required?",
    "Question paper / OMR handling and secure storage arrangements ready?",
    "Clock / timing arrangements and exam instructions displayed?",
    "Any other configured readiness check?",
];

const allYes = Object.fromEntries(AUDIT_CHECKLIST.map((_, i) => [i + 1, "Yes"])) as Record<number, AuditAnswer>;

/** A fresh copy of the sample data (the store keeps its own mutable copy; Reset Data uses this again). */
export const createInitialData = (): SsbData => ({
    advertisements: [
        { id: "ADV-2026-001", title: "Assistant Professor — Computer Science", dept: "Higher Education Dept, Odisha", postCode: "AP-CS-2026", category: "Teaching", vacancies: 12, vacancyBreakup: { UR: 6, OBC: 3, SC: 2, ST: 1 }, openDate: "2026-01-10T10:00", closeDate: "2026-02-28T23:59", fee: 500, feeExemption: "SC/ST/PwD exempted", status: "Open", examMode: "OMR", qualification: "M.Sc./M.Tech in Computer Science with 55% marks", experience: "2 years teaching experience preferred", ageLimit: "21–38 years (relaxation as per rules)", districts: ["Khordha (Bhubaneswar)", "Cuttack", "Ganjam (Berhampur)", "Sambalpur"], docs: ["Photo", "Signature", "PG Degree Certificate", "Experience Certificate"], instructions: "Candidates must bring a printed application and valid ID to the exam centre." },
        { id: "ADV-2026-002", title: "Junior Lecturer — Mathematics", dept: "Higher Education Dept, Odisha", postCode: "JL-MATH-2026", category: "Teaching", vacancies: 8, vacancyBreakup: { UR: 4, OBC: 2, SC: 1, ST: 1 }, openDate: "2026-01-15T10:00", closeDate: "2026-03-10T23:59", fee: 450, feeExemption: "SC/ST/PwD exempted", status: "Open", examMode: "CBT", qualification: "M.Sc. Mathematics with 55% marks", experience: "Freshers eligible", ageLimit: "21–38 years (relaxation as per rules)", districts: ["Khordha (Bhubaneswar)", "Cuttack", "Sundargarh"], docs: ["Photo", "Signature", "PG Degree Certificate"], instructions: "Computer-based test. Report 30 minutes before the exam with a valid photo ID." },
        { id: "ADV-2026-003", title: "Lab Assistant — Physics", dept: "Higher Education Dept, Odisha", postCode: "LA-PHY-2026", category: "Non-Teaching", vacancies: 5, vacancyBreakup: { UR: 3, OBC: 1, SC: 1, ST: 0 }, openDate: "2026-02-01T10:00", closeDate: "2026-03-20T23:59", fee: 350, feeExemption: "SC/ST/PwD exempted", status: "Open", examMode: "OMR", qualification: "B.Sc. Physics", experience: "Lab experience preferred", ageLimit: "18–38 years", districts: ["Khordha (Bhubaneswar)", "Ganjam (Berhampur)"], docs: ["Photo", "Signature", "Degree Certificate"], instructions: "Shortlisted candidates take a practical skill test after the written exam." },
        { id: "ADV-2026-004", title: "Assistant Professor — English", dept: "Higher Education Dept, Odisha", postCode: "AP-ENG-2026", category: "Teaching", vacancies: 10, vacancyBreakup: { UR: 5, OBC: 3, SC: 1, ST: 1 }, openDate: "2025-12-01T10:00", closeDate: "2026-01-15T23:59", fee: 500, feeExemption: "SC/ST/PwD exempted", status: "Closed", examMode: "OMR", qualification: "M.A. English with 55% marks", experience: "2 years teaching preferred", ageLimit: "21–38 years", districts: ["Khordha (Bhubaneswar)", "Cuttack"], docs: ["Photo", "Signature", "PG Degree Certificate", "Experience Certificate"], instructions: "Applications closed." },
    ],
    applications: [
        { id: "APP-1001", advId: "ADV-2026-001", candidateId: "CAND-2001", name: "Ananya Mohapatra", post: "Assistant Professor — Computer Science", status: "Payment Completed", payment: "Successful", submitted: "2026-01-20", zone: "Khordha (Bhubaneswar)", rollNo: "SSB-R-10234", centre: "SSB Exam Centre, Bhubaneswar", attendance: "Present", daStatus: "—", remarks: "—", scrutiny: "Pending", docVerification: "Pending", finalMerit: "—", appointment: "Not Initiated" },
        { id: "APP-1002", advId: "ADV-2026-002", candidateId: "CAND-2001", name: "Ananya Mohapatra", post: "Junior Lecturer — Mathematics", status: "Submitted", payment: "Pending", submitted: "2026-01-25", zone: "Cuttack", rollNo: "—", centre: "—", attendance: "—", daStatus: "—", remarks: "Payment pending", scrutiny: "—", docVerification: "—", finalMerit: "—", appointment: "—" },
        { id: "APP-1003", advId: "ADV-2026-001", candidateId: "CAND-2002", name: "Rakesh Panda", post: "Assistant Professor — Computer Science", status: "Payment Completed", payment: "Successful", submitted: "2026-01-18", zone: "Cuttack", rollNo: "SSB-R-10235", centre: "SSB Exam Centre, Cuttack", attendance: "Absent", daStatus: "—", remarks: "Marked absent by centre", scrutiny: "Pending", docVerification: "Pending", finalMerit: "—", appointment: "—" },
        { id: "APP-1004", advId: "ADV-2026-003", candidateId: "CAND-2003", name: "Priya Sahoo", post: "Lab Assistant — Physics", status: "Payment Completed", payment: "Successful", submitted: "2026-02-05", zone: "Khordha (Bhubaneswar)", rollNo: "SSB-R-10236", centre: "SSB Exam Centre, Bhubaneswar", attendance: "Present", daStatus: "—", remarks: "—", scrutiny: "Pending", docVerification: "Pending", finalMerit: "—", appointment: "—" },
    ],
    profile: {
        name: "Ananya Mohapatra", candidateId: "CAND-2001", username: "ananya.m", email: "ananya.m@example.com",
        mobile: "98XXXXXX12", dob: "1995-06-15", gender: "Female", category: "General", nationality: "Indian",
        qualification: "M.Sc. Computer Science", experience: "2 years teaching", district: "Khordha", state: "Odisha",
        pin: "751024", address: "Plot 12, Saheed Nagar, Bhubaneswar", profileComplete: 85,
        education: [{ level: "M.Sc.", course: "Computer Science", board: "Utkal University", year: "2018", marks: "82%" }],
        documents: [{ type: "Photo", status: "Uploaded" }, { type: "Signature", status: "Uploaded" }, { type: "PG Degree Certificate", status: "Pending" }],
    },
    kpis: {
        activeAds: 3, registeredCandidates: 1240, submittedApplications: 980, paymentCompleted: 870,
        awaitingVerification: 112, districtsCovered: 22, proposedCentres: 48, approvedCentres: 35,
        totalCapacity: 12500, admitCardsPublished: 620, attendanceSubmitted: 0,
        answerKeyChallengesPending: 14, resultsPublished: 0, docVerification: 45, appointmentsIssued: 0,
    },
    notifications: [
        { id: 1, msg: "Application APP-1001 submitted successfully", read: false, date: "2026-01-20" },
        { id: 2, msg: "Answer key challenge window opens on 15 Feb 2026", read: false, date: "2026-02-10" },
        { id: 3, msg: "Admit card published for ADV-2026-001", read: true, date: "2026-02-12" },
    ],
    centres: [
        {
            id: "CTR-01", name: "SSB Exam Centre, Bhubaneswar", district: "Khordha", zone: "Bhubaneswar", rooms: 5, capacity: 250, computers: 200, auditStatus: "Approved", approvalStatus: "Approved",
            audit: { auditor: "Centre Superintendent", date: "2026-02-08", status: "Approved", items: { ...allYes }, remarksByItem: { 1: "Security checks completed", 4: "CCTV tested at all rooms" }, remarks: "All checks passed.", undertaking: true, reviewedBy: "District Officer", reviewDate: "2026-02-09", reviewRemarks: "Approved after review." },
        },
        {
            id: "CTR-02", name: "SSB Exam Centre, Cuttack", district: "Cuttack", zone: "Cuttack", rooms: 4, capacity: 180, computers: 150, auditStatus: "Submitted", approvalStatus: "Under Review",
            audit: { auditor: "Centre Superintendent", date: "2026-02-09", status: "Submitted", items: { ...allYes, 6: "No", 13: "Not Applicable" }, remarksByItem: { 6: "Generator backup under repair — corrective action pending" }, remarks: "Generator backup under repair — corrective action pending.", undertaking: true, reviewedBy: "—", reviewDate: "—", reviewRemarks: "—" },
        },
        {
            id: "CTR-03", name: "SSB Exam Centre, Berhampur", district: "Ganjam", zone: "Berhampur", rooms: 3, capacity: 120, computers: 100, auditStatus: "Draft", approvalStatus: "Needs Update",
            audit: { auditor: "Centre Superintendent", date: "—", status: "Draft", items: {}, remarksByItem: {}, remarks: "Draft audit — not yet submitted.", undertaking: false, reviewedBy: "—", reviewDate: "—", reviewRemarks: "—" },
        },
    ],
    auditLogs: [
        { id: "AUD-001", dt: "2026-02-10 09:12", user: "admin (SSB)", action: "Published advertisement ADV-2026-001", module: "Advertisement", outcome: "Success" },
        { id: "AUD-002", dt: "2026-02-10 10:45", user: "candidate (CAND-2001)", action: "Submitted application APP-1001", module: "Application", outcome: "Success" },
        { id: "AUD-003", dt: "2026-02-10 11:30", user: "centre (CS-01)", action: "Submitted centre audit checklist", module: "Centre Audit", outcome: "Recorded" },
        { id: "AUD-004", dt: "2026-02-11 14:20", user: "district (DS-01)", action: "Approved centre audit CTR-01", module: "Centre Audit", outcome: "Success" },
    ],
    answerKeyChallenges: [
        { id: "CH-01", candidate: "CAND-2001", advId: "ADV-2026-001", questionNo: 12, subject: "Computer Science", provisional: "B", challenged: "C", status: "Under Expert Review", fee: 100 },
        { id: "CH-02", candidate: "CAND-2002", advId: "ADV-2026-001", questionNo: 24, subject: "Computer Science", provisional: "A", challenged: "D", status: "Submitted", fee: 100 },
    ],
});
