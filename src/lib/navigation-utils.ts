/**
 * Navigation utility functions
 */

/**
 * Navigates to the dashboard home page
 */
export const navigateToDashboard = () => {
  window.location.href = '/dashboard';
};

/**
 * Sets the workout completion flag in sessionStorage for celebration
 */
export const setWorkoutCompletedFlag = () => {
  try {
    sessionStorage.setItem('workout_completed', 'true');
  } catch (error) {
    console.error('Error setting workout completion flag:', error);
  }
};

