/**
 * Integration layer between rule-based analysis and ML predictions
 * 
 * This module combines:
 * 1. Rule-based pattern detection (current system)
 * 2. ML-based predictions (TensorFlow.js)
 * 3. Hybrid recommendations that use both
 */

import { WorkoutSession } from '../types';
import { ExerciseHistory, WorkoutAnalysis, WorkoutRecommendation } from './types';
import { extractExerciseHistory, detectExercisePatterns } from './pattern-detector';
import { generateRecommendations } from './recommendations';
import { 
  predictNextWorkout, 
  trainPersonalizedModel, 
  WorkoutPrediction 
} from './ml-predictions';
import { loadPredictionModel } from './ml-predictions';

/**
 * Enhanced analysis that combines rule-based and ML predictions
 */
export interface EnhancedWorkoutAnalysis extends WorkoutAnalysis {
  mlPredictions?: {
    exercisePredictions: Map<string, WorkoutPrediction>;
    modelTrained: boolean;
    modelAccuracy?: number;
  };
  hybridRecommendations: WorkoutRecommendation[];
}

/**
 * Perform enhanced analysis with ML predictions
 */
export async function analyzeWorkoutsWithML(
  sessions: WorkoutSession[],
  options: {
    useML?: boolean;
    retrainModel?: boolean;
    lookbackDays?: number;
    minSessions?: number;
  } = {}
): Promise<EnhancedWorkoutAnalysis> {
  const { useML = true, retrainModel = false, ...analysisOptions } = options;

  // First, do standard rule-based analysis
  const baseAnalysis = await import('./workout-analyzer').then(m => 
    m.analyzeWorkouts(sessions, analysisOptions)
  );

  // Extract exercise histories (needed to check if we have enough data per exercise)
  const exerciseHistories = extractExerciseHistory(sessions, {
    ...analysisOptions,
    minSessions: 2, // Lower threshold to allow predictions with fewer sessions
  });

  // Check if we have enough data for ML
  const hasEnoughDataForML = useML && 
    sessions.length >= 3 && // At least 3 total sessions
    exerciseHistories.length > 0 && // At least one exercise with history
    exerciseHistories.some(h => h.sessions.length >= 2); // At least one exercise with 2+ sessions

  if (!hasEnoughDataForML) {
    return {
      ...baseAnalysis,
      hybridRecommendations: baseAnalysis.recommendations,
      mlPredictions: {
        exercisePredictions: new Map(),
        modelTrained: false,
      },
    };
  }

  // Train or load ML model
  let mlPredictions: EnhancedWorkoutAnalysis['mlPredictions'];
  
  try {
    // Only train if we have at least 3 sessions per exercise (for better model quality)
    const shouldTrain = retrainModel || (
      exerciseHistories.some(h => h.sessions.length >= 3) && 
      sessions.length >= 3
    );

    if (shouldTrain) {
      // Train personalized model on user data
      // Reduce epochs if limited data
      const epochs = exerciseHistories.some(h => h.sessions.length >= 5) ? 30 : 10;
      await trainPersonalizedModel(exerciseHistories, epochs);
    }

    // Load the model
    const model = await loadPredictionModel();
    
    if (model) {
      // Make predictions for each exercise that has at least 2 sessions
      const exercisePredictions = new Map<string, WorkoutPrediction>();
      
      for (const history of exerciseHistories) {
        if (history.sessions.length >= 2) {
          try {
            const prediction = await predictNextWorkout(history, model);
            exercisePredictions.set(history.exerciseId, prediction);
          } catch (predError) {
            console.warn(`Failed to predict for ${history.exerciseName}:`, predError);
          }
        }
      }

      mlPredictions = {
        exercisePredictions,
        modelTrained: shouldTrain || model !== null,
      };
    } else {
      mlPredictions = {
        exercisePredictions: new Map(),
        modelTrained: false,
      };
    }
  } catch (error) {
    console.error('ML prediction error:', error);
    mlPredictions = {
      exercisePredictions: new Map(),
      modelTrained: false,
    };
  }

  // Generate hybrid recommendations
  const hybridRecommendations = generateHybridRecommendations(
    baseAnalysis.recommendations,
    baseAnalysis.exercisePatterns,
    mlPredictions?.exercisePredictions || new Map()
  );

  return {
    ...baseAnalysis,
    mlPredictions,
    hybridRecommendations,
  };
}

/**
 * Generate recommendations that combine rule-based and ML insights
 */
