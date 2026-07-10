import { requireRole } from '@/lib/auth';
import MineClient from '@/components/MineClient';

export default async function Page() {
  const session = await requireRole(['agent', 'branch']);
  return <MineClient session={session} />;
}
