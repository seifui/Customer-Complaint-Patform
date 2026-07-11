export default function AiStepper({ steps }) {
  return (
    <div className="ai-stepper">
      {steps.map((s, i) => (
        <div className={'ai-step ' + s.state} key={s.label}>
          <div className="ai-step-rail">
            <div className="ai-step-dot">
              {s.state === 'done' ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.2l3 3L11.5 3.8" /></svg>
              ) : s.state === 'active' ? (
                <span className="ai-step-spinner" />
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && <div className="ai-step-line" />}
          </div>
          <div className="ai-step-body">
            <div className="ai-step-label">{s.label}</div>
            {s.desc && <div className="ai-step-desc">{s.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
