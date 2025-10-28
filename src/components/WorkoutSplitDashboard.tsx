'use client';

import { useState, useEffect } from 'react';
import { WorkoutSplit, WorkoutSession } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutSplitCard } from './WorkoutSplitCard';
import { WorkoutSplitManager } from './WorkoutSplitManager';
import { WorkoutSessionManager } from './WorkoutSessionManager';
import { WorkoutSessionHistory } from './WorkoutSessionHistory';
import { WorkoutSessionDetails } from './WorkoutSessionDetails';
import { ThemeToggle } from './ThemeToggle';
import { Plus, ChevronDown, ChevronUp, History, Loader2 } from 'lucide-react';
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
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSplit, setEditingSplit] = useState<WorkoutSplit | null>(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'session' | 'session-details'>('dashboard');
  const [activeSession, setActiveSession] = useState<{ split: WorkoutSplit; dayId: string } | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <span>LiftIQ</span>
            </h1>
            <p className="text-muted-foreground mt-1 hidden sm:block">
              Create and manage your workout routines
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleViewHistory}
            className="flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Past Lifts</span>
          </Button>
          <Button onClick={handleCreateSplit} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Split</span>
          </Button>
        </div>
      </div>

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
