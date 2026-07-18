'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { customerStatusLabel, friendlyStatus } from '@/lib/helpers';
import { SevBadge } from './Badges';
import SlidePanel from './SlidePanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FindMyConcerns() {
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [openId, setOpenId] = useState(null);

  function search(e) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    setSearched(true);
    if (!q) {
      setResults([]);
      return;
    }
    setResults(concerns.filter((c) => c.nic && c.nic.trim().toLowerCase() === q));
  }

  const openConcern = openId ? concerns.find((c) => c.id === openId) : null;
  const openProblem = openConcern?.linked ? problems.find((p) => p.id === openConcern.linked) : null;

  return (
    <div>
      <form onSubmit={search} className="mb-1 flex gap-2">
        <Input placeholder="Enter your NIC or Passport number" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" className="shrink-0">Search</Button>
      </form>
      <p className="mb-4 text-[11px] text-muted-foreground">
        We&apos;ll show every concern submitted with this NIC or Passport number.
      </p>

      {searched && results.length === 0 && (
        <div className="rounded-lg border bg-orange-500/10 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-orange-700 dark:text-orange-400">
          We couldn&apos;t find any concerns for that NIC or Passport number.
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {results.map((c) => (
            <div
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3.5 transition-colors hover:bg-muted"
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(c.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenId(c.id);
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="font-mono text-[12.5px] font-semibold">{c.id}</div>
                  <div className="flex gap-1.5">
                    {c.severity && <SevBadge s={c.severity} />}
                    <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
                      {customerStatusLabel(c, c.linked ? problems.find((p) => p.id === c.linked) : null)}
                    </Badge>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {c.journey} · Submitted {c.createdAt.slice(0, 10)} · Last updated {c.createdAt.slice(0, 10)}
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}

      <SlidePanel open={!!openConcern} onClose={() => setOpenId(null)} title={openConcern?.id || ''}>
        {openConcern && (
          <div>
            <div className="mb-4.5 rounded-lg border bg-muted px-3.5 py-3">
              <div className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Your message</div>
              <div className="text-xs leading-relaxed text-foreground/80 italic">&ldquo;{openConcern.raw}&rdquo;</div>
            </div>

            <div className="mb-3 font-heading text-xs font-semibold">Progress</div>
            <div className="flex items-start gap-3 border-b py-3.5">
              <div className="mt-1 size-2 shrink-0 rounded-full bg-green-500" />
              <div>
                <div className="text-[12.5px] font-semibold">Received</div>
                <div className="text-[11px] text-muted-foreground">{openConcern.createdAt}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b py-3.5">
              <div className={'mt-1 size-2 shrink-0 rounded-full ' + (openConcern.linked ? 'bg-green-500' : 'bg-muted-foreground/30')} />
              <div className="text-[12.5px] leading-relaxed">
                {openConcern.linked ? 'Connected to a known issue our team is tracking.' : 'Reviewed individually by our team.'}
              </div>
            </div>
            <div className="flex items-start gap-3 py-3.5">
              <div className={'mt-1 size-2 shrink-0 rounded-full ' + (openConcern.workflowStatus === 'closed' || openProblem?.status === 'resolved' ? 'bg-green-500' : 'bg-muted-foreground/30')} />
              <div className="text-[12.5px] leading-relaxed">{friendlyStatus(openConcern, openProblem)}</div>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
