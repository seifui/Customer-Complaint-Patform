import { CHANNEL_ICON } from '@/lib/data';
import { statusLabel, statusBadgeClass, confClass, workflowStatusLabel, workflowStatusBadgeClass } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DOT = 'before:mr-0.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:opacity-85';

const TONE = {
  red: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
  green: 'bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  muted: 'bg-muted text-muted-foreground',
};

const SEV_TONE = { critical: 'red', high: 'orange', medium: 'blue', low: 'muted' };
const SNT_TONE = { angry: 'red', frustrated: 'orange', neutral: 'muted', positive: 'green' };
const STATUS_TONE = { 'st-new': 'muted', 'st-analyzing': 'violet', 'st-linked': 'blue', 'st-monitoring': 'cyan', 'st-resolved': 'green' };
const CONF_TONE = { 'conf-confirmed': 'green', 'conf-estimated': 'orange', 'conf-ai-modelled': 'violet' };
const WF_TONE = {
  'wf-new': 'muted',
  'wf-assigned-department': 'blue',
  'wf-assigned-member': 'violet',
  'wf-in-progress': 'orange',
  'wf-waiting-customer': 'cyan',
  'wf-resolved': 'green',
  'wf-deployed-production': 'blue',
  'wf-closed': 'muted',
};

function ToneBadge({ tone, children }) {
  return <Badge variant="outline" className={cn('border-transparent', DOT, TONE[tone] || TONE.muted)}>{children}</Badge>;
}

export function SevBadge({ s }) {
  return <ToneBadge tone={SEV_TONE[s] || 'muted'}>{s.charAt(0).toUpperCase() + s.slice(1)}</ToneBadge>;
}

export function SntBadge({ s }) {
  return <ToneBadge tone={SNT_TONE[s] || 'muted'}>{s.charAt(0).toUpperCase() + s.slice(1)}</ToneBadge>;
}

export function StatusBadge({ s }) {
  return <ToneBadge tone={STATUS_TONE[statusBadgeClass(s)] || 'muted'}>{statusLabel(s)}</ToneBadge>;
}

export function ChBadge({ c }) {
  return (
    <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
      {CHANNEL_ICON[c] || '•'} {c}
    </Badge>
  );
}

export function ConfBadge({ label }) {
  return <ToneBadge tone={CONF_TONE[confClass(label)] || 'muted'}>{label}</ToneBadge>;
}

export function WfBadge({ s }) {
  return <ToneBadge tone={WF_TONE[workflowStatusBadgeClass(s)] || 'muted'}>{workflowStatusLabel(s)}</ToneBadge>;
}

export function TriageBadge({ tri }) {
  return (
    <Badge variant="outline" className="border-transparent" style={{ background: tri.bg, color: tri.color }}>
      {tri.label}
    </Badge>
  );
}
