import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';

// Legacy route for branch/agent "Concern Queue" — same UI as /queue.
export default async function Page() {
  await requireRole(['agent', 'branch']);
  redirect('/queue');
}
