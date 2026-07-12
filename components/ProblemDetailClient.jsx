'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const TABS = [
  ['situation', "What's Happening"],
  ['evidence', 'Evidence'],
  ['affected', "Who's Affected"],
  ['causes', 'Likely Causes'],
  ['intervention', 'Intervention Plan'],
  ['impact', 'Did It Work?'],
];

export default function ProblemDetailClient({ problemId }) {
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
      <div className="empty">
        <div className="empty-t">Problem not found.</div>
      </div>
    );
  }

  const problemActions = actions.filter((a) => a.problem === p.id);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn btn-gh btn-sm" onClick={() => router.push('/problems')}>← Back</button>
        <SevBadge s={p.severity} />
        <StatusBadge s={p.status} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--fc)', fontWeight: 700, fontSize: 17, letterSpacing: '-.005em', marginBottom: 8 }}>{p.title}</div>
        <div style={{ color: 'var(--tx1)', fontSize: 12.5, lineHeight: 1.55, marginBottom: 12 }}>{p.description}</div>
        <div className="grid g4">
          <div className="stat"><div className="stat-l">Linked Concerns</div><div className="stat-v">{num(p.concernCount)}</div></div>
          <div className="stat"><div className="stat-l">Channels Involved</div><div className="stat-v">{p.channels.length}</div></div>
          <div className="stat">
            <div className="stat-l">Trend</div>
            <div className="stat-v" style={{ color: p.trendPct >= 0 ? 'var(--red)' : 'var(--green)' }}>{p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}%</div>
          </div>
          <div className="stat"><div className="stat-l">Repeat-Contact Rate</div><div className="stat-v" style={{ fontSize: 14 }}>{p.repeatContactRate}</div></div>
        </div>
      </div>

      <div className="wtabs">
        {TABS.map(([key, label]) => (
          <div key={key} className={'wtab' + (tab === key ? ' on' : '')} onClick={() => setTab(key)}>{label}</div>
        ))}
      </div>

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

      <ConcernDetailPanel concernId={openConcernId} onClose={() => setOpenConcernId(null)} />
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
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Why This Matters</div>
        <div style={{ fontSize: 12.5, color: 'var(--tx1)', lineHeight: 1.7 }}>{p.whyItMatters}</div>
      </div>
      <div className="grid g2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: 12.5 }}>What We Know For Certain</div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: 'var(--tx1)', lineHeight: 2 }}>
            <li>{num(p.concernCount)} similar concerns across {p.channels.length} channels</li>
            <li>{p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}% over {p.trendWindow}</li>
            <li>Concentrated in: {p.peakWindow}</li>
            <li>Repeat-contact rate: {p.repeatContactRate}</li>
            <li>Operational cost: {p.opCost}</li>
          </ul>
        </div>
        <div className="card">
          <div className="section-title" style={{ fontSize: 12.5 }}>Channels Involved</div>
          <div className="pill-list">{p.channels.map((c) => <ChBadge c={c} key={c} />)}</div>
          <hr className="div" />
          <div className="section-title" style={{ fontSize: 12.5 }}>Teams Likely Involved</div>
          <div className="pill-list">{p.teams.map((t) => <span className="pill" key={t}>{t}</span>)}</div>
        </div>
      </div>
    </>
  );
}

function PaneEvidence({ p, onOpenConcern }) {
  const concerns = useStore((s) => s.concerns);
  const linked = concerns.filter((c) => c.linked === p.id);
  return (
    <>
      <div className="grid g2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="section-title" style={{ fontSize: 12.5 }}>Volume Trend <span className="section-hint">{p.trendWindow}</span></div>
          <Sparkline data={p.spark} color={p.trendPct >= 0 ? 'var(--red)' : 'var(--green)'} />
        </div>
        <div className="card">
          <div className="section-title" style={{ fontSize: 12.5 }}>Concerns by Channel</div>
          <BarList items={p.evidenceChannels.map((c) => ({ label: c.label, value: c.count }))} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Time-of-Day Distribution <span className="section-hint">spike indicates {p.peakWindow}</span></div>
        <TimeOfDayChart hourly={p.hourly} peakWindow={p.peakWindow} />
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Sample Connected Concerns <span className="section-hint">{linked.length} linked — direct evidence for this problem</span></div>
        <QueueTable list={linked.slice(0, 8)} onOpen={onOpenConcern} />
      </div>
    </>
  );
}

