'use client';

import { useState } from 'react';
import TrackByTicket from './TrackByTicket';
import FindMyConcerns from './FindMyConcerns';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TrackMyConcerns({ initialTicket }) {
  const [subTab, setSubTab] = useState('ticket');

  return (
    <Card>
      <CardContent>
        <Tabs value={subTab} onValueChange={setSubTab} className="mb-5 gap-0">
          <TabsList variant="line" className="h-auto w-full justify-start gap-5 border-b p-0">
            <TabsTrigger value="ticket" className="h-auto flex-none px-0 pb-2.5">Search by Ticket</TabsTrigger>
            <TabsTrigger value="nic" className="h-auto flex-none px-0 pb-2.5">Search by NIC / Passport</TabsTrigger>
          </TabsList>
        </Tabs>
        {subTab === 'ticket' && <TrackByTicket initialQuery={initialTicket || ''} autoSearch={!!initialTicket} />}
        {subTab === 'nic' && <FindMyConcerns />}
      </CardContent>
    </Card>
  );
}
