'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { triageInfo, TRIAGE_DEFS, PRIMARY_STATUS_TABS, primaryStatusOf } from '@/lib/helpers';
import { CHANNEL_ICON } from '@/lib/data';
import { defaultVisibleColumns, loadVisibleColumns, saveVisibleColumns } from '@/lib/queueColumns';
import QueueTable from './QueueTable';
import CustomizeColumnsPopover from './CustomizeColumnsPopover';
import AllFiltersDrawer, {
  DRAWER_JOURNEYS,
  DRAWER_SENTIMENTS,
  DRAWER_SIGNAL_TYPES,
} from './AllFiltersDrawer';
import Select from './Select';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const ALL = '__all__';
const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

const QUICK_JOURNEY_OPTIONS = [
  'Money Transfer',
  'KYC/Onboarding',
  'Cards',
  'Loans',
  'Standing Orders',
  'Digital Banking',
];

const QUICK_SENTIMENT_OPTIONS = [
  { value: 'angry', label: 'Angry' },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positive' },
];

function matchesJourney(journey, filter) {
  if (!filter) return true;
  const j = (journey || '').replace(/\s*[/\-]\s*/g, '/').toLowerCase();
  const f = filter.replace(/\s*[/\-]\s*/g, '/').toLowerCase();
  if (j === f) return true;
  if (f === 'cards') return j === 'cards' || j === 'card payment';
  if (f === 'loans') return j === 'loans' || j === 'loan application';
  if (f === 'digital banking') return j === 'digital banking' || j.startsWith('digital banking');
  if (f === 'kyc/onboarding') return j.includes('kyc') || j.includes('onboarding');
  return false;
}

function matchesSentiment(sentiment, filter) {
  if (!filter) return true;
  if (filter === 'angry') return sentiment === 'angry' || sentiment === 'very-angry';
  if (filter === 'frustrated') return sentiment === 'frustrated' || sentiment === 'negative';
  return sentiment === filter;
}

function matchesChannel(channel, selected) {
  if (!selected.length) return true;
  if (selected.includes(channel)) return true;
  if (selected.includes('Digital App') && (channel === 'Digital App' || channel === 'Mobile App')) return true;
  return false;
}

function customerTypeOf(c) {
  const s = (c.customer || '').toLowerCase();
  if (/\bnew\b/.test(s)) return 'new';
  if (/\bexisting\b/.test(s)) return 'existing';
  return null;
}

function matchesTags(c, tags) {
  if (!tags.length) return true;
  const concernTags = (c.tags || []).map((t) => String(t).toLowerCase());
  return tags.some((tag) => {
    const t = tag.toLowerCase();
    if (concernTags.includes(t)) return true;
    if (t === 'repeat_offender' || t === 'repeat') return c.triageOverride === 'repeat';
    if (t === 'vip') return /\bvip\b/i.test(c.customer || '') || /\bvip\b/i.test(c.summary || '');
    if (t === 'regulatory') return /\bregulat/i.test(c.summary || '') || /\bregulat/i.test(c.raw || '');
    return false;
  });
}

function createdDate(c) {
  return (c.createdAt || '').slice(0, 10);
}

function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function journeyChipLabel(value) {
  return DRAWER_JOURNEYS.find((j) => j.value === value)?.label || value;
}

function sentimentChipLabel(value) {
  return (
    DRAWER_SENTIMENTS.find((s) => s.value === value)?.label ||
    QUICK_SENTIMENT_OPTIONS.find((s) => s.value === value)?.label ||
    titleCase(value)
  );
}

