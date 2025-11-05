import { Exercise, ExerciseFormData, WorkoutDay, WorkoutDayFormData, WorkoutSplit, WorkoutSplitFormData, WorkoutSession, ExerciseLog, SetLog, SetLogFormData, ExerciseLogFormData } from './types';

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

// Workout Session Utilities

// Create a new workout session from a workout day
export const createWorkoutSession = (split: WorkoutSplit, dayId: string): WorkoutSession => {
  const day = split.days.find(d => d.id === dayId);
  if (!day) {
    throw new Error('Workout day not found');
  }

  const exerciseLogs: ExerciseLog[] = day.exercises.map(exercise => ({
    id: generateId(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    sets: createSetLogsFromExercise(exercise),
    notes: exercise.notes,
  }));

  return {
    id: generateId(),
    splitId: split.id,
    splitName: split.name,
    dayId: day.id,
    dayName: day.name,
    startedAt: new Date(),
    status: 'active',
    exerciseLogs,
  };
};

// Create set logs from an exercise template
export const createSetLogsFromExercise = (exercise: Exercise): SetLog[] => {
  const sets: SetLog[] = [];
  let setNumber = 1;

  // Add warmup sets
  for (let i = 0; i < exercise.warmupSets; i++) {
    sets.push({
      id: generateId(),
      setNumber: setNumber++,
      type: 'warmup',
      reps: 0,
      completed: false,
    });
  }

  // Add working sets
  for (let i = 0; i < exercise.workingSets; i++) {
    sets.push({
      id: generateId(),
      setNumber: setNumber++,
      type: 'working',
      reps: 0,
      completed: false,
    });
  }

  return sets;
};

// Convert form data to set log
export const formDataToSetLog = (formData: SetLogFormData, setNumber: number, type: 'warmup' | 'working'): SetLog => {
  const weightValue = typeof formData.weight === 'string' 
    ? (formData.weight.trim() === '' ? undefined : parseFloat(formData.weight))
    : formData.weight;
    
  return {
    id: generateId(),
    setNumber,
    type,
    weight: weightValue === undefined || isNaN(weightValue) ? undefined : weightValue,
    reps: typeof formData.reps === 'string' ? parseInt(formData.reps) || 0 : formData.reps,
    rpe: typeof formData.rpe === 'string' ? parseInt(formData.rpe) || undefined : formData.rpe,
    rir: typeof formData.rir === 'string' ? parseInt(formData.rir) || undefined : formData.rir,
    completed: formData.completed,
    completedAt: formData.completed ? new Date() : undefined,
  };
};

// Convert form data to exercise log
export const formDataToExerciseLog = (formData: ExerciseLogFormData): ExerciseLog => {
  return {
    id: generateId(),
    exerciseId: formData.exerciseId,
    exerciseName: formData.exerciseName,
    sets: formData.sets.map((setData, index) => formDataToSetLog(setData, index + 1, 'working')),
    completedAt: formData.sets.every(set => set.completed) ? new Date() : undefined,
    notes: formData.notes,
  };
};

// Complete a workout session
export const completeWorkoutSession = (session: WorkoutSession): WorkoutSession => {
  const now = new Date();
  const duration = Math.round((now.getTime() - session.startedAt.getTime()) / (1000 * 60)); // in minutes
  
  return {
    ...session,
    status: 'completed',
    completedAt: now,
    totalDuration: duration,
  };
};

// Calculate session progress
export const calculateSessionProgress = (session: WorkoutSession): { completed: number; total: number; percentage: number } => {
  const totalSets = session.exerciseLogs.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = session.exerciseLogs.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  );
  
  return {
    completed: completedSets,
    total: totalSets,
    percentage: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
  };
};

// Get current exercise and set for session
export const getCurrentExerciseAndSet = (session: WorkoutSession): { exerciseIndex: number; setIndex: number } | null => {
  for (let exerciseIndex = 0; exerciseIndex < session.exerciseLogs.length; exerciseIndex++) {
    const exercise = session.exerciseLogs[exerciseIndex];
    for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
      const set = exercise.sets[setIndex];
      if (!set.completed) {
        return { exerciseIndex, setIndex };
      }
    }
  }
  return null; // All sets completed
};

