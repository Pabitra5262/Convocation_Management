import { moduleService } from '@/features/convocationCommon/services/store';
import { universityProgressRows } from './hedDemoData';
export const service = { ...moduleService('hed'), read: universityProgressRows };

