// AI Analysis Types for Workout Intelligence

import { WorkoutSession, ExerciseLog, SetLog } from '../types';

export interface ExerciseHistory {
  exerciseName: string;
  exerciseId: string;
  sessions: ExerciseSessionData[];
}

export interface ExerciseSessionData {
  sessionId: string;
  date: Date;
  maxWeight: number | null;
  averageWeight: number | null;
  totalVolume: number;
  averageReps: number;
  averageRPE: number | null;
  averageRIR: number | null;
  setsCompleted: number;
  completedSets: SetLog[];
}

export interface ExercisePattern {
  exerciseName: string;
  exerciseId: string;
  patternType: 'plateau' | 'progression' | 'decline' | 'inconsistent' | 'optimal';
  description: string;
  severity: 'low' | 'medium' | 'high';
  dataPoints: number;
  trend: 'up' | 'down' | 'flat';
  lastThreeSessions: ExerciseSessionData[];
}

export interface WorkoutRecommendation {
  id: string;
  type: 'deload' | 'volume_increase' | 'volume_decrease' | 'rep_range_change' | 'isometric' | 'rest' | 'progression_ready';
  priority: 'high' | 'medium' | 'low';
  exerciseName?: string; // Exercise-specific recommendation
  title: string;
  description: string;
  actionItems: string[];
  reasoning: string;
  relatedPatterns: string[];
}

export interface WorkoutAnalysis {
  overallScore: number; // 0-100
  summary: string;
  exercisePatterns: ExercisePattern[];
  recommendations: WorkoutRecommendation[];
  progressMetrics: {
    strengthProgress: number; // percentage change
    volumeProgress: number;
    consistencyScore: number;
    recoveryScore: number;
  };
  analyzedDate: Date;
  sessionsAnalyzed: number;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface AnalysisOptions {
  lookbackDays?: number; // Default: 30 days
  minSessions?: number; // Minimum sessions needed for analysis (Default: 3)
  includeWarmupSets?: boolean; // Default: false
  weightProgressionThreshold?: number; // Minimum weight increase to count as progression (Default: 2.5 lbs)
}

