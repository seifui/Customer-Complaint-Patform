import { requireRole } from '@/lib/auth';
import MyTasksClient from '@/components/MyTasksClient';

export default async function Page() {
  const session = await requireRole(['dev']);
  return <MyTasksClient session={session} />;
}
