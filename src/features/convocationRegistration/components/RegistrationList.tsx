import { Download, Pencil } from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Badge, DataTable, type Column } from '@/shared/components/ui';
import type { RecordRow } from '../types';
import type { RegistrationController } from '../hooks/useConvocationRegistration';

export function RegistrationList({ controller }: { controller: RegistrationController }) {
  const columns: Column<RecordRow>[] = [
    { id: 'registrationId', header: 'Registration ID', accessor: row => row.id, sortable: true },
    { id: 'studentName', header: 'Student Name', accessor: row => String(row.values.studentName ?? '') },
    { id: 'enrolment', header: 'Enrolment No.', accessor: row => String(row.values.enrolment ?? '') },
    { id: 'eventName', header: 'Convocation Event', accessor: row => String(row.values.eventName ?? '') },
    { id: 'program', header: 'Program', accessor: row => String(row.values.program ?? '') },
    { id: 'status', header: 'Application Status', accessor: row => row.status, cell: row => <Badge tone={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'danger' : 'info'} dot>{row.status}</Badge> },
    { id: 'feeStatus', header: 'Fee Status', accessor: row => String(row.values.feeStatus ?? '') },
  ];
  return <>
    <Card><CardHeader title="Student Registration List" divider /><CardBody>
      <DataTable className="convocation-events-table" data={controller.rows} columns={columns} rowKey={row => row.id} rowLabel={row => String(row.values.studentName ?? row.id)} caption="Student Registrations" emptyTitle="No registrations found" emptyDescription=""
        actions={{ onView: controller.setViewed, custom: row => [
          ...(['Draft', 'Correction Required'].includes(row.status) ? [{ id: 'edit', label: 'Edit Registration', icon: Pencil, onClick: () => controller.edit(row) }] : []),
          ...(row.status !== 'Draft' ? [{ id: 'acknowledgement', label: 'Download Acknowledgement', icon: Download, onClick: () => void controller.downloadAcknowledgement(row) }] : []),
        ] }} />
    </CardBody></Card>
  </>;
}
