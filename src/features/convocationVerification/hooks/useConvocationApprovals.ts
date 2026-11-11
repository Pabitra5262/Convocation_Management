import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/approvalsFormConfig';
import { service } from '../services/approvalsService';
import { validate } from '../validation/approvalsValidation';
export const usePage = () => useModulePage(definition, service, validate);

