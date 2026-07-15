'use client';

import SlidePanel from './SlidePanel';
import Callout from './Callout';
import { BarList } from './Charts';
import { ConfBadge } from './Badges';
import { useStore } from '@/lib/store';
import { money, num, getValueDetail } from '@/lib/helpers';
import { Button } from '@/components/ui/button';

export default function ExplainModal({ problemId, kind, onClose }) {
  const problems = useStore((s) => s.problems);
  const p = problemId ? problems.find((x) => x.id === problemId) : null;
  if (!p) return null;

  const d = getValueDetail(p, kind);
  const amount = kind === 'risk' ? p.valueAtRisk : p.impact.after ? p.impact.after.valueProtected : 0;
  const label = kind === 'risk' ? 'Customer Value at Risk' : 'Customer Value Protected';

  return (
    <SlidePanel open={!!problemId} onClose={onClose} title={label} subtitle={p.id} footer={<Button variant="outline" onClick={onClose}>Close</Button>}>
      {!d ? (
        <div className="px-5 py-10 text-center text-muted-foreground">
          <div className="text-xs">Not enough data yet to explain this number.</div>
        </div>
      ) : (
        <>
          <Callout kind="acc" className="flex items-center justify-between gap-2.5">
            <div>
              <div className="font-heading text-xl font-bold">{money(amount)}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
            <ConfBadge label={d.confidence} />
          </Callout>
          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border bg-muted px-3.5 py-3">
              <div className="mb-1.5 text-[10.5px] text-muted-foreground">Customers Included</div>
              <div className="text-[15px] font-bold tracking-tight">{num(d.customers)}</div>
            </div>
            <div className="rounded-lg border bg-muted px-3.5 py-3">
              <div className="mb-1.5 text-[10.5px] text-muted-foreground">Estimated Churn Probability</div>
              <div className="text-xs font-bold tracking-tight">{d.churnProbability || 'Not yet modelled'}</div>
            </div>
          </div>
          {d.segments && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11.5px] font-semibold text-foreground/80">Customer Segments</div>
              <BarList items={d.segments.map((s) => ({ label: s.name, value: s.count }))} />
            </div>
          )}
          {d.products && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11.5px] font-semibold text-foreground/80">Products / Relationships at Risk</div>
              <div className="flex flex-wrap gap-1.5">
                {d.products.map((x) => (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80" key={x}>{x}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mb-4">
            <div className="mb-1.5 text-[11.5px] font-semibold text-foreground/80">How This Was Calculated</div>
            <div className="text-[11.5px] leading-relaxed text-muted-foreground">{d.calcText}</div>
          </div>
          <div className="mb-4">
            <div className="mb-1.5 text-[11.5px] font-semibold text-foreground/80">Data Sources Used</div>
            <ul className="list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-muted-foreground">
              {d.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-foreground/80">Assumptions Made</div>
            <ul className="list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-muted-foreground">
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
    <span className="cursor-pointer text-[10px] text-primary underline underline-offset-2" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
      ⓘ Explain this number
    </span>
  );
}
