'use client';

import { useRouter } from 'next/navigation';
import SlidePanel from './SlidePanel';
import Callout from './Callout';
import { ChBadge, SevBadge, SntBadge, TriageBadge } from './Badges';
import { useStore } from '@/lib/store';
import { triageInfo } from '@/lib/helpers';

export default function ConcernDetailPanel({ concernId, onClose }) {
  const router = useRouter();
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const c = concernId ? concerns.find((x) => x.id === concernId) : null;

  return (
    <SlidePanel open={!!c} onClose={onClose} title={c ? c.id : 'Concern Detail'}>
      {c && (
        <ConcernDetailBody
          c={c}
          tri={triageInfo(c, problems)}
          linkedProblem={c.linked ? problems.find((p) => p.id === c.linked) : null}
          goToProblem={() => {
            onClose();
            router.push('/problems/' + c.linked);
          }}
        />
      )}
    </SlidePanel>
  );
}

function Row({ label, value }) {
  return (
    <div className="pnl-row">
      <span className="pnl-row-lbl">{label}</span>
      <span className="pnl-row-val">{value}</span>
    </div>
  );
}

function ConcernDetailBody({ c, tri, linkedProblem, goToProblem }) {
  return (
    <>
      <div className="pnl-section" style={{ paddingTop: 0 }}>
        <div className="pill-list">
          <TriageBadge tri={tri} />
          <ChBadge c={c.channel} />
          <SevBadge s={c.severity} />
          <SntBadge s={c.sentiment} />
        </div>
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Signal</div>
        <Row label="Customer" value={c.customer} />
        <Row label="Journey" value={c.journey} />
        <Row label="Language" value={c.lang} />
        {c.issueType && <Row label="Issue Type" value={c.issueType} />}
        {c.urgency && <Row label="Urgency" value={c.urgency} />}
        <Row label="Created" value={<span className="mono">{c.createdAt}</span>} />
        <Row label="Assigned To" value={c.assignee} />
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">AI Understanding</div>
        <div style={{ fontSize: 10.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 600 }}>Raw Signal</div>
        <Callout kind="blue" style={{ marginBottom: 12, fontSize: 11.5 }}>{c.raw}</Callout>
        <div style={{ fontSize: 10.5, color: 'var(--tx2)', marginBottom: 5, fontWeight: 600 }}>AI Summary</div>
        <div style={{ fontSize: 12, color: 'var(--tx1)', lineHeight: 1.5 }}>{c.summary}</div>
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Why This Was Flagged</div>
        <Callout kind="blue" style={{ marginBottom: 0, fontSize: 11.5 }}>{tri.note}</Callout>
      </div>

      <div className="pnl-section">
        <div className="pnl-section-hd">Processing Pipeline</div>
        <div className="flow-strip" style={{ padding: '2px 0 12px' }}>
          <div className="flow-step done">
            <div className="flow-step-dot">✓</div>Ingest
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step done">
            <div className="flow-step-dot">✓</div>Dedupe
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step done">
            <div className="flow-step-dot">✓</div>Understand
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step done">
            <div className="flow-step-dot">✓</div>Classify
          </div>
          <div className="flow-arrow">→</div>
          <div className={'flow-step' + (c.linked ? ' done' : '')}>
            <div className="flow-step-dot">{c.linked ? '✓' : '…'}</div>Connect
          </div>
        </div>
        {c.linked ? (
          <Callout kind="acc" style={{ marginBottom: 0, fontSize: 11.5 }}>
            Connected to{' '}
            <b className="tx-link" onClick={goToProblem}>
              {linkedProblem.id} — {linkedProblem.title}
            </b>
          </Callout>
        ) : (
          <Callout kind="orange" style={{ marginBottom: 0, fontSize: 11.5 }}>Not yet linked to a known problem pattern.</Callout>
        )}
      </div>
    </>
  );
}
