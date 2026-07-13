import { requireRole } from '@/lib/auth';
import ConcernLookupClient from '@/components/ConcernLookupClient';

export default async function Page() {
  const session = await requireRole(['agent', 'branch']);
  return <ConcernLookupClient session={session} />;
}
