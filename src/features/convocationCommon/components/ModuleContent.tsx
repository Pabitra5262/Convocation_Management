import { useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { Check, CheckCheck, ClipboardCheck, Download, Eye, Filter, Mail, MapPin, MessageSquare, Pencil, RotateCcw, Save, Send, ShieldCheck, X, XCircle } from 'lucide-react';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Badge, Button, DataTable, DatePicker, DetailList, FilterPanel, FormGenerator, Input, KpiCard, Modal, ProgressBar, SearchableSelect, TextArea, type Column } from '@/shared/components/ui';
import type { RowActionItem } from '@/shared/components/ui/Table/DataTable/dataTable.types';
import type { ModuleController } from '../hooks/useModulePage';
import { allocateSeats, approveAward, assignManualSeat, certificateAction, fileData, fileName, invitationAction, observationAction, scopedApplications, transitionApplication, updateData } from '../services/store';
import { communicationPreview, downloadDocument } from '../services/documents';
import type { RecordRow } from '../types';
import { StudentImport } from './StudentImport';
import { today } from '@/features/convocationEvents/validation/eventValidation';
import { EmbeddedScreenContext } from './ScreenContext';
import '@/features/convocationEvents/styles/convocationEvents.css';

type Pending = { action: string; ids: string[]; status?: string; record?: RecordRow };
const statusTone = (status: string) => /Approved|Generated|Distributed|Collected|Acknowledged|Closed|Recorded/.test(status) ? 'success' : /Rejected|Cancelled|Failed/.test(status) ? 'danger' : /Pending|Correction|Draft|Queued|Scheduled/.test(status) ? 'warning' : 'info';

