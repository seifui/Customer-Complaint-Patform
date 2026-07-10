export default function FlowStrip({ steps, style }) {
  return (
    <div className="flow-strip" style={style}>
      {steps.map((label, i) => (
        <span key={label} style={{ display: 'contents' }}>
          <div className={'flow-step done'}>
            <div className="flow-step-dot">{i + 1}</div>
            {label}
          </div>
          {i < steps.length - 1 && <div className="flow-arrow">→</div>}
        </span>
      ))}
    </div>
  );
}
