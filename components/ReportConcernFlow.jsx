'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { classify, isValidEmail, isValidSLMobile } from '@/lib/helpers';
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

const PROCESSING_MESSAGES = ['Understanding your concern…', 'Analysing your message…', 'Preparing your submission…'];

export default function ReportConcernFlow({ onTrackConcern }) {
  const nextPublicTrackingId = useStore((s) => s.nextPublicTrackingId);
  const addConcern = useStore((s) => s.addConcern);
  const problems = useStore((s) => s.problems);

  const [step, setStep] = useState('tell'); // tell | processing | details | done
  const [desc, setDesc] = useState('');
  const [cls, setCls] = useState(null);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nic, setNic] = useState('');
  const [nicError, setNicError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [contactError, setContactError] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [area, setArea] = useState(SERVICE_AREAS[0]);
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputScreenshot = useRef(null);
  const fileInputDoc = useRef(null);

  function beginProcessing() {
    if (!desc.trim()) return;
    setStep('processing');
  }

  // Runs the (client-side) classification once processing starts, then hands
  // off to the details step — the rotating messages are purely a perceived-
  // wait affordance in front of the same classify() call used elsewhere.
  useEffect(() => {
    if (step !== 'processing') return;
    const result = classify(desc.trim());
    const t = setTimeout(() => {
      setCls(result);
      setArea(result.journey && SERVICE_AREAS.includes(result.journey) ? result.journey : SERVICE_AREAS[0]);
      setStep('details');
    }, 1650);
    return () => clearTimeout(t);
  }, [step, desc]);

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

  function resetAll() {
    setStep('tell');
    setDesc('');
    setCls(null);
    setName('');
    setNameError('');
    setNic('');
    setNicError('');
    setEmail('');
    setEmailError('');
    setMobile('');
    setMobileError('');
    setContactError('');
    setAccountRef('');
    setArea(SERVICE_AREAS[0]);
    setAttachments([]);
    setResult(null);
  }

  function submit(e) {
    e.preventDefault();

    const nameTrimmed = name.trim();
    const nicTrimmed = nic.trim();
    const emailTrimmed = email.trim();
    const mobileTrimmed = mobile.trim();

    if (!nameTrimmed) {
      setNameError('Please provide your full name.');
      return;
    }
    if (!nicTrimmed) {
      setNicError('Please provide your NIC or Passport number.');
      return;
    }
    if (!emailTrimmed && !mobileTrimmed) {
      setContactError('Please provide either an email address or a mobile number so we can send your tracking number and contact you if necessary.');
      return;
    }
    if (emailTrimmed && !isValidEmail(emailTrimmed)) {
      setEmailError('Enter a valid email address, e.g. john.perera@email.com.');
      return;
    }
    if (mobileTrimmed && !isValidSLMobile(mobileTrimmed)) {
      setMobileError('Enter a valid Sri Lankan mobile number, e.g. 0771234567.');
      return;
    }
    setNameError('');
    setNicError('');
    setContactError('');
    setEmailError('');
    setMobileError('');
    setSubmitting(true);

    const id = nextPublicTrackingId();
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    setTimeout(() => {
      const target = cls?.target || null;
      const contactParts = [emailTrimmed, mobileTrimmed].filter(Boolean).join(' · ');
      const customerLabel = (name.trim() || 'Anonymous') + (contactParts ? ' · ' + contactParts : '') + ' (' + (accountRef.trim() ? 'existing' : 'new') + ')';
      const severity = cls?.severity || 'medium';
      const journey = area === 'Other' ? cls?.journey || 'Other' : area;
      const concern = {
        id,
        channel: 'Digital App',
        customer: customerLabel,
        nic: nicTrimmed,
        journey,
        lang: cls?.lang || 'English',
        raw: desc.trim(),
        issueType: cls?.issueType || 'General Inquiry / Other',
        urgency: cls?.urgency || 'Medium',
        summary: desc.trim().length > 120 ? desc.trim().slice(0, 117) + '…' : desc.trim(),
        severity,
        sentiment: cls?.sentiment || 'neutral',
        status: target ? 'linked' : 'analyzing',
        linked: target,
        createdAt: stamp,
        createdBy: 'customer',
        assignee: target ? problems.find((p) => p.id === target).teams[0] + ' Team' : '—',
        assignedDepartment: null,
        assignedTo: null,
        workflowStatus: 'new',
        activityTimeline: [
          { type: 'created', label: 'Concern Created', by: 'Customer', at: stamp },
          { type: 'ai-classified', label: 'AI Classification Completed', detail: severity + ' severity · ' + journey, by: 'AI Engine', at: stamp },
        ],
      };
      addConcern(concern);
      const contactMethod =
        emailTrimmed && mobileTrimmed ? 'email address and mobile number' : emailTrimmed ? 'email address' : 'mobile number';
      setResult({ id, linked: target ? problems.find((p) => p.id === target) : null, hasEmail: !!emailTrimmed, contactMethod });
      setSubmitting(false);
      setStep('done');
    }, 700);
  }

  if (step === 'tell') {
    return (
      <div className="pub-step">
        <div className="pub-step-title">Report your concern</div>
        <div className="pub-step-sub">Whether it&apos;s about a transfer, card, account, or any banking service, tell us what happened in your own words.</div>
        <textarea
          className="form-inp pub-step1-textarea"
          autoFocus
          placeholder="Describe what happened in your own words. Sinhala, Tamil, and English are all supported."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button className="btn btn-p pub-step-cta" disabled={!desc.trim()} onClick={beginProcessing}>
          Continue
        </button>
      </div>
    );
  }

  if (step === 'processing') {
    return <ProcessingState />;
  }

  if (step === 'done' && result) {
    return (
      <div className="pub-step" style={{ textAlign: 'center' }}>
        <div className="pub-success-icon">
          <svg width="22" height="22" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7.2l3 3L11.5 3.8" />
          </svg>
        </div>
        <div className="section-title" style={{ fontFamily: 'var(--fs)', fontWeight: 600, fontSize: 20, justifyContent: 'center', marginBottom: 10 }}>
          Your concern has been submitted successfully
        </div>

        <div className="form-lbl" style={{ textAlign: 'center' }}>Tracking Number</div>
        <div className="pub-confirm-id">{result.id}</div>
        <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.65, marginBottom: 18 }}>
          We&apos;ve sent this tracking number to your {result.contactMethod}. Please keep it safe for future reference.
        </div>

        {result.linked ? (
          <div className="callout callout-acc" style={{ textAlign: 'left' }}>
            This matches a pattern we&apos;re already looking into, so it&apos;s been connected straight to the team already working on it.
          </div>
        ) : (
          <div className="callout callout-blue" style={{ textAlign: 'left' }}>A member of our team will review this and reach out if we need more details.</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn-p btn-hero" style={{ flex: 1 }} onClick={() => onTrackConcern(result.id)}>
            Track My Concern
          </button>
          <button className="btn btn-gh btn-hero" style={{ flex: 1 }} onClick={resetAll}>
            Submit Another Concern
          </button>
        </div>
      </div>
    );
  }

  // step === 'details'
  return (
    <div className="pub-step">
      <div className="pub-step-title" style={{ fontSize: 19 }}>We need a few details to keep in touch</div>
      <div className="pub-step-sub">
        Thank you for explaining your concern. To create your tracking number and contact you if we need additional information, please provide the
        following details.
      </div>

      <div className="pub-recap">
        <div className="pub-recap-lbl">Your message</div>
        <div className="pub-recap-txt">&ldquo;{desc.trim().length > 160 ? desc.trim().slice(0, 157) + '…' : desc.trim()}&rdquo;</div>
      </div>

      <form onSubmit={submit}>
        <div className="form-row">
          <label className="form-lbl">Full Name<span className="req">*</span></label>
          <input
            className="form-inp"
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
            placeholder="e.g. W.A. Perera"
          />
          {nameError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{nameError}</div>}
        </div>
        <div className="form-row">
          <label className="form-lbl">NIC / Passport Number<span className="req">*</span></label>
          <input
            className="form-inp"
            value={nic}
            onChange={(e) => { setNic(e.target.value); if (nicError) setNicError(''); }}
            placeholder="e.g. 200012345678 or N1234567"
          />
          {nicError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{nicError}</div>}
        </div>
        <div className="grid g2" style={{ gap: 10 }}>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Email Address <span className="section-hint">(optional)</span></label>
            <input
              className="form-inp"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); if (contactError) setContactError(''); }}
              placeholder="e.g. john.perera@email.com"
            />
            {emailError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{emailError}</div>}
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Mobile Number <span className="section-hint">(optional)</span></label>
            <input
              className="form-inp"
              value={mobile}
              onChange={(e) => { setMobile(e.target.value); if (mobileError) setMobileError(''); if (contactError) setContactError(''); }}
              placeholder="e.g. 0771234567"
              inputMode="tel"
            />
            {mobileError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{mobileError}</div>}
          </div>
        </div>
        {contactError && <div style={{ color: 'var(--red)', fontSize: 11.5, lineHeight: 1.5, margin: '8px 0 0' }}>{contactError}</div>}

        <div className="form-row" style={{ marginTop: 16 }}>
          <label className="form-lbl">Category</label>
          <Select value={area} onChange={setArea} options={SERVICE_AREAS} />
        </div>
        <div className="form-row">
          <label className="form-lbl">Account / Card Number <span className="section-hint">(optional)</span></label>
          <input className="form-inp" value={accountRef} onChange={(e) => setAccountRef(e.target.value)} placeholder="Helps us find your account faster" />
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

        <button className={'btn btn-p btn-hero' + (submitting ? ' btn-loading' : '')} type="submit" disabled={submitting} style={{ width: '100%', marginTop: 4 }}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

function ProcessingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, PROCESSING_MESSAGES.length - 1)), 550);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pub-processing">
      <div className="pub-processing-spinner" />
      <div className="pub-processing-msg">{PROCESSING_MESSAGES[i]}</div>
    </div>
  );
}
