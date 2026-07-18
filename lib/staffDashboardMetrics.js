import {
  formatAge,
  num,
  primaryStatusOf,
  primaryStatusLabel,
  workflowStatusOf,
} from '@/lib/helpers';

const OPEN_PRIMARY = new Set(['new', 'in-review', 'assigned', 'escalated']);
const IN_PROGRESS_WF = new Set(['in-progress', 'assigned-member', 'assigned-department']);
const IN_PROGRESS_PRIMARY = new Set(['in-review', 'assigned']);
const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

function parseStamp(s) {
  if (!s) return null;
  const d = new Date(String(s).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isResolvedConcern(c) {
  return primaryStatusOf(c) === 'resolved' || c.externalTicketStatus === 'Resolved';
}

function isOpenConcern(c) {
  return !isResolvedConcern(c) && OPEN_PRIMARY.has(primaryStatusOf(c));
}

function isWaitingCustomer(c) {
  return workflowStatusOf(c) === 'waiting-customer';
}

function isInProgress(c) {
  if (isResolvedConcern(c) || isWaitingCustomer(c)) return false;
  const wf = workflowStatusOf(c);
  if (IN_PROGRESS_WF.has(wf)) return true;
  return IN_PROGRESS_PRIMARY.has(primaryStatusOf(c));
}

function resolvedAt(c) {
  return parseStamp(c.closedAt) || parseStamp(c.updatedAt);
}

function isResolvedOnDay(c, key) {
  if (!isResolvedConcern(c)) return false;
  const at = resolvedAt(c);
  return at && dayKey(at) === key;
}

/** Concerns raised by the logged-in staff member (same filter as Raised Concerns). */
export function filterMyRaisedConcerns(concerns, session) {
  if (!session?.role) return [];
  return concerns.filter((c) => c.demoRaisedConcerns || c.createdBy === session.role);
}

function urgencyScore(c) {
  let score = SEV_RANK[c.severity] ?? 4;
  const tags = Array.isArray(c.tags) ? c.tags : [];
  if (tags.includes('sla') || tags.includes('escalation') || c.triageOverride === 'escalation') {
    score -= 2;
  }
  const created = parseStamp(c.createdAt);
  const ageHours = created ? (Date.now() - created.getTime()) / 3600000 : 0;
  // Older open items float up slightly within the same severity band
  score -= Math.min(1.5, ageHours / (24 * 14));
  return score;
}

/**
 * Build personal "My Work" metrics for Admin (front-line ops).
 * To-dos, workload, and completed tasks — not org-wide ops health.
 * No company baselines — honest zeros when the raised set is empty.
 */
export function buildStaffDashboardMetrics(concerns, session, now = new Date()) {
  const mine = filterMyRaisedConcerns(concerns, session);
  const todayKey = dayKey(now);
  const open = mine.filter(isOpenConcern);
  const inProgress = mine.filter(isInProgress);
  const waiting = mine.filter(isWaitingCustomer);
  const resolvedToday = mine.filter((c) => isResolvedOnDay(c, todayKey));

  // Last 7 days resolved series (oldest → newest)
  const resolutionTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    resolutionTrend.push({
      date: key,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      resolved: mine.filter((c) => isResolvedOnDay(c, key)).length,
    });
  }

  // Workload donut buckets (honest counts — no soft-fill)
  const statusBuckets = {
    Open: 0,
    'In Progress': 0,
    Waiting: 0,
    Resolved: 0,
    Closed: 0,
  };
  for (const c of mine) {
    const wf = workflowStatusOf(c);
    if (wf === 'closed') statusBuckets.Closed += 1;
    else if (isResolvedConcern(c)) statusBuckets.Resolved += 1;
    else if (isWaitingCustomer(c)) statusBuckets.Waiting += 1;
    else if (isInProgress(c)) statusBuckets['In Progress'] += 1;
    else statusBuckets.Open += 1;
  }
  const workloadDistribution = Object.entries(statusBuckets).map(([name, value]) => ({ name, value }));

  const kpis = [
    {
      key: 'open',
      label: 'Open',
      value: num(open.length),
      sub: 'Still needing follow-up',
      tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: num(inProgress.length),
      sub: 'Being worked by teams',
      tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    {
      key: 'waiting',
      label: 'Waiting on Customer',
      value: num(waiting.length),
      sub: 'Awaiting customer reply',
      tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      key: 'resolvedToday',
      label: 'Resolved Today',
      value: num(resolvedToday.length),
      sub: 'Closed or resolved today',
      tone: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      key: 'total',
      label: 'Total Raised',
      value: num(mine.length),
      sub: 'All concerns you raised',
      tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  ];

  const needsAttention = [...open]
    .sort((a, b) => {
      const ua = urgencyScore(a);
      const ub = urgencyScore(b);
      if (ua !== ub) return ua - ub;
      const ta = parseStamp(a.createdAt)?.getTime() || 0;
      const tb = parseStamp(b.createdAt)?.getTime() || 0;
      return ta - tb;
    })
    .slice(0, 10)
    .map((c) => ({
      id: c.id,
      severity: c.severity,
      customer: c.customer,
      journey: c.journey,
      status: primaryStatusOf(c),
      statusLabel: primaryStatusLabel(primaryStatusOf(c)),
      age: formatAge(c.createdAt, now),
      flagged: Array.isArray(c.tags) && (c.tags.includes('sla') || c.tags.includes('escalation')),
    }));

  return {
    kpis,
    resolutionTrend,
    workloadDistribution,
    needsAttention,
    meta: { total: mine.length, open: open.length },
  };
}
