'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import TaskCard from './TaskCard';
import TaskUpdateModal from './TaskUpdateModal';
import { Card } from '@/components/ui/card';

export default function MyTasksClient({ session }) {
  const actions = useStore((s) => s.actions);
  const [openTaskId, setOpenTaskId] = useState(null);
  const mine = actions.filter((a) => a.owner === session.name);

  return (
    <>
      <Card className="px-4.5">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold">
          Assigned to {session.name} <span className="text-[11px] font-normal text-muted-foreground">{mine.length} interventions — is each one actually working?</span>
        </div>
        {mine.length ? (
          mine.map((a) => <TaskCard a={a} key={a.id} onOpen={setOpenTaskId} />)
        ) : (
          <div className="px-5 py-10 text-center text-muted-foreground"><div className="text-xs">No interventions assigned yet.</div></div>
        )}
      </Card>
      <TaskUpdateModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}
