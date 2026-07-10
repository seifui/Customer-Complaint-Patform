import { requireRole } from '@/lib/auth';
import CaptureClient from '@/components/CaptureClient';

export default async function Page() {
  const session = await requireRole(['agent', 'branch', 'manager']);
  return <CaptureClient session={session} />;
}
