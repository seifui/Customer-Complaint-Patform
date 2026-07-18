// Pure helper functions ported from the HTML prototype. No DOM access here —
// components render the actual markup; these just compute values/labels.

export function money(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1e9) return 'Rs. ' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return 'Rs. ' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return 'Rs. ' + (n / 1e3).toFixed(0) + 'K';
  return 'Rs. ' + n;
}

/** Relative age from a "YYYY-MM-DD HH:mm" stamp, e.g. "3d 4h". */
export function formatAge(createdAt, now = new Date()) {
  if (!createdAt) return '—';
  const then = new Date(String(createdAt).replace(' ', 'T'));
  if (Number.isNaN(then.getTime())) return '—';
  let mins = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 60000));
  const days = Math.floor(mins / (60 * 24));
  mins -= days * 60 * 24;
  const hours = Math.floor(mins / 60);
  mins -= hours * 60;
  if (days > 0) return days + 'd ' + hours + 'h';
  if (hours > 0) return hours + 'h ' + mins + 'm';
  return mins + 'm';
}

export function num(n) {
  return n.toLocaleString();
}

export function statusLabel(s) {
  return (
    {
      'action-in-progress': 'Intervention In Progress',
      investigating: 'Investigating',
      'evidence-gathering': 'Gathering Evidence',
      resolved: 'Resolved',
    }[s] || s
  );
}

export function statusBadgeClass(s) {
  return (
    {
      'action-in-progress': 'st-linked',
      investigating: 'st-analyzing',
      'evidence-gathering': 'st-new',
      resolved: 'st-resolved',
    }[s] || 'st-new'
  );
}

export function confClass(label) {
  return 'conf-' + label.toLowerCase().replace(/ /g, '-');
}

export function initials(name) {
  if (!name || name === 'Unassigned') return '—';
  const parts = name
    .split(' ')
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (parts || name.slice(0, 2)).slice(0, 2).toUpperCase();
}

export function teamColorVars(team) {
  const map = {
    Technology: { bg: 'var(--blue-d)', color: 'var(--blue)' },
    'Digital Banking': { bg: 'var(--purple-d)', color: 'var(--purple)' },
    'Customer Service': { bg: 'var(--green-d)', color: 'var(--green)' },
    Product: { bg: 'var(--cyan-d)', color: 'var(--cyan)' },
    Leadership: { bg: 'var(--orange-d)', color: 'var(--orange)' },
  };
  return map[team] || { bg: 'var(--bg4)', color: 'var(--tx1)' };
}

/* ── value explainability ── */
export function getValueDetail(p, kind) {
  if (kind === 'risk') {
    if (p.valueAtRiskDetail) return p.valueAtRiskDetail;
    return {
      confidence: 'Estimated',
      customers: p.affectedCustomers,
      segments: [
        { name: 'Mass Retail', count: Math.round(p.affectedCustomers * 0.7) },
        { name: 'Premium / Wealth', count: Math.round(p.affectedCustomers * 0.18) },
        { name: 'SME', count: Math.round(p.affectedCustomers * 0.12) },
      ],
      products: [p.journey || p.title.split(' ').slice(0, 3).join(' ')],
      churnProbability:
        ((p.highChurnRisk / p.affectedCustomers) * 100).toFixed(1) +
        '% of affected customers show high churn-risk signals',
      calcText:
        'Value = average relationship revenue per segment × churn-probability uplift caused by this problem × number of customers per segment, derived from ' +
        num(p.concernCount) +
        ' linked concerns.',
      sources: [
        'Concern Queue signals linked to ' + p.id,
        'Channel-level concern volume (' + p.channels.join(', ') + ')',
      ],
      assumptions: [
        'Customers with repeated contact are treated as higher churn-probability',
        'Relationship value uses trailing-12-month average',
      ],
    };
  }
  if (p.valueProtectedDetail) return p.valueProtectedDetail;
  if (!p.impact.after) return null;
  return {
    confidence: 'AI Modelled',
    customers: p.impact.after.churnPrevented,
    calcText:
      'Modelled as the reduction in projected churn-driven value loss between the "before" and "after" cohorts for ' +
      p.id +
      ', based on the observed drop in repeat contacts and negative sentiment since the intervention began.',
    sources: ['Impact Monitoring data for ' + p.id + ' since ' + p.startedAt],
    assumptions: [
      'Assumes customers who stopped repeat-contacting were retained, not silently churned through another channel',
    ],
  };
}

