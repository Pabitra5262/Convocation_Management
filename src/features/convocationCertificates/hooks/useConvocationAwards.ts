import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/awardsFormConfig';
import { service } from '../services/awardsService';
import { validate } from '../validation/awardsValidation';
export const usePage = () => useModulePage(definition, service, validate);

