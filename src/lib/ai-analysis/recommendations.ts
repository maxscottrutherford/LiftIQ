// Recommendation Engine for Workout Optimization

import { ExercisePattern, WorkoutRecommendation, WorkoutAnalysis } from './types';

/**
 * Generate recommendations based on detected patterns
 */
export function generateRecommendations(
  patterns: ExercisePattern[],
  analysis: Partial<WorkoutAnalysis>
): WorkoutRecommendation[] {
  const recommendations: WorkoutRecommendation[] = [];

  // Process each pattern and generate recommendations
  patterns.forEach(pattern => {
    const patternRecs = generateRecommendationsForPattern(pattern, patterns);
    recommendations.push(...patternRecs);
  });

  // Add overall recommendations based on analysis metrics
  const overallRecs = generateOverallRecommendations(analysis);
  recommendations.push(...overallRecs);

  // Sort by priority and remove duplicates
  return deduplicateAndSort(recommendations);
}

/**
 * Generate recommendations for a specific pattern
 */
function generateRecommendationsForPattern(
  pattern: ExercisePattern,
  allPatterns: ExercisePattern[]
): WorkoutRecommendation[] {
  const recommendations: WorkoutRecommendation[] = [];

  switch (pattern.patternType) {
    case 'plateau':
      recommendations.push(...generatePlateauRecommendations(pattern));
      break;
    case 'decline':
      recommendations.push(...generateDeclineRecommendations(pattern));
      break;
    case 'progression':
      if (pattern.severity === 'low' && pattern.trend === 'up') {
        // Good progression - suggest maintenance or slight adjustments
        recommendations.push(...generateProgressionMaintenanceRecommendations(pattern));
      }
      break;
    case 'optimal':
      // Optimal pattern - suggest fine-tuning for continued growth
      recommendations.push(...generateOptimalFineTuningRecommendations(pattern));
      break;
    case 'inconsistent':
      recommendations.push(...generateInconsistentRecommendations(pattern));
      break;
  }

  return recommendations;
}

/**
 * Recommendations for plateau patterns
 */
function generatePlateauRecommendations(pattern: ExercisePattern): WorkoutRecommendation[] {
  const recs: WorkoutRecommendation[] = [];
  const lastSession = pattern.lastThreeSessions[pattern.lastThreeSessions.length - 1];

  // Rep range change recommendation
  if (lastSession?.averageReps && lastSession.averageReps < 6) {
    recs.push({
      id: `rep-range-${pattern.exerciseId}`,
      type: 'rep_range_change',
      priority: 'medium',
      exerciseName: pattern.exerciseName,
      title: `Switch to Higher Rep Range for ${pattern.exerciseName}`,
      description: `You've been training in the strength range (1-5 reps). Switch to hypertrophy range (6-10 reps) for 4-6 weeks to build muscle mass and work capacity.`,
      actionItems: [
        'Reduce weight by 15-20%',
        'Increase reps to 6-10 range',
        'Perform 3-4 sets',
        'Maintain for 4-6 weeks',
        'Then cycle back to strength range',
      ],
      reasoning: 'Periodization through different rep ranges prevents adaptation and can help break through plateaus.',
      relatedPatterns: [pattern.patternType],
    });
  }

  return recs;
}

/**
 * Recommendations for decline patterns
 */
function generateDeclineRecommendations(pattern: ExercisePattern): WorkoutRecommendation[] {
  const recs: WorkoutRecommendation[] = [];

  // High priority: Deload and recovery
  recs.push({
    id: `deload-decline-${pattern.exerciseId}`,
    type: 'deload',
    priority: 'high',
    exerciseName: pattern.exerciseName,
    title: `Immediate Deload for ${pattern.exerciseName}`,
    description: `Performance is declining. Implement a deload week: reduce volume by 50% and intensity by 20% for 1 week to allow recovery.`,
    actionItems: [
      'Reduce working sets by 50%',
      'Reduce weight by 20%',
      'Focus on technique',
      'Increase rest days between sessions',
      'Prioritize sleep and nutrition',
    ],
    reasoning: 'Declining performance indicates overreaching or insufficient recovery. A deload week is essential to prevent overtraining and allow supercompensation.',
    relatedPatterns: [pattern.patternType],
  });

  // Rest recommendation
  recs.push({
    id: `rest-decline-${pattern.exerciseId}`,
    type: 'rest',
    priority: 'high',
    exerciseName: pattern.exerciseName,
    title: `Increase Recovery Time`,
    description: `Consider taking 2-3 full rest days or focusing on active recovery activities instead of intense training.`,
    actionItems: [
      'Take 2-3 complete rest days',
      'Consider light walking or mobility work',
      'Focus on sleep quality (8+ hours)',
      'Ensure adequate nutrition and hydration',
      'Reduce life stress where possible',
    ],
    reasoning: 'Declining performance often signals inadequate recovery. Additional rest is crucial for long-term progress.',
    relatedPatterns: [pattern.patternType],
  });

  return recs;
}

/**
 * Recommendations for progression maintenance
 */
