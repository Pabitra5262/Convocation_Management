import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { routes } from "./routeConfig";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "@/shared/components/layout/AuthLayout";
import MainLayout from "@/shared/components/layout/MainLayout";
import PublicRoute from "./PublicRoute";
import { LegacySectionRedirect, ModuleGate, ModuleHome, moduleRoutes } from './convocationRoutes';
import { legacySections } from '@/features/convocationCommon/navigation/pages';

const Login = lazy(() => import("@/features/auth/pages/Login"));
const ConvocationConfiguration = lazy(() => import("@/features/convocationEvents"));

const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      void navigate(customEvent.detail);
    };
    window.addEventListener("auth-redirect", handleAuthRedirect);
    return () =>
      window.removeEventListener("auth-redirect", handleAuthRedirect);
  }, [navigate]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 h-16 w-16 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-40" />
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Navigate to={routes.login.path} replace />} />

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={routes.login.path} element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={routes.convocation.path} element={<ModuleHome />} />
            {[routes.convocationEvents, routes.convocationEventCreate, routes.convocationEventDetail, routes.convocationEventEdit].map(route => <Route key={route.path} path={route.path} element={<ModuleGate roles={['admin','exam','college','super']} Component={ConvocationConfiguration} />} />)}
            {moduleRoutes.map(route => <Route key={route.key} path={route.path} element={<ModuleGate roles={route.roles} Component={route.Component} />} />)}
            {legacySections.map(route => <Route key={route.path} path={route.path} element={<LegacySectionRedirect destination={route.destination} section={route.section} />} />)}
            <Route path={routes.dashboard.path} element={<ModuleHome />} />
            <Route path="*" element={<ModuleHome />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