/* ── triage (concern queue intelligence layer) ── */
export const TRIAGE_DEFS = {
  'urgent-individual': { label: 'Urgent Individual Case', shortLabel: 'Urgent', color: 'var(--red)', bg: 'var(--red-d)', order: 0 },
  'new-pattern': { label: 'New Pattern Emerging', shortLabel: 'New Pattern', color: 'var(--orange)', bg: 'var(--orange-d)', order: 1 },
  'needs-review': { label: 'Needs Human Review', shortLabel: 'Review', color: 'var(--blue)', bg: 'var(--blue-d)', order: 2 },
  duplicate: { label: 'Possible Duplicate / Noise', shortLabel: 'Duplicate', color: 'var(--tx2)', bg: 'var(--bg3)', order: 3 },
  connected: { label: 'Connected to Known Problem', shortLabel: 'Linked', color: 'var(--acc)', bg: 'var(--acc-d)', order: 4 },
  'not-a-concern': { label: 'Not a Concern', shortLabel: 'Dismissed', color: 'var(--green)', bg: 'var(--green-d)', order: 5 },
  repeat: { label: 'Repeat', shortLabel: 'Repeat', color: 'var(--orange)', bg: 'var(--orange-d)', order: 1 },
  escalation: { label: 'Escalation', shortLabel: 'Escalation', color: 'var(--red)', bg: 'var(--red-d)', order: 0 },
  spike: { label: 'Spike', shortLabel: 'Spike', color: 'var(--purple)', bg: 'var(--purple-d)', order: 1 },
  'raised-new': { label: 'New', shortLabel: 'New', color: 'var(--blue)', bg: 'var(--blue-d)', order: 2 },
};

export function triageInfo(c, problems) {
  let cat;
  if (c.triageOverride) {
    cat = c.triageOverride;
  } else if (!c.linked) {
    cat = c.severity === 'critical' ? 'urgent-individual' : 'needs-review';
  } else {
    const prob = problems.find((p) => p.id === c.linked);
    cat = prob && (prob.status === 'evidence-gathering' || prob.status === 'investigating') ? 'new-pattern' : 'connected';
  }
  const def = TRIAGE_DEFS[cat];
  const prob = c.linked ? problems.find((p) => p.id === c.linked) : null;
  let note;
  switch (cat) {
    case 'new-pattern':
      note = 'This concern may be part of an emerging pattern — ' + num(prob.concernCount) + ' similar signals linked to ' + prob.id + ' so far, still gathering evidence.';
      break;
    case 'connected':
      note = 'Connected to an actively-managed problem — ' + prob.id + ' (' + num(prob.concernCount) + ' linked concerns, ' + statusLabel(prob.status) + ').';
      break;
    case 'needs-review':
      note = 'No existing pattern matched yet — flagged for a human reviewer to confirm classification or escalate.';
      break;
    case 'duplicate':
      note = 'Looks like a repeat contact for an already-logged concern — likely the same underlying case, not a new signal.';
      break;
    case 'urgent-individual':
      note = 'Severity is critical but this looks like an isolated case, not yet part of a broader pattern — route for immediate individual handling.';
      break;
    case 'not-a-concern':
      note = 'Reads as a general inquiry or positive feedback rather than a complaint — no action needed beyond a normal service response.';
      break;
    case 'repeat':
      note = 'This customer has raised a similar concern before — likely a repeat contact for the same underlying issue.';
      break;
    case 'escalation':
      note = 'Escalated due to SLA breach or repeated unresolved contact — needs priority handling.';
      break;
    case 'spike':
      note = 'Volume spike detected — multiple similar signals arriving in a short window.';
      break;
    case 'raised-new':
      note = 'First reported instance of this issue — flagged as a new signal for review.';
      break;
    default:
      note = '';
  }
  return {
    cat,
    label: def.label,
    shortLabel: def.shortLabel || def.label,
    color: def.color,
    bg: def.bg,
    order: def.order,
    note,
  };
}

