// Pattern Detection Logic for Workout Analysis

import { WorkoutSession, ExerciseLog, SetLog } from '../types';
import { ExerciseHistory, ExerciseSessionData, ExercisePattern, AnalysisOptions } from './types';

const DEFAULT_OPTIONS: AnalysisOptions = {
  lookbackDays: 30,
  minSessions: 3,
  includeWarmupSets: false,
  weightProgressionThreshold: 2.5,
};

/**
 * Extract exercise history from workout sessions
 */
export function extractExerciseHistory(
  sessions: WorkoutSession[],
  options: AnalysisOptions = {}
): ExerciseHistory[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const exerciseMap = new Map<string, ExerciseHistory>();

  // Filter sessions within lookback period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (opts.lookbackDays || 30));
  
  const relevantSessions = sessions
    .filter(s => s.status === 'completed' && s.completedAt)
    .filter(s => {
      const sessionDate = s.completedAt || s.startedAt;
      return sessionDate >= cutoffDate;
    })
    .sort((a, b) => {
      const dateA = a.completedAt || a.startedAt;
      const dateB = b.completedAt || b.startedAt;
      return dateA.getTime() - dateB.getTime(); // Oldest first
    });

  // Process each session
  relevantSessions.forEach(session => {
    session.exerciseLogs.forEach(exerciseLog => {
      const exerciseKey = exerciseLog.exerciseId || exerciseLog.exerciseName;
      
      if (!exerciseMap.has(exerciseKey)) {
        exerciseMap.set(exerciseKey, {
          exerciseName: exerciseLog.exerciseName,
          exerciseId: exerciseLog.exerciseId,
          sessions: [],
        });
      }

      const history = exerciseMap.get(exerciseKey)!;
      const sessionData = extractExerciseSessionData(exerciseLog, session, opts);
      
      if (sessionData) {
        history.sessions.push(sessionData);
      }
    });
  });

  return Array.from(exerciseMap.values())
    .filter(h => h.sessions.length >= (opts.minSessions || 3));
}

/**
 * Extract data for a single exercise from a session
 */
function extractExerciseSessionData(
  exerciseLog: ExerciseLog,
  session: WorkoutSession,
  options: AnalysisOptions
): ExerciseSessionData | null {
  // Filter sets
  const sets = exerciseLog.sets.filter(set => {
    if (!set.completed) return false;
    if (!options.includeWarmupSets && set.type === 'warmup') return false;
    return true;
  });

  if (sets.length === 0) return null;

  // Calculate metrics
  const setsWithWeight = sets.filter(s => s.weight !== undefined && s.weight !== null);
  const maxWeight = setsWithWeight.length > 0 
    ? Math.max(...setsWithWeight.map(s => s.weight!))
    : null;
  
  const totalWeight = setsWithWeight.reduce((sum, s) => sum + (s.weight || 0), 0);
  const averageWeight = setsWithWeight.length > 0 
    ? totalWeight / setsWithWeight.length 
    : null;

  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
  const averageReps = sets.length > 0 ? totalReps / sets.length : 0;

  const totalVolume = sets.reduce((sum, s) => {
    return sum + ((s.weight || 0) * s.reps);
  }, 0);

  const rpeValues = sets.filter(s => s.rpe !== undefined && s.rpe !== null).map(s => s.rpe!);
  const averageRPE = rpeValues.length > 0
    ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length
    : null;

  const rirValues = sets.filter(s => s.rir !== undefined && s.rir !== null).map(s => s.rir!);
  const averageRIR = rirValues.length > 0
    ? rirValues.reduce((sum, rir) => sum + rir, 0) / rirValues.length
    : null;

  return {
    sessionId: session.id,
    date: session.completedAt || session.startedAt,
    maxWeight,
    averageWeight,
    totalVolume,
    averageReps,
    averageRPE,
    averageRIR,
    setsCompleted: sets.length,
    completedSets: sets,
  };
}

/**
 * Detect patterns in exercise progression
 */
