'use client';

import { useEffect, useState } from 'react';
import SlidePanel from './SlidePanel';
import Select from './Select';
import { useStore } from '@/lib/store';
import { MANUAL_STATUS_OPTIONS, workflowStatusLabel, workflowStatusOf } from '@/lib/helpers';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { canUpdateConcernProgress } from '@/lib/constants';

const STATUS_OPTIONS = MANUAL_STATUS_OPTIONS.map((s) => ({
  value: s,
  label: workflowStatusLabel(s),
}));

export default function UpdateProgressDrawer({ c, session, open, onClose }) {
  const saveConcernProgress = useStore((s) => s.saveConcernProgress);
  const showToast = useStore((s) => s.showToast);

  const currentStatus = workflowStatusOf(c);
  const isClosed = currentStatus === 'closed';
  const canUpdate = canUpdateConcernProgress(session?.role) && !isClosed;
  const by = session ? { name: session.name, role: session.title } : null;

  const [statusPick, setStatusPick] = useState('');
  const [progressUpdate, setProgressUpdate] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [customerUpdate, setCustomerUpdate] = useState('');

  useEffect(() => {
    if (open) {
      setStatusPick('');
      setProgressUpdate('');
      setInternalNote('');
      setCustomerUpdate('');
    }
  }, [open, c]);

  const statusChanged = !!statusPick && statusPick !== currentStatus;
  const hasNotes = !!(progressUpdate.trim() || internalNote.trim() || customerUpdate.trim());
  const needsProgress = statusChanged && !progressUpdate.trim();
  const canSave = canUpdate && (statusChanged || hasNotes) && !needsProgress;

  function handleClose() {
    onClose();
  }

  function saveProgress() {
    if (!canSave) {
      if (needsProgress) showToast('Add a progress update when changing status.');
      return;
    }
    saveConcernProgress(c.id, {
      status: statusChanged ? statusPick : null,
      progressUpdate: progressUpdate.trim() || null,
      internalNote: internalNote.trim() || null,
      customerUpdate: customerUpdate.trim() || null,
    }, by);
    showToast('Progress saved');
    handleClose();
  }

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      {canUpdate && (
        <Button onClick={saveProgress} disabled={!canSave}>Save Progress</Button>
      )}
    </>
  );

  return (
    <SlidePanel open={open} onClose={handleClose} title="Update Progress" footer={footer} width="28rem">
      {canUpdate ? (
        <div className="space-y-5 py-1">
          <div>
            <Label className="mb-1.5">Update Status</Label>
            <Select
              value={statusPick}
              onChange={setStatusPick}
              options={STATUS_OPTIONS}
              placeholder="Choose a status…"
            />
          </div>

          <div>
            <Label className="mb-1.5">
              Progress Update{statusChanged ? ' *' : ''}
            </Label>
            <Textarea
              className="min-h-20"
              placeholder="Describe what has been completed, findings, and the next steps…"
              value={progressUpdate}
              onChange={(e) => setProgressUpdate(e.target.value)}
            />
            {statusChanged && (
              <div className="mt-1 text-[10.5px] text-muted-foreground">
                Required when changing status.
              </div>
            )}
          </div>

          <div>
            <Label className="mb-1.5">Internal Notes</Label>
            <Textarea
              className="min-h-17.5"
              placeholder="Visible only to internal staff."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5">Customer Update</Label>
            <Textarea
              className="min-h-17.5"
              placeholder="Write a message that will be sent to the customer."
              value={customerUpdate}
              onChange={(e) => setCustomerUpdate(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="py-1 text-xs text-muted-foreground">
          {isClosed
            ? 'This concern is closed. Progress can no longer be updated.'
            : 'You do not have permission to update progress on this concern.'}
        </div>
      )}
    </SlidePanel>
  );
}
