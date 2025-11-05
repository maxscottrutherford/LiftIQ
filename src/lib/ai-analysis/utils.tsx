import React from 'react';
import { 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  Target,
  Zap,
  Activity,
  Info,
} from 'lucide-react';
import { WorkoutRecommendation } from './types';

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-accent';
  return 'text-destructive';
}

/**
 * Get icon component based on score
 */
export function getScoreIcon(score: number) {
  if (score >= 75) return <CheckCircle2 className="h-5 w-5 text-success" />;
  if (score >= 50) return <AlertCircle className="h-5 w-5 text-accent" />;
  return <AlertCircle className="h-5 w-5 text-destructive" />;
}

/**
 * Get icon component based on recommendation type
 */
export function getRecommendationIcon(type: WorkoutRecommendation['type']) {
  switch (type) {
    case 'deload':
      return <TrendingDown className="h-4 w-4" />;
    case 'volume_increase':
    case 'volume_decrease':
      return <Activity className="h-4 w-4" />;
    case 'isometric':
      return <Target className="h-4 w-4" />;
    case 'rep_range_change':
      return <Zap className="h-4 w-4" />;
    case 'rest':
      return <Info className="h-4 w-4" />;
    case 'progression_ready':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
}

/**
 * Get priority border color class
 */
export function getPriorityColor(priority: WorkoutRecommendation['priority']): string {
  switch (priority) {
    case 'high':
      return 'border-l-destructive';
    case 'medium':
      return 'border-l-accent';
    case 'low':
      return 'border-l-primary';
  }
}

/**
 * Get pattern type badge class
 */
export function getPatternTypeBadgeClass(patternType: string): string {
  if (patternType === 'optimal' || patternType === 'progression') {
    return 'bg-success/20 text-success';
  }
  if (patternType === 'plateau') {
    return 'bg-accent/20 text-accent';
  }
  if (patternType === 'decline') {
    return 'bg-destructive/20 text-destructive';
  }
  return 'bg-muted text-muted-foreground';
}

/**
 * Get confidence badge class
 */
export function getConfidenceBadgeClass(confidence: number): string {
  if (confidence >= 0.7) {
    return 'bg-success/20 text-success';
  }
  if (confidence >= 0.5) {
    return 'bg-accent/20 text-accent';
  }
  return 'bg-muted text-muted-foreground';
}