function PaneAffected({ p, onExplain }) {
  const vd = getValueDetail(p, 'risk');
  return (
    <>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <div className="kpi"><div className="kpi-l">Customers Potentially Affected</div><div className="kpi-v">{num(p.affectedCustomers)}</div></div>
        <div className="kpi"><div className="kpi-l">Repeated Frustration</div><div className="kpi-v" style={{ color: 'var(--orange)' }}>{num(p.repeatedFrustration)}</div></div>
        <div className="kpi"><div className="kpi-l">Disengagement Signals</div><div className="kpi-v" style={{ color: 'var(--red)' }}>{num(p.disengagement)}</div></div>
        <div className="kpi"><div className="kpi-l">High Churn Risk</div><div className="kpi-v" style={{ color: 'var(--red)' }}>{num(p.highChurnRisk)}</div></div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Financial &amp; Operational Impact</div>
        <div className="grid g2" style={{ marginBottom: 12 }}>
          <div className="stat">
            <div className="stat-l">Potential Customer Value at Risk <ConfBadge label={vd.confidence} /></div>
            <div className="stat-v" style={{ fontSize: 22 }}>{money(p.valueAtRisk)}</div>
            <ExplainTrigger onOpen={onExplain} />
          </div>
          <div className="stat"><div className="stat-l">Operational Cost</div><div className="stat-v" style={{ fontSize: 14 }}>{p.opCost}</div></div>
        </div>
        <div className="form-row">
          <label className="form-lbl">Customer Segments Affected</label>
          <BarList items={vd.segments.map((s) => ({ label: s.name, value: s.count }))} />
        </div>
        <div className="pill-list">{vd.products.map((x) => <span className="pill" key={x}>{x}</span>)}</div>
      </div>
      <div className="card">
        <div className="section-title" style={{ fontSize: 12.5 }}>Affected Journeys &amp; Customer Groups</div>
        <div className="pill-list" style={{ marginBottom: 8 }}>{p.channels.map((c) => <ChBadge c={c} key={c} />)}</div>
        <div className="muted" style={{ fontSize: 11.5 }}>Churn signal: {vd.churnProbability}</div>
      </div>
    </>
  );
}

