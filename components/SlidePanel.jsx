'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function SlidePanel({ open, onClose, title, subtitle, children, footer, width }) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        className={cn('gap-0 sm:max-w-md', width && 'sm:max-w-(--slide-w)')}
        style={width ? { '--slide-w': width } : undefined}
      >
        <SheetHeader className="border-b pr-10">
          <SheetTitle>{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">{open ? children : null}</div>
        {footer && <SheetFooter className="flex-row justify-end border-t">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
