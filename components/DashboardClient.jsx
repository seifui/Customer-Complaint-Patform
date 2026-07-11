'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { money, num } from '@/lib/helpers';
import { SevBadge, StatusBadge } from './Badges';
import FlowStrip from './FlowStrip';
import ExplainModal, { ExplainTrigger } from './ExplainModal';

function execResultText(p) {
  if (!p.impact.after) return 'No intervention started yet — awaiting owner and deadline.';
  const repPct = Math.round((1 - p.impact.after.repeat / p.impact.before.repeat) * 100);
  return 'Repeat contacts down ' + repPct + '% since intervention began (' + p.startedAt + ').';
}

export default function DashboardClient() {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const [explain, setExplain] = useState(null); // { problemId, kind }

  const execProblems = problems.filter((p) => p.executiveDecision);
  const valueAtRiskTotal = problems.filter((p) => p.status !== 'resolved').reduce((s, p) => s + p.valueAtRisk, 0);
  const disengagementTotal = problems.reduce((s, p) => s + p.disengagement, 0);
  const rapidlyGrowing = problems.filter((p) => p.trendPct >= 50).length;
  const valueProtected = problems.reduce((s, p) => s + (p.impact.after ? p.impact.after.valueProtected || 0 : 0), 0);
  const improving = problems.filter((p) => p.impact.after).length;
  const allSorted = [...problems].sort((a, b) => (b.severity === 'critical') - (a.severity === 'critical') || b.concernCount - a.concernCount);

  return (
    <>
      <div className="section-title" style={{ fontFamily: 'var(--fc)', fontWeight: 700, fontSize: 18, letterSpacing: '-.005em', marginBottom: 16 }}>
        {execProblems.length} customer problems need your attention
      </div>

      {execProblems.map((p) => (
        <div className="exec-card" key={p.id}>
          <div className="exec-card-hd">
            <div>
              <div className="exec-card-title">{p.title}</div>
              <div className="muted mono" style={{ fontSize: 10 }}>{p.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <SevBadge s={p.severity} />
              <StatusBadge s={p.status} />
            </div>
          </div>
          <div className="exec-card-row"><b>What&apos;s happening:</b> {p.description}</div>
          <div className="exec-card-row"><b>Why it matters:</b> {p.whyItMatters}</div>
          <div className="grid g4" style={{ gap: 8, margin: '10px 0' }}>
            <div className="stat">
              <div className="stat-l">Customers Affected</div>
              <div className="stat-v" style={{ fontSize: 15 }}>{num(p.affectedCustomers)}</div>
            </div>
            <div className="stat">
              <div className="stat-l">Trend</div>
              <div className="stat-v" style={{ fontSize: 15, color: p.trendPct >= 0 ? 'var(--red)' : 'var(--green)' }}>
                {p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}%
              </div>
            </div>
            <div className="stat">
              <div className="stat-l">Value at Risk</div>
              <div className="stat-v" style={{ fontSize: 15 }}>{money(p.valueAtRisk)}</div>
              <ExplainTrigger onOpen={() => setExplain({ problemId: p.id, kind: 'risk' })} />
            </div>
            <div className="stat">
              <div className="stat-l">Owner</div>
              <div className="stat-v" style={{ fontSize: 13 }}>{p.owner === '—' ? 'Unassigned' : p.owner.split('—')[0]}</div>
            </div>
          </div>
          <div className="exec-card-row"><b>Current intervention status:</b> {execResultText(p)}</div>
          {p.executiveDecision && (
            <div className="callout callout-orange" style={{ margin: '10px 0 0' }}>
              <b>Decision needed:</b> {p.executiveDecision}
            </div>
          )}
          <button className="btn btn-p btn-sm" style={{ marginTop: 10 }} onClick={() => router.push('/problems/' + p.id)}>
            Open Problem Workspace →
          </button>
        </div>
      ))}

      <div className="section-title" style={{ fontSize: 13, marginTop: 6, color: 'var(--tx2)' }}>Executive Metrics</div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 22 }}>
        <div className="kpi">
          <div className="kpi-l"><span className="kpi-icon" style={{ background: 'var(--red-d)', color: 'var(--red)' }}>⚠</span>Value at Risk</div>
          <div className="kpi-v" style={{ fontSize: 20 }}>{money(valueAtRiskTotal)}</div>
          <div className="kpi-s">Across open problems</div>
        </div>
        <div className="kpi">
          <div className="kpi-l"><span className="kpi-icon" style={{ background: 'var(--orange-d)', color: 'var(--orange)' }}>📉</span>Disengagement Signals</div>
          <div className="kpi-v" style={{ fontSize: 20 }}>{num(disengagementTotal)}</div>
          <div className="kpi-s">Customers pulling back</div>
        </div>
        <div className="kpi">
          <div className="kpi-l"><span className="kpi-icon" style={{ background: 'var(--purple-d)', color: 'var(--purple)' }}>📈</span>Rapidly Growing</div>
          <div className="kpi-v" style={{ fontSize: 20 }}>{rapidlyGrowing}</div>
          <div className="kpi-s">Problems trending ↑50%+</div>
        </div>
        <div className="kpi">
          <div className="kpi-l"><span className="kpi-icon" style={{ background: 'var(--acc-d)', color: 'var(--acc)' }}>🛡</span>Value Protected</div>
          <div className="kpi-v" style={{ fontSize: 20 }}>{money(valueProtected)}</div>
          <div className="kpi-s up">This month</div>
        </div>
        <div className="kpi">
          <div className="kpi-l"><span className="kpi-icon" style={{ background: 'var(--green-d)', color: 'var(--green)' }}>✓</span>Improving</div>
          <div className="kpi-v" style={{ fontSize: 20 }}>{improving}</div>
          <div className="kpi-s up">After intervention</div>
        </div>
      </div>

      <div className="section-title" style={{ fontSize: 13, color: 'var(--tx2)' }}>
        All Emerging Problems <span className="section-hint">click a row to open the Problem Workspace</span>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Trend</th>
                <th>Affected</th>
                <th>Value at Risk</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {allSorted.map((p) => (
                <tr key={p.id} onClick={() => router.push('/problems/' + p.id)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div className="muted mono" style={{ fontSize: 10 }}>{p.id}</div>
                  </td>
                  <td><SevBadge s={p.severity} /></td>
                  <td><StatusBadge s={p.status} /></td>
                  <td style={{ color: p.trendPct >= 0 ? 'var(--red)' : 'var(--green)' }}>{p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}%</td>
                  <td className="mono">{num(p.affectedCustomers)}</td>
                  <td className="mono">{money(p.valueAtRisk)}</td>
                  <td className="muted" style={{ fontSize: 11 }}>{p.owner === '—' ? 'Unassigned' : p.owner.split('—')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg,var(--acc-d2),transparent)' }}>
        <div className="section-title">The Continuous Learning Loop</div>
        <FlowStrip steps={['More Data', 'Smarter AI', 'Better Actions', 'Better Outcomes']} />
        <div className="muted" style={{ fontSize: 11.5 }}>
          We do not help the bank close more complaints. We help it identify and fix the customer problems that keep happening again and again.
        </div>
      </div>

      <ExplainModal problemId={explain?.problemId} kind={explain?.kind} onClose={() => setExplain(null)} />
    </>
  );
}
