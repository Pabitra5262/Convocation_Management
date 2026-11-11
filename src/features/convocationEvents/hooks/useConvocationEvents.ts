import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { eventService } from '../services/eventService';
import type { ConvocationEventValues, EventStore } from '../types';

export const useConvocationEvents = () => {
  const [initial] = useState(() => {
    try { return { data: eventService.load(), error: '' }; }
    catch (e) { return { data: { events: [], institutions: [] } as EventStore, error: e instanceof Error ? e.message : 'Unable to load convocation data' }; }
  });
  const [data, setData] = useState<EventStore>(initial.data);
  const [error, setError] = useState(initial.error);
  const refresh = useCallback(() => {
    try { setData(eventService.load()); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load convocation data'); }
  }, []);
  useEffect(() => {
    const listener = () => refresh();
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [refresh]);
  const perform = (action: () => EventStore, message: string) => {
    try { setData(action()); setError(''); toast.success(message); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Unable to save. Please try again.'); return false; }
  };
  return {
    ...data, error, refresh,
    save: (values: ConvocationEventValues, id?: string) => perform(() => eventService.save(values, id), id ? 'Convocation event updated' : 'Convocation event created'),
    toggle: (id: string) => perform(() => eventService.toggle(id), 'Registration setting updated'),
    addInstitution: (name: string) => perform(() => eventService.addInstitution(name), 'Institution added'),
  };
};
