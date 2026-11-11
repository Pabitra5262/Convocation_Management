import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "@/shared/ssb/SsbStore";
import { canOpen, type PageKey } from "@/shared/ssb/roles";

/**
 * Opens the page only for roles that have it in their menu (SSB_Portal.html ROLE_NAV);
 * any other role (e.g. after switching role in the header) goes back to the dashboard.
 */
const RoleRoute = ({ page }: { page: PageKey }) => {
    const { role } = useRole();
    return canOpen(role, page) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RoleRoute;
