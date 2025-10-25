// Workout and Exercise Types

export interface Exercise {
  id: string;
  name: string;
  warmupSets: number;
  workingSets: number;
  repRange: {
    min: number;
    max: number;
  };
  rpe: number;
  restTime: number; // in minutes
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g., "Push Day", "Pull Day", "Leg Day"
  exercises: Exercise[];
  date?: Date;
}

export interface WorkoutSplit {
  id: string;
  name: string; // e.g., "Push/Pull/Legs", "Upper/Lower"
  description?: string;
  days: WorkoutDay[];
  createdAt: Date;
  updatedAt: Date;
}

// Form input types
export interface ExerciseFormData {
  name: string;
  warmupSets: number;
  workingSets: number;
  repRangeMin: number;
  repRangeMax: number;
  rpe: number;
  restTime: number; // in minutes
  notes?: string;
}

export interface WorkoutDayFormData {
  name: string;
  exercises: ExerciseFormData[];
}

export interface WorkoutSplitFormData {
  name: string;
  description?: string;
  days: WorkoutDayFormData[];
}

// Utility types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  day: DayOfWeek;
  workoutDay?: WorkoutDay;
  isRestDay: boolean;
}
