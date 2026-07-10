import { CHANNEL_ICON } from '@/lib/data';
import { num } from '@/lib/helpers';

export function BarList({ items, color }) {
  const barColor = color || 'var(--acc)';
  const max = Math.max(...items.map((i) => i.max || i.value));
  return (
    <div>
      {items.map((i) => (
        <div className="bar-row" key={i.label}>
          <div className="bar-lbl">
            {CHANNEL_ICON[i.label] ? CHANNEL_ICON[i.label] + ' ' : ''}
            {i.label}
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: (i.value / max) * 100 + '%', background: barColor }} />
          </div>
          <div className="bar-val">{num(i.value)}</div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ data, color }) {
  const lineColor = color || 'var(--acc)';
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
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={area} fill={lineColor} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2" />
    </svg>
  );
}

export function TimeOfDayChart({ hourly, peakWindow }) {
  const max = Math.max(...hourly);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
        {hourly.map((v, h) => {
          const isPeak = v / max > 0.7;
          return (
            <div
              key={h}
              title={`${h}:00 — ${v}`}
              style={{
                flex: 1,
                height: (v / max) * 100 + '%',
                background: isPeak ? 'var(--red)' : 'var(--acc)',
                opacity: isPeak ? 1 : 0.55,
                borderRadius: '2px 2px 0 0',
                minHeight: 2,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--tx3)', marginTop: 4, fontFamily: 'var(--fm)' }}>
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}
