import { DEPARTMENTS } from '@/lib/data';
import { money, num, primaryStatusOf, workflowStatusOf } from '@/lib/helpers';

/** Departments highlighted on the executive performance table. */
export const DASHBOARD_DEPARTMENTS = [
  'Technology',
  'Loans',
  'Cards',
  'ATM Operations',
  'Digital Banking',
  'Customer Service',
];

const DEPT_OWNERS = {
  Technology: 'Sanduni Rajapakse',
  Loans: 'Dilani W.',
  Cards: 'Cards Ops Lead',
  'ATM Operations': 'Head of ATM Operations',
  'Digital Banking': 'Ishara Jayasuriya',
  'Customer Service': 'Dilani W.',
};

/** Demo baseline metrics when live concern volume is thin. */
const DEPT_BASELINE = {
  Technology: { open: 42, resolvedToday: 18, slaPct: 91, avgHours: 4.2, critical: 8, trend: [38, 40, 41, 44, 42, 43, 42] },
  Loans: { open: 28, resolvedToday: 9, slaPct: 84, avgHours: 18.5, critical: 3, trend: [22, 24, 25, 27, 29, 28, 28] },
  Cards: { open: 19, resolvedToday: 11, slaPct: 94, avgHours: 3.1, critical: 2, trend: [21, 20, 19, 18, 19, 18, 19] },
  'ATM Operations': { open: 15, resolvedToday: 7, slaPct: 88, avgHours: 5.8, critical: 5, trend: [10, 11, 12, 14, 15, 16, 15] },
  'Digital Banking': { open: 31, resolvedToday: 14, slaPct: 92, avgHours: 2.8, critical: 4, trend: [26, 27, 28, 30, 31, 30, 31] },
  'Customer Service': { open: 24, resolvedToday: 22, slaPct: 96, avgHours: 1.6, critical: 1, trend: [28, 26, 25, 24, 23, 24, 24] },
};

const OPEN_PRIMARY = new Set(['new', 'in-review', 'assigned', 'escalated']);

function parseStamp(s) {
  if (!s) return null;
  const d = new Date(String(s).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

function isResolvedConcern(c) {
  return primaryStatusOf(c) === 'resolved' || c.externalTicketStatus === 'Resolved';
}

function isOpenConcern(c) {
  return !isResolvedConcern(c) && OPEN_PRIMARY.has(primaryStatusOf(c));
}

/** Deterministic 30-day series for trend charts (demo / API placeholder). */
export const CONCERN_VOLUME_SERIES = (() => {
  const out = [];
  const start = new Date('2026-06-17T00:00:00');
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const wave = Math.sin(i / 4) * 8;
    out.push({
      date: dayKey(d),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      new: Math.round(38 + wave + (i % 5) * 1.2),
      resolved: Math.round(32 + wave * 0.7 + (i % 4)),
      escalated: Math.round(4 + Math.max(0, Math.sin(i / 3) * 3)),
    });
  }
  return out;
})();

export const RESOLUTION_TREND_SERIES = (() => {
  const out = [];
  const start = new Date('2026-06-17T00:00:00');
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const wave = Math.cos(i / 5) * 6;
    out.push({
      date: dayKey(d),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      resolved: Math.round(30 + wave + (i % 3)),
      reopened: Math.round(3 + Math.max(0, Math.sin(i / 4) * 2)),
      slaBreached: Math.round(2 + Math.max(0, Math.sin(i / 6 + 1) * 2.5)),
    });
  }
  return out;
})();

function sparkFromSeries(values) {
  return values.map((v, i) => ({ i, v }));
}

