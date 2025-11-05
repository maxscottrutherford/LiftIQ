import { WorkoutSplit, WorkoutDay, Exercise } from '@/lib/types';
import { generateId } from '@/lib/workout/utils';

/**
 * Structure expected from AI response for workout plans
 */
export interface AIWorkoutPlan {
  name: string;
  description?: string;
  days: AIWorkoutDay[];
}

export interface AIWorkoutDay {
  name: string;
  exercises: AIExercise[];
}

export interface AIExercise {
  name: string;
  warmupSets?: number;
  workingSets: number;
  repRange: {
    min: number;
    max: number;
  };
  intensityMetric?: {
    type: 'rpe' | 'rir';
    value: number;
  };
  restTime?: number; // in minutes
  notes?: string;
}

/**
 * Parse AI JSON response into WorkoutSplit format
 */
export function parseAIWorkoutPlan(aiResponse: string): WorkoutSplit | null {
  try {
    // Clean the response - remove any markdown code blocks if present
    let cleanedResponse = aiResponse.trim();
    
    // Check if response is wrapped in markdown code blocks
    const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[1].trim();
    }
    
    // Try to parse as JSON
    const plan: AIWorkoutPlan = JSON.parse(cleanedResponse);

    // Validate structure
    if (!plan.name || !plan.days || !Array.isArray(plan.days)) {
      console.error('Invalid workout plan structure:', plan);
      return null;
    }

    // Convert to WorkoutSplit format
    const now = new Date();
    const split: WorkoutSplit = {
      id: generateId(),
      name: plan.name,
      description: plan.description || '',
      days: plan.days.map((day): WorkoutDay => ({
        id: generateId(),
        name: day.name,
        exercises: day.exercises.map((exercise): Exercise => ({
          id: generateId(),
          name: exercise.name,
          warmupSets: exercise.warmupSets || 0,
          workingSets: exercise.workingSets,
          repRange: exercise.repRange,
          intensityMetric: exercise.intensityMetric || { type: '', value: 0 },
          restTime: exercise.restTime || 2, // Default 2 minutes
          notes: exercise.notes,
        })),
      })),
      createdAt: now,
      updatedAt: now,
    };

    return split;
  } catch (error) {
    console.error('Error parsing AI workout plan:', error);
    return null;
  }
}

/**
 * Validate that a workout plan has the minimum required structure
 */
export function validateWorkoutPlan(plan: AIWorkoutPlan): boolean {
  if (!plan.name || plan.name.trim().length === 0) return false;
  if (!plan.days || plan.days.length === 0) return false;
  
  for (const day of plan.days) {
    if (!day.name || day.name.trim().length === 0) return false;
    if (!day.exercises || day.exercises.length === 0) return false;
    
    for (const exercise of day.exercises) {
      if (!exercise.name || exercise.name.trim().length === 0) return false;
      if (!exercise.workingSets || exercise.workingSets < 1) return false;
      if (!exercise.repRange || !exercise.repRange.min || !exercise.repRange.max) return false;
    }
  }
  
  return true;
}

