'use client';

// Client-side in-memory store (Zustand). Seeded from lib/data.js on first load,
// mutated live during the browsing session, and reset whenever the dev server
// restarts / the page does a full reload of the JS bundle — same behavior as
// the original HTML prototype's plain JS globals.

import { create } from 'zustand';
import { PROBLEMS_SEED, CONCERNS_SEED, ACTIONS_SEED } from './data';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

let toastTimer;

export const useStore = create((set, get) => ({
  problems: clone(PROBLEMS_SEED),
  concerns: clone(CONCERNS_SEED),
  actions: clone(ACTIONS_SEED),
  seq: 10065,

  queueFilters: { channel: '', severity: '', triage: '', q: '' },
  actionFilters: { team: '', owner: '', problem: '' },

  toast: null, // { id, message }
  showToast(message) {
    set({ toast: { id: Date.now(), message } });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 3200);
  },

  setQueueFilters(patch) {
    set((s) => ({ queueFilters: { ...s.queueFilters, ...patch } }));
  },
  resetQueueFilters() {
    set({ queueFilters: { channel: '', severity: '', triage: '', q: '' } });
  },
  setActionFilters(patch) {
    set((s) => ({ actionFilters: { ...s.actionFilters, ...patch } }));
  },
  resetActionFilters() {
    set({ actionFilters: { team: '', owner: '', problem: '' } });
  },

  problemById(id) {
    return get().problems.find((p) => p.id === id);
  },

  nextConcernId() {
    const id = 'CCI-' + get().seq;
    set((s) => ({ seq: s.seq + 1 }));
    return id;
  },

  addConcern(concern) {
    set((s) => ({ concerns: [concern, ...s.concerns] }));
  },

  saveProblemAssignment(id, { owner, target, deadline }) {
    set((s) => ({
      problems: s.problems.map((p) =>
        p.id === id
          ? { ...p, owner, target: target || p.target, deadline, status: 'action-in-progress' }
          : p
      ),
    }));
  },

  updateAction(id, patch) {
    set((s) => ({
      actions: s.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  },

  addActionNote(id, note) {
    set((s) => ({
      actions: s.actions.map((a) => (a.id === id ? { ...a, notes: [...a.notes, note] } : a)),
    }));
  },
}));
