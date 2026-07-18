import { requireRole } from '@/lib/auth';
import ConcernDetailClient from '@/components/ConcernDetailClient';

export default async function Page({ params }) {
  const session = await requireRole(['admin', 'superadmin']);
  const { trackingId } = await params;
  return <ConcernDetailClient trackingId={trackingId} session={session} />;
}
