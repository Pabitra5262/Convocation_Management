import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/hedFormConfig';
import { service } from '../services/hedService';
import { validate } from '../validation/hedValidation';
export const usePage = () => useModulePage(definition, service, validate);

