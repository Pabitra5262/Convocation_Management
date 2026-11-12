import { ModuleContent } from '@/features/convocationCommon/components/ModuleContent';
import type { ModuleController } from '@/features/convocationCommon/hooks/useModulePage';
import { HedSummary } from './HedSummary';
export const Content = ({ controller }: { controller: ModuleController }) => <ModuleContent controller={controller} summary={<HedSummary records={controller.shown} />} />;

