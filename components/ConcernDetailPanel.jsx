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

function ConcernDetailBody({ c, tri, linkedProblem, goToProblem }) {
  return (
    <>
      <span className="badge" style={{ background: tri.bg, color: tri.color, marginBottom: 8 }}>
        {tri.label}
      </span>
      <Callout kind="blue" style={{ marginTop: 10 }}>
        {tri.note}
      </Callout>
      <div className="pill-list" style={{ marginBottom: 12 }}>
        <ChBadge c={c.channel} />
        <SevBadge s={c.severity} />
        <SntBadge s={c.sentiment} />
      </div>
      <div className="form-row">
        <label className="form-lbl">Customer</label>
        <div>{c.customer}</div>
      </div>
      <div className="grid g2" style={{ gap: 10 }}>
        <div className="form-row">
          <label className="form-lbl">Journey</label>
          <div>{c.journey}</div>
        </div>
        <div className="form-row">
          <label className="form-lbl">Language</label>
          <div>{c.lang}</div>
        </div>
      </div>
      {c.issueType && (
        <div className="grid g2" style={{ gap: 10 }}>
          <div className="form-row">
            <label className="form-lbl">Issue Type</label>
            <div>{c.issueType}</div>
          </div>
          <div className="form-row">
            <label className="form-lbl">Urgency</label>
            <div>{c.urgency}</div>
          </div>
        </div>
      )}
      <div className="form-row">
        <label className="form-lbl">Raw Signal</label>
        <Callout kind="blue" style={{ marginBottom: 0 }}>
          {c.raw}
        </Callout>
      </div>
      <div className="form-row">
        <label className="form-lbl">AI Summary</label>
        <div>{c.summary}</div>
      </div>
      <hr className="div" />
      <div className="section-title" style={{ fontSize: 12 }}>
        Processing Pipeline
      </div>
      <div className="flow-strip" style={{ padding: '4px 0' }}>
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
        <Callout kind="acc">
          Connected to{' '}
          <b className="tx-link" onClick={goToProblem}>
            {linkedProblem.id} — {linkedProblem.title}
          </b>
        </Callout>
      ) : (
        <Callout kind="orange">Not yet linked to a known problem pattern.</Callout>
      )}
      <div className="form-row">
        <label className="form-lbl">Created</label>
        <div className="mono">
          {c.createdAt} · {c.assignee}
        </div>
      </div>
    </>
  );
}
