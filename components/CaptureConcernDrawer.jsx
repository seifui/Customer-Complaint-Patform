'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { classify, isValidEmail, isValidSLMobile } from '@/lib/helpers';
import Callout from './Callout';
import Select from './Select';
import SlidePanel from './SlidePanel';

const JOURNEYS = ['Money Transfer', 'Cards', 'KYC / Onboarding', 'Loans', 'Standing Orders', 'ATM', 'Digital Banking App', 'Account Services', 'Other'];
const LANGS = ['English', 'Sinhala', 'Sinhala (romanized)', 'Tamil', 'Code-mixed'];

export default function CaptureConcernDrawer({ session, open, onClose }) {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const nextConcernId = useStore((s) => s.nextConcernId);
  const addConcern = useStore((s) => s.addConcern);
  const showToast = useStore((s) => s.showToast);

  const defaultChannel = session.role === 'branch' ? 'Branch' : 'Call Centre';
  const [channel, setChannel] = useState(defaultChannel);
  const [desc, setDesc] = useState('');
  const [showForwardedEmail, setShowForwardedEmail] = useState(false);
  const [forwardedEmail, setForwardedEmail] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputScreenshot = useRef(null);
  const fileInputDoc = useRef(null);

  const [nic, setNic] = useState('');
  const [nicError, setNicError] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [contactError, setContactError] = useState('');
  const [accountRef, setAccountRef] = useState('');

  const [phase, setPhase] = useState('idle'); // idle | processing | review | done
  const [pending, setPending] = useState(null);
  const [review, setReview] = useState(null);
  const [savedInfo, setSavedInfo] = useState(null);

  function toggleVoiceNote() {
    setAttachments((prev) => {
      const idx = prev.findIndex((a) => a.type === 'voice');
      if (idx >= 0) {
        showToast('Voice note removed');
        return prev.filter((_, i) => i !== idx);
      }
      showToast('Voice note attached (simulated transcription)');
      return [...prev, { type: 'voice', label: 'Voice note (0:42)' }];
    });
  }
  function attachFile(type, file) {
    if (!file) return;
    setAttachments((prev) => [...prev, { type, label: file.name }]);
    showToast((type === 'screenshot' ? 'Screenshot' : 'Document') + ' attached: ' + file.name);
  }
  function removeAttachment(i) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  function resetAll() {
    setChannel(defaultChannel);
    setDesc('');
    setShowForwardedEmail(false);
    setForwardedEmail('');
    setAttachments([]);
    setNic('');
    setNicError('');
    setFullName('');
    setFullNameError('');
    setCustomerEmail('');
    setEmailError('');
    setCustomerMobile('');
    setMobileError('');
    setContactError('');
    setAccountRef('');
    setPhase('idle');
    setPending(null);
    setReview(null);
    setSavedInfo(null);
  }

  function handleClose() {
    onClose();
    resetAll();
  }

  function startAIUnderstanding() {
    const fullText = [desc.trim(), showForwardedEmail ? forwardedEmail.trim() : ''].filter(Boolean).join(' — ');
    if (!fullText && !attachments.length) {
      showToast('Please describe what happened, paste an email, or attach something.');
      return;
    }
    if (!fullText) {
      showToast('Attachments are noted, but AI still needs some text to understand — add a short description too.');
      return;
    }

    const nameTrimmed = fullName.trim();
    const nicTrimmed = nic.trim();
    const emailTrimmed = customerEmail.trim();
    const mobileTrimmed = customerMobile.trim();

    if (!nameTrimmed) {
      setFullNameError('Please provide the customer’s full name.');
      return;
    }
    if (!nicTrimmed) {
      setNicError('Please provide the customer’s NIC or Passport number.');
      return;
    }
    if (!emailTrimmed && !mobileTrimmed) {
      setContactError('Please provide either an email address or a mobile number so we can contact the customer if required.');
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
    setFullNameError('');
    setNicError('');
    setContactError('');
    setEmailError('');
    setMobileError('');

    const id = nextConcernId();
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

    setPhase('processing');
    setTimeout(() => {
      const cls = classify(fullText);
      setPending({ id, stamp, raw: fullText, cls, attachments: [...attachments] });
      setReview({
        journey: cls.journey,
        issueType: cls.issueType,
        lang: cls.lang,
        custType: cls.custType,
        severity: cls.severity,
        sentiment: cls.sentiment,
        urgency: cls.urgency,
        acceptLink: !!cls.target,
      });
      setPhase('review');
    }, 1200);
  }

  function confirmConcern() {
    const target = review.acceptLink && pending.cls.target ? pending.cls.target : null;
    const contactParts = [customerEmail.trim(), customerMobile.trim()].filter(Boolean).join(' · ');
    const newConcern = {
      id: pending.id,
      channel,
      customer: (fullName.trim() || 'Not specified') + (contactParts ? ' · ' + contactParts : '') + ' (' + (review.custType === 'New customer' ? 'new' : 'existing') + ')',
      nic: nic.trim(),
      accountRef: accountRef.trim(),
      journey: review.journey,
      lang: review.lang,
      raw: pending.raw,
      issueType: review.issueType,
      urgency: review.urgency,
      summary: pending.raw.length > 120 ? pending.raw.slice(0, 117) + '…' : pending.raw,
      severity: review.severity,
      sentiment: review.sentiment,
      status: target ? 'linked' : 'analyzing',
      linked: target,
      createdAt: pending.stamp,
      createdBy: session.role,
      assignee: target ? problems.find((p) => p.id === target).teams[0] + ' Team' : '—',
      assignedDepartment: null,
      assignedTo: null,
      workflowStatus: 'new',
      activityTimeline: [
        { type: 'created', label: 'Concern Created', by: session.name, at: pending.stamp },
        { type: 'ai-classified', label: 'AI Classification Completed', detail: review.severity + ' severity · ' + review.journey, by: 'AI Engine', at: pending.stamp },
      ],
    };
    addConcern(newConcern);

    const linkedProblem = target ? problems.find((p) => p.id === target) : null;
    setSavedInfo({ id: pending.id, attachCount: pending.attachments.length, linkedProblem });
    setPhase('done');
    showToast('Concern captured — Tracking ID ' + pending.id);
  }

  function goToProblem(id) {
    handleClose();
    router.push('/problems/' + id);
  }

  const footer = (() => {
    if (phase === 'idle') {
      return (
        <>
          <button className="btn btn-gh" onClick={handleClose}>Cancel</button>
          <button className="btn btn-p" onClick={startAIUnderstanding}>Let AI Understand This</button>
        </>
      );
    }
    if (phase === 'processing') {
      return (
        <>
          <button className="btn btn-gh" disabled>Cancel</button>
          <button className="btn btn-p btn-loading" disabled>Understanding…</button>
        </>
      );
    }
    if (phase === 'review') {
      return (
        <>
          <button className="btn btn-gh" onClick={resetAll}>Discard</button>
          <button className="btn btn-p" onClick={confirmConcern}>Confirm &amp; Save Concern</button>
        </>
      );
    }
    // done
    return (
      <>
        <button className="btn btn-gh" onClick={handleClose}>Close</button>
        <button className="btn btn-p" onClick={resetAll}>Log Another Concern</button>
      </>
    );
  })();

  return (
    <SlidePanel open={open} onClose={handleClose} title="Raise New Concern" subtitle="AI handles the structure — just describe what happened" footer={footer}>
      {phase === 'idle' && (
        <>
          <div className="form-section">
            <div className="form-section-hd">Concern Details</div>
            <div className="form-row">
              <label className="form-lbl">Source Channel<span className="req">*</span></label>
              <Select value={channel} onChange={setChannel} options={['Call Centre', 'Branch', 'Email', 'Digital App', 'Existing System']} />
            </div>
            <div className="form-row">
              <label className="form-lbl">What happened?<span className="req">*</span></label>
              <textarea
                className="form-inp"
                style={{ minHeight: 130 }}
                placeholder="Type or paste what the customer said, in their own words. Sinhala, Tamil, English, and code-mixed text are all supported."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-hd">Customer Details</div>
            <div className="form-row">
              <label className="form-lbl">Full Name<span className="req">*</span></label>
              <input
                className="form-inp"
                placeholder="e.g. W.A. Perera"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (fullNameError) setFullNameError(''); }}
              />
              {fullNameError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{fullNameError}</div>}
            </div>
            <div className="form-row">
              <label className="form-lbl">NIC / Passport Number<span className="req">*</span></label>
              <input
                className="form-inp"
                placeholder="e.g. 199812345678 or N1234567"
                value={nic}
                onChange={(e) => { setNic(e.target.value); if (nicError) setNicError(''); }}
              />
              {nicError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{nicError}</div>}
            </div>
            <div className="grid g2" style={{ gap: 10 }}>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Email Address <span className="section-hint">(optional)</span></label>
                <input
                  className="form-inp"
                  type="email"
                  placeholder="e.g. john.perera@email.com"
                  value={customerEmail}
                  onChange={(e) => { setCustomerEmail(e.target.value); if (emailError) setEmailError(''); if (contactError) setContactError(''); }}
                />
                {emailError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{emailError}</div>}
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Mobile Number <span className="section-hint">(optional)</span></label>
                <input
                  className="form-inp"
                  placeholder="e.g. 0771234567"
                  inputMode="tel"
                  value={customerMobile}
                  onChange={(e) => { setCustomerMobile(e.target.value); if (mobileError) setMobileError(''); if (contactError) setContactError(''); }}
                />
                {mobileError && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 5 }}>{mobileError}</div>}
              </div>
            </div>
            {contactError && <div style={{ color: 'var(--red)', fontSize: 11.5, lineHeight: 1.5, margin: '8px 0 0' }}>{contactError}</div>}
            <div className="form-row" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="form-lbl">Account / Card Number <span className="section-hint">(optional)</span></label>
              <input className="form-inp" placeholder="Helps us identify the affected account faster" value={accountRef} onChange={(e) => setAccountRef(e.target.value)} />
            </div>
          </div>

          <div className="form-section" style={{ marginBottom: 0 }}>
            <div className="form-section-hd">Attachments <span className="section-hint">(optional)</span></div>
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
              <button type="button" className="attach-btn" onClick={() => setShowForwardedEmail((v) => !v)}>✉ Paste Forwarded Email</button>
            </div>
            {attachments.length > 0 && (
              <div className="pill-list" style={{ marginTop: 10 }}>
                {attachments.map((a, i) => (
                  <span className="pill" key={i}>
                    {a.type === 'voice' ? '🎙' : a.type === 'screenshot' ? '📷' : '📄'} {a.label}{' '}
                    <span className="tx-link" style={{ marginLeft: 4 }} onClick={() => removeAttachment(i)}>✕</span>
                  </span>
                ))}
              </div>
            )}
            {showForwardedEmail && (
              <div style={{ marginTop: 10 }}>
                <textarea className="form-inp" placeholder="Paste the forwarded email content here…" style={{ minHeight: 70 }} value={forwardedEmail} onChange={(e) => setForwardedEmail(e.target.value)} />
              </div>
            )}
          </div>
        </>
      )}

      {phase === 'processing' && (
        <div className="pub-processing">
          <div className="pub-processing-spinner" />
          <div className="pub-processing-msg">AI Concern Engine processing — understanding, classifying, connecting…</div>
        </div>
      )}

      {phase === 'review' && review && pending && (
        <>
          <Callout kind="acc" style={{ marginBottom: 16 }}>
            <b>{pending.id}</b> has been issued{fullName.trim() ? ' for ' + fullName.trim() : ''}. Review the AI understanding below before confirming.
          </Callout>

          <div className="form-row">
            <label className="form-lbl">Journey</label>
            <Select value={review.journey} onChange={(v) => setReview({ ...review, journey: v })} options={JOURNEYS} />
          </div>
          <div className="form-row">
            <label className="form-lbl">Issue Type</label>
            <input className="form-inp" value={review.issueType} onChange={(e) => setReview({ ...review, issueType: e.target.value })} />
          </div>
          <div className="form-row">
            <label className="form-lbl">Language</label>
            <Select value={review.lang} onChange={(v) => setReview({ ...review, lang: v })} options={LANGS} />
          </div>
          <div className="form-row">
            <label className="form-lbl">Customer Type</label>
            <Select value={review.custType} onChange={(v) => setReview({ ...review, custType: v })} options={['Existing customer', 'New customer']} />
          </div>
          <div className="form-row">
            <label className="form-lbl">Severity</label>
            <Select
              value={review.severity}
              onChange={(v) => setReview({ ...review, severity: v })}
              options={[
                { value: 'critical', label: 'critical' },
                { value: 'high', label: 'high' },
                { value: 'medium', label: 'medium' },
                { value: 'low', label: 'low' },
              ]}
            />
          </div>
          <div className="form-row">
            <label className="form-lbl">Sentiment</label>
            <Select
              value={review.sentiment}
              onChange={(v) => setReview({ ...review, sentiment: v })}
              options={[
                { value: 'angry', label: 'angry' },
                { value: 'frustrated', label: 'frustrated' },
                { value: 'neutral', label: 'neutral' },
                { value: 'positive', label: 'positive' },
              ]}
            />
          </div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <label className="form-lbl">Urgency</label>
            <Select
              value={review.urgency}
              onChange={(v) => setReview({ ...review, urgency: v })}
              options={[
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
          </div>

          {pending.cls.target ? (
            <Callout kind="blue">
              <b>AI connected the dots ({pending.cls.confidence}% confidence).</b> This matches the pattern of{' '}
              <b>{problems.find((p) => p.id === pending.cls.target)?.concernCount} other concerns</b> linked to{' '}
              <span className="tx-link" onClick={() => goToProblem(pending.cls.target)}>
                {pending.cls.target} — {problems.find((p) => p.id === pending.cls.target)?.title}
              </span>
              , based on matching terms: <i>{pending.cls.matchTerms}</i>.
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={review.acceptLink} onChange={(e) => setReview({ ...review, acceptLink: e.target.checked })} />
                  This connection looks correct
                </label>
              </div>
            </Callout>
          ) : (
            <Callout kind="orange">
              <b>No existing pattern matched yet.</b> This concern will be held as a standalone signal and re-checked as more concerns arrive.
            </Callout>
          )}
        </>
      )}

      {phase === 'done' && savedInfo && (
        <>
          <Callout kind="acc">
            <b>{savedInfo.id}</b> confirmed with {savedInfo.attachCount} attachment{savedInfo.attachCount === 1 ? '' : 's'}.
          </Callout>
          {savedInfo.linkedProblem ? (
            <Callout kind="acc">
              Saved and connected to{' '}
              <b className="tx-link" onClick={() => goToProblem(savedInfo.linkedProblem.id)}>
                {savedInfo.linkedProblem.id} — {savedInfo.linkedProblem.title}
              </b>
            </Callout>
          ) : (
            <Callout kind="orange">Saved as a standalone signal — no pattern matched yet.</Callout>
          )}
        </>
      )}
    </SlidePanel>
  );
}
