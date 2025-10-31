'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Dumbbell, Calendar, BarChart3, History } from 'lucide-react';

export function HomeDashboard() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center space-x-2">
            <span>LiftIQ</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and optimize your training
          </p>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Log a Workout */}
        <Card className="cursor-pointer border-2 hover:bg-muted/50 transition-colors">
          <CardContent className="pt-4 md:pt-6">
            <Button
              variant="ghost"
              className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center space-y-2 md:space-y-4 hover:bg-transparent hover:text-foreground"
              onClick={() => router.push('/dashboard?view=freestyle')}
            >
              <div className="p-2 md:p-4 rounded-full bg-primary/10">
                <Dumbbell className="h-8 w-8 md:h-12 md:w-12 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Log a Workout</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Record your workout as you go
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Workout Splits */}
        <Card className="cursor-pointer border-2 hover:bg-muted/50 transition-colors">
          <CardContent className="pt-4 md:pt-6">
            <Button
              variant="ghost"
              className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center space-y-2 md:space-y-4 hover:bg-transparent hover:text-foreground"
              onClick={() => router.push('/dashboard?view=splits')}
            >
              <div className="p-2 md:p-4 rounded-full bg-accent/10">
                <Calendar className="h-8 w-8 md:h-12 md:w-12 text-accent" />
              </div>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Workout Splits</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Create and manage your workout programs
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Past Lifts */}
        <Card className="cursor-pointer border-2 hover:bg-muted/50 transition-colors">
          <CardContent className="pt-4 md:pt-6">
            <Button
              variant="ghost"
              className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center space-y-2 md:space-y-4 hover:bg-transparent hover:text-foreground"
              onClick={() => router.push('/dashboard?view=history')}
            >
              <div className="p-2 md:p-4 rounded-full bg-secondary/10">
                <History className="h-8 w-8 md:h-12 md:w-12 text-foreground dark:text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Past Lifts</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  View your workout history
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="cursor-pointer border-2 hover:bg-muted/50 transition-colors">
          <CardContent className="pt-4 md:pt-6">
            <Button
              variant="ghost"
              className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center space-y-2 md:space-y-4 hover:bg-transparent hover:text-foreground"
              onClick={() => router.push('/dashboard?view=statistics')}
            >
              <div className="p-2 md:p-4 rounded-full bg-primary/10">
                <BarChart3 className="h-8 w-8 md:h-12 md:w-12 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Statistics</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Analyze your progress and gains
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ThemeToggle />
    </div>
  );
}

