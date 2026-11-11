import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/communicationsFormConfig';
import { service } from '../services/communicationsService';
import { validate } from '../validation/communicationsValidation';
export const usePage = () => useModulePage(definition, service, validate);

