import { Content } from '../components/progressContent';
import { usePage } from '../hooks/useConvocationUniversityProgress';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

