import { WorkoutSplitDashboard } from "@/components/WorkoutSplitDashboard"

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-background">
      <div className="py-8 px-4 sm:px-6 lg:px-8 pb-16">
        <WorkoutSplitDashboard />
      </div>
    </main>
  );
}

