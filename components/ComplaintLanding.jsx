'use client';

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import ReportConcernFlow from './ReportConcernFlow';
import TrackMyConcerns from './TrackMyConcerns';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function ComplaintLanding() {
  const [mode, setMode] = useState('report'); // report | track
  const [trackPrefill, setTrackPrefill] = useState(null); // { id } | null

  function goToTab(next) {
    setTrackPrefill(null);
    setMode(next);
  }

  function trackConcern(id) {
    setTrackPrefill({ id });
    setMode('track');
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-background">
      <div className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center border-b bg-background px-7">
        <Logo size={30} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={() => goToTab(mode === 'report' ? 'track' : 'report')}>
            {mode === 'report' ? 'Track My Concerns' : 'Report a Concern'}
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-7 py-12">
        <div className="max-w-[600px] text-center">
          <h1 className="mb-2.5 text-4xl font-semibold tracking-tight text-balance text-foreground">{greeting()}. What&apos;s going on?</h1>
          <p className="text-[14.5px] leading-relaxed text-muted-foreground">
            Tell us what happened, or check the status of a concern you&apos;ve already reported.
          </p>
        </div>

        <div className="w-full max-w-[640px]">
          {mode === 'report' && <ReportConcernFlow onTrackConcern={trackConcern} />}
          {mode === 'track' && <TrackMyConcerns initialTicket={trackPrefill?.id} />}
        </div>
      </div>

      <div className="border-t px-7 py-8 text-center text-[12.5px] text-muted-foreground">
        © 2026 Concerns AI. Every concern, understood and resolved.
      </div>
    </div>
  );
}
