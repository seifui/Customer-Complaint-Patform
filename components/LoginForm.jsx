'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/lib/actions';
import ThemeToggle from './ThemeToggle';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="login-wrap">
      <ThemeToggle className="login-theme-toggle" />
      <div className="login-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-full.png" alt="ConcernHub — Every Concern. One Place. Resolved." className="login-logo" />
        <div className="login-title">Sign in</div>
        <div className="login-sub">Sign in to your ConcernHub workspace</div>

        {state?.error && <div className="login-err">{state.error}</div>}

        <form action={formAction}>
          <div className="form-row">
            <label className="form-lbl">Email</label>
            <input className="form-inp" type="email" name="email" required placeholder="you@yourbank.com" />
          </div>
          <div className="form-row">
            <label className="form-lbl">Password</label>
            <input className="form-inp" type="password" name="password" required placeholder="Password" />
          </div>
          <button className={'btn btn-p btn-hero' + (pending ? ' btn-loading' : '')} type="submit" disabled={pending} style={{ width: '100%', marginTop: 6 }}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">
          <Link href="/complaint" className="tx-link">Are you a customer? Report a concern instead →</Link>
        </div>
      </div>
    </div>
  );
}
