import { requireRole } from '@/lib/auth';
import ActionsClient from '@/components/ActionsClient';

export default async function Page() {
  await requireRole(['manager', 'ceo']);
  return <ActionsClient />;
}
