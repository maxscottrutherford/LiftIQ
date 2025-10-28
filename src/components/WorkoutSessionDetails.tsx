'use client';

import { WorkoutSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatSessionDuration, formatRestTime } from '@/lib/workout-utils';
import { ThemeToggle } from './ThemeToggle';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Weight,
  Repeat,
  Timer
} from 'lucide-react';

interface WorkoutSessionDetailsProps {
  session: WorkoutSession;
  onBack: () => void;
}

export function WorkoutSessionDetails({ session, onBack }: WorkoutSessionDetailsProps) {
  const completedSets = session.exerciseLogs.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  );
  const totalSets = session.exerciseLogs.reduce((total, exercise) => 
    total + exercise.sets.length, 0
  );
  const progressPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const getTotalVolume = () => {
    return session.exerciseLogs.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        if (set.completed && set.weight && set.reps) {
          return exerciseTotal + (set.weight * set.reps);
        }
        return exerciseTotal;
      }, 0);
    }, 0);
  };

  const getMaxWeight = () => {
    let maxWeight = 0;
    session.exerciseLogs.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed && set.weight && set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    });
    return maxWeight;
  };

  const getAverageRPE = () => {
    const rpeValues = session.exerciseLogs.flatMap(exercise => 
      exercise.sets.filter(set => set.completed && set.rpe).map(set => set.rpe!)
    );
    return rpeValues.length > 0 
      ? Math.round(rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length * 10) / 10
      : null;
  };

  const getAverageRIR = () => {
    const rirValues = session.exerciseLogs.flatMap(exercise => 
      exercise.sets.filter(set => set.completed && set.rir !== undefined).map(set => set.rir!)
    );
    return rirValues.length > 0 
      ? Math.round(rirValues.reduce((sum, rir) => sum + rir, 0) / rirValues.length * 10) / 10
      : null;
  };

  const totalVolume = getTotalVolume();
  const maxWeight = getMaxWeight();
  const avgRPE = getAverageRPE();
  const avgRIR = getAverageRIR();

  // Determine which stats cards to show
  const hasRPE = avgRPE !== null;
  const hasRIR = avgRIR !== null;
  const statsCards = [
    { key: 'sets', component: (
      <Card key="sets">
        <CardContent className="pt-4 pb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{completedSets}/{totalSets}</p>
            <p className="text-xs text-muted-foreground">Sets Completed</p>
          </div>
        </CardContent>
      </Card>
    )},
    { key: 'volume', component: (
      <Card key="volume">
        <CardContent className="pt-4 pb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-accent">{totalVolume.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Volume (lbs)</p>
          </div>
        </CardContent>
      </Card>
    )},
    { key: 'maxWeight', component: (
      <Card key="maxWeight">
        <CardContent className="pt-4 pb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-success">{maxWeight}</p>
            <p className="text-xs text-muted-foreground">Max Weight (lbs)</p>
          </div>
        </CardContent>
      </Card>
    )},
    ...(hasRPE ? [{ key: 'rpe', component: (
      <Card key="rpe">
        <CardContent className="pt-4 pb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-secondary">{avgRPE}</p>
            <p className="text-xs text-muted-foreground">Avg RPE</p>
          </div>
        </CardContent>
      </Card>
    )}] : []),
    ...(hasRIR ? [{ key: 'rir', component: (
      <Card key="rir">
        <CardContent className="pt-4 pb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-muted-foreground">{avgRIR}</p>
            <p className="text-xs text-muted-foreground">Avg RIR</p>
          </div>
        </CardContent>
      </Card>
    )}] : [])
  ];

  const totalCards = statsCards.length;
  const getGridCols = () => {
    if (totalCards <= 3) return 'grid-cols-2 md:grid-cols-3';
    if (totalCards === 4) return 'grid-cols-2 md:grid-cols-4';
    return 'grid-cols-2 md:grid-cols-5';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.dayName}</h1>
            <p className="text-muted-foreground">{session.splitName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(session.completedAt || session.startedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatSessionDuration(session.totalDuration || 0)}</span>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className={`grid gap-3 ${getGridCols()}`}>
        {statsCards.map(({ component }) => component)}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  session.status === 'completed' ? 'bg-success' : 'bg-primary'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Details */}
      <div className="space-y-4">
        
        <h2 className="text-xl font-semibold">Exercise Details</h2>
        {/* Session Notes */}
        {session.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{session.notes}</p>
            </CardContent>
          </Card>
        )}
        {session.exerciseLogs.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
              {exercise.notes && (
                <p className="text-sm text-muted-foreground">{exercise.notes}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exercise.sets.map((set, index) => (
                  <div
                    key={set.id}
                    className={`flex items-center p-3 rounded-lg border ${
                      set.completed 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    {/* Set Number */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3 shrink-0 ${
                      set.completed 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {set.setNumber}
                    </div>

                    {/* Set Info */}
                    <div className="flex-1 min-w-0">
                      {set.completed ? (
                        <div className="space-y-2">
                          {/* Set Type */}
                          <div>
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                              set.type === 'warmup' 
                                ? 'bg-accent/20 text-accent' 
                                : 'bg-primary/20 text-primary'
                            }`}>
                              {set.type === 'warmup' ? 'Warmup' : 'Working'}
                            </span>
                          </div>
                          
                          {/* Set Data */}
                          <div className="flex flex-wrap gap-2 text-sm">
                            {set.weight !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Weight className="h-4 w-4" />
                                <span>{set.weight} lbs</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Repeat className="h-4 w-4" />
                              <span>{set.reps} reps</span>
                            </div>
                            {set.rpe && (
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>RPE {set.rpe}</span>
                              </div>
                            )}
                            {set.rir !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Timer className="h-4 w-4" />
                                <span>RIR {set.rir}</span>
                              </div>
                            )}
                            {set.restTime && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatRestTime(set.restTime)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Not completed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ThemeToggle />
    </div>
  );
}
