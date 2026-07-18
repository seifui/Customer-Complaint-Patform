'use client';

import { ChBadge, SevBadge, SntBadge, TriageBadge, PrimaryStatusBadge } from './Badges';
import { triageInfo, primaryStatusOf, formatAge, money } from '@/lib/helpers';
import { defaultVisibleColumns, visibleColumnDefs, tableMinWidth } from '@/lib/queueColumns';
import { useStore } from '@/lib/store';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/** Vertical padding targets ~60–64px row height without widening columns. */
const cellY = 'py-3.5';

const stickyIdHead =
  'sticky left-0 z-20 bg-card shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]';
const stickyIdCell =
  'sticky left-0 z-10 bg-card shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] group-hover:bg-muted/50';

const COL_CLASS = {
  id: 'w-[110px]',
  signal: 'w-[120px]',
  channel: 'w-[110px]',
  status: 'w-[100px]',
  customer: 'w-[140px]',
  journey: 'w-[130px]',
  summary: 'w-[180px]',
  severity: 'w-[90px]',
  sentiment: 'w-[100px]',
  assignee: 'w-[140px]',
  age: 'w-[80px]',
  repeatCount: 'w-[90px]',
  financialImpact: 'w-[120px]',
  created: 'w-[100px]',
  department: 'w-[120px]',
  region: 'w-[120px]',
  language: 'w-[90px]',
  relatedConcernsCount: 'w-[110px]',
  lastUpdated: 'w-[110px]',
  externalTicketStatus: 'w-[130px]',
  tags: 'w-[140px]',
};

function dash(value) {
  if (value === undefined || value === null || value === '') return '—';
  return value;
}

function TagsCell({ tags }) {
  if (!tags?.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex max-w-full gap-1 overflow-hidden">
      {tags.slice(0, 2).map((tag) => (
        <span
          key={tag}
          className="inline-flex max-w-[70px] truncate rounded bg-muted px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
        >
          {tag}
        </span>
      ))}
      {tags.length > 2 && (
        <span className="text-[10.5px] text-muted-foreground">+{tags.length - 2}</span>
      )}
    </div>
  );
}

function renderCell(key, c, tri) {
  switch (key) {
    case 'id':
      return c.id;
    case 'signal':
      return <TriageBadge tri={tri} />;
    case 'channel':
      return <ChBadge c={c.channel} />;
    case 'status':
      return <PrimaryStatusBadge status={primaryStatusOf(c)} />;
    case 'customer':
      return c.customer;
    case 'journey':
      return c.journey;
    case 'summary':
      return (
        <Tooltip>
          <TooltipTrigger
            className={cn(
              'block max-w-full cursor-pointer truncate rounded-sm text-left text-sm',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
            )}
          >
            {c.summary}
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="start"
            className="max-w-sm whitespace-normal text-left leading-relaxed"
          >
            {c.summary}
          </TooltipContent>
        </Tooltip>
      );
    case 'severity':
      return <SevBadge s={c.severity} />;
    case 'sentiment':
      return <SntBadge s={c.sentiment} />;
    case 'assignee':
      return dash(c.assignee === '—' ? null : c.assignee);
    case 'age':
      return formatAge(c.createdAt);
    case 'repeatCount':
      return c.repeatCount ?? 0;
    case 'financialImpact':
      return c.financialImpact ? money(c.financialImpact) : '—';
    case 'created':
      return c.createdAt;
    case 'department':
      return dash(c.assignedDepartment);
    case 'region':
      return dash(c.region);
    case 'language':
      return dash(c.lang);
    case 'relatedConcernsCount':
      return c.relatedConcernsCount ?? 0;
    case 'lastUpdated':
      return dash(c.updatedAt || c.createdAt);
    case 'externalTicketStatus':
      return dash(c.externalTicketStatus === '—' ? null : c.externalTicketStatus);
    case 'tags':
      return <TagsCell tags={c.tags} />;
    default:
      return null;
  }
}

function cellClassName(key) {
  const base = cn(COL_CLASS[key], cellY);
  if (key === 'customer' || key === 'journey' || key === 'assignee' || key === 'department' || key === 'region') {
    return cn(base, 'truncate');
  }
  if (key === 'summary') return cn(base, 'overflow-hidden');
  if (key === 'created' || key === 'lastUpdated' || key === 'age') {
    return cn(base, 'font-mono text-[10.5px] text-muted-foreground');
  }
  if (key === 'financialImpact' || key === 'repeatCount' || key === 'relatedConcernsCount') {
    return cn(base, 'tabular-nums text-muted-foreground');
  }
  if (key === 'language' || key === 'externalTicketStatus') {
    return cn(base, 'text-muted-foreground');
  }
  return base;
}

export default function QueueTable({ list, onOpen, emptyState, visibleColumns }) {
  const problems = useStore((s) => s.problems);
  const visibility = visibleColumns || defaultVisibleColumns();
  const columns = visibleColumnDefs(visibility);
  const colSpan = Math.max(columns.length, 1);
  const minW = tableMinWidth(visibility);

  return (
    <Table className="table-fixed" style={{ minWidth: minW }}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(col.key === 'id' && stickyIdHead, COL_CLASS[col.key])}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colSpan} className="py-10 text-center">
              {emptyState ?? (
                <div className="text-xs text-muted-foreground">No concerns match these filters.</div>
              )}
            </TableCell>
          </TableRow>
        ) : (
          list.map((c) => {
            const tri = triageInfo(c, problems);
            return (
              <TableRow
                key={c.id}
                className="group h-15 cursor-pointer"
                onClick={() => onOpen(c.id)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    style={col.key === 'id' ? { borderLeft: '3px solid ' + tri.color } : undefined}
                    className={cn(
                      cellClassName(col.key),
                      col.key === 'id' && stickyIdCell,
                      col.key === 'id' && 'pl-3 font-mono text-primary'
                    )}
                  >
                    {renderCell(col.key, c, tri)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
