import { useState, useEffect } from 'react';
import { WorkoutSplit } from '@/lib/types';
import { getActiveWorkoutSessions } from '@/lib/supabase/workout-service';

interface ActiveSession {
  splitId: string;
  dayId: string;
  startedAt: Date;
}

interface UseActiveSessionReturn {
  activeSession: ActiveSession | null;
  setActiveSession: (session: ActiveSession | null) => void;
}

/**
 * Custom hook to check for active workout sessions in the database
 * Only checks for split workouts (not freestyle)
 */
export function useActiveSession(
  userId: string | undefined,
  splits: WorkoutSplit[],
  currentView: string
): UseActiveSessionReturn {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    const checkActiveSession = async () => {
      if (!userId) {
        setActiveSession(null);
        return;
      }
      
      // Only check when on splits view (home view handled separately)
      if (currentView !== 'splits') return;
      
      // Wait for splits to be loaded
      if (splits.length === 0) {
        setActiveSession(null);
        return;
      }

      try {
        const activeSessions = await getActiveWorkoutSessions();
        
        // Filter out freestyle sessions (we only want split workouts here)
        const splitActiveSessions = activeSessions.filter(s => s.splitId !== 'freestyle');
        
        if (splitActiveSessions.length > 0) {
          // Find the most recent active session that matches one of our splits
          const matchingSession = splitActiveSessions.find(s => 
            splits.some(split => split.id === s.splitId)
          );
          
          if (matchingSession) {
            // Check if there are completed sets
            const hasCompletedSets = matchingSession.exerciseLogs.some(exercise =>
              exercise.sets.some(set => set.completed)
            );
            
            if (hasCompletedSets) {
              setActiveSession({
                splitId: matchingSession.splitId,
                dayId: matchingSession.dayId,
                startedAt: matchingSession.startedAt
              });
              return;
            }
          }
        }
        
        // No active sessions found
        setActiveSession(null);
      } catch (error) {
        console.error('Error checking for active session:', error);
        setActiveSession(null);
      }
    };

    checkActiveSession();
  }, [userId, splits, currentView]);

  return { activeSession, setActiveSession };
}

