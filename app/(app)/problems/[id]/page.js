import { requireRole } from '@/lib/auth';
import ProblemDetailClient from '@/components/ProblemDetailClient';

export default async function Page({ params }) {
  const session = await requireRole(['admin', 'superadmin']);
  const { id } = await params;
  return <ProblemDetailClient problemId={id} session={session} />;
}
