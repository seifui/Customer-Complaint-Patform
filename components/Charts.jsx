import { CHANNEL_ICON } from '@/lib/data';
import { num } from '@/lib/helpers';

export function BarList({ items, color }) {
  const barColor = color || 'var(--primary)';
  const max = Math.max(...items.map((i) => i.max || i.value));
  return (
    <div>
      {items.map((i) => (
        <div className="mb-2 flex items-center gap-2" key={i.label}>
          <div className="w-37.5 shrink-0 truncate text-[11px] text-foreground/80">
            {CHANNEL_ICON[i.label] ? CHANNEL_ICON[i.label] + ' ' : ''}
            {i.label}
          </div>
          <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all" style={{ width: (i.value / max) * 100 + '%', background: barColor }} />
          </div>
          <div className="w-13 shrink-0 text-right font-mono text-[11px] text-foreground/80">{num(i.value)}</div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ data, color }) {
  const lineColor = color || 'var(--primary)';
  const w = 560,
    h = 70,
    max = Math.max(...data),
    min = Math.min(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
      return x.toFixed(1) + ',' + y.toFixed(1);
    })
    .join(' ');
  const area = 'M0,' + h + ' L' + pts + ' L' + w + ',' + h + ' Z';
  return (
    <svg className="h-17.5 w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={area} fill={lineColor} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2" />
    </svg>
  );
}

export function TimeOfDayChart({ hourly, peakWindow }) {
  const max = Math.max(...hourly);
  return (
    <div>
      <div className="flex h-20 items-end gap-0.5">
        {hourly.map((v, h) => {
          const isPeak = v / max > 0.7;
          return (
            <div
              key={h}
              title={`${h}:00 — ${v}`}
              className="min-h-0.5 flex-1 rounded-t-sm"
              style={{
                height: (v / max) * 100 + '%',
                background: isPeak ? 'var(--red, #dc2626)' : 'var(--primary)',
                opacity: isPeak ? 1 : 0.55,
              }}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}
