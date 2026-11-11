import { Content } from '../components/auditContent';
import { usePage } from '../hooks/useConvocationAudit';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

