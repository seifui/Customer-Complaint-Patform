'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { classify } from '@/lib/helpers';
import Select from './Select';

const SERVICE_AREAS = [
  'Money Transfer',
  'Cards',
  'KYC / Onboarding',
  'Loans',
  'Standing Orders',
  'ATM',
  'Digital Banking App',
  'Account Services',
  'Other',
];

const FEATURES = [
  { ico: '🎫', t: 'Instant tracking number', s: 'You get a reference number the moment you submit — before anything else happens, so you can always check back.' },
  { ico: '🌐', t: 'Sinhala, Tamil or English', s: 'Write your concern in whichever language is easiest for you. Code-mixed text is fine too.' },
  { ico: '👀', t: 'A real team reviews every report', s: "It's not just a form into a void — every concern is read, connected to related reports, and routed to the right team." },
];

function friendlyStatus(concern, problem) {
  if (!concern.linked) {
    return concern.status === 'analyzing'
      ? 'Received — our team is reviewing this now.'
      : 'Received — this has been logged and is awaiting review.';
  }
  if (!problem) return 'Received — connected to an ongoing review.';
  if (problem.status === 'resolved') return 'Resolved. Thank you for your patience — this issue has been fixed.';
  if (problem.status === 'action-in-progress') return "Good news — we've identified this as part of a known issue, and a fix is already in progress.";
  return "We've connected this to a wider pattern that our team is actively investigating.";
}

export default function ComplaintLanding() {
  const [mode, setMode] = useState('report'); // report | status

  return (
    <div className="pub">
      <div className="pub-nav">
        <div className="pub-nav-brand">
          <div className="sb-mark">CCI</div>
          <div className="sb-brand">
            <div className="sb-brand-t">Concern Intelligence</div>
            <div className="sb-brand-s">Platform · Sri Lanka</div>
          </div>
        </div>
        <div className="pub-nav-right">
          <Link className="btn btn-acc pub-login-btn" href="/login">Login</Link>
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
            <div className={'pub-toggle-opt' + (mode === 'report' ? ' on' : '')} onClick={() => setMode('report')}>Report a Concern</div>
            <div className={'pub-toggle-opt' + (mode === 'status' ? ' on' : '')} onClick={() => setMode('status')}>Check Status</div>
          </div>
          {mode === 'report' ? <ReportPane /> : <StatusPane />}
        </div>
      </div>

      <div className="pub-footer">Customer Concern Intelligence Platform — a demo instance for internal review. Not a live banking service.</div>
    </div>
  );
}

function ReportPane() {
  const nextConcernId = useStore((s) => s.nextConcernId);
  const addConcern = useStore((s) => s.addConcern);
  const problems = useStore((s) => s.problems);

  const [name, setName] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [area, setArea] = useState(SERVICE_AREAS[0]);
  const [desc, setDesc] = useState('');
  const [phase, setPhase] = useState('form'); // form | submitting | done
  const [result, setResult] = useState(null);

  function submit(e) {
    e.preventDefault();
    if (!desc.trim()) return;
    setPhase('submitting');

    const id = nextConcernId();
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    setTimeout(() => {
      const cls = classify(desc.trim() + ' ' + area);
      const target = cls.target;
      const concern = {
        id,
        channel: 'Digital App',
        customer: (name.trim() || 'Anonymous') + ' (' + (accountRef.trim() ? 'existing' : 'new') + ')',
        journey: area === 'Other' ? cls.journey : area,
        lang: cls.lang,
        raw: desc.trim(),
        issueType: cls.issueType,
        urgency: cls.urgency,
        summary: desc.trim().length > 120 ? desc.trim().slice(0, 117) + '…' : desc.trim(),
        severity: cls.severity,
        sentiment: cls.sentiment,
        status: target ? 'linked' : 'analyzing',
        linked: target,
        createdAt: stamp,
        createdBy: 'customer',
        assignee: target ? problems.find((p) => p.id === target).teams[0] + ' Team' : '—',
      };
      addConcern(concern);
      setResult({ id, linked: target ? problems.find((p) => p.id === target) : null });
      setPhase('done');
    }, 900);
  }

  if (phase === 'done' && result) {
    return (
      <div>
        <div className="section-title" style={{ fontFamily: 'var(--fs)', fontWeight: 600, fontSize: 20 }}>Thank you — we&apos;ve got it.</div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Save this reference number to check your status any time.</div>
        <div className="pub-confirm-id">{result.id}</div>
        {result.linked ? (
          <div className="callout callout-acc">
            This matches a pattern we&apos;re already looking into, so it&apos;s been connected straight to the team already working on it.
          </div>
        ) : (
          <div className="callout callout-blue">A member of our team will review this and reach out if we need more details.</div>
        )}
        <button
          className="btn btn-gh"
          style={{ width: '100%', height: 36, justifyContent: 'center' }}
          onClick={() => {
            setName('');
            setAccountRef('');
            setArea(SERVICE_AREAS[0]);
            setDesc('');
            setResult(null);
            setPhase('form');
          }}
        >
          Report Another Concern
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="grid g2" style={{ gap: 10 }}>
        <div className="form-row">
          <label className="form-lbl">Your Name <span className="section-hint">(optional)</span></label>
          <input className="form-inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. W.A. Perera" />
        </div>
        <div className="form-row">
          <label className="form-lbl">Account / Card Number <span className="section-hint">(optional)</span></label>
          <input className="form-inp" value={accountRef} onChange={(e) => setAccountRef(e.target.value)} placeholder="Helps us find your account faster" />
        </div>
      </div>
      <div className="form-row">
        <label className="form-lbl">What&apos;s this about?</label>
        <Select value={area} onChange={setArea} options={SERVICE_AREAS} />
      </div>
      <div className="form-row">
        <label className="form-lbl">Tell us what happened<span className="req">*</span></label>
        <textarea
          className="form-inp"
          style={{ minHeight: 130 }}
          required
          placeholder="Describe what happened, in your own words. Sinhala, Tamil, and English are all fine."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <button className="btn btn-p" type="submit" disabled={phase === 'submitting'} style={{ width: '100%', height: 40, justifyContent: 'center', fontSize: 13 }}>
        {phase === 'submitting' ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}

function StatusPane() {
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState(null);

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
        <input className="form-inp" placeholder="e.g. CCI-10032" value={query} onChange={(e) => setQuery(e.target.value)} />
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
