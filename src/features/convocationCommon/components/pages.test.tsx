import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleContext, makeRoleValue } from '@/shared/ssb/SsbStore';
import { ROLES } from '@/shared/ssb/roles';
import { ModuleContent } from './ModuleContent';
import { useModulePage } from '../hooks/useModulePage';
import { moduleService, readData } from '../services/store';
import { validatePage } from '../validation/validatePage';
import type { PageDefinition } from '../types';

const modules = import.meta.glob<{ definition: PageDefinition }>('../../convocation*/form-config/*FormConfig.ts', { eager: true });
const definitions = Object.values(modules).map(module => module.definition).filter(Boolean);
function Harness({ definition }: { definition: PageDefinition }) {
  const controller = useModulePage(definition, moduleService(definition.key), (fields, values, draft) => validatePage(definition.key, fields, values, draft));
  return <ModuleContent controller={controller} />;
}
function mount(definition: PageDefinition, roleKey = definition.writers[0] ?? definition.roles[0]) {
  const label = ROLES.find(r => r.key === roleKey)!.label;
  return render(<MemoryRouter><RoleContext.Provider value={makeRoleValue(label, () => undefined)}><Harness definition={definition} /></RoleContext.Provider></MemoryRouter>);
}
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('min-width'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }));
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('Convocation SRS pages', () => {
  it.each(definitions.map(def => [def.title, def] as const))('renders %s with its card form and list', (_title, definition) => {
    mount(definition);
    expect(screen.getByRole('heading', { name: definition.title, level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0);
    if (definition.writers.length && !definition.readOnly) expect(screen.getByRole('button', { name: definition.draft ? 'Final Submit' : definition.key === 'communications' ? 'Send' : 'Submit / Save' })).toBeInTheDocument();
  });
  it('opens verification details in a modal with application history', () => {
    mount(definitions.find(def => def.key === 'verification')!);
    fireEvent.click(screen.getByRole('button', { name: 'View Ananya Mishra' }));
    const dialog = screen.getByRole('dialog', { name: 'View Application Verification' });
    expect(within(dialog).getByRole('textbox', { name: 'Student Name' })).toBeDisabled();
    expect(within(dialog).getByRole('table', { name: 'Application History' })).toBeInTheDocument();
  });
  it('does not expose write controls to College Admin', () => {
    mount(definitions.find(def => def.key === 'students')!, 'college');
    expect(screen.queryByRole('button', { name: 'Submit / Save' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import Students' })).not.toBeInTheDocument();
  });
  it('submits the student draft through the form and locks the saved application', async () => {
    mount(definitions.find(def => def.key === 'registration')!);
    fireEvent.click(screen.getByRole('button', { name: 'Final Submit' }));
    await waitFor(() => expect(readData().applications[0].status).toBe('Submitted'));
    expect(screen.queryByRole('button', { name: 'Edit Aarav Das' })).not.toBeInTheDocument();
  });
});