export function formatDurationHours(hours) {
  if (hours == null || Number.isNaN(hours)) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/**
 * Build all executive dashboard metrics from live concerns + problems,
 * with placeholder series where historical backend data is unavailable.
 */
export function buildDashboardMetrics(concerns, problems, now = new Date()) {
  const openConcerns = concerns.filter(isOpenConcern);
  const criticalConcerns = concerns.filter((c) => c.severity === 'critical' && !isResolvedConcern(c));
  const openProblems = problems.filter((p) => p.status !== 'resolved');
  const valueAtRisk = openProblems.reduce((s, p) => s + (p.valueAtRisk || 0), 0);
  const customersAffected = openProblems.reduce((s, p) => s + (p.affectedCustomers || 0), 0);
  const rapidlyGrowing = problems.filter((p) => p.trendPct >= 50).length;

  const todayKey = dayKey(now);
  const resolvedToday = concerns.filter((c) => {
    if (!isResolvedConcern(c)) return false;
    const u = parseStamp(c.updatedAt);
    return u && dayKey(u) === todayKey;
  }).length;

  // WoW open-concern delta — placeholder when history is unavailable
  const openWowPct = -8;
  const customersWowPct = 14;
  const slaCompliancePct = 94.2;
  const slaTrendPct = 1.4;

  const slaBreached = concerns.filter(
    (c) => Array.isArray(c.tags) && c.tags.includes('sla') && !isResolvedConcern(c),
  );
  const onTrackCount = Math.max(0, openConcerns.length - slaBreached.length);
  const derivedSla =
    openConcerns.length > 0
      ? Math.round(((onTrackCount / openConcerns.length) * 1000) / 10)
      : slaCompliancePct;

  const kpis = [
    {
      key: 'open',
      label: 'Open Concerns',
      value: num(openConcerns.length),
      sub: `${openWowPct >= 0 ? '↑' : '↓'}${Math.abs(openWowPct)}% vs last week`,
      trendUp: openWowPct < 0,
      tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      spark: sparkFromSeries([48, 46, 45, 44, 42, 41, 40, openConcerns.length || 38]),
    },
    {
      key: 'critical',
      label: 'Critical Concerns',
      value: num(criticalConcerns.length),
      sub: 'Requires immediate attention',
      trendUp: false,
      tone: 'bg-red-500/10 text-red-600 dark:text-red-400',
      spark: sparkFromSeries([3, 4, 5, 4, 6, 5, 5, criticalConcerns.length || 5]),
    },
    {
      key: 'risk',
      label: 'Value at Risk',
      value: money(valueAtRisk),
      sub: `${num(customersAffected)} customers affected`,
      trendUp: false,
      tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      spark: sparkFromSeries([2.1, 2.0, 2.2, 2.3, 2.4, 2.3, 2.2, valueAtRisk / 1e9 || 2.1]),
    },
    {
      key: 'affected',
      label: 'Customers Affected',
      value: num(customersAffected),
      sub: `↑${customersWowPct}% across open problems`,
      trendUp: false,
      tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      spark: sparkFromSeries([14200, 15100, 15800, 16500, 17200, 17800, 18100, customersAffected || 18400]),
    },
    {
      key: 'sla',
      label: 'SLA Compliance',
      value: `${derivedSla}%`,
      sub: `↑${slaTrendPct}% vs prior period`,
      trendUp: true,
      tone: 'bg-green-500/10 text-green-600 dark:text-green-400',
      spark: sparkFromSeries([91, 92, 92.5, 93, 93.5, 94, 94.1, derivedSla]),
      note: 'Demo proxy from open vs SLA-tagged concerns',
    },
    {
      key: 'growing',
      label: 'Rapidly Growing',
      value: String(rapidlyGrowing),
      sub: 'Problems trending ↑50%+',
      trendUp: false,
      tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      spark: sparkFromSeries([2, 3, 3, 4, 4, 3, 4, rapidlyGrowing]),
    },
  ];

  // Status distribution — map to executive buckets
  const statusBuckets = {
    New: 0,
    Assigned: 0,
    'In Progress': 0,
    'Waiting Customer': 0,
    Resolved: 0,
    Closed: 0,
  };
  for (const c of concerns) {
    const wf = workflowStatusOf(c);
    const primary = primaryStatusOf(c);
    if (wf === 'closed') statusBuckets.Closed += 1;
    else if (primary === 'resolved' || wf === 'resolved' || wf === 'deployed-production') statusBuckets.Resolved += 1;
    else if (wf === 'waiting-customer') statusBuckets['Waiting Customer'] += 1;
    else if (wf === 'in-progress' || primary === 'in-review') statusBuckets['In Progress'] += 1;
    else if (primary === 'assigned' || wf === 'assigned-department' || wf === 'assigned-member') statusBuckets.Assigned += 1;
    else statusBuckets.New += 1;
  }
  // Soft-fill when seed volume is tiny so charts aren't empty-looking
  if (concerns.length < 40) {
    statusBuckets.New = Math.max(statusBuckets.New, 12);
    statusBuckets.Assigned = Math.max(statusBuckets.Assigned, 18);
    statusBuckets['In Progress'] = Math.max(statusBuckets['In Progress'], 22);
    statusBuckets['Waiting Customer'] = Math.max(statusBuckets['Waiting Customer'], 8);
    statusBuckets.Resolved = Math.max(statusBuckets.Resolved, 45);
    statusBuckets.Closed = Math.max(statusBuckets.Closed, 14);
  }
  const statusDistribution = Object.entries(statusBuckets).map(([name, value]) => ({ name, value }));

  const severityBuckets = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const c of concerns) {
    const key = c.severity ? c.severity.charAt(0).toUpperCase() + c.severity.slice(1) : 'Low';
    if (severityBuckets[key] != null) severityBuckets[key] += 1;
  }
  if (concerns.length < 40) {
    severityBuckets.Critical = Math.max(severityBuckets.Critical, 8);
    severityBuckets.High = Math.max(severityBuckets.High, 24);
    severityBuckets.Medium = Math.max(severityBuckets.Medium, 36);
    severityBuckets.Low = Math.max(severityBuckets.Low, 18);
  }
  const severityDistribution = Object.entries(severityBuckets).map(([name, value]) => ({ name, value }));

  const channelOrder = ['Call Centre', 'Branch', 'Email', 'Mobile App', 'Website', 'Social Media'];
  const channelCounts = {};
  for (const c of concerns) {
    let ch = c.channel || 'Other';
    if (ch === 'Digital App' || ch === 'App Review') ch = 'Mobile App';
    if (ch === 'WhatsApp') ch = 'Social Media';
    if (ch === 'Existing System') ch = 'Website';
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  }
  // Soft-fill demo channels
  const channelFill = {
    'Call Centre': 48,
    Branch: 32,
    Email: 28,
    'Mobile App': 22,
    Website: 12,
    'Social Media': 18,
  };
  const channelDistribution = channelOrder.map((name) => ({
    name,
    value: Math.max(channelCounts[name] || 0, channelFill[name] || 0),
  }));

  const departments = DASHBOARD_DEPARTMENTS.map((dept) => {
    const base = DEPT_BASELINE[dept] || {
      open: 10,
      resolvedToday: 4,
      slaPct: 90,
      avgHours: 4,
      critical: 1,
      trend: [10, 10, 10, 10, 10, 10, 10],
    };
    const deptConcerns = concerns.filter((c) => c.assignedDepartment === dept);
    const liveOpen = deptConcerns.filter(isOpenConcern).length;
    const liveCritical = deptConcerns.filter((c) => c.severity === 'critical' && !isResolvedConcern(c)).length;
    const liveResolvedToday = deptConcerns.filter((c) => {
      if (!isResolvedConcern(c)) return false;
      const u = parseStamp(c.updatedAt);
      return u && dayKey(u) === todayKey;
    }).length;

    return {
      department: dept === 'ATM Operations' ? 'ATM' : dept === 'Customer Service' ? 'Call Centre' : dept,
      departmentKey: dept,
      open: Math.max(liveOpen, base.open),
      resolvedToday: Math.max(liveResolvedToday, base.resolvedToday),
      slaPct: base.slaPct,
      avgResolution: formatDurationHours(base.avgHours),
      critical: Math.max(liveCritical, base.critical),
      trend: sparkFromSeries(base.trend),
      trendPct: base.trend[base.trend.length - 1] - base.trend[0],
      owner: DEPT_OWNERS[dept] || '—',
    };
  });

  const topGrowing = [...problems]
    .filter((p) => p.status !== 'resolved')
    .sort((a, b) => b.trendPct - a.trendPct)[0];

  const recommendation = topGrowing
    ? {
        title: 'Top AI Recommendation',
        body: `${topGrowing.title} is up ${topGrowing.trendPct}% over ${topGrowing.trendWindow}. Recommend immediate executive review.`,
        problemId: topGrowing.id,
      }
    : {
        title: 'Top AI Recommendation',
        body: 'Loan Approval delays increased 28% this week. Recommend immediate review.',
        problemId: null,
      };

  const alerts = [];
  for (const c of slaBreached.slice(0, 2)) {
    alerts.push({
      id: `sla-${c.id}`,
      priority: 'critical',
      title: 'Critical SLA breach',
      detail: c.summary || c.raw,
      customers: 1,
      department: c.assignedDepartment || '—',
      href: `/queue/${c.id}`,
    });
  }
  const vip = concerns.filter((c) => Array.isArray(c.tags) && c.tags.includes('vip') && !isResolvedConcern(c));
  for (const c of vip.slice(0, 1)) {
    alerts.push({
      id: `vip-${c.id}`,
      priority: 'high',
      title: 'VIP customer concern',
      detail: c.summary || c.raw,
      customers: 1,
      department: c.assignedDepartment || '—',
      href: `/queue/${c.id}`,
    });
  }
  for (const d of departments.filter((d) => d.slaPct < 90).slice(0, 2)) {
    alerts.push({
      id: `dept-${d.departmentKey}`,
      priority: 'high',
      title: 'Department below SLA',
      detail: `${d.department} at ${d.slaPct}% SLA compliance`,
      customers: d.open,
      department: d.department,
      href: '/queue',
    });
  }
  for (const p of problems.filter((p) => p.trendPct >= 50 && p.status !== 'resolved').slice(0, 2)) {
    alerts.push({
      id: `emerge-${p.id}`,
      priority: p.severity === 'critical' ? 'critical' : 'medium',
      title: 'Emerging issue',
      detail: p.title,
      customers: p.affectedCustomers || 0,
      department: p.owner?.includes('ATM') ? 'ATM' : p.owner?.split('—')[0]?.trim() || '—',
      href: `/problems/${p.id}`,
    });
  }
  const fraud = concerns.filter(
    (c) => c.assignedDepartment === 'Fraud' || (Array.isArray(c.tags) && c.tags.includes('fraud')),
  );
  for (const c of fraud.slice(0, 1)) {
    alerts.push({
      id: `fraud-${c.id}`,
      priority: 'high',
      title: 'Fraud-related concern',
      detail: c.summary || c.raw,
      customers: 1,
      department: c.assignedDepartment || 'Fraud',
      href: `/queue/${c.id}`,
    });
  }
  // Ensure a full demo set
  if (alerts.length < 4) {
    alerts.push(
      {
        id: 'demo-sla',
        priority: 'critical',
        title: 'Critical SLA breaches',
        detail: '3 high-value transfer cases past SLA in Technology',
        customers: 3,
        department: 'Technology',
        href: '/queue',
      },
      {
        id: 'demo-fraud',
        priority: 'medium',
        title: 'Fraud-related concerns',
        detail: 'Card travel-block pattern under review',
        customers: 2,
        department: 'Fraud',
        href: '/queue',
      },
    );
  }

  const activity = [
    { time: '09:15', icon: 'spark', text: 'AI detected ATM outage pattern across 2 regions' },
    { time: '09:11', icon: 'check', text: 'Customer Service resolved 42 concerns' },
    { time: '09:02', icon: 'users', text: 'Technology assigned 18 concerns' },
    { time: '08:45', icon: 'alert', text: 'Emerging problem detected — standing-order double debit' },
    { time: '08:30', icon: 'shield', text: 'SLA watchlist updated for Loans department' },
    { time: '08:12', icon: 'spark', text: 'Duplicate cluster merged — 6 transfer concerns' },
  ];

  return {
    kpis,
    resolvedToday,
    concernVolume: CONCERN_VOLUME_SERIES,
    resolutionTrend: RESOLUTION_TREND_SERIES,
    statusDistribution,
    severityDistribution,
    channelDistribution,
    departments,
    recommendation,
    alerts: alerts.slice(0, 6),
    activity,
    meta: {
      departmentCount: DEPARTMENTS.length,
      concernCount: concerns.length,
      problemCount: problems.length,
    },
  };
}
