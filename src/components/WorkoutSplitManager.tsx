'use client';

import { useState } from 'react';
import { WorkoutSplit, WorkoutDay, WorkoutDayFormData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutDayCard } from './WorkoutDayCard';
import { formDataToWorkoutDay, generateId } from '@/lib/workout-utils';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface WorkoutSplitManagerProps {
  onSave: (split: WorkoutSplit) => void;
  onCancel: () => void;
  initialSplit?: WorkoutSplit;
}

export function WorkoutSplitManager({ onSave, onCancel, initialSplit }: WorkoutSplitManagerProps) {
  const [splitName, setSplitName] = useState(initialSplit?.name || '');
  const [splitDescription, setSplitDescription] = useState(initialSplit?.description || '');
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(initialSplit?.days || []);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newDayName, setNewDayName] = useState('');

  const isEditing = !!initialSplit;

  const handleAddDay = () => {
    if (!newDayName.trim()) return;
    
    const newDay: WorkoutDay = {
      id: generateId(),
      name: newDayName.trim(),
      exercises: [],
    };
    
    setWorkoutDays(prev => [...prev, newDay]);
    setNewDayName('');
    setIsAddingDay(false);
  };

  const handleUpdateDay = (updatedDay: WorkoutDay) => {
    setWorkoutDays(prev => 
      prev.map(day => day.id === updatedDay.id ? updatedDay : day)
    );
  };

  const handleDeleteDay = (dayId: string) => {
    setWorkoutDays(prev => prev.filter(day => day.id !== dayId));
  };

  const handleSave = () => {
    if (!splitName.trim() || workoutDays.length === 0) return;

    const split: WorkoutSplit = {
      id: initialSplit?.id || generateId(),
      name: splitName.trim(),
      description: splitDescription.trim() || undefined,
      days: workoutDays,
      createdAt: initialSplit?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(split);
  };

  const canSave = splitName.trim() && workoutDays.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Workout Split' : 'Create Workout Split'}
            </h1>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!canSave}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isEditing ? 'Update Split' : 'Save Split'}</span>
        </Button>
      </div>

      {/* Split Details */}
      <Card>
        <CardHeader>
          <CardTitle>Split Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="splitName">Split Name *</Label>
            <Input
              id="splitName"
              value={splitName}
              onChange={(e) => setSplitName(e.target.value)}
              placeholder="e.g., Push/Pull/Legs, Upper/Lower, Full Body"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="splitDescription">Description (Optional)</Label>
            <Textarea
              id="splitDescription"
              value={splitDescription}
              onChange={(e) => setSplitDescription(e.target.value)}
              placeholder="Describe your workout split..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Workout Days</h2>
          <Button
            onClick={() => setIsAddingDay(true)}
            disabled={isAddingDay}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Day</span>
          </Button>
        </div>

        {/* Add New Day Form */}
        {isAddingDay && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-2">
                <Input
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value)}
                  placeholder="e.g., Push Day, Pull Day, Leg Day"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDay()}
                />
                <Button onClick={handleAddDay} disabled={!newDayName.trim()}>
                  Add
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingDay(false);
                    setNewDayName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Days List */}
        {workoutDays.length > 0 ? (
          <div className="space-y-4">
            {workoutDays.map((day) => (
              <WorkoutDayCard
                key={day.id}
                workoutDay={day}
                onUpdate={handleUpdateDay}
                onDelete={handleDeleteDay}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No workout days added yet
              </p>
              <Button onClick={() => setIsAddingDay(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Day
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      {workoutDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Split Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Total Days:</span>
                <p className="text-lg font-semibold">{workoutDays.length}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Total Exercises:</span>
                <p className="text-lg font-semibold">
                  {workoutDays.reduce((total, day) => total + day.exercises.length, 0)}
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Average per Day:</span>
                <p className="text-lg font-semibold">
                  {Math.round(
                    workoutDays.reduce((total, day) => total + day.exercises.length, 0) / workoutDays.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
