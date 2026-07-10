import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export default async function AppLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return <AppShell session={session}>{children}</AppShell>;
}
