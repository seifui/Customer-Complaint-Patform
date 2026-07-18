'use client';

import { useState } from 'react';
import {
  Inbox,
  Loader2,
  MessageCircle,
  CheckCircle2,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { buildStaffDashboardMetrics } from '@/lib/staffDashboardMetrics';
import { StatusDonutChart, StaffResolvedChart } from '@/components/dashboard/Charts';
import { SevBadge, PrimaryStatusBadge } from '@/components/Badges';
import ConcernDetailPanel from '@/components/ConcernDetailPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const KPI_ICONS = {
  open: Inbox,
  inProgress: Loader2,
  waiting: MessageCircle,
  resolvedToday: CheckCircle2,
  total: Layers,
};

function StaffKpiRow({ kpis }) {
  return (
    <section>
      <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">My Workload</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => {
          const Icon = KPI_ICONS[k.key] || Inbox;
          return (
            <div
              key={k.key}
              className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 shadow-[0_1px_3px_oklch(0_0_0/0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_oklch(0_0_0/0.08)]"
            >
              <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] tracking-wide text-muted-foreground uppercase">
                <span className={cn('flex size-6.5 items-center justify-center rounded-full', k.tone)}>
                  <Icon className="size-3.5" />
                </span>
                {k.label}
              </div>
              <div className="text-[22px] font-bold tracking-tight">{k.value}</div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">{k.sub}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NeedsAttentionTable({ rows, onOpen }) {
  return (
    <section>
      <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">Needs Attention</div>
      <Card className="gap-0 overflow-hidden py-0">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
            Nothing urgent — all your open concerns are in good shape.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[12.5px]">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b text-[10.5px] tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Concern</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Journey</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Age</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <SevBadge s={r.severity} />
                        {r.flagged ? (
                          <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">Flagged</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] font-medium text-foreground">{r.id}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-foreground">{r.customer}</td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground">{r.journey}</td>
                    <td className="px-4 py-3">
                      <PrimaryStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{r.age}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onOpen(r.id)}>
                        Open
                        <ExternalLink className="size-3.5 opacity-60" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

export default function StaffDashboardClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const [openId, setOpenId] = useState(null);
  const metrics = buildStaffDashboardMetrics(concerns, session);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <StaffKpiRow kpis={metrics.kpis} />

      <section>
        <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">My Performance</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StaffResolvedChart data={metrics.resolutionTrend} />
          <StatusDonutChart
            data={metrics.workloadDistribution}
            title="Current Workload"
            subtitle="Open · In Progress · Waiting · Resolved · Closed"
          />
        </div>
      </section>

      <NeedsAttentionTable rows={metrics.needsAttention} onOpen={setOpenId} />

      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </div>
  );
}
