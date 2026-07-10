'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';

export default function MineClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const [openId, setOpenId] = useState(null);
  const mine = concerns.filter((c) => c.createdBy === session.role);

  return (
    <>
      <div className="card">
        <div className="section-title">
          My Submitted Concerns <span className="section-hint">{mine.length} total</span>
        </div>
        <QueueTable list={mine} onOpen={setOpenId} />
      </div>
      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
