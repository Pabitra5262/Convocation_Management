import { Content } from '../components/reportsContent';
import { usePage } from '../hooks/useConvocationReports';
export default function ReportsWorkspace() { const controller = usePage(); return <Content controller={controller} />; }


