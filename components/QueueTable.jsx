'use client';

import { ChBadge, SevBadge, SntBadge, TriageBadge } from './Badges';
import { triageInfo } from '@/lib/helpers';
import { useStore } from '@/lib/store';

export default function QueueTable({ list, onOpen }) {
  const problems = useStore((s) => s.problems);

  if (!list.length) {
    return (
      <div className="empty">
        <div className="empty-t">No concerns match these filters.</div>
      </div>
    );
  }

  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Signal</th>
            <th>Tracking ID</th>
            <th>Channel</th>
            <th>Customer</th>
            <th>Journey</th>
            <th>AI Summary &amp; Reasoning</th>
            <th>Severity</th>
            <th>Sentiment</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => {
            const tri = triageInfo(c, problems);
            return (
              <tr key={c.id} onClick={() => onOpen(c.id)}>
                <td style={{ borderLeft: '3px solid ' + tri.color, paddingLeft: 13 }}>
                  <TriageBadge tri={tri} />
                </td>
                <td className="mono tx-link">{c.id}</td>
                <td>
                  <ChBadge c={c.channel} />
                </td>
                <td>{c.customer}</td>
                <td>{c.journey}</td>
                <td style={{ maxWidth: 280 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.summary}</div>
                  <div className="muted" style={{ fontSize: 10, fontStyle: 'italic', marginTop: 2, whiteSpace: 'normal' }}>
                    {tri.note}
                  </div>
                </td>
                <td>
                  <SevBadge s={c.severity} />
                </td>
                <td>
                  <SntBadge s={c.sentiment} />
                </td>
                <td className="muted mono" style={{ fontSize: 10.5 }}>
                  {c.createdAt}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
