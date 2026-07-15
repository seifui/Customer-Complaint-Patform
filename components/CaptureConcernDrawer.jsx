'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FileText, Loader2, Mail, Mic, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { classify, isValidEmail, isValidSLMobile } from '@/lib/helpers';
import Callout from './Callout';
import Select from './Select';
import SlidePanel from './SlidePanel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

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
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={startAIUnderstanding}>Let AI Understand This</Button>
        </>
      );
    }
    if (phase === 'processing') {
      return (
        <>
          <Button variant="outline" disabled>Cancel</Button>
          <Button disabled><Loader2 className="size-4 animate-spin" /> Understanding…</Button>
        </>
      );
    }
    if (phase === 'review') {
      return (
        <>
          <Button variant="outline" onClick={resetAll}>Discard</Button>
          <Button onClick={confirmConcern}>Confirm &amp; Save Concern</Button>
        </>
      );
    }
    // done
    return (
      <>
        <Button variant="outline" onClick={handleClose}>Close</Button>
        <Button onClick={resetAll}>Log Another Concern</Button>
      </>
    );
  })();

  return (
    <SlidePanel open={open} onClose={handleClose} title="Raise New Concern" subtitle="AI handles the structure — just describe what happened" footer={footer}>
      {phase === 'idle' && (
        <div className="space-y-5">
          <div className="border-b pb-5">
            <div className="mb-3.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Concern Details</div>
            <div className="mb-4">
              <Label className="mb-1.5">Source Channel<span className="text-destructive">*</span></Label>
              <Select value={channel} onChange={setChannel} options={['Call Centre', 'Branch', 'Email', 'Digital App', 'Existing System']} />
            </div>
            <div>
              <Label className="mb-1.5">What happened?<span className="text-destructive">*</span></Label>
              <Textarea
                className="min-h-32.5"
                placeholder="Type or paste what the customer said, in their own words. Sinhala, Tamil, English, and code-mixed text are all supported."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="border-b pb-5">
            <div className="mb-3.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Customer Details</div>
            <div className="mb-4">
              <Label className="mb-1.5">Full Name<span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. W.A. Perera"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (fullNameError) setFullNameError(''); }}
              />
              {fullNameError && <p className="mt-1.5 text-[11px] text-destructive">{fullNameError}</p>}
            </div>
            <div className="mb-4">
              <Label className="mb-1.5">NIC / Passport Number<span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. 199812345678 or N1234567"
                value={nic}
                onChange={(e) => { setNic(e.target.value); if (nicError) setNicError(''); }}
              />
              {nicError && <p className="mt-1.5 text-[11px] text-destructive">{nicError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="mb-1.5">Email Address <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input
                  type="email"
                  placeholder="e.g. john.perera@email.com"
                  value={customerEmail}
                  onChange={(e) => { setCustomerEmail(e.target.value); if (emailError) setEmailError(''); if (contactError) setContactError(''); }}
                />
                {emailError && <p className="mt-1.5 text-[11px] text-destructive">{emailError}</p>}
              </div>
              <div>
                <Label className="mb-1.5">Mobile Number <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input
                  placeholder="e.g. 0771234567"
                  inputMode="tel"
                  value={customerMobile}
                  onChange={(e) => { setCustomerMobile(e.target.value); if (mobileError) setMobileError(''); if (contactError) setContactError(''); }}
                />
                {mobileError && <p className="mt-1.5 text-[11px] text-destructive">{mobileError}</p>}
              </div>
            </div>
            {contactError && <p className="mt-2 text-[11.5px] leading-relaxed text-destructive">{contactError}</p>}
            <div className="mt-4">
              <Label className="mb-1.5">Account / Card Number <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input placeholder="Helps us identify the affected account faster" value={accountRef} onChange={(e) => setAccountRef(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="mb-3.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Attachments <span className="font-normal normal-case text-muted-foreground">(optional)</span></div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={toggleVoiceNote}><Mic className="size-3.5" /> Record Voice Note</Button>
              <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}>
                <Camera className="size-3.5" /> Upload Screenshot
                <input ref={fileInputScreenshot} type="file" accept="image/*" className="hidden" onChange={(e) => attachFile('screenshot', e.target.files[0])} />
              </label>
              <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}>
                <FileText className="size-3.5" /> Upload Document
                <input ref={fileInputDoc} type="file" className="hidden" onChange={(e) => attachFile('document', e.target.files[0])} />
              </label>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForwardedEmail((v) => !v)}><Mail className="size-3.5" /> Paste Forwarded Email</Button>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {attachments.map((a, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {a.type === 'voice' ? <Mic className="size-3" /> : a.type === 'screenshot' ? <Camera className="size-3" /> : <FileText className="size-3" />}
                    {a.label}
                    <button type="button" className="ml-0.5 cursor-pointer" onClick={() => removeAttachment(i)} aria-label="Remove attachment">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {showForwardedEmail && (
              <div className="mt-2.5">
                <Textarea className="min-h-17.5" placeholder="Paste the forwarded email content here…" value={forwardedEmail} onChange={(e) => setForwardedEmail(e.target.value)} />
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex flex-col items-center justify-center gap-4.5 px-5 py-16 text-center">
          <Loader2 className="size-7 animate-spin text-foreground" />
          <div className="font-heading text-sm font-medium text-foreground/80">AI Concern Engine processing — understanding, classifying, connecting…</div>
        </div>
      )}

      {phase === 'review' && review && pending && (
        <>
          <Callout kind="acc">
            <b>{pending.id}</b> has been issued{fullName.trim() ? ' for ' + fullName.trim() : ''}. Review the AI understanding below before confirming.
          </Callout>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">Journey</Label>
              <Select value={review.journey} onChange={(v) => setReview({ ...review, journey: v })} options={JOURNEYS} />
            </div>
            <div>
              <Label className="mb-1.5">Issue Type</Label>
              <Input value={review.issueType} onChange={(e) => setReview({ ...review, issueType: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Language</Label>
              <Select value={review.lang} onChange={(v) => setReview({ ...review, lang: v })} options={LANGS} />
            </div>
            <div>
              <Label className="mb-1.5">Customer Type</Label>
              <Select value={review.custType} onChange={(v) => setReview({ ...review, custType: v })} options={['Existing customer', 'New customer']} />
            </div>
            <div>
              <Label className="mb-1.5">Severity</Label>
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
            <div>
              <Label className="mb-1.5">Sentiment</Label>
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
            <div>
              <Label className="mb-1.5">Urgency</Label>
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
          </div>

          {pending.cls.target ? (
            <Callout kind="blue" className="mt-4">
              <b>AI connected the dots ({pending.cls.confidence}% confidence).</b> This matches the pattern of{' '}
              <b>{problems.find((p) => p.id === pending.cls.target)?.concernCount} other concerns</b> linked to{' '}
              <span className="cursor-pointer text-primary underline underline-offset-2" onClick={() => goToProblem(pending.cls.target)}>
                {pending.cls.target} — {problems.find((p) => p.id === pending.cls.target)?.title}
              </span>
              , based on matching terms: <i>{pending.cls.matchTerms}</i>.
              <div className="mt-2">
                <Label className="cursor-pointer text-[11.5px] font-normal">
                  <Checkbox checked={review.acceptLink} onCheckedChange={(v) => setReview({ ...review, acceptLink: !!v })} />
                  This connection looks correct
                </Label>
              </div>
            </Callout>
          ) : (
            <Callout kind="orange" className="mt-4">
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
              <b className="cursor-pointer text-primary underline underline-offset-2" onClick={() => goToProblem(savedInfo.linkedProblem.id)}>
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
