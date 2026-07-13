// Sidebar nav configuration — a flat list, matching Intercom's own
// top-level nav (Inbox, Fin AI Agent, Knowledge, Reports...) rather than
// grouping items under section headers.

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', roles: ['manager', 'ceo'], iconType: 'rects' },
  { label: 'Concern Queue', href: '/queue', roles: ['manager', 'ceo', 'dev'], iconType: 'queue', badge: 'queue' },
  // Read-only lookup so front-line staff can answer "what happened to my
  // complaint?" calls without being able to touch routing/status/ownership.
  { label: 'Concern Queue', href: '/concern-lookup', roles: ['agent', 'branch'], iconType: 'queue' },
  // Raising a new concern happens via the "+ Raise Concern" button in this
  // page's own header (see AppShell.jsx), not a separate nav item/page.
  { label: 'My Submitted Concerns', href: '/mine', roles: ['agent', 'branch', 'manager'], iconType: 'inbox' },
  { label: 'Problem Workspace', href: '/problems', roles: ['manager', 'ceo', 'dev'], iconType: 'target', badge: 'problems' },
  { label: 'Action Management', href: '/actions', roles: ['manager', 'ceo'], iconType: 'check' },
  { label: 'My Tasks', href: '/mytasks', roles: ['dev'], iconType: 'check', badge: 'mytasks' },
  { label: 'Department Queue', href: '/department-queue', roles: ['dept_manager'], iconType: 'inbox' },
];
