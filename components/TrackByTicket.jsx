'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { friendlyStatus } from '@/lib/helpers';

export default function TrackByTicket({ initialQuery = '', autoSearch = false }) {
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(autoSearch);
  const [found, setFound] = useState(() => (
    autoSearch ? concerns.find((x) => x.id.toLowerCase() === initialQuery.trim().toLowerCase()) || null : null
  ));

  function lookup(e) {
    e.preventDefault();
    setSearched(true);
    const c = concerns.find((x) => x.id.toLowerCase() === query.trim().toLowerCase());
    setFound(c || null);
  }

  const linkedProblem = found?.linked ? problems.find((p) => p.id === found.linked) : null;

  return (
    <div>
      <form onSubmit={lookup} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <input className="form-inp" placeholder="e.g. CH-2026-000128" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-p" type="submit" style={{ flexShrink: 0 }}>Check</button>
      </form>
      <div className="muted" style={{ fontSize: 11, marginBottom: 16 }}>Enter the reference number you received when you reported your concern.</div>

      {searched && !found && (
        <div className="callout callout-orange">We couldn&apos;t find a report with that reference number. Double-check it and try again.</div>
      )}

      {found && (
        <div>
          <div className="pub-status-row">
            <div className="pub-status-dot" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{found.id}</div>
              <div className="muted" style={{ fontSize: 11 }}>Reported {found.createdAt}</div>
            </div>
          </div>
          <div className="pub-status-row">
            <div className="pub-status-dot" />
            <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{friendlyStatus(found, linkedProblem)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
