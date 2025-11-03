/**
 * TensorFlow.js Integration for Predictive Workout Analysis
 * 
 * This module enhances the rule-based analysis with ML predictions:
 * 1. Future performance predictions
 * 2. Optimal deload timing
 * 3. Personalized progression rates
 * 4. Volume/intensity optimization
 */

// TensorFlow.js is optional - import will fail if not installed
// To enable ML features: npm install @tensorflow/tfjs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tf: any = null;

try {
  // Dynamic import to avoid TypeScript errors if not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  tf = require('@tensorflow/tfjs');
} catch {
  // TensorFlow.js not installed - ML features disabled
  // Code will gracefully fall back to rule-based predictions
}

import { ExerciseHistory, ExerciseSessionData } from './types';

// Feature engineering and model management
export interface PredictionFeatures {
  // Historical features (last N sessions)
  recentWeights: number[];        // Last 5 max weights
  recentVolumes: number[];         // Last 5 total volumes
  recentRPEs: number[];           // Last 5 average RPEs
  recentReps: number[];           // Last 5 average reps
  
  // Derived features
  weightTrend: number;            // Slope of weight progression
  volumeTrend: number;             // Slope of volume progression
  consistencyScore: number;        // Variance in training frequency
  daysSinceLastSession: number;    // Recovery time
  cumulativeVolume: number;       // Total volume over period
  averageFrequency: number;        // Sessions per week
}

export interface WorkoutPrediction {
  // Predictions for next session
  predictedMaxWeight: number;
  predictedVolume: number;
  predictedRPE: number;
  confidence: number;              // 0-1 confidence score
  
  // Recommendations
  optimalVolume: number;           // Recommended volume for next session
  optimalWeight: number;            // Recommended starting weight
  deloadProbability: number;       // Probability that deload is needed (0-1)
  progressionReady: boolean;       // Can increase weight?
  progressionAmount: number;       // Suggested weight increase (lbs)
}

/**
 * Extract features from exercise history for ML model
 */
export function extractFeatures(
  history: ExerciseHistory,
  currentDate: Date = new Date()
): PredictionFeatures {
  const sessions = history.sessions.sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  // Get last 5 sessions (pad with zeros if needed)
  const recentSessions = sessions.slice(-5);
  
  // Helper to pad array to specified length
  const padArray = <T>(arr: T[], length: number, fillValue: T): T[] => {
    const padLength = Math.max(0, length - arr.length);
    return [...Array(padLength).fill(fillValue), ...arr].slice(-length);
  };

  const recentWeights = padArray(
    recentSessions.map(s => s.maxWeight || 0),
    5,
    0
  );
  
  const recentVolumes = padArray(
    recentSessions.map(s => s.totalVolume),
    5,
    0
  );
  
  const recentRPEs = padArray(
    recentSessions.map(s => s.averageRPE || 5),
    5,
    5
  );
  
  const recentReps = padArray(
    recentSessions.map(s => s.averageReps),
    5,
    0
  );

  // Calculate trends (simple linear regression slope)
  const weightTrend = calculateTrend(recentWeights);
  const volumeTrend = calculateTrend(recentVolumes);

  // Consistency score (lower variance = higher consistency)
  const dates = sessions.map(s => s.date);
  const consistencyScore = calculateConsistencyScore(dates);

  // Days since last session
  const lastSession = sessions[sessions.length - 1];
  const daysSinceLastSession = lastSession
    ? Math.floor((currentDate.getTime() - lastSession.date.getTime()) / (1000 * 60 * 60 * 24))
    : 7; // Default to 7 if no sessions

  // Cumulative volume (last 30 days)
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cumulativeVolume = sessions
    .filter(s => s.date >= thirtyDaysAgo)
    .reduce((sum, s) => sum + s.totalVolume, 0);

  // Average frequency (sessions per week)
  const firstSession = sessions[0];
  const weeks = firstSession
    ? Math.max(1, (currentDate.getTime() - firstSession.date.getTime()) / (1000 * 60 * 60 * 24 * 7))
    : 1;
  const averageFrequency = sessions.length / weeks;

  return {
    recentWeights,
    recentVolumes,
    recentRPEs,
    recentReps,
    weightTrend,
    volumeTrend,
    consistencyScore,
    daysSinceLastSession,
    cumulativeVolume,
    averageFrequency,
  };
}

/**
 * Calculate simple linear trend (slope)
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return isNaN(slope) ? 0 : slope;
}

/**
 * Calculate consistency score based on session frequency variance
 */
function calculateConsistencyScore(dates: Date[]): number {
  if (dates.length < 2) return 1;
  
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(diff);
  }
  
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
  
  // Normalize: lower variance = higher score (0-1)
  // Assume variance > 7 days is inconsistent
  return Math.max(0, Math.min(1, 1 - (variance / 49)));
}

