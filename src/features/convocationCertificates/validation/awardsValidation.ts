import { validatePage } from '@/features/convocationCommon/validation/validatePage';
import type { FormField } from '@/shared/components/ui/Forms';
import type { Values } from '../types';
export const validate = (fields: FormField[], values: Values, draft = false) => validatePage('awards', fields, values, draft);

