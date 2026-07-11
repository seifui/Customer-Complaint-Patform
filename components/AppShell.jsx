'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/nav';
import { routeMetaFor } from '@/lib/routeMeta';
import { useStore } from '@/lib/store';
import { logoutAction } from '@/lib/actions';
import NavIcon from './NavIcon';
import Toast from './Toast';

const NOTIFICATIONS = [
  { msg: <>Problem <b>PRB-2044</b> crossed 1,200 linked concerns — priority escalated to Critical</>, meta: '6m ago' },
  { msg: <>RFI response received for <b>CCI-10041</b></>, meta: '22m ago' },
  { msg: <>Intervention for <b>PRB-2044</b> assigned to Head of Digital Banking</>, meta: '1h ago' },
];

export default function AppShell({ session, children }) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const actions = useStore((s) => s.actions);

  const queueCount = concerns.length;
  const problemCount = problems.filter((p) => p.status !== 'resolved').length;
  const myTasksCount = actions.filter((a) => a.owner === session.name && a.status !== 'done').length;

  const badgeValues = { queue: queueCount, problems: problemCount, mytasks: myTasksCount };
  const [title, sub] = routeMetaFor(pathname);

  return (
    <div className="shell" onClick={() => { setNotifOpen(false); setUserOpen(false); }}>
      {/* SIDEBAR */}
      <div className="sb">
        <div className="sb-logo">
          <div className="sb-mark">CCI</div>
          <div className="sb-brand">
            <div className="sb-brand-t">Concern Intelligence</div>
            <div className="sb-brand-s">Platform · Sri Lanka</div>
          </div>
        </div>
        <div className="sb-nav">
          {NAV_ITEMS.filter((it) => it.roles.includes(session.role)).map((it) => {
            const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href + '/'));
            return (
              <Link key={it.href} href={it.href} className={'sb-i' + (active ? ' on' : '')}>
                <NavIcon type={it.iconType} />
                <span>{it.label}</span>
                {it.badge && <span className="sb-badge">{badgeValues[it.badge]}</span>}
              </Link>
            );
          })}
        </div>

        <div className="sb-user" style={{ position: 'relative' }} onClick={(e) => { e.stopPropagation(); setUserOpen((v) => !v); }}>
          <div className="sb-av">{session.init}</div>
          <div>
            <div className="sb-un">{session.name}</div>
            <div className="sb-ur">{session.title} · {session.team}</div>
          </div>
          <div className={'user-menu-drop' + (userOpen ? ' open' : '')} style={{ bottom: '100%', left: 12, right: 12, width: 'auto' }}>
            <form action={logoutAction}>
              <button type="submit" className="user-menu-item danger" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 1H2a1 1 0 00-1 1v10a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" /></svg>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div>
            <div className="tb-title">{title}</div>
            <div className="tb-sub">{sub}</div>
          </div>
          <div className="tb-right">
            <div className="tb-ico has-dot" onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); setUserOpen(false); }}>
              <NavIcon type="bell" />
            </div>
          </div>
        </div>

        <div className={'notif-drop' + (notifOpen ? ' open' : '')}>
          <div className="notif-hd">Notifications</div>
          {NOTIFICATIONS.map((n, i) => (
            <div className="notif-item" key={i}>
              <div className="notif-dot" />
              <div>
                <div className="notif-msg">{n.msg}</div>
                <div className="notif-meta">{n.meta}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="content">{children}</div>
      </div>

      <Toast />
    </div>
  );
}