export function detectExercisePatterns(
  history: ExerciseHistory,
  options: AnalysisOptions = {}
): ExercisePattern {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const sessions = history.sessions;
  
  if (sessions.length < 2) {
    return {
      exerciseName: history.exerciseName,
      exerciseId: history.exerciseId,
      patternType: 'inconsistent',
      description: 'Insufficient data for pattern analysis',
      severity: 'low',
      dataPoints: sessions.length,
      trend: 'flat',
      lastThreeSessions: sessions.slice(-3),
    };
  }

  // Analyze weight progression
  const recentSessions = sessions.slice(-3); // Last 3 sessions
  const allSessions = sessions;
  
  // Check for plateau (same or similar max weight for 3+ sessions)
  const recentMaxWeights = recentSessions
    .map(s => s.maxWeight)
    .filter(w => w !== null) as number[];
  
  const plateau = detectPlateau(recentMaxWeights, opts.weightProgressionThreshold || 2.5);
  
  // Check for decline (decreasing max weight)
  const decline = detectDecline(allSessions.map(s => s.maxWeight));
  
  // Check for progression
  const progression = detectProgression(allSessions, opts.weightProgressionThreshold || 2.5);
  
  // Determine pattern type
  let patternType: ExercisePattern['patternType'];
  let description: string;
  let severity: ExercisePattern['severity'] = 'low';
  let trend: ExercisePattern['trend'] = 'flat';

  if (decline.severe) {
    patternType = 'decline';
    description = `Performance declining: Max weight decreased by ${decline.decrease}% over recent sessions. May indicate overtraining or need for recovery.`;
    severity = decline.decrease > 10 ? 'high' : 'medium';
    trend = 'down';
  } else if (plateau.detected && !progression.detected) {
    patternType = 'plateau';
    const plateauDuration = plateau.duration;
    description = `Plateau detected: Max weight has remained at ~${plateau.averageWeight} lbs for ${plateauDuration} sessions without progression.`;
    severity = plateauDuration >= 3 ? 'high' : plateauDuration >= 2 ? 'medium' : 'low';
    trend = 'flat';
  } else if (progression.detected) {
    patternType = 'progression';
    description = `Positive progression: Max weight increased by ${progression.increase.toFixed(1)} lbs over ${progression.sessions} sessions.`;
    severity = 'low';
    trend = 'up';
  } else {
    patternType = 'inconsistent';
    description = 'Inconsistent progression pattern detected. May benefit from structured periodization.';
    severity = 'low';
    trend = 'flat';
  }

  // Check for optimal pattern (consistent progression without overreaching)
  const avgRPE = recentSessions
    .map(s => s.averageRPE)
    .filter(rpe => rpe !== null) as number[];
  
  if (patternType === 'progression' && avgRPE.length > 0) {
    const avgRecentRPE = avgRPE.reduce((sum, rpe) => sum + rpe, 0) / avgRPE.length;
    if (avgRecentRPE >= 7 && avgRecentRPE <= 8.5) {
      patternType = 'optimal';
      description = 'Optimal progression: Consistent weight increases with appropriate intensity (RPE 7-8.5).';
    }
  }

  return {
    exerciseName: history.exerciseName,
    exerciseId: history.exerciseId,
    patternType,
    description,
    severity,
    dataPoints: sessions.length,
    trend,
    lastThreeSessions: recentSessions,
  };
}

/**
 * Detect if exercise is in a plateau
 */
function detectPlateau(maxWeights: number[], threshold: number): {
  detected: boolean;
  duration: number;
  averageWeight: number;
} {
  if (maxWeights.length < 2) {
    return { detected: false, duration: 0, averageWeight: 0 };
  }

  // Check last 3 weights (or available weights)
  const recent = maxWeights.slice(-Math.min(3, maxWeights.length));
  const avgWeight = recent.reduce((sum, w) => sum + w, 0) / recent.length;
  
  // All recent weights should be within threshold of average
  const allWithinRange = recent.every(w => 
    Math.abs(w - avgWeight) <= threshold
  );

  if (allWithinRange && recent.length >= 2) {
    return {
      detected: true,
      duration: recent.length,
      averageWeight: Math.round(avgWeight),
    };
  }

  return { detected: false, duration: 0, averageWeight: 0 };
}

/**
 * Detect if exercise is declining
 */
function detectDecline(maxWeights: (number | null)[]): {
  severe: boolean;
  decrease: number;
} {
  const validWeights = maxWeights.filter((w): w is number => w !== null);
  if (validWeights.length < 2) {
    return { severe: false, decrease: 0 };
  }

  // Compare last session to average of previous 2-3 sessions
  const lastWeight = validWeights[validWeights.length - 1];
  const previousWeights = validWeights.slice(0, -1);
  const previousAvg = previousWeights.reduce((sum, w) => sum + w, 0) / previousWeights.length;
  
  if (lastWeight < previousAvg) {
    const decrease = ((previousAvg - lastWeight) / previousAvg) * 100;
    return {
      severe: decrease > 5, // More than 5% decrease
      decrease: Math.round(decrease * 10) / 10,
    };
  }

  return { severe: false, decrease: 0 };
}

/**
 * Detect progression in exercise
 */
function detectProgression(
  sessions: ExerciseSessionData[],
  threshold: number
): {
  detected: boolean;
  increase: number;
  sessions: number;
} {
  if (sessions.length < 2) {
    return { detected: false, increase: 0, sessions: 0 };
  }

  const firstWeight = sessions[0].maxWeight;
  const lastWeight = sessions[sessions.length - 1].maxWeight;

  if (firstWeight === null || lastWeight === null) {
    return { detected: false, increase: 0, sessions: 0 };
  }

  const increase = lastWeight - firstWeight;
  if (increase >= threshold) {
    return {
      detected: true,
      increase,
      sessions: sessions.length,
    };
  }

  return { detected: false, increase: 0, sessions: 0 };
}