/* ── AI capture classification (simulated) ── */
export function classify(text) {
  const t = text.toLowerCase();
  const rules = [
    { id: 'PRB-2044', re: /transfer|interbank|debit(ed)?|credit(ed)?/, terms: 'transfer, interbank, debited/credited', conf: 88, journey: 'Money Transfer', issue: 'Failed / Stuck Transaction' },
    { id: 'PRB-2050', re: /atm|dispense/, terms: 'ATM, cash not dispensed', conf: 85, journey: 'ATM', issue: 'ATM Non-Dispense Debit' },
    { id: 'PRB-2048', re: /standing order|double.?debit|debited twice|duplicate debit/, terms: 'standing order, double debit', conf: 81, journey: 'Standing Orders', issue: 'Duplicate Debit' },
    { id: 'PRB-2045', re: /kyc|document|nic|onboard|reject/, terms: 'KYC, document, rejected', conf: 79, journey: 'KYC / Onboarding', issue: 'Document Rejection' },
    { id: 'PRB-2046', re: /card[\s\S]*(travel|abroad|overseas)|(travel|abroad)[\s\S]*card/, terms: 'card, travel/abroad', conf: 74, journey: 'Cards', issue: 'Card Blocked While Travelling' },
    { id: 'PRB-2047', re: /loan[\s\S]*(status|update|pending|checking)/, terms: 'loan, status update', conf: 70, journey: 'Loans', issue: 'Loan Status Inquiry' },
    { id: 'PRB-2049', re: /chatbot|dispute/, terms: 'chatbot, dispute', conf: 67, journey: 'Cards', issue: 'Chatbot Dispute Loop' },
  ];
  const match = rules.find((r) => r.re.test(t)) || null;

  let sentiment = 'neutral';
  if (/angry|furious|unacceptable|!!|fed up|disgust/.test(t)) sentiment = 'angry';
  else if (/frustrat|annoy|confus|disappoint/.test(t)) sentiment = 'frustrated';
  else if (/thank|great|good|happy|appreciate/.test(t)) sentiment = 'positive';

  let severity;
  if (match && (match.id === 'PRB-2044' || match.id === 'PRB-2050')) severity = 'critical';
  else if (match) severity = 'high';
  else severity = /urgent|immediately|no access|blocked|fail|zero balance|life savings/.test(t) ? 'high' : 'medium';

  let urgency = 'Medium';
  if (severity === 'critical' || /immediately|urgent|life savings|no access/.test(t)) urgency = 'High';
  else if (severity === 'low') urgency = 'Low';

  const lang = /[඀-෿]/.test(text)
    ? 'Sinhala'
    : /[஀-௿]/.test(text)
    ? 'Tamil'
    : /\b(mama|eka|salli|karapu|una|nane|kiyala|ain)\b/i.test(t)
    ? 'Sinhala (romanized)'
    : 'English';
  const custType = /new customer|opening (an )?account|just joined/.test(t) ? 'New customer' : 'Existing customer';

  return {
    target: match ? match.id : null,
    severity,
    sentiment,
    urgency,
    lang,
    custType,
    journey: match ? match.journey : 'Other',
    issueType: match ? match.issue : 'General Inquiry / Other',
    matchTerms: match ? match.terms : null,
    confidence: match ? match.conf : null,
  };
}

