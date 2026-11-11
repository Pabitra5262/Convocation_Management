import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import CertificatesWorkspace from '../components/CertificatesWorkspace';
import AwardWorkspace from '../components/AwardWorkspace';

const sections = [
  { key: 'certificates', label: 'Certificates & Distribution', Component: CertificatesWorkspace },
  { key: 'awards', label: 'Medals & Awards', Component: AwardWorkspace },
];
export default function ConvocationCertificatesPage() {
  return <SrsScreen screenKey="certificates" sections={sections} />;
}

