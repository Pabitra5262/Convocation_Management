import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/certificatesFormConfig';
import { service } from '../services/certificatesService';
import { validate } from '../validation/certificatesValidation';
export const usePage = () => useModulePage(definition, service, validate);

