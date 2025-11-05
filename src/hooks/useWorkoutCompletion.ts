import { useState, useEffect } from 'react';

const WORKOUT_COMPLETED_KEY = 'workout_completed';

/**
 * Custom hook to check if a workout was just completed
 * and automatically clear the sessionStorage flag
 */
export function useWorkoutCompletion() {
  const [showCongratulations, setShowCongratulations] = useState(false);

  useEffect(() => {
    try {
      const workoutCompleted = sessionStorage.getItem(WORKOUT_COMPLETED_KEY);
      if (workoutCompleted === 'true') {
        sessionStorage.removeItem(WORKOUT_COMPLETED_KEY);
        setShowCongratulations(true);
      }
    } catch (error) {
      console.error('Error checking workout completion:', error);
    }
  }, []);

  return {
    showCongratulations,
    setShowCongratulations,
  };
}

