import { X } from 'lucide-react';
import { Button, DataTable, FormGenerator, Modal } from '@/shared/components/ui';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { registrationFormConfig } from '../form-config/registrationFormConfig';
import type { RegistrationController } from '../hooks/useConvocationRegistration';

export function RegistrationDetails({ controller }: { controller: RegistrationController }) {
  const record = controller.viewed;
  const application = controller.data.applications.find(item => item.id === record?.id);
  const fields = registrationFormConfig(controller.context).map(field => ({ ...field, name: `view_${field.name}`, type: 'text' as const, render: undefined, disabled: true, readOnly: true }));
  return <Modal isOpen={!!record} title="View Student Registration" onClose={() => controller.setViewed(null)} size="6xl">
    {record && <>
      <FormGenerator key={record.id} fields={fields} gridColumns={12} defaultValues={Object.fromEntries(registrationFormConfig(controller.context).map(field => [`view_${field.name}`, controller.displayValue(field.name, record.values[field.name])]))} onSubmit={() => undefined} />
      {application && <Card className="mt-5"><CardHeader title="Application History" divider /><CardBody>
        <DataTable data={application.history.map((entry, index) => ({ ...entry, id: String(index) }))} rowKey={entry => entry.id} caption="Application History" columns={[
          { id: 'status', header: 'Status', accessor: entry => entry.status }, { id: 'remark', header: 'Remark', accessor: entry => entry.remark },
          { id: 'actor', header: 'Actor', accessor: entry => entry.actor }, { id: 'date', header: 'Date / Time', accessor: entry => new Date(entry.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
        ]} />
      </CardBody></Card>}
      <div className="mt-5 flex justify-start border-t border-border pt-4"><Button variant="outline" leftIcon={X} onClick={() => controller.setViewed(null)}>Close</Button></div>
    </>}
  </Modal>;
}
