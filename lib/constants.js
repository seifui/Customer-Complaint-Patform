// Plain constants with no server-only imports, so this file is safe to use
// from Edge middleware as well as server components/actions.

export const SESSION_COOKIE = 'cci_role';
export const DEMO_PASSWORD = 'demo123';

/** Both demo roles share core platform access (queue, capture, dashboards). */
export const PLATFORM_ROLES = ['admin', 'superadmin'];

export function canManageConcerns(role) {
  return PLATFORM_ROLES.includes(role);
}

/** Super Admin only — department assignment and concern closure. */
export function canAssignCloseConcerns(role) {
  return role === 'superadmin';
}

/** Admin (and Super Admin) — work progress / status updates on open concerns. */
export function canUpdateConcernProgress(role) {
  return PLATFORM_ROLES.includes(role);
}

// One demo account per role. This is a mock auth layer for a
// supervisor-review prototype, not a production credential store.
// Admin = Team Leader / Branch Staff / Call Centre Agent
// Super Admin = Operations Manager / CEO / MD
export const DEMO_ACCOUNTS = {
  admin: 'admin@ci.demo',
  superadmin: 'superadmin@ci.demo',
};

export function findRoleByEmail(email) {
  const clean = (email || '').trim().toLowerCase();
  const entry = Object.entries(DEMO_ACCOUNTS).find(([, acctEmail]) => acctEmail.toLowerCase() === clean);
  return entry ? entry[0] : null;
}
