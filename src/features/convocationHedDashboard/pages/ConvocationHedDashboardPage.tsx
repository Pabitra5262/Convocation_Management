import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import HedDashboardWorkspace from '../components/HedDashboardWorkspace';
import UniversityProgress from '../components/UniversityProgress';
import ObservationWorkspace from '../components/ObservationWorkspace';

const sections = [
  { key: 'hed', label: 'HED Dashboard', Component: HedDashboardWorkspace },
  { key: 'progress', showByDefault: false, label: 'University Progress', Component: UniversityProgress },
  { key: 'observations', label: 'Observations & Responses', Component: ObservationWorkspace },
];
export default function ConvocationHedDashboardPage() {
  return <SrsScreen screenKey="hed" sections={sections} />;
}

