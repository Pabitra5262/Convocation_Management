import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/verificationFormConfig';
import { service } from '../services/verificationService';
import { validate } from '../validation/verificationValidation';
export const usePage = () => useModulePage(definition, service, validate);

