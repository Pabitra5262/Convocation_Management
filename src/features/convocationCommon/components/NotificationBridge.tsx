import { useEffect, useState, type ReactNode } from 'react';
import { useRole, useSsb } from '@/shared/ssb/SsbStore';
import { processDueCommunications, readData, subscribe, updateData } from '../services/store';

/** Supplies Convocation notices to the existing header without changing its UI. */
export function NotificationBridge({ children }: { children: ReactNode }) {
  const { roleKey, role } = useRole();
  const { update, data: ssbData } = useSsb();
  const [snapshot, setSnapshot] = useState(readData);
  useEffect(() => {
    const unsubscribe = subscribe(() => setSnapshot(readData()));
    processDueCommunications();
    const timer = window.setInterval(processDueCommunications, 30000);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, []);
  const studentId = snapshot.students[0]?.id ?? '';
  const notices = snapshot.notifications.filter(n => n.values.audience === roleKey && (roleKey !== 'candidate' || n.values.studentId === studentId));
  const serialized = JSON.stringify(notices.map(n => ({ id: Number(n.id), msg: String(n.values.title), read: n.values.read === true, date: String(n.values.date) })));
  useEffect(() => { update(data => { data.notifications = JSON.parse(serialized); }); }, [serialized, update]);
  useEffect(() => {
    const readIds = ssbData.notifications.filter(n => n.read && snapshot.notifications.some(original => original.id === String(n.id) && original.values.audience === roleKey && !original.values.read)).map(n => String(n.id));
    if (!readIds.length) return;
    updateData({ key: roleKey, label: role, studentId, institutionId: '' }, 'Read notifications', data => data.notifications.forEach(n => { if (readIds.includes(n.id)) { n.values.read = true; n.status = 'Read'; } }));
  }, [ssbData.notifications, snapshot.notifications, roleKey, role, studentId]);
  return children;
}
