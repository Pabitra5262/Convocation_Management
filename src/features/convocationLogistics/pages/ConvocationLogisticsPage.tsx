import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import LogisticsWorkspace from '../components/LogisticsWorkspace';
import InvitationWorkspace from '../components/InvitationWorkspace';

const sections = [
  { key: 'logistics', label: 'Seating & Logistics', Component: LogisticsWorkspace },
  { key: 'invitations', label: 'Invitations & Entry Passes', Component: InvitationWorkspace },
];
export default function ConvocationLogisticsPage() {
  return <SrsScreen screenKey="logistics" sections={sections} />;
}

