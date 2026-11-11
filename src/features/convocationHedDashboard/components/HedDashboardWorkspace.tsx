import { Content } from '../components/hedContent';
import { usePage } from '../hooks/useConvocationHedDashboard';
export default function HedDashboardWorkspace() { const controller = usePage(); return <Content controller={controller} />; }


