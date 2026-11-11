import { Content } from '../components/participationContent';
import { usePage } from '../hooks/useConvocationParticipation';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

