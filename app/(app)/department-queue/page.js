import { requireRole } from '@/lib/auth';
import DepartmentQueueClient from '@/components/DepartmentQueueClient';

export default async function Page() {
  const session = await requireRole(['dept_manager']);
  return <DepartmentQueueClient session={session} />;
}
