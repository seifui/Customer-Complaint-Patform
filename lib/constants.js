// Plain constants with no server-only imports, so this file is safe to use
// from Edge middleware as well as server components/actions.

export const SESSION_COOKIE = 'cci_role';
export const DEMO_PASSWORD = 'demo123';

// One demo account per role. This is a mock auth layer for a
// supervisor-review prototype, not a production credential store.
export const DEMO_ACCOUNTS = {
  agent: 'neadeeshaj@cci.demo',
  branch: 'kasuns@cci.demo',
  manager: 'priyanthaf@cci.demo',
  dev: 'isharaj@cci.demo',
  ceo: 'ruwanw@cci.demo',
};

export function findRoleByEmail(email) {
  const clean = (email || '').trim().toLowerCase();
  const entry = Object.entries(DEMO_ACCOUNTS).find(([, acctEmail]) => acctEmail.toLowerCase() === clean);
  return entry ? entry[0] : null;
}
