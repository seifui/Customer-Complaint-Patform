'use client';

import { useMemo } from 'react';
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function normalize(options) {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

export default function Select({ value, onChange, options, placeholder = 'Select…', variant = 'field', style, className }) {
  const opts = useMemo(() => normalize(options), [options]);
  const items = useMemo(() => Object.fromEntries(opts.map((o) => [o.value, o.label])), [opts]);

  return (
    <ShadSelect items={items} value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(variant === 'field' && 'w-full', className)}
        style={style}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </ShadSelect>
  );
}
