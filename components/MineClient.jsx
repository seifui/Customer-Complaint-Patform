'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import QueueTable from './QueueTable';
import ConcernDetailPanel from './ConcernDetailPanel';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MineClient({ session }) {
  const concerns = useStore((s) => s.concerns);
  const openCaptureDrawer = useStore((s) => s.openCaptureDrawer);
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState('');
  const mine = concerns.filter((c) => c.createdBy === session.role);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? mine.filter((c) => (c.id + ' ' + c.customer + ' ' + c.journey + ' ' + c.summary).toLowerCase().includes(q))
    : mine;

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Input
          className="flex-1"
          placeholder="Search by Tracking ID, Customer Name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={openCaptureDrawer}>Raise Concern</Button>
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b px-4 py-3 text-[11px] text-muted-foreground">Showing {filtered.length} Concerns</div>
        <QueueTable list={filtered} onOpen={setOpenId} />
      </Card>
      <ConcernDetailPanel concernId={openId} onClose={() => setOpenId(null)} session={session} />
    </>
  );
}
