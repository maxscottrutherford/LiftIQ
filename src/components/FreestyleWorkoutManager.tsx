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
import { ArrowLeft, Plus, Save, Trash2, CheckCircle, Edit2 } from 'lucide-react';

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

  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [sets, setSets] = useState<FreestyleSet[]>([]);
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [startedAt] = useState<Date>(() => new Date()); // Track when workout started

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

    const newSet: FreestyleSet = {
      id: generateId(),
      exerciseName: currentExerciseName.trim(),
      setType: currentSetType,
      weight: currentWeight ? parseFloat(currentWeight) : undefined,
      reps: parseInt(currentReps) || 0,
      rpe: currentRpe ? parseInt(currentRpe) : undefined,
      rir: currentRir ? parseInt(currentRir) : undefined,
      notes: currentSetNotes.trim() || undefined,
    };

    setSets(prev => [...prev, newSet]);
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

  const handleComplete = () => {
    if (!workoutName.trim() || sets.length === 0) return;
    onComplete(workoutName.trim(), sets, workoutNotes.trim() || undefined, startedAt);
  };

  const handleCancel = () => {
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
                    value={currentExerciseName && getExistingExerciseNames().includes(currentExerciseName) ? currentExerciseName : ''}
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
                    onChange={(e) => setCurrentExerciseName(e.target.value)}
                    placeholder="Or type new exercise name"
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
                return (
                  <div key={exerciseName} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <h3 className="text-lg font-semibold">{exerciseName}</h3>
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
                    <div className="space-y-2">
                      {exerciseSets.map((set) => (
                        <div
                          key={set.id}
                          className="p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded-md ${
                                  set.setType === 'warmup'
                                    ? 'bg-accent/20 text-accent'
                                    : 'bg-primary/20 text-primary'
                                }`}>
                                  {set.setType === 'warmup' ? 'Warmup' : 'Working'}
                                </span>
                              </div>
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
                              {set.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{set.notes}</p>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-4">
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
                        </div>
                      ))}
                    </div>
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

