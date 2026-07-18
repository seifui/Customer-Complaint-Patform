'use client';

import { useState } from 'react';
import SlidePanel from './SlidePanel';
import Select from './Select';
import { useStore } from '@/lib/store';
import { workflowStatusOf } from '@/lib/helpers';
import { DEPARTMENTS, DEPARTMENT_MEMBERS } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { canAssignCloseConcerns } from '@/lib/constants';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3.5 py-1 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium break-words">{value}</span>
    </div>
  );
}

export default function AssignConcernDrawer({ c, session, open, onClose }) {
  const assignConcernDepartment = useStore((s) => s.assignConcernDepartment);
  const assignConcernMember = useStore((s) => s.assignConcernMember);
  const showToast = useStore((s) => s.showToast);
  const [deptPick, setDeptPick] = useState('');
  const [memberPick, setMemberPick] = useState('');

  const isClosed = workflowStatusOf(c) === 'closed';
  const canAssignDepartment = canAssignCloseConcerns(session?.role) && !isClosed;
  const by = session ? { name: session.name, role: session.title } : null;
  const roster = deptPick ? (DEPARTMENT_MEMBERS[deptPick] || []) : [];
  const memberDisabled = !deptPick;

  function handleClose() {
    onClose();
    setDeptPick('');
    setMemberPick('');
  }

  function pickDepartment(value) {
    setDeptPick(value);
    setMemberPick('');
  }

  function saveAssign() {
    if (!deptPick) return;
    const deptChanged = deptPick !== c.assignedDepartment;
    const memberChanged = !!memberPick && memberPick !== c.assignedTo;
    if (!deptChanged && !memberChanged) return;

    if (deptChanged) {
      assignConcernDepartment(c.id, deptPick, by);
    }
    if (memberPick) {
      assignConcernMember(c.id, memberPick, by);
      showToast('Assigned to ' + memberPick + ' · ' + deptPick);
    } else {
      showToast('Assigned to ' + deptPick);
    }
    setDeptPick('');
    setMemberPick('');
    onClose();
  }

  const canAssignNow =
    canAssignDepartment &&
    !!deptPick &&
    (deptPick !== c.assignedDepartment || (!!memberPick && memberPick !== c.assignedTo));

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      {canAssignDepartment && (
        <Button onClick={saveAssign} disabled={!canAssignNow}>Assign</Button>
      )}
    </>
  );

  return (
    <SlidePanel open={open} onClose={handleClose} title="Assign" footer={footer} width="28rem">
      <div className="space-y-5 py-1">
        <div>
          <Row label="Department" value={c.assignedDepartment || <span className="text-muted-foreground">Not yet assigned</span>} />
          <Row label="Team Member" value={c.assignedTo || <span className="text-muted-foreground">Not yet assigned</span>} />
          <Row label="External Ticket" value={c.externalRef || <span className="text-muted-foreground">Not linked</span>} />
        </div>

        {canAssignDepartment && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">{c.assignedDepartment ? 'Reassign Department' : 'Assign to Department'}</Label>
              <Select
                value={deptPick}
                onChange={pickDepartment}
                options={DEPARTMENTS}
                placeholder="Choose a department…"
              />
            </div>

            <div>
              <Label className="mb-1.5">Assign to Team Member</Label>
              {deptPick && roster.length === 0 ? (
                <div className="text-[11.5px] text-muted-foreground">
                  No team members configured for this department yet.
                </div>
              ) : (
                <Select
                  value={memberPick}
                  onChange={setMemberPick}
                  options={roster}
                  placeholder={memberDisabled ? 'Select a department first…' : 'Choose a team member…'}
                  disabled={memberDisabled}
                />
              )}
            </div>
          </div>
        )}

        {!canAssignDepartment && (
          <div className="text-xs text-muted-foreground">
            {isClosed ? 'This concern is closed. Assignment can no longer be changed.' : 'You do not have permission to assign this concern.'}
          </div>
        )}
      </div>
    </SlidePanel>
  );
}
