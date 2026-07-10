import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROLES, ROUTE_MAP } from './data';
import { SESSION_COOKIE } from './constants';

// Server-side session read — used by server components/layouts.
export async function getSession() {
  const store = await cookies();
  const role = store.get(SESSION_COOKIE)?.value;
  if (!role || !ROLES[role]) return null;
  return { role, ...ROLES[role] };
}

// Call at the top of any protected page/route-group layout. Redirects to
// /login if there's no session, and to the caller's own home screen if their
// role isn't in `allowedRoles` — this is what actually enforces role access,
// not just hiding the sidebar link. Returns the session so callers can
// destructure `role`/`name` etc. in one line.
export async function requireRole(allowedRoles) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!allowedRoles.includes(session.role)) redirect(ROUTE_MAP[ROLES[session.role].home]);
  return session;
}
