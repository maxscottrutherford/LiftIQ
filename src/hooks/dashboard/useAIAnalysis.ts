import { useState, useEffect } from 'react';
import { WorkoutSession } from '@/lib/types';
import { EnhancedWorkoutAnalysis } from '@/lib/ai-analysis/ml-integration';
import { analyzeWorkoutsWithML } from '@/lib/ai-analysis/ml-integration';

interface UseAIAnalysisReturn {
  analysis: EnhancedWorkoutAnalysis | null;
  loading: boolean;
}

/**
 * Custom hook to perform AI analysis on workout sessions
 */
export function useAIAnalysis(sessions: WorkoutSession[]): UseAIAnalysisReturn {
  const [analysis, setAnalysis] = useState<EnhancedWorkoutAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performAnalysis = async () => {
      setLoading(true);
      try {
        const result = await analyzeWorkoutsWithML(sessions, {
          useML: true,
          lookbackDays: 30,
          minSessions: 2, // Lower threshold to show predictions sooner
        });
        
        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessions.length > 0) {
      performAnalysis();
    } else {
      setLoading(false);
    }
  }, [sessions]);

  return { analysis, loading };
}

