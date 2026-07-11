'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { triageInfo, TRIAGE_DEFS } from '@/lib/helpers';
import { CHANNEL_ICON } from '@/lib/data';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';
import Select from './Select';

const TRIAGE_ORDER = Object.keys(TRIAGE_DEFS).sort((a, b) => TRIAGE_DEFS[a].order - TRIAGE_DEFS[b].order);

export default function QueueClient() {
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const [filters, setFilters] = useState({ channel: '', severity: '', triage: '', q: '' });
  const [openId, setOpenId] = useState(null);

  const counts = {};
  TRIAGE_ORDER.forEach((cat) => (counts[cat] = 0));
  concerns.forEach((c) => counts[triageInfo(c, problems).cat]++);

  let filtered = concerns.filter((c) => {
    if (filters.channel && c.channel !== filters.channel) return false;
    if (filters.severity && c.severity !== filters.severity) return false;
    if (filters.triage && triageInfo(c, problems).cat !== filters.triage) return false;
    if (filters.q) {
      const s = (c.id + ' ' + c.customer + ' ' + c.summary).toLowerCase();
      if (!s.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });
  filtered = filtered.sort((a, b) => triageInfo(a, problems).order - triageInfo(b, problems).order);

  return (
    <>
      <div className="triage-chip-row">
        {TRIAGE_ORDER.map((cat) => {
          const def = TRIAGE_DEFS[cat];
          const active = filters.triage === cat;
          return (
            <div
              key={cat}
              className={'triage-chip' + (active ? ' active' : '')}
              style={{ background: def.bg, color: def.color }}
              onClick={() => setFilters((f) => ({ ...f, triage: f.triage === cat ? '' : cat }))}
            >
              {def.label} <span className="mono">{counts[cat]}</span>
            </div>
          );
        })}
      </div>

      <div className="fb">
        <input
          className="fi"
          placeholder="Search ID, customer, summary…"
          style={{ width: 220 }}
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <Select
          variant="pill"
          value={filters.channel}
          onChange={(v) => setFilters((f) => ({ ...f, channel: v }))}
          options={[{ value: '', label: 'All Channels' }, ...Object.keys(CHANNEL_ICON)]}
        />
        <Select
          variant="pill"
          value={filters.severity}
          onChange={(v) => setFilters((f) => ({ ...f, severity: v }))}
          options={[{ value: '', label: 'All Severities' }, 'critical', 'high', 'medium', 'low']}
        />
        <button className="btn btn-gh" onClick={() => setFilters({ channel: '', severity: '', triage: '', q: '' })}>Reset</button>
      </div>

      <div className="card">
        <QueueTable list={filtered} onOpen={setOpenId} />
      </div>

      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
