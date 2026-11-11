import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/auditFormConfig';
import { service } from '../services/auditService';
import { validate } from '../validation/auditValidation';
export const usePage = () => useModulePage(definition, service, validate);

