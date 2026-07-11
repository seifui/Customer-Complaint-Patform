export const ROUTE_META = {
  '/dashboard': ['Dashboard', 'What requires your attention today, and why'],
  '/capture': ['Capture New Concern', 'Tell us what happened — AI handles the structure'],
  '/queue': ['Concern Queue', 'An intelligence triage workspace — which signals need attention, and why'],
  '/mine': ['My Submitted Concerns', 'Concerns you have personally logged into the platform'],
  '/problems': ['Problem Workspace', 'AI-identified problems connecting concerns across channels and time'],
  '/actions': ['Action Management', "Every action tied to the problem it solves and whether it's working"],
  '/mytasks': ['My Tasks', 'Interventions assigned to you'],
};

export function routeMetaFor(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  if (pathname.startsWith('/problems/')) return ['Problem Detail', 'Investigation and decision workspace'];
  return ['', ''];
}
