'use client';

import { useState, useMemo } from 'react';
import { WorkoutSession } from '@/lib/types';
import { useAIAnalysis } from '@/hooks/dashboard/useAIAnalysis';
import { useExerciseSelection } from '@/hooks/dashboard/useExerciseSelection';
import { filterExerciseData, prepareChartData } from '@/lib/ai-analysis/data-utils';
import { AIAnalysisLoading } from './shared/AIAnalysisLoading';
import { AIAnalysisEmpty } from './shared/AIAnalysisEmpty';
import { AIWorkoutAnalysisCard } from './shared/AIWorkoutAnalysisCard';
import { ExerciseSelector } from './shared/ExerciseSelector';
import { ExercisePatternCard } from './shared/ExercisePatternCard';
import { WeightPredictionCard } from './shared/WeightPredictionCard';
import { WeightProgressionChart } from './shared/WeightProgressionChart';
import { RecommendationsList } from './shared/RecommendationsList';

interface AIInsightsProps {
  sessions: WorkoutSession[];
  className?: string;
  selectedExercise?: string;
  onExerciseChange?: (exercise: string) => void;
}

export function AIInsights({ sessions, className, selectedExercise: externalSelectedExercise, onExerciseChange }: AIInsightsProps) {
  const { analysis, loading } = useAIAnalysis(sessions);
  const { availableExercises, selectedExercise, setSelectedExercise } = useExerciseSelection({
    sessions,
    externalSelectedExercise,
    onExerciseChange,
  });

  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

  // Filter exercise-specific data by selected exercise
  const filteredExerciseData = useMemo(() => {
    return filterExerciseData(analysis, selectedExercise);
  }, [analysis, selectedExercise]);

  // Prepare chart data for selected exercise
  const chartData = useMemo(() => {
    return prepareChartData(sessions, selectedExercise);
  }, [sessions, selectedExercise]);

  const toggleRecommendation = (id: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecommendations(newExpanded);
  };

  // Show loading state
  if (loading) {
    return <AIAnalysisLoading className={className} />;
  }

  // Show empty state
  if (!analysis || analysis.sessionsAnalyzed === 0) {
    return <AIAnalysisEmpty className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Workout Analysis - Shows ALL workout data (unfiltered) */}
      <AIWorkoutAnalysisCard analysis={analysis} />

      {/* Exercise Selection */}
      <ExerciseSelector
        exercises={availableExercises}
        selectedExercise={selectedExercise}
        onExerciseChange={setSelectedExercise}
      />

      {/* Exercise Patterns */}
      {selectedExercise && filteredExerciseData.patterns.length > 0 && (
        <ExercisePatternCard patterns={filteredExerciseData.patterns} />
      )}

      {/* Weight Progression Predictions */}
      {selectedExercise && filteredExerciseData.predictions && (
        <WeightPredictionCard
          exerciseId={filteredExerciseData.predictions.exerciseId}
          prediction={filteredExerciseData.predictions.prediction}
        />
      )}

      {/* Recommendations */}
      {selectedExercise && filteredExerciseData.recommendations.length > 0 && (
        <RecommendationsList
          recommendations={filteredExerciseData.recommendations}
          expandedRecommendations={expandedRecommendations}
          onToggleRecommendation={toggleRecommendation}
        />
      )}

      {/* Chart */}
      {selectedExercise && chartData.length > 0 && (
        <WeightProgressionChart data={chartData} />
      )}
    </div>
  );
}
