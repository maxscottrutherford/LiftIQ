/**
 * Simple ML Weight Progression Prediction
 * 
 * Predicts the next workout weight based on historical trends.
 * Uses a simple linear regression approach - no complex neural networks.
 */

import { ExerciseHistory } from './types';

export interface WeightProgressionPrediction {
  currentWeight: number;
  predictedNextWeight: number;
  weightIncrease: number;
  confidence: number; // 0-1, based on data quality
  reasoning: string;
}

/**
 * Simple linear regression to calculate trend
 */
function calculateWeightTrend(weights: number[]): number {
  if (weights.length < 2) return 0;
  
  const n = weights.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = weights;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return isNaN(slope) ? 0 : slope;
}

/**
 * Calculate confidence based on data quality
 */
function calculateConfidence(history: ExerciseHistory): number {
  let confidence = 0.5; // Base confidence
  
  // More sessions = higher confidence
  if (history.sessions.length >= 5) confidence += 0.3;
  else if (history.sessions.length >= 3) confidence += 0.2;
  
  // Consistency check - are weights generally increasing?
  const weights = history.sessions
    .map(s => s.maxWeight || 0)
    .filter(w => w > 0);
  
  if (weights.length >= 3) {
    const trend = calculateWeightTrend(weights);
    // Positive trend = higher confidence
    if (trend > 0) confidence += 0.2;
  }
  
  return Math.min(1, Math.max(0, confidence));
}

/**
 * Predict next workout weight based on trends
 */
export function predictNextWeight(history: ExerciseHistory): WeightProgressionPrediction {
  const sessions = history.sessions
    .filter(s => s.maxWeight && s.maxWeight > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (sessions.length < 2) {
    const lastWeight = sessions[0]?.maxWeight || 0;
    return {
      currentWeight: lastWeight,
      predictedNextWeight: lastWeight,
      weightIncrease: 0,
      confidence: 0.2,
      reasoning: 'Not enough data (need at least 2 sessions with weight data)',
    };
  }
  
  const weights = sessions.map(s => s.maxWeight!);
  const currentWeight = weights[weights.length - 1];
  
  // Use different strategies based on data amount
  let predictedWeight: number;
  let reasoning: string;
  
  if (weights.length >= 5) {
    // Use last 5 sessions for trend analysis
    const recentWeights = weights.slice(-5);
    const trend = calculateWeightTrend(recentWeights);
    
    // Predict: current + trend (with some smoothing)
    const rawPrediction = currentWeight + trend;
    
    // Cap the increase/decrease to reasonable amounts
    const maxIncrease = currentWeight * 0.1; // Max 10% increase
    const maxDecrease = currentWeight * 0.05; // Max 5% decrease
    
    if (trend > maxIncrease) {
      predictedWeight = currentWeight + maxIncrease;
      reasoning = `Strong upward trend detected. Capped at 10% increase for safety.`;
    } else if (trend < -maxDecrease) {
      predictedWeight = currentWeight - maxDecrease;
      reasoning = `Declining trend detected. Suggesting 5% reduction.`;
    } else {
      predictedWeight = rawPrediction;
      reasoning = `Based on trend analysis of last 5 sessions.`;
    }
  } else if (weights.length >= 3) {
    // Use last 3 sessions for simple average progression
    const recentWeights = weights.slice(-3);
    const avgIncrease = (recentWeights[recentWeights.length - 1] - recentWeights[0]) / (recentWeights.length - 1);
    
    // Conservative: use 75% of average increase
    const conservativeIncrease = avgIncrease * 0.75;
    predictedWeight = currentWeight + Math.max(0, conservativeIncrease);
    
    reasoning = `Based on average progression from last 3 sessions (conservative estimate).`;
  } else {
    // Just 2 sessions - simple difference
    const increase = weights[1] - weights[0];
    predictedWeight = currentWeight + (increase * 0.5); // Use half the increase
    
    reasoning = `Limited data. Using 50% of previous session increase.`;
  }
  
  // Round to nearest 2.5 lbs (standard plate increments)
  predictedWeight = Math.round(predictedWeight / 2.5) * 2.5;
  
  // Ensure prediction is reasonable (not negative, not too high)
  predictedWeight = Math.max(currentWeight * 0.8, Math.min(predictedWeight, currentWeight * 1.15));
  
  const weightIncrease = predictedWeight - currentWeight;
  const confidence = calculateConfidence(history);
  
  return {
    currentWeight,
    predictedNextWeight: Math.round(predictedWeight * 10) / 10,
    weightIncrease: Math.round(weightIncrease * 10) / 10,
    confidence,
    reasoning,
  };
}
