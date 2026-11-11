import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/reportsFormConfig';
import { service } from '../services/reportsService';
import { validate } from '../validation/reportsValidation';
export const usePage = () => useModulePage(definition, service, validate);

