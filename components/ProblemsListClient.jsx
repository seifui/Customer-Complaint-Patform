'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { money, num } from '@/lib/helpers';
import { SevBadge, StatusBadge } from './Badges';

export default function ProblemsListClient() {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const concerns = useStore((s) => s.concerns);

  return (
    <div className="card">
      <div className="section-title">
        AI-Identified Problems <span className="section-hint">{problems.length} problems from {concerns.length} raw concerns</span>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Channels</th>
              <th>Concerns</th>
              <th>Trend</th>
              <th>Affected</th>
              <th>Value at Risk</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p) => (
              <tr key={p.id} onClick={() => router.push('/problems/' + p.id)}>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {p.title}
                    {p.executiveDecision && <span className="badge sev-high" style={{ marginLeft: 4 }}>Exec</span>}
                  </div>
                  <div className="muted mono" style={{ fontSize: 10 }}>{p.id}</div>
                </td>
                <td><SevBadge s={p.severity} /></td>
                <td><StatusBadge s={p.status} /></td>
                <td>{p.channels.length}</td>
                <td className="mono">{num(p.concernCount)}</td>
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
  );
}
