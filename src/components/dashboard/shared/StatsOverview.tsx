import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkoutSplit } from '@/lib/types';

interface StatsOverviewProps {
  splits: WorkoutSplit[];
}

export function StatsOverview({ splits }: StatsOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (splits.length === 0) return null;

  const totalDays = splits.reduce((total, split) => total + split.days.length, 0);
  const totalExercises = splits.reduce((total, split) => 
    total + split.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0
  );
  const avgExercisesPerDay = totalDays > 0 
    ? Math.round(totalExercises / totalDays)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Statistics</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Hide Stats</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show Stats</span>
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{splits.length}</p>
                <p className="text-sm text-muted-foreground">Total Splits</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{totalDays}</p>
                <p className="text-sm text-muted-foreground">Workout Days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{totalExercises}</p>
                <p className="text-sm text-muted-foreground">Total Exercises</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{avgExercisesPerDay}</p>
                <p className="text-sm text-muted-foreground">Avg Exercises/Day</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

