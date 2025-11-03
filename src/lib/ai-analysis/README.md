# AI Workout Analysis System

This module provides intelligent workout analysis using both rule-based logic and optional machine learning (TensorFlow.js) predictions.

## Architecture

### Rule-Based System (Always Active)
- **Pattern Detection**: Detects plateaus, progressions, declines
- **Recommendations**: Generates actionable workout advice
- **Metrics**: Calculates strength, volume, consistency, recovery scores

### ML-Enhanced System (Optional)
- **Predictions**: Forecasts next workout performance
- **Personalization**: Learns from user's historical data
- **Optimization**: Suggests optimal volume/intensity

## Quick Start

### Basic Usage (Rule-Based Only)

```typescript
import { analyzeWorkouts } from '@/lib/ai-analysis/workout-analyzer';
import { getWorkoutSessions } from '@/lib/supabase/workout-service';

const sessions = await getWorkoutSessions();
const analysis = analyzeWorkouts(sessions, {
  lookbackDays: 30,
  minSessions: 3,
});

console.log(analysis.recommendations);
console.log(analysis.exercisePatterns);
```

### ML-Enhanced Usage

```typescript
import { analyzeWorkoutsWithML } from '@/lib/ai-analysis/ml-integration';

const sessions = await getWorkoutSessions();
const analysis = await analyzeWorkoutsWithML(sessions, {
  useML: true,
  retrainModel: false, // Set to true to retrain
  lookbackDays: 30,
});

// Access ML predictions
if (analysis.mlPredictions) {
  analysis.mlPredictions.exercisePredictions.forEach((prediction, exerciseId) => {
    console.log(`Exercise ${exerciseId}:`);
    console.log(`  Predicted weight: ${prediction.predictedMaxWeight} lbs`);
    console.log(`  Confidence: ${prediction.confidence}`);
    console.log(`  Progression ready: ${prediction.progressionReady}`);
  });
}

// Hybrid recommendations (rule-based + ML)
console.log(analysis.hybridRecommendations);
```

## TensorFlow.js Integration

### Installation

```bash
npm install @tensorflow/tfjs
```

### How It Works

1. **Feature Extraction**: Converts workout history into numerical features
   - Recent weights, volumes, RPEs, reps (last 5 sessions)
   - Derived features: trends, consistency, frequency

2. **Model Training**: Personalized model learns from user's data
   - Trains on user's own workout history
   - Stored in browser's IndexedDB
   - Retrains periodically or on demand

3. **Predictions**: Forecasts next session performance
   - Predicted max weight
   - Predicted volume
   - Predicted RPE
   - Confidence scores

4. **Hybrid Recommendations**: Combines rule-based and ML insights
   - ML confirms or refines rule-based recommendations
   - Adds predictive insights (e.g., "ready to progress in 2 sessions")

### Model Architecture

```
Input (25 features)
  ↓
Dense(64, ReLU) + Dropout(0.2)
  ↓
Dense(32, ReLU) + Dropout(0.2)
  ↓
Output [weight, volume, RPE]
```

### Training Process

- **Data**: Uses historical sessions (minimum 5 sessions per exercise)
- **Validation**: 20% holdout for validation
- **Epochs**: 30-50 epochs (configurable)
- **Storage**: Model saved to IndexedDB for persistence

### When to Retrain

- **Automatic**: After every 10 new sessions
- **Manual**: Call `retrainModel: true` in options
- **On Demand**: User can trigger retraining from UI

## Use Cases

### 1. Future Performance Prediction

```typescript
import { getExercisePrediction } from '@/lib/ai-analysis/ml-integration';

const prediction = await getExercisePrediction(sessions, 'exercise-id', 'Bench Press');
if (prediction) {
  console.log(`Next session predicted weight: ${prediction.predictedMaxWeight} lbs`);
  console.log(`Progression ready: ${prediction.progressionReady}`);
}
```

### 2. Optimal Deload Timing

```typescript
// ML predicts when deload is needed
if (prediction.deloadProbability > 0.7) {
  // Recommend deload
}
```

### 3. Volume Optimization

```typescript
// Get optimal volume for next session
const optimalVolume = prediction.optimalVolume;
// Adjust workout program accordingly
```

## Integration Points

### Statistics Dashboard

```typescript
// In StatisticsDashboard.tsx
import { analyzeWorkoutsWithML } from '@/lib/ai-analysis/ml-integration';

const analysis = await analyzeWorkoutsWithML(sessions, {
  useML: true, // Enable ML predictions
});
```

### Workout Planning

Before starting a workout, show predicted performance:

```typescript
import { getExercisePrediction } from '@/lib/ai-analysis/ml-integration';

const prediction = await getExercisePrediction(sessions, exerciseId, exerciseName);
// Display: "AI predicts you can handle 185 lbs today (85% confidence)"
```

### Progress Tracking

Compare predicted vs actual performance to improve model:

```typescript
const prediction = await getExercisePrediction(sessions, exerciseId, exerciseName);
// After workout, compare:
const actualWeight = completedSession.maxWeight;
const error = Math.abs(prediction.predictedMaxWeight - actualWeight);
// Use for model improvement
```

## Performance Considerations

- **Initial Load**: Model loads from IndexedDB (~100-500ms)
- **Training**: First training takes 1-5 seconds (30 epochs)
- **Inference**: Prediction takes <50ms
- **Storage**: Model size ~50-200KB (compressed)

## Limitations

- **Data Requirement**: Needs at least 5-10 sessions per exercise
- **Browser Only**: TensorFlow.js requires browser environment
- **Personalized**: Model is specific to each user (no shared training)
- **Predictions**: Confidence decreases with less data

## Future Enhancements

1. **Transfer Learning**: Pre-train on aggregate user data
2. **Real-time Updates**: Incremental learning after each session
3. **Multi-Exercise Models**: Joint models for related exercises
4. **Anomaly Detection**: Identify unusual patterns (injuries, overtraining)
5. **Goal-Based Predictions**: Predict progress toward specific goals

## Troubleshooting

### Model Not Loading
- Check IndexedDB permissions
- Clear storage and retrain
- Verify TensorFlow.js is installed

### Poor Predictions
- Ensure sufficient training data (10+ sessions)
- Check data quality (complete sessions with weights)
- Retrain model with `retrainModel: true`

### Performance Issues
- Reduce model complexity for slower devices
- Limit concurrent predictions
- Use web workers for training

