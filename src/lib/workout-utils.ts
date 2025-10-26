import { Exercise, ExerciseFormData, WorkoutDay, WorkoutDayFormData, WorkoutSplit, WorkoutSplitFormData } from './types';

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Convert form data to exercise
export const formDataToExercise = (formData: ExerciseFormData): Exercise => {
  const intensityMetricType = formData.intensityMetricType as 'rpe' | 'rir';
  const intensityMetricValue = typeof formData.intensityMetricValue === 'string' 
    ? (formData.intensityMetricValue.trim() === '' ? 0 : parseInt(formData.intensityMetricValue) || 0)
    : formData.intensityMetricValue;

  // If no metric type is selected, use empty string for type and 0 for value
  const intensityMetric = formData.intensityMetricType 
    ? { type: intensityMetricType, value: intensityMetricValue }
    : { type: '' as 'rpe' | 'rir' | '', value: 0 };

  return {
    id: generateId(),
    name: formData.name,
    warmupSets: typeof formData.warmupSets === 'string' ? parseInt(formData.warmupSets) || 0 : formData.warmupSets,
    workingSets: typeof formData.workingSets === 'string' ? parseInt(formData.workingSets) || 1 : formData.workingSets,
    repRange: {
      min: typeof formData.repRangeMin === 'string' ? parseInt(formData.repRangeMin) || 1 : formData.repRangeMin,
      max: typeof formData.repRangeMax === 'string' ? parseInt(formData.repRangeMax) || 1 : formData.repRangeMax,
    },
    intensityMetric,
    restTime: typeof formData.restTime === 'string' ? parseFloat(formData.restTime) || 0 : formData.restTime, // in minutes
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

// Format intensity metric (RPE or RIR)
export const formatIntensityMetric = (type: 'rpe' | 'rir' | '', value: number): string => {
  // If type is empty string, it means not specified
  if (!type) return 'Not specified';
  return type === 'rpe' ? `RPE ${value}` : `RIR ${value}`;
};

// Validate exercise form data
export const validateExerciseForm = (formData: ExerciseFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('Exercise name is required');
  }
  
  // Convert string values to numbers for validation
  const warmupSets = typeof formData.warmupSets === 'string' ? parseInt(formData.warmupSets) : formData.warmupSets;
  const workingSets = typeof formData.workingSets === 'string' ? parseInt(formData.workingSets) : formData.workingSets;
  const repRangeMin = typeof formData.repRangeMin === 'string' ? parseInt(formData.repRangeMin) : formData.repRangeMin;
  const repRangeMax = typeof formData.repRangeMax === 'string' ? parseInt(formData.repRangeMax) : formData.repRangeMax;
  const intensityMetricValue = typeof formData.intensityMetricValue === 'string' ? parseInt(formData.intensityMetricValue) : formData.intensityMetricValue;
  const restTime = typeof formData.restTime === 'string' ? parseFloat(formData.restTime) : formData.restTime;
  
  // Check for empty required fields
  if (typeof formData.workingSets === 'string' && formData.workingSets.trim() === '') {
    errors.push('Working sets is required');
  }
  
  if (typeof formData.repRangeMin === 'string' && formData.repRangeMin.trim() === '') {
    errors.push('Min reps is required');
  }
  
  if (typeof formData.repRangeMax === 'string' && formData.repRangeMax.trim() === '') {
    errors.push('Max reps is required');
  }
  
  if (typeof formData.intensityMetricValue === 'string' && formData.intensityMetricValue.trim() === '') {
    // Intensity metric is optional, so no error for empty values
  }
  
  if (typeof formData.restTime === 'string' && formData.restTime.trim() === '') {
    errors.push('Rest time is required');
  }
  
  // Validate numeric values
  if (!isNaN(warmupSets) && warmupSets < 0) {
    errors.push('Warmup sets must be 0 or greater');
  }
  
  if (!isNaN(workingSets) && workingSets < 1) {
    errors.push('Working sets must be at least 1');
  }
  
  if (!isNaN(repRangeMin) && !isNaN(repRangeMax) && (repRangeMin < 1 || repRangeMax < 1)) {
    errors.push('Rep range must be at least 1');
  }
  
  if (!isNaN(repRangeMin) && !isNaN(repRangeMax) && repRangeMin > repRangeMax) {
    errors.push('Min reps cannot be greater than max');
  }
  
  if (!isNaN(intensityMetricValue)) {
    if (formData.intensityMetricType === 'rpe' && (intensityMetricValue < 1 || intensityMetricValue > 10)) {
      errors.push('RPE must be between 1 and 10');
    }
    if (formData.intensityMetricType === 'rir' && (intensityMetricValue < 0 || intensityMetricValue > 10)) {
      errors.push('RIR must be between 0 and 10');
    }
  }
  
  if (!isNaN(restTime) && restTime < 0) {
    errors.push('Rest time must be 0 or greater');
  }
  
  return errors;
};
