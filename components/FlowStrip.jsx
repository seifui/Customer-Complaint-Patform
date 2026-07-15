export default function FlowStrip({ steps, style }) {
  return (
    <div className="flex items-start gap-1 py-3" style={style}>
      {steps.map((label, i) => (
        <span key={label} className="contents">
          <div className="min-w-0 flex-1 px-0.5 text-center text-[9.5px] text-muted-foreground">
            <div className="mx-auto mb-1.5 flex size-6.5 items-center justify-center rounded-full bg-foreground text-[11px] text-background">{i + 1}</div>
            {label}
          </div>
          {i < steps.length - 1 && <div className="mt-2 shrink-0 text-[11px] text-muted-foreground/60">→</div>}
        </span>
      ))}
    </div>
  );
}
