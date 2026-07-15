'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SlidePanel from './SlidePanel';
import Select from './Select';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function TaskUpdateModal({ taskId, onClose, onSaved }) {
  const actions = useStore((s) => s.actions);
  const a = taskId ? actions.find((x) => x.id === taskId) : null;
  const saveRef = useRef(null);

  return (
    <SlidePanel
      open={!!a}
      onClose={onClose}
      title={a ? a.id + ' — ' + a.team : ''}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => saveRef.current && saveRef.current()}>Save Update</Button>
        </>
      }
    >
      {a && <TaskForm key={a.id} action={a} onClose={onClose} onSaved={onSaved} exposeSave={(fn) => { saveRef.current = fn; }} />}
    </SlidePanel>
  );
}

function initialFormFor(a) {
  return {
    owner: a.owner === 'Unassigned' ? '' : a.owner,
    deadline: a.deadline !== '—' ? a.deadline : '',
    target: a.targetMetric || '',
    result: a.currentResult || '',
    progress: a.progressPct || 0,
    status: a.status,
    outcome: a.customerOutcome || '',
  };
}

function TaskForm({ action: a, onClose, onSaved, exposeSave }) {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const updateAction = useStore((s) => s.updateAction);
  const addActionNote = useStore((s) => s.addActionNote);
  const showToast = useStore((s) => s.showToast);

  const p = problems.find((x) => x.id === a.problem);
  const [form, setForm] = useState(() => initialFormFor(a));
  const [note, setNote] = useState('');

  function save() {
    updateAction(a.id, {
      owner: form.owner.trim() || 'Unassigned',
      deadline: form.deadline || '—',
      status: form.status,
      targetMetric: form.target.trim(),
      currentResult: form.result.trim(),
      progressPct: Math.max(0, Math.min(100, parseInt(form.progress, 10) || 0)),
      customerOutcome: form.outcome.trim(),
    });
    if (note.trim()) addActionNote(a.id, note.trim());
    showToast(a.id + ' updated');
    onClose();
    if (onSaved) onSaved();
  }

  useEffect(() => {
    exposeSave(save);
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-1.5">Problem</Label>
        <div
          className="cursor-pointer text-xs text-primary underline underline-offset-2"
          onClick={() => {
            onClose();
            router.push('/problems/' + a.problem);
          }}
        >
          {a.problem} — {p?.title}
        </div>
      </div>
      <div>
        <Label className="mb-1.5">Intervention</Label>
        <div className="text-[12.5px]">{a.intervention || a.title}</div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label className="mb-1.5">Owner</Label>
          <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Assign an owner" />
        </div>
        <div>
          <Label className="mb-1.5">Deadline</Label>
          <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </div>
      </div>
      <div>
        <Label className="mb-1.5">Target Metric</Label>
        <Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="e.g. Reduce repeat contacts by 40%" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label className="mb-1.5">Current Result</Label>
          <Input value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="e.g. Repeat contacts down 28%" />
        </div>
        <div>
          <Label className="mb-1.5">Progress %</Label>
          <Input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
        </div>
      </div>
      <div>
        <Label className="mb-1.5">Status</Label>
        <Select
          value={form.status}
          onChange={(v) => setForm({ ...form, status: v })}
          options={[
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ]}
        />
      </div>
      <div>
        <Label className="mb-1.5">Customer Outcome</Label>
        <Input value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="What does the customer experience once this ships?" />
      </div>
      <div>
        <Label className="mb-1.5">Notes</Label>
        <div className="mb-1.5 text-[11.5px] text-foreground/80">
          {a.notes.length ? (
            a.notes.map((n, i) => (
              <div key={i} className="mb-1">• {n}</div>
            ))
          ) : (
            <span className="text-muted-foreground">No notes yet.</span>
          )}
        </div>
        <Textarea className="min-h-12.5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
      </div>
    </div>
  );
}
