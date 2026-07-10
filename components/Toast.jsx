'use client';

import { useStore } from '@/lib/store';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div className="toast show" key={toast.id}>
      <div className="td" />
      <span>{toast.message}</span>
    </div>
  );
}
