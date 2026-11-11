import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/progressFormConfig';
import { service } from '../services/progressService';
import { validate } from '../validation/progressValidation';
export const usePage = () => useModulePage(definition, service, validate);

