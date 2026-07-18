'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { friendlyStatus } from '@/lib/helpers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TrackByTicket({ initialQuery = '', autoSearch = false }) {
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const [query, setQuery] = useState(initialQuery);
  const [searched, setSearched] = useState(autoSearch);
  const [found, setFound] = useState(() => (
    autoSearch ? concerns.find((x) => x.id.toLowerCase() === initialQuery.trim().toLowerCase()) || null : null
  ));

  function lookup(e) {
    e.preventDefault();
    setSearched(true);
    const c = concerns.find((x) => x.id.toLowerCase() === query.trim().toLowerCase());
    setFound(c || null);
  }

  const linkedProblem = found?.linked ? problems.find((p) => p.id === found.linked) : null;

  return (
    <div>
      <form onSubmit={lookup} className="mb-1 flex gap-2">
        <Input placeholder="e.g. CH-00128" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" className="shrink-0">Check</Button>
      </form>
      <p className="mb-4 text-[11px] text-muted-foreground">Enter the reference number you received when you reported your concern.</p>

      {searched && !found && (
        <div className="rounded-lg border bg-orange-500/10 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-orange-700 dark:text-orange-400">
          We couldn&apos;t find a report with that reference number. Double-check it and try again.
        </div>
      )}

      {found && (
        <div>
          <div className="flex items-start gap-3 border-b py-3.5">
            <div className="mt-1 size-2 shrink-0 rounded-full bg-foreground" />
            <div>
              <div className="text-[12.5px] font-semibold">{found.id}</div>
              <div className="text-[11px] text-muted-foreground">Reported {found.createdAt}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 py-3.5">
            <div className="mt-1 size-2 shrink-0 rounded-full bg-foreground" />
            <div className="text-[12.5px] leading-relaxed">{friendlyStatus(found, linkedProblem)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
