import { lazy, type ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/shared/ssb/SsbStore';
import { modulePages, homeForRole } from '@/features/convocationCommon/navigation/pages';
import { NotificationBridge } from '@/features/convocationCommon/components/NotificationBridge';

const Registration = lazy(() => import('@/features/convocationRegistration'));
const Verification = lazy(() => import('@/features/convocationVerification'));
const Certificates = lazy(() => import('@/features/convocationCertificates'));
const Logistics = lazy(() => import('@/features/convocationLogistics'));
const Reports = lazy(() => import('@/features/convocationReports'));
const Communication = lazy(() => import('@/features/convocationCommunication'));
const HedMonitoring = lazy(() => import('@/features/convocationHedDashboard'));

// eslint-disable-next-line react-refresh/only-export-components
export const moduleRoutes = [
  { key: 'registration', Component: Registration },
  { key: 'verification', Component: Verification },
  { key: 'certificates', Component: Certificates },
  { key: 'logistics', Component: Logistics },
  { key: 'reports', Component: Reports },
  { key: 'communications', Component: Communication },
  { key: 'hed', Component: HedMonitoring },
].map(entry => ({ ...modulePages.find(page => page.key === entry.key)!, Component: entry.Component }));

export function ModuleGate({ roles, Component }: { roles: string[]; Component: ComponentType }) {
  const { roleKey } = useRole();
  return roles.includes(roleKey) ? <NotificationBridge key={roleKey}><Component /></NotificationBridge> : <Navigate to={homeForRole(roleKey)} replace />;
}
export function ModuleHome() { const { roleKey } = useRole(); return <Navigate to={homeForRole(roleKey)} replace />; }
export function LegacySectionRedirect({ destination, section }: { destination: string; section: string }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set('section', section);
  return <Navigate to={`${destination}?${params.toString()}`} replace />;
}
