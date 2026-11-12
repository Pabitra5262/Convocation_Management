import { KpiCard } from '@/shared/components/ui';
import type { RecordRow } from '@/features/convocationCommon/types';

export function HedSummary({ records }: { records: RecordRow[] }) {
  const metrics = [
    ['eligible', 'Eligible'], ['submitted', 'Submitted'], ['pending', 'Pending'],
    ['approved', 'Approved'], ['distributed', 'Distributed'],
  ];
  return <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
    <KpiCard label="Universities" value={new Set(records.map(record => record.values.institutionId)).size} />
    {metrics.map(([key, label]) => <KpiCard key={key} label={label} value={records.reduce((total, record) => total + Number(record.values[key] ?? 0), 0)} />)}
  </div>;
}
