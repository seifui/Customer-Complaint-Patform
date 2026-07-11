'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROLES, ROUTE_MAP } from './data';
import { SESSION_COOKIE, DEMO_PASSWORD, findRoleByEmail } from './constants';

export async function loginAction(prevState, formData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  const role = findRoleByEmail(email);
  if (!role) {
    return { error: 'No account found for that email. Please check the email address and try again.' };
  }
  if (password !== DEMO_PASSWORD) {
    return { error: 'Incorrect password. Please try again.' };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect(ROUTE_MAP[ROLES[role].home]);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}
