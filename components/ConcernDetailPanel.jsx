'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FileText, Mic } from 'lucide-react';
import SlidePanel from './SlidePanel';
import Callout from './Callout';
import AiStepper from './AiStepper';
import Select from './Select';
import { ChBadge, SevBadge, SntBadge, TriageBadge, WfBadge } from './Badges';
import { useStore } from '@/lib/store';
import { triageInfo, getTimeline, workflowStatusOf, workflowStatusLabel, MANUAL_STATUS_OPTIONS } from '@/lib/helpers';
import { DEPARTMENTS, DEPARTMENT_MEMBERS } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ConcernDetailPanel({ concernId, onClose, session }) {
  const router = useRouter();
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const c = concernId ? concerns.find((x) => x.id === concernId) : null;

  return (
    <SlidePanel open={!!c} onClose={onClose} title={c ? c.id : 'Concern Detail'}>
      {c && (
        <ConcernDetailBody
          c={c}
          session={session}
          tri={triageInfo(c, problems)}
          linkedProblem={c.linked ? problems.find((p) => p.id === c.linked) : null}
          goToProblem={() => {
            onClose();
            router.push('/problems/' + c.linked);
          }}
        />
      )}
    </SlidePanel>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3.5 py-1 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

const CLOSE_REASONS = [
  { value: 'deployed', label: 'Fixed — Deployed to Production' },
  { value: 'other', label: 'Closed — Other Reason' },
];
const DEFAULT_CLOSE_MESSAGES = {
  deployed: 'Good news — your concern has been fixed and the update is now live. Please check and let us know if the issue persists.',
  other: '',
};

function ConcernDetailBody({ c, session, tri, linkedProblem, goToProblem }) {
  const assignConcernDepartment = useStore((s) => s.assignConcernDepartment);
  const assignConcernMember = useStore((s) => s.assignConcernMember);
  const setConcernExternalRef = useStore((s) => s.setConcernExternalRef);
  const updateConcernStatus = useStore((s) => s.updateConcernStatus);
  const addConcernComment = useStore((s) => s.addConcernComment);
  const closeConcern = useStore((s) => s.closeConcern);
  const showToast = useStore((s) => s.showToast);

  const [deptPick, setDeptPick] = useState('');
  const [memberPick, setMemberPick] = useState('');
  const [refPick, setRefPick] = useState('');
  const [statusPick, setStatusPick] = useState('');
  const [comment, setComment] = useState('');
  const [closeReason, setCloseReason] = useState('deployed');
  const [closeMessage, setCloseMessage] = useState(DEFAULT_CLOSE_MESSAGES.deployed);

  const role = session?.role;
  const isClosed = workflowStatusOf(c) === 'closed';
  // Generic by design: any dept_manager account can only act on concerns
  // already routed to their own department — nothing here names "Technology"
  // specifically, so adding new departments never touches this component.
  // Once a concern is closed the whole record locks — no further routing,
  // status changes, or comments from anyone.
  const canAssignDepartment = role === 'manager' && !isClosed;
  const canActOnDepartment = role === 'dept_manager' && !!c.assignedDepartment && c.assignedDepartment === session?.department && !isClosed;
  const canCloseConcern = role === 'manager' && !isClosed;

  const by = session ? { name: session.name, role: session.title } : null;
  const roster = DEPARTMENT_MEMBERS[c.assignedDepartment] || [];

  function saveDepartment() {
    if (!deptPick || deptPick === c.assignedDepartment) return;
    assignConcernDepartment(c.id, deptPick, by);
    showToast('Assigned to ' + deptPick);
    setDeptPick('');
  }
  function saveMember() {
    if (!memberPick || memberPick === c.assignedTo) return;
    assignConcernMember(c.id, memberPick, by);
    showToast('Assigned to ' + memberPick);
    setMemberPick('');
  }
  function saveRef() {
    const val = refPick.trim();
    if (!val || val === c.externalRef) return;
    setConcernExternalRef(c.id, val, by);
    showToast('External ticket linked');
    setRefPick('');
  }
  function saveStatus() {
    if (!statusPick) return;
    updateConcernStatus(c.id, statusPick, by);
    showToast('Status updated');
    setStatusPick('');
  }
  function saveComment() {
    if (!comment.trim()) return;
    addConcernComment(c.id, comment.trim(), by);
    setComment('');
    showToast('Comment added');
  }
  function pickCloseReason(v) {
    setCloseReason(v);
    setCloseMessage((prev) => (prev === '' || prev === DEFAULT_CLOSE_MESSAGES.deployed || prev === DEFAULT_CLOSE_MESSAGES.other ? DEFAULT_CLOSE_MESSAGES[v] : prev));
  }
  function saveClose() {
    if (!closeMessage.trim()) {
      showToast('Please add a message for the customer.');
      return;
    }
    closeConcern(c.id, { reason: closeReason, message: closeMessage.trim() }, by);
    showToast('Concern closed');
  }

  return (
    <>
      <div className="border-b py-4.5 first:pt-0">
        <div className="flex flex-wrap gap-1.5">
          <TriageBadge tri={tri} />
          <ChBadge c={c.channel} />
          <SevBadge s={c.severity} />
          <SntBadge s={c.sentiment} />
          <WfBadge s={workflowStatusOf(c)} />
        </div>
      </div>

      <div className="border-b py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Customer Details</div>
        <Row label="Customer" value={c.customer} />
        {c.nic && <Row label="NIC / Passport" value={c.nic} />}
      </div>

      <div className="border-b py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Concern Details</div>
        <Row label="Journey" value={c.journey} />
        <Row label="Language" value={c.lang} />
        {c.issueType && <Row label="Issue Type" value={c.issueType} />}
        {c.urgency && <Row label="Urgency" value={c.urgency} />}
        <Row label="Created" value={<span className="font-mono">{c.createdAt}</span>} />
        <Row label="AI-Suggested Team" value={c.assignee} />
        {c.attachments?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {c.attachments.map((a, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {a.type === 'voice' ? <Mic className="size-3" /> : a.type === 'screenshot' ? <Camera className="size-3" /> : <FileText className="size-3" />}
                {a.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="border-b py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Assignment</div>
        <Row label="Department" value={c.assignedDepartment || <span className="text-muted-foreground">Not yet assigned</span>} />
        <Row label="Team Member" value={c.assignedTo || <span className="text-muted-foreground">Not yet assigned</span>} />
        <Row label="External Ticket" value={c.externalRef || <span className="text-muted-foreground">Not linked</span>} />

        {canAssignDepartment && (
          <div className="mt-3">
            <Label className="mb-1.5">{c.assignedDepartment ? 'Reassign Department' : 'Assign to Department'}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={deptPick} onChange={setDeptPick} options={DEPARTMENTS} placeholder="Choose a department…" />
              </div>
              <Button onClick={saveDepartment} disabled={!deptPick || deptPick === c.assignedDepartment}>Assign</Button>
            </div>
          </div>
        )}

        {canActOnDepartment && (
          <div className="mt-3">
            <Label className="mb-1.5">Assign to Team Member</Label>
            {roster.length === 0 ? (
              <div className="text-[11.5px] text-muted-foreground">No team members configured for this department yet.</div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={memberPick} onChange={setMemberPick} options={roster} placeholder="Choose a team member…" />
                </div>
                <Button onClick={saveMember} disabled={!memberPick || memberPick === c.assignedTo}>Assign</Button>
              </div>
            )}
          </div>
        )}

        {canActOnDepartment && (
          <div className="mt-3">
            <Label className="mb-1.5">{c.externalRef ? 'Update External Ticket' : 'Link External Ticket'}</Label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="e.g. JIRA-DEV-245 or vendor ticket ID"
                value={refPick}
                onChange={(e) => setRefPick(e.target.value)}
              />
              <Button onClick={saveRef} disabled={!refPick.trim() || refPick.trim() === c.externalRef}>Save</Button>
            </div>
          </div>
        )}
      </div>

      {isClosed && (
        <div className="border-b py-4.5">
          <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Resolution</div>
          <Callout kind="acc">{c.closureMessage}</Callout>
          <div className="text-[10.5px] text-muted-foreground">
            Closed — {c.closureReason === 'deployed' ? 'Fixed, Deployed to Production' : 'Other Reason'} · {c.closedAt}
          </div>
        </div>
      )}

      {canCloseConcern && (
        <div className="border-b py-4.5">
          <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Close Concern</div>
          <div className="mb-4">
            <Label className="mb-1.5">Reason</Label>
            <Select value={closeReason} onChange={pickCloseReason} options={CLOSE_REASONS} />
          </div>
          <div>
            <Label className="mb-1.5">Message to Customer</Label>
            <Textarea
              className="min-h-17.5"
              placeholder="Explain what happened, in a friendly tone the customer will read…"
              value={closeMessage}
              onChange={(e) => setCloseMessage(e.target.value)}
            />
            <Button className="mt-2" onClick={saveClose} disabled={!closeMessage.trim()}>Close Concern</Button>
          </div>
        </div>
      )}

      {canActOnDepartment && (
        <div className="border-b py-4.5">
          <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Update</div>
          <div className="mb-3.5">
            <Label className="mb-1.5">Update Status</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={statusPick}
                  onChange={setStatusPick}
                  options={MANUAL_STATUS_OPTIONS.map((s) => ({ value: s, label: workflowStatusLabel(s) }))}
                  placeholder="Choose a status…"
                />
              </div>
              <Button onClick={saveStatus} disabled={!statusPick}>Update</Button>
            </div>
          </div>
          <div>
            <Label className="mb-1.5">Add Comment</Label>
            <Textarea
              className="min-h-15"
              placeholder="Add a note for this concern…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button variant="outline" className="mt-2" onClick={saveComment} disabled={!comment.trim()}>Add Comment</Button>
          </div>
        </div>
      )}

      <div className="border-b py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">AI Understanding</div>
        <div className="mb-1.5 text-[10.5px] font-semibold text-muted-foreground">Raw Signal</div>
        <Callout kind="blue" className="text-[11.5px]">{c.raw}</Callout>
        <div className="mb-1.5 text-[10.5px] font-semibold text-muted-foreground">AI Summary</div>
        <div className="text-xs leading-relaxed text-foreground/80">{c.summary}</div>
      </div>

      <div className="border-b py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Why This Was Flagged</div>
        <Callout kind="blue" className="mb-0 text-[11.5px]">{tri.note}</Callout>
      </div>

      <div className="border-b py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Processing Pipeline</div>
        <AiStepper
          steps={[
            { label: 'Ingest', desc: 'Signal received and timestamped', state: 'done' },
            { label: 'Dedupe', desc: 'Checked against existing open signals', state: 'done' },
            { label: 'Understand', desc: 'AI parsed language, journey, and intent', state: 'done' },
            { label: 'Classify', desc: 'Severity and sentiment assigned', state: 'done' },
            {
              label: 'Connect',
              desc: c.linked ? 'Matched to a known problem pattern' : 'Still checking for a matching pattern',
              state: c.linked ? 'done' : 'active',
            },
          ]}
        />
        {c.linked ? (
          <Callout kind="acc" className="mt-1.5 mb-0 text-[11.5px]">
            Connected to{' '}
            <b className="cursor-pointer text-primary underline underline-offset-2" onClick={goToProblem}>
              {linkedProblem.id} — {linkedProblem.title}
            </b>
          </Callout>
        ) : (
          <Callout kind="orange" className="mt-1.5 mb-0 text-[11.5px]">Not yet linked to a known problem pattern.</Callout>
        )}
      </div>

      <div className="py-4.5">
        <div className="mb-3 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Activity Timeline</div>
        {getTimeline(c).map((ev, i) => (
          <div className="flex items-start gap-2.5 border-b py-3.5 last:border-b-0" key={i}>
            <div className="mt-1 size-2 shrink-0 rounded-full bg-foreground" />
            <div>
              <div className="text-xs font-semibold">{ev.label}</div>
              {ev.detail && <div className="mt-0.5 text-[11px] text-muted-foreground">{ev.detail}</div>}
              <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                {ev.by}
                {ev.byRole ? ' · ' + ev.byRole : ''} · {ev.at}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
