'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ShieldAlert, TrendingDown, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money, num } from '@/lib/helpers';
import { SevBadge, StatusBadge } from './Badges';
import FlowStrip from './FlowStrip';
import ExplainModal from './ExplainModal';
import OverflowMenu from './OverflowMenu';
import SlidePanel from './SlidePanel';
import Callout from './Callout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

function execResultText(p) {
  if (!p.impact.after) return 'No intervention started yet — awaiting owner and deadline.';
  const repPct = Math.round((1 - p.impact.after.repeat / p.impact.before.repeat) * 100);
  return 'Repeat contacts down ' + repPct + '% since intervention began (' + p.startedAt + ').';
}

const KPIS = [
  { key: 'risk', label: 'Value at Risk', icon: ShieldAlert, tone: 'bg-red-500/10 text-red-600 dark:text-red-400', sub: 'Across open problems' },
  { key: 'disengagement', label: 'Disengagement Signals', icon: TrendingDown, tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', sub: 'Customers pulling back' },
  { key: 'growing', label: 'Rapidly Growing', icon: TrendingUp, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', sub: 'Problems trending ↑50%+' },
  { key: 'protected', label: 'Value Protected', icon: ShieldCheck, tone: 'bg-primary/10 text-primary', sub: 'This month', up: true },
  { key: 'improving', label: 'Improving', icon: CheckCircle2, tone: 'bg-green-500/10 text-green-600 dark:text-green-400', sub: 'After intervention', up: true },
];

export default function DashboardClient() {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const [explain, setExplain] = useState(null); // { problemId, kind }
  const [attnOpen, setAttnOpen] = useState(false);
  const [detailsId, setDetailsId] = useState(null);

  const execProblems = problems.filter((p) => p.executiveDecision);
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  execProblems.forEach((p) => bySeverity[p.severity]++);
  const valueAtRiskTotal = problems.filter((p) => p.status !== 'resolved').reduce((s, p) => s + p.valueAtRisk, 0);
  const disengagementTotal = problems.reduce((s, p) => s + p.disengagement, 0);
  const rapidlyGrowing = problems.filter((p) => p.trendPct >= 50).length;
  const valueProtected = problems.reduce((s, p) => s + (p.impact.after ? p.impact.after.valueProtected || 0 : 0), 0);
  const improving = problems.filter((p) => p.impact.after).length;
  const allSorted = [...problems].sort((a, b) => (b.severity === 'critical') - (a.severity === 'critical') || b.concernCount - a.concernCount);
  const detailsProblem = detailsId ? problems.find((p) => p.id === detailsId) : null;

  const kpiValues = {
    risk: money(valueAtRiskTotal),
    disengagement: num(disengagementTotal),
    growing: rapidlyGrowing,
    protected: money(valueProtected),
    improving,
  };

  return (
    <>
      <div className="mb-6">
        <Card
          className="cursor-pointer flex-row items-center gap-4 px-5.5 transition-all hover:shadow-sm"
          onClick={() => setAttnOpen((v) => !v)}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[19px] font-bold tracking-tight">{execProblems.length} Problems Need Your Attention</div>
            <div className="mt-1 text-[11.5px] text-muted-foreground">Each is awaiting an executive decision — click to see the list</div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {bySeverity.critical > 0 && <Badge variant="outline" className="border-transparent bg-red-500/10 text-red-600 dark:text-red-400">{bySeverity.critical} Critical</Badge>}
            {bySeverity.high > 0 && <Badge variant="outline" className="border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400">{bySeverity.high} High</Badge>}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold">
            {attnOpen ? 'Hide' : 'View'}
            <ChevronDown className={cn('size-3.5 transition-transform', attnOpen && 'rotate-180')} />
          </div>
        </Card>

        {attnOpen && (
          <div className="mt-3 space-y-2.5">
            {execProblems.map((p) => (
              <Card key={p.id} className="px-4.5">
                <div className="mb-3.5 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="mb-0.5 text-[13.5px] font-bold tracking-tight">{p.title}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{p.id}</div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <SevBadge s={p.severity} />
                    <StatusBadge s={p.status} />
                  </div>
                </div>
                <div className="mb-3.5 grid grid-cols-4 gap-2">
                  <div>
                    <div className="mb-1 text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">Affected</div>
                    <div className="text-[13px] font-semibold tracking-tight">{num(p.affectedCustomers)}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">Value at Risk</div>
                    <div className="text-[13px] font-semibold tracking-tight">{money(p.valueAtRisk)}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">Trend</div>
                    <div className={cn('text-[13px] font-semibold tracking-tight', p.trendPct >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                      {p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}%
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase">Owner</div>
                    <div className="text-xs font-semibold">{p.owner === '—' ? 'Unassigned' : p.owner.split('—')[0]}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t pt-3.5">
                  <span className="text-[10.5px] text-muted-foreground">Last updated {p.startedAt !== '—' ? p.startedAt : 'not yet started'}</span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" onClick={() => router.push('/problems/' + p.id)}>Open Workspace</Button>
                    <OverflowMenu
                      items={[
                        { label: 'View Details', onClick: () => setDetailsId(p.id) },
                        { label: 'Explain Value at Risk', onClick: () => setExplain({ problemId: p.id, kind: 'risk' }) },
                      ]}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">Executive Metrics</div>
        <div className="grid grid-cols-5 gap-3">
          {KPIS.map((k) => (
            <Card key={k.key} className="px-5">
              <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] tracking-wide text-muted-foreground uppercase">
                <span className={cn('flex size-6.5 items-center justify-center rounded-full', k.tone)}>
                  <k.icon className="size-3.5" />
                </span>
                {k.label}
              </div>
              <div className="text-[20px] font-bold tracking-tight">{kpiValues[k.key]}</div>
              <div className={cn('mt-1.5 text-[11px] text-muted-foreground', k.up && 'text-green-600 dark:text-green-400')}>{k.sub}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">
          All Emerging Problems <span className="ml-1 text-[11px] font-normal">click a row to open the Problem Workspace</span>
        </div>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Affected</TableHead>
                <TableHead>Value at Risk</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSorted.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push('/problems/' + p.id)}>
                  <TableCell className="whitespace-normal">
                    <div className="font-semibold">{p.title}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{p.id}</div>
                  </TableCell>
                  <TableCell><SevBadge s={p.severity} /></TableCell>
                  <TableCell><StatusBadge s={p.status} /></TableCell>
                  <TableCell className={p.trendPct >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}%
                  </TableCell>
                  <TableCell className="font-mono">{num(p.affectedCustomers)}</TableCell>
                  <TableCell className="font-mono">{money(p.valueAtRisk)}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{p.owner === '—' ? 'Unassigned' : p.owner.split('—')[0]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="mb-6">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent px-5.5">
          <div className="mb-1 font-heading text-sm font-semibold">The Continuous Learning Loop</div>
          <FlowStrip steps={['More Data', 'Smarter AI', 'Better Actions', 'Better Outcomes']} />
          <div className="text-[11.5px] text-muted-foreground">
            We do not help the bank close more complaints. We help it identify and fix the customer problems that keep happening again and again.
          </div>
        </Card>
      </div>

      <SlidePanel open={!!detailsProblem} onClose={() => setDetailsId(null)} title={detailsProblem ? detailsProblem.id + ' — Details' : ''}>
        {detailsProblem && (
          <>
            <div className="mb-5">
              <div className="mb-2 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">What&apos;s Happening</div>
              <div className="text-[12.5px] leading-relaxed text-foreground/80">{detailsProblem.description}</div>
            </div>
            <div className="mb-5">
              <div className="mb-2 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Why It Matters</div>
              <div className="text-[12.5px] leading-relaxed text-foreground/80">{detailsProblem.whyItMatters}</div>
            </div>
            <div className="mb-5">
              <div className="mb-2 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Current Intervention Status</div>
              <div className="text-[12.5px] leading-relaxed text-foreground/80">{execResultText(detailsProblem)}</div>
            </div>
            {detailsProblem.executiveDecision && (
              <div className="mb-5">
                <div className="mb-2 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">Decision Needed</div>
                <Callout kind="orange" className="mb-0">{detailsProblem.executiveDecision}</Callout>
              </div>
            )}
            <Button className="mt-1 w-full" onClick={() => router.push('/problems/' + detailsProblem.id)}>
              Open Full Workspace →
            </Button>
          </>
        )}
      </SlidePanel>

      <ExplainModal problemId={explain?.problemId} kind={explain?.kind} onClose={() => setExplain(null)} />
    </>
  );
}
