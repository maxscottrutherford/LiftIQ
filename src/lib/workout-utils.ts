import { Exercise, ExerciseFormData, WorkoutDay, WorkoutDayFormData, WorkoutSplit, WorkoutSplitFormData } from './types';

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Convert form data to exercise
export const formDataToExercise = (formData: ExerciseFormData): Exercise => {
  return {
    id: generateId(),
    name: formData.name,
    warmupSets: formData.warmupSets,
    workingSets: formData.workingSets,
    repRange: {
      min: formData.repRangeMin,
      max: formData.repRangeMax,
    },
    rpe: formData.rpe,
    restTime: formData.restTime, // in minutes
    notes: formData.notes,
  };
};

// Convert form data to workout day
export const formDataToWorkoutDay = (formData: WorkoutDayFormData): WorkoutDay => {
  return {
    id: generateId(),
    name: formData.name,
    exercises: formData.exercises.map(formDataToExercise),
  };
};

// Convert form data to workout split
export const formDataToWorkoutSplit = (formData: WorkoutSplitFormData): WorkoutSplit => {
  const now = new Date();
  return {
    id: generateId(),
    name: formData.name,
    description: formData.description,
    days: formData.days.map(formDataToWorkoutDay),
    createdAt: now,
    updatedAt: now,
  };
};

// Format time in minutes to readable format
export const formatRestTime = (minutes: number): string => {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`;
  }
  if (minutes === Math.floor(minutes)) {
    return `${minutes}m`;
  }
  const wholeMinutes = Math.floor(minutes);
  const seconds = Math.round((minutes - wholeMinutes) * 60);
  return `${wholeMinutes}m ${seconds}s`;
};

// Format rep range
export const formatRepRange = (min: number, max: number): string => {
  if (min === max) {
    return `${min} reps`;
  }
  return `${min}-${max} reps`;
};

// Format sets
export const formatSets = (sets: number): string => {
  return `${sets} set${sets !== 1 ? 's' : ''}`;
};

// Format RPE
export const formatRPE = (rpe: number): string => {
  return `RPE ${rpe}`;
};

// Validate exercise form data
export const validateExerciseForm = (formData: ExerciseFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('Exercise name is required');
  }
  
  if (formData.warmupSets < 0) {
    errors.push('Warmup sets must be 0 or greater');
  }
  
  if (formData.workingSets < 1) {
    errors.push('Working sets must be at least 1');
  }
  
  if (formData.repRangeMin < 1 || formData.repRangeMax < 1) {
    errors.push('Rep range must be at least 1');
  }
  
  if (formData.repRangeMin > formData.repRangeMax) {
    errors.push('Min reps cannot be greater than max');
  }
  
  if (formData.rpe < 1 || formData.rpe > 10) {
    errors.push('RPE must be between 1 and 10');
  }
  
  if (formData.restTime < 0) {
    errors.push('Rest time must be 0 or greater');
  }
  
  return errors;
};

// Common exercise templates
export const exerciseTemplates: Partial<ExerciseFormData>[] = [
  {
    name: 'Bench Press',
    warmupSets: 2,
    workingSets: 3,
    repRangeMin: 5,
    repRangeMax: 8,
    rpe: 8,
    restTime: 3,
  },
  {
    name: 'Squat',
    warmupSets: 3,
    workingSets: 4,
    repRangeMin: 3,
    repRangeMax: 6,
    rpe: 8,
    restTime: 4,
  },
  {
    name: 'Deadlift',
    warmupSets: 4,
    workingSets: 3,
    repRangeMin: 1,
    repRangeMax: 5,
    rpe: 9,
    restTime: 5,
  },
  {
    name: 'Overhead Press',
    warmupSets: 1,
    workingSets: 3,
    repRangeMin: 6,
    repRangeMax: 10,
    rpe: 8,
    restTime: 2,
  },
  {
    name: 'Pull-ups',
    warmupSets: 0,
    workingSets: 4,
    repRangeMin: 5,
    repRangeMax: 12,
    rpe: 7,
    restTime: 1.5,
  },
];
