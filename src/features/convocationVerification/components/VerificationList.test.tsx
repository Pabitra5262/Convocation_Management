import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { RoleContext, makeRoleValue } from '@/shared/ssb/SsbStore';
import { readData } from '@/features/convocationCommon/services/store';
import VerificationPage from '../pages/ConvocationVerificationPage';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', (media: string) => ({ matches: media.includes('min-width'), media, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => vi.unstubAllGlobals());
function mount(role = 'University Examination Controller') {
  render(<MemoryRouter><RoleContext.Provider value={makeRoleValue(role, () => undefined)}><VerificationPage /></RoleContext.Provider></MemoryRouter>);
}
describe('Verification application cards', () => {
  it('filters cards by workflow status and restores all applications', () => {
    mount();
    const list = () => screen.getByRole('list', { name: 'Application Verification' });
    expect(within(list()).getAllByRole('listitem')).toHaveLength(7);
    fireEvent.click(screen.getByRole('tab', { name: /^Correction Required\s*\d+$/ }));
    expect(within(list()).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list()).getByText('Upload a clear photograph.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Correction Required\s*\d+$/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: /^All\s*\d+$/ }));
    expect(within(list()).getAllByRole('listitem')).toHaveLength(7);
    expect(screen.queryByRole('form', { name: 'Filters' })).not.toBeInTheDocument();
  });
  it('opens application details in the existing read-only modal', () => {
    mount();
    fireEvent.click(screen.getByRole('tab', { name: /^Submitted\s*\d+$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'View Details' }));
    const dialog = screen.getByRole('dialog', { name: 'View Application Verification' });
    expect(within(dialog).getByRole('textbox', { name: 'Student Name' })).toBeDisabled();
    expect(within(dialog).getByRole('table', { name: 'Application History' })).toBeInTheDocument();
  });
  it('requires a correction reason and updates the card after submission', async () => {
    mount();
    fireEvent.click(screen.getByRole('tab', { name: /^Submitted\s*\d+$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Request Correction' }));
    const dialog = screen.getByRole('dialog', { name: 'Correction Required' });
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Reason' }), { target: { value: 'Please upload a clearer document.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(readData().applications.find(app => app.id === 'REG-DEMO-2')?.status).toBe('Correction Required'));
    fireEvent.click(screen.getByRole('tab', { name: /^Correction Required\s*\d+$/ }));
    expect(screen.getByText('Please upload a clearer document.')).toBeInTheDocument();
  });
  it('shows approval controls only to the appropriate actor and persists approval', async () => {
    mount('Competent Authority');
    expect(screen.queryByRole('button', { name: 'Mark Verified' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /^Pending Approval\s*\d+$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Approved' })).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(readData().applications.find(app => app.id === 'REG-DEMO-6')?.status).toBe('Approved'));
    expect(screen.getByText('No applications found.')).toBeInTheDocument();
  });
});
