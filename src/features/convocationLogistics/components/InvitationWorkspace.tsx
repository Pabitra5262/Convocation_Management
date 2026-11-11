import { Content } from '../components/invitationsContent';
import { usePage } from '../hooks/useConvocationInvitations';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

