'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { money, num } from '@/lib/helpers';
import { SevBadge, StatusBadge } from './Badges';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function ProblemsListClient() {
  const router = useRouter();
  const problems = useStore((s) => s.problems);
  const concerns = useStore((s) => s.concerns);

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-2 border-b px-4 py-3.5 text-sm font-bold">
        AI-Identified Problems <span className="text-[11px] font-normal text-muted-foreground">{problems.length} problems from {concerns.length} raw concerns</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Problem</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Concerns</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Affected</TableHead>
            <TableHead>Value at Risk</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((p) => (
            <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push('/problems/' + p.id)}>
              <TableCell className="whitespace-normal">
                <div className="font-semibold">
                  {p.title}
                  {p.executiveDecision && <Badge variant="outline" className="ml-1.5 border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400">Exec</Badge>}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{p.id}</div>
              </TableCell>
              <TableCell><SevBadge s={p.severity} /></TableCell>
              <TableCell><StatusBadge s={p.status} /></TableCell>
              <TableCell>{p.channels.length}</TableCell>
              <TableCell className="font-mono">{num(p.concernCount)}</TableCell>
              <TableCell className={p.trendPct >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {p.trendPct >= 0 ? '↑' : '↓'} {Math.abs(p.trendPct)}%
              </TableCell>
              <TableCell className="font-mono">{num(p.affectedCustomers)}</TableCell>
              <TableCell className="font-mono">{money(p.valueAtRisk)}</TableCell>
              <TableCell className="text-[11px] text-muted-foreground">{p.owner === '—' ? 'Unassigned' : p.owner.split('—')[0]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
