import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { NotificationCenter } from '@/shared/components/layout/Header/parts/NotificationCenter';
import type { AppNotification } from '@/shared/components/layout/Header/header.data';

it('keeps the same single bell through repeated unread-count updates', async () => {
  const errors = vi.spyOn(console, 'error');
  const props = { onRead: vi.fn(), onReadAll: vi.fn() };
  const view = render(<NotificationCenter {...props} notifications={[]} />);
  const originalBell = view.container.querySelector('.lucide-bell');
  const notification: AppNotification = { id: '1', title: 'Registration submitted', createdAt: new Date().toISOString(), read: false, category: 'Convocation', tone: 'info' };
  view.rerender(<NotificationCenter {...props} notifications={[notification]} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument());
  expect(view.container.querySelectorAll('.lucide-bell')).toHaveLength(1);
  expect(view.container.querySelectorAll('.hdr-count')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument();
  for (let count = 2; count <= 5; count++) {
    view.rerender(<NotificationCenter {...props} notifications={Array.from({ length: count }, (_, i) => ({ ...notification, id: String(i) }))} />);
    expect(view.container.querySelectorAll('.lucide-bell')).toHaveLength(1);
    expect(view.container.querySelector('.lucide-bell')).toBe(originalBell);
    expect(view.container.querySelectorAll('.hdr-count')).toHaveLength(1);
  }
  view.rerender(<NotificationCenter {...props} notifications={[{ ...notification, read: true }]} />);
  await waitFor(() => expect(view.container.querySelectorAll('.hdr-count')).toHaveLength(0));
  expect(view.container.querySelectorAll('.lucide-bell')).toHaveLength(1);
  expect(errors.mock.calls.some(call => String(call[0]).includes('same key'))).toBe(false);
  errors.mockRestore();
});
