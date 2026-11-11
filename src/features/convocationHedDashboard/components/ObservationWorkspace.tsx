import { Content } from '../components/observationsContent';
import { usePage } from '../hooks/useConvocationObservations';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

