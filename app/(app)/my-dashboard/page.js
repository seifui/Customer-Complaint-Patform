import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';

/** Legacy staff route — roles collapsed; personal dashboard now lives at /dashboard for admin. */
export default async function Page() {
  await requireRole(['admin', 'superadmin']);
  redirect('/dashboard');
}
