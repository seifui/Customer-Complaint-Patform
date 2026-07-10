'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Callout from './Callout';
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
        <select className="fi" value={filters.problem} onChange={(e) => setFilters({ ...filters, problem: e.target.value })}>
          <option value="">All Problems</option>
          {problems.map((p) => (
            <option key={p.id} value={p.id}>{p.id} — {p.title.length > 26 ? p.title.slice(0, 26) + '…' : p.title}</option>
          ))}
        </select>
        <select className="fi" value={filters.team} onChange={(e) => setFilters({ ...filters, team: e.target.value })}>
          <option value="">All Teams</option>
          {TEAMS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="fi" value={filters.owner} onChange={(e) => setFilters({ ...filters, owner: e.target.value })}>
          <option value="">All Owners</option>
          <option value="Unassigned">Unassigned</option>
          {owners.map((o) => <option key={o}>{o}</option>)}
        </select>
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
