'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SlidePanel from './SlidePanel';
import Callout from './Callout';
import AiStepper from './AiStepper';
import Select from './Select';
import { ChBadge, SevBadge, SntBadge, TriageBadge } from './Badges';
import { useStore } from '@/lib/store';
import { triageInfo, getTimeline, workflowStatusOf, workflowStatusLabel, workflowStatusBadgeClass, MANUAL_STATUS_OPTIONS } from '@/lib/helpers';
import { DEPARTMENTS, DEPARTMENT_MEMBERS } from '@/lib/data';

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
    <div className="pnl-row">
      <span className="pnl-row-lbl">{label}</span>
      <span className="pnl-row-val">{value}</span>
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
      <div className="pnl-section" style={{ paddingTop: 0 }}>
        <div className="pill-list">
          <TriageBadge tri={tri} />
          <ChBadge c={c.channel} />
          <SevBadge s={c.severity} />
          <SntBadge s={c.sentiment} />
          <span className={'badge ' + workflowStatusBadgeClass(workflowStatusOf(c))}>{workflowStatusLabel(workflowStatusOf(c))}</span>
        </div>
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Customer Details</div>
        <Row label="Customer" value={c.customer} />
        {c.nic && <Row label="NIC / Passport" value={c.nic} />}
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Concern Details</div>
        <Row label="Journey" value={c.journey} />
        <Row label="Language" value={c.lang} />
        {c.issueType && <Row label="Issue Type" value={c.issueType} />}
        {c.urgency && <Row label="Urgency" value={c.urgency} />}
        <Row label="Created" value={<span className="mono">{c.createdAt}</span>} />
        <Row label="AI-Suggested Team" value={c.assignee} />
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Assignment</div>
        <Row label="Department" value={c.assignedDepartment || <span className="muted">Not yet assigned</span>} />
        <Row label="Team Member" value={c.assignedTo || <span className="muted">Not yet assigned</span>} />
        <Row label="External Ticket" value={c.externalRef || <span className="muted">Not linked</span>} />

        {canAssignDepartment && (
          <div style={{ marginTop: 12 }}>
            <label className="form-lbl">{c.assignedDepartment ? 'Reassign Department' : 'Assign to Department'}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Select value={deptPick} onChange={setDeptPick} options={DEPARTMENTS} placeholder="Choose a department…" />
              </div>
              <button className="btn btn-p" onClick={saveDepartment} disabled={!deptPick || deptPick === c.assignedDepartment}>Assign</button>
            </div>
          </div>
        )}

        {canActOnDepartment && (
          <div style={{ marginTop: 12 }}>
            <label className="form-lbl">Assign to Team Member</label>
            {roster.length === 0 ? (
              <div className="muted" style={{ fontSize: 11.5 }}>No team members configured for this department yet.</div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Select value={memberPick} onChange={setMemberPick} options={roster} placeholder="Choose a team member…" />
                </div>
                <button className="btn btn-p" onClick={saveMember} disabled={!memberPick || memberPick === c.assignedTo}>Assign</button>
              </div>
            )}
          </div>
        )}

        {canActOnDepartment && (
          <div style={{ marginTop: 12 }}>
            <label className="form-lbl">{c.externalRef ? 'Update External Ticket' : 'Link External Ticket'}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-inp"
                style={{ flex: 1 }}
                placeholder="e.g. JIRA-DEV-245 or vendor ticket ID"
                value={refPick}
                onChange={(e) => setRefPick(e.target.value)}
              />
              <button className="btn btn-p" onClick={saveRef} disabled={!refPick.trim() || refPick.trim() === c.externalRef}>Save</button>
            </div>
          </div>
        )}
      </div>

      {isClosed && (
        <div className="pnl-section">
          <div className="pnl-section-hd">Resolution</div>
          <Callout kind="acc" style={{ marginBottom: 8 }}>{c.closureMessage}</Callout>
          <div className="muted" style={{ fontSize: 10.5 }}>
            Closed — {c.closureReason === 'deployed' ? 'Fixed, Deployed to Production' : 'Other Reason'} · {c.closedAt}
          </div>
        </div>
      )}

      {canCloseConcern && (
        <div className="pnl-section">
          <div className="pnl-section-hd">Close Concern</div>
          <div className="form-row">
            <label className="form-lbl">Reason</label>
            <Select value={closeReason} onChange={pickCloseReason} options={CLOSE_REASONS} />
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Message to Customer</label>
            <textarea
              className="form-inp"
              style={{ minHeight: 70 }}
              placeholder="Explain what happened, in a friendly tone the customer will read…"
              value={closeMessage}
              onChange={(e) => setCloseMessage(e.target.value)}
            />
            <button className="btn btn-p" style={{ marginTop: 8 }} onClick={saveClose} disabled={!closeMessage.trim()}>Close Concern</button>
          </div>
        </div>
      )}

      {canActOnDepartment && (
        <div className="pnl-section">
          <div className="pnl-section-hd">Update</div>
          <div className="form-row" style={{ marginBottom: 14 }}>
            <label className="form-lbl">Update Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Select
                  value={statusPick}
                  onChange={setStatusPick}
                  options={MANUAL_STATUS_OPTIONS.map((s) => ({ value: s, label: workflowStatusLabel(s) }))}
                  placeholder="Choose a status…"
                />
              </div>
              <button className="btn btn-p" onClick={saveStatus} disabled={!statusPick}>Update</button>
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label className="form-lbl">Add Comment</label>
            <textarea
              className="form-inp"
              style={{ minHeight: 60 }}
              placeholder="Add a note for this concern…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-gh" style={{ marginTop: 8 }} onClick={saveComment} disabled={!comment.trim()}>Add Comment</button>
          </div>
        </div>
      )}

      <div className="pnl-section">
        <div className="pnl-section-hd">AI Understanding</div>
        <div style={{ fontSize: 10.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 600 }}>Raw Signal</div>
        <Callout kind="blue" style={{ marginBottom: 12, fontSize: 11.5 }}>{c.raw}</Callout>
        <div style={{ fontSize: 10.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 600 }}>AI Summary</div>
        <div style={{ fontSize: 12, color: 'var(--tx1)', lineHeight: 1.5 }}>{c.summary}</div>
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Why This Was Flagged</div>
        <Callout kind="blue" style={{ marginBottom: 0, fontSize: 11.5 }}>{tri.note}</Callout>
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Processing Pipeline</div>
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
          <Callout kind="acc" style={{ marginBottom: 0, fontSize: 11.5, marginTop: 6 }}>
            Connected to{' '}
            <b className="tx-link" onClick={goToProblem}>
              {linkedProblem.id} — {linkedProblem.title}
            </b>
          </Callout>
        ) : (
          <Callout kind="orange" style={{ marginBottom: 0, fontSize: 11.5, marginTop: 6 }}>Not yet linked to a known problem pattern.</Callout>
        )}
      </div>

      <div className="pnl-section" style={{ marginBottom: 0 }}>
        <div className="pnl-section-hd">Activity Timeline</div>
        {getTimeline(c).map((ev, i) => (
          <div className="pub-status-row" key={i}>
            <div className="pub-status-dot" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{ev.label}</div>
              {ev.detail && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{ev.detail}</div>}
              <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>
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
