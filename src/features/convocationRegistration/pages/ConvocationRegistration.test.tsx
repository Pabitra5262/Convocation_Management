import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleContext, makeRoleValue } from '@/shared/ssb/SsbStore';
import { readData } from '@/features/convocationCommon/services/store';
import ConvocationRegistrationPage from './ConvocationRegistrationPage';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('min-width'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());
const mount = () => render(<MemoryRouter><RoleContext.Provider value={makeRoleValue('Student', () => undefined)}><ConvocationRegistrationPage /></RoleContext.Provider></MemoryRouter>);

describe('Registration feature components', () => {
  it('renders explicit form-config fields and submits the saved draft', async () => {
    mount();
    expect(screen.getByLabelText(/Branch \/ Specialization/)).toBeDisabled();
    expect(screen.getByLabelText(/Student Name/, { selector: 'input' })).toHaveValue('Aarav Das');
    fireEvent.click(screen.getByRole('button', { name: 'Final Submit' }));
    await waitFor(() => expect(readData().applications[0].status).toBe('Submitted'));
    expect(screen.queryByRole('button', { name: 'Edit Registration Aarav Das' })).not.toBeInTheDocument();
  });
  it('saves partial contact changes as a draft without creating duplicates', async () => {
    mount();
    fireEvent.change(screen.getByLabelText(/Email ID/), { target: { value: 'updated@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }));
    await waitFor(() => expect(readData().applications[0].values.email).toBe('updated@example.test'));
    expect(readData().applications.filter(app => app.values.studentId === 'demo-student-1')).toHaveLength(1);
    expect(readData().applications[0].status).toBe('Draft');
  });
  it('opens the registration form data and history in a read-only modal', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'View Aarav Das' }));
    const modal = screen.getByRole('dialog', { name: 'View Student Registration' });
    expect(within(modal).getByLabelText(/Student Name/)).toHaveValue('Aarav Das');
    expect(within(modal).getByLabelText(/Student Name/)).toBeDisabled();
    expect(within(modal).getByRole('table', { name: 'Application History' })).toBeInTheDocument();
  });
  it('loads Edit into the top form without an unnecessary filter panel', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Registration Aarav Das' }));
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Show filters|Hide filters/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Filters' })).not.toBeInTheDocument();
  });
});
