import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import ReportsWorkspace from '../components/ReportsWorkspace';
import ParticipationWorkspace from '../components/ParticipationWorkspace';
import AuditWorkspace from '../components/AuditWorkspace';

const sections = [
  { key: 'reports', label: 'Participation & MIS', Component: ReportsWorkspace },
  { key: 'participation', alternativeTo: 'reports', label: 'My Participation', Component: ParticipationWorkspace },
  { key: 'audit', showByDefault: false, label: 'Audit Trail', Component: AuditWorkspace },
];
export default function ConvocationReportsPage() {
  return <SrsScreen screenKey="reports" sections={sections} />;
}

