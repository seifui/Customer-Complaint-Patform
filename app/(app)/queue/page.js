import { requireRole } from '@/lib/auth';
import QueueClient from '@/components/QueueClient';

export default async function Page() {
  const session = await requireRole(['manager', 'ceo', 'dev']);
  return <QueueClient session={session} />;
}
