import { eventService } from '@/features/convocationEvents/services/eventService';
import { readData, readRows, saveRecord, subscribe } from '@/features/convocationCommon/services/store';
import { downloadDocument } from '@/features/convocationCommon/services/documents';
import type { Actor, PageContext, Values } from '@/features/convocationCommon/types';

export const registrationService = {
  load: () => ({ data: readData(), ...eventService.load() }),
  subscribe,
  read: (context: PageContext) => readRows('registration', context),
  save: (values: Values, actor: Actor, id?: string, draft = false) => saveRecord('registration', values, actor, id, draft),
  downloadAcknowledgement: (id: string, actor: Actor) => downloadDocument(id, 'acknowledgement', actor),
};

