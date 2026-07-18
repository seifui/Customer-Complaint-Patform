'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid oklch(0.5 0 0 / 0.12)',
  background: 'var(--card)',
  boxShadow: '0 4px 16px oklch(0 0 0 / 0.06)',
  fontSize: 12,
};

const GRID = 'var(--border)';
const AXIS = 'var(--muted-foreground)';

const STATUS_COLORS = {
  New: '#64748b',
  Open: '#64748b',
  Assigned: '#3b82f6',
  'In Progress': '#f59e0b',
  'Waiting Customer': '#06b6d4',
  Waiting: '#06b6d4',
  Resolved: '#22c55e',
  Closed: '#94a3b8',
};

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#3b82f6',
  Low: '#94a3b8',
};

export function ChartCard({ title, subtitle, children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 shadow-[0_1px_3px_oklch(0_0_0/0.04)] transition-shadow hover:shadow-[0_4px_12px_oklch(0_0_0/0.06)]',
        className,
      )}
    >
      <div>
        <div className="text-[13px] font-semibold text-foreground">{title}</div>
        {subtitle ? <div className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</div> : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function Sparkline({ data, positive = true, className }) {
  const stroke = positive ? '#22c55e' : '#ef4444';
  return (
    <div className={cn('h-8 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConcernVolumeChart({ data }) {
  return (
    <ChartCard title="Concern Volume" subtitle="New · Resolved · Escalated — last 30 days">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="new" name="New Concerns" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="escalated" name="Escalated" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function ResolutionTrendChart({ data }) {
  return (
    <ChartCard title="Resolution Trend" subtitle="Resolved · Reopened · SLA Breached — last 30 days">
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="resResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="resReopened" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="resBreach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#resResolved)" strokeWidth={2} />
            <Area type="monotone" dataKey="reopened" name="Reopened" stroke="#f59e0b" fill="url(#resReopened)" strokeWidth={2} />
            <Area type="monotone" dataKey="slaBreached" name="SLA Breached" stroke="#ef4444" fill="url(#resBreach)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function DonutLegend({ data, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ul className="flex flex-col gap-1.5 text-[11px]">
      {data.map((d) => (
        <li key={d.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: colors[d.name] || '#94a3b8' }} />
            {d.name}
          </span>
          <span className="font-mono text-foreground">
            {Math.round((d.value / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatusDonutChart({
  data,
  title = 'Concern Distribution',
  subtitle = 'By workflow status',
}) {
  const chartData = data.filter((d) => d.value > 0);
  const legendData = chartData.length ? chartData : data;
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-[180px] w-full max-w-[200px]">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <DonutLegend data={legendData} colors={STATUS_COLORS} />
      </div>
    </ChartCard>
  );
}

/** Personal dashboard — concerns resolved over the last 7 days. */
export function StaffResolvedChart({ data }) {
  return (
    <ChartCard title="Concerns Resolved" subtitle="Last 7 days">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="staffResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              allowDecimals={false}
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="resolved"
              name="Resolved"
              stroke="#22c55e"
              fill="url(#staffResolved)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function SeverityPieChart({ data }) {
  return (
    <ChartCard title="Severity Distribution" subtitle="Open concern mix">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-[180px] w-full max-w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={72} paddingAngle={2} strokeWidth={0}>
                {data.map((d) => (
                  <Cell key={d.name} fill={SEVERITY_COLORS[d.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <DonutLegend data={data} colors={SEVERITY_COLORS} />
      </div>
    </ChartCard>
  );
}

export function ChannelBarChart({ data }) {
  return (
    <ChartCard title="Channel Distribution" subtitle="Intake volume by channel">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
            <XAxis type="number" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Concerns" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
