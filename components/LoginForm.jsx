'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/lib/actions';
import { useStore } from '@/lib/store';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const resetDemoData = useStore((s) => s.resetDemoData);

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-mark">CCI</div>
        <div className="login-title">Sign in</div>
        <div className="login-sub">Customer Concern Intelligence Platform · Sri Lanka</div>

        {state?.error && <div className="login-err">{state.error}</div>}

        <form action={formAction}>
          <div className="form-row">
            <label className="form-lbl">Email</label>
            <input className="form-inp" type="email" name="email" required placeholder="you@cci.demo" />
          </div>
          <div className="form-row">
            <label className="form-lbl">Password</label>
            <input className="form-inp" type="password" name="password" required placeholder="Password" />
          </div>
          <button className={'btn btn-p' + (pending ? ' btn-loading' : '')} type="submit" disabled={pending} style={{ width: '100%', height: 40, justifyContent: 'center', marginTop: 6 }}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">
          <Link href="/complaint" className="tx-link">Are you a customer? Report a concern instead →</Link>
          <br />
          <span
            className="tx-link"
            onClick={() => {
              resetDemoData();
              window.location.reload();
            }}
          >
            Reset demo data
          </span>
        </div>
      </div>
    </div>
  );
}
