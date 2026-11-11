import { Content } from '../components/studentsContent';
import { usePage } from '../hooks/useConvocationStudents';
export default function Page() { const controller = usePage(); return <Content controller={controller} />; }

