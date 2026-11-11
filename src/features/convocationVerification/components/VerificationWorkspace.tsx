import { Content } from '../components/verificationContent';
import { usePage } from '../hooks/useConvocationVerification';
export default function VerificationWorkspace() { const controller = usePage(); return <Content controller={controller} />; }


