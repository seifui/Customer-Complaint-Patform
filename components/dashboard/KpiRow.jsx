'use client';

import {
  Inbox,
  ShieldAlert,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Sparkline } from './Charts';
import { cn } from '@/lib/utils';

const ICONS = {
  open: Inbox,
  critical: AlertTriangle,
  risk: ShieldAlert,
  affected: Users,
  sla: Clock,
  growing: TrendingUp,
};

export default function KpiRow({ kpis }) {
  return (
    <section>
      <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">Executive Summary</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => {
          const Icon = ICONS[k.key] || Inbox;
          return (
            <div
              key={k.key}
              className="group rounded-2xl bg-card p-4 ring-1 ring-foreground/10 shadow-[0_1px_3px_oklch(0_0_0/0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_oklch(0_0_0/0.08)]"
            >
              <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] tracking-wide text-muted-foreground uppercase">
                <span className={cn('flex size-6.5 items-center justify-center rounded-full', k.tone)}>
                  <Icon className="size-3.5" />
                </span>
                {k.label}
              </div>
              <div className="text-[22px] font-bold tracking-tight">{k.value}</div>
              <div
                className={cn(
                  'mt-1.5 text-[11px]',
                  k.trendUp ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground',
                )}
              >
                {k.sub}
              </div>
              <Sparkline data={k.spark} positive={k.trendUp} className="mt-2 opacity-80 group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
