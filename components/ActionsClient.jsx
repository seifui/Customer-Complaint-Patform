'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Callout from './Callout';
import Select from './Select';
import TaskCard from './TaskCard';
import TaskUpdateModal from './TaskUpdateModal';
import { Button } from '@/components/ui/button';

const COLUMNS = [
  ['todo', 'To Do'],
  ['in-progress', 'In Progress'],
  ['done', 'Done'],
];
const TEAMS = ['Technology', 'Digital Banking', 'Customer Service', 'Product', 'Leadership'];
const ALL = '__all__';

export default function ActionsClient() {
  const actions = useStore((s) => s.actions);
  const problems = useStore((s) => s.problems);
  const [filters, setFilters] = useState({ team: '', owner: '', problem: '' });
  const [openTaskId, setOpenTaskId] = useState(null);

  const owners = [...new Set(actions.map((a) => a.owner).filter((o) => o !== 'Unassigned'))];

  const filtered = actions.filter((a) => {
    if (filters.team && a.team !== filters.team) return false;
    if (filters.owner && a.owner !== filters.owner) return false;
    if (filters.problem && a.problem !== filters.problem) return false;
    return true;
  });

  return (
    <>
      <Callout kind="acc">
        Every action stays connected to the customer problem it&apos;s solving, the intervention being tested, its target metric, and the actual result — problem → intervention → owner →
        target → progress → customer outcome.
      </Callout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          variant="pill"
          value={filters.problem || ALL}
          onChange={(v) => setFilters({ ...filters, problem: v === ALL ? '' : v })}
          options={[
            { value: ALL, label: 'All Problems' },
            ...problems.map((p) => ({ value: p.id, label: p.id + ' — ' + (p.title.length > 26 ? p.title.slice(0, 26) + '…' : p.title) })),
          ]}
        />
        <Select
          variant="pill"
          value={filters.team || ALL}
          onChange={(v) => setFilters({ ...filters, team: v === ALL ? '' : v })}
          options={[{ value: ALL, label: 'All Teams' }, ...TEAMS]}
        />
        <Select
          variant="pill"
          value={filters.owner || ALL}
          onChange={(v) => setFilters({ ...filters, owner: v === ALL ? '' : v })}
          options={[{ value: ALL, label: 'All Owners' }, 'Unassigned', ...owners]}
        />
        <Button variant="outline" onClick={() => setFilters({ team: '', owner: '', problem: '' })}>Reset</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(([key, label]) => {
          const items = filtered.filter((a) => a.status === key);
          return (
            <div className="rounded-xl border bg-muted/40 p-3.5" key={key}>
              <div className="mb-3 flex items-center justify-between text-[10.5px] font-bold tracking-wide text-foreground/80 uppercase">
                {label} <span className="font-mono font-normal text-muted-foreground normal-case">{items.length}</span>
              </div>
              {items.length ? (
                items.map((a) => <TaskCard a={a} key={a.id} onOpen={setOpenTaskId} />)
              ) : (
                <div className="py-5 text-center text-muted-foreground"><div className="text-xs">Empty</div></div>
              )}
            </div>
          );
        })}
      </div>
      <TaskUpdateModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}
