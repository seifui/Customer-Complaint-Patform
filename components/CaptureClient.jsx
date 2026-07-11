'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { classify } from '@/lib/helpers';
import AiStepper from './AiStepper';
import Callout from './Callout';

const JOURNEYS = ['Money Transfer', 'Cards', 'KYC / Onboarding', 'Loans', 'Standing Orders', 'ATM', 'Digital Banking App', 'Account Services', 'Other'];
const LANGS = ['English', 'Sinhala', 'Sinhala (romanized)', 'Tamil', 'Code-mixed'];

export default function CaptureClient({ session }) {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const nextConcernId = useStore((s) => s.nextConcernId);
  const addConcern = useStore((s) => s.addConcern);
  const showToast = useStore((s) => s.showToast);

  const defaultChannel = session.role === 'branch' ? 'Branch' : 'Call Centre';
  const [channel, setChannel] = useState(defaultChannel);
  const [desc, setDesc] = useState('');
  const [customer, setCustomer] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputScreenshot = useRef(null);
  const fileInputDoc = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | processing | review | done
  const [pending, setPending] = useState(null); // { id, stamp, raw, cls, attachments }
  const [review, setReview] = useState(null); // editable fields
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
    setCustomer('');
    setShowEmail(false);
    setEmail('');
    setAttachments([]);
    setPhase('idle');
    setPending(null);
    setReview(null);
    setSavedInfo(null);
  }

  function startAIUnderstanding() {
    const fullText = [desc.trim(), showEmail ? email.trim() : ''].filter(Boolean).join(' — ');
    if (!fullText && !attachments.length) {
      showToast('Please describe what happened, paste an email, or attach something.');
      return;
    }
    if (!fullText) {
      showToast('Attachments are noted, but AI still needs some text to understand — add a short description too.');
      return;
    }

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
    const newConcern = {
      id: pending.id,
      channel,
      customer: (customer || 'Not specified') + ' (' + (review.custType === 'New customer' ? 'new' : 'existing') + ')',
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
    };
    addConcern(newConcern);

    const linkedProblem = target ? problems.find((p) => p.id === target) : null;
    setSavedInfo({ id: pending.id, attachCount: pending.attachments.length, linkedProblem });
    setPhase('done');
    showToast('Concern captured — Tracking ID ' + pending.id);
  }

  return (
    <div className="grid g2" style={{ gridTemplateColumns: '1.1fr 1fr', alignItems: 'flex-start' }}>
      <div className="card">
        <div className="section-title" style={{ fontSize: 15, marginBottom: 3 }}>Tell us what happened</div>
        <div className="section-hint" style={{ marginBottom: 20, display: 'block' }}>AI handles the structure — just describe it</div>

        <div className="form-section">
          <div className="form-section-hd">Concern Details</div>
          <div className="form-row">
            <label className="form-lbl">Source Channel<span className="req">*</span></label>
            <select className="form-inp" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>Call Centre</option>
              <option>Branch</option>
              <option>Email</option>
              <option>Digital App</option>
              <option>Existing System</option>
            </select>
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
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Customer Name / ID <span className="section-hint">(optional)</span></label>
            <input className="form-inp" placeholder="e.g. W.A. Perera / CIF-00019284" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
        </div>

        <div className="form-section">
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
            <button type="button" className="attach-btn" onClick={() => setShowEmail((v) => !v)}>✉ Paste Forwarded Email</button>
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
          {showEmail && (
            <div style={{ marginTop: 10 }}>
              <textarea className="form-inp" placeholder="Paste the forwarded email content here…" style={{ minHeight: 70 }} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
        </div>

        <button
          className={'btn btn-p' + (phase === 'processing' ? ' btn-loading' : '')}
          onClick={startAIUnderstanding}
          disabled={phase === 'processing'}
          style={{ width: '100%', height: 40, justifyContent: 'center', fontSize: 12.5, marginTop: 4 }}
        >
          {phase === 'processing' ? 'Understanding…' : 'Let AI Understand This'}
        </button>
      </div>

      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">How this feeds the AI Concern Engine</div>
          <AiStepper
            steps={[
              { label: 'Ingest', desc: 'A tracking ID is issued the moment you submit — before processing starts.', state: 'pending' },
              { label: 'Clean & Dedupe', desc: 'Checked against other recent signals for duplicates.', state: 'pending' },
              { label: 'Understand', desc: 'AI infers journey, issue type, and language.', state: 'pending' },
              { label: 'Classify', desc: 'Severity, sentiment, urgency, and customer type are assigned.', state: 'pending' },
              { label: 'Connect', desc: 'Checked against known problems — you can correct anything before confirming.', state: 'pending' },
            ]}
          />
        </div>

        {phase === 'processing' && (
          <div className="card">
            <div className="section-title">Tracking ID Issued</div>
            <Callout kind="acc">
              <b>{pending?.id || '…'}</b> has been created{customer ? ' for ' + customer : ''}. The customer can reference this ID for status.
            </Callout>
            <div className="processing-box">
              <div className="spinner" />
              <span>AI Concern Engine processing — understanding, classifying, connecting…</span>
            </div>
          </div>
        )}

        {phase === 'review' && review && pending && (
          <div className="card">
            <div className="section-title">
              AI Understanding <span className="section-hint">review and correct before confirming</span>
            </div>
            <div className="grid g2" style={{ gap: 10, marginBottom: 12 }}>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Journey</label>
                <select className="form-inp" value={review.journey} onChange={(e) => setReview({ ...review, journey: e.target.value })}>
                  {JOURNEYS.map((j) => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Issue Type</label>
                <input className="form-inp" value={review.issueType} onChange={(e) => setReview({ ...review, issueType: e.target.value })} />
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Language</label>
                <select className="form-inp" value={review.lang} onChange={(e) => setReview({ ...review, lang: e.target.value })}>
                  {LANGS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Customer Type</label>
                <select className="form-inp" value={review.custType} onChange={(e) => setReview({ ...review, custType: e.target.value })}>
                  <option>Existing customer</option>
                  <option>New customer</option>
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Severity</label>
                <select className="form-inp" value={review.severity} onChange={(e) => setReview({ ...review, severity: e.target.value })}>
                  <option value="critical">critical</option>
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Sentiment</label>
                <select className="form-inp" value={review.sentiment} onChange={(e) => setReview({ ...review, sentiment: e.target.value })}>
                  <option value="angry">angry</option>
                  <option value="frustrated">frustrated</option>
                  <option value="neutral">neutral</option>
                  <option value="positive">positive</option>
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-lbl">Urgency</label>
                <select className="form-inp" value={review.urgency} onChange={(e) => setReview({ ...review, urgency: e.target.value })}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {pending.cls.target ? (
              <Callout kind="blue">
                <b>AI connected the dots ({pending.cls.confidence}% confidence).</b> This matches the pattern of{' '}
                <b>{problems.find((p) => p.id === pending.cls.target)?.concernCount} other concerns</b> linked to{' '}
                <span className="tx-link" onClick={() => router.push('/problems/' + pending.cls.target)}>
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

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-p" onClick={confirmConcern}>Confirm &amp; Save Concern</button>
              <button className="btn btn-gh" onClick={resetAll}>Discard</button>
            </div>
          </div>
        )}

        {phase === 'done' && savedInfo && (
          <div className="card">
            <div className="section-title">Concern Saved</div>
            <Callout kind="acc">
              <b>{savedInfo.id}</b> confirmed with {savedInfo.attachCount} attachment{savedInfo.attachCount === 1 ? '' : 's'}.
            </Callout>
            {savedInfo.linkedProblem ? (
              <Callout kind="acc">
                Saved and connected to{' '}
                <b className="tx-link" onClick={() => router.push('/problems/' + savedInfo.linkedProblem.id)}>
                  {savedInfo.linkedProblem.id} — {savedInfo.linkedProblem.title}
                </b>
              </Callout>
            ) : (
              <Callout kind="orange">Saved as a standalone signal — no pattern matched yet.</Callout>
            )}
            <button className="btn btn-gh" onClick={resetAll}>Log Another Concern</button>
          </div>
        )}
      </div>
    </div>
  );
}
