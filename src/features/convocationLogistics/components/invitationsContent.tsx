import { ModuleContent } from '@/features/convocationCommon/components/ModuleContent';
import type { ModuleController } from '@/features/convocationCommon/hooks/useModulePage';
export const Content = ({ controller }: { controller: ModuleController }) => <ModuleContent controller={controller} />;

