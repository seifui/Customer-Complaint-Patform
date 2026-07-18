'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { triageInfo, workflowStatusOf } from '@/lib/helpers';
import { ConcernDetailBody } from './ConcernDetailPanel';
import AssignConcernDrawer from './AssignConcernDrawer';
import CloseConcernDrawer from './CloseConcernDrawer';
import UpdateProgressDrawer from './UpdateProgressDrawer';
import { Button } from '@/components/ui/button';
import { canAssignCloseConcerns, canUpdateConcernProgress } from '@/lib/constants';

export default function ConcernDetailClient({ trackingId, session }) {
  const router = useRouter();
  const concerns = useStore((s) => s.concerns);
  const problems = useStore((s) => s.problems);
  const c = concerns.find((x) => x.id === trackingId);
  const [openDrawer, setOpenDrawer] = useState(null); // 'assign' | 'close' | 'progress' | null

  if (!c) {
    return (
      <div>
        <Button variant="outline" size="sm" className="mb-4" onClick={() => router.push('/queue')}>
          <ArrowLeft className="size-3.5" /> Back
        </Button>
        <div className="px-5 py-10 text-center text-muted-foreground">
          <div className="text-xs">Concern not found.</div>
        </div>
      </div>
    );
  }

  const isClosed = workflowStatusOf(c) === 'closed';
  const canAssign = canAssignCloseConcerns(session?.role) && !isClosed;
  const canClose = canAssignCloseConcerns(session?.role) && !isClosed;
  const canProgress = canUpdateConcernProgress(session?.role) && !isClosed;

  const pageActions = (canAssign || canClose || canProgress) ? (
    <div className="flex flex-wrap items-center gap-2">
      {canProgress && (
        <Button onClick={() => setOpenDrawer('progress')}>Update Progress</Button>
      )}
      {canAssign && (
        <Button variant="outline" onClick={() => setOpenDrawer('assign')}>Assign</Button>
      )}
      {canClose && (
        <Button variant="outline" onClick={() => setOpenDrawer('close')}>Close Concern</Button>
      )}
    </div>
  ) : null;

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/queue')}>
          <ArrowLeft className="size-3.5" /> Back
        </Button>
        {pageActions}
      </div>

      <ConcernDetailBody
        c={c}
        session={session}
        layout="page"
        tri={triageInfo(c, problems)}
        linkedProblem={c.linked ? problems.find((p) => p.id === c.linked) : null}
        goToProblem={() => router.push('/problems/' + c.linked)}
      />

      <UpdateProgressDrawer
        c={c}
        session={session}
        open={openDrawer === 'progress'}
        onClose={() => setOpenDrawer(null)}
      />
      <AssignConcernDrawer
        c={c}
        session={session}
        open={openDrawer === 'assign'}
        onClose={() => setOpenDrawer(null)}
      />
      <CloseConcernDrawer
        c={c}
        session={session}
        open={openDrawer === 'close'}
        onClose={() => setOpenDrawer(null)}
      />
    </div>
  );
}