// Format session duration
export const formatSessionDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

// Validate set log form data
export const validateSetLogForm = (formData: SetLogFormData): string[] => {
  const errors: string[] = [];
  
  const reps = typeof formData.reps === 'string' ? parseInt(formData.reps) : formData.reps;
  const weightValue = typeof formData.weight === 'string' 
    ? (formData.weight.trim() === '' ? undefined : parseFloat(formData.weight))
    : formData.weight;
  const weight = weightValue === undefined || isNaN(weightValue) ? undefined : weightValue;
  const rpe = typeof formData.rpe === 'string' ? parseInt(formData.rpe) : formData.rpe;
  const rir = typeof formData.rir === 'string' ? parseInt(formData.rir) : formData.rir;
  
  if (formData.completed) {
    if (!reps || reps < 1) {
      errors.push('Reps must be at least 1 when set is completed');
    }
    
    if (weight !== undefined && weight < 0) {
      errors.push('Weight cannot be negative');
    }
    
    if (rpe !== undefined && (rpe < 1 || rpe > 10)) {
      errors.push('RPE must be between 1 and 10');
    }
    
    if (rir !== undefined && (rir < 0 || rir > 10)) {
      errors.push('RIR must be between 0 and 10');
    }
  }
  
  return errors;
};

// Freestyle Workout Utilities

interface FreestyleSet {
  id?: string;
  exerciseName: string;
  setType: 'warmup' | 'working';
  weight?: number;
  reps: number;
  rpe?: number;
  rir?: number;
  notes?: string;
}

/**
 * Converts freestyle workout sets to a WorkoutSession
 */
export const convertFreestyleToWorkoutSession = (
  workoutName: string,
  sets: FreestyleSet[],
  notes?: string,
  startedAt?: Date
): WorkoutSession => {
  // Group sets by exercise name to create ExerciseLog objects
  const exerciseGroups = new Map<string, FreestyleSet[]>();
  
  sets.forEach(set => {
    const exerciseName = set.exerciseName;
    if (!exerciseGroups.has(exerciseName)) {
      exerciseGroups.set(exerciseName, []);
    }
    exerciseGroups.get(exerciseName)!.push(set);
  });

  // Convert grouped sets to ExerciseLog format
  // Create a map to track original insertion order
  const setOrderMap = new Map<string, number>();
  sets.forEach((set, index) => {
    setOrderMap.set(set.id || `set-${index}`, index);
  });

  const exerciseLogs: ExerciseLog[] = Array.from(exerciseGroups.entries()).map(([exerciseName, exerciseSets]) => {
    // Sort sets by original insertion order
    const sortedSets = exerciseSets.sort((a, b) => {
      const orderA = setOrderMap.get(a.id || '') ?? 0;
      const orderB = setOrderMap.get(b.id || '') ?? 0;
      return orderA - orderB;
    });

    // Convert FreestyleSet to SetLog format
    const setLogs: SetLog[] = sortedSets.map((set, index) => ({
      id: set.id || generateId(),
      setNumber: index + 1,
      type: set.setType,
      weight: set.weight,
      reps: set.reps,
      rpe: set.rpe,
      rir: set.rir,
      completed: true, // All sets in freestyle workout are completed
      completedAt: new Date(),
    }));

    return {
      id: generateId(),
      exerciseId: generateId(), // Generate a placeholder exercise ID
      exerciseName,
      sets: setLogs,
      completedAt: new Date(),
      notes: exerciseSets.find(s => s.notes)?.notes, // Use first set's notes if available
    };
  });

  // Calculate duration if we have start time
  const duration = startedAt 
    ? Math.round((new Date().getTime() - startedAt.getTime()) / 60000) // Convert to minutes
    : undefined;

  // Create WorkoutSession object
  // For freestyle workouts, we'll use placeholder values for split/day since they don't belong to a split
  return {
    id: generateId(),
    splitId: 'freestyle',
    splitName: 'Freestyle Workout',
    dayId: 'freestyle',
    dayName: workoutName,
    startedAt: startedAt || new Date(),
    completedAt: new Date(),
    status: 'completed',
    exerciseLogs,
    totalDuration: duration,
    notes,
  };
}
