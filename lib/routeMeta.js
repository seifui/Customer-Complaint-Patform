export const ROUTE_META = {
  '/dashboard': ['Dashboard', 'What requires your attention today, and why'],
  '/queue': ['Concern Queue', 'An intelligence triage workspace — which signals need attention, and why'],
  '/mine': ['My Submitted Concerns', 'Concerns you have submitted to the platform'],
  '/concern-lookup': ['Concern Queue', "Look up any customer's concern — status, department, and history"],
  '/problems': ['Problem Workspace', 'AI-identified problems connecting concerns across channels and time'],
  '/actions': ['Action Management', "Every action tied to the problem it solves and whether it's working"],
  '/mytasks': ['My Tasks', 'Interventions assigned to you'],
  '/department-queue': ['Department Queue', 'Concerns routed to your department'],
};

export function routeMetaFor(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  if (pathname.startsWith('/problems/')) return ['Problem Detail', 'Investigation and decision workspace'];
  return ['', ''];
}
