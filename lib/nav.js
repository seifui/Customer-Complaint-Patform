// Sidebar nav configuration, ported 1:1 from the HTML prototype's role-gated
// sidebar (data-roles + data-screen attributes).

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Executive Dashboard',
        href: '/dashboard',
        roles: ['manager', 'ceo'],
        icon: 'M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z',
        iconType: 'rects',
      },
    ],
  },
  {
    label: 'Concerns',
    items: [
      { label: 'Capture New Concern', href: '/capture', roles: ['agent', 'branch', 'manager'], icon: 'M7 1v12M1 7h12', iconType: 'path' },
      { label: 'Concern Queue', href: '/queue', roles: ['manager', 'ceo', 'dev'], iconType: 'queue', badge: 'queue' },
      { label: 'My Submissions', href: '/mine', roles: ['agent', 'branch'], iconType: 'inbox' },
    ],
  },
  {
    label: 'Problems',
    items: [{ label: 'Problem Workspace', href: '/problems', roles: ['manager', 'ceo', 'dev'], iconType: 'target', badge: 'problems' }],
  },
  {
    label: 'Actions',
    items: [
      { label: 'Action Management', href: '/actions', roles: ['manager', 'ceo'], iconType: 'check' },
      { label: 'My Tasks', href: '/mytasks', roles: ['dev'], iconType: 'check', badge: 'mytasks' },
    ],
  },
];