function generateHybridRecommendations(
  ruleBasedRecs: WorkoutRecommendation[],
  patterns: any[],
  mlPredictions: Map<string, WorkoutPrediction>
): WorkoutRecommendation[] {
  const recommendations = [...ruleBasedRecs];
  const recommendationsMap = new Map<string, WorkoutRecommendation>();

  // Index existing recommendations by exercise
  ruleBasedRecs.forEach(rec => {
    if (rec.exerciseName) {
      recommendationsMap.set(rec.exerciseName.toLowerCase(), rec);
    }
  });

  // Add ML-enhanced recommendations
  mlPredictions.forEach((prediction, exerciseId) => {
    // Find the pattern for this exercise
    const pattern = patterns.find(p => p.exerciseId === exerciseId);
    if (!pattern) return;

    const exerciseName = pattern.exerciseName;

    // If prediction suggests progression is ready and rule-based doesn't, add it
    if (prediction.progressionReady && prediction.confidence > 0.6) {
      const existingRec = recommendationsMap.get(exerciseName.toLowerCase());
      
      if (!existingRec || existingRec.type !== 'progression_ready') {
        recommendations.push({
          id: `ml-progression-${exerciseId}`,
          type: 'progression_ready',
          priority: prediction.confidence > 0.8 ? 'high' : 'medium',
          exerciseName,
          title: `ML Prediction: Ready to Progress ${exerciseName}`,
          description: `Based on your training patterns, you're predicted to handle ${prediction.progressionAmount} lbs more next session (${Math.round(prediction.confidence * 100)}% confidence).`,
          actionItems: [
            `Increase weight by ${prediction.progressionAmount} lbs`,
            `Target ${prediction.predictedMaxWeight} lbs for your working sets`,
            `Maintain RPE around ${prediction.predictedRPE.toFixed(1)}`,
            `Monitor performance and adjust if needed`,
          ],
          reasoning: `ML model predicts successful progression based on your historical training data and current trends.`,
          relatedPatterns: [pattern.patternType],
        });
      }
    }

    // High deload probability recommendation
    if (prediction.deloadProbability > 0.6 && prediction.confidence > 0.5) {
      const existingDeload = recommendations.find(
        r => r.exerciseName === exerciseName && r.type === 'deload'
      );

      if (!existingDeload) {
        recommendations.push({
          id: `ml-deload-${exerciseId}`,
          type: 'deload',
          priority: prediction.deloadProbability > 0.8 ? 'high' : 'medium',
          exerciseName,
          title: `ML Recommendation: Deload ${exerciseName}`,
          description: `Prediction model suggests a deload (${Math.round(prediction.deloadProbability * 100)}% probability) based on declining trends and high RPE values.`,
          actionItems: [
            `Reduce weight to ${prediction.optimalWeight} lbs`,
            `Reduce volume to ${prediction.optimalVolume} lbs total`,
            `Focus on perfect form`,
            `Take 1 week deload before resuming progression`,
          ],
          reasoning: `ML model detected patterns indicating overreaching. Deloading will allow for supercompensation.`,
          relatedPatterns: [pattern.patternType],
        });
      }
    }

    // Volume optimization
    if (prediction.confidence > 0.7) {
      const currentPattern = pattern.lastThreeSessions[pattern.lastThreeSessions.length - 1];
      const volumeDiff = prediction.optimalVolume - currentPattern.totalVolume;
      const volumeChangePercent = Math.abs((volumeDiff / currentPattern.totalVolume) * 100);

      if (volumeChangePercent > 10) {
        const existingVolume = recommendations.find(
          r => r.exerciseName === exerciseName && (r.type === 'volume_increase' || r.type === 'volume_decrease')
        );

        if (!existingVolume) {
          recommendations.push({
            id: `ml-volume-${exerciseId}`,
            type: volumeDiff > 0 ? 'volume_increase' : 'volume_decrease',
            priority: 'low',
            exerciseName,
            title: `Optimal Volume for ${exerciseName}: ${Math.round(prediction.optimalVolume)} lbs`,
            description: `Model recommends ${volumeDiff > 0 ? 'increasing' : 'decreasing'} volume by ${Math.round(volumeChangePercent)}% to ${Math.round(prediction.optimalVolume)} lbs total for optimal progression.`,
            actionItems: [
              volumeDiff > 0 
                ? `Add 1-2 sets or increase reps slightly`
                : `Reduce by 1 set or decrease reps slightly`,
              `Aim for total volume around ${Math.round(prediction.optimalVolume)} lbs`,
              `Monitor RPE to stay in 7-8 range`,
            ],
            reasoning: `ML model calculated optimal volume based on your progression rate and recovery patterns.`,
            relatedPatterns: [pattern.patternType],
          });
        }
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
 * Get a prediction for a specific exercise
 */
export async function getExercisePrediction(
  sessions: WorkoutSession[],
  exerciseId: string,
  exerciseName: string
): Promise<WorkoutPrediction | null> {
  try {
    const histories = extractExerciseHistory(sessions, { minSessions: 3 });
    const history = histories.find(h => h.exerciseId === exerciseId || h.exerciseName === exerciseName);
    
    if (!history) return null;

    const model = await loadPredictionModel();
    return await predictNextWorkout(history, model || undefined);
  } catch (error) {
    console.error('Error getting exercise prediction:', error);
    return null;
  }
}

