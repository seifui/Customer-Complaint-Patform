'use client';

import { useStore } from '@/lib/store';
import { buildDashboardMetrics } from '@/lib/dashboardMetrics';
import KpiRow from '@/components/dashboard/KpiRow';
import {
  ConcernVolumeChart,
  ResolutionTrendChart,
  StatusDonutChart,
  SeverityPieChart,
  ChannelBarChart,
} from '@/components/dashboard/Charts';
import DepartmentTable from '@/components/dashboard/DepartmentTable';
import AttentionPanel from '@/components/dashboard/AttentionPanel';

export default function DashboardClient() {
  const problems = useStore((s) => s.problems);
  const concerns = useStore((s) => s.concerns);
  const metrics = buildDashboardMetrics(concerns, problems);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section>
        <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">Operational Health</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatusDonutChart data={metrics.statusDistribution} />
          <SeverityPieChart data={metrics.severityDistribution} />
          <ChannelBarChart data={metrics.channelDistribution} />
        </div>
      </section>

      <DepartmentTable departments={metrics.departments} />

      <KpiRow kpis={metrics.kpis} />

      <section>
        <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">Company Trends</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ConcernVolumeChart data={metrics.concernVolume} />
          <ResolutionTrendChart data={metrics.resolutionTrend} />
        </div>
      </section>

      <AttentionPanel
        recommendation={metrics.recommendation}
        alerts={metrics.alerts}
        activity={metrics.activity}
      />
    </div>
  );
}
