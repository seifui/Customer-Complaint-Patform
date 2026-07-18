import { requireRole } from '@/lib/auth';
import DashboardClient from '@/components/DashboardClient';
import StaffDashboardClient from '@/components/StaffDashboardClient';

export default async function Page() {
  const session = await requireRole(['admin', 'superadmin']);

  // Admin = personal to-dos / completed work. Super Admin = org-wide ops health.
  if (session.role === 'admin') {
    return <StaffDashboardClient session={session} />;
  }

  return <DashboardClient />;
}
