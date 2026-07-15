'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { triageInfo, TRIAGE_DEFS } from '@/lib/helpers';
import { CHANNEL_ICON } from '@/lib/data';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';
import Select from './Select';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TRIAGE_ORDER = Object.keys(TRIAGE_DEFS).sort((a, b) => TRIAGE_DEFS[a].order - TRIAGE_DEFS[b].order);
const ALL = '__all__';

export default function QueueClient({ session }) {
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
      <div className="mb-4 flex flex-wrap gap-2">
        {TRIAGE_ORDER.map((cat) => {
          const def = TRIAGE_DEFS[cat];
          const active = filters.triage === cat;
          return (
            <button
              key={cat}
              type="button"
              className={cn(
                'cursor-pointer rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold transition-opacity hover:opacity-85',
                active && 'ring-1 ring-current'
              )}
              style={{ background: def.bg, color: def.color }}
              onClick={() => setFilters((f) => ({ ...f, triage: f.triage === cat ? '' : cat }))}
            >
              {def.label} <span className="font-mono">{counts[cat]}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search ID, customer, summary…"
          className="w-55"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <Select
          variant="pill"
          value={filters.channel || ALL}
          onChange={(v) => setFilters((f) => ({ ...f, channel: v === ALL ? '' : v }))}
          options={[{ value: ALL, label: 'All Channels' }, ...Object.keys(CHANNEL_ICON)]}
        />
        <Select
          variant="pill"
          value={filters.severity || ALL}
          onChange={(v) => setFilters((f) => ({ ...f, severity: v === ALL ? '' : v }))}
          options={[{ value: ALL, label: 'All Severities' }, 'critical', 'high', 'medium', 'low']}
        />
        <Button variant="outline" onClick={() => setFilters({ channel: '', severity: '', triage: '', q: '' })}>Reset</Button>
      </div>

      <Card className="py-0">
        <QueueTable list={filtered} onOpen={setOpenId} />
      </Card>

      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </>
  );
}
