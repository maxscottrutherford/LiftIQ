import confetti from 'canvas-confetti';

/**
 * Triggers a celebration confetti animation when a workout is completed
 * Similar to Canvas's confetti explosion effect
 * 
 * This function should only be called on the client side (components are marked 'use client')
 */
export function celebrateWorkoutComplete() {
  // Early return if not in browser (safety check)
  if (typeof window === 'undefined') return;

  const duration = 2000; // 3 seconds
  const end = Date.now() + duration;

  // Color palette matching the app theme
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Create a function to fire confetti continuously
  const frame = () => {
    // Launch confetti from left side
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    // Launch confetti from right side
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    
    // Continue animation until duration is reached
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  // Start the continuous animation
  frame();

  // Fire a big burst from the center (main explosion)
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors,
    });
  }, 250);

  // Fire another burst slightly delayed for layered effect
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors,
    });
  }, 400);
}

