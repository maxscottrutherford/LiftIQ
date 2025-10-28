'use client';

import { useState } from 'react';
import { WorkoutDay, Exercise, ExerciseFormData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseForm } from './ExerciseForm';
import { formDataToExercise } from '@/lib/workout-utils';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface WorkoutDayCardProps {
  workoutDay: WorkoutDay;
  onUpdate: (updatedDay: WorkoutDay) => void;
  onDelete: (dayId: string) => void;
  showActions?: boolean;
}

export function WorkoutDayCard({ workoutDay, onUpdate, onDelete, showActions = true }: WorkoutDayCardProps) {
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isExercisesExpanded, setIsExercisesExpanded] = useState(false);

  const handleAddExercise = (formData: ExerciseFormData) => {
    const newExercise = formDataToExercise(formData);
    const updatedDay = {
      ...workoutDay,
      exercises: [...workoutDay.exercises, newExercise],
    };
    onUpdate(updatedDay);
    setIsAddingExercise(false);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = (formData: ExerciseFormData) => {
    const updatedExercise = formDataToExercise(formData);
    const updatedDay = {
      ...workoutDay,
      exercises: workoutDay.exercises.map(ex => 
        ex.id === editingExercise!.id ? updatedExercise : ex
      ),
    };
    onUpdate(updatedDay);
    setEditingExercise(null);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    const updatedDay = {
      ...workoutDay,
      exercises: workoutDay.exercises.filter(ex => ex.id !== exerciseId),
    };
    onUpdate(updatedDay);
  };

  const handleCancelAdd = () => {
    setIsAddingExercise(false);
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  if (editingExercise) {
    const formData: ExerciseFormData = {
      name: editingExercise.name,
      warmupSets: editingExercise.warmupSets,
      workingSets: editingExercise.workingSets,
      repRangeMin: editingExercise.repRange.min,
      repRangeMax: editingExercise.repRange.max,
      intensityMetricType: editingExercise.intensityMetric.type || '',
      intensityMetricValue: editingExercise.intensityMetric.value,
      restTime: editingExercise.restTime,
      notes: editingExercise.notes,
    };

    return (
      <ExerciseForm
        onSubmit={handleUpdateExercise}
        onCancel={handleCancelEdit}
        initialData={formData}
        isEditing={true}
      />
    );
  }

  const isRestDay = workoutDay.name === 'Rest Day';

  return (
    <Card className={`w-full`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => !isRestDay && setIsExercisesExpanded(!isExercisesExpanded)}
          >
            <CardTitle className={`text-xl`}>
              {workoutDay.name}
            </CardTitle>
            {!isRestDay && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isExercisesExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {showActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(workoutDay.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {isRestDay ? (
          <p className="text-sm text-muted-foreground">
            Take a break and let your muscles recover
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {workoutDay.exercises.length} exercise{workoutDay.exercises.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exercises List */}
        {!isRestDay && isExercisesExpanded && (
          <>
            {workoutDay.exercises.length > 0 ? (
              <div className="space-y-3">
                {workoutDay.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={handleEditExercise}
                    onDelete={handleDeleteExercise}
                    showActions={showActions}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No exercises added yet</p>
                <p className="text-sm">Click &quot;Add Exercise&quot; to get started</p>
              </div>
            )}

            {/* Add Exercise Form */}
            {isAddingExercise && (
              <ExerciseForm
                onSubmit={handleAddExercise}
                onCancel={handleCancelAdd}
              />
            )}

            {/* Add Exercise Button */}
            {!isAddingExercise && showActions && (
              <Button
                variant="outline"
                onClick={() => setIsAddingExercise(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
