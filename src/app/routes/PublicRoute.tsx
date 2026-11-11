import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { routes } from "./routeConfig";
import type { RootState } from "../../app/store";

const PublicRoute = () => {
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && isAuthenticated) {
            navigate(routes.dashboard.path, { replace: true });
        }
    }, [token, isAuthenticated, navigate]);

    return <Outlet />;
};

export default PublicRoute;
