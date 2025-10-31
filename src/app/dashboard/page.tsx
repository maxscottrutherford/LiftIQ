'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { WorkoutSplitDashboard } from "@/components/dashboard/WorkoutSplitDashboard";
import { StatisticsDashboard } from "@/components/dashboard/StatisticsDashboard";
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  return (
    <main className="min-h-screen bg-background">
      <div className="py-8 px-4 sm:px-6 lg:px-8 pb-16">
        {view === 'splits' || view === 'session' || view === 'session-details' || view === 'freestyle' || view === 'history' ? (
          <WorkoutSplitDashboard initialView={view as any} />
        ) : view === 'statistics' ? (
          <StatisticsDashboard />
        ) : (
          <HomeDashboard />
        )}
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <div className="py-8 px-4 sm:px-6 lg:px-8 pb-16 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}

