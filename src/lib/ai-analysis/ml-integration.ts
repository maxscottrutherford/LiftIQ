/**
 * Simple ML Integration - Weight Progression Predictions Only
 * 
 * This module adds simple ML-based weight progression predictions
 * to the rule-based analysis system.
 */

import { WorkoutSession } from '../types';
import { ExerciseHistory, WorkoutAnalysis, WorkoutRecommendation } from './types';
import { extractExerciseHistory, detectExercisePatterns } from './pattern-detector';
import { generateRecommendations } from './recommendations';
import { predictNextWeight, WeightProgressionPrediction } from './ml-predictions';

/**
 * Enhanced analysis with simple ML weight predictions
 */
export interface EnhancedWorkoutAnalysis extends WorkoutAnalysis {
  weightPredictions?: {
    exercisePredictions: Map<string, WeightProgressionPrediction>;
  };
}

/**
 * Perform analysis with simple ML weight progression predictions
 */
export async function analyzeWorkoutsWithML(
  sessions: WorkoutSession[],
  options: {
    useML?: boolean;
    lookbackDays?: number;
    minSessions?: number;
  } = {}
): Promise<EnhancedWorkoutAnalysis> {
  const { useML = true, ...analysisOptions } = options;

  // First, do standard rule-based analysis
  const baseAnalysis = await import('./workout-analyzer').then(m => 
    m.analyzeWorkouts(sessions, analysisOptions)
  );

  if (!useML) {
    return baseAnalysis;
  }

  // Extract exercise histories
  const exerciseHistories = extractExerciseHistory(sessions, {
    ...analysisOptions,
    minSessions: 2, // Need at least 2 sessions for prediction
  });

  // Make simple weight predictions for each exercise
  const weightPredictions = new Map<string, WeightProgressionPrediction>();
  
  for (const history of exerciseHistories) {
    if (history.sessions.length >= 2) {
      try {
        const prediction = predictNextWeight(history);
        weightPredictions.set(history.exerciseId, prediction);
      } catch (error) {
        console.warn(`Failed to predict weight for ${history.exerciseName}:`, error);
      }
    }
  }

  // Generate recommendations that include weight progression suggestions
  const recommendations = generateWeightProgressionRecommendations(
    baseAnalysis.recommendations,
    baseAnalysis.exercisePatterns,
    weightPredictions
  );

  return {
    ...baseAnalysis,
    weightPredictions: {
      exercisePredictions: weightPredictions,
    },
    recommendations,
  };
}

/**
 * Generate recommendations that include ML weight progression suggestions
 */
function generateWeightProgressionRecommendations(
  ruleBasedRecs: WorkoutRecommendation[],
  patterns: any[],
  weightPredictions: Map<string, WeightProgressionPrediction>
): WorkoutRecommendation[] {
  const recommendations = [...ruleBasedRecs];
  const recommendationsMap = new Map<string, WorkoutRecommendation>();

  // Index existing recommendations by exercise
  ruleBasedRecs.forEach(rec => {
    if (rec.exerciseName) {
      recommendationsMap.set(rec.exerciseName.toLowerCase(), rec);
    }
  });

  // Add weight progression recommendations
  weightPredictions.forEach((prediction, exerciseId) => {
    const pattern = patterns.find(p => p.exerciseId === exerciseId);
    if (!pattern) return;

    const exerciseName = pattern.exerciseName;

    // Only add recommendation if there's a meaningful increase and decent confidence
    if (prediction.weightIncrease > 0 && prediction.confidence >= 0.5) {
      const existingRec = recommendationsMap.get(exerciseName.toLowerCase());
      
      // Don't add if there's already a progression recommendation
      if (!existingRec || existingRec.type !== 'progression_ready') {
        recommendations.push({
          id: `ml-weight-progression-${exerciseId}`,
          type: 'progression_ready',
          priority: prediction.confidence >= 0.7 ? 'high' : 'medium',
          exerciseName,
          title: `Suggested Weight: ${prediction.predictedNextWeight} lbs`,
          description: `Based on your training trends, try ${prediction.predictedNextWeight} lbs next session (+${prediction.weightIncrease} lbs from current ${prediction.currentWeight} lbs). ${prediction.reasoning}`,
          actionItems: [
            `Increase weight to ${prediction.predictedNextWeight} lbs`,
            `This is a ${prediction.weightIncrease} lb increase from your last session`,
            `Confidence: ${Math.round(prediction.confidence * 100)}%`,
          ],
          reasoning: prediction.reasoning,
          relatedPatterns: [pattern.patternType],
        });
      }
    }
  });

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return recommendations.sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );
}

/**
 * Get weight prediction for a specific exercise
 */
export async function getExerciseWeightPrediction(
  sessions: WorkoutSession[],
  exerciseId: string,
  exerciseName: string
): Promise<WeightProgressionPrediction | null> {
  try {
    const histories = extractExerciseHistory(sessions, { minSessions: 2 });
    const history = histories.find(h => h.exerciseId === exerciseId || h.exerciseName === exerciseName);
    
    if (!history) return null;

    return predictNextWeight(history);
  } catch (error) {
    console.error('Error getting weight prediction:', error);
    return null;
  }
}
