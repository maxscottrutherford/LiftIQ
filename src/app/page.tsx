import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkoutSplitDashboard } from "@/components/WorkoutSplitDashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="py-8 px-4 sm:px-6 lg:px-8 pb-16">
        <WorkoutSplitDashboard />
      </div>
    </main>
  );
}
