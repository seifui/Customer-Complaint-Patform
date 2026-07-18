'use client';

import { Columns3 } from 'lucide-react';
import { QUEUE_COLUMNS } from '@/lib/queueColumns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function CustomizeColumnsPopover({ visibleColumns, onChange }) {
  function toggle(key, next) {
    if (QUEUE_COLUMNS.find((c) => c.key === key)?.locked) return;
    onChange({ ...visibleColumns, [key]: next });
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 border-border bg-background shadow-none hover:bg-muted/60"
            aria-label="Customize columns"
          />
        }
      >
        <Columns3 />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-0 p-0">
        <PopoverHeader className="border-b px-3 py-2.5">
          <PopoverTitle>Customize Columns</PopoverTitle>
          <PopoverDescription className="text-xs">
            Choose which columns appear in the queue.
          </PopoverDescription>
        </PopoverHeader>
        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {QUEUE_COLUMNS.map((col) => {
            const checked = !!visibleColumns[col.key];
            return (
              <label
                key={col.key}
                className={
                  col.locked
                    ? 'flex cursor-default items-center gap-2.5 py-1.5 text-sm opacity-70'
                    : 'flex cursor-pointer items-center gap-2.5 py-1.5 text-sm'
                }
              >
                <Checkbox
                  checked={checked}
                  disabled={col.locked}
                  onCheckedChange={(v) => toggle(col.key, !!v)}
                />
                <span>{col.label}</span>
                {col.locked && (
                  <span className="ml-auto text-[10.5px] text-muted-foreground">Always on</span>
                )}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
