'use client';

import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Users,
  AlertTriangle,
  Shield,
  Eye,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PRIORITY_TONE = {
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
  high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  low: 'bg-muted text-muted-foreground',
};

const ACTIVITY_ICONS = {
  spark: Sparkles,
  check: CheckCircle2,
  users: Users,
  alert: AlertTriangle,
  shield: Shield,
};

export default function AttentionPanel({ recommendation, alerts, activity }) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_1px_3px_oklch(0_0_0/0.04)]">
        <div className="text-[13px] font-semibold text-foreground">Needs Attention</div>

        <div className="rounded-xl bg-amber-500/5 p-3.5 ring-1 ring-amber-500/15">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
            <Sparkles className="size-3.5" />
            {recommendation.title}
          </div>
          <p className="text-[13px] leading-snug text-foreground">{recommendation.body}</p>
          {recommendation.problemId ? (
            <Link
              href={`/problems/${recommendation.problemId}`}
              className="mt-2 inline-block text-[11px] font-medium text-primary hover:underline"
            >
              Open problem workspace →
            </Link>
          ) : null}
        </div>

        <ul className="flex flex-col gap-2.5">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-xl p-3 ring-1 ring-foreground/8 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      PRIORITY_TONE[a.priority] || PRIORITY_TONE.low,
                    )}
                  >
                    {a.priority}
                  </span>
                  <span className="text-[12px] font-semibold">{a.title}</span>
                </div>
                <p className="line-clamp-2 text-[11px] text-muted-foreground">{a.detail}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground">
                  <span>{a.customers.toLocaleString()} affected</span>
                  <span>{a.department}</span>
                </div>
              </div>
              <Link
                href={a.href}
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'shrink-0')}
              >
                <Eye data-icon="inline-start" />
                View
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_1px_3px_oklch(0_0_0/0.04)]">
        <div className="mb-4 text-[13px] font-semibold text-foreground">Recent Activity</div>
        <ol className="relative flex flex-col gap-0 border-l border-foreground/10 ml-2">
          {activity.map((item, i) => {
            const Icon = ACTIVITY_ICONS[item.icon] || Sparkles;
            return (
              <li key={`${item.time}-${i}`} className="relative pb-5 pl-5 last:pb-0">
                <span className="absolute -left-[9px] top-0 flex size-4 items-center justify-center rounded-full bg-card ring-2 ring-foreground/10">
                  <Icon className="size-2.5 text-muted-foreground" />
                </span>
                <div className="font-mono text-[10.5px] text-muted-foreground">{item.time}</div>
                <div className="mt-0.5 text-[12.5px] leading-snug text-foreground">{item.text}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
