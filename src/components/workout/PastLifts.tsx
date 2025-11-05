'use client';

import { useState, useMemo } from 'react';
import { WorkoutSession } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { formatSessionDuration } from '@/lib/workout-utils';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { 
  Calendar, 
  Clock, 
  BarChart3,
  Eye,
  Trash2,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface PastLiftsProps {
  sessions: WorkoutSession[];
  onViewSession: (session: WorkoutSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onBackToDashboard: () => void;
}

export function PastLifts({ sessions, onViewSession, onDeleteSession, onBackToDashboard }: PastLiftsProps) {
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'split'>('date');
  const [filterSplit, setFilterSplit] = useState<string>('all');

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    
    // Filter by split
    if (filterSplit !== 'all') {
      filtered = filtered.filter(session => session.splitId === filterSplit);
    }
    
    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime();
        case 'duration':
          return (b.totalDuration || 0) - (a.totalDuration || 0);
        case 'split':
          return a.splitName.localeCompare(b.splitName);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [sessions, sortBy, filterSplit]);

  const getUniqueSplits = () => {
    const splits = sessions.map(session => ({ id: session.splitId, name: session.splitName }));
    return splits.filter((split, index, self) => 
      index === self.findIndex(s => s.id === split.id)
    );
  };

  const getSessionStats = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalDuration = completedSessions.reduce((total, session) => total + (session.totalDuration || 0), 0);
    const avgDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;
    
    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      totalSets: completedSessions.reduce((total, session) => 
        total + session.exerciseLogs.reduce((exerciseTotal, exercise) => 
          exerciseTotal + exercise.sets.filter(set => set.completed).length, 0
        ), 0
      )
    };
  };

  const stats = getSessionStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workout History</h1>
            <p className="text-muted-foreground">Track your progress and view past workouts</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{stats.completedSessions}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{formatSessionDuration(stats.totalDuration)}</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.totalSets}</p>
              <p className="text-sm text-muted-foreground">Total Sets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'duration' | 'split')}
                  className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="duration">Duration</option>
                  <option value="split">Split</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by split:</label>
              <div className="relative">
                <select
                  value={filterSplit}
                  onChange={(e) => setFilterSplit(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="all">All Splits</option>
                  {getUniqueSplits().map(split => (
                    <option key={split.id} value={split.id}>{split.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <WorkoutSessionCard
              key={session.id}
              session={session}
              onView={onViewSession}
              onDelete={onDeleteSession}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Workout Sessions Yet</h3>
            <p className="text-muted-foreground">
              Complete your first workout to see it appear in your history.
            </p>
          </CardContent>
        </Card>
      )}
      <ThemeToggle />
    </div>
  );
}

// Individual Session Card Component
interface WorkoutSessionCardProps {
  session: WorkoutSession;
  onView: (session: WorkoutSession) => void;
  onDelete: (sessionId: string) => void;
}

function WorkoutSessionCard({ session, onView, onDelete }: WorkoutSessionCardProps) {
  const completedSets = session.exerciseLogs.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  );
  const totalSets = session.exerciseLogs.reduce((total, exercise) => 
    total + exercise.sets.length, 0
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workout session?')) {
      onDelete(session.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onView(session)}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Header with title and action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Workout Day on its own horizontal row */}
              <div className="flex items-center">
                <h3 className="text-lg font-semibold">{session.dayName}</h3>
              </div>
              {/* Split name below, if it exists */}
              {session.splitName && (
                <div className="mt-1">
                  <span className="text-sm text-muted-foreground">{session.splitName}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(session);
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="space-y-2">
            {/* Date on its own row */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(session.completedAt || session.startedAt).toLocaleDateString()}</span>
            </div>
            {/* Workout time and sets completed on second row */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatSessionDuration(session.totalDuration || 0)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedSets}/{totalSets} sets</span>
              </div>
            </div>
          </div>

          {/* Exercise Summary */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {session.exerciseLogs.map((exercise) => {
                const completedSets = exercise.sets.filter(set => set.completed).length;
                const totalSets = exercise.sets.length;
                const isFullyCompleted = completedSets === totalSets && totalSets > 0;
                
                return (
                  <div
                    key={exercise.id}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isFullyCompleted
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted text-muted-foreground border border-border/50'
                    }`}
                  >
                    <span className="font-semibold">{exercise.exerciseName}</span>
                    <span className="ml-1.5 opacity-75">
                      ({completedSets}/{totalSets})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

