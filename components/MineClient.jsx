'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function RaisedConcernsEmptyState() {
  return (
    <div className="py-6">
      <p className="text-sm font-medium text-foreground">No concerns found</p>
      <p className="mt-1 text-[12.5px] text-muted-foreground">Try another search or raise a new concern.</p>
    </div>
  );
}

export default function MineClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const openCaptureDrawer = useStore((s) => s.openCaptureDrawer);
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState('');
  const mine = concerns.filter((c) => c.demoRaisedConcerns || c.createdBy === session.role);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? mine.filter((c) => (c.id + ' ' + c.customer + ' ' + c.journey + ' ' + c.summary).toLowerCase().includes(q))
    : mine;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <div className="relative w-[300px] max-w-full shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 w-full pl-10"
            placeholder="Search concerns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button className="h-11 w-[175px] shrink-0" onClick={openCaptureDrawer}>
          <Plus data-icon="inline-start" />
          Raise Concern
        </Button>
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b px-4 py-3 text-[11px] text-muted-foreground">Showing {filtered.length} Concerns</div>
        <QueueTable list={filtered} onOpen={setOpenId} emptyState={<RaisedConcernsEmptyState />} />
      </Card>
      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </>
  );
}
