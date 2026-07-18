import { requireRole } from '@/lib/auth';
import MineClient from '@/components/MineClient';

export default async function Page() {
  const session = await requireRole(['admin', 'superadmin']);
  return <MineClient session={session} />;
}
