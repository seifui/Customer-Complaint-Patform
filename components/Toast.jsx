'use client';

import { CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="fixed top-4 right-4 z-400 flex max-w-[340px] animate-in items-center gap-2 rounded-lg bg-foreground px-4.5 py-2.5 text-sm text-background shadow-lg fade-in slide-in-from-top-4 duration-300"
    >
      <CheckCircle2 className="size-4 shrink-0 opacity-70" />
      <span>{toast.message}</span>
    </div>
  );
}
