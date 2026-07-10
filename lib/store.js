'use client';

// Client-side store (Zustand), persisted to localStorage and synced live
// across browser tabs. Seeded from lib/data.js the first time it loads in a
// given browser. This lets the public customer complaint form (a separate,
// unauthenticated page) and the internal admin dashboard (a separate,
// authenticated session) share the same data during a demo — submit in one
// tab, see it appear in another — without standing up a real backend.
//
// Trade-off: data now survives page refresh (until localStorage is cleared)
// instead of resetting on every reload. Use the "Reset demo data" link on
// the login page to go back to the seed dataset.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PROBLEMS_SEED, CONCERNS_SEED, ACTIONS_SEED } from './data';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

let toastTimer;

export const STORE_KEY = 'cci-platform-store';

export const useStore = create(
  persist(
    (set, get) => ({
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
      concernById(id) {
        return get().concerns.find((c) => c.id === id);
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

      resetDemoData() {
        set({
          problems: clone(PROBLEMS_SEED),
          concerns: clone(CONCERNS_SEED),
          actions: clone(ACTIONS_SEED),
          seq: 10065,
        });
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ problems: s.problems, concerns: s.concerns, actions: s.actions, seq: s.seq }),
    }
  )
);
