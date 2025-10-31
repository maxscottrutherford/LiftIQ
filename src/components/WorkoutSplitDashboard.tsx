'use client';

import { useState, useEffect } from 'react';
import { WorkoutSplit, WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutSplitCard } from './WorkoutSplitCard';
import { WorkoutSplitManager } from './WorkoutSplitManager';
import { WorkoutSessionManager } from './WorkoutSessionManager';
import { WorkoutSessionHistory } from './WorkoutSessionHistory';
import { WorkoutSessionDetails } from './WorkoutSessionDetails';
import { FreestyleWorkoutManager } from './FreestyleWorkoutManager';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { generateId } from '@/lib/workout-utils';
import { Plus, ChevronDown, ChevronUp, History, Loader2, Play, Dumbbell } from 'lucide-react';
import { 
  getWorkoutSplits, 
  saveWorkoutSplit, 
  updateWorkoutSplit, 
  deleteWorkoutSplit,
  getWorkoutSessions,
  saveWorkoutSession,
  deleteWorkoutSession
} from '@/lib/supabase/workout-service';

export function WorkoutSplitDashboard() {
  const { user } = useAuth();
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSplit, setEditingSplit] = useState<WorkoutSplit | null>(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'session' | 'session-details' | 'freestyle'>('dashboard');
  const [activeSession, setActiveSession] = useState<{ split: WorkoutSplit; dayId: string } | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLocalSession, setActiveLocalSession] = useState<{ splitId: string; dayId: string; startedAt: Date } | null>(null);

  // Check for active session in localStorage on mount and when returning to dashboard
  useEffect(() => {
    if (!user?.id || splits.length === 0) return;
    
    // Only check when on dashboard view
    if (currentView !== 'dashboard') return;
    
    try {
      const allKeys = Object.keys(localStorage);
      const workoutKeys = allKeys.filter(key => 
        key.startsWith(`workout_session_${user.id}_`)
      );
      
      if (workoutKeys.length > 0) {
        // Get the most recent workout session
        const sessionsData = workoutKeys.map(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            return { ...data, key };
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        if (sessionsData.length > 0) {
          const mostRecent = sessionsData[0];
          // Extract split and day IDs from the key format: workout_session_userId_splitId_dayId
          // Remove the 'workout_session' prefix and userId
          const userId = user.id;
          const keyWithoutPrefix = mostRecent.key.replace(`workout_session_${userId}_`, '');
          // The key format is now: splitId_dayId
          // We need to find where splitId ends and dayId begins
          // Since we need to match it with splits, we'll try each combination
          let splitId = '';
          let dayId = '';
          
          for (const split of splits) {
            if (keyWithoutPrefix.startsWith(split.id + '_')) {
              splitId = split.id;
              dayId = keyWithoutPrefix.replace(split.id + '_', '');
              break;
            }
          }
          
          if (splitId && dayId) {
            setActiveLocalSession({
              splitId,
              dayId,
              startedAt: new Date(mostRecent.session.startedAt)
            });
          }
        }
      } else {
        // No active sessions found, clear the indicator
        setActiveLocalSession(null);
      }
    } catch (error) {
      console.error('Error checking for active session:', error);
    }
  }, [user?.id, splits, currentView]);

  // Load splits and sessions from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [loadedSplits, loadedSessions] = await Promise.all([
          getWorkoutSplits(),
          getWorkoutSessions()
        ]);
        setSplits(loadedSplits);
        setSessions(loadedSessions);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateSplit = () => {
    setEditingSplit(null);
    setIsCreating(true);
  };

  const handleEditSplit = (split: WorkoutSplit) => {
    setEditingSplit(split);
    setIsCreating(true);
  };

  const handleSaveSplit = async (split: WorkoutSplit) => {
    if (editingSplit) {
      // Update existing split in Supabase
      const updated = await updateWorkoutSplit(split);
      if (updated) {
        setSplits(prev => prev.map(s => s.id === split.id ? updated : s));
      }
    } else {
      // Save new split to Supabase
      const saved = await saveWorkoutSplit(split);
      if (saved) {
        setSplits(prev => [...prev, saved]);
      }
    }
    setIsCreating(false);
    setEditingSplit(null);
  };

  const handleDeleteSplit = async (splitId: string) => {
    if (confirm('Are you sure you want to delete this workout split?')) {
      const success = await deleteWorkoutSplit(splitId);
      if (success) {
        setSplits(prev => prev.filter(s => s.id !== splitId));
      }
    }
  };

  const handleStartWorkout = (split: WorkoutSplit, dayId: string) => {
    setActiveSession({ split, dayId });
    setCurrentView('session');
  };

  const handleResumeWorkout = () => {
    if (activeLocalSession) {
      const split = splits.find(s => s.id === activeLocalSession.splitId);
      if (split) {
        setActiveSession({ split, dayId: activeLocalSession.dayId });
        setCurrentView('session');
        setActiveLocalSession(null); // Clear after resuming
      }
    }
  };

  const handleCancelActiveSession = () => {
    if (!user?.id || !activeLocalSession) return;
    try {
      const key = `workout_session_${user.id}_${activeLocalSession.splitId}_${activeLocalSession.dayId}`;
      localStorage.removeItem(key);
      setActiveLocalSession(null);
    } catch (error) {
      console.error('Error canceling active session:', error);
    }
  };

  const handleCompleteSession = async (session: WorkoutSession) => {
    const saved = await saveWorkoutSession(session);
    if (saved) {
      setSessions(prev => [...prev, saved]);
    }
    setActiveSession(null);
    setCurrentView('dashboard');
  };

  const handleCancelSession = () => {
    setActiveSession(null);
    setCurrentView('dashboard');
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleViewSession = (session: WorkoutSession) => {
    setSelectedSession(session);
    setCurrentView('session-details');
  };

  const handleDeleteSession = async (sessionId: string) => {
    const success = await deleteWorkoutSession(sessionId);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleBackToHistory = () => {
    setSelectedSession(null);
    setCurrentView('history');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSession(null);
  };

  const handleStartFreestyle = () => {
    setCurrentView('freestyle');
  };

  const handleFreestyleComplete = async (workoutName: string, sets: any[], notes?: string, startedAt?: Date) => {
    try {
      // Group sets by exercise name to create ExerciseLog objects
      const exerciseGroups = new Map<string, any[]>();
      
      sets.forEach(set => {
        const exerciseName = set.exerciseName;
        if (!exerciseGroups.has(exerciseName)) {
          exerciseGroups.set(exerciseName, []);
        }
        exerciseGroups.get(exerciseName)!.push(set);
      });

      // Convert grouped sets to ExerciseLog format
      // Create a map to track original insertion order
      const setOrderMap = new Map<string, number>();
      sets.forEach((set, index) => {
        setOrderMap.set(set.id, index);
      });

      const exerciseLogs: ExerciseLog[] = Array.from(exerciseGroups.entries()).map(([exerciseName, exerciseSets]) => {
        // Sort sets by original insertion order
        const sortedSets = exerciseSets.sort((a, b) => {
          const orderA = setOrderMap.get(a.id) ?? 0;
          const orderB = setOrderMap.get(b.id) ?? 0;
          return orderA - orderB;
        });

        // Convert FreestyleSet to SetLog format
        const setLogs: SetLog[] = sortedSets.map((set, index) => ({
          id: set.id || generateId(),
          setNumber: index + 1,
          type: set.setType,
          weight: set.weight,
          reps: set.reps,
          rpe: set.rpe,
          rir: set.rir,
          completed: true, // All sets in freestyle workout are completed
          completedAt: new Date(),
        }));

        return {
          id: generateId(),
          exerciseId: generateId(), // Generate a placeholder exercise ID
          exerciseName,
          sets: setLogs,
          completedAt: new Date(),
          notes: exerciseSets.find(s => s.notes)?.notes, // Use first set's notes if available
        };
      });

      // Calculate duration if we have start time
      const duration = startedAt 
        ? Math.round((new Date().getTime() - startedAt.getTime()) / 60000) // Convert to minutes
        : undefined;

      // Create WorkoutSession object
      // For freestyle workouts, we'll use placeholder values for split/day since they don't belong to a split
      const session: WorkoutSession = {
        id: generateId(),
        splitId: 'freestyle',
        splitName: 'Freestyle Workout',
        dayId: 'freestyle',
        dayName: workoutName,
        startedAt: startedAt || new Date(),
        completedAt: new Date(),
        status: 'completed',
        exerciseLogs,
        totalDuration: duration,
        notes,
      };

      // Save to database
      const savedSession = await saveWorkoutSession(session);
      
      if (savedSession) {
        // Refresh sessions list
        const updatedSessions = await getWorkoutSessions();
        setSessions(updatedSessions);
        
        // Go back to dashboard
        setCurrentView('dashboard');
      } else {
        console.error('Failed to save freestyle workout');
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error saving freestyle workout:', error);
      // TODO: Show error message to user
    }
  };

  const handleFreestyleCancel = () => {
    setCurrentView('dashboard');
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSplit(null);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your workouts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render different views based on current state
  if (isCreating) {
    return (
      <WorkoutSplitManager
        onSave={handleSaveSplit}
        onCancel={handleCancel}
        initialSplit={editingSplit || undefined}
      />
    );
  }

  if (currentView === 'session' && activeSession) {
    return (
      <WorkoutSessionManager
        split={activeSession.split}
        dayId={activeSession.dayId}
        onComplete={handleCompleteSession}
        onCancel={handleCancelSession}
        previousSessions={sessions}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <WorkoutSessionHistory
        sessions={sessions}
        onViewSession={handleViewSession}
        onDeleteSession={handleDeleteSession}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'session-details' && selectedSession) {
    return (
      <WorkoutSessionDetails
        session={selectedSession}
        onBack={handleBackToHistory}
      />
    );
  }

  if (currentView === 'freestyle') {
    return (
      <FreestyleWorkoutManager
        onComplete={handleFreestyleComplete}
        onCancel={handleFreestyleCancel}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <span>LiftIQ</span>
          </h1>
          <p className="text-muted-foreground mt-1 hidden sm:block">
            Create and manage your workout routines
          </p>
        </div>
        
        {/* Navbar */}
        <nav className="border-b border-border">
          <div className="flex flex-wrap items-center gap-2 py-3">
            <Button 
              variant="ghost"
              onClick={handleViewHistory}
              className="flex items-center space-x-2 bg-secondary/20 hover:bg-secondary/30 hover:text-foreground dark:bg-muted/30 dark:hover:bg-muted/60"
            >
              <History className="h-4 w-4" />
              <span>Past Lifts</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={handleStartFreestyle}
              className="flex items-center space-x-2 bg-secondary/20 hover:bg-secondary/30 hover:text-foreground dark:bg-muted/30 dark:hover:bg-muted/60"
            >
              <Dumbbell className="h-4 w-4" />
              <span>Log A Workout</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={handleCreateSplit}
              className="flex items-center space-x-2 bg-secondary/20 hover:bg-secondary/30 hover:text-foreground dark:bg-muted/30 dark:hover:bg-muted/60"
            >
              <Plus className="h-4 w-4" />
              <span>Create A Split</span>
            </Button>
          </div>
        </nav>
      </div>

      {/* Active Workout Session Notice */}
      {activeLocalSession && (() => {
        const split = splits.find(s => s.id === activeLocalSession.splitId);
        const day = split?.days.find(d => d.id === activeLocalSession.dayId);
        return split && day ? (
          <Card className="border-accent bg-accent/5">
            <CardContent className="pt-6 space-y-4">
              {/* Top: Play icon and workout day name */}
              <div className="flex items-center justify-center space-x-4">
                <div className="p-2 rounded-full bg-accent">
                  <Play className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Active Workout: {day.name}</h3>
              </div>
              
              {/* Middle: Split name and date/time */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {split.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Started {new Date(activeLocalSession.startedAt).toLocaleString()}
                </p>
              </div>
              
              {/* Bottom: Cancel and Resume buttons */}
              <div className="flex justify-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={handleCancelActiveSession}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleResumeWorkout}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null;
      })()}

      {/* Stats Overview */}
      {splits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Statistics</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="flex items-center space-x-2"
            >
              {isStatsExpanded ? (
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
          
          {isStatsExpanded && (
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
                    <p className="text-2xl font-bold text-accent">
                      {splits.reduce((total, split) => total + split.days.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Workout Days</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {splits.reduce((total, split) => 
                        total + split.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Exercises</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {splits.length > 0 
                        ? Math.round(
                            splits.reduce((total, split) => 
                              total + split.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0
                            ) / splits.reduce((total, split) => total + split.days.length, 0)
                          )
                        : 0
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Exercises/Day</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Splits List */}
      {splits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {splits.map((split) => (
            <WorkoutSplitCard
              key={split.id}
              split={split}
              onEdit={handleEditSplit}
              onDelete={handleDeleteSplit}
              onStart={handleStartWorkout}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Workout Splits Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first workout split to get started with organizing your training routine.
            </p>
            <Button onClick={handleCreateSplit} className="flex items-center space-x-2 mx-auto">
              <Plus className="h-4 w-4" />
              <span>Create Your First Split</span>
            </Button>
          </CardContent>
        </Card>
      )}
      <ThemeToggle />
    </div>
  );
}
