'use client';

import { useRouter } from 'next/navigation';
import { initials, teamColorVars } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';

const STATUS = {
  done: { tone: 'bg-green-500/10 text-green-600 dark:text-green-400', label: 'Done' },
  'in-progress': { tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'In Progress' },
  default: { tone: 'bg-muted text-muted-foreground', label: 'To Do' },
};

export default function TaskCard({ a, onOpen }) {
  const router = useRouter();
  const statusBadge = STATUS[a.status] || STATUS.default;
  const team = teamColorVars(a.team);

  return (
    <div
      className="mb-2 cursor-pointer rounded-lg border bg-card px-3.5 py-3.5 transition-all hover:-translate-y-px hover:shadow-sm"
      onClick={() => onOpen(a.id)}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className="cursor-pointer border-transparent bg-muted text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            router.push('/problems/' + a.problem);
          }}
        >
          {a.problem}
        </Badge>
        <Badge variant="outline" className="border-transparent" style={{ background: team.bg, color: team.color }}>
          {a.team}
        </Badge>
        <Badge variant="outline" className={'border-transparent ' + statusBadge.tone}>{statusBadge.label}</Badge>
      </div>
      <div className="mb-1.5 text-xs font-semibold">{a.intervention || a.title}</div>
      <div className="mb-1 flex justify-between gap-2.5 text-[11px]">
        <span className="text-muted-foreground">Target</span>
        <span className="truncate text-right text-foreground/80">{a.targetMetric || '—'}</span>
      </div>
      <div className="mb-1 flex justify-between gap-2.5 text-[11px]">
        <span className="text-muted-foreground">Current Result</span>
        <span className="truncate text-right text-foreground/80">{a.currentResult || 'Not started'}</span>
      </div>
      <div className="my-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground transition-all" style={{ width: (a.progressPct || 0) + '%' }} />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="flex size-4.5 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-foreground/70">{initials(a.owner)}</span>
          {a.owner}
        </span>
        <span>Due {a.deadline}</span>
      </div>
    </div>
  );
}
