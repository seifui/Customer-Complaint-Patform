'use client';

import { ChBadge, SevBadge, SntBadge, TriageBadge } from './Badges';
import { triageInfo } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function QueueTable({ list, onOpen }) {
  const problems = useStore((s) => s.problems);

  if (!list.length) {
    return (
      <div className="px-5 py-10 text-center text-muted-foreground">
        <div className="text-xs">No concerns match these filters.</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Signal</TableHead>
          <TableHead>Tracking ID</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Journey</TableHead>
          <TableHead>AI Summary &amp; Reasoning</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Sentiment</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((c) => {
          const tri = triageInfo(c, problems);
          return (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => onOpen(c.id)}>
              <TableCell style={{ borderLeft: '3px solid ' + tri.color }} className="pl-3">
                <TriageBadge tri={tri} />
              </TableCell>
              <TableCell className="font-mono text-primary">{c.id}</TableCell>
              <TableCell>
                <ChBadge c={c.channel} />
              </TableCell>
              <TableCell>{c.customer}</TableCell>
              <TableCell>{c.journey}</TableCell>
              <TableCell className="max-w-70">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">{c.summary}</div>
              </TableCell>
              <TableCell>
                <SevBadge s={c.severity} />
              </TableCell>
              <TableCell>
                <SntBadge s={c.sentiment} />
              </TableCell>
              <TableCell className="font-mono text-[10.5px] text-muted-foreground">{c.createdAt}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
