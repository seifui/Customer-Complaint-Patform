'use client';

import { useRef, useState } from 'react';
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

function isValidSLMobile(v) {
  return /^(?:\+94|0)7\d{8}$/.test(v.replace(/[\s-]/g, ''));
}

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
  const [trackPrefill, setTrackPrefill] = useState(null); // { id } | null

  function goToTab(next) {
    setTrackPrefill(null);
    setMode(next);
  }

  function trackConcern(id) {
    setTrackPrefill({ id });
    setMode('status');
  }

  return (
    <div className="pub">
      <div className="pub-nav">
        <div className="pub-nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-full.png" alt="ConcernHub — Every Concern. One Place. Resolved." className="pub-nav-logo" />
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
            <div className={'pub-toggle-opt' + (mode === 'report' ? ' on' : '')} onClick={() => goToTab('report')}>Report a Concern</div>
            <div className={'pub-toggle-opt' + (mode === 'status' ? ' on' : '')} onClick={() => goToTab('status')}>Check Status</div>
          </div>
          {mode === 'report' ? (
            <ReportPane onTrackConcern={trackConcern} />
          ) : (
            <StatusPane initialQuery={trackPrefill?.id || ''} autoSearch={!!trackPrefill} />
          )}
        </div>
      </div>

      <div className="pub-footer">ConcernHub — a demo instance for internal review. Not a live banking service.</div>
    </div>
  );
}

function ReportPane({ onTrackConcern }) {
  const nextPublicTrackingId = useStore((s) => s.nextPublicTrackingId);
  const addConcern = useStore((s) => s.addConcern);
  const problems = useStore((s) => s.problems);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [area, setArea] = useState(SERVICE_AREAS[0]);
  const [desc, setDesc] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [phase, setPhase] = useState('form'); // form | submitting | done
  const [result, setResult] = useState(null);
  const fileInputScreenshot = useRef(null);
  const fileInputDoc = useRef(null);

  function toggleVoiceNote() {
    setAttachments((prev) => {
      const idx = prev.findIndex((a) => a.type === 'voice');
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { type: 'voice', label: 'Voice note (0:24)' }];
    });
  }
  function attachFile(type, file) {
    if (!file) return;
    setAttachments((prev) => [...prev, { type, label: file.name }]);
  }
  function removeAttachment(i) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    setName('');
    setMobile('');
    setMobileError('');
    setAccountRef('');
    setArea(SERVICE_AREAS[0]);
    setDesc('');
    setAttachments([]);
    setResult(null);
    setPhase('form');
  }

  function submit(e) {
    e.preventDefault();
    if (!desc.trim()) return;

    const mobileTrimmed = mobile.trim();
    if (mobileTrimmed && !isValidSLMobile(mobileTrimmed)) {
      setMobileError('Enter a valid Sri Lankan mobile number, e.g. 0771234567.');
      return;
    }
    setMobileError('');
    setPhase('submitting');

    const id = nextPublicTrackingId();
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    setTimeout(() => {
      const cls = classify(desc.trim() + ' ' + area);
      const target = cls.target;
      const customerLabel = (name.trim() || 'Anonymous') + (mobileTrimmed ? ' · ' + mobileTrimmed : '') + ' (' + (accountRef.trim() ? 'existing' : 'new') + ')';
      const concern = {
        id,
        channel: 'Digital App',
        customer: customerLabel,
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
      <div style={{ textAlign: 'center' }}>
        <div className="pub-success-icon">
          <svg width="22" height="22" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7.2l3 3L11.5 3.8" />
          </svg>
        </div>
        <div className="section-title" style={{ fontFamily: 'var(--fs)', fontWeight: 600, fontSize: 20, justifyContent: 'center', marginBottom: 10 }}>
          Concern Submitted Successfully
        </div>
        <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.65, marginBottom: 22 }}>
          Thank you for contacting ConcernHub.
          <br />
          Your concern has been successfully submitted and is now being reviewed by our team.
        </div>

        <div className="form-lbl" style={{ textAlign: 'center' }}>Tracking Number</div>
        <div className="pub-confirm-id">{result.id}</div>
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.65, marginBottom: 18 }}>
          Please save this tracking number. You can use it anytime from the &quot;Check Status&quot; tab to track the progress of your concern.
        </div>

        {result.linked ? (
          <div className="callout callout-acc" style={{ textAlign: 'left' }}>
            This matches a pattern we&apos;re already looking into, so it&apos;s been connected straight to the team already working on it.
          </div>
        ) : (
          <div className="callout callout-blue" style={{ textAlign: 'left' }}>A member of our team will review this and reach out if we need more details.</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="btn btn-p" style={{ flex: 1, height: 40, justifyContent: 'center' }} onClick={() => onTrackConcern(result.id)}>
            Track My Concern
          </button>
          <button className="btn btn-gh" style={{ flex: 1, height: 40, justifyContent: 'center' }} onClick={resetForm}>
            Submit Another Concern
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="grid g2" style={{ gap: 10 }}>
        <div className="form-row">
          <label className="form-lbl">Full Name <span className="section-hint">(optional)</span></label>
          <input className="form-inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. W.A. Perera" />
        </div>
        <div className="form-row">
          <label className="form-lbl">Mobile Number <span className="section-hint">(optional)</span></label>
          <input
            className="form-inp"
            value={mobile}
            onChange={(e) => { setMobile(e.target.value); if (mobileError) setMobileError(''); }}
            placeholder="e.g. 0771234567"
            inputMode="tel"
          />
          {mobileError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{mobileError}</div>}
        </div>
      </div>
      <div className="form-row">
        <label className="form-lbl">Account / Card Number <span className="section-hint">(optional)</span></label>
        <input className="form-inp" value={accountRef} onChange={(e) => setAccountRef(e.target.value)} placeholder="Helps us find your account faster" />
      </div>
      <div className="form-row">
        <label className="form-lbl">What&apos;s this about?<span className="req">*</span></label>
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
      <div className="form-row">
        <label className="form-lbl">Attachments <span className="section-hint">(optional)</span></label>
        <div className="attach-row">
          <button type="button" className="attach-btn" onClick={toggleVoiceNote}>🎙 Record Voice Note</button>
          <label className="attach-btn">
            📷 Upload Screenshot
            <input ref={fileInputScreenshot} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => attachFile('screenshot', e.target.files[0])} />
          </label>
          <label className="attach-btn">
            📄 Upload Document
            <input ref={fileInputDoc} type="file" style={{ display: 'none' }} onChange={(e) => attachFile('document', e.target.files[0])} />
          </label>
        </div>
        {attachments.length > 0 && (
          <div className="pill-list" style={{ marginTop: 8 }}>
            {attachments.map((a, i) => (
              <span className="pill" key={i}>
                {a.type === 'voice' ? '🎙' : a.type === 'screenshot' ? '📷' : '📄'} {a.label}{' '}
                <span className="tx-link" style={{ marginLeft: 4 }} onClick={() => removeAttachment(i)}>✕</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <button className={'btn btn-p' + (phase === 'submitting' ? ' btn-loading' : '')} type="submit" disabled={phase === 'submitting'} style={{ width: '100%', height: 40, justifyContent: 'center', fontSize: 13 }}>
        {phase === 'submitting' ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}

function StatusPane({ initialQuery = '', autoSearch = false }) {
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
