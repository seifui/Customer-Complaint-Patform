'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';

// Deliberately generic — filters on session.department rather than any
// specific department name, so this one page serves every Department
// Manager account without a dedicated page per department.
export default function DepartmentQueueClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const [openId, setOpenId] = useState(null);

  const mine = concerns.filter((c) => c.assignedDepartment === session.department);

  return (
    <>
      <div className="card">
        <div className="section-hint" style={{ display: 'block', marginBottom: 14 }}>
          {session.department} Department · Showing {mine.length} {mine.length === 1 ? 'Concern' : 'Concerns'}
        </div>
        <QueueTable list={mine} onOpen={setOpenId} />
      </div>
      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </>
  );
}
