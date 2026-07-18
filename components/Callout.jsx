import { cn } from '@/lib/utils';

const TONE = {
  acc: 'bg-primary/5 border-primary/15',
  blue: 'bg-blue-500/10 border-blue-500/20',
  orange: 'bg-orange-500/10 border-orange-500/20',
};

export default function Callout({ kind = 'acc', children, style, className }) {
  return (
    <div className={cn('mb-3.5 rounded-lg border px-3.5 py-2.5 text-[11.5px] leading-relaxed', TONE[kind] || TONE.acc, className)} style={style}>
      {children}
    </div>
  );
}
