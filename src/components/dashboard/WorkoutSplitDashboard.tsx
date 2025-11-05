'use client';

import { useState } from 'react';
import { WorkoutSplit, WorkoutSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { WorkoutSplitCard } from '@/components/workout/WorkoutSplitCard';
import { WorkoutSplitManager } from '@/components/workout/WorkoutSplitManager';
import { WorkoutSessionManager } from '@/components/workout/WorkoutSessionManager';
import { PastLifts } from '@/components/workout/PastLifts';
import { WorkoutSessionDetails } from '@/components/workout/WorkoutSessionDetails';
import { FreestyleWorkoutManager } from '@/components/workout/FreestyleWorkoutManager';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardHeader } from './shared/DashboardHeader';
import { ActiveWorkoutNotice } from './shared/ActiveWorkoutNotice';
import { StatsOverview } from './shared/StatsOverview';
import { EmptyState } from './shared/EmptyState';
import { useAuth } from '@/lib/auth-context';
import { useWorkoutData } from '@/hooks/workout/useWorkoutData';
import { useActiveSession } from '@/hooks/workout/useActiveSession';
import { convertFreestyleToWorkoutSession } from '@/lib/workout/utils';
import { navigateToDashboard, setWorkoutCompletedFlag } from '@/lib/navigation-utils';
import { Plus } from 'lucide-react';
import { 
  saveWorkoutSplit, 
  updateWorkoutSplit, 
  deleteWorkoutSplit,
  saveWorkoutSession,
  deleteWorkoutSession,
  getActiveWorkoutSessions,
  deleteWorkoutSession as deleteWorkoutSessionFromDB
} from '@/lib/supabase/workout-service';

interface WorkoutSplitDashboardProps {
  initialView?: 'splits' | 'history' | 'session' | 'session-details' | 'freestyle';
}

export function WorkoutSplitDashboard({ initialView = 'splits' }: WorkoutSplitDashboardProps = {}) {
  const { user, loading: authLoading } = useAuth();
  const { splits, sessions, loading, refreshSessions, refreshSplits } = useWorkoutData(user?.id, authLoading);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSplit, setEditingSplit] = useState<WorkoutSplit | null>(null);
  const [currentView, setCurrentView] = useState<'splits' | 'history' | 'session' | 'session-details' | 'freestyle'>(initialView || 'splits');
  const [activeSession, setActiveSession] = useState<{ split: WorkoutSplit; dayId: string } | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const { activeSession: activeLocalSession, setActiveSession: setActiveLocalSession } = useActiveSession(
    user?.id,
    splits,
    currentView
  );

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
      await updateWorkoutSplit(split);
    } else {
      await saveWorkoutSplit(split);
    }
    setIsCreating(false);
    setEditingSplit(null);
    await refreshSplits();
  };

  const handleDeleteSplit = async (splitId: string) => {
    if (confirm('Are you sure you want to delete this workout split?')) {
      await deleteWorkoutSplit(splitId);
      await refreshSplits();
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
      const activeSessions = await getActiveWorkoutSessions();
      const sessionToDelete = activeSessions.find(
        s => s.splitId === activeLocalSession.splitId && s.dayId === activeLocalSession.dayId
      );
      
      if (sessionToDelete) {
        await deleteWorkoutSessionFromDB(sessionToDelete.id);
      }
      
      setActiveLocalSession(null);
    } catch (error) {
      console.error('Error canceling active session:', error);
    }
  };

  const handleCompleteSession = async (session: WorkoutSession) => {
    const saved = await saveWorkoutSession(session);
    if (saved) {
      setWorkoutCompletedFlag();
      navigateToDashboard();
    } else {
      setActiveSession(null);
      setCurrentView('splits');
    }
  };

  const handleCancelSession = () => {
    setActiveSession(null);
    setCurrentView('splits');
  };

  const handleViewSession = (session: WorkoutSession) => {
    setSelectedSession(session);
    setCurrentView('session-details');
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteWorkoutSession(sessionId);
    await refreshSessions();
  };

  const handleBackToHistory = () => {
    setSelectedSession(null);
    setCurrentView('history');
  };

  const handleFreestyleComplete = async (workoutName: string, sets: any[], notes?: string, startedAt?: Date) => {
    try {
      const session = convertFreestyleToWorkoutSession(workoutName, sets, notes, startedAt);
      const savedSession = await saveWorkoutSession(session);
      
      if (savedSession) {
        await refreshSessions();
        navigateToDashboard();
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
    navigateToDashboard();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSplit(null);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return <LoadingSpinner message="Loading your workouts..." />;
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
        onBackToDashboard={navigateToDashboard}
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
      <DashboardHeader
        title="Workout Splits"
        description="Create and manage your workout routines"
        onBack={navigateToDashboard}
      />

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
      {activeLocalSession && (
        <ActiveWorkoutNotice
          activeSession={activeLocalSession}
          splits={splits}
          onResume={handleResumeWorkout}
          onCancel={handleCancelActiveSession}
        />
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
        <EmptyState
          title="No Workout Splits Yet"
          description="Create your first workout split to get started with organizing your training routine."
          buttonText="Create Your First Split"
          onButtonClick={handleCreateSplit}
        />
      )}

      {/* Stats Overview */}
      <StatsOverview splits={splits} />

      <ThemeToggle />
    </div>
  );
}
