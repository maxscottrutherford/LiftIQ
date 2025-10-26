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
  intensityMetric: {
    type: 'rpe' | 'rir' | '';
    value: number;
  };
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
  warmupSets: number | string;
  workingSets: number | string;
  repRangeMin: number | string;
  repRangeMax: number | string;
  intensityMetricType: 'rpe' | 'rir' | '';
  intensityMetricValue: number | string;
  restTime: number | string; // in minutes
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

// Workout Session Types
export interface ExerciseLog {
  id: string;
  exerciseId: string; // Reference to the original exercise
  exerciseName: string;
  sets: SetLog[];
  completedAt?: Date;
  notes?: string;
}

export interface SetLog {
  id: string;
  setNumber: number;
  type: 'warmup' | 'working';
  weight?: number; // in lbs or kg
  reps: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  rir?: number; // Reps in Reserve 0-10
  completed: boolean;
  completedAt?: Date;
  restTime?: number; // actual rest time taken in minutes
}

export interface WorkoutSession {
  id: string;
  splitId: string; // Reference to the workout split
  splitName: string;
  dayId: string; // Reference to the workout day
  dayName: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'paused';
  exerciseLogs: ExerciseLog[];
  totalDuration?: number; // in minutes
  notes?: string;
}

export interface SessionProgress {
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restEndTime?: Date;
  sessionStartTime: Date;
}

// Form input types for session logging
export interface SetLogFormData {
  weight: number | string;
  reps: number | string;
  rpe?: number | string;
  rir?: number | string;
  completed: boolean;
}

export interface ExerciseLogFormData {
  exerciseId: string;
  exerciseName: string;
  sets: SetLogFormData[];
  notes?: string;
}

// Utility types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  day: DayOfWeek;
  workoutDay?: WorkoutDay;
  isRestDay: boolean;
}
