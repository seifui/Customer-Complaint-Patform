'use client';

import {
  statusLabel,
  statusBadgeClass,
  confClass,
  workflowStatusLabel,
  workflowStatusBadgeClass,
  primaryStatusLabel,
} from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const TONE = {
  red: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
  green: 'bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  muted: 'bg-muted text-muted-foreground',
};

const SEV_TONE = { critical: 'red', high: 'orange', medium: 'blue', low: 'muted' };
const SNT_TONE = { angry: 'red', frustrated: 'orange', neutral: 'muted', positive: 'green', 'very-angry': 'red', negative: 'orange' };
const SNT_LABEL = { angry: 'Angry', frustrated: 'Frustrated', neutral: 'Neutral', positive: 'Positive', 'very-angry': 'Very Angry', negative: 'Negative' };
const STATUS_TONE = { 'st-new': 'muted', 'st-analyzing': 'violet', 'st-linked': 'blue', 'st-monitoring': 'cyan', 'st-resolved': 'green' };
const CONF_TONE = { 'conf-confirmed': 'green', 'conf-estimated': 'orange', 'conf-ai-modelled': 'violet' };
const PRIMARY_STATUS_TONE = {
  new: 'blue',
  'in-review': 'amber',
  assigned: 'violet',
  resolved: 'green',
  escalated: 'red',
};
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
  return <Badge variant="outline" className={cn('border-transparent', TONE[tone] || TONE.muted)}>{children}</Badge>;
}

export function SevBadge({ s }) {
  return <ToneBadge tone={SEV_TONE[s] || 'muted'}>{s.charAt(0).toUpperCase() + s.slice(1)}</ToneBadge>;
}

export function SntBadge({ s }) {
  return <ToneBadge tone={SNT_TONE[s] || 'muted'}>{SNT_LABEL[s] || s.charAt(0).toUpperCase() + s.slice(1)}</ToneBadge>;
}

export function StatusBadge({ s }) {
  return <ToneBadge tone={STATUS_TONE[statusBadgeClass(s)] || 'muted'}>{statusLabel(s)}</ToneBadge>;
}

/** Queue primary-status pill — same buckets as the Concern Queue tabs. */
export function PrimaryStatusBadge({ status }) {
  return (
    <ToneBadge tone={PRIMARY_STATUS_TONE[status] || 'muted'}>{primaryStatusLabel(status)}</ToneBadge>
  );
}

export function ChBadge({ c }) {
  return <ToneBadge tone="muted">{c}</ToneBadge>;
}

export function ConfBadge({ label }) {
  return <ToneBadge tone={CONF_TONE[confClass(label)] || 'muted'}>{label}</ToneBadge>;
}

export function WfBadge({ s }) {
  return <ToneBadge tone={WF_TONE[workflowStatusBadgeClass(s)] || 'muted'}>{workflowStatusLabel(s)}</ToneBadge>;
}

/** Signal badge — short label on-screen; full label in tooltip (hover / tap). */
export function TriageBadge({ tri }) {
  const display = tri.shortLabel || tri.label;
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="inline-flex max-w-full cursor-default rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={tri.label}
        onClick={(e) => e.stopPropagation()}
      >
        <Badge
          variant="outline"
          className="border font-medium shadow-none"
          style={{
            background: tri.bg,
            color: tri.color,
            borderColor: `color-mix(in srgb, ${tri.color} 38%, transparent)`,
          }}
        >
          {display}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{tri.label}</TooltipContent>
    </Tooltip>
  );
}
