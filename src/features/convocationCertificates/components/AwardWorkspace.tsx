import { Content } from '../components/awardsContent';
import { usePage } from '../hooks/useConvocationAwards';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

