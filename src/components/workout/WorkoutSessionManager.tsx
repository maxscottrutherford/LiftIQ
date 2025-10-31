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
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  Save,
  Timer,
  Undo2
} from 'lucide-react';

interface WorkoutSessionManagerProps {
  split: WorkoutSplit;
  dayId: string;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
  previousSessions?: WorkoutSession[];
}

export function WorkoutSessionManager({ split, dayId, onComplete, onCancel, previousSessions = [] }: WorkoutSessionManagerProps) {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  
  // Storage key for saving session state - includes user ID to prevent cross-user data leaks
  const STORAGE_KEY = `workout_session_${userId}_${split.id}_${dayId}`;
  
  // Clean up old sessions from other users on mount
  useEffect(() => {
    try {
      if (user?.id) {
        // Get all localStorage keys and clean up any workout sessions not belonging to current user
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.startsWith('workout_session_') && !key.includes(user.id)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }, [user?.id]);
  
  // Initialize session on mount - try to restore from localStorage first
  const [session, setSession] = useState<WorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if this session belongs to the current user and hasn't expired (24 hours)
        const now = Date.now();
        const sessionAge = now - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (parsed.userId === userId && sessionAge < maxAge) {
          // Restore the session with proper Date objects
          return {
            ...parsed.session,
            startedAt: new Date(parsed.session.startedAt),
            completedAt: parsed.session.completedAt ? new Date(parsed.session.completedAt) : undefined,
            exerciseLogs: parsed.session.exerciseLogs.map((log: ExerciseLog) => ({
              ...log,
              sets: log.sets.map(set => ({
                ...set,
                completedAt: set.completedAt ? new Date(set.completedAt) : undefined
              }))
            }))
          };
        } else {
          // Session expired or belongs to different user, remove it
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error restoring session from localStorage:', error);
    }
    return createWorkoutSession(split, dayId);
  });
  
  const [isResting, setIsResting] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [lastUndoneSetData, setLastUndoneSetData] = useState<Partial<SetLog> | null>(null);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          session,
          notes: sessionNotes,
          timestamp: Date.now(),
          userId: userId
        }));
      } catch (error) {
        console.error('Error saving session to localStorage:', error);
      }
    }
  }, [session, sessionNotes, STORAGE_KEY, userId]);

  // Restore session notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notes) {
          setSessionNotes(parsed.notes);
        }
      }
    } catch (error) {
      console.error('Error restoring notes from localStorage:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update current time for duration display and rest timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      // Check if rest time has elapsed
      if (isResting && restEndTime && now >= restEndTime) {
        setIsResting(false);
        setRestEndTime(null);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isResting, restEndTime]);

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

  // Check if there are any completed sets
  const hasCompletedSets = () => {
    if (!session) return false;
    return session.exerciseLogs.some(exercise => 
      exercise.sets.some(set => set.completed)
    );
  };

  const handleUndoLastSet = () => {
    setSession(prev => {
      if (!prev) return prev;
      
      // Find the most recently completed set
      let mostRecentSet: { exerciseIndex: number; setIndex: number; completedAt: Date; set: SetLog } | null = null;
      
      for (let exerciseIndex = 0; exerciseIndex < prev.exerciseLogs.length; exerciseIndex++) {
        const exercise = prev.exerciseLogs[exerciseIndex];
        for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
          const set = exercise.sets[setIndex];
          if (set.completed && set.completedAt) {
            if (!mostRecentSet || set.completedAt > mostRecentSet.completedAt) {
              mostRecentSet = { exerciseIndex, setIndex, completedAt: set.completedAt, set };
            }
          }
        }
      }
      
      if (!mostRecentSet) return prev;
      
      // Store the set's data before marking incomplete
      const undoneSetData: Partial<SetLog> = {
        weight: mostRecentSet.set.weight,
        reps: mostRecentSet.set.reps,
        rpe: mostRecentSet.set.rpe,
        rir: mostRecentSet.set.rir,
      };
      setLastUndoneSetData(undoneSetData);
      
      // Mark the most recent set as incomplete
      const updatedExerciseLogs = [...prev.exerciseLogs];
      const updatedExercise = { ...updatedExerciseLogs[mostRecentSet.exerciseIndex] };
      const updatedSets = [...updatedExercise.sets];
      const updatedSet = { 
        ...updatedSets[mostRecentSet.setIndex],
        completed: false,
        completedAt: undefined
      };
      
      updatedSets[mostRecentSet.setIndex] = updatedSet;
      updatedExercise.sets = updatedSets;
      updatedExerciseLogs[mostRecentSet.exerciseIndex] = updatedExercise;
      
      return {
        ...prev,
        exerciseLogs: updatedExerciseLogs
      };
    });
  };

  const handleStartRest = (restTimeMinutes: number) => {
    const now = Date.now();
    const restDurationMs = restTimeMinutes * 60 * 1000; // Convert to milliseconds
    setRestEndTime(now + restDurationMs);
    setIsResting(true);
  };

  const handleCompleteSession = () => {
    const completedSession = {
      ...completeWorkoutSession(session),
      notes: sessionNotes.trim() || undefined
    };
    // Clear localStorage on completion
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session from localStorage:', error);
    }
    // Set flag for celebration on home page
    try {
      sessionStorage.setItem('workout_completed', 'true');
    } catch (error) {
      console.error('Error setting workout completion flag:', error);
    }
    onComplete(completedSession);
  };

  const handleCancel = () => {
    // Don't clear localStorage - keep the session for resuming
    // The session will remain in localStorage and appear on dashboard
    onCancel();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining rest time based on timestamp
  const getRestTimeRemaining = (): number => {
    if (!isResting || !restEndTime) return 0;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((restEndTime - now) / 1000));
    return remaining;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
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
      {isResting && restEndTime && (
        <Card className="border-accent">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Timer className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-semibold">Rest Time</h3>
              </div>
              <div className="text-4xl font-bold text-accent">
                {formatTime(getRestTimeRemaining())}
              </div>
              <Button 
                onClick={() => {
                  setIsResting(false);
                  setRestEndTime(null);
                }}
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
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Set {currentSet.setNumber} of {currentExercise.sets.length} • {currentSet.type === 'warmup' ? 'Warmup' : 'Working'}
              </p>
              <div className="flex gap-2 flex-wrap py-1 justify-center">
                {originalExercise?.repRange && (
                  <div className="text-xs bg-secondary/10 px-2 py-1 rounded-md text-center">
                    Target: {originalExercise.repRange.min}-{originalExercise.repRange.max} reps
                  </div>
                )}
                {originalExercise?.intensityMetric?.type && originalExercise?.intensityMetric?.value !== undefined && (
                  <div className="text-xs bg-secondary/10 px-2 py-1 rounded-md text-center">
                    Target {originalExercise.intensityMetric.type.toUpperCase()}: {originalExercise.intensityMetric.value}
                  </div>
                )}
              </div>
            </div>
            {originalExercise?.notes && originalExercise.notes.trim() && (
              <div className="mt-2 text-sm bg-secondary/10 p-1 rounded-md text-center">
                Note: {originalExercise.notes}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Most Recent Working Set */}
            {currentExercise && getMostRecentWorkingSet(currentExercise.exerciseId) && (
              <div className="mb-6 p-3 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Last Time</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.weight !== undefined ? 
                        `${getMostRecentWorkingSet(currentExercise.exerciseId)!.weight} lbs` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reps:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.reps !== undefined ? 
                        getMostRecentWorkingSet(currentExercise.exerciseId)!.reps : 
                        'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RPE:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.rpe !== undefined ? 
                        getMostRecentWorkingSet(currentExercise.exerciseId)!.rpe : 
                        'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RIR:</span>
                    <span className="ml-2 font-medium">
                      {getMostRecentWorkingSet(currentExercise.exerciseId)?.rir !== undefined ? 
                        getMostRecentWorkingSet(currentExercise.exerciseId)!.rir : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <SetLoggingForm
              set={currentSet}
              exercise={currentExercise}
              restTimeMinutes={originalExercise?.restTime || 2}
              onComplete={(setData) => {
                handleCompleteSet(
                  currentPosition!.exerciseIndex, 
                  currentPosition!.setIndex, 
                  setData
                );
                setLastUndoneSetData(null); // Clear the stored data after completing
              }}
              onStartRest={handleStartRest}
              onUndo={handleUndoLastSet}
              initialValues={lastUndoneSetData}
              canUndo={hasCompletedSets()}
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
                {/* Exercise Name and Sets Info - Consistent layout */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{exercise.exerciseName}</h4>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {exercise.sets.filter(set => set.completed).length}/{exercise.sets.length} sets
                  </span>
                </div>
                
                {/* Set Circles */}
                <div className="flex space-x-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
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
  restTimeMinutes: number;
  onComplete: (setData: Partial<SetLog>) => void;
  onStartRest: (restTimeMinutes: number) => void;
  onUndo?: () => void;
  initialValues?: Partial<SetLog> | null;
  canUndo?: boolean;
}

function SetLoggingForm({ set, exercise, restTimeMinutes, onComplete, onStartRest, onUndo, initialValues, canUndo }: SetLoggingFormProps) {
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');
  const [rir, setRir] = useState<string>('');

  // Populate form with initial values when provided
  useEffect(() => {
    if (initialValues) {
      setWeight(initialValues.weight?.toString() || '');
      setReps(initialValues.reps?.toString() || '');
      setRpe(initialValues.rpe?.toString() || '');
      setRir(initialValues.rir?.toString() || '');
    } else {
      setWeight('');
      setReps('');
      setRpe('');
      setRir('');
    }
  }, [initialValues]);

  const handleComplete = () => {
    const parsedWeight = weight === '' ? undefined : parseFloat(weight);
    const setData: Partial<SetLog> = {
      weight: parsedWeight === undefined || isNaN(parsedWeight) ? undefined : parsedWeight,
      reps: parseInt(reps) || 0,
      rpe: rpe !== '' ? parseInt(rpe) : undefined,
      rir: rir !== '' ? parseInt(rir) : undefined,
    };
    
    onComplete(setData);
    
    // Clear inputs
    setWeight('');
    setReps('');
    setRpe('');
    setRir('');
    
    // Start rest timer if this is a working set
    if (set.type === 'working') {
      onStartRest(restTimeMinutes);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:gap-3">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="0.5"
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

      <div className="grid grid-cols-2 gap-4 sm:gap-3">
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
      
      {canUndo && onUndo && (
        <Button 
          onClick={onUndo}
          variant="outline"
          className="w-full"
        >
          <Undo2 className="h-4 w-4 mr-2" />
          Previous Set
        </Button>
      )}
    </div>
  );
}
