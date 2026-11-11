import { Navigate, Outlet } from "react-router-dom";
import { getJwtToken } from "@/shared/utils/cookieUtils";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const ProtectedRoute = () => {
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const isAuth = (!!token && isAuthenticated) || !!getJwtToken();

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