/**
 * Convert features to TensorFlow tensor format
 */
export function featuresToTensor(features: PredictionFeatures): any {
  if (!tf) {
    throw new Error('TensorFlow.js not installed. Run: npm install @tensorflow/tfjs');
  }
  const featureArray = [
    ...features.recentWeights,
    ...features.recentVolumes,
    ...features.recentRPEs,
    ...features.recentReps,
    features.weightTrend,
    features.volumeTrend,
    features.consistencyScore,
    features.daysSinceLastSession,
    features.cumulativeVolume / 10000, // Normalize
    features.averageFrequency,
  ];
  
  return tf!.tensor2d([featureArray], [1, featureArray.length]);
}

/**
 * Load or create a prediction model
 * 
 * For production, you'd load a pre-trained model.
 * For this example, we create a simple sequential model.
 */
export async function loadPredictionModel(): Promise<any | null> {
  if (!tf) {
    console.warn('TensorFlow.js not installed. ML features disabled.');
    return null;
  }

  try {
    // Try to load from localStorage (browser) or IndexedDB
    const model = await tf!.loadLayersModel('indexeddb://workout-prediction-model');
    return model;
  } catch (error) {
    console.log('No saved model found, creating new model');
    return createNewModel();
  }
}

/**
 * Create a new prediction model architecture
 */
function createNewModel(): any {
  if (!tf) {
    throw new Error('TensorFlow.js not installed');
  }

  const model = tf!.sequential({
    layers: [
      // Input layer: 25 features (5 weights + 5 volumes + 5 RPEs + 5 reps + 5 derived)
      tf!.layers.dense({ 
        inputShape: [25], 
        units: 64, 
        activation: 'relu',
        kernelRegularizer: tf!.regularizers.l2({ l2: 0.01 })
      }),
      tf!.layers.dropout({ rate: 0.2 }),
      tf!.layers.dense({ 
        units: 32, 
        activation: 'relu',
        kernelRegularizer: tf!.regularizers.l2({ l2: 0.01 })
      }),
      tf!.layers.dropout({ rate: 0.2 }),
      // Output layer: predict next max weight, volume, and RPE
      tf!.layers.dense({ units: 3, activation: 'linear' }), // [weight, volume, RPE]
    ]
  });

  model.compile({
    optimizer: tf!.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: [], // Metrics can be added here if needed, but 'meanAbsoluteError' is not a standard TF.js metric name
  });

  return model;
}

/**
 * Train the model on user's historical data
 * 
 * This is a personalized model that learns from the user's own patterns
 */
export async function trainPersonalizedModel(
  histories: ExerciseHistory[],
  epochs: number = 50
): Promise<any> {
  if (!tf) {
    throw new Error('TensorFlow.js not installed. Run: npm install @tensorflow/tfjs');
  }

  const model = await loadPredictionModel() || createNewModel();
  
  // Prepare training data
  const trainingData: { features: PredictionFeatures; targets: number[] }[] = [];

  histories.forEach(history => {
    // For each session (except the first), use previous sessions as input
    for (let i = 1; i < history.sessions.length; i++) {
      const previousSessions = history.sessions.slice(0, i);
      const currentSession = history.sessions[i];
      
      // Create a temporary history with sessions up to this point
      const tempHistory: ExerciseHistory = {
        ...history,
        sessions: previousSessions,
      };
      
      const features = extractFeatures(tempHistory, currentSession.date);
      const targets = [
        currentSession.maxWeight || 0,
        currentSession.totalVolume,
        currentSession.averageRPE || 5,
      ];
      
      trainingData.push({ features, targets });
    }
  });

  if (trainingData.length === 0) {
    console.warn('Insufficient data for training');
    return model;
  }

  // Convert to tensors
  const featureTensor = tf!.concat(
    trainingData.map(d => featuresToTensor(d.features)),
    0
  );
  
  const targetTensor = tf!.tensor2d(
    trainingData.map(d => d.targets),
    [trainingData.length, 3]
  );

  // Train the model
  await model.fit(featureTensor, targetTensor, {
    epochs,
    batchSize: Math.min(32, trainingData.length),
    shuffle: true,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch: number, logs?: { loss?: number }) => {
        console.log(`Epoch ${epoch + 1}/${epochs} - Loss: ${logs?.loss?.toFixed(4)}`);
      },
    },
  });

  // Clean up tensors
  featureTensor.dispose();
  targetTensor.dispose();

  // Save the model
  await model.save('indexeddb://workout-prediction-model');

  return model;
}

/**
 * Make predictions for next workout session
 */
