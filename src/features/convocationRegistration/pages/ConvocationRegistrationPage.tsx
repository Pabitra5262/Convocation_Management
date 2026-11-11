import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import RegistrationWorkspace from '../components/RegistrationWorkspace';
import ApplicationTracking from '../components/ApplicationTracking';
import StudentManagement from '../components/StudentManagement';

const sections = [
  { key: 'registration', label: 'Registration', Component: RegistrationWorkspace },
  { key: 'applications', alternativeTo: 'registration', label: 'Application Status', Component: ApplicationTracking },
  { key: 'students', showByDefault: false, label: 'Student Data', Component: StudentManagement },
];
export default function ConvocationRegistrationPage() {
  return <SrsScreen screenKey="registration" sections={sections} />;
}

