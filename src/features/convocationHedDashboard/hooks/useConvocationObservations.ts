import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/observationsFormConfig';
import { service } from '../services/observationsService';
import { validate } from '../validation/observationsValidation';
import { useEffect } from 'react';
import { ensureHedDemoData } from '../services/hedDemoData';
export const usePage = () => {
  const controller = useModulePage(definition, service, validate);
  useEffect(ensureHedDemoData, []);
  return controller;
};

