import { Content } from '../components/approvalsContent';
import { usePage } from '../hooks/useConvocationApprovals';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

