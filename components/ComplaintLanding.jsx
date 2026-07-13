'use client';

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import ReportConcernFlow from './ReportConcernFlow';
import TrackMyConcerns from './TrackMyConcerns';

const FEATURES = [
  { ico: '🎫', t: 'Instant tracking number', s: 'You get a reference number the moment you submit — before anything else happens, so you can always check back.' },
  { ico: '🌐', t: 'Sinhala, Tamil or English', s: 'Write your concern in whichever language is easiest for you. Code-mixed text is fine too.' },
  { ico: '👀', t: 'A real team reviews every report', s: "It's not just a form into a void — every concern is read, connected to related reports, and routed to the right team." },
];

const TABS = [
  { key: 'report', label: 'Report a Concern' },
  { key: 'track', label: 'Track My Concerns' },
];

export default function ComplaintLanding() {
  const [mode, setMode] = useState('report'); // report | track
  const [trackPrefill, setTrackPrefill] = useState(null); // { id } | null

  function goToTab(next) {
    setTrackPrefill(null);
    setMode(next);
  }

  function trackConcern(id) {
    setTrackPrefill({ id });
    setMode('track');
  }

  return (
    <div className="pub">
      <div className="pub-nav">
        <div className="pub-nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-full.png" alt="ConcernHub — Every Concern. One Place. Resolved." className="pub-nav-logo" />
        </div>
        <div className="pub-nav-right">
          <ThemeToggle />
        </div>
      </div>

      <div className="pub-hero">
        <div className="pub-hero-eyebrow">Customer Support</div>
        <div className="pub-hero-title">Tell us what happened.<br />We&apos;ll take it from here.</div>
        <div className="pub-hero-sub">
          Report a problem with your account, card, transfer, or any other service — you&apos;ll get a tracking number immediately, and our
          team will follow up.
        </div>
      </div>

      <div className="pub-features">
        {FEATURES.map((f) => (
          <div className="pub-feature" key={f.t}>
            <div className="pub-feature-ico">{f.ico}</div>
            <div className="pub-feature-t">{f.t}</div>
            <div className="pub-feature-s">{f.s}</div>
          </div>
        ))}
      </div>

      <div className="pub-section">
        <div className="pub-card">
          <div className="pub-toggle">
            {TABS.map((t) => (
              <div key={t.key} className={'pub-toggle-opt' + (mode === t.key ? ' on' : '')} onClick={() => goToTab(t.key)}>
                {t.label}
              </div>
            ))}
          </div>
          {mode === 'report' && <ReportConcernFlow onTrackConcern={trackConcern} />}
          {mode === 'track' && <TrackMyConcerns initialTicket={trackPrefill?.id} />}
        </div>
      </div>

      <div className="pub-footer">© 2026 ConcernHub. Every Concern. One Place. Resolved.</div>
    </div>
  );
}
