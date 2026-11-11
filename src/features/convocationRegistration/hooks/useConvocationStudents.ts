import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/studentsFormConfig';
import { service } from '../services/studentsService';
import { validate } from '../validation/studentsValidation';
export const usePage = () => useModulePage(definition, service, validate);