export interface RecordListProps {
  records: RecordRow[];
  actions: (record: RecordRow) => RowActionItem[];
  onView: (record: RecordRow) => void;
}
export function ModuleContent({ controller: c, renderList }: { controller: ModuleController; renderList?: (props: RecordListProps) => ReactNode }) {
  const navigate = useNavigate();
  const embedded = useContext(EmbeddedScreenContext);
  const { definition: def } = c;
  const hasFilters = !renderList && ['verification', 'approvals', 'certificates', 'reports'].includes(def.key);
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState('');
  const [seat, setSeat] = useState('');
  const [certificateType, setCertificateType] = useState('Degree Certificate');
  const [distributionDate, setDistributionDate] = useState(today);
  const [processing, setProcessing] = useState(false);
  const [messagePreview, setMessagePreview] = useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>();
  const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; type: string; name: string }>();
  useEffect(() => () => { if (pdfPreview) URL.revokeObjectURL(pdfPreview); }, [pdfPreview]);
  const request = (action: string, record?: RecordRow, status?: string, ids?: string[]) => { setReason(''); setSeat(''); setDistributionDate(today()); setPending({ action, record, status, ids: ids ?? (record ? [record.id] : []) }); };
  const confirm = async () => {
    if (!pending || processing) return; setProcessing(true);
    const success = await c.perform(async () => {
      const { action, ids, status, record } = pending;
      if (action === 'workflow') transitionApplication(ids[0], status!, reason, c.actor);
      else if (action === 'generate' || action === 'distribute' || action === 'collect') certificateAction(ids, action, c.actor, certificateType, distributionDate);
      else if (action === 'allocate') allocateSeats(ids[0], c.actor);
      else if (action === 'invite' || action === 'acknowledge') invitationAction(ids, action === 'invite' ? 'generate' : 'acknowledge', c.actor);
      else if (action === 'manual') assignManualSeat(ids[0], Number(seat), c.actor);
      else if (action === 'respond' || action === 'close') observationAction(ids[0], action, reason, c.actor);
      else if (action === 'award') approveAward(record!.id, c.actor);
    });
    if (success) setPending(null); setProcessing(false);
  };
  const download = (record: RecordRow, kind: 'acknowledgement' | 'certificate' | 'invitation' | 'entry-pass', preview = false) => c.perform(async () => {
    const url = await downloadDocument(record.id, kind, c.actor, preview); if (url) setPdfPreview(url);
  }, preview ? 'Preview prepared' : 'Document downloaded');
  const editable = (record: RecordRow) => c.canWrite && def.key !== 'communications' && (def.key !== 'awards' || record.status === 'Nominated') && (def.key !== 'registration' || ['Draft', 'Correction Required'].includes(record.status));
  const manageCertificates = ['admin', 'exam', 'super'].includes(c.actor.key);
  const manageInvitations = ['admin', 'exam', 'coordinator', 'super'].includes(c.actor.key);
  const actions = (record: RecordRow): RowActionItem[] => {
    const result: RowActionItem[] = [];
    const add = (id: string, label: string, icon: RowActionItem['icon'], onClick: () => void, tone: RowActionItem['tone'] = 'neutral') => result.push({ id, label, icon, onClick, tone });
    if (editable(record)) add('edit', 'Edit', Pencil, () => c.edit(record));
    if (def.key === 'applications') {
      if (c.actor.key === 'candidate' && ['Draft', 'Correction Required'].includes(record.status)) add('correct', record.status === 'Draft' ? 'Continue Registration' : 'Respond to Correction', Pencil, () => void navigate('/convocation/registration'));
      if (record.status !== 'Draft') add('ack', 'Download Acknowledgement', Download, () => void download(record, 'acknowledgement'));
    }
    if (def.key === 'registration' && record.status !== 'Draft') add('ack', 'Download Acknowledgement', Download, () => void download(record, 'acknowledgement'));
    if (['verification', 'approvals'].includes(def.key)) {
      if (['exam', 'faculty', 'super'].includes(c.actor.key)) {
        if (record.status === 'Submitted') add('start', 'Start Verification', ClipboardCheck, () => request('workflow', record, 'Under University Verification'));
        if (['Submitted', 'Under University Verification'].includes(record.status)) {
          add('verify', 'Mark Verified', Check, () => request('workflow', record, 'Verified'), 'success');
          add('correction', 'Request Correction', MessageSquare, () => request('workflow', record, 'Correction Required'), 'warning');
        }
        if (record.status === 'Verified') add('forward', 'Send for Approval', Send, () => request('workflow', record, 'Pending Approval'));
      }
      if (['authority', 'super'].includes(c.actor.key) && record.status === 'Pending Approval') add('approve', 'Approve', ShieldCheck, () => request('workflow', record, 'Approved'), 'success');
      if (['Submitted', 'Under University Verification', 'Verified', 'Pending Approval'].includes(record.status)
        && ['exam', 'faculty', 'authority', 'super'].includes(c.actor.key)) add('reject', 'Reject', XCircle, () => request('workflow', record, 'Rejected'), 'danger');
    }
    if (def.key === 'certificates') {
      if (manageCertificates && ['Pending', 'Generated'].includes(record.status)) add('generate', record.status === 'Pending' ? 'Generate Certificate' : 'Re-generate Certificate', ClipboardCheck, () => request('generate', record));
      if (record.status !== 'Pending') { add('preview', 'Preview Certificate', Eye, () => void download(record, 'certificate', true)); add('download', 'Download Certificate', Download, () => void download(record, 'certificate')); }
      if (manageCertificates && record.status === 'Generated') add('distribute', 'Mark Distributed', CheckCheck, () => request('distribute', record), 'success');
      if (manageCertificates && record.status === 'Distributed') add('collect', 'Mark Collected', Check, () => request('collect', record));
    }
    if (def.key === 'logistics' && c.canWrite) add('allocate', 'Allocate Seats', MapPin, () => request('allocate', record));
    if (def.key === 'invitations') {
      if (manageInvitations) { add('manual', 'Assign Seat Manually', MapPin, () => request('manual', record)); add('invite', 'Generate Invitation', Mail, () => request('invite', record)); }
      if (['Generated', 'Acknowledged'].includes(record.status)) { add('download', 'Download Invitation', Download, () => void download(record, 'invitation')); if (record.values.attendance === 'In-person') add('entry', 'Download Entry Pass', Download, () => void download(record, 'entry-pass')); }
    }
    if (def.key === 'participation') {
      if (['Generated', 'Acknowledged'].includes(String(record.values.invitationStatus))) {
        add('invitation', 'Download Invitation', Download, () => void download(record, 'invitation'));
        if (record.values.attendance === 'In-person') add('pass', 'Download Entry Pass', Download, () => void download(record, 'entry-pass'));
        if (record.values.invitationStatus === 'Generated') add('acknowledge', 'Acknowledge Invitation', Check, () => request('acknowledge', record));
      }
      if (record.values.certificateStatus !== 'Pending') add('certificate', 'Download Certificate', Download, () => void download(record, 'certificate'));
    }
    if (def.key === 'observations' && record.status !== 'Closed') {
      if (['admin', 'exam', 'super'].includes(c.actor.key)) add('respond', 'University Response', MessageSquare, () => request('respond', record));
      if (['hed', 'super'].includes(c.actor.key) && record.values.response) add('close', 'Close Observation', Check, () => request('close', record));
    }
    if (def.key === 'awards' && ['authority', 'super'].includes(c.actor.key) && record.status !== 'Approved') add('award', 'Approve Award List', ShieldCheck, () => request('award', record));
    if (['hed', 'progress'].includes(def.key)) add('drill', def.key === 'hed' ? 'View University Progress' : 'View Participation', Eye, () => void navigate(def.key === 'hed' ? '/convocation/progress' : `/convocation/reports?eventId=${record.id}`));
    return result;
  };
  const columns: Column<RecordRow>[] = def.columns.map(column => ({ id: column.name, header: column.label, accessor: record => c.displayValue(column.name, record.values[column.name]), sortable: true,
    ...(column.name === 'progress' ? { cell: (record: RecordRow) => <ProgressBar value={Number(record.values.progress)} showValue /> } : {}),
    ...(/Status$/.test(column.name) ? { cell: (record: RecordRow) => <Badge tone={statusTone(String(record.values[column.name]))}>{c.displayValue(column.name, record.values[column.name])}</Badge> } : {}),
  }));
  if (!def.columns.some(column => column.name === 'applicationStatus') && def.key !== 'hed') columns.push({ id: 'status', header: def.key === 'certificates' ? 'Certificate Status' : def.key === 'invitations' ? 'Invitation Status' : def.key === 'communications' ? 'Delivery Status' : 'Status', accessor: r => r.status, cell: r => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> });
  const apps = scopedApplications(c.data, c.actor).filter(app => def.key === 'reports' ? c.shown.some(record => record.id === app.id) : !c.applied.eventId || app.values.eventId === c.applied.eventId);
  const renderDetails = (record: RecordRow) => {
    const app = c.data.applications.find(a => a.id === record.id);
    const attachmentValues = Object.entries(record.values).filter(([,value]) => fileData(value));
    const keys = Array.from(new Set([...def.columns.map(col => col.name), ...Object.keys(record.values).filter(key => !['delivery', 'photo', 'supportingDocument', 'attachment', 'venueLayout'].includes(key))]));
    if (!keys.includes('applicationStatus')) keys.unshift('status');
    const labels = new Map([...c.fields.map(f => [f.name, f.label] as const), ...def.columns.map(col => [col.name, col.label] as const)]);
    return <>
      <FormGenerator key={record.id} gridColumns={12} fields={keys.filter(key => typeof record.values[key] !== 'object').map(key => ({ name: `view_${key}`, type: 'text', label: labels.get(key) ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase()), readOnly: true, disabled: true, gridColumn: 4 }))}
        defaultValues={Object.fromEntries(keys.map(key => [`view_${key}`, c.displayValue(key, key === 'status' ? record.status : record.values[key])]))} onSubmit={() => undefined} />
      {app && <Card className="mt-5"><CardHeader title="Application History" divider /><CardBody><DataTable caption="Application History" data={app.history.map((entry,index) => ({...entry,id:String(index)}))} columns={[{ id: 'status', header: 'Status', accessor: h => h.status }, { id: 'remark', header: 'Remark', accessor: h => h.remark }, { id: 'actor', header: 'Actor', accessor: h => h.actor }, { id: 'date', header: 'Date / Time', accessor: h => c.displayValue('date', h.date) }]} rowKey={entry => entry.id} /></CardBody></Card>}
      {attachmentValues.map(([key, value]) => <Button key={key} className="mt-4 mr-2" variant="outline" leftIcon={Eye} onClick={() => setAttachmentPreview({ url: fileData(value), type: String((value as {type?:string}).type), name: fileName(value) })}>{fileName(value)}</Button>)}
      {Array.isArray(record.values.delivery) && <Card className="mt-5"><CardHeader title="Recipient Delivery Log" divider /><CardBody><DetailList items={(record.values.delivery as { registrationId: string; status: string; reason: string }[]).map(d => ({ label: d.registrationId, value: `${d.status} — ${d.reason}` }))} /></CardBody></Card>}
      <div className="mt-5 flex justify-start border-t border-border pt-4"><Button variant="outline" leftIcon={X} onClick={() => c.setViewed(null)}>Close</Button></div>
    </>;
  };
  if (!c.allowed) return <><PageHeader title={def.title} /><p role="alert">This page is not available for your role.</p></>;
  return <>
    {!embedded && <PageHeader title={def.title} breadcrumbs={[{ label: 'Convocation' }, { label: def.title }]} />}
    {['reports', 'hed', 'progress'].includes(def.key) && <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <KpiCard label="Registered" value={apps.filter(a => a.status !== 'Draft').length} />
      <KpiCard label="Approved" value={apps.filter(a => a.status === 'Approved').length} />
      <KpiCard label="In-person" value={apps.filter(a => a.status !== 'Draft' && a.values.attendance === 'In-person').length} />
      <KpiCard label="Virtual" value={apps.filter(a => a.status !== 'Draft' && a.values.attendance === 'Virtual').length} />
      <KpiCard label="Pending Verification / Approval" value={apps.filter(a => !['Draft','Approved','Rejected'].includes(a.status)).length} />
      <KpiCard label="Certificates Generated" value={c.data.certificates.filter(cert => apps.some(a => a.id === cert.values.applicationId)).length} />
    </div>}
    {def.key === 'students' && c.canWrite && <StudentImport controller={c} />}
    {c.canWrite && !def.readOnly && <Card className="mb-5"><CardHeader title={c.editing ? `Edit ${def.formTitle}` : def.formTitle} divider /><CardBody>
      <FormProvider {...c.methods}>
        <form id={c.formId} className="scroll-mt-6" noValidate onSubmit={event => { event.preventDefault(); void c.submit(); }}>
          <FormGenerator standalone gridColumns={12} fields={c.fields.map(field => field.type === 'file' ? { ...field, render: (value, onChange, error) => {
            // The stored file name remains visible without re-uploading the original file.
            return <FileField key={field.name} field={field} value={value} onChange={onChange} error={error} />;
          } } : field)} onSubmit={() => undefined} />
          <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-4">
            <Button variant="outline" leftIcon={RotateCcw} onClick={c.reset} disabled={c.busy}>Reset</Button>
            {def.draft && <Button variant="outline" leftIcon={Save} disabled={c.busy} onClick={() => void c.submit(true)}>Save as Draft</Button>}
            {def.key === 'communications' && <Button variant="outline" leftIcon={Eye} onClick={() => setMessagePreview(communicationPreview(String(c.values.body ?? '')))}>Preview</Button>}
            <Button type="submit" leftIcon={def.key === 'communications' ? Send : Save} loading={c.busy}>{def.draft ? 'Final Submit' : def.key === 'communications' ? c.values.scheduledAt ? 'Schedule' : 'Send' : 'Submit / Save'}</Button>
          </div>
        </form>
      </FormProvider>
    </CardBody></Card>}
    {hasFilters && <FilterPanel className="mb-5" hidden={c.filtersHidden} onHiddenChange={c.setFiltersHidden} floatingButton={false}
      onSubmit={() => c.setApplied({ ...c.filters })} appliedCount={Object.values(c.applied).filter(Boolean).length}
      actions={<><Button variant="outline" leftIcon={RotateCcw} onClick={() => { const cleared = { eventId: '', status: '', institutionId: '', program: '', attendance: '', certificateStatus: '' }; c.setFilters(cleared); c.setApplied(cleared); }}>Reset</Button><Button type="submit" leftIcon={Filter}>Filter</Button></>}>
      {['certificates', 'reports'].includes(def.key) && <SearchableSelect label="Convocation Event" options={c.events.map(e => ({ value: e.id, label: e.name }))} value={c.filters.eventId} onChange={value => c.setFilters({ ...c.filters, eventId: String(value) })} wrapperClassName="min-w-48 flex-1" />}
      <SearchableSelect label="Status" options={Array.from(new Set(c.rows.map(r => r.status))).map(value => ({ value, label: value }))} value={c.filters.status} onChange={value => c.setFilters({ ...c.filters, status: String(value) })} wrapperClassName="min-w-48 flex-1" />
      {['reports', 'certificates'].includes(def.key) && <SearchableSelect label="Institution" options={c.institutions.map(i => ({ value: i.id, label: i.name }))} value={c.filters.institutionId} onChange={value => c.setFilters({ ...c.filters, institutionId: String(value) })} wrapperClassName="min-w-48 flex-1" />}
      {['reports', 'certificates'].includes(def.key) && <SearchableSelect label="Program / Course" options={Array.from(new Set(c.rows.map(r => String(r.values.program ?? '')).filter(Boolean))).map(value => ({ value, label: value }))} value={c.filters.program} onChange={value => c.setFilters({ ...c.filters, program: String(value) })} wrapperClassName="min-w-48 flex-1" />}
      {def.key === 'reports' && <SearchableSelect label="Attendance Preference" options={['In-person', 'Virtual', 'In-Absentia'].map(value => ({ value, label: value }))} value={c.filters.attendance} onChange={value => c.setFilters({ ...c.filters, attendance: String(value) })} wrapperClassName="min-w-48 flex-1" />}
      {def.key === 'reports' && <SearchableSelect label="Certificate Status" options={['Pending','Generated','Distributed','Collected'].map(value => ({ value, label: value }))} value={c.filters.certificateStatus} onChange={value => c.setFilters({ ...c.filters, certificateStatus: String(value) })} wrapperClassName="min-w-48 flex-1" />}
    </FilterPanel>}
    {renderList ? renderList({ records: c.shown, actions, onView: c.setViewed }) : <Card><CardHeader title={`${def.title} List`} divider /><CardBody>
      <DataTable className="convocation-events-table" data={c.shown} columns={columns} rowKey={r => r.id} rowLabel={r => String(r.values.studentName ?? r.values.name ?? r.id)} caption={def.title}
        emptyTitle="No records found" emptyDescription=""
        filterToggle={hasFilters ? { hidden: c.filtersHidden, onToggle: () => c.setFiltersHidden(!c.filtersHidden), appliedCount: Object.values(c.applied).filter(Boolean).length } : undefined}
        selectable={def.bulk === 'generate' ? manageCertificates : def.bulk === 'invite' ? manageInvitations : false} selectedKeys={c.selected} onSelectionChange={c.setSelected}
        bulkActions={def.bulk ? [{ id: def.bulk, label: def.bulk === 'generate' ? 'Bulk Generate Certificates' : 'Generate Invitations', icon: ClipboardCheck, onClick: ids => request(def.bulk === 'generate' ? 'generate' : 'invite', undefined, undefined, ids) }] : undefined}
        onExport={(rows, exportColumns, format) => { void c.perform(async () => {
          const { exportToExcel, exportToPDF } = await import('@/shared/utils/exportUtils');
          const cols = exportColumns.map(col => ({ accessorKey: col.id === 'action' ? 'activity' : col.id, header: col.header === 'Action' ? 'Activity' : col.header }));
          const records = rows.map(r => Object.fromEntries(exportColumns.map(col => [col.id === 'action' ? 'activity' : col.id, col.id === 'status' ? r.status : c.displayValue(col.id, r.values[col.id])])));
          if (format === 'excel') await exportToExcel(cols, records, `convocation-${def.key}`, def.title.replace(/[\\/?*:]/g, ' ').replaceAll('[',' ').replaceAll(']',' ').slice(0,31));
          else if (format === 'pdf') await exportToPDF(cols, records, `convocation-${def.key}`, def.title);
          else { const { saveAs } = await import('file-saver'); const escape = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"'; const csv = [cols.map(col => escape(col.header)).join(','), ...records.map(record => cols.map(col => escape(record[col.accessorKey])).join(','))].join('\r\n'); saveAs(new Blob([csv], {type:'text/csv;charset=utf-8'}), `convocation-${def.key}.csv`); }
          updateData(c.actor, `Export ${def.title}: ${format}`, () => undefined);
        }, 'Report exported'); }}
        actions={{ onView: record => { c.setViewed(record); if (def.key === 'reports') updateData(c.actor, `View participation ${record.id}`, () => undefined); },
          custom: record => actions(record).slice(0, actions(record).length > 2 ? 1 : 2), more: record => actions(record).slice(actions(record).length > 2 ? 1 : 2).map(action => ({ id: action.id, label: action.label, icon: action.icon, onSelect: action.onClick })) }} />
    </CardBody></Card>}
    <Modal isOpen={!!c.viewed} onClose={() => c.setViewed(null)} title={`View ${def.title}`} size="6xl">{c.viewed && renderDetails(c.viewed)}</Modal>
    <Modal isOpen={!!pending} onClose={() => !processing && setPending(null)} title={pending?.status ?? ({generate:'Generate Certificates',distribute:'Mark Distributed',collect:'Mark Collected',allocate:'Allocate Seats',invite:'Generate Invitations',manual:'Assign Seat Manually',respond:'University Response',close:'Close Observation',acknowledge:'Acknowledge Invitation',award:'Approve Award List'} as Record<string,string>)[pending?.action ?? ''] ?? 'Confirm Action'} size="md">
      {pending?.action === 'generate' && <SearchableSelect label="Certificate Type" value={certificateType} onChange={value => setCertificateType(String(value))} options={['Degree Certificate', 'Provisional Certificate', 'Transcript'].map(value => ({ value, label: value }))} />}
      {pending?.action === 'distribute' && <DatePicker label="Distributed On" value={distributionDate} maxDate={today()} onChange={event => setDistributionDate(event.target.value)} required />}
      {(pending?.action === 'respond' || ['Correction Required', 'Rejected'].includes(pending?.status ?? '')) && <TextArea label={pending?.action === 'respond' ? 'University Response' : 'Reason'} value={reason} onChange={event => setReason(event.target.value)} rows={2} className="!h-auto" required />}
      {pending?.action === 'manual' && <Input label="Student Seat Number" type="number" min={1} value={seat} onChange={event => setSeat(event.target.value)} helpText="Guest seats follow the student seat consecutively." />}
      <div className="mt-5 flex justify-start gap-2 border-t border-border pt-4"><Button variant="outline" leftIcon={X} disabled={processing} onClick={() => setPending(null)}>Cancel</Button><Button leftIcon={Check} loading={processing} onClick={() => void confirm()}>Confirm</Button></div>
    </Modal>
    <Modal isOpen={messagePreview !== null} title="Communication Preview" onClose={() => setMessagePreview(null)} size="lg"><p className="whitespace-pre-wrap">{messagePreview}</p></Modal>
    <Modal isOpen={!!pdfPreview} title="Certificate Preview" onClose={() => setPdfPreview(undefined)} size="6xl">{pdfPreview && <iframe title="Certificate PDF" src={pdfPreview} className="h-[70vh] w-full" />}</Modal>
    <Modal isOpen={!!attachmentPreview} title={attachmentPreview?.name} onClose={() => setAttachmentPreview(undefined)} size="5xl">{attachmentPreview && (attachmentPreview.type.startsWith('image/') ? <img src={attachmentPreview.url} alt={attachmentPreview.name} className="max-h-[70vh] w-full object-contain" /> : <iframe title="Uploaded Document" src={attachmentPreview.url} className="h-[70vh] w-full" />)}</Modal>
  </>;
}

import UploadFile from '@/shared/components/ui/Forms/UploadFile';
import type { FormField } from '@/shared/components/ui/Forms';
function FileField({ field, value, onChange, error }: { field: FormField; value: unknown; onChange: (value: unknown) => void; error?: string }) {
  return <div className="col-span-12 sm:col-span-1 md:col-span-2 lg:col-span-[var(--field-span)]" style={{ '--field-span': field.gridColumn ?? 3 } as import('react').CSSProperties}>
    <UploadFile label={field.label} value={value instanceof File ? value : fileName(value)} onChange={onChange} accept={field.accept} required={field.required} helpText={field.helpText} error={error} disabled={field.disabled} />
  </div>;
}
