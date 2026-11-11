import { Content } from '../components/communicationsContent';
import { usePage } from '../hooks/useConvocationCommunication';
export default function CommunicationWorkspace() { const controller = usePage(); return <Content controller={controller} />; }


