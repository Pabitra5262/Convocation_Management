import { Eye } from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Alert, Badge, Button, Tabs, type BadgeTone } from '@/shared/components/ui';
import type { RecordListProps } from '@/features/convocationCommon/components/ModuleContent';
import type { ModuleController } from '@/features/convocationCommon/hooks/useModulePage';

const statuses = [
  { label: 'All', value: '' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Under Verification', value: 'Under University Verification' },
  { label: 'Correction Required', value: 'Correction Required' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Pending Approval', value: 'Pending Approval' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];
const tone = (status: string): BadgeTone => status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger'
  : status === 'Correction Required' || status === 'Under University Verification' ? 'warning' : 'info';

export function VerificationList({ controller: c, records, actions, onView }: RecordListProps & { controller: ModuleController }) {
  const applicationCards = <>
    <ul className="space-y-3" aria-label={c.definition.title}>
      {records.map(record => <li key={record.id}>
        <Card><CardBody>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 className="font-semibold">{String(record.values.studentName ?? '')}</h2>
                <span className="text-xs text-muted-foreground">{String(record.values.enrolment ?? record.id)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {[record.values.program, c.displayValue('institutionId', record.values.institutionId), record.values.submittedOn ? `Applied: ${c.displayValue('submittedOn', record.values.submittedOn)}` : ''].filter(Boolean).join(' • ')}
              </p>
            </div>
            <Badge tone={tone(record.status)} size="sm" className="shrink-0">{record.status}</Badge>
          </div>
          {record.status === 'Correction Required' && !!record.values.reason && <Alert tone="warning" className="mt-3">{String(record.values.reason)}</Alert>}
          <div className="mt-3 flex flex-wrap justify-start gap-2">
            {actions(record).map(action => <Button key={action.id} size="xs" variant={action.tone === 'danger' ? 'danger' : action.tone === 'success' ? 'success-outline' : action.tone === 'warning' ? 'warning' : 'outline'}
              leftIcon={action.icon} onClick={action.onClick}>{action.label}</Button>)}
            <Button size="xs" variant="ghost" leftIcon={Eye} onClick={() => onView(record)}>View Details</Button>
          </div>
        </CardBody></Card>
      </li>)}
    </ul>
    {!records.length && <Card><CardBody><p className="text-sm text-muted-foreground">No applications found.</p></CardBody></Card>}
  </>;
  return <Card>
    <CardHeader title={c.definition.title} divider />
    <CardBody>
      <Tabs variant="pills" label="Filter applications by status" idPrefix={`verification-${c.definition.key}`}
        activeTab={(c.applied.status || 'all').replaceAll(' ', '-')}
        onChange={key => { const status = statuses.find(item => (item.value || 'all').replaceAll(' ', '-') === key)?.value ?? ''; c.setFilters({ ...c.filters, status }); c.setApplied({ ...c.applied, status }); }}
        tabs={statuses.map(status => ({
          key: (status.value || 'all').replaceAll(' ', '-'), label: status.label,
          count: c.rows.filter(record => !status.value || record.status === status.value).length,
          content: applicationCards,
        }))} />
    </CardBody>
  </Card>;
}