function PaneCauses({ p }) {
  return (
    <>
      <Callout kind="orange"><b>Important.</b> The hypotheses below are AI-generated and not yet confirmed. Each must be verified by the responsible team before being treated as fact.</Callout>
      <div className="grid g2" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 14 }}>
        <div className="card" style={{ borderLeft: '3px solid var(--green)' }}>
          <div className="section-title" style={{ fontSize: 12.5 }}><span className="badge conf-confirmed">Confirmed</span> What We Know</div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: 'var(--tx1)', lineHeight: 2 }}>
            <li>{num(p.concernCount)} similar concerns across {p.channels.length} channels</li>
            <li>{p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}% over {p.trendWindow}</li>
            <li>Concentrated in: {p.peakWindow}</li>
            <li>Repeat-contact rate: {p.repeatContactRate}</li>
          </ul>
        </div>
        <div className="card" style={{ borderLeft: '3px solid var(--purple)' }}>
          <div className="section-title" style={{ fontSize: 12.5 }}><span className="badge conf-ai-modelled">AI Suspects</span> Not Yet Confirmed</div>
          <div style={{ fontSize: 12, color: 'var(--tx1)', lineHeight: 1.7 }}>
            {p.rootCause.length} hypothes{p.rootCause.length === 1 ? 'is' : 'es'} generated from pattern analysis of linked concerns — see confidence and evidence for each below.
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>AI Root-Cause Hypotheses <span className="section-hint">ranked by confidence, with supporting evidence — not confirmed facts</span></div>
        {p.rootCause.length ? (
          p.rootCause.map((r, i) => (
            <div className="rc-item" key={i}>
              <div className="rc-hd">
                <div className="rc-hyp">🔍 Hypothesis: {r.hyp}</div>
                <div className="rc-conf">{r.conf}% confidence</div>
              </div>
              <div className="rc-track"><div className="rc-fill" style={{ width: r.conf + '%' }} /></div>
              <div className="rc-meta"><b>Evidence supporting this:</b> {r.evidence}</div>
              <div className="rc-meta"><b>Systems potentially involved:</b> {r.systems}</div>
            </div>
          ))
        ) : (
          <div className="empty"><div className="empty-t">Root cause analysis not yet available.</div></div>
        )}
      </div>
      <div className="card">
        <div className="section-title" style={{ fontSize: 12.5 }}>Recommended Next Checks <span className="section-hint">still needs investigation</span></div>
        <ul style={{ paddingLeft: 16, fontSize: 12, color: 'var(--tx1)', lineHeight: 2 }}>
          {(p.nextChecks.length ? p.nextChecks : ['No further checks queued.']).map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
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

  return (
    <>
      <Callout kind="acc">This is the answer to &quot;we found the problem — what should we actually do about it?&quot; Every recommendation below is tied to an owner, an effort level, and an expected customer impact.</Callout>
      <div className="grid g2" style={{ marginBottom: 14 }}>
        <div className="card interv-block" style={{ borderLeft: '3px solid var(--red)' }}><div className="interv-lbl" style={{ color: 'var(--red)' }}>Immediate Customer Response</div><div className="interv-txt">{iv.immediate}</div></div>
        <div className="card interv-block" style={{ borderLeft: '3px solid var(--blue)' }}><div className="interv-lbl" style={{ color: 'var(--blue)' }}>Experience Fix</div><div className="interv-txt">{iv.experience}</div></div>
        <div className="card interv-block" style={{ borderLeft: '3px solid var(--orange)' }}><div className="interv-lbl" style={{ color: 'var(--orange)' }}>System / Process Fix</div><div className="interv-txt">{iv.system}</div></div>
        <div className="card interv-block" style={{ borderLeft: '3px solid var(--green)' }}><div className="interv-lbl" style={{ color: 'var(--green)' }}>Prevention</div><div className="interv-txt">{iv.prevention}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>AI-Recommended Interventions <span className="section-hint">ranked — pick what to act on</span></div>
        {iv.recommended.map((r) => {
          const team = teamColorVars(r.owner);
          return (
            <div className="interv-rec" key={r.title}>
              <div className="interv-rec-hd">
                <div className="interv-rec-title">{r.title}</div>
                <span className="badge" style={{ background: team.bg, color: team.color }}>{r.owner}</span>
              </div>
              <div className="interv-rec-badges">
                <span className="mini-tag">Effort: {r.effort}</span>
                <span className="mini-tag">Urgency: {r.urgency}</span>
                <span className="mini-tag">Confidence: {r.confidence}%</span>
                <span className="mini-tag">Dependencies: {r.dependencies}</span>
              </div>
              <div className="rc-meta" style={{ marginTop: 6 }}><b>Expected customer impact:</b> {r.impact}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Ownership &amp; Target <span className="section-hint">who owns it</span></div>
        <div className="grid g3">
          <div className="stat"><div className="stat-l">Owner</div><div className="stat-v" style={{ fontSize: 13 }}>{p.owner}</div></div>
          <div className="stat"><div className="stat-l">Target</div><div className="stat-v" style={{ fontSize: 13 }}>{p.target}</div></div>
          <div className="stat"><div className="stat-l">Deadline</div><div className="stat-v" style={{ fontSize: 13 }}>{p.deadline}</div></div>
        </div>
        <button className="btn btn-gh" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>+ Assign Owner / Set Deadline</button>
      </div>

      <SlidePanel
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Assign Owner / Set Deadline"
        footer={
          <>
            <button className="btn btn-gh" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-p" onClick={save}>Confirm Assignment</button>
          </>
        }
      >
        <div className="form-row">
          <label className="form-lbl">Owner</label>
          <input className="form-inp" placeholder="e.g. Ishara Jayasuriya" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
        <div className="form-row">
          <label className="form-lbl">Target</label>
          <input className="form-inp" placeholder="e.g. Reduce volume by 60%" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
        </div>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <label className="form-lbl">Deadline</label>
          <input className="form-inp" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </div>
      </SlidePanel>

      <div className="card">
        <div className="section-title" style={{ fontSize: 12.5 }}>
          Tracked Interventions for This Problem <span className="section-hint">{problemActions.length} tracked — problem → intervention → owner → target → progress → outcome</span>
        </div>
        {problemActions.length ? (
          problemActions.map((a) => <TaskCard a={a} key={a.id} onOpen={onOpenTask} />)
        ) : (
          <div className="empty"><div className="empty-t">No interventions tracked yet.</div></div>
        )}
      </div>
    </>
  );
}

function PaneImpact({ p, onExplain, onGoIntervention }) {
  const b = p.impact.before;
  const a = p.impact.after;
  if (!a) {
    return (
      <div className="card">
        <div className="empty"><div className="empty-t">No intervention started yet — impact monitoring begins once an owner and deadline are assigned.</div></div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-gh" onClick={onGoIntervention}>Go to Intervention Plan</button>
        </div>
      </div>
    );
  }
  const vd = getValueDetail(p, 'protected');
  const volPct = Math.round((1 - a.volume / b.volume) * 100);
  const repPct = Math.round((1 - a.repeat / b.repeat) * 100);
  const sntPct = Math.round((1 - a.negSentiment / b.negSentiment) * 100);

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Is It Working? <span className="section-hint">before → after intervention was taken</span></div>
        <ImpactPair label="Signal Volume" before={b.volume} after={a.volume} fmt={num} />
        <ImpactPair label="Repeat Contacts" before={b.repeat} after={a.repeat} fmt={num} />
        <ImpactPair label="Negative Sentiment" before={b.negSentiment} after={a.negSentiment} fmt={(v) => v + '%'} />
      </div>
      <div className="grid g3" style={{ marginBottom: 14 }}>
        <div className="kpi"><div className="kpi-l">Problem Reduced</div><div className="kpi-v" style={{ color: 'var(--green)' }}>↓ {volPct}%</div></div>
        <div className="kpi"><div className="kpi-l">Repeat Contacts Reduced</div><div className="kpi-v" style={{ color: 'var(--green)' }}>↓ {repPct}%</div></div>
        <div className="kpi"><div className="kpi-l">Sentiment Improved</div><div className="kpi-v" style={{ color: 'var(--green)' }}>↑ {sntPct}%</div></div>
      </div>
      <div className="grid g2">
        <div className="kpi"><div className="kpi-l">Estimated Churn Prevented</div><div className="kpi-v">{num(a.churnPrevented)} customers</div></div>
        <div className="kpi">
          <div className="kpi-l">Customer Value Protected <ConfBadge label={vd ? vd.confidence : 'AI Modelled'} /></div>
          <div className="kpi-v" style={{ color: 'var(--acc)' }}>{money(a.valueProtected)}</div>
          <ExplainTrigger onOpen={onExplain} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-title" style={{ fontSize: 12.5 }}>Still Watching</div>
        <div className="pill-list">
          <span className="pill">Did similar concerns decrease? ✓</span>
          <span className="pill">Did repeat calls decrease? ✓</span>
          <span className="pill">Did sentiment improve? ✓</span>
          <span className="pill">Did affected customers stay active? ✓</span>
        </div>
      </div>
    </>
  );
}

function ImpactPair({ label, before, after, fmt }) {
  const max = Math.max(before, after) * 1.05;
  return (
    <div className="impact-pair">
      <div className="impact-pair-lbl">{label}</div>
      <div className="impact-bars">
        <div className="impact-bar-row">
          <span className="impact-bar-tag">Before</span>
          <div className="impact-bar-track"><div className="impact-bar-fill" style={{ width: (before / max) * 100 + '%', background: 'var(--red)' }} /></div>
          <span className="impact-bar-num">{fmt(before)}</span>
        </div>
        <div className="impact-bar-row">
          <span className="impact-bar-tag">After</span>
          <div className="impact-bar-track"><div className="impact-bar-fill" style={{ width: (after / max) * 100 + '%', background: 'var(--green)' }} /></div>
          <span className="impact-bar-num">{fmt(after)}</span>
        </div>
      </div>
    </div>
  );
}
