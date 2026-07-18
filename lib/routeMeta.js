export const ROUTE_META = {
  '/dashboard': ['Dashboard', ''],
  '/my-dashboard': ['Dashboard', ''],
  '/queue': ['All Concerns', ''],
  '/mine': ['Raised Concerns', ''],
  '/concern-lookup': ['All Concerns', ''],
  '/problems': ['Problem Workspace', 'AI-identified problems connecting concerns across channels and time'],
  '/actions': ['Action Management', "Every action tied to the problem it solves and whether it's working"],
  '/mytasks': ['My Tasks', 'Interventions assigned to you'],
  '/department-queue': ['Department Queue', 'Concerns routed to your department'],
};

export function routeMetaFor(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  if (pathname.startsWith('/problems/')) return ['Problem Detail', 'Investigation and decision workspace'];
  if (pathname.startsWith('/queue/')) {
    const id = decodeURIComponent(pathname.slice('/queue/'.length).split('/')[0] || '');
    return [id || 'Concern Detail', ''];
  }
  return ['', ''];
}