function generateProgressionMaintenanceRecommendations(pattern: ExercisePattern): WorkoutRecommendation[] {
  const recs: WorkoutRecommendation[] = [];
  const lastSession = pattern.lastThreeSessions[pattern.lastThreeSessions.length - 1];

  // Volume adjustment if RPE is too low
  if (lastSession?.averageRPE && lastSession.averageRPE < 7) {
    recs.push({
      id: `volume-increase-${pattern.exerciseId}`,
      type: 'volume_increase',
      priority: 'low',
      exerciseName: pattern.exerciseName,
      title: `Increase Volume for ${pattern.exerciseName}`,
      description: `You're progressing well but training at low intensity (RPE < 7). Consider adding 1-2 sets or increasing weight slightly to optimize growth.`,
      actionItems: [
        'Add 1-2 working sets',
        'Or increase weight by 2.5-5 lbs',
        'Keep RPE in 7-8 range',
        'Monitor recovery between sessions',
      ],
      reasoning: 'Low RPE suggests you can handle more volume or intensity. Progressive overload is key to continued growth.',
      relatedPatterns: [pattern.patternType],
    });
  }

  return recs;
}

/**
 * Recommendations for optimal patterns
 */
function generateOptimalFineTuningRecommendations(pattern: ExercisePattern): WorkoutRecommendation[] {
  return [
    {
      id: `maintain-${pattern.exerciseId}`,
      type: 'progression_ready',
      priority: 'low',
      exerciseName: pattern.exerciseName,
      title: `Continue Current Approach`,
      description: `Your training is optimal. Continue with current weights and gradually increase when you can complete all sets with 1-2 reps in reserve.`,
      actionItems: [
        'Maintain current training parameters',
        'Increase weight by 2.5-5 lbs when you hit top of rep range comfortably',
        'Keep RPE in 7-8.5 range',
        'Ensure adequate recovery between sessions',
      ],
      reasoning: 'Optimal progression indicates your current training is well-calibrated. Small, consistent increases are better than large jumps.',
      relatedPatterns: [pattern.patternType],
    },
  ];
}

/**
 * Recommendations for inconsistent patterns
 */
function generateInconsistentRecommendations(pattern: ExercisePattern): WorkoutRecommendation[] {
  return [
    {
      id: `structure-${pattern.exerciseId}`,
      type: 'rep_range_change',
      priority: 'medium',
      exerciseName: pattern.exerciseName,
      title: `Implement Structured Progression for ${pattern.exerciseName}`,
      description: `Inconsistent progression suggests a need for structured periodization. Follow a specific rep/set scheme with planned progression.`,
      actionItems: [
        'Use a structured program (e.g., 5x5, 3x8, 4x6)',
        'Plan weight increases: +2.5-5 lbs weekly or bi-weekly',
        'Track all sessions consistently',
        'Stick to the plan for 6-8 weeks before changing',
      ],
      reasoning: 'Structure helps ensure consistent progression and prevents random training that leads to plateaus.',
      relatedPatterns: [pattern.patternType],
    },
  ];
}

/**
 * Generate overall recommendations based on analysis metrics
 */
function generateOverallRecommendations(
  analysis: Partial<WorkoutAnalysis>
): WorkoutRecommendation[] {
  const recs: WorkoutRecommendation[] = [];

  // Recovery score recommendations
  if (analysis.progressMetrics?.recoveryScore !== undefined) {
    const recoveryScore = analysis.progressMetrics.recoveryScore;
    if (recoveryScore < 60) {
      recs.push({
        id: 'overall-recovery',
        type: 'rest',
        priority: 'high',
        title: 'Improve Recovery',
        description: 'Your recovery score is below optimal. Focus on sleep, nutrition, and stress management.',
        actionItems: [
          'Aim for 8+ hours of quality sleep',
          'Ensure adequate protein intake (0.8-1g per lb bodyweight)',
          'Manage stress through meditation or relaxation',
          'Consider deload week if recovery score < 50',
        ],
        reasoning: 'Inadequate recovery limits strength gains and increases injury risk.',
        relatedPatterns: [],
      });
    }
  }

  // Consistency recommendations
  if (analysis.progressMetrics?.consistencyScore !== undefined) {
    const consistency = analysis.progressMetrics.consistencyScore;
    if (consistency < 70) {
      recs.push({
        id: 'overall-consistency',
        type: 'volume_increase',
        priority: 'medium',
        title: 'Improve Workout Consistency',
        description: 'More consistent training frequency would improve your results. Aim for 3-4 sessions per week.',
        actionItems: [
          'Schedule workouts at consistent times',
          'Aim for 3-4 training sessions per week',
          'Plan rest days in advance',
          'Track your attendance rate',
        ],
        reasoning: 'Consistent training frequency is crucial for progressive overload and adaptation.',
        relatedPatterns: [],
      });
    }
  }

  return recs;
}

/**
 * Deduplicate and sort recommendations by priority
 */
function deduplicateAndSort(recommendations: WorkoutRecommendation[]): WorkoutRecommendation[] {
  // Remove duplicates based on ID
  const unique = new Map<string, WorkoutRecommendation>();
  recommendations.forEach(rec => {
    if (!unique.has(rec.id)) {
      unique.set(rec.id, rec);
    }
  });

  // Sort by priority: high > medium > low
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return Array.from(unique.values()).sort((a, b) => {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

