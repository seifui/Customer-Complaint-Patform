import { CHANNEL_ICON } from '@/lib/data';
import { statusLabel, statusBadgeClass, confClass } from '@/lib/helpers';

export function SevBadge({ s }) {
  return <span className={'badge sev-' + s}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
}

export function SntBadge({ s }) {
  return <span className={'badge snt-' + s}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
}

export function StatusBadge({ s }) {
  return <span className={'badge ' + statusBadgeClass(s)}>{statusLabel(s)}</span>;
}

export function ChBadge({ c }) {
  return (
    <span className="badge ch-badge">
      {CHANNEL_ICON[c] || '•'} {c}
    </span>
  );
}

export function ConfBadge({ label }) {
  return <span className={'badge ' + confClass(label)}>{label}</span>;
}

export function TriageBadge({ tri }) {
  return (
    <span className="badge" style={{ background: tri.bg, color: tri.color }}>
      {tri.label}
    </span>
  );
}
