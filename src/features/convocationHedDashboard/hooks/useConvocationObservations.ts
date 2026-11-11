import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/observationsFormConfig';
import { service } from '../services/observationsService';
import { validate } from '../validation/observationsValidation';
export const usePage = () => useModulePage(definition, service, validate);

