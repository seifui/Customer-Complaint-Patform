'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Callout from './Callout';
import Select from './Select';
import TaskCard from './TaskCard';
import TaskUpdateModal from './TaskUpdateModal';

const COLUMNS = [
  ['todo', 'To Do'],
  ['in-progress', 'In Progress'],
  ['done', 'Done'],
];
const TEAMS = ['Technology', 'Digital Banking', 'Customer Service', 'Product', 'Leadership'];

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
      <div className="fb">
        <Select
          variant="pill"
          value={filters.problem}
          onChange={(v) => setFilters({ ...filters, problem: v })}
          options={[
            { value: '', label: 'All Problems' },
            ...problems.map((p) => ({ value: p.id, label: p.id + ' — ' + (p.title.length > 26 ? p.title.slice(0, 26) + '…' : p.title) })),
          ]}
        />
        <Select
          variant="pill"
          value={filters.team}
          onChange={(v) => setFilters({ ...filters, team: v })}
          options={[{ value: '', label: 'All Teams' }, ...TEAMS]}
        />
        <Select
          variant="pill"
          value={filters.owner}
          onChange={(v) => setFilters({ ...filters, owner: v })}
          options={[{ value: '', label: 'All Owners' }, 'Unassigned', ...owners]}
        />
        <button className="btn btn-gh" onClick={() => setFilters({ team: '', owner: '', problem: '' })}>Reset</button>
      </div>
      <div className="kanban">
        {COLUMNS.map(([key, label]) => {
          const items = filtered.filter((a) => a.status === key);
          return (
            <div className="kanban-col" key={key}>
              <div className="kanban-hd">{label} <span className="kanban-count">{items.length}</span></div>
              {items.length ? (
                items.map((a) => <TaskCard a={a} key={a.id} onOpen={setOpenTaskId} />)
              ) : (
                <div className="empty" style={{ padding: '20px 0' }}><div className="empty-t">Empty</div></div>
              )}
            </div>
          );
        })}
      </div>
      <TaskUpdateModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}
