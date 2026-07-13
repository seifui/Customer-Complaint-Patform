'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';

// Read-only lookup for Agent/Branch staff answering "what happened to my
// complaint?" calls. Search spans every concern, not just ones this staff
// member submitted — but ConcernDetailPanel's own role checks (canAssignDepartment
// / canActOnDepartment) already stay false for agent/branch, so the detail
// drawer opened from here has no assign/status/comment actions, automatically.
export default function ConcernLookupClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? concerns.filter((c) => (c.id + ' ' + c.customer + ' ' + (c.nic || '') + ' ' + c.journey + ' ' + c.summary).toLowerCase().includes(q))
    : concerns;

  return (
    <>
      <div className="fb">
        <input
          className="fi"
          style={{ flex: 1 }}
          placeholder="Search by Tracking ID, Customer Name, or NIC..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="section-hint" style={{ display: 'block', marginBottom: 14 }}>Showing {filtered.length} Concerns</div>
        <QueueTable list={filtered} onOpen={setOpenId} />
      </div>
      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </>
  );
}
