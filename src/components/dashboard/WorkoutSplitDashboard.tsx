'use client';

import { useState, useEffect } from 'react';
import { WorkoutSplit, WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutSplitCard } from '@/components/workout/WorkoutSplitCard';
import { WorkoutSplitManager } from '@/components/workout/WorkoutSplitManager';
import { WorkoutSessionManager } from '@/components/workout/WorkoutSessionManager';
import { PastLifts } from '@/components/workout/PastLifts';
import { WorkoutSessionDetails } from '@/components/workout/WorkoutSessionDetails';
import { FreestyleWorkoutManager } from '@/components/workout/FreestyleWorkoutManager';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { generateId } from '@/lib/workout-utils';
import { Plus, ChevronDown, ChevronUp, History, Loader2, Play, Dumbbell, ArrowLeft } from 'lucide-react';
import { 
  getWorkoutSplits, 
  saveWorkoutSplit, 
  updateWorkoutSplit, 
  deleteWorkoutSplit,
  getWorkoutSessions,
  saveWorkoutSession,
  deleteWorkoutSession,
  getActiveWorkoutSessions
} from '@/lib/supabase/workout-service';

interface WorkoutSplitDashboardProps {
  initialView?: 'splits' | 'history' | 'session' | 'session-details' | 'freestyle';
}

export function WorkoutSplitDashboard({ initialView = 'splits' }: WorkoutSplitDashboardProps = {}) {
  const { user, loading: authLoading } = useAuth();
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSplit, setEditingSplit] = useState<WorkoutSplit | null>(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<'splits' | 'history' | 'session' | 'session-details' | 'freestyle'>(initialView || 'splits');
  const [activeSession, setActiveSession] = useState<{ split: WorkoutSplit; dayId: string } | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLocalSession, setActiveLocalSession] = useState<{ splitId: string; dayId: string; startedAt: Date } | null>(null);

  // Check for active session in database on mount and when returning to dashboard
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!user?.id) {
        setActiveLocalSession(null);
        return;
      }
      
      // Only check when on splits view (home view handled separately)
      if (currentView !== 'splits') return;
      
      // Wait for splits to be loaded
      if (splits.length === 0) {
        setActiveLocalSession(null);
        return;
      }

      try {
        const activeSessions = await getActiveWorkoutSessions();
        
        // Filter out freestyle sessions (we only want split workouts here)
        const splitActiveSessions = activeSessions.filter(s => s.splitId !== 'freestyle');
        
        if (splitActiveSessions.length > 0) {
          // Find the most recent active session that matches one of our splits
          const matchingSession = splitActiveSessions.find(s => 
            splits.some(split => split.id === s.splitId)
          );
          
          if (matchingSession) {
            // Check if there are completed sets
            const hasCompletedSets = matchingSession.exerciseLogs.some(exercise =>
              exercise.sets.some(set => set.completed)
            );
            
            if (hasCompletedSets) {
              setActiveLocalSession({
                splitId: matchingSession.splitId,
                dayId: matchingSession.dayId,
                startedAt: matchingSession.startedAt
              });
              return;
            }
          }
        }
        
        // No active sessions found
        setActiveLocalSession(null);
      } catch (error) {
        console.error('Error checking for active session:', error);
        setActiveLocalSession(null);
      }
    };

    checkActiveSession();
  }, [user?.id, splits, currentView]);

  // Load splits and sessions from Supabase on mount, but only after user is confirmed
  useEffect(() => {
    const loadData = async () => {
      // Wait for auth to finish loading first
      if (authLoading) {
        console.log('Waiting for auth to finish loading...');
        return;
      }

      // If auth is done but no user, set loading to false and return
      if (!user?.id) {
        console.log('No authenticated user found after auth loaded');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Loading workout data for user:', user.id);
        
        // Retry logic - sometimes the first call fails due to cookie timing
        let retries = 3;
        let loadedSplits: WorkoutSplit[] = [];
        let loadedSessions: WorkoutSession[] = [];
        
        while (retries > 0) {
          try {
            [loadedSplits, loadedSessions] = await Promise.all([
              getWorkoutSplits(),
              getWorkoutSessions()
            ]);
            
            // If we got data (even if empty), break
            if (loadedSplits.length >= 0 && loadedSessions.length >= 0) {
              break;
            }
          } catch (error) {
            console.warn(`Retry attempt ${4 - retries} failed:`, error);
            retries--;
            if (retries > 0) {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        setSplits(loadedSplits);
        setSessions(loadedSessions);
        console.log(`Loaded ${loadedSplits.length} splits and ${loadedSessions.length} sessions`);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, authLoading]);

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

  const handleCancelActiveSession = async () => {
    if (!user?.id || !activeLocalSession) return;
    try {
      // Get the active session from database and delete it
      const activeSessions = await getActiveWorkoutSessions();
      const sessionToDelete = activeSessions.find(
        s => s.splitId === activeLocalSession.splitId && s.dayId === activeLocalSession.dayId
      );
      
      if (sessionToDelete) {
        await deleteWorkoutSession(sessionToDelete.id);
      }
      
      setActiveLocalSession(null);
    } catch (error) {
      console.error('Error canceling active session:', error);
    }
  };

  const handleCompleteSession = async (session: WorkoutSession) => {
    const saved = await saveWorkoutSession(session);
    if (saved) {
      setSessions(prev => [...prev, saved]);
      // Set flag for celebration and redirect to home
      try {
        sessionStorage.setItem('workout_completed', 'true');
      } catch (error) {
        console.error('Error setting workout completion flag:', error);
      }
      // Redirect to home to show celebration
      window.location.href = '/dashboard';
    } else {
      setActiveSession(null);
      setCurrentView('splits');
    }
  };

  const handleCancelSession = () => {
    setActiveSession(null);
    setCurrentView('splits');
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

  const handleBackToHome = () => {
    // Navigate back to home
    window.location.href = '/dashboard';
  };

  const handleBackToDashboard = () => {
    // Navigate back to home
    window.location.href = '/dashboard';
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
        
        // Go back to home
        window.location.href = '/dashboard';
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
    // Navigate back to home
    window.location.href = '/dashboard';
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
      <PastLifts
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
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBackToHome}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workout Splits</h1>
            <p className="text-muted-foreground">Create and manage your workout routines</p>
          </div>
        </div>
      </div>

      {/* Create Split Button - Full Width */}
      <Button 
        onClick={handleCreateSplit}
        className="w-full flex items-center justify-center space-x-2"
        size="lg"
      >
        <Plus className="h-5 w-5" />
        <span>Create A Split</span>
      </Button>

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
                <h3 className="text-lg font-semibold">{day.name}</h3>
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
      <ThemeToggle />
    </div>
  );
}
