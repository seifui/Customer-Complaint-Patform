'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { customerStatusLabel, friendlyStatus } from '@/lib/helpers';
import { SevBadge } from './Badges';
import SlidePanel from './SlidePanel';

export default function FindMyConcerns() {
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [openId, setOpenId] = useState(null);

  function search(e) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    setSearched(true);
    if (!q) {
      setResults([]);
      return;
    }
    setResults(concerns.filter((c) => c.nic && c.nic.trim().toLowerCase() === q));
  }

  const openConcern = openId ? concerns.find((c) => c.id === openId) : null;
  const openProblem = openConcern?.linked ? problems.find((p) => p.id === openConcern.linked) : null;

  return (
    <div>
      <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <input className="form-inp" placeholder="Enter your NIC or Passport number" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-p" type="submit" style={{ flexShrink: 0 }}>Search</button>
      </form>
      <div className="muted" style={{ fontSize: 11, marginBottom: 16 }}>
        We&apos;ll show every concern submitted with this NIC or Passport number.
      </div>

      {searched && results.length === 0 && (
        <div className="callout callout-orange">We couldn&apos;t find any concerns for that NIC or Passport number.</div>
      )}

      {results.length > 0 && (
        <div className="find-list">
          {results.map((c) => (
            <div
              className="find-row"
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenId(c.id);
                }
              }}
            >
              <div className="find-row-body">
                <div className="find-row-top">
                  <div className="find-row-id">{c.id}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {c.severity && <SevBadge s={c.severity} />}
                    <span className="badge find-status-badge">{customerStatusLabel(c, c.linked ? problems.find((p) => p.id === c.linked) : null)}</span>
                  </div>
                </div>
                <div className="find-row-meta">
                  {c.journey} · Submitted {c.createdAt.slice(0, 10)} · Last updated {c.createdAt.slice(0, 10)}
                </div>
              </div>
              <svg className="find-row-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3.5l5 4.5-5 4.5" />
              </svg>
            </div>
          ))}
        </div>
      )}

      <SlidePanel open={!!openConcern} onClose={() => setOpenId(null)} title={openConcern?.id || ''}>
        {openConcern && (
          <div>
            <div className="pub-recap">
              <div className="pub-recap-lbl">Your message</div>
              <div className="pub-recap-txt">&ldquo;{openConcern.raw}&rdquo;</div>
            </div>

            <div className="section-title" style={{ fontSize: 12, marginTop: 18 }}>Progress</div>
            <div className="pub-status-row">
              <div className="pub-status-dot on" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>Received</div>
                <div className="muted" style={{ fontSize: 11 }}>{openConcern.createdAt}</div>
              </div>
            </div>
            <div className="pub-status-row">
              <div className={'pub-status-dot' + (openConcern.linked ? ' on' : '')} />
              <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                {openConcern.linked ? 'Connected to a known issue our team is tracking.' : 'Reviewed individually by our team.'}
              </div>
            </div>
            <div className="pub-status-row">
              <div className={'pub-status-dot' + (openConcern.workflowStatus === 'closed' || openProblem?.status === 'resolved' ? ' on' : '')} />
              <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{friendlyStatus(openConcern, openProblem)}</div>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
