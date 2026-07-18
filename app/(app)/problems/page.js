import { requireRole } from '@/lib/auth';
import ProblemsListClient from '@/components/ProblemsListClient';

export default async function Page() {
  await requireRole(['admin', 'superadmin']);
  return <ProblemsListClient />;
}