function activeFilterChips(filters) {
  const chips = [];

  if (filters.status !== 'all') {
    const tab = PRIMARY_STATUS_TABS.find((t) => t.key === filters.status);
    chips.push({ key: 'status', label: `Status: ${tab?.label || filters.status}`, clear: { status: 'all' } });
  }
  if (filters.q.trim()) {
    chips.push({ key: 'q', label: `Search: ${filters.q.trim()}`, clear: { q: '' } });
  }
  filters.channels.forEach((channel) => {
    chips.push({
      key: `channel:${channel}`,
      label: `Channel: ${channel}`,
      clear: { channels: filters.channels.filter((c) => c !== channel) },
    });
  });
  filters.severities.forEach((severity) => {
    chips.push({
      key: `severity:${severity}`,
      label: `Severity: ${titleCase(severity)}`,
      clear: { severities: filters.severities.filter((s) => s !== severity) },
    });
  });
  filters.journeys.forEach((journey) => {
    chips.push({
      key: `journey:${journey}`,
      label: `Journey: ${journeyChipLabel(journey)}`,
      clear: { journeys: filters.journeys.filter((j) => j !== journey) },
    });
  });
  filters.sentiments.forEach((sentiment) => {
    chips.push({
      key: `sentiment:${sentiment}`,
      label: `Sentiment: ${sentimentChipLabel(sentiment)}`,
      clear: { sentiments: filters.sentiments.filter((s) => s !== sentiment) },
    });
  });
  filters.customerTypes.forEach((type) => {
    chips.push({
      key: `customer:${type}`,
      label: `Customer: ${titleCase(type)}`,
      clear: { customerTypes: filters.customerTypes.filter((t) => t !== type) },
    });
  });
  filters.signalTypes.forEach((signal) => {
    const opt = DRAWER_SIGNAL_TYPES.find((s) => s.value === signal);
    chips.push({
      key: `signal:${signal}`,
      label: `Signal: ${opt?.label || TRIAGE_DEFS[signal]?.label || signal}`,
      clear: { signalTypes: filters.signalTypes.filter((s) => s !== signal) },
    });
  });
  filters.tags.forEach((tag) => {
    chips.push({
      key: `tag:${tag}`,
      label: `Tag: ${tag}`,
      clear: { tags: filters.tags.filter((t) => t !== tag) },
    });
  });
  if (filters.assignee) {
    const value = filters.assignee === '__unassigned__' ? 'Unassigned' : filters.assignee;
    chips.push({ key: 'assignee', label: `Assignee: ${value}`, clear: { assignee: '' } });
  }
  if (filters.dateFrom || filters.dateTo) {
    chips.push({
      key: 'created',
      label: `Created: ${filters.dateFrom || '…'} – ${filters.dateTo || '…'}`,
      clear: { dateFrom: '', dateTo: '' },
    });
  }

  return chips;
}

const FILTER_PILL =
  'h-10 border border-border bg-background shadow-none hover:bg-muted/60 focus-visible:border-[var(--acc)] focus-visible:ring-2 focus-visible:ring-[var(--acc-ring)]';

function filterPillActive(active) {
  return active
    ? 'border-[var(--acc)]/35 bg-[var(--acc-d)] text-foreground hover:bg-[var(--acc-d2)]'
    : '';
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[12px] text-foreground">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onRemove}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function CreatedRangePicker({ dateFrom, dateTo, onChange }) {
  const active = !!(dateFrom || dateTo);
  const label = active ? `${dateFrom || '…'} – ${dateTo || '…'}` : 'Created Date';

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'inline-flex h-10 w-fit shrink-0 items-center justify-between gap-1.5 rounded-full px-4 text-sm whitespace-nowrap transition-colors outline-none select-none',
          FILTER_PILL,
          filterPillActive(active),
          active ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-3 p-3">
        <div className="grid gap-1.5">
          <Label htmlFor="queue-date-from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input
            id="queue-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="queue-date-to" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input
            id="queue-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function singleOrAll(list) {
  return list.length === 1 ? list[0] : ALL;
}