export async function predictNextWorkout(
  history: ExerciseHistory,
  model?: any
): Promise<WorkoutPrediction> {
  if (!tf) {
    return makeRuleBasedPrediction(history);
  }

  const predictionModel = model || await loadPredictionModel();
  
  if (!predictionModel) {
    // Fallback to rule-based prediction if no model
    return makeRuleBasedPrediction(history);
  }

  // Extract features
  const features = extractFeatures(history);
  const featureTensor = featuresToTensor(features);

  // Make prediction
  const prediction = predictionModel.predict(featureTensor) as any;
  const predictionArray = await prediction.data();
  
  featureTensor.dispose();
  prediction.dispose();

  const [predictedWeight, predictedVolume, predictedRPE] = predictionArray;

  // Calculate confidence based on data quality
  const confidence = calculateConfidence(features, history);

  // Generate recommendations
  const lastSession = history.sessions[history.sessions.length - 1];
  const currentWeight = lastSession?.maxWeight || 0;
  
  // Determine if progression is ready
  const progressionReady = predictedWeight > currentWeight * 1.02; // 2% increase predicted
  const progressionAmount = progressionReady 
    ? Math.max(2.5, (predictedWeight - currentWeight))
    : 0;

  // Deload probability: inverse of progression confidence
  const deloadProbability = features.weightTrend < -0.5 || features.recentRPEs.slice(-3).some(rpe => rpe > 9)
    ? 0.7
    : 0.2;

  // Optimal recommendations
  const optimalWeight = progressionReady
    ? Math.round(currentWeight + progressionAmount)
    : Math.round(currentWeight * 0.95); // Slight deload if not ready

  const optimalVolume = progressionReady
    ? predictedVolume * 1.05 // Slight increase
    : predictedVolume * 0.9;  // Slight decrease

  return {
    predictedMaxWeight: Math.round(predictedWeight),
    predictedVolume: Math.round(predictedVolume),
    predictedRPE: Math.round(predictedRPE * 10) / 10,
    confidence,
    optimalVolume: Math.round(optimalVolume),
    optimalWeight,
    deloadProbability,
    progressionReady,
    progressionAmount: Math.round(progressionAmount * 10) / 10,
  };
}

/**
 * Fallback rule-based prediction when no model is available
 */
function makeRuleBasedPrediction(history: ExerciseHistory): WorkoutPrediction {
  const sessions = history.sessions;
  if (sessions.length === 0) {
    return {
      predictedMaxWeight: 0,
      predictedVolume: 0,
      predictedRPE: 5,
      confidence: 0,
      optimalVolume: 0,
      optimalWeight: 0,
      deloadProbability: 0.5,
      progressionReady: false,
      progressionAmount: 0,
    };
  }

  const lastSession = sessions[sessions.length - 1];
  const recentSessions = sessions.slice(-3);

  // Simple linear extrapolation
  if (recentSessions.length >= 2) {
    const weights = recentSessions.map(s => s.maxWeight || 0);
    const trend = (weights[weights.length - 1] - weights[0]) / weights.length;
    const predictedWeight = (lastSession.maxWeight || 0) + trend;
    
    return {
      predictedMaxWeight: Math.max(0, Math.round(predictedWeight)),
      predictedVolume: lastSession.totalVolume,
      predictedRPE: lastSession.averageRPE || 7,
      confidence: 0.5,
      optimalVolume: lastSession.totalVolume,
      optimalWeight: Math.max(0, Math.round(predictedWeight)),
      deloadProbability: 0.3,
      progressionReady: trend > 0,
      progressionAmount: Math.max(0, Math.round(trend * 10) / 10),
    };
  }

  // Fallback: return last session values
  return {
    predictedMaxWeight: lastSession.maxWeight || 0,
    predictedVolume: lastSession.totalVolume,
    predictedRPE: lastSession.averageRPE || 7,
    confidence: 0.3,
    optimalVolume: lastSession.totalVolume,
    optimalWeight: lastSession.maxWeight || 0,
    deloadProbability: 0.5,
    progressionReady: false,
    progressionAmount: 0,
  };
}

/**
 * Calculate prediction confidence based on data quality
 */
function calculateConfidence(
  features: PredictionFeatures,
  history: ExerciseHistory
): number {
  let confidence = 0.5; // Base confidence

  // More data = higher confidence
  if (history.sessions.length >= 10) confidence += 0.2;
  else if (history.sessions.length >= 5) confidence += 0.1;

  // Higher consistency = higher confidence
  confidence += features.consistencyScore * 0.2;

  // Recent data = higher confidence
  if (features.daysSinceLastSession <= 3) confidence += 0.1;

  return Math.min(1, Math.max(0, confidence));
}

