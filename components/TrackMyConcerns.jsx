'use client';

import { useState } from 'react';
import TrackByTicket from './TrackByTicket';
import FindMyConcerns from './FindMyConcerns';

const SUB_TABS = [
  { key: 'ticket', label: 'Search by Ticket' },
  { key: 'nic', label: 'Search by NIC / Passport' },
];

export default function TrackMyConcerns({ initialTicket }) {
  const [subTab, setSubTab] = useState('ticket');

  return (
    <div>
      <div className="pub-subtabs">
        {SUB_TABS.map((t) => (
          <div key={t.key} className={'pub-subtab-opt' + (subTab === t.key ? ' on' : '')} onClick={() => setSubTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>
      {subTab === 'ticket' && <TrackByTicket initialQuery={initialTicket || ''} autoSearch={!!initialTicket} />}
      {subTab === 'nic' && <FindMyConcerns />}
    </div>
  );
}
