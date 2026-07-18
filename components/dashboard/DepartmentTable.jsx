'use client';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

function SlaBadge({ pct }) {
  const tone =
    pct >= 95
      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
      : pct >= 90
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
        : 'bg-red-500/10 text-red-600 dark:text-red-400';
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold', tone)}>
      {pct}%
    </span>
  );
}

function OpenBar({ value, max = 50 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-blue-500/80" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 font-mono text-[11px] tabular-nums">{value}</span>
    </div>
  );
}

export default function DepartmentTable({ departments }) {
  const maxOpen = Math.max(...departments.map((d) => d.open), 1);

  return (
    <section>
      <div className="mb-3.5 text-[13px] font-semibold text-muted-foreground">Department Performance</div>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 shadow-[0_1px_3px_oklch(0_0_0/0.04)]">
        <div className="max-h-[360px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Resolved Today</TableHead>
                <TableHead>SLA %</TableHead>
                <TableHead>Avg Resolution</TableHead>
                <TableHead>Critical</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d) => (
                <TableRow key={d.departmentKey} className="hover:bg-muted/40">
                  <TableCell className="font-semibold">{d.department}</TableCell>
                  <TableCell>
                    <OpenBar value={d.open} max={maxOpen} />
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{d.resolvedToday}</TableCell>
                  <TableCell>
                    <SlaBadge pct={d.slaPct} />
                  </TableCell>
                  <TableCell className="font-mono text-[12px]">{d.avgResolution}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'font-mono tabular-nums',
                        d.critical > 3 ? 'font-semibold text-red-600 dark:text-red-400' : '',
                      )}
                    >
                      {d.critical}
                    </span>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{d.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
