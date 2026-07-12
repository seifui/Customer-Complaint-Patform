// Sidebar nav configuration — a flat list, matching Intercom's own
// top-level nav (Inbox, Fin AI Agent, Knowledge, Reports...) rather than
// grouping items under section headers.

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', roles: ['manager', 'ceo'], iconType: 'rects' },
  { label: 'Capture New Concern', href: '/capture', roles: ['agent', 'branch', 'manager'], iconType: 'path' },
  { label: 'Concern Queue', href: '/queue', roles: ['manager', 'ceo', 'dev'], iconType: 'queue', badge: 'queue' },
  { label: 'My Submissions', href: '/mine', roles: ['agent', 'branch'], iconType: 'inbox' },
  { label: 'Problem Workspace', href: '/problems', roles: ['manager', 'ceo', 'dev'], iconType: 'target', badge: 'problems' },
  { label: 'Action Management', href: '/actions', roles: ['manager', 'ceo'], iconType: 'check' },
  { label: 'My Tasks', href: '/mytasks', roles: ['dev'], iconType: 'check', badge: 'mytasks' },
];
