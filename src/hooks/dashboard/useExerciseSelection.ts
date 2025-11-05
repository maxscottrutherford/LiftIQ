import { useState, useEffect, useMemo } from 'react';
import { WorkoutSession } from '@/lib/types';

interface UseExerciseSelectionProps {
  sessions: WorkoutSession[];
  externalSelectedExercise?: string;
  onExerciseChange?: (exercise: string) => void;
}

interface UseExerciseSelectionReturn {
  availableExercises: string[];
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
}

/**
 * Custom hook to manage exercise selection from workout sessions
 */
export function useExerciseSelection({
  sessions,
  externalSelectedExercise,
  onExerciseChange,
}: UseExerciseSelectionProps): UseExerciseSelectionReturn {
  const [internalSelectedExercise, setInternalSelectedExercise] = useState<string>('');

  // Extract all unique exercise names from all sessions
  const availableExercises = useMemo(() => {
    const exerciseNames = new Set<string>();
    sessions.forEach(session => {
      session.exerciseLogs.forEach(exercise => {
        if (exercise.exerciseName && exercise.exerciseName.trim()) {
          exerciseNames.add(exercise.exerciseName.trim());
        }
      });
    });
    return Array.from(exerciseNames).sort();
  }, [sessions]);

  // Set the first exercise as default when exercises are loaded (only if using internal state)
  useEffect(() => {
    if (availableExercises.length > 0 && !internalSelectedExercise && externalSelectedExercise === undefined) {
      setInternalSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, internalSelectedExercise, externalSelectedExercise]);

  // Use external selectedExercise if provided, otherwise use internal state
  const selectedExercise = externalSelectedExercise !== undefined ? externalSelectedExercise : internalSelectedExercise;
  
  const setSelectedExercise = (exercise: string) => {
    if (onExerciseChange) {
      onExerciseChange(exercise);
    } else {
      setInternalSelectedExercise(exercise);
    }
  };

  return {
    availableExercises,
    selectedExercise,
    setSelectedExercise,
  };
}

