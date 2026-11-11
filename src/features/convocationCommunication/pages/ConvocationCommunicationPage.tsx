import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import CommunicationWorkspace from '../components/CommunicationWorkspace';

const sections = [
  { key: 'communications', label: 'Communication', Component: CommunicationWorkspace },
];
export default function ConvocationCommunicationPage() {
  return <SrsScreen screenKey="communications" sections={sections} />;
}

