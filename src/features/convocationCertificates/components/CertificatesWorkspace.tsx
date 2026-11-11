import { Content } from '../components/certificatesContent';
import { usePage } from '../hooks/useConvocationCertificates';
export default function CertificatesWorkspace() { const controller = usePage(); return <Content controller={controller} />; }


