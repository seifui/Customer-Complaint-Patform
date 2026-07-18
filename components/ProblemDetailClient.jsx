'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { money, num, getValueDetail, teamColorVars } from '@/lib/helpers';
import { SevBadge, StatusBadge, ChBadge, ConfBadge } from './Badges';
import { BarList, Sparkline, TimeOfDayChart } from './Charts';
import Callout from './Callout';
import QueueTable from './QueueTable';
import TaskCard from './TaskCard';
import ConcernDetailPanel from './ConcernDetailPanel';
import ExplainModal, { ExplainTrigger } from './ExplainModal';
import TaskUpdateModal from './TaskUpdateModal';
import SlidePanel from './SlidePanel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = [
  ['situation', "What's Happening"],
  ['evidence', 'Evidence'],
  ['affected', "Who's Affected"],
  ['causes', 'Likely Causes'],
  ['intervention', 'Intervention Plan'],
  ['impact', 'Did It Work?'],
];

function Stat({ label, value, className }) {
  return (
    <div className="rounded-lg border bg-muted px-3.5 py-3">
      <div className="mb-1.5 text-[10.5px] text-muted-foreground">{label}</div>
      <div className={'text-[13px] font-bold tracking-tight ' + (className || '')}>{value}</div>
    </div>
  );
}

function Kpi({ label, value, className }) {
  return (
    <Card className="px-4.5">
      <div className="mb-2 text-[10.5px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className={'text-xl font-bold tracking-tight ' + (className || '')}>{value}</div>
    </Card>
  );
}

