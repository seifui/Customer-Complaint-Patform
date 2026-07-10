import { requireRole } from '@/lib/auth';
import ProblemDetailClient from '@/components/ProblemDetailClient';

export default async function Page({ params }) {
  await requireRole(['manager', 'ceo', 'dev']);
  const { id } = await params;
  return <ProblemDetailClient problemId={id} />;
}
