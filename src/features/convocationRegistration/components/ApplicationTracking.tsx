import { Content } from '../components/applicationsContent';
import { usePage } from '../hooks/useConvocationApplications';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

