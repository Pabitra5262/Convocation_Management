import { modulePages } from '@/features/convocationCommon/navigation/pages';
/* Convocation routes. Dashboard remains a redirect for existing home links. */
export const routes = {
    ...Object.fromEntries(modulePages.map(page => [page.key, { path: page.path, label: page.title, protected: true }])),
    login: { path: "/login", label: "Login", protected: false },
    dashboard: { path: "/dashboard", label: "Dashboard", protected: true },
    convocation: { path: "/convocation", label: "Convocation", protected: true },
    convocationEvents: { path: "/convocation/events", label: "Convocation Configuration", protected: true },
    convocationEventCreate: { path: "/convocation/events/create", label: "Create Convocation Event", protected: true },
    convocationEventDetail: { path: "/convocation/events/:eventId", label: "Convocation Event", protected: true },
    convocationEventEdit: { path: "/convocation/events/:eventId/edit", label: "Edit Convocation Event", protected: true },
};
