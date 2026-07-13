'use client';

import SlidePanel from './SlidePanel';
import Callout from './Callout';
import { BarList } from './Charts';
import { ConfBadge } from './Badges';
import { useStore } from '@/lib/store';
import { money, num, getValueDetail } from '@/lib/helpers';

export default function ExplainModal({ problemId, kind, onClose }) {
  const problems = useStore((s) => s.problems);
  const p = problemId ? problems.find((x) => x.id === problemId) : null;
  if (!p) return null;

  const d = getValueDetail(p, kind);
  const amount = kind === 'risk' ? p.valueAtRisk : p.impact.after ? p.impact.after.valueProtected : 0;
  const label = kind === 'risk' ? 'Customer Value at Risk' : 'Customer Value Protected';

  return (
    <SlidePanel open={!!problemId} onClose={onClose} title={label} subtitle={p.id} footer={<button className="btn btn-gh" onClick={onClose}>Close</button>}>
      {!d ? (
        <div className="empty">
          <div className="empty-t">Not enough data yet to explain this number.</div>
        </div>
      ) : (
        <>
          <Callout kind="acc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--fc)' }}>{money(amount)}</div>
              <div className="muted" style={{ fontSize: 11 }}>{label}</div>
            </div>
            <ConfBadge label={d.confidence} />
          </Callout>
          <div className="grid g2" style={{ gap: 10, marginBottom: 12 }}>
            <div className="stat">
              <div className="stat-l">Customers Included</div>
              <div className="stat-v" style={{ fontSize: 15 }}>{num(d.customers)}</div>
            </div>
            <div className="stat">
              <div className="stat-l">Estimated Churn Probability</div>
              <div className="stat-v" style={{ fontSize: 12 }}>{d.churnProbability || 'Not yet modelled'}</div>
            </div>
          </div>
          {d.segments && (
            <div className="form-row">
              <label className="form-lbl">Customer Segments</label>
              <BarList items={d.segments.map((s) => ({ label: s.name, value: s.count }))} />
            </div>
          )}
          {d.products && (
            <div className="form-row">
              <label className="form-lbl">Products / Relationships at Risk</label>
              <div className="pill-list">
                {d.products.map((x) => (
                  <span className="pill" key={x}>{x}</span>
                ))}
              </div>
            </div>
          )}
          <div className="form-row">
            <label className="form-lbl">How This Was Calculated</label>
            <div style={{ fontSize: 11.5, color: 'var(--tx1)', lineHeight: 1.6 }}>{d.calcText}</div>
          </div>
          <div className="form-row">
            <label className="form-lbl">Data Sources Used</label>
            <ul style={{ paddingLeft: 16, fontSize: 11.5, color: 'var(--tx1)', lineHeight: 1.8 }}>
              {d.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Assumptions Made</label>
            <ul style={{ paddingLeft: 16, fontSize: 11.5, color: 'var(--tx1)', lineHeight: 1.8 }}>
              {d.assumptions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </SlidePanel>
  );
}

export function ExplainTrigger({ onOpen }) {
  return (
    <span className="tx-link" style={{ fontSize: 10 }} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
      ⓘ Explain this number
    </span>
  );
}
