'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SlidePanel from './SlidePanel';
import Select from './Select';
import { useStore } from '@/lib/store';

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
          <button className="btn btn-gh" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => saveRef.current && saveRef.current()}>Save Update</button>
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
    <>
      <div className="form-row">
        <label className="form-lbl">Problem</label>
        <div
          className="tx-link"
          onClick={() => {
            onClose();
            router.push('/problems/' + a.problem);
          }}
        >
          {a.problem} — {p?.title}
        </div>
      </div>
      <div className="form-row">
        <label className="form-lbl">Intervention</label>
        <div style={{ fontSize: 12.5 }}>{a.intervention || a.title}</div>
      </div>
      <div className="grid g2" style={{ gap: 10 }}>
        <div className="form-row">
          <label className="form-lbl">Owner</label>
          <input className="form-inp" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Assign an owner" />
        </div>
        <div className="form-row">
          <label className="form-lbl">Deadline</label>
          <input className="form-inp" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <label className="form-lbl">Target Metric</label>
        <input className="form-inp" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="e.g. Reduce repeat contacts by 40%" />
      </div>
      <div className="grid g2" style={{ gap: 10 }}>
        <div className="form-row">
          <label className="form-lbl">Current Result</label>
          <input className="form-inp" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="e.g. Repeat contacts down 28%" />
        </div>
        <div className="form-row">
          <label className="form-lbl">Progress %</label>
          <input className="form-inp" type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <label className="form-lbl">Status</label>
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
      <div className="form-row">
        <label className="form-lbl">Customer Outcome</label>
        <input className="form-inp" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="What does the customer experience once this ships?" />
      </div>
      <div className="form-row" style={{ marginBottom: 0 }}>
        <label className="form-lbl">Notes</label>
        <div style={{ fontSize: 11.5, color: 'var(--tx1)', marginBottom: 6 }}>
          {a.notes.length ? (
            a.notes.map((n, i) => (
              <div key={i} style={{ marginBottom: 4 }}>• {n}</div>
            ))
          ) : (
            <span className="muted">No notes yet.</span>
          )}
        </div>
        <textarea className="form-inp" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" style={{ minHeight: 50 }} />
      </div>
    </>
  );
}
