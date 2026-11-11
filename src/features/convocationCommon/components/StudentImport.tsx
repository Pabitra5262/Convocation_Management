import { useState } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Button, UploadFile } from '@/shared/components/ui';
import { validatePage } from '../validation/validatePage';
import { updateData, row } from '../services/store';
import type { Student, Values } from '../types';
import type { ModuleController } from '../hooks/useModulePage';

const headers = ['name', 'apaarId', 'enrolment', 'institutionId', 'program', 'branch', 'passingYear', 'dob', 'gender', 'email', 'mobile', 'address'];
export function StudentImport({ controller: c }: { controller: ModuleController }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const template = () => c.perform(async () => {
    const { Workbook } = await import('exceljs'); const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Students'); sheet.addRow(headers);
    const institutions = workbook.addWorksheet('Institutions'); institutions.addRow(['institutionId', 'name']); c.institutions.forEach(i => institutions.addRow([i.id, i.name]));
    const { saveAs } = await import('file-saver'); saveAs(new Blob([await workbook.xlsx.writeBuffer() as ArrayBuffer]), 'convocation-students-template.xlsx');
  }, 'Template downloaded');
  const upload = async () => {
    if (!file || busy) return; setBusy(true);
    await c.perform(async () => {
      if (file.size > 5 * 1024 * 1024 || !file.name.endsWith('.xlsx')) throw new Error('Select an XLSX file up to 5 MB.');
      const { Workbook } = await import('exceljs'); const workbook = new Workbook(); await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.worksheets[0]; if (!sheet || sheet.rowCount < 2) throw new Error('The workbook contains no student records.');
      headers.forEach((name, index) => { if (String(sheet.getRow(1).getCell(index + 1).value ?? '') !== name) throw new Error(`Column ${index + 1} must be ${name}. Use the template.`); });
      const records: Values[] = [];
      sheet.eachRow((excelRow, index) => {
        if (index === 1) return;
        const values: Values = { eligible: true };
        headers.forEach((name, col) => { const value = excelRow.getCell(col + 1).value; values[name] = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? ''); });
        const error = validatePage('students', c.fields, values);
        if (Object.keys(error).length) throw new Error(`Row ${index}: ${Object.values(error).join('; ')}`);
        if (!c.institutions.some(i => i.id === values.institutionId)) throw new Error(`Row ${index}: institutionId is not configured.`);
        records.push(values);
      });
      updateData(c.actor, `Import ${records.length} students`, data => {
        const seen = new Set(data.students.map(s => s.values.apaarId));
        for (const values of records) { const id = String(values.apaarId); if (seen.has(id)) throw new Error(`Duplicate APAAR ID: ${id}`); seen.add(id); data.students.push(row(values, 'Eligible') as Student); }
      }); setFile(null);
    }, 'Students imported'); setBusy(false);
  };
  return <Card className="mb-5"><CardHeader title="Import Students" divider /><CardBody>
    <UploadFile label="Student Data (Excel)" value={file} onChange={setFile} accept=".xlsx" />
    <div className="mt-4 flex flex-wrap justify-start gap-2 border-t border-border pt-4">
      <Button variant="outline" leftIcon={Download} onClick={() => void template()}>Download Template</Button>
      <Button variant="outline" leftIcon={RotateCcw} onClick={() => setFile(null)}>Reset</Button>
      <Button leftIcon={Upload} disabled={!file || busy} loading={busy} onClick={() => void upload()}>Import Students</Button>
    </div>
  </CardBody></Card>;
}
