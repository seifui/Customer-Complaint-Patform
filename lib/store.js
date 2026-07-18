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
import { PROBLEMS_SEED, CONCERNS_SEED, ACTIONS_SEED, RAISED_CONCERNS_SEED } from './data';
import { nowStamp, getTimeline, workflowStatusLabel, workflowStatusOf } from './helpers';

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

// Queue-column demo fields that may be missing from older persisted concerns.
const QUEUE_SEED_FIELDS = [
  'assignee',
  'assignedDepartment',
  'region',
  'repeatCount',
  'financialImpact',
  'relatedConcernsCount',
  'updatedAt',
  'externalTicketStatus',
  'tags',
  'lang',
];

function backfillQueueFields(concern, seed) {
  if (!seed) return concern;
  // One-time enrichment for older persisted rows that predate queue columns.
  if (concern.repeatCount !== undefined && concern.financialImpact !== undefined) return concern;
  const next = { ...concern };
  for (const key of QUEUE_SEED_FIELDS) {
    if (seed[key] !== undefined) next[key] = seed[key];
  }
  return next;
}

let toastTimer;

export const STORE_KEY = 'cci-platform-store';

export const useStore = create(
  persist(
    (set, get) => ({
      problems: clone(PROBLEMS_SEED),
      concerns: clone([...RAISED_CONCERNS_SEED, ...CONCERNS_SEED]),
      actions: clone(ACTIONS_SEED),
      seq: 10076,
      publicSeq: 127,

      // Concern Queue list UI — kept in memory (not persisted) so navigating to
      // /queue/[trackingId] and back restores filters, tabs, and pagination.
      queueView: {
        filters: {
          status: 'all',
          channels: [],
          severities: [],
          sentiments: [],
          journeys: [],
          customerTypes: [],
          signalTypes: [],
          tags: [],
          assignee: '',
          dateFrom: '',
          dateTo: '',
          q: '',
        },
        page: 1,
        pageSize: 10,
      },
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

      setQueueViewFilters(patch) {
        set((s) => ({
          queueView: {
            ...s.queueView,
            filters: { ...s.queueView.filters, ...patch },
            page: 1,
          },
        }));
      },
      setQueueViewPage(page) {
        set((s) => ({ queueView: { ...s.queueView, page } }));
      },
      setQueueViewPageSize(pageSize) {
        set((s) => ({ queueView: { ...s.queueView, pageSize, page: 1 } }));
      },
      resetQueueViewFilters() {
        set((s) => ({
          queueView: {
            ...s.queueView,
            filters: {
              status: 'all',
              channels: [],
              severities: [],
              sentiments: [],
              journeys: [],
              customerTypes: [],
              signalTypes: [],
              tags: [],
              assignee: '',
              dateFrom: '',
              dateTo: '',
              q: '',
            },
            page: 1,
          },
        }));
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
      // CH-00128. Kept as its own counter so it doesn't disturb the
      // internal id sequence or the CCI- ids already seeded/used elsewhere.
      nextPublicTrackingId() {
        const n = get().publicSeq + 1;
        set({ publicSeq: n });
        return 'CH-' + String(n).padStart(5, '0');
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
          concerns: s.concerns.map((c) => {
            if (c.id !== id) return c;
            const from = workflowStatusOf(c);
            return {
              ...c,
              workflowStatus: status,
              activityTimeline: [...getTimeline(c), {
                type: 'status-change',
                label: 'Status changed',
                detail: workflowStatusLabel(from) + ' → ' + workflowStatusLabel(status),
                by: by.name,
                byRole: by.role,
                at: nowStamp(),
              }],
            };
          }),
        }));
      },

      addConcernComment(id, text, by, kind = 'comment') {
        const labels = {
          comment: 'Comment Added',
          progress: 'Progress updated',
          'internal-note': 'Internal note added',
          'customer-update': 'Customer update sent',
        };
        set((s) => ({
          concerns: s.concerns.map((c) => (c.id !== id ? c : {
            ...c,
            activityTimeline: [...getTimeline(c), {
              type: kind,
              label: labels[kind] || labels.comment,
              detail: text,
              by: by.name,
              byRole: by.role,
              at: nowStamp(),
            }],
          })),
        }));
      },

      // Admin work-progress save: optional status change + typed notes in one step.
      saveConcernProgress(id, { status, progressUpdate, internalNote, customerUpdate }, by) {
        set((s) => ({
          concerns: s.concerns.map((c) => {
            if (c.id !== id) return c;
            const events = [];
            const stamp = nowStamp();
            let next = { ...c };
            const from = workflowStatusOf(c);

            if (status && status !== from) {
              next.workflowStatus = status;
              events.push({
                type: 'status-change',
                label: 'Status changed',
                detail: workflowStatusLabel(from) + ' → ' + workflowStatusLabel(status),
                by: by.name,
                byRole: by.role,
                at: stamp,
              });
            }
            if (progressUpdate) {
              events.push({
                type: 'progress',
                label: 'Progress updated',
                detail: progressUpdate,
                by: by.name,
                byRole: by.role,
                at: stamp,
              });
            }
            if (internalNote) {
              events.push({
                type: 'internal-note',
                label: 'Internal note added',
                detail: internalNote,
                by: by.name,
                byRole: by.role,
                at: stamp,
              });
            }
            if (customerUpdate) {
              events.push({
                type: 'customer-update',
                label: 'Customer update sent',
                detail: customerUpdate,
                by: by.name,
                byRole: by.role,
                at: stamp,
              });
            }
            if (!events.length) return c;
            return {
              ...next,
              activityTimeline: [...getTimeline(c), ...events],
            };
          }),
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
          concerns: clone([...RAISED_CONCERNS_SEED, ...CONCERNS_SEED]),
          actions: clone(ACTIONS_SEED),
          seq: 10076,
          publicSeq: 127,
        });
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ problems: s.problems, concerns: s.concerns, actions: s.actions, seq: s.seq, publicSeq: s.publicSeq }),
      merge: (persisted, current) => {
        const merged = { ...current, ...persisted };
        if (!persisted?.concerns) return merged;
        // Always re-seed demo raised concerns, and drop any persisted copies of
        // those same IDs (older localStorage may lack demoRaisedConcerns and
        // would otherwise produce duplicate Tracking IDs in the queue).
        // Also drop legacy long public IDs (CH-YYYY-NNNNNN) that overflow the
        // Tracking ID column — superseded by the shorter CH-NNNNN format.
        const raisedIds = new Set(RAISED_CONCERNS_SEED.map((c) => c.id));
        const seedById = new Map(CONCERNS_SEED.map((c) => [c.id, c]));
        const withoutDemo = persisted.concerns
          .filter(
            (c) =>
              !c.demoRaisedConcerns &&
              !raisedIds.has(c.id) &&
              !/^CH-\d{4}-\d{6}$/.test(c.id)
          )
          .map((c) => backfillQueueFields(c, seedById.get(c.id)));
        return { ...merged, concerns: [...RAISED_CONCERNS_SEED, ...withoutDemo] };
      },
    }
  )
);
