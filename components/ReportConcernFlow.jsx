'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Camera, Check, Copy, FileText, Loader2, Mic, Paperclip, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { classify, isValidEmail, isValidSLMobile } from '@/lib/helpers';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const [severity, setSeverity] = useState('medium');
  const [sentiment, setSentiment] = useState('neutral');
  const [urgency, setUrgency] = useState('Medium');
  const [acceptLink, setAcceptLink] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputScreenshot = useRef(null);
  const fileInputDoc = useRef(null);
  const fileInputQuick = useRef(null);
  const textareaRef = useRef(null);

  function beginProcessing() {
    if (!desc.trim()) return;
    setStep('processing');
  }

  function handleDescKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      beginProcessing();
    }
  }

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 260) + 'px';
  }, [desc]);

  // Runs the (client-side) classification once processing starts, then hands
  // off to the details step — the rotating messages are purely a perceived-
  // wait affordance in front of the same classify() call used elsewhere.
  useEffect(() => {
    if (step !== 'processing') return;
    const result = classify(desc.trim());
    const t = setTimeout(() => {
      setCls(result);
      setArea(result.journey && SERVICE_AREAS.includes(result.journey) ? result.journey : SERVICE_AREAS[0]);
      setSeverity(result.severity);
      setSentiment(result.sentiment);
      setUrgency(result.urgency);
      setAcceptLink(!!result.target);
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
    setSeverity('medium');
    setSentiment('neutral');
    setUrgency('Medium');
    setAcceptLink(false);
    setAttachments([]);
    setResult(null);
    setCopied(false);
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
      const target = acceptLink && cls?.target ? cls.target : null;
      const contactParts = [emailTrimmed, mobileTrimmed].filter(Boolean).join(' · ');
      const customerLabel = (name.trim() || 'Anonymous') + (contactParts ? ' · ' + contactParts : '') + ' (' + (accountRef.trim() ? 'existing' : 'new') + ')';
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
        urgency,
        summary: desc.trim().length > 120 ? desc.trim().slice(0, 117) + '…' : desc.trim(),
        severity,
        sentiment,
        attachments,
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
      <div>
        <div className="rounded-3xl border bg-card px-5.5 py-3.5 shadow-lg transition-shadow focus-within:ring-3 focus-within:ring-ring/40">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              className="block max-h-65 min-h-9 flex-1 resize-none self-center overflow-y-auto border-none bg-transparent text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
              rows={1}
              placeholder="Describe what happened, in your own words…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={handleDescKeyDown}
            />
            <input
              ref={fileInputQuick}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) attachFile(file.type.startsWith('image/') ? 'screenshot' : 'document', file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => fileInputQuick.current?.click()}
              aria-label="Attach a photo or document"
              title="Attach a photo or document"
            >
              <Paperclip className="size-4" />
            </button>
            <Button
              type="button"
              size="icon-sm"
              className="shrink-0 rounded-full"
              disabled={!desc.trim()}
              onClick={beginProcessing}
              aria-label="Submit concern"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
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
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return <ProcessingState />;
  }

  if (step === 'done' && result) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-13 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
          <Check className="size-5.5" />
        </div>
        <div className="mb-2.5 font-heading text-xl font-medium">Your concern has been submitted successfully</div>
        <p className="mx-auto mb-7 max-w-[420px] text-[12.5px] leading-relaxed text-muted-foreground">
          Our team typically reviews new concerns within 1–2 business days.
        </p>

        <Label className="mb-2 justify-center text-muted-foreground">Tracking Number</Label>
        <div className="mb-7 flex items-center justify-center gap-3 rounded-xl border bg-muted px-5 py-5">
          <div className="font-heading text-3xl font-semibold tracking-tight">{result.id}</div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            onClick={() => {
              navigator.clipboard?.writeText(result.id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            aria-label="Copy tracking number"
            title="Copy tracking number"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
        <p className="mx-auto mb-7 max-w-[420px] text-[11.5px] leading-relaxed text-muted-foreground">
          We&apos;ve sent this tracking number to your {result.contactMethod}. Please keep it safe for future reference.
        </p>

        {result.linked ? (
          <div className="mx-auto mb-7 max-w-[420px] rounded-lg border bg-muted px-3.5 py-2.5 text-left text-[11.5px] leading-relaxed">
            This matches a pattern we&apos;re already looking into, so it&apos;s been connected straight to the team already working on it.
          </div>
        ) : (
          <div className="mx-auto mb-7 max-w-[420px] rounded-lg border bg-muted px-3.5 py-2.5 text-left text-[11.5px] leading-relaxed">
            A member of our team will review this and reach out if we need more details.
          </div>
        )}

        <div className="mx-auto flex max-w-[420px] gap-2">
          <Button className="flex-1" size="lg" onClick={() => onTrackConcern(result.id)}>
            Track My Concern
          </Button>
          <Button className="flex-1" size="lg" variant="outline" onClick={resetAll}>
            Submit Another Concern
          </Button>
        </div>
      </div>
    );
  }

  // step === 'details'
  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 font-heading text-xl font-medium">We need a few details to keep in touch</div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Thank you for explaining your concern. To create your tracking number and contact you if we need additional information, please provide the
          following details.
        </p>
      </div>

      <div className="mb-9 rounded-lg border bg-muted px-4 py-3.5">
        <div className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Your message</div>
        <div className="text-xs leading-relaxed text-foreground/80 italic">&ldquo;{desc.trim().length > 160 ? desc.trim().slice(0, 157) + '…' : desc.trim()}&rdquo;</div>
      </div>

      <form onSubmit={submit} className="space-y-9">
        <div className="space-y-5">
          <div className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Contact Details</div>
          <div>
            <Label htmlFor="rcf-name" className="mb-1.5">Full Name<span className="text-destructive">*</span></Label>
            <Input
              id="rcf-name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
              placeholder="e.g. W.A. Perera"
            />
            {nameError && <p className="mt-1.5 text-[11px] text-destructive">{nameError}</p>}
          </div>
          <div>
            <Label htmlFor="rcf-nic" className="mb-1.5">NIC / Passport Number<span className="text-destructive">*</span></Label>
            <Input
              id="rcf-nic"
              value={nic}
              onChange={(e) => { setNic(e.target.value); if (nicError) setNicError(''); }}
              placeholder="e.g. 200012345678 or N1234567"
            />
            {nicError && <p className="mt-1.5 text-[11px] text-destructive">{nicError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rcf-email" className="mb-1.5">Email Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="rcf-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); if (contactError) setContactError(''); }}
                placeholder="e.g. john.perera@email.com"
              />
              {emailError && <p className="mt-1.5 text-[11px] text-destructive">{emailError}</p>}
            </div>
            <div>
              <Label htmlFor="rcf-mobile" className="mb-1.5">Mobile Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="rcf-mobile"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value); if (mobileError) setMobileError(''); if (contactError) setContactError(''); }}
                placeholder="e.g. 0771234567"
                inputMode="tel"
              />
              {mobileError && <p className="mt-1.5 text-[11px] text-destructive">{mobileError}</p>}
            </div>
          </div>
          {contactError && <p className="text-[11.5px] leading-relaxed text-destructive">{contactError}</p>}
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="rcf-account" className="mb-1.5">Account / Card Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="rcf-account" value={accountRef} onChange={(e) => setAccountRef(e.target.value)} placeholder="Helps us find your account faster" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Attachments <span className="normal-case font-normal text-muted-foreground/70">(optional)</span></div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={toggleVoiceNote}>
              <Mic className="size-3.5" /> Record Voice Note
            </Button>
            <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}>
              <Camera className="size-3.5" /> Upload Screenshot
              <input ref={fileInputScreenshot} type="file" accept="image/*" className="hidden" onChange={(e) => attachFile('screenshot', e.target.files[0])} />
            </label>
            <label className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}>
              <FileText className="size-3.5" /> Upload Document
              <input ref={fileInputDoc} type="file" className="hidden" onChange={(e) => attachFile('document', e.target.files[0])} />
            </label>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
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
    <div className="flex flex-col items-center justify-center gap-4.5 px-5 py-16 text-center">
      <Loader2 className={cn('size-7 animate-spin text-foreground')} />
      <div className="font-heading text-sm font-medium text-foreground/80">{PROCESSING_MESSAGES[i]}</div>
    </div>
  );
}
