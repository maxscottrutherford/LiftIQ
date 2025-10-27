'use client';

import { useState, useEffect } from 'react';
import { WorkoutSplit, WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  createWorkoutSession, 
  calculateSessionProgress, 
  getCurrentExerciseAndSet,
  completeWorkoutSession,
  formatSessionDuration
} from '@/lib/workout-utils';
import { ThemeToggle } from './ThemeToggle';
import { 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  Save,
  Timer
} from 'lucide-react';

interface WorkoutSessionManagerProps {
  split: WorkoutSplit;
  dayId: string;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
  previousSessions?: WorkoutSession[];
}

export function WorkoutSessionManager({ split, dayId, onComplete, onCancel, previousSessions = [] }: WorkoutSessionManagerProps) {
  // Initialize session on mount
  const [session, setSession] = useState<WorkoutSession | null>(() => createWorkoutSession(split, dayId));
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time for duration display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Loading workout session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateSessionProgress(session);
  const currentPosition = getCurrentExerciseAndSet(session);
  const currentExercise = currentPosition ? session.exerciseLogs[currentPosition.exerciseIndex] : null;
  const currentSet = currentPosition && currentExercise ? currentExercise.sets[currentPosition.setIndex] : null;
  
  // Get original exercise data for rep range
  const originalExercise = currentExercise ? split.days.find(d => d.id === dayId)?.exercises.find(e => e.id === currentExercise.exerciseId) : null;
  
  // Helper function to get original exercise for any exercise log
  const getOriginalExercise = (exerciseLog: ExerciseLog) => {
    return split.days.find(d => d.id === dayId)?.exercises.find(e => e.id === exerciseLog.exerciseId);
  };

  // Get most recent working set data for current exercise
  const getMostRecentWorkingSet = (exerciseId: string) => {
    // Find the most recent session for this split/day
    const relevantSessions = previousSessions
      .filter(s => s.splitId === split.id && s.dayId === dayId && s.status === 'completed')
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
    
    if (relevantSessions.length === 0) return null;
    
    // Find the exercise in the most recent session
    const mostRecentSession = relevantSessions[0];
    const exerciseLog = mostRecentSession.exerciseLogs.find(e => e.exerciseId === exerciseId);
    
    if (!exerciseLog) return null;
    
    // Find the last completed working set
    const workingSets = exerciseLog.sets.filter(s => s.type === 'working' && s.completed);
    if (workingSets.length === 0) return null;
    
    return workingSets[workingSets.length - 1]; // Most recent working set
  };

  const handleCompleteSet = (exerciseIndex: number, setIndex: number, setData: Partial<SetLog>) => {
    setSession(prev => {
      if (!prev) return prev;
      
      const updatedExerciseLogs = [...prev.exerciseLogs];
      const updatedExercise = { ...updatedExerciseLogs[exerciseIndex] };
      const updatedSets = [...updatedExercise.sets];
      const updatedSet = { 
        ...updatedSets[setIndex], 
        ...setData, 
        completed: true,
        completedAt: new Date()
      };
      
      updatedSets[setIndex] = updatedSet;
      updatedExercise.sets = updatedSets;
      updatedExerciseLogs[exerciseIndex] = updatedExercise;
      
      return {
        ...prev,
        exerciseLogs: updatedExerciseLogs
      };
    });
  };

  const handleStartRest = (restTimeMinutes: number) => {
    setIsResting(true);
    setRestTimeRemaining(Math.round(restTimeMinutes * 60)); // Convert to seconds
  };

  const handleCompleteSession = () => {
    const completedSession = {
      ...completeWorkoutSession(session),
      notes: sessionNotes.trim() || undefined
    };
    onComplete(completedSession);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.dayName}</h1>
            <p className="text-muted-foreground">{session.splitName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            {formatSessionDuration(Math.round((currentTime - session.startedAt.getTime()) / (1000 * 60)))}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.completed}/{progress.total} sets ({progress.percentage}%)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer */}
      {isResting && (
        <Card className="border-accent">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Timer className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-semibold">Rest Time</h3>
              </div>
              <div className="text-4xl font-bold text-accent">
                {formatTime(restTimeRemaining)}
              </div>
              <Button 
                onClick={() => setIsResting(false)}
                variant="outline"
                className="w-full"
              >
                Skip Rest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      {currentExercise && currentSet && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-xl">{currentExercise.exerciseName}</CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Set {currentSet.setNumber} of {currentExercise.sets.length} • {currentSet.type === 'warmup' ? 'Warmup' : 'Working'}
              </p>
              {originalExercise?.repRange && (
                <div className="text-xs bg-muted px-2 py-1 rounded-md">
                  Target: {originalExercise.repRange.min}-{originalExercise.repRange.max} reps
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Most Recent Working Set */}
            {currentExercise && getMostRecentWorkingSet(currentExercise.exerciseId) && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Last Time</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.weight ? 
                        `${getMostRecentWorkingSet(currentExercise.exerciseId)!.weight} lbs` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reps:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.reps || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RPE:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.rpe || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RIR:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.rir || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <SetLoggingForm
              set={currentSet}
              exercise={currentExercise}
              onComplete={(setData) => handleCompleteSet(
                currentPosition!.exerciseIndex, 
                currentPosition!.setIndex, 
                setData
              )}
              onStartRest={handleStartRest}
            />
          </CardContent>
        </Card>
      )}

      {/* Session Complete */}
      {!currentPosition && (
        <Card className="border-success">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Great job! You&apos;ve completed all exercises in this workout.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionNotes">Session Notes (Optional)</Label>
                <Textarea
                  id="sessionNotes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="How did the workout feel? Any notes..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleCompleteSession}
                className="w-full"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Complete Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {session.exerciseLogs.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{exercise.exerciseName}</h4>
                    {getOriginalExercise(exercise)?.repRange && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-md">
                        {getOriginalExercise(exercise)!.repRange.min}-{getOriginalExercise(exercise)!.repRange.max} reps
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {exercise.sets.filter(set => set.completed).length}/{exercise.sets.length} sets
                  </span>
                </div>
                <div className="flex space-x-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        set.completed 
                          ? 'bg-success text-success-foreground' 
                          : setIndex === currentPosition?.setIndex && exerciseIndex === currentPosition?.exerciseIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {set.setNumber}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <ThemeToggle />
    </div>
  );
}

// Set Logging Form Component
interface SetLoggingFormProps {
  set: SetLog;
  exercise: ExerciseLog;
  onComplete: (setData: Partial<SetLog>) => void;
  onStartRest: (restTimeMinutes: number) => void;
}

function SetLoggingForm({ set, exercise, onComplete, onStartRest }: SetLoggingFormProps) {
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');
  const [rir, setRir] = useState<string>('');

  const handleComplete = () => {
    const setData: Partial<SetLog> = {
      weight: weight ? parseFloat(weight) : undefined,
      reps: parseInt(reps) || 0,
      rpe: rpe ? parseInt(rpe) : undefined,
      rir: rir ? parseInt(rir) : undefined,
    };
    
    onComplete(setData);
    
    // Start rest timer if this is a working set
    if (set.type === 'working') {
      onStartRest(2); // Default 2 minutes rest
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reps">Reps *</Label>
          <Input
            id="reps"
            type="number"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rpe">RPE (1-10)</Label>
          <Input
            id="rpe"
            type="number"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rir">RIR (0-10)</Label>
          <Input
            id="rir"
            type="number"
            min="0"
            max="10"
            value={rir}
            onChange={(e) => setRir(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <Button 
        onClick={handleComplete}
        disabled={!reps || parseInt(reps) < 1}
        className="w-full"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Complete Set
      </Button>
    </div>
  );
}