/* ── public customer-facing helpers (complaint landing: report / track / find) ── */
export function isValidSLMobile(v) {
  return /^(?:\+94|0)7\d{8}$/.test(v.replace(/[\s-]/g, ''));
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// A short, customer-facing status word for list rows (not the internal
// operational status stored on the concern). A concern the Operations
// Manager has formally closed always wins here — it's the one status a
// human has explicitly signed off on for the customer, so it overrides
// whatever the linked Problem's own aggregate status happens to be.
export function customerStatusLabel(concern, problem) {
  if (concern.workflowStatus === 'closed') return 'Resolved';
  if (!concern.linked) return concern.status === 'analyzing' ? 'Under Review' : 'Received';
  if (!problem) return 'Under Review';
  if (problem.status === 'resolved') return 'Resolved';
  if (problem.status === 'action-in-progress') return 'Fix In Progress';
  return 'Investigating';
}

// A longer, empathetic sentence for the tracking/timeline views. When a
// concern has been closed, this is the Operations Manager's own message
// (see lib/store.js#closeConcern) rather than a generic templated line —
// that's the whole point of requiring a message at close time.
export function friendlyStatus(concern, problem) {
  if (concern.workflowStatus === 'closed') {
    return concern.closureMessage || 'Your concern has been resolved. Please check and let us know if you need anything else.';
  }
  if (!concern.linked) {
    return concern.status === 'analyzing'
      ? 'Received — our team is reviewing this now.'
      : 'Received — this has been logged and is awaiting review.';
  }
  if (!problem) return 'Received — connected to an ongoing review.';
  if (problem.status === 'resolved') return 'Resolved. Thank you for your patience — this issue has been fixed.';
  if (problem.status === 'action-in-progress') return "Good news — we've identified this as part of a known issue, and a fix is already in progress.";
  return "We've connected this to a wider pattern that our team is actively investigating.";
}

/* ── internal department-routing workflow (Operations → Department → Team Member) ── */
export function nowStamp() {
  const now = new Date();
  return now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);
}

const WORKFLOW_STATUS_LABELS = {
  new: 'New',
  'assigned-department': 'Assigned to Department',
  'assigned-member': 'Assigned to Team Member',
  'in-progress': 'In Progress',
  'waiting-customer': 'Waiting for Customer',
  resolved: 'Resolved by Team',
  'deployed-production': 'Deployed to Production',
  closed: 'Closed',
};

// Work-progress statuses Admin / Super Admin can pick by hand — the earlier
// two (new, assigned-*) are set by Super Admin assignment actions. Closed is
// Super Admin only via Close Concern. Deliberately non-technical: engineering
// work lives in Jira/vendor systems (External Ticket); this tracks where the
// concern stands operationally.
export const MANUAL_STATUS_OPTIONS = ['in-progress', 'waiting-customer', 'resolved', 'deployed-production'];

export function workflowStatusOf(c) {
  return c.workflowStatus || 'new';
}

export function workflowStatusLabel(s) {
  return WORKFLOW_STATUS_LABELS[s] || s;
}

export function workflowStatusBadgeClass(s) {
  return 'wf-' + s;
}

// Broad queue status tabs — coarser than workflowStatus, one bucket per concern.
export const PRIMARY_STATUS_TABS = [
  { key: 'all', label: 'All Concerns' },
  { key: 'new', label: 'New' },
  { key: 'in-review', label: 'In Review' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'escalated', label: 'Escalated' },
];

export function primaryStatusOf(c) {
  const wf = workflowStatusOf(c);

  if (wf === 'closed' || wf === 'resolved' || wf === 'deployed-production') return 'resolved';
  if (c.triageOverride === 'escalation') return 'escalated';
  if (wf === 'assigned-department' || wf === 'assigned-member') return 'assigned';
  if (wf === 'in-progress' || wf === 'waiting-customer') return 'in-review';

  // Seed/legacy records often omit workflowStatus; infer from classification fields.
  if (c.status === 'analyzing') return 'in-review';
  if (c.status === 'linked' && c.assignee && c.assignee !== '—') return 'assigned';

  return 'new';
}

export function primaryStatusLabel(key) {
  return PRIMARY_STATUS_TABS.find((t) => t.key === key)?.label || key;
}

// Concerns seeded before this workflow existed have no activityTimeline —
// synthesize a reasonable one from fields that were always there, rather
// than requiring every seed record to be hand-edited.
export function getTimeline(c) {
  if (c.activityTimeline && c.activityTimeline.length) return c.activityTimeline;
  const events = [
    { type: 'created', label: 'Concern Created', by: c.createdBy || 'Customer', at: c.createdAt },
    { type: 'ai-classified', label: 'AI Classification Completed', detail: c.severity + ' severity · ' + c.journey, by: 'AI Engine', at: c.createdAt },
  ];
  if (c.linked) {
    events.push({ type: 'assigned-department', label: 'Connected to a known problem pattern', by: 'AI Engine', at: c.createdAt });
  }
  return events;
}
