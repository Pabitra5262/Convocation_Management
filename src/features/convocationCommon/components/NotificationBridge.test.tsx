import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { RoleContext, SsbProvider, makeRoleValue, useSsb } from '@/shared/ssb/SsbStore';
import { NotificationBridge } from './NotificationBridge';
import { eventService } from '@/features/convocationEvents/services/eventService';
import { readData, saveRecord } from '../services/store';

beforeEach(() => localStorage.clear());
function ExistingBellHarness() {
  const ssb = useSsb();
  return <><span>{ssb.data.notifications.map(n => n.msg).join('; ')}</span><button onClick={() => ssb.update(data => { data.notifications.forEach(n => { n.read = true; }); })}>Read All</button></>;
}
it('supplies scoped notices to the existing header store and persists read state', async () => {
  const eventData = eventService.load(); const data = readData();
  saveRecord('registration', data.applications[0].values, { key:'candidate',label:'Student',studentId:data.students[0].id,institutionId:eventData.institutions[0].id }, data.applications[0].id);
  render(<SsbProvider><RoleContext.Provider value={makeRoleValue('Student', () => undefined)}><NotificationBridge><ExistingBellHarness /></NotificationBridge></RoleContext.Provider></SsbProvider>);
  expect(await screen.findByText(/submitted successfully/)).toBeInTheDocument();
  expect(screen.queryByText(/requires verification/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Read All' }));
  await waitFor(() => expect(readData().notifications.find(n => n.values.studentId === data.students[0].id)?.values.read).toBe(true));
});
