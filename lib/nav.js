// Sidebar nav configuration — a flat list, matching Intercom's own
// top-level nav (Inbox, Fin AI Agent, Knowledge, Reports...) rather than
// grouping items under section headers.

// Both demo roles (admin / superadmin) share the same core platform nav.
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', roles: ['admin', 'superadmin'], iconType: 'rects' },
  { label: 'All Concerns', href: '/queue', roles: ['admin', 'superadmin'], iconType: 'queue', badge: 'queue' },
];

// Profile dropdown items — personal/secondary links kept out of the main sidebar.
export const PROFILE_NAV_ITEMS = [
  { label: 'Raised Concerns', href: '/mine', roles: ['admin', 'superadmin'], iconType: 'inbox' },
];
