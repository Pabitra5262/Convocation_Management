import type { ComponentType } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui';
import { useRole } from '@/shared/ssb/SsbStore';
import { modulePages } from '../navigation/pages';
import { moduleSections } from '../navigation/sections';
import { EmbeddedScreenContext } from './ScreenContext';

export interface ScreenSection { key: string; label: string; Component: ComponentType; showByDefault?: boolean; alternativeTo?: string }
export function SrsScreen({ screenKey, sections }: { screenKey: string; sections: ScreenSection[] }) {
  const { roleKey } = useRole();
  const [params, setParams] = useSearchParams();
  const screen = modulePages.find(item => item.key === screenKey)!;
  const available = sections.filter(section => moduleSections.find(item => item.key === section.key)?.roles.includes(roleKey));
  const selected = available.find(section => section.key === params.get('section'));
  const visible = selected ? [selected] : available.filter(section => section.showByDefault !== false
    && (!section.alternativeTo || !available.some(item => item.key === section.alternativeTo)));
  return <>
    <PageHeader title={screen.title} breadcrumbs={[{ label: 'Convocation' }, { label: screen.title }]} />
    <EmbeddedScreenContext.Provider value={true}>
      {selected && <Button variant="outline" className="mb-5" leftIcon={ArrowLeft}
        onClick={() => setParams(current => { const next = new URLSearchParams(current); next.delete('section'); return next; })}>Back to {screen.title}</Button>}
      {visible.length ? visible.map(section => <div key={`${roleKey}-${section.key}`} className="mb-5"><section.Component /></div>)
        : <p role="alert">This screen is not available for your role.</p>}
    </EmbeddedScreenContext.Provider>
  </>;
}
