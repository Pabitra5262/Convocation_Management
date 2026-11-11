import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/participationFormConfig';
import { service } from '../services/participationService';
import { validate } from '../validation/participationValidation';
export const usePage = () => useModulePage(definition, service, validate);

