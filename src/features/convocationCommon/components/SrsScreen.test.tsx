import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLES } from '@/shared/ssb/roles';
import { RoleContext, makeRoleValue } from '@/shared/ssb/SsbStore';
import { getMenuItemsForRole } from '@/shared/components/layout/Sidebar/menuItems';
import { modulePages, legacySections } from '../navigation/pages';
import { moduleSections } from '../navigation/sections';
import VerificationPage from '@/features/convocationVerification';
import RegistrationPage from '@/features/convocationRegistration';
import HedPage from '@/features/convocationHedDashboard';
import CertificatesPage from '@/features/convocationCertificates';
import LogisticsPage from '@/features/convocationLogistics';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('min-width'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();

});
afterEach(() => vi.unstubAllGlobals());
function mount(Page: React.ComponentType, role: string, path: string) {
  return render(<MemoryRouter initialEntries={[path]}><RoleContext.Provider value={makeRoleValue(role, () => undefined)}><Page /></RoleContext.Provider></MemoryRouter>);
}
describe('Eight primary SRS screens', () => {
  it('exposes exactly eight main screens and assigns every supporting function to one screen', () => {
    expect(modulePages).toHaveLength(8);
    const assigned = modulePages.flatMap(page => page.sections);
    expect(new Set(assigned).size).toBe(moduleSections.length);
    expect(assigned).toHaveLength(moduleSections.length);
    const menu = getMenuItemsForRole('Super Admin')[0].submenu!;
    expect(menu).toHaveLength(8);
    expect(new Set(menu.map(item => item.path)).size).toBe(8);
    expect(legacySections.every(legacy => modulePages.some(page => page.path === legacy.destination))).toBe(true);
  });
  it('keeps actor permissions on each main menu item', () => {
    ROLES.forEach(role => {
      const entries = getMenuItemsForRole(role.label)[0].submenu!;
      expect(entries.every(entry => modulePages.some(page => page.path === entry.path && page.roles.includes(role.key)))).toBe(true);
    });
  });
  it('uses one verification list with status tabs and no duplicate approval list', () => {
    mount(VerificationPage, 'University Examination Controller', '/convocation/verification');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Application Verification & Approval' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Filter applications by status' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Application Verification' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Approval & Award Lists' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
  it('keeps student registration and application tracking on the same screen', () => {
    mount(RegistrationPage, 'Student', '/convocation/registration');
    expect(screen.getByRole('button', { name: 'Final Submit' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Student Registrations' })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'My Applications' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
  it('opens HED observations as part of the HED screen', () => {
    mount(HedPage, 'HED Officer', '/convocation/hed?section=observations');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to HED Monitoring, Observations & MIS' }));
    expect(screen.getByRole('table', { name: 'HED Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit / Save' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
  it('shows the authority approval list directly', () => {
    mount(VerificationPage, 'Competent Authority', '/convocation/verification');
    expect(screen.getByRole('list', { name: 'Approval & Award Lists' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Filter applications by status' })).toBeInTheDocument();
  });
  it.each([
    ['certificates', CertificatesPage, 'Certificate Management', 'Degree & Medal Management'],
    ['logistics', LogisticsPage, 'Logistics & Seating', 'Invitations & Entry Passes'],
  ] as const)('keeps related %s cards visible without tabs', (key, Page, primary, secondary) => {
    mount(Page, 'Super Admin', '/convocation/' + key);
    expect(screen.getByRole('table', { name: primary })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: secondary })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
