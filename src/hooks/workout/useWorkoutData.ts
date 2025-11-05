import { useState, useEffect } from 'react';
import { WorkoutSplit, WorkoutSession } from '@/lib/types';
import { 
  getWorkoutSplits, 
  getWorkoutSessions
} from '@/lib/supabase/workout-service';

interface UseWorkoutDataReturn {
  splits: WorkoutSplit[];
  sessions: WorkoutSession[];
  loading: boolean;
  refreshSessions: () => Promise<void>;
  refreshSplits: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

/**
 * Custom hook to load and manage workout splits and sessions
 * Includes retry logic for handling cookie timing issues
 */
export function useWorkoutData(userId: string | undefined, authLoading: boolean): UseWorkoutDataReturn {
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    // Wait for auth to finish loading first
    if (authLoading) {
      console.log('Waiting for auth to finish loading...');
      return;
    }

    // If auth is done but no user, set loading to false and return
    if (!userId) {
      console.log('No authenticated user found after auth loaded');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading workout data for user:', userId);
      
      // Retry logic - sometimes the first call fails due to cookie timing
      let retries = 3;
      let loadedSplits: WorkoutSplit[] = [];
      let loadedSessions: WorkoutSession[] = [];
      
      while (retries > 0) {
        try {
          [loadedSplits, loadedSessions] = await Promise.all([
            getWorkoutSplits(),
            getWorkoutSessions()
          ]);
          
          // If we got data (even if empty), break
          if (loadedSplits.length >= 0 && loadedSessions.length >= 0) {
            break;
          }
        } catch (error) {
          console.warn(`Retry attempt ${4 - retries} failed:`, error);
          retries--;
          if (retries > 0) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      setSplits(loadedSplits);
      setSessions(loadedSessions);
      console.log(`Loaded ${loadedSplits.length} splits and ${loadedSessions.length} sessions`);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSessions = async () => {
    try {
      const updatedSessions = await getWorkoutSessions();
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  };

  const refreshSplits = async () => {
    try {
      const updatedSplits = await getWorkoutSplits();
      setSplits(updatedSplits);
    } catch (error) {
      console.error('Error refreshing splits:', error);
    }
  };

  const refreshAll = async () => {
    try {
      const [updatedSplits, updatedSessions] = await Promise.all([
        getWorkoutSplits(),
        getWorkoutSessions()
      ]);
      setSplits(updatedSplits);
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, authLoading]);

  return { splits, sessions, loading, refreshSessions, refreshSplits, refreshAll };
}

