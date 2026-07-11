'use client';

import { useRouter } from 'next/navigation';
import { initials, teamColorVars } from '@/lib/helpers';

export default function TaskCard({ a, onOpen }) {
  const router = useRouter();
  const statusBadge =
    a.status === 'done' ? { cls: 'st-resolved', label: 'Done' } : a.status === 'in-progress' ? { cls: 'st-linked', label: 'In Progress' } : { cls: 'st-new', label: 'To Do' };
  const team = teamColorVars(a.team);

  return (
    <div className="task-card" onClick={() => onOpen(a.id)}>
      <div className="task-top">
        <span
          className="badge ch-badge"
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            router.push('/problems/' + a.problem);
          }}
        >
          {a.problem}
        </span>
        <span className="badge" style={{ background: team.bg, color: team.color }}>
          {a.team}
        </span>
        <span className={'badge ' + statusBadge.cls}>{statusBadge.label}</span>
      </div>
      <div className="task-title">{a.intervention || a.title}</div>
      <div className="chain-row">
        <span className="chain-lbl">Target</span>
        <span className="chain-val">{a.targetMetric || '—'}</span>
      </div>
      <div className="chain-row">
        <span className="chain-lbl">Current Result</span>
        <span className="chain-val">{a.currentResult || 'Not started'}</span>
      </div>
      <div className="chain-progress-track">
        <div className="chain-progress-fill" style={{ width: (a.progressPct || 0) + '%' }} />
      </div>
      <div className="task-meta" style={{ marginTop: 6 }}>
        <span className="task-owner">
          <span className="task-av">{initials(a.owner)}</span>
          {a.owner}
        </span>
        <span>Due {a.deadline}</span>
      </div>
    </div>
  );
}
