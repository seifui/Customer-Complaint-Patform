import { requireRole } from '@/lib/auth';
import QueueClient from '@/components/QueueClient';

export default async function Page() {
  await requireRole(['admin', 'superadmin']);
  return <QueueClient />;
}
