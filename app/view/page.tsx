import { getAllStudents } from '@/lib/actions/students';
import ViewClient from './ViewClient';

export const dynamic = 'force-dynamic';

export default async function ViewPage() {
    const result = await getAllStudents();
    const students = result.data || [];

    return <ViewClient initialStudents={students} />;
}
