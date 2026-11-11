import { ModuleContent } from '@/features/convocationCommon/components/ModuleContent';
import type { ModuleController } from '@/features/convocationCommon/hooks/useModulePage';
import { VerificationList } from './VerificationList';
export const Content = ({ controller }: { controller: ModuleController }) => <ModuleContent controller={controller}
  renderList={props => <VerificationList {...props} controller={controller} />} />;

