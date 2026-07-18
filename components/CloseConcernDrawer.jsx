'use client';

import { useState } from 'react';
import SlidePanel from './SlidePanel';
import Select from './Select';
import { useStore } from '@/lib/store';
import { workflowStatusOf } from '@/lib/helpers';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { canAssignCloseConcerns } from '@/lib/constants';

const CLOSE_REASONS = [
  { value: 'deployed', label: 'Fixed — Deployed to Production' },
  { value: 'other', label: 'Closed — Other Reason' },
];
const DEFAULT_CLOSE_MESSAGES = {
  deployed: 'Good news — your concern has been fixed and the update is now live. Please check and let us know if the issue persists.',
  other: '',
};

export default function CloseConcernDrawer({ c, session, open, onClose }) {
  const closeConcern = useStore((s) => s.closeConcern);
  const showToast = useStore((s) => s.showToast);
  const [closeReason, setCloseReason] = useState('deployed');
  const [closeMessage, setCloseMessage] = useState(DEFAULT_CLOSE_MESSAGES.deployed);

  const isClosed = workflowStatusOf(c) === 'closed';
  const canCloseConcern = canAssignCloseConcerns(session?.role) && !isClosed;
  const by = session ? { name: session.name, role: session.title } : null;

  function resetForm() {
    setCloseReason('deployed');
    setCloseMessage(DEFAULT_CLOSE_MESSAGES.deployed);
  }

  function handleClose() {
    onClose();
    resetForm();
  }

  function pickCloseReason(v) {
    setCloseReason(v);
    setCloseMessage((prev) =>
      prev === '' || prev === DEFAULT_CLOSE_MESSAGES.deployed || prev === DEFAULT_CLOSE_MESSAGES.other
        ? DEFAULT_CLOSE_MESSAGES[v]
        : prev,
    );
  }

  function saveClose() {
    if (!closeMessage.trim()) {
      showToast('Please add a message for the customer.');
      return;
    }
    closeConcern(c.id, { reason: closeReason, message: closeMessage.trim() }, by);
    showToast('Concern closed');
    handleClose();
  }

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      {canCloseConcern && (
        <Button onClick={saveClose} disabled={!closeMessage.trim()}>Close Concern</Button>
      )}
    </>
  );

  return (
    <SlidePanel open={open} onClose={handleClose} title="Close Concern" footer={footer} width="28rem">
      {canCloseConcern ? (
        <div className="space-y-5 py-1">
          <div>
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
          </div>
        </div>
      ) : (
        <div className="py-1 text-xs text-muted-foreground">
          {isClosed ? 'This concern is already closed.' : 'You do not have permission to close this concern.'}
        </div>
      )}
    </SlidePanel>
  );
}
