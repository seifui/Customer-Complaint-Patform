import { requireRole } from '@/lib/auth';
import DashboardClient from '@/components/DashboardClient';

export default async function Page() {
  await requireRole(['manager', 'ceo']);
  return <DashboardClient />;
}
