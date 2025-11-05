import { WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';
import { EnhancedWorkoutAnalysis } from './ml-integration';

interface FilteredExerciseData {
  predictions: {
    exerciseId: string;
    prediction: any;
  } | null;
  patterns: any[];
  recommendations: any[];
}

interface ChartDataPoint {
  date: string;
  maxWeight: number;
  sessionDate: Date;
}

/**
 * Filter exercise-specific data by selected exercise
 */
export function filterExerciseData(
  analysis: EnhancedWorkoutAnalysis | null,
  selectedExercise: string
): FilteredExerciseData {
  if (!analysis || !selectedExercise) {
    return {
      predictions: null,
      patterns: [],
      recommendations: [],
    };
  }

  // Filter predictions by exercise name
  const filteredPredictions = analysis.weightPredictions ? (() => {
    const predictions = Array.from(analysis.weightPredictions.exercisePredictions.entries()).find(([exerciseId]) => {
      const pattern = analysis.exercisePatterns.find(p => p.exerciseId === exerciseId);
      return pattern?.exerciseName === selectedExercise;
    });
    return predictions ? { exerciseId: predictions[0], prediction: predictions[1] } : null;
  })() : null;

  // Filter exercise patterns
  const filteredPatterns = analysis.exercisePatterns.filter(
    pattern => pattern.exerciseName === selectedExercise
  );

  // Filter recommendations by exercise name
  const filteredRecommendations = analysis.recommendations.filter(
    rec => rec.exerciseName === selectedExercise
  );

  return {
    predictions: filteredPredictions,
    patterns: filteredPatterns,
    recommendations: filteredRecommendations,
  };
}

/**
 * Prepare chart data for selected exercise
 */
export function prepareChartData(
  sessions: WorkoutSession[],
  selectedExercise: string
): ChartDataPoint[] {
  if (!selectedExercise || sessions.length === 0) return [];

  const dataPoints: ChartDataPoint[] = [];

  sessions.forEach((session: WorkoutSession) => {
    const exercise = session.exerciseLogs.find(
      (ex: ExerciseLog) => ex.exerciseName.trim() === selectedExercise
    );

    if (!exercise) return;

    const completedSets = exercise.sets.filter((set: SetLog) => set.completed && set.weight !== undefined);
    
    if (completedSets.length > 0) {
      const maxWeight = Math.max(...completedSets.map((set: SetLog) => set.weight!));
      const sessionDate = session.completedAt || session.startedAt;
      
      dataPoints.push({
        date: sessionDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        maxWeight,
        sessionDate,
      });
    }
  });

  return dataPoints.sort((a, b) => 
    a.sessionDate.getTime() - b.sessionDate.getTime()
  );
}

