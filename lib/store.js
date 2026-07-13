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
import { nowStamp, getTimeline, workflowStatusLabel } from './helpers';

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
      publicSeq: 127,

      queueFilters: { channel: '', severity: '', triage: '', q: '' },
      actionFilters: { team: '', owner: '', problem: '' },

      // Global "Raise Concern" drawer — opened from the sidebar or from any
      // page, so it lives here rather than in a single page's local state.
      captureDrawerOpen: false,
      openCaptureDrawer() {
        set({ captureDrawerOpen: true });
      },
      closeCaptureDrawer() {
        set({ captureDrawerOpen: false });
      },

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

      // Customer-facing tracking number (public complaint form only) — a
      // distinct branded format from the internal CCI- scheme above, e.g.
      // CH-2026-000128. Kept as its own counter so it doesn't disturb the
      // internal id sequence or the CCI- ids already seeded/used elsewhere.
      nextPublicTrackingId() {
        const n = get().publicSeq + 1;
        set({ publicSeq: n });
        return 'CH-' + new Date().getFullYear() + '-' + String(n).padStart(6, '0');
      },

      addConcern(concern) {
        set((s) => ({ concerns: [concern, ...s.concerns] }));
      },

      // Department-routing workflow: Operations Manager routes a concern to a
      // department, that department's manager hands it to a team member, then
      // works it through status changes/comments. Every step appends to
      // activityTimeline rather than overwriting anything, so the full handoff
      // chain is always visible — see lib/helpers.js#getTimeline.
      assignConcernDepartment(id, department, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            assignedDepartment: department,
            assignedTo: null,
            workflowStatus: 'assigned-department',
            activityTimeline: [...getTimeline(c), { type: 'assigned-department', label: 'Assigned to ' + department, by: by.name, byRole: by.role, at: nowStamp() }],
          })),
        }));
      },

      assignConcernMember(id, member, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            assignedTo: member,
            workflowStatus: 'assigned-member',
            activityTimeline: [...getTimeline(c), { type: 'assigned-member', label: 'Assigned to ' + member, by: by.name, byRole: by.role, at: nowStamp() }],
          })),
        }));
      },

      setConcernExternalRef(id, ref, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            externalRef: ref,
            activityTimeline: [...getTimeline(c), { type: 'external-ref', label: 'Linked External Ticket', detail: ref, by: by.name, byRole: by.role, at: nowStamp() }],
          })),
        }));
      },

      updateConcernStatus(id, status, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            workflowStatus: status,
            activityTimeline: [...getTimeline(c), { type: 'status-change', label: 'Status changed to ' + workflowStatusLabel(status), by: by.name, byRole: by.role, at: nowStamp() }],
          })),
        }));
      },

      addConcernComment(id, text, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            activityTimeline: [...getTimeline(c), { type: 'comment', label: 'Comment Added', detail: text, by: by.name, byRole: by.role, at: nowStamp() }],
          })),
        }));
      },

      // The one step the department lifecycle can't reach on its own — an
      // Operations Manager formally closes the loop with a customer-facing
      // message, whether that's "fixed and deployed" or any other reason.
      // The message becomes what the customer sees when they track this
      // concern (see lib/helpers.js#friendlyStatus).
      closeConcern(id, { reason, message }, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            workflowStatus: 'closed',
            closureReason: reason,
            closureMessage: message,
            closedAt: nowStamp(),
            activityTimeline: [...getTimeline(c), { type: 'closed', label: 'Concern Closed', detail: message, by: by.name, byRole: by.role, at: nowStamp() }],
          })),
        }));
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
          publicSeq: 127,
        });
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ problems: s.problems, concerns: s.concerns, actions: s.actions, seq: s.seq, publicSeq: s.publicSeq }),
    }
  )
);
