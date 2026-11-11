import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/logisticsFormConfig';
import { service } from '../services/logisticsService';
import { validate } from '../validation/logisticsValidation';
export const usePage = () => useModulePage(definition, service, validate);

