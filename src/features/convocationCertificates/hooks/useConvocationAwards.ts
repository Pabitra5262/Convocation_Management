import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/awardsFormConfig';
import { service } from '../services/awardsService';
import { validate } from '../validation/awardsValidation';
import { useEffect } from 'react';
import { ensureCertificateDemoData } from '../services/certificateDemoData';
export const usePage = () => {
  const controller = useModulePage(definition, service, validate);
  useEffect(ensureCertificateDemoData, []);
  return controller;
};

