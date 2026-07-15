'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronsUpDown, Inbox, LayoutGrid, Layers, ListChecks, LogOut, Target } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { routeMetaFor } from '@/lib/routeMeta';
import { useStore } from '@/lib/store';
import { logoutAction } from '@/lib/actions';
import Toast from './Toast';
import ThemeToggle from './ThemeToggle';
import CaptureConcernDrawer from './CaptureConcernDrawer';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ICONS = { rects: LayoutGrid, queue: Layers, inbox: Inbox, target: Target, check: ListChecks };

const NOTIFICATIONS = [
  { msg: <>Problem <b>PRB-2044</b> crossed 1,200 linked concerns — priority escalated to Critical</>, meta: '6m ago' },
  { msg: <>RFI response received for <b>CCI-10041</b></>, meta: '22m ago' },
  { msg: <>Intervention for <b>PRB-2044</b> assigned to Head of Digital Banking</>, meta: '1h ago' },
];

export default function AppShell({ session, children }) {
  const pathname = usePathname();

  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const actions = useStore((s) => s.actions);
  const captureDrawerOpen = useStore((s) => s.captureDrawerOpen);
  const closeCaptureDrawer = useStore((s) => s.closeCaptureDrawer);

  const queueCount = concerns.length;
  const problemCount = problems.filter((p) => p.status !== 'resolved').length;
  const myTasksCount = actions.filter((a) => a.owner === session.name && a.status !== 'done').length;

  const badgeValues = { queue: queueCount, problems: problemCount, mytasks: myTasksCount };
  const [routeTitle, sub] = routeMetaFor(pathname);
  const isDashboard = pathname === '/dashboard';
  const title = isDashboard ? 'Welcome, ' + session.name.split(' ')[0] : routeTitle;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside className="flex w-62 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 shrink-0 items-center px-4">
          <Logo size={28} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {NAV_ITEMS.filter((it) => it.roles.includes(session.role)).map((it) => {
            const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href + '/'));
            const Icon = ICONS[it.iconType];
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                {Icon && <Icon className="size-4.5 shrink-0 opacity-70 group-hover:opacity-100" />}
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.badge && (
                  <Badge variant="secondary" className="shrink-0 rounded-full px-1.5 tabular-nums">
                    {badgeValues[it.badge]}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition-colors hover:bg-sidebar-accent/60">
              <Avatar size="sm">
                <AvatarFallback className="bg-foreground text-background">{session.init}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[12.5px] font-semibold">{session.name}</div>
                <div className="truncate text-[10.5px] text-muted-foreground">
                  {session.title}{session.team ? <> · <b className="font-medium text-foreground/70">{session.team}</b></> : null}
                </div>
              </div>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-(--anchor-width)">
              <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">{session.name}</div>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full" />}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div key={pathname}>
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <h1 className={isDashboard ? 'font-heading text-3xl font-medium tracking-tight' : 'text-xl font-semibold tracking-tight'}>{title}</h1>
                {sub && <p className="mt-1.5 text-[12.5px] text-muted-foreground">{sub}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" size="icon" className="relative rounded-full">
                        <Bell className="size-4" />
                        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="border-b px-3.5 py-2.5 text-[12.5px] font-semibold">Notifications</div>
                    {NOTIFICATIONS.map((n, i) => (
                      <div key={i} className="flex gap-2.5 border-b px-3.5 py-3 last:border-b-0">
                        <div className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                        <div>
                          <div className="text-[11.5px] leading-relaxed">{n.msg}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">{n.meta}</div>
                        </div>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>

      <Toast />

      {['agent', 'branch', 'manager'].includes(session.role) && (
        <CaptureConcernDrawer session={session} open={captureDrawerOpen} onClose={closeCaptureDrawer} />
      )}
    </div>
  );
}
