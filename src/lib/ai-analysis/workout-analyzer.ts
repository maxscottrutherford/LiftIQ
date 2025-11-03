// Main Workout Analysis Engine

import { WorkoutSession } from '../types';
import { WorkoutAnalysis, AnalysisOptions, ExerciseHistory, ExercisePattern } from './types';
import { extractExerciseHistory, detectExercisePatterns } from './pattern-detector';
import { generateRecommendations } from './recommendations';

const DEFAULT_OPTIONS: AnalysisOptions = {
  lookbackDays: 30,
  minSessions: 3,
  includeWarmupSets: false,
  weightProgressionThreshold: 2.5,
};

/**
 * Analyze workout sessions and generate comprehensive insights
 */
export function analyzeWorkouts(
  sessions: WorkoutSession[],
  options: AnalysisOptions = {}
): WorkoutAnalysis {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Filter and prepare sessions
  const completedSessions = sessions
    .filter(s => s.status === 'completed' && s.completedAt)
    .sort((a, b) => {
      const dateA = a.completedAt || a.startedAt;
      const dateB = b.completedAt || b.startedAt;
      return dateA.getTime() - dateB.getTime(); // Oldest first
    });

  if (completedSessions.length === 0) {
    return createEmptyAnalysis();
  }

  // Extract exercise history
  const exerciseHistories = extractExerciseHistory(completedSessions, opts);

  // Detect patterns for each exercise
  const patterns: ExercisePattern[] = exerciseHistories.map(history =>
    detectExercisePatterns(history, opts)
  );

  // Calculate progress metrics
  const progressMetrics = calculateProgressMetrics(completedSessions, patterns);

  // Generate recommendations
  const recommendations = generateRecommendations(patterns, { progressMetrics });

  // Calculate overall score
  const overallScore = calculateOverallScore(patterns, progressMetrics);

  // Generate summary
  const summary = generateSummary(patterns, progressMetrics, recommendations);

  // Determine time range
  const firstSession = completedSessions[0];
  const lastSession = completedSessions[completedSessions.length - 1];
  const startDate = firstSession.completedAt || firstSession.startedAt;
  const endDate = lastSession.completedAt || lastSession.startedAt;

  return {
    overallScore,
    summary,
    exercisePatterns: patterns,
    recommendations,
    progressMetrics,
    analyzedDate: new Date(),
    sessionsAnalyzed: completedSessions.length,
    timeRange: {
      startDate,
      endDate,
    },
  };
}

/**
 * Calculate progress metrics from sessions and patterns
 */
function calculateProgressMetrics(
  sessions: WorkoutSession[],
  patterns: ExercisePattern[]
): WorkoutAnalysis['progressMetrics'] {
  // Strength Progress: Average of progression patterns
  const progressionPatterns = patterns.filter(p => p.patternType === 'progression' || p.patternType === 'optimal');
  const declinePatterns = patterns.filter(p => p.patternType === 'decline');
  
  let strengthProgress = 0;
  if (progressionPatterns.length > 0) {
    // Estimate average weight increase
    const totalIncrease = progressionPatterns.reduce((sum, pattern) => {
      const recent = pattern.lastThreeSessions;
      if (recent.length >= 2) {
        const first = recent[0].maxWeight || 0;
        const last = recent[recent.length - 1].maxWeight || 0;
        if (first > 0) {
          return sum + ((last - first) / first) * 100;
        }
      }
      return sum;
    }, 0);
    strengthProgress = totalIncrease / progressionPatterns.length;
  } else if (declinePatterns.length > patterns.length / 2) {
    // More than half declining
    strengthProgress = -5; // Negative progress
  }

  // Volume Progress: Compare recent sessions to older sessions
  let volumeProgress = 0;
  if (sessions.length >= 4) {
    const recentSessions = sessions.slice(-Math.floor(sessions.length / 2));
    const olderSessions = sessions.slice(0, Math.floor(sessions.length / 2));
    
    const recentVolume = recentSessions.reduce((sum, s) => {
      return sum + s.exerciseLogs.reduce((exerciseSum, ex) => {
        return exerciseSum + ex.sets
          .filter(set => set.completed && set.weight !== undefined && set.reps > 0)
          .reduce((setSum, set) => setSum + ((set.weight || 0) * set.reps), 0);
      }, 0);
    }, 0) / recentSessions.length;

    const olderVolume = olderSessions.reduce((sum, s) => {
      return sum + s.exerciseLogs.reduce((exerciseSum, ex) => {
        return exerciseSum + ex.sets
          .filter(set => set.completed && set.weight !== undefined && set.reps > 0)
          .reduce((setSum, set) => setSum + ((set.weight || 0) * set.reps), 0);
      }, 0);
    }, 0) / olderSessions.length;

    if (olderVolume > 0) {
      volumeProgress = ((recentVolume - olderVolume) / olderVolume) * 100;
    }
  }

  // Consistency Score: Based on workout frequency
  let consistencyScore = 100;
  if (sessions.length >= 3) {
    const dates = sessions.map(s => {
      const date = s.completedAt || s.startedAt;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });

    // Calculate average days between sessions
    let totalDays = 0;
    for (let i = 1; i < dates.length; i++) {
      const diff = dates[i].getTime() - dates[i - 1].getTime();
      totalDays += diff / (1000 * 60 * 60 * 24);
    }
    const avgDaysBetween = totalDays / (dates.length - 1);

    // Ideal: 1-3 days between sessions
    if (avgDaysBetween > 5) {
      consistencyScore = 40; // Inconsistent
    } else if (avgDaysBetween > 3) {
      consistencyScore = 70; // Moderate
    } else if (avgDaysBetween >= 1) {
      consistencyScore = 100; // Excellent
    } else {
      consistencyScore = 60; // Too frequent, may need more rest
    }
  }

  // Recovery Score: Based on RPE trends and performance
  let recoveryScore = 75; // Default moderate
  const highRpePatterns = patterns.filter(p => {
    const avgRPE = p.lastThreeSessions
      .map(s => s.averageRPE)
      .filter(rpe => rpe !== null) as number[];
    
    if (avgRPE.length > 0) {
      const avg = avgRPE.reduce((sum, rpe) => sum + rpe, 0) / avgRPE.length;
      return avg >= 9;
    }
    return false;
  });

  const declineCount = declinePatterns.length;
  const totalPatterns = patterns.length;

  if (totalPatterns > 0) {
    const declineRatio = declineCount / totalPatterns;
    const highRpeRatio = highRpePatterns.length / totalPatterns;

    if (declineRatio > 0.3 || highRpeRatio > 0.4) {
      recoveryScore = 40; // Poor recovery
    } else if (declineRatio > 0.1 || highRpeRatio > 0.2) {
      recoveryScore = 60; // Moderate recovery
    } else {
      recoveryScore = 85; // Good recovery
    }
  }

  return {
    strengthProgress: Math.round(strengthProgress * 10) / 10,
    volumeProgress: Math.round(volumeProgress * 10) / 10,
    consistencyScore: Math.round(consistencyScore),
    recoveryScore: Math.round(recoveryScore),
  };
}

