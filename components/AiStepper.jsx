import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AiStepper({ steps }) {
  return (
    <div className="flex flex-col">
      {steps.map((s, i) => (
        <div className="flex gap-3.5" key={s.label}>
          <div className="flex shrink-0 flex-col items-center">
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-bold transition-colors',
                s.state === 'done' && 'border-green-500 bg-green-500 text-white',
                s.state === 'active' && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                s.state === 'pending' && 'border-border bg-muted text-muted-foreground'
              )}
            >
              {s.state === 'done' ? <Check className="size-3.5" /> : s.state === 'active' ? <Loader2 className="size-3 animate-spin" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn('my-0.5 min-h-4.5 w-0.5 flex-1', s.state === 'done' ? 'bg-green-500' : 'bg-border')} />
            )}
          </div>
          <div className={cn('pt-0.5 pb-4.5 last:pb-0', 'min-w-0 flex-1')}>
            <div className={cn('mb-0.5 text-[12.5px] font-semibold', s.state === 'pending' && 'text-muted-foreground')}>{s.label}</div>
            {s.desc && <div className="text-[11px] leading-relaxed text-muted-foreground">{s.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
