'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';
import { Card } from '@/components/ui/card';

// Deliberately generic — filters on session.department rather than any
// specific department name, so this one page serves every Department
// Manager account without a dedicated page per department.
export default function DepartmentQueueClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const [openId, setOpenId] = useState(null);

  const mine = concerns.filter((c) => c.assignedDepartment === session.department);

  return (
    <>
      <Card className="gap-0 py-0">
        <div className="border-b px-4 py-3 text-[11px] text-muted-foreground">
          {session.department} Department · Showing {mine.length} {mine.length === 1 ? 'Concern' : 'Concerns'}
        </div>
        <QueueTable list={mine} onOpen={setOpenId} />
      </Card>
      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </>
  );
}