/**
 * Calculate overall fitness score (0-100)
 */
function calculateOverallScore(
  patterns: ExercisePattern[],
  metrics: WorkoutAnalysis['progressMetrics']
): number {
  let score = 50; // Base score

  // Positive patterns boost score
  const optimalCount = patterns.filter(p => p.patternType === 'optimal').length;
  const progressionCount = patterns.filter(p => p.patternType === 'progression').length;
  score += (optimalCount * 15) + (progressionCount * 10);

  // Negative patterns lower score
  const declineCount = patterns.filter(p => p.patternType === 'decline').length;
  const plateauCount = patterns.filter(p => p.patternType === 'plateau' && p.severity === 'high').length;
  score -= (declineCount * 15) + (plateauCount * 10);

  // Metrics influence score
  if (metrics.strengthProgress > 0) {
    score += Math.min(metrics.strengthProgress, 15);
  } else {
    score -= Math.min(Math.abs(metrics.strengthProgress), 15);
  }

  score += (metrics.consistencyScore / 10) * 1.5;
  score += (metrics.recoveryScore / 10) * 1.5;

  // Normalize to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate human-readable summary
 */
function generateSummary(
  patterns: ExercisePattern[],
  metrics: WorkoutAnalysis['progressMetrics'],
  recommendations: WorkoutAnalysis['recommendations']
): string {
  const plateaus = patterns.filter(p => p.patternType === 'plateau').length;
  const progressions = patterns.filter(p => p.patternType === 'progression' || p.patternType === 'optimal').length;
  const declines = patterns.filter(p => p.patternType === 'decline').length;

  const parts: string[] = [];

  if (progressions > plateaus && progressions > declines) {
    parts.push(`You're making solid progress on ${progressions} exercise${progressions !== 1 ? 's' : ''}.`);
  } else if (plateaus > 0) {
    parts.push(`You're experiencing plateaus on ${plateaus} exercise${plateaus !== 1 ? 's' : ''} that may benefit from program adjustments.`);
  }

  if (declines > 0) {
    parts.push(`${declines} exercise${declines !== 1 ? 's' : ''} ${declines === 1 ? 'is' : 'are'} declining, which may indicate overreaching or need for recovery.`);
  }

  if (metrics.strengthProgress > 0) {
    parts.push(`Overall strength has increased by ${metrics.strengthProgress.toFixed(1)}% over the analyzed period.`);
  } else if (metrics.strengthProgress < 0) {
    parts.push(`Strength has decreased by ${Math.abs(metrics.strengthProgress).toFixed(1)}%, suggesting a need for recovery or program adjustment.`);
  }

  if (metrics.recoveryScore < 60) {
    parts.push(`Your recovery score is ${metrics.recoveryScore}, indicating you may need more rest or reduced training intensity.`);
  }

  if (parts.length === 0) {
    return 'Analysis complete. Continue tracking your workouts to receive more detailed insights.';
  }

  return parts.join(' ');
}

/**
 * Create empty analysis when no data is available
 */
function createEmptyAnalysis(): WorkoutAnalysis {
  return {
    overallScore: 0,
    summary: 'Insufficient workout data for analysis. Complete at least 3 workout sessions to receive insights.',
    exercisePatterns: [],
    recommendations: [],
    progressMetrics: {
      strengthProgress: 0,
      volumeProgress: 0,
      consistencyScore: 0,
      recoveryScore: 0,
    },
    analyzedDate: new Date(),
    sessionsAnalyzed: 0,
    timeRange: {
      startDate: new Date(),
      endDate: new Date(),
    },
  };
}

