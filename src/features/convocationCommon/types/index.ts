import type { FormField } from '@/shared/components/ui/Forms';
import type { ConvocationEvent, Institution } from '@/features/convocationEvents/types';

export type Values = Record<string, unknown>;
export type ModuleKey = 'students' | 'registration' | 'applications' | 'verification' | 'approvals' | 'certificates' | 'awards' | 'logistics' | 'invitations' | 'participation' | 'communications' | 'reports' | 'hed' | 'progress' | 'observations' | 'audit';
export interface RecordRow { id: string; values: Values; status: string; updatedAt: string }
export interface Student extends RecordRow { values: Values & { name: string; apaarId: string; institutionId: string; program: string; branch: string; passingYear: string; dob: string; gender: string; enrolment: string; email: string; mobile: string; address: string; eligible: boolean } }
export interface Application extends RecordRow { values: Values & { studentId: string; eventId: string; attendance: string; guests: number; email: string; mobile: string; address: string; declaration: boolean; feeStatus: string; reason: string }; history: { status: string; remark: string; actor: string; date: string }[] }
export interface DomainData { students: Student[]; applications: Application[]; certificates: RecordRow[]; awards: RecordRow[]; logistics: RecordRow[]; invitations: RecordRow[]; communications: RecordRow[]; observations: RecordRow[]; audit: RecordRow[]; notifications: RecordRow[] }
export interface Actor { key: string; label: string; studentId: string; institutionId: string }
export interface PageContext { actor: Actor; data: DomainData; events: ConvocationEvent[]; institutions: Institution[]; values: Values }
export interface PageDefinition {
  key: ModuleKey; title: string; formTitle: string; path: string; roles: string[]; writers: string[];
  fields: (context: PageContext) => FormField[];
  columns: { name: string; label: string }[];
  defaults?: Values; readOnly?: boolean; draft?: boolean; bulk?: 'generate' | 'invite';
}
export type PageService = { read: (context: PageContext) => RecordRow[]; save: (values: Values, actor: Actor, id?: string, draft?: boolean) => void };
