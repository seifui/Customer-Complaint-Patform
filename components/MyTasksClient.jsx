'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import TaskCard from './TaskCard';
import TaskUpdateModal from './TaskUpdateModal';

export default function MyTasksClient({ session }) {
  const actions = useStore((s) => s.actions);
  const [openTaskId, setOpenTaskId] = useState(null);
  const mine = actions.filter((a) => a.owner === session.name);

  return (
    <>
      <div className="card">
        <div className="section-title">
          Assigned to {session.name} <span className="section-hint">{mine.length} interventions — is each one actually working?</span>
        </div>
        {mine.length ? (
          mine.map((a) => <TaskCard a={a} key={a.id} onOpen={setOpenTaskId} />)
        ) : (
          <div className="empty"><div className="empty-t">No interventions assigned yet.</div></div>
        )}
      </div>
      <TaskUpdateModal taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}
