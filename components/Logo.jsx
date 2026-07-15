import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LogoMark({ size = 28, className }) {
  return <Sparkles size={Math.round(size * 0.62)} className={cn('shrink-0 text-foreground', className)} aria-hidden="true" strokeWidth={2.2} />;
}

export default function Logo({ size = 28, wordmark = true, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <LogoMark size={size} />
      {wordmark && (
        <span className="font-semibold tracking-tight text-foreground whitespace-nowrap">
          Concerns<span className="text-muted-foreground"> AI</span>
        </span>
      )}
    </span>
  );
}
