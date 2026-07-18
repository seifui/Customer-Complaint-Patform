// Concern Queue table column registry — visibility defaults + localStorage helpers.

export const QUEUE_COLUMNS_STORAGE_KEY = 'ch-queue-visible-columns';

/** @typedef {{ key: string, label: string, locked?: boolean, defaultVisible: boolean, minPx: number }} QueueColumnDef */

/** @type {QueueColumnDef[]} */
export const QUEUE_COLUMNS = [
  { key: 'id', label: 'Tracking ID', locked: true, defaultVisible: true, minPx: 110 },
  { key: 'signal', label: 'Signal', defaultVisible: true, minPx: 120 },
  { key: 'channel', label: 'Channel', defaultVisible: true, minPx: 110 },
  { key: 'status', label: 'Status', defaultVisible: true, minPx: 100 },
  { key: 'customer', label: 'Customer', defaultVisible: true, minPx: 140 },
  { key: 'journey', label: 'Journey', defaultVisible: true, minPx: 130 },
  { key: 'summary', label: 'AI Summary & Reasoning', defaultVisible: true, minPx: 180 },
  { key: 'severity', label: 'Severity', defaultVisible: true, minPx: 90 },
  { key: 'sentiment', label: 'Sentiment', defaultVisible: true, minPx: 100 },
  { key: 'assignee', label: 'Assignee/Owner', defaultVisible: true, minPx: 140 },
  { key: 'age', label: 'Age', defaultVisible: true, minPx: 80 },
  { key: 'repeatCount', label: 'Repeat Count', defaultVisible: true, minPx: 90 },
  { key: 'financialImpact', label: 'Financial Impact', defaultVisible: true, minPx: 120 },
  { key: 'created', label: 'Created', defaultVisible: true, minPx: 100 },
  { key: 'department', label: 'Department', defaultVisible: false, minPx: 120 },
  { key: 'region', label: 'Region/Branch', defaultVisible: false, minPx: 120 },
  { key: 'language', label: 'Language', defaultVisible: false, minPx: 90 },
  { key: 'relatedConcernsCount', label: 'Related Concerns Count', defaultVisible: false, minPx: 110 },
  { key: 'lastUpdated', label: 'Last Updated', defaultVisible: false, minPx: 110 },
  { key: 'externalTicketStatus', label: 'External Ticket status', defaultVisible: false, minPx: 130 },
  { key: 'tags', label: 'Tags', defaultVisible: false, minPx: 120 },
];

export const QUEUE_COLUMN_KEYS = QUEUE_COLUMNS.map((c) => c.key);

export function defaultVisibleColumns() {
  return Object.fromEntries(QUEUE_COLUMNS.map((c) => [c.key, c.defaultVisible]));
}

export function loadVisibleColumns() {
  const defaults = defaultVisibleColumns();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(QUEUE_COLUMNS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    const next = { ...defaults };
    for (const col of QUEUE_COLUMNS) {
      if (col.locked) {
        next[col.key] = true;
        continue;
      }
      if (typeof parsed[col.key] === 'boolean') next[col.key] = parsed[col.key];
    }
    return next;
  } catch {
    return defaults;
  }
}

export function saveVisibleColumns(visible) {
  if (typeof window === 'undefined') return;
  try {
    const locked = Object.fromEntries(QUEUE_COLUMNS.filter((c) => c.locked).map((c) => [c.key, true]));
    localStorage.setItem(QUEUE_COLUMNS_STORAGE_KEY, JSON.stringify({ ...visible, ...locked }));
  } catch {
    // ignore quota / private mode
  }
}

export function visibleColumnDefs(visible) {
  return QUEUE_COLUMNS.filter((c) => visible[c.key]);
}

export function tableMinWidth(visible) {
  return visibleColumnDefs(visible).reduce((sum, c) => sum + c.minPx, 0);
}
