import { Content } from '../components/logisticsContent';
import { usePage } from '../hooks/useConvocationLogistics';
export default function LogisticsWorkspace() { const controller = usePage(); return <Content controller={controller} />; }


