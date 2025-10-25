'use client';

import { useState, useEffect } from 'react';
import { WorkoutSplit } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutSplitCard } from './WorkoutSplitCard';
import { WorkoutSplitManager } from './WorkoutSplitManager';
import { Plus, Dumbbell } from 'lucide-react';
import Image from 'next/image';

export function WorkoutSplitDashboard() {
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSplit, setEditingSplit] = useState<WorkoutSplit | null>(null);

  // Load splits from localStorage on mount
  useEffect(() => {
    const savedSplits = localStorage.getItem('workoutSplits');
    if (savedSplits) {
      try {
        const parsedSplits = JSON.parse(savedSplits).map((split: any) => ({
          ...split,
          createdAt: new Date(split.createdAt),
          updatedAt: new Date(split.updatedAt),
          days: split.days.map((day: any) => ({
            ...day,
            exercises: day.exercises || []
          }))
        }));
        setSplits(parsedSplits);
      } catch (error) {
        console.error('Error loading workout splits:', error);
      }
    }
  }, []);

  // Save splits to localStorage whenever splits change
  useEffect(() => {
    if (splits.length > 0) {
      localStorage.setItem('workoutSplits', JSON.stringify(splits));
    }
  }, [splits]);

  const handleCreateSplit = () => {
    setEditingSplit(null);
    setIsCreating(true);
  };

  const handleEditSplit = (split: WorkoutSplit) => {
    setEditingSplit(split);
    setIsCreating(true);
  };

  const handleSaveSplit = (split: WorkoutSplit) => {
    if (editingSplit) {
      // Update existing split
      setSplits(prev => prev.map(s => s.id === split.id ? split : s));
    } else {
      // Add new split
      setSplits(prev => [...prev, split]);
    }
    setIsCreating(false);
    setEditingSplit(null);
  };

  const handleDeleteSplit = (splitId: string) => {
    if (confirm('Are you sure you want to delete this workout split?')) {
      setSplits(prev => prev.filter(s => s.id !== splitId));
    }
  };

  const handleStartWorkout = (split: WorkoutSplit) => {
    // TODO: Implement workout session functionality
    alert(`Starting workout: ${split.name}\n\nThis feature will be implemented next!`);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSplit(null);
  };

  if (isCreating) {
    return (
      <WorkoutSplitManager
        onSave={handleSaveSplit}
        onCancel={handleCancel}
        initialSplit={editingSplit || undefined}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12">
            <Image
              src="/liftiq-logo-transparent.png"
              alt="LiftIQ Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <span>LiftIQ</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your workout routines
            </p>
          </div>
        </div>
        <Button onClick={handleCreateSplit} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Split</span>
        </Button>
      </div>

      {/* Stats Overview */}
      {splits.length > 0 && (
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
            <div className="relative w-20 h-20 mx-auto mb-6">
              <Image
                src="/liftiq-logo-transparent.png"
                alt="LiftIQ Logo"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Workout Splits Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first workout split to get started with organizing your training routine.
            </p>
            <Button onClick={handleCreateSplit} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Your First Split</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