export default function QueueClient() {
  const router = useRouter();
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const filters = useStore((s) => s.queueView.filters);
  const page = useStore((s) => s.queueView.page);
  const pageSize = useStore((s) => s.queueView.pageSize);
  const setQueueViewFilters = useStore((s) => s.setQueueViewFilters);
  const setQueueViewPage = useStore((s) => s.setQueueViewPage);
  const setQueueViewPageSize = useStore((s) => s.setQueueViewPageSize);
  const resetQueueViewFilters = useStore((s) => s.resetQueueViewFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedFilterSets, setSavedFilterSets] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [columnsReady, setColumnsReady] = useState(false);

  useEffect(() => {
    setVisibleColumns(loadVisibleColumns());
    setColumnsReady(true);
  }, []);

  function handleVisibleColumnsChange(next) {
    setVisibleColumns(next);
    saveVisibleColumns(next);
  }

  const assigneeOptions = useMemo(() => {
    const set = new Set();
    concerns.forEach((c) => {
      if (c.assignee && c.assignee !== '—') set.add(c.assignee);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [concerns]);

  const statusCounts = { all: concerns.length };
  PRIMARY_STATUS_TABS.forEach(({ key }) => {
    if (key !== 'all') statusCounts[key] = 0;
  });
  concerns.forEach((c) => {
    const key = primaryStatusOf(c);
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  let filtered = concerns.filter((c) => {
    if (filters.status !== 'all' && primaryStatusOf(c) !== filters.status) return false;
    if (!matchesChannel(c.channel, filters.channels)) return false;
    if (filters.severities.length && !filters.severities.includes(c.severity)) return false;
    if (filters.journeys.length && !filters.journeys.some((j) => matchesJourney(c.journey, j))) return false;
    if (filters.sentiments.length && !filters.sentiments.some((s) => matchesSentiment(c.sentiment, s))) return false;
    if (filters.customerTypes.length) {
      const type = customerTypeOf(c);
      if (!type || !filters.customerTypes.includes(type)) return false;
    }
    if (filters.signalTypes.length && !filters.signalTypes.includes(triageInfo(c, problems).cat)) return false;
    if (!matchesTags(c, filters.tags)) return false;
    if (filters.assignee === '__unassigned__') {
      if (c.assignee && c.assignee !== '—') return false;
    } else if (filters.assignee && c.assignee !== filters.assignee) {
      return false;
    }
    const created = createdDate(c);
    if (filters.dateFrom && created && created < filters.dateFrom) return false;
    if (filters.dateTo && created && created > filters.dateTo) return false;
    if (filters.q) {
      const s = (c.id + ' ' + c.customer + ' ' + c.summary).toLowerCase();
      if (!s.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });
  filtered = filtered.sort((a, b) => triageInfo(a, problems).order - triageInfo(b, problems).order);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const currentPage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const chips = activeFilterChips(filters);

  function setSingleList(key, value) {
    setQueueViewFilters({ [key]: value === ALL ? [] : [value] });
  }

  function applyDrawerFilters(draft) {
    setQueueViewFilters({
      severities: [...draft.severities],
      sentiments: [...draft.sentiments],
      channels: [...draft.channels],
      journeys: [...draft.journeys],
      customerTypes: [...draft.customerTypes],
      signalTypes: [...draft.signalTypes],
      tags: [...draft.tags],
      assignee: draft.assignee || '',
      dateFrom: draft.dateFrom,
      dateTo: draft.dateTo,
    });
  }

  function saveNamedFilter(name, draft) {
    setSavedFilterSets((prev) => [...prev, { name, filters: { ...draft } }]);
  }

  return (
    <>
      {/* Filter toolbar: status tabs → search & filters → view / actions */}
      <div className="mb-6 flex flex-col gap-6">
        {/* Row 1 — Status tabs */}
        <Tabs
          value={filters.status}
          onValueChange={(status) => setQueueViewFilters({ status })}
          className="gap-0"
        >
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-x-5 gap-y-1 overflow-visible border-b border-border p-0"
          >
            {PRIMARY_STATUS_TABS.map(({ key, label }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="h-auto flex-none gap-1.5 rounded-none px-0 pb-2.5 text-[13px] font-medium no-underline transition-[color,border-color,font-weight] duration-200 hover:text-foreground data-active:font-bold data-active:text-foreground"
              >
                {label}
                <span className="font-normal text-muted-foreground tabular-nums">
                  ({statusCounts[key] || 0})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filter toolbar — filters row, then Reset / view icons on the next line */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative h-10 w-full max-w-[320px] shrink-0 sm:w-[320px]">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search"
                placeholder="Search"
                className="h-10 border-border bg-background pr-4 pl-10 shadow-none placeholder:text-muted-foreground focus-visible:border-[var(--acc)] focus-visible:ring-2 focus-visible:ring-[var(--acc-ring)]"
                value={filters.q}
                onChange={(e) => setQueueViewFilters({ q: e.target.value })}
              />
            </div>

            <div className="hidden flex-wrap items-center gap-3 md:flex">
              <Select
                variant="pill"
                className={cn('shrink-0', filterPillActive(filters.channels.length > 0))}
                value={singleOrAll(filters.channels)}
                onChange={(v) => setSingleList('channels', v)}
                options={[{ value: ALL, label: 'All Channels' }, ...Object.keys(CHANNEL_ICON)]}
              />
              <Select
                variant="pill"
                className={cn('shrink-0', filterPillActive(filters.severities.length > 0))}
                value={singleOrAll(filters.severities)}
                onChange={(v) => setSingleList('severities', v)}
                options={[{ value: ALL, label: 'All Severities' }, 'critical', 'high', 'medium', 'low']}
              />
              <Select
                variant="pill"
                className={cn('shrink-0', filterPillActive(filters.journeys.length > 0))}
                value={singleOrAll(filters.journeys)}
                onChange={(v) => setSingleList('journeys', v)}
                options={[{ value: ALL, label: 'Journey' }, ...QUICK_JOURNEY_OPTIONS]}
              />
              <Select
                variant="pill"
                className={cn('shrink-0', filterPillActive(filters.sentiments.length > 0))}
                value={singleOrAll(filters.sentiments)}
                onChange={(v) => setSingleList('sentiments', v)}
                options={[{ value: ALL, label: 'Sentiment' }, ...QUICK_SENTIMENT_OPTIONS]}
              />
              <Select
                variant="pill"
                className={cn('shrink-0', filterPillActive(!!filters.assignee))}
                value={filters.assignee || ALL}
                onChange={(v) => setQueueViewFilters({ assignee: v === ALL ? '' : v })}
                options={[
                  { value: ALL, label: 'Assignee' },
                  { value: '__unassigned__', label: 'Unassigned' },
                  ...assigneeOptions,
                ]}
              />
              <CreatedRangePicker
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                onChange={(patch) => setQueueViewFilters(patch)}
              />
            </div>

            {/* Mobile — collapse filters into All Filters drawer */}
            <Button
              type="button"
              variant="outline"
              className={cn('h-10 shadow-none md:hidden', filterPillActive(chips.length > 0))}
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              All Filters
            </Button>
          </div>

          {/* Actions — dedicated row so Reset / column / filter icons never jam with pills */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              onClick={resetQueueViewFilters}
            >
              Reset
            </Button>
            <CustomizeColumnsPopover
              visibleColumns={visibleColumns}
              onChange={handleVisibleColumnsChange}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden size-10 border-border shadow-none hover:bg-muted/60 md:inline-flex"
              aria-label="Advanced filters"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal />
            </Button>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                onRemove={() => setQueueViewFilters(chip.clear)}
              />
            ))}
            <button
              type="button"
              className="text-[12.5px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              onClick={resetQueueViewFilters}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <Card className="gap-0 py-0">
        <QueueTable
          list={pageItems}
          onOpen={(id) => router.push('/queue/' + id)}
          visibleColumns={columnsReady ? visibleColumns : defaultVisibleColumns()}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-4 py-2.5">
          <span
            className="text-[12px] tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {total === 0
              ? '0 of 0 concerns'
              : `${rangeStart}–${rangeEnd} of ${total} concerns`}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span>Rows per page:</span>
              <span className="relative inline-flex">
                <select
                  aria-label="Rows per page"
                  className="h-8 appearance-none rounded-md border border-transparent bg-muted py-0 pl-3 pr-8 text-[12px] leading-none text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={pageSize}
                  onChange={(e) => setQueueViewPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
              </span>
            </label>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shadow-none"
                aria-label="First page"
                disabled={currentPage <= 1}
                onClick={() => setQueueViewPage(1)}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shadow-none"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setQueueViewPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      'size-8 shadow-none tabular-nums',
                      !isActive && 'text-muted-foreground'
                    )}
                    aria-label={`Page ${pageNum}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setQueueViewPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shadow-none"
                aria-label="Next page"
                disabled={currentPage >= totalPages || total === 0}
                onClick={() => setQueueViewPage(Math.min(totalPages, currentPage + 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shadow-none"
                aria-label="Last page"
                disabled={currentPage >= totalPages || total === 0}
                onClick={() => setQueueViewPage(totalPages)}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AllFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={applyDrawerFilters}
        onSaveNamed={saveNamedFilter}
        assigneeOptions={assigneeOptions}
      />
    </>
  );
}
