'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

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
  const STORAGE_KEY = `freestyle_workout_${userId}`;

  // Clean up old freestyle workouts from other users on mount
  useEffect(() => {
    try {
      if (user?.id) {
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.startsWith('freestyle_workout_') && !key.includes(user.id)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  }, [user?.id]);

  // Initialize state - try to restore from localStorage first
  const [workoutName, setWorkoutName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const workoutAge = now - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (parsed.userId === userId && workoutAge < maxAge) {
          return parsed.workoutName || '';
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error restoring workout name:', error);
    }
    return '';
  });

  const [workoutNotes, setWorkoutNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const workoutAge = now - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (parsed.userId === userId && workoutAge < maxAge) {
          return parsed.workoutNotes || '';
        }
      }
    } catch (error) {
      console.error('Error restoring workout notes:', error);
    }
    return '';
  });

  const [sets, setSets] = useState<FreestyleSet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const workoutAge = now - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (parsed.userId === userId && workoutAge < maxAge) {
          return parsed.sets || [];
        }
      }
    } catch (error) {
      console.error('Error restoring sets:', error);
    }
    return [];
  });

  const [startedAt] = useState<Date>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const workoutAge = now - parsed.timestamp;
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (parsed.userId === userId && workoutAge < maxAge && parsed.startedAt) {
          return new Date(parsed.startedAt);
        }
      }
    } catch (error) {
      console.error('Error restoring startedAt:', error);
    }
    return new Date();
  });

  const [isAddingSet, setIsAddingSet] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set()); // Track which exercises are expanded

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


  const generateId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
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

  // Save freestyle workout to localStorage whenever state changes
  // Always save if there's any data (even just startedAt), so we can detect active workouts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        workoutName,
        workoutNotes,
        sets,
        startedAt: startedAt.toISOString(),
        userId,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving freestyle workout to localStorage:', error);
    }
  }, [workoutName, workoutNotes, sets, startedAt, STORAGE_KEY, userId]);

  const handleComplete = () => {
    if (!workoutName.trim() || sets.length === 0) return;
    // Clear localStorage on completion
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    onComplete(workoutName.trim(), sets, workoutNotes.trim() || undefined, startedAt);
  };

  const handleCancel = () => {
    // Don't clear localStorage here - let the user resume if they navigate back
    // localStorage will be cleared when they explicitly complete or cancel from the dashboard
    resetForm();
    onCancel();
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
                  <Select
                    value={currentExerciseName && findCaseInsensitiveMatch(currentExerciseName) ? findCaseInsensitiveMatch(currentExerciseName)! : ''}
                    onValueChange={(value) => {
                      setCurrentExerciseName(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise or type new name below" />
                    </SelectTrigger>
                    <SelectContent>
                      {getExistingExerciseNames().map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Select
                  value={currentSetType}
                  onValueChange={(value) => setCurrentSetType(value as 'warmup' | 'working')}
                >
                  <SelectTrigger id="setType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warmup">Warmup</SelectItem>
                    <SelectItem value="working">Working</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
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