export default function ProblemDetailClient({ problemId, session }) {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const actions = useStore((s) => s.actions);
  const p = problems.find((x) => x.id === problemId);

  const [tab, setTab] = useState('situation');
  const [openConcernId, setOpenConcernId] = useState(null);
  const [explain, setExplain] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);

  if (!p) {
    return (
      <div className="px-5 py-10 text-center text-muted-foreground">
        <div className="text-xs">Problem not found.</div>
      </div>
    );
  }

  const problemActions = actions.filter((a) => a.problem === p.id);

  return (
    <>
      <div className="mb-3.5 flex items-center gap-2.5">
        <Button variant="outline" size="sm" onClick={() => router.push('/problems')}><ArrowLeft className="size-3.5" /> Back</Button>
        <SevBadge s={p.severity} />
        <StatusBadge s={p.status} />
      </div>

      <Card className="mb-4 px-5">
        <div className="mb-2 text-[17px] font-bold tracking-tight">{p.title}</div>
        <div className="mb-3 text-[12.5px] leading-relaxed text-muted-foreground">{p.description}</div>
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Linked Concerns" value={num(p.concernCount)} />
          <Stat label="Channels Involved" value={p.channels.length} />
          <Stat label="Trend" value={(p.trendPct >= 0 ? '↑' : '↓') + ' ' + Math.abs(p.trendPct) + '%'} className={p.trendPct >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} />
          <Stat label="Repeat-Contact Rate" value={p.repeatContactRate} />
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="mb-4 gap-0">
        <TabsList variant="line" className="h-auto w-full justify-start gap-5 overflow-x-auto border-b p-0">
          {TABS.map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="h-auto flex-none px-0 pb-2.5">{label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === 'situation' && <PaneSituation p={p} />}
      {tab === 'evidence' && <PaneEvidence p={p} onOpenConcern={setOpenConcernId} />}
      {tab === 'affected' && <PaneAffected p={p} onExplain={() => setExplain({ problemId: p.id, kind: 'risk' })} />}
      {tab === 'causes' && <PaneCauses p={p} />}
      {tab === 'intervention' && (
        <PaneIntervention
          p={p}
          problemActions={problemActions}
          onOpenTask={setOpenTaskId}
          onGoIntervention={() => setTab('intervention')}
        />
      )}
      {tab === 'impact' && <PaneImpact p={p} onExplain={() => setExplain({ problemId: p.id, kind: 'protected' })} onGoIntervention={() => setTab('intervention')} />}

      <ConcernDetailPanel concernId={openConcernId} onClose={() => setOpenConcernId(null)} session={session} />
      <ExplainModal problemId={explain?.problemId} kind={explain?.kind} onClose={() => setExplain(null)} />
      <TaskUpdateModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}

function PaneSituation({ p }) {
  return (
    <>
      {p.executiveDecision && (
        <Callout kind="orange"><b>Decision needed:</b> {p.executiveDecision}</Callout>
      )}
      <Card className="mb-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Why This Matters</div>
        <div className="text-[12.5px] leading-relaxed text-muted-foreground">{p.whyItMatters}</div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="px-4.5">
          <div className="mb-3 text-[12.5px] font-bold">What We Know For Certain</div>
          <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
            <li>{num(p.concernCount)} similar concerns across {p.channels.length} channels</li>
            <li>{p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}% over {p.trendWindow}</li>
            <li>Concentrated in: {p.peakWindow}</li>
            <li>Repeat-contact rate: {p.repeatContactRate}</li>
            <li>Operational cost: {p.opCost}</li>
          </ul>
        </Card>
        <Card className="px-4.5">
          <div className="mb-3 text-[12.5px] font-bold">Channels Involved</div>
          <div className="flex flex-wrap gap-1.5">{p.channels.map((c) => <ChBadge c={c} key={c} />)}</div>
          <hr className="my-3.5 border-border" />
          <div className="mb-3 text-[12.5px] font-bold">Teams Likely Involved</div>
          <div className="flex flex-wrap gap-1.5">{p.teams.map((t) => <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80" key={t}>{t}</span>)}</div>
        </Card>
      </div>
    </>
  );
}

function PaneEvidence({ p, onOpenConcern }) {
  const concerns = useStore((s) => s.concerns);
  const linked = concerns.filter((c) => c.linked === p.id);
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Card className="px-4.5">
          <div className="mb-3 text-[12.5px] font-bold">Volume Trend <span className="ml-1 text-[11px] font-normal text-muted-foreground">{p.trendWindow}</span></div>
          <Sparkline data={p.spark} color={p.trendPct >= 0 ? 'var(--red, #dc2626)' : 'var(--green, #16a34a)'} />
        </Card>
        <Card className="px-4.5">
          <div className="mb-3 text-[12.5px] font-bold">Concerns by Channel</div>
          <BarList items={p.evidenceChannels.map((c) => ({ label: c.label, value: c.count }))} />
        </Card>
      </div>
      <Card className="mt-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Time-of-Day Distribution <span className="ml-1 text-[11px] font-normal text-muted-foreground">spike indicates {p.peakWindow}</span></div>
        <TimeOfDayChart hourly={p.hourly} peakWindow={p.peakWindow} />
      </Card>
      <Card className="mt-3.5 gap-0 py-0">
        <div className="border-b px-4.5 py-3.5 text-[12.5px] font-bold">
          Sample Connected Concerns <span className="ml-1 text-[11px] font-normal text-muted-foreground">{linked.length} linked — direct evidence for this problem</span>
        </div>
        <QueueTable list={linked.slice(0, 8)} onOpen={onOpenConcern} />
      </Card>
    </>
  );
}

function PaneAffected({ p, onExplain }) {
  const vd = getValueDetail(p, 'risk');
  return (
    <>
      <div className="mb-3.5 grid grid-cols-4 gap-3">
        <Kpi label="Customers Potentially Affected" value={num(p.affectedCustomers)} />
        <Kpi label="Repeated Frustration" value={num(p.repeatedFrustration)} className="text-orange-600 dark:text-orange-400" />
        <Kpi label="Disengagement Signals" value={num(p.disengagement)} className="text-red-600 dark:text-red-400" />
        <Kpi label="High Churn Risk" value={num(p.highChurnRisk)} className="text-red-600 dark:text-red-400" />
      </div>
      <Card className="mb-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Financial &amp; Operational Impact</div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted px-3.5 py-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">Potential Customer Value at Risk <ConfBadge label={vd.confidence} /></div>
            <div className="text-[22px] font-bold tracking-tight">{money(p.valueAtRisk)}</div>
            <ExplainTrigger onOpen={onExplain} />
          </div>
          <Stat label="Operational Cost" value={p.opCost} />
        </div>
        <div className="mb-3">
          <Label className="mb-1.5">Customer Segments Affected</Label>
          <BarList items={vd.segments.map((s) => ({ label: s.name, value: s.count }))} />
        </div>
        <div className="flex flex-wrap gap-1.5">{vd.products.map((x) => <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80" key={x}>{x}</span>)}</div>
      </Card>
      <Card className="px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Affected Journeys &amp; Customer Groups</div>
        <div className="mb-2 flex flex-wrap gap-1.5">{p.channels.map((c) => <ChBadge c={c} key={c} />)}</div>
        <div className="text-[11.5px] text-muted-foreground">Churn signal: {vd.churnProbability}</div>
      </Card>
    </>
  );
}

function PaneCauses({ p }) {
  return (
    <>
      <Callout kind="orange"><b>Important.</b> The hypotheses below are AI-generated and not yet confirmed. Each must be verified by the responsible team before being treated as fact.</Callout>
      <div className="mb-3.5 grid grid-cols-2 gap-4">
        <Card className="border-l-3 border-l-green-500 px-4.5">
          <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold">
            <Badge variant="outline" className="border-transparent bg-green-500/10 text-green-600 dark:text-green-400">Confirmed</Badge> What We Know
          </div>
          <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
            <li>{num(p.concernCount)} similar concerns across {p.channels.length} channels</li>
            <li>{p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}% over {p.trendWindow}</li>
            <li>Concentrated in: {p.peakWindow}</li>
            <li>Repeat-contact rate: {p.repeatContactRate}</li>
          </ul>
        </Card>
        <Card className="border-l-3 border-l-violet-500 px-4.5">
          <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold">
            <Badge variant="outline" className="border-transparent bg-violet-500/10 text-violet-600 dark:text-violet-400">AI Suspects</Badge> Not Yet Confirmed
          </div>
          <div className="text-xs leading-relaxed text-muted-foreground">
            {p.rootCause.length} hypothes{p.rootCause.length === 1 ? 'is' : 'es'} generated from pattern analysis of linked concerns — see confidence and evidence for each below.
          </div>
        </Card>
      </div>
      <Card className="mb-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">AI Root-Cause Hypotheses <span className="ml-1 text-[11px] font-normal text-muted-foreground">ranked by confidence, with supporting evidence — not confirmed facts</span></div>
        {p.rootCause.length ? (
          p.rootCause.map((r, i) => (
            <div className="mb-2.5 rounded-lg border bg-muted px-3.5 py-3.5 last:mb-0" key={i}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-[12.5px] font-semibold">🔍 Hypothesis: {r.hyp}</div>
                <div className="shrink-0 font-mono text-[10px] text-violet-600 dark:text-violet-400">{r.conf}% confidence</div>
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted-foreground/15">
                <div className="h-full rounded-full bg-violet-500" style={{ width: r.conf + '%' }} />
              </div>
              <div className="mt-1 text-[11px] leading-relaxed text-foreground/80"><b className="font-semibold text-foreground">Evidence supporting this:</b> {r.evidence}</div>
              <div className="mt-1 text-[11px] leading-relaxed text-foreground/80"><b className="font-semibold text-foreground">Systems potentially involved:</b> {r.systems}</div>
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-muted-foreground"><div className="text-xs">Root cause analysis not yet available.</div></div>
        )}
      </Card>
      <Card className="px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Recommended Next Checks <span className="ml-1 text-[11px] font-normal text-muted-foreground">still needs investigation</span></div>
        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
          {(p.nextChecks.length ? p.nextChecks : ['No further checks queued.']).map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Card>
    </>
  );
}

function PaneIntervention({ p, problemActions, onOpenTask, onGoIntervention }) {
  const saveProblemAssignment = useStore((s) => s.saveProblemAssignment);
  const showToast = useStore((s) => s.showToast);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ owner: '', target: '', deadline: '' });
  const iv = p.intervention;

  function save() {
    if (!form.owner.trim() || !form.deadline) {
      showToast('Please provide an owner and a deadline.');
      return;
    }
    saveProblemAssignment(p.id, { owner: form.owner.trim(), target: form.target.trim(), deadline: form.deadline });
    showToast('Owner assigned and deadline set for ' + p.id);
    setShowForm(false);
    onGoIntervention();
  }

  const BLOCKS = [
    { label: 'Immediate Customer Response', text: iv.immediate, tone: 'border-l-red-500 text-red-600 dark:text-red-400' },
    { label: 'Experience Fix', text: iv.experience, tone: 'border-l-blue-500 text-blue-600 dark:text-blue-400' },
    { label: 'System / Process Fix', text: iv.system, tone: 'border-l-orange-500 text-orange-600 dark:text-orange-400' },
    { label: 'Prevention', text: iv.prevention, tone: 'border-l-green-500 text-green-600 dark:text-green-400' },
  ];

  return (
    <>
      <Callout kind="acc">This is the answer to &quot;we found the problem — what should we actually do about it?&quot; Every recommendation below is tied to an owner, an effort level, and an expected customer impact.</Callout>
      <div className="mb-3.5 grid grid-cols-2 gap-3">
        {BLOCKS.map((b) => (
          <Card key={b.label} className={'border-l-3 px-4.5 ' + b.tone.split(' ')[0]}>
            <div className={'mb-1.5 text-[10.5px] font-bold uppercase ' + b.tone.split(' ').slice(1).join(' ')}>{b.label}</div>
            <div className="text-[11.5px] leading-relaxed text-muted-foreground">{b.text}</div>
          </Card>
        ))}
      </div>

      <Card className="mb-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">AI-Recommended Interventions <span className="ml-1 text-[11px] font-normal text-muted-foreground">ranked — pick what to act on</span></div>
        {iv.recommended.map((r) => {
          const team = teamColorVars(r.owner);
          return (
            <div className="mb-2.5 rounded-lg border bg-muted px-3.5 py-3.5 last:mb-0" key={r.title}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12.5px] font-semibold">{r.title}</div>
                <Badge variant="outline" className="border-transparent" style={{ background: team.bg, color: team.color }}>{r.owner}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-muted-foreground/10 px-2.5 py-0.5 text-[9.5px] font-semibold text-foreground/80">Effort: {r.effort}</span>
                <span className="rounded-full bg-muted-foreground/10 px-2.5 py-0.5 text-[9.5px] font-semibold text-foreground/80">Urgency: {r.urgency}</span>
                <span className="rounded-full bg-muted-foreground/10 px-2.5 py-0.5 text-[9.5px] font-semibold text-foreground/80">Confidence: {r.confidence}%</span>
                <span className="rounded-full bg-muted-foreground/10 px-2.5 py-0.5 text-[9.5px] font-semibold text-foreground/80">Dependencies: {r.dependencies}</span>
              </div>
              <div className="mt-1.5 text-[11px] leading-relaxed text-foreground/80"><b className="font-semibold text-foreground">Expected customer impact:</b> {r.impact}</div>
            </div>
          );
        })}
      </Card>

      <Card className="mb-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Ownership &amp; Target <span className="ml-1 text-[11px] font-normal text-muted-foreground">who owns it</span></div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Owner" value={p.owner} />
          <Stat label="Target" value={p.target} />
          <Stat label="Deadline" value={p.deadline} />
        </div>
        <Button variant="outline" className="mt-3" onClick={() => setShowForm(true)}>+ Assign Owner / Set Deadline</Button>
      </Card>

      <SlidePanel
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Assign Owner / Set Deadline"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save}>Confirm Assignment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Owner</Label>
            <Input placeholder="e.g. Ishara Jayasuriya" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">Target</Label>
            <Input placeholder="e.g. Reduce volume by 60%" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1.5">Deadline</Label>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
        </div>
      </SlidePanel>

      <Card className="px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">
          Tracked Interventions for This Problem <span className="ml-1 text-[11px] font-normal text-muted-foreground">{problemActions.length} tracked — problem → intervention → owner → target → progress → outcome</span>
        </div>
        {problemActions.length ? (
          problemActions.map((a) => <TaskCard a={a} key={a.id} onOpen={onOpenTask} />)
        ) : (
          <div className="px-5 py-10 text-center text-muted-foreground"><div className="text-xs">No interventions tracked yet.</div></div>
        )}
      </Card>
    </>
  );
}

function PaneImpact({ p, onExplain, onGoIntervention }) {
  const b = p.impact.before;
  const a = p.impact.after;
  if (!a) {
    return (
      <Card className="px-4.5">
        <div className="px-5 py-10 text-center text-muted-foreground"><div className="text-xs">No intervention started yet — impact monitoring begins once an owner and deadline are assigned.</div></div>
        <div className="text-center">
          <Button variant="outline" onClick={onGoIntervention}>Go to Intervention Plan</Button>
        </div>
      </Card>
    );
  }
  const vd = getValueDetail(p, 'protected');
  const volPct = Math.round((1 - a.volume / b.volume) * 100);
  const repPct = Math.round((1 - a.repeat / b.repeat) * 100);
  const sntPct = Math.round((1 - a.negSentiment / b.negSentiment) * 100);

  return (
    <>
      <Card className="mb-3.5 px-4.5">
        <div className="mb-3.5 text-[12.5px] font-bold">Is It Working? <span className="ml-1 text-[11px] font-normal text-muted-foreground">before → after intervention was taken</span></div>
        <ImpactPair label="Signal Volume" before={b.volume} after={a.volume} fmt={num} />
        <ImpactPair label="Repeat Contacts" before={b.repeat} after={a.repeat} fmt={num} />
        <ImpactPair label="Negative Sentiment" before={b.negSentiment} after={a.negSentiment} fmt={(v) => v + '%'} />
      </Card>
      <div className="mb-3.5 grid grid-cols-3 gap-3">
        <Kpi label="Problem Reduced" value={'↓ ' + volPct + '%'} className="text-green-600 dark:text-green-400" />
        <Kpi label="Repeat Contacts Reduced" value={'↓ ' + repPct + '%'} className="text-green-600 dark:text-green-400" />
        <Kpi label="Sentiment Improved" value={'↑ ' + sntPct + '%'} className="text-green-600 dark:text-green-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Estimated Churn Prevented" value={num(a.churnPrevented) + ' customers'} />
        <Card className="px-4.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10.5px] tracking-wide text-muted-foreground uppercase">Customer Value Protected <ConfBadge label={vd ? vd.confidence : 'AI Modelled'} /></div>
          <div className="text-xl font-bold tracking-tight text-primary">{money(a.valueProtected)}</div>
          <ExplainTrigger onOpen={onExplain} />
        </Card>
      </div>
      <Card className="mt-3.5 px-4.5">
        <div className="mb-3 text-[12.5px] font-bold">Still Watching</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80">Did similar concerns decrease? ✓</span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80">Did repeat calls decrease? ✓</span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80">Did sentiment improve? ✓</span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10.5px] font-semibold text-foreground/80">Did affected customers stay active? ✓</span>
        </div>
      </Card>
    </>
  );
}

function ImpactPair({ label, before, after, fmt }) {
  const max = Math.max(before, after) * 1.05;
  return (
    <div className="mb-3.5 flex items-center gap-3 last:mb-0">
      <div className="w-42.5 shrink-0 text-[11.5px] text-foreground/80">{label}</div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-10.5 shrink-0 text-[9.5px] text-muted-foreground uppercase">Before</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-red-500" style={{ width: (before / max) * 100 + '%' }} /></div>
          <span className="w-16.5 shrink-0 text-right font-mono text-[11px]">{fmt(before)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10.5 shrink-0 text-[9.5px] text-muted-foreground uppercase">After</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-green-500" style={{ width: (after / max) * 100 + '%' }} /></div>
          <span className="w-16.5 shrink-0 text-right font-mono text-[11px]">{fmt(after)}</span>
        </div>
      </div>
    </div>
  );
}
