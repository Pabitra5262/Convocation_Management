import { SrsScreen } from '@/features/convocationCommon/components/SrsScreen';
import VerificationWorkspace from '../components/VerificationWorkspace';
import ApprovalWorkspace from '../components/ApprovalWorkspace';

const sections = [
  { key: 'verification', label: 'Verification', Component: VerificationWorkspace },
  { key: 'approvals', alternativeTo: 'verification', label: 'Approval & Award Lists', Component: ApprovalWorkspace },
];
export default function ConvocationVerificationPage() {
  return <SrsScreen screenKey="verification" sections={sections} />;
}

