import { requireRole } from '@/lib/auth';
import QueueClient from '@/components/QueueClient';

export default async function Page() {
  await requireRole(['manager', 'ceo', 'dev']);
  return <QueueClient />;
}
