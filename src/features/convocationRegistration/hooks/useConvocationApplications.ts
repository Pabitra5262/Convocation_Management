import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/applicationsFormConfig';
import { service } from '../services/applicationsService';
import { validate } from '../validation/applicationsValidation';
export const usePage = () => useModulePage(definition, service, validate);

