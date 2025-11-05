'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle, Edit2, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { saveWorkoutSession, updateWorkoutSession, getActiveWorkoutSessions } from '@/lib/supabase/workout-service';
import { WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';
import { generateId } from '@/lib/workout/utils';

interface FreestyleSet {
  id: string;
  exerciseName: string;
  setType: 'warmup' | 'working';
  weight?: number;
  reps: number;
  rpe?: number;
  rir?: number;
  notes?: string;
}

interface FreestyleWorkoutManagerProps {
  onComplete: (workoutName: string, sets: FreestyleSet[], notes?: string, startedAt?: Date) => void;
  onCancel: () => void;
}

export function FreestyleWorkoutManager({ onComplete, onCancel }: FreestyleWorkoutManagerProps) {
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';
  
  // Track if session has been saved to database
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [sets, setSets] = useState<FreestyleSet[]>([]);
  const [startedAt, setStartedAt] = useState<Date>(new Date());

  // Check for active freestyle workout in database on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const activeSessions = await getActiveWorkoutSessions();
        // Find active freestyle session (splitId === 'freestyle')
        const activeSession = activeSessions.find(s => s.splitId === 'freestyle');

        if (activeSession && activeSession.exerciseLogs.length > 0) {
          // Restore active freestyle session from database
          setWorkoutName(activeSession.dayName);
          if (activeSession.notes) {
            setWorkoutNotes(activeSession.notes);
          }
          setStartedAt(activeSession.startedAt);
          setSessionId(activeSession.id);
          
          // Convert ExerciseLog back to FreestyleSet format
          const restoredSets: FreestyleSet[] = [];
          activeSession.exerciseLogs.forEach(exerciseLog => {
            exerciseLog.sets.forEach(set => {
              restoredSets.push({
                id: set.id,
                exerciseName: exerciseLog.exerciseName,
                setType: set.type,
                weight: set.weight,
                reps: set.reps,
                rpe: set.rpe,
                rir: set.rir,
                notes: exerciseLog.notes,
              });
            });
          });
          setSets(restoredSets);
          
          // Show alert to resume
          setActiveWorkoutInfo({
            workoutName: activeSession.dayName,
            startedAt: activeSession.startedAt,
            setCount: restoredSets.length,
          });
          setShowActiveWorkoutAlert(true);
        }
      } catch (error) {
        console.error('Error loading active freestyle session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActiveSession();
  }, [user?.id]);

  const [isAddingSet, setIsAddingSet] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set()); // Track which exercises are expanded
  const [showActiveWorkoutAlert, setShowActiveWorkoutAlert] = useState(false);
  const [activeWorkoutInfo, setActiveWorkoutInfo] = useState<{ workoutName: string; startedAt: Date; setCount: number } | null>(null);

  // Form state for adding/editing sets
  const [currentExerciseName, setCurrentExerciseName] = useState('');
  const [currentSetType, setCurrentSetType] = useState<'warmup' | 'working'>('working');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentRpe, setCurrentRpe] = useState('');
  const [currentRir, setCurrentRir] = useState('');
  const [currentSetNotes, setCurrentSetNotes] = useState('');

  // Get unique exercise names from logged sets
  const getExistingExerciseNames = (): string[] => {
    const exerciseNames = new Set(sets.map(set => set.exerciseName));
    return Array.from(exerciseNames).sort();
  };

  // Find case-insensitive match for an exercise name
  const findCaseInsensitiveMatch = (input: string): string | null => {
    const existingNames = getExistingExerciseNames();
    const match = existingNames.find(name => name.toLowerCase() === input.toLowerCase());
    return match || null;
  };



  const resetForm = () => {
    setCurrentExerciseName('');
    setCurrentSetType('working');
    setCurrentWeight('');
    setCurrentReps('');
    setCurrentRpe('');
    setCurrentRir('');
    setCurrentSetNotes('');
    setIsAddingSet(false);
    setEditingSetId(null);
  };

  const handleAddSet = () => {
    if (!currentExerciseName.trim() || !currentReps) return;

    const exerciseName = currentExerciseName.trim();
    const newSet: FreestyleSet = {
      id: generateId(),
      exerciseName,
      setType: currentSetType,
      weight: currentWeight ? parseFloat(currentWeight) : undefined,
      reps: parseInt(currentReps) || 0,
      rpe: currentRpe ? parseInt(currentRpe) : undefined,
      rir: currentRir ? parseInt(currentRir) : undefined,
      notes: currentSetNotes.trim() || undefined,
    };

    setSets(prev => [...prev, newSet]);
    // Auto-expand the exercise when a set is added
    setExpandedExercises(prev => {
      const expandedSet = new Set(prev);
      expandedSet.add(exerciseName);
      return expandedSet;
    });
    resetForm();
  };

  const handleEditSet = (set: FreestyleSet) => {
    setEditingSetId(set.id);
    setCurrentExerciseName(set.exerciseName);
    setCurrentSetType(set.setType);
    setCurrentWeight(set.weight?.toString() || '');
    setCurrentReps(set.reps.toString());
    setCurrentRpe(set.rpe?.toString() || '');
    setCurrentRir(set.rir?.toString() || '');
    setCurrentSetNotes(set.notes || '');
    setIsAddingSet(true);
  };

  const handleUpdateSet = () => {
    if (!editingSetId || !currentExerciseName.trim() || !currentReps) return;

    const updatedSet: FreestyleSet = {
      id: editingSetId,
      exerciseName: currentExerciseName.trim(),
      setType: currentSetType,
      weight: currentWeight ? parseFloat(currentWeight) : undefined,
      reps: parseInt(currentReps) || 0,
      rpe: currentRpe ? parseInt(currentRpe) : undefined,
      rir: currentRir ? parseInt(currentRir) : undefined,
      notes: currentSetNotes.trim() || undefined,
    };

    setSets(prev => prev.map(s => s.id === editingSetId ? updatedSet : s));
    resetForm();
  };

  const handleDeleteSet = (setId: string) => {
    setSets(prev => prev.filter(s => s.id !== setId));
  };

  // Convert FreestyleSet[] to WorkoutSession format - using useCallback to prevent recreation
  const convertToWorkoutSession = useCallback((): WorkoutSession => {
    // Group sets by exercise name to create ExerciseLog objects
    const exerciseGroups = new Map<string, FreestyleSet[]>();
    sets.forEach(set => {
      const exerciseName = set.exerciseName;
      if (!exerciseGroups.has(exerciseName)) {
        exerciseGroups.set(exerciseName, []);
      }
      exerciseGroups.get(exerciseName)!.push(set);
    });

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
        completed: true, // All sets in freestyle workout are considered completed
        completedAt: new Date(),
      }));

      return {
        id: generateId(),
        exerciseId: generateId(), // Generate a placeholder exercise ID
        exerciseName,
        sets: setLogs,
        completedAt: new Date(),
        notes: exerciseSets.find(s => s.notes)?.notes,
      };
    });

    return {
      id: sessionId || generateId(),
      splitId: 'freestyle',
      splitName: 'Freestyle Workout',
      dayId: 'freestyle',
      dayName: workoutName || 'Freestyle Workout',
      startedAt,
      status: 'active',
      exerciseLogs,
      notes: workoutNotes.trim() || undefined,
    };
  }, [sets, workoutName, workoutNotes, startedAt, sessionId]);

  // Save or update session in database when first set is added or when sets change
  useEffect(() => {
    if (!user?.id || isSaving || sets.length === 0 || isLoading) return;

    const saveOrUpdateSession = async () => {
      setIsSaving(true);
      try {
        const sessionToSave = convertToWorkoutSession();
        
        // Don't save if session is already completed (handleComplete handles that)
        if (sessionToSave.status === 'completed') {
          setIsSaving(false);
          return;
        }

        if (sessionId) {
          // Update existing session
          const updated = await updateWorkoutSession(sessionToSave);
          if (updated) {
            setSessionId(updated.id);
          }
        } else {
          // Save new session
          const saved = await saveWorkoutSession(sessionToSave);
          if (saved) {
            setSessionId(saved.id);
          }
        }
      } catch (error) {
        console.error('Error saving/updating freestyle session:', error);
      } finally {
        setIsSaving(false);
      }
    };

    saveOrUpdateSession();
  }, [sets, workoutName, workoutNotes, startedAt, sessionId, user?.id, isLoading, convertToWorkoutSession]); // Removed isSaving from dependencies to prevent loop

  const handleComplete = async () => {
    if (!workoutName.trim() || sets.length === 0 || isSaving) return;
    
    setIsSaving(true);
    try {
      const sessionToComplete = convertToWorkoutSession();
      const completedSession: WorkoutSession = {
        ...sessionToComplete,
        status: 'completed',
        completedAt: new Date(),
        totalDuration: Math.round((new Date().getTime() - startedAt.getTime()) / 60000),
      };

      // Update session in database to completed status
      if (sessionId) {
        const updated = await updateWorkoutSession(completedSession);
        if (updated) {
          // Set flag for celebration on home page
          try {
            sessionStorage.setItem('workout_completed', 'true');
          } catch (error) {
            console.error('Error setting workout completion flag:', error);
          }
          onComplete(workoutName.trim(), sets, workoutNotes.trim() || undefined, startedAt);
          return;
        }
      }

      // If update failed or no sessionId, try saving as new completed session
      const saved = await saveWorkoutSession(completedSession);
      if (saved) {
        // Set flag for celebration on home page
        try {
          sessionStorage.setItem('workout_completed', 'true');
        } catch (error) {
          console.error('Error setting workout completion flag:', error);
        }
        onComplete(workoutName.trim(), sets, workoutNotes.trim() || undefined, startedAt);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Session remains in database with status='active' so user can resume later
    resetForm();
    onCancel();
  };

  const handleCancelActiveWorkout = async () => {
    if (sessionId) {
      try {
        // Delete the active session from database
        const { deleteWorkoutSession } = await import('@/lib/supabase/workout-service');
        await deleteWorkoutSession(sessionId);
      } catch (error) {
        console.error('Error deleting active workout:', error);
      }
    }
    setShowActiveWorkoutAlert(false);
    setActiveWorkoutInfo(null);
    // Reset state to clear the workout
    setWorkoutName('');
    setWorkoutNotes('');
    setSets([]);
    setExpandedExercises(new Set());
    setSessionId(null);
  };

  const handleResumeActiveWorkout = () => {
    // Just hide the alert - the workout data is already restored in state
    setShowActiveWorkoutAlert(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Loading workout...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show active workout alert instead of regular UI if there's an active workout
  if (showActiveWorkoutAlert && activeWorkoutInfo) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Freestyle Workout</h1>
              <p className="text-muted-foreground">Log your workout as you go</p>
            </div>
          </div>
        </div>

        {/* Active Workout Alert */}
        <Card className="border-accent bg-accent/5">
          <CardContent className="pt-6 space-y-4">
            {/* Top: Play icon and workout name */}
            <div className="flex items-center justify-center space-x-4">
              <div className="p-2 rounded-full bg-accent">
                <Play className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{activeWorkoutInfo.workoutName}</h3>
            </div>
            
            {/* Middle: Set count and date/time */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {activeWorkoutInfo.setCount} set{activeWorkoutInfo.setCount !== 1 ? 's' : ''} logged
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Started {activeWorkoutInfo.startedAt.toLocaleString()}
              </p>
            </div>
            
            {/* Bottom: Cancel and Resume buttons */}
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline"
                onClick={handleCancelActiveWorkout}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResumeActiveWorkout}
                className="bg-accent hover:bg-accent/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Freestyle Workout</h1>
            <p className="text-muted-foreground">Log your workout as you go</p>
          </div>
        </div>
      </div>

      {/* Workout Name */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Morning Session, Full Body, etc."
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Add Set Form */}
      {isAddingSet && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingSetId ? 'Edit Set' : 'Add Set'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exerciseName">Exercise Name *</Label>
              {getExistingExerciseNames().length > 0 ? (
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      value={currentExerciseName && findCaseInsensitiveMatch(currentExerciseName) ? findCaseInsensitiveMatch(currentExerciseName)! : ''}
                      onChange={(e) => {
                        setCurrentExerciseName(e.target.value);
                      }}
                      className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select exercise or type new name below</option>
                      {getExistingExerciseNames().map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <Input
                    id="exerciseName"
                    value={currentExerciseName}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Check for case-insensitive match
                      const match = findCaseInsensitiveMatch(inputValue);
                      // If there's an exact case-insensitive match, use the actual name with correct casing
                      if (match && inputValue.toLowerCase() === match.toLowerCase()) {
                        setCurrentExerciseName(match);
                      } else {
                        setCurrentExerciseName(inputValue);
                      }
                    }}
                    placeholder="Exercise Name"
                    required
                  />
                </div>
              ) : (
                <Input
                  id="exerciseName"
                  value={currentExerciseName}
                  onChange={(e) => setCurrentExerciseName(e.target.value)}
                  placeholder="e.g., Bench Press, Squat"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setType">Set Type *</Label>
                <div className="relative">
                  <select
                    id="setType"
                    value={currentSetType}
                    onChange={(e) => setCurrentSetType(e.target.value as 'warmup' | 'working')}
                    className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                  >
                    <option value="warmup">Warmup</option>
                    <option value="working">Working</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Reps *</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                value={currentReps}
                onChange={(e) => setCurrentReps(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rpe">RPE (1-10)</Label>
                <Input
                  id="rpe"
                  type="number"
                  min="1"
                  max="10"
                  value={currentRpe}
                  onChange={(e) => {
                    setCurrentRpe(e.target.value);
                    if (e.target.value) setCurrentRir('');
                  }}
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
                  value={currentRir}
                  onChange={(e) => {
                    setCurrentRir(e.target.value);
                    if (e.target.value) setCurrentRpe('');
                  }}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setNotes">Notes (Optional)</Label>
              <Textarea
                id="setNotes"
                value={currentSetNotes}
                onChange={(e) => setCurrentSetNotes(e.target.value)}
                placeholder="Any notes about this set..."
                rows={2}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={editingSetId ? handleUpdateSet : handleAddSet}
                disabled={!currentExerciseName.trim() || !currentReps}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {editingSetId ? 'Update Set' : 'Add Set'}
              </Button>
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Set Button */}
      {!isAddingSet && (
        <Button
          onClick={() => setIsAddingSet(true)}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Set
        </Button>
      )}

      {/* Logged Sets - Grouped by Exercise */}
      {sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logged Sets ({sets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getExistingExerciseNames().map((exerciseName) => {
                const exerciseSets = sets.filter(set => set.exerciseName === exerciseName);
                const isExpanded = expandedExercises.has(exerciseName);
                
                const toggleExercise = () => {
                  setExpandedExercises(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(exerciseName)) {
                      newSet.delete(exerciseName);
                    } else {
                      newSet.add(exerciseName);
                    }
                    return newSet;
                  });
                };

                return (
                  <div key={exerciseName} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center space-x-2 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleExercise}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <h3 className="text-lg font-semibold">{exerciseName}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentExerciseName(exerciseName);
                          setIsAddingSet(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Set</span>
                      </Button>
                    </div>
                    {isExpanded && (
                      <div className="space-y-2">
                      {exerciseSets.map((set) => (
                        <div
                          key={set.id}
                          className="p-3 rounded-lg border bg-card"
                        >
                          {/* Header: Badge and Action Buttons */}
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs px-2 py-1 rounded-md ${
                              set.setType === 'warmup'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-primary/20 text-primary'
                            }`}>
                              {set.setType === 'warmup' ? 'Warmup' : 'Working'}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSet(set)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSet(set.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Metrics: Full width */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            {set.weight !== undefined && (
                              <div>
                                <span className="font-medium">Weight: </span>
                                {set.weight} lbs
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Reps: </span>
                              {set.reps}
                            </div>
                            {set.rpe !== undefined && (
                              <div>
                                <span className="font-medium">RPE: </span>
                                {set.rpe}
                              </div>
                            )}
                            {set.rir !== undefined && (
                              <div>
                                <span className="font-medium">RIR: </span>
                                {set.rir}
                              </div>
                            )}
                          </div>
                          
                          {/* Notes */}
                          {set.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Note: </span>
                              {set.notes}
                            </div>
                          )}
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workout Notes & Complete */}
      {sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did the workout feel? Any overall notes..."
              rows={3}
            />
            <Button
              onClick={handleComplete}
              disabled={!workoutName.trim() || sets.length === 0}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Complete Workout
            </Button>
          </CardContent>
        </Card>
      )}

      <ThemeToggle />
    </div>
  );
}

