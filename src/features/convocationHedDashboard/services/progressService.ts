import { moduleService } from '@/features/convocationCommon/services/store';
import type { PageContext } from '@/features/convocationCommon/types';
import { universityProgressRows } from './hedDemoData';
export const service = { ...moduleService('progress'), read: (ctx: PageContext) => universityProgressRows(ctx, true) };

