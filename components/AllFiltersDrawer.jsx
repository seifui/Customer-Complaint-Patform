'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import SlidePanel from './SlidePanel';
import Select from './Select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ALL_ASSIGNEE = '__all__';

export const DRAWER_SEVERITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const DRAWER_SENTIMENTS = [
  { value: 'angry', label: 'Angry' },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positive' },
];

export const DRAWER_CHANNELS = [
  'Call Centre',
  'Branch',
  'Email',
  'Digital App',
  'WhatsApp',
  'Social Media',
  'App Review',
];

export const DRAWER_JOURNEYS = [
  { value: 'Money Transfer', label: 'Money Transfer' },
  { value: 'KYC-Onboarding', label: 'KYC-Onboarding' },
  { value: 'Cards', label: 'Cards' },
  { value: 'Loans', label: 'Loans' },
  { value: 'Standing Orders', label: 'Standing Orders' },
  { value: 'Digital Banking', label: 'Digital Banking' },
];

export const DRAWER_CUSTOMER_TYPES = [
  { value: 'new', label: 'New' },
  { value: 'existing', label: 'Existing' },
];

export const DRAWER_SIGNAL_TYPES = [
  { value: 'urgent-individual', label: 'Urgent Individual Case' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'new-pattern', label: 'New Pattern Emerging' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'spike', label: 'Spike' },
  { value: 'needs-review', label: 'Needs Human Review' },
  { value: 'raised-new', label: 'New' },
  { value: 'duplicate', label: 'Possible Duplicate/Noise' },
  { value: 'connected', label: 'Connected to Known Problem' },
  { value: 'not-a-concern', label: 'Not a Concern' },
];

export function emptyDrawerDraft() {
  return {
    severities: [],
    sentiments: [],
    channels: [],
    journeys: [],
    customerTypes: [],
    signalTypes: [],
    assignee: '',
    dateFrom: '',
    dateTo: '',
    tags: [],
  };
}

export function filtersToDrawerDraft(filters) {
  return {
    severities: [...(filters.severities || [])],
    sentiments: [...(filters.sentiments || [])],
    channels: [...(filters.channels || [])],
    journeys: [...(filters.journeys || [])],
    customerTypes: [...(filters.customerTypes || [])],
    signalTypes: [...(filters.signalTypes || [])],
    assignee: filters.assignee || '',
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    tags: [...(filters.tags || [])],
  };
}

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterSection({ title, children }) {
  return (
    <section className="border-b py-4 last:border-b-0">
      <div className="mb-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{title}</div>
      {children}
    </section>
  );
}

function CheckboxRow({ checked, label, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span>{label}</span>
    </label>
  );
}

function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState('');

  function addTag(raw) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '_');
    if (!tag) return;
    if (tags.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...tags, tag]);
    setDraft('');
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Type a tag and press Enter"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(draft);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => addTag(draft)}>
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-7 items-center gap-1 rounded-full bg-muted px-2.5 text-[12px]"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AllFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
  onSaveNamed,
  assigneeOptions = [],
}) {
  const [draft, setDraft] = useState(emptyDrawerDraft);
  const [naming, setNaming] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(filtersToDrawerDraft(filters));
      setNaming(false);
      setSaveName('');
    }
  }, [open, filters]);

  function patch(partial) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function handleCancel() {
    setNaming(false);
    setSaveName('');
    onClose();
  }

  function handleApply() {
    onApply(draft);
    setNaming(false);
    setSaveName('');
    onClose();
  }

  function handleSaveNamed() {
    const name = saveName.trim();
    if (!name) return;
    onSaveNamed?.(name, draft);
    setNaming(false);
    setSaveName('');
  }

  const footer = (
    <div className="flex w-full flex-col gap-3">
      {naming && (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Name this filter set…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveNamed();
              }
            }}
          />
          <Button type="button" variant="secondary" disabled={!saveName.trim()} onClick={handleSaveNamed}>
            Save
          </Button>
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={() => setNaming((v) => !v)}>
          Save as…
        </Button>
        <Button type="button" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <SlidePanel open={open} onClose={handleCancel} title="All Filters" footer={footer} width="28rem">
      <FilterSection title="Severity">
        <div className="space-y-0.5">
          {DRAWER_SEVERITIES.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.severities.includes(opt.value)}
              onChange={() => patch({ severities: toggleValue(draft.severities, opt.value) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Sentiment">
        <div className="space-y-0.5">
          {DRAWER_SENTIMENTS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.sentiments.includes(opt.value)}
              onChange={() => patch({ sentiments: toggleValue(draft.sentiments, opt.value) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Channel">
        <div className="space-y-0.5">
          {DRAWER_CHANNELS.map((channel) => (
            <CheckboxRow
              key={channel}
              label={channel}
              checked={draft.channels.includes(channel)}
              onChange={() => patch({ channels: toggleValue(draft.channels, channel) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Journey">
        <div className="space-y-0.5">
          {DRAWER_JOURNEYS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.journeys.includes(opt.value)}
              onChange={() => patch({ journeys: toggleValue(draft.journeys, opt.value) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Assignee">
        <Select
          value={draft.assignee || ALL_ASSIGNEE}
          onChange={(v) => patch({ assignee: v === ALL_ASSIGNEE ? '' : v })}
          options={[
            { value: ALL_ASSIGNEE, label: 'All assignees' },
            { value: '__unassigned__', label: 'Unassigned' },
            ...assigneeOptions,
          ]}
        />
      </FilterSection>

      <FilterSection title="Customer Type">
        <div className="space-y-0.5">
          {DRAWER_CUSTOMER_TYPES.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.customerTypes.includes(opt.value)}
              onChange={() => patch({ customerTypes: toggleValue(draft.customerTypes, opt.value) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Signal Type">
        <div className="space-y-0.5">
          {DRAWER_SIGNAL_TYPES.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              checked={draft.signalTypes.includes(opt.value)}
              onChange={() => patch({ signalTypes: toggleValue(draft.signalTypes, opt.value) })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Created Date">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="all-filters-date-from" className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id="all-filters-date-from"
              type="date"
              value={draft.dateFrom}
              onChange={(e) => patch({ dateFrom: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="all-filters-date-to" className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id="all-filters-date-to"
              type="date"
              value={draft.dateTo}
              onChange={(e) => patch({ dateTo: e.target.value })}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Tags">
        <TagInput tags={draft.tags} onChange={(tags) => patch({ tags })} />
      </FilterSection>
    </SlidePanel>
  );
}
