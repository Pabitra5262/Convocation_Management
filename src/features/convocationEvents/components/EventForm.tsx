import { useMemo, useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCcw, X } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/shared/components/layout/Card';
import { Button, DialogModal, FormGenerator, Input, Modal } from '@/shared/components/ui';
import { eventFormConfig } from '../form-config/eventFormConfig';
import { eventSchema } from '../validation/eventValidation';
import { RegistrationToggle } from './RegistrationToggle';
import { EMPTY_EVENT, type ConvocationEvent, type ConvocationEventValues, type Institution } from '../types';

interface Props {
  inline?: boolean;
  readOnly?: boolean;
  event?: ConvocationEvent;
  events: ConvocationEvent[];
  institutions: Institution[];
  onSave: (values: ConvocationEventValues, id?: string) => boolean;
  onBack: () => void;
  onAddInstitution: (name: string) => boolean;
}
export const EventForm = ({ event, events, institutions, onSave, onBack, onAddInstitution, inline = false, readOnly = false }: Props) => {
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [adding, setAdding] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const defaults = useMemo(() => readOnly
    ? Object.fromEntries(Object.entries(event ?? EMPTY_EVENT).map(([name, value]) => [`view_${name}`, value]))
    : { ...(event ?? EMPTY_EVENT) }, [event, readOnly]);
  const fields = useMemo(() => eventFormConfig(institutions, event?.academicYear).map(field => {
    const configured = readOnly ? { ...field, name: `view_${field.name}`, disabled: true, readOnly: true } : field;
    return field.name === 'registrationOpen' ? {
      ...configured,
      render: (value: unknown, onChange: (value: boolean) => void, error?: string) =>
        <RegistrationToggle checked={value === true} onChange={onChange} disabled={readOnly} error={error} gridColumn={configured.gridColumn} />,
    } : configured;
  }), [institutions, event?.academicYear, readOnly]);
  const schema = useMemo(() => eventSchema(events, institutions, event), [events, institutions, event]);
  useBeforeUnload(e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  return <>
    <Card>
      <CardHeader title={readOnly ? 'Event Details' : event ? 'Edit Convocation Event' : inline ? 'Create Convocation Event' : 'Event Details'} divider
        actions={!readOnly && <Button variant="outline" size="sm" leftIcon={Plus} onClick={() => setAdding(true)}>Add Institution</Button>} />
      <CardBody>
        {!institutions.length && <p className="mb-4 text-sm text-muted-foreground" role="status">No institutions are configured. Add your participating institutions before saving.</p>}
        <FormGenerator fields={fields} defaultValues={defaults} validationSchema={readOnly ? undefined : schema} gridColumns={12}
          onValuesChange={readOnly ? undefined : values => setDirty(JSON.stringify(values) !== JSON.stringify(defaults))}
          onSubmit={values => { if (!readOnly && onSave(values as unknown as ConvocationEventValues, event?.id)) onBack(); }} buttonClassName="!justify-start border-t border-border pt-4">
          <Button variant="outline" leftIcon={readOnly || (inline && event) ? X : inline ? RotateCcw : ArrowLeft} onClick={() => dirty ? setDiscard(true) : onBack()}>{readOnly ? 'Close' : inline ? event ? 'Cancel' : 'Reset' : 'Back'}</Button>
          {!readOnly && <Button type="submit" action="save">{event ? 'Save Changes' : 'Submit / Save'}</Button>}
        </FormGenerator>
      </CardBody>
    </Card>
    <DialogModal isOpen={discard} onClose={() => setDiscard(false)} onConfirm={onBack} title="Discard changes?"
      message="Your unsaved event changes will be discarded." confirmText="Discard Changes" type="warning" />
    <Modal isOpen={adding} onClose={() => setAdding(false)} title="Add Participating Institution" size="md">
      <form onSubmit={e => { e.preventDefault(); if (onAddInstitution(institutionName)) { setAdding(false); setInstitutionName(''); } }}>
        <Input label="Institution Name" required value={institutionName} maxLength={200} onChange={e => setInstitutionName(e.target.value)} placeholder="Enter the institution name" />
        <div className="mt-5 flex justify-start gap-2 border-t border-border pt-4"><Button variant="outline" leftIcon={X} onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" leftIcon={Plus} disabled={!institutionName.trim()}>Add Institution</Button></div>
      </form>
    </Modal>
  </>;
};
