'use client';

import { useEffect } from 'react';

/**
 * MobileInputHandler - Handles mobile-specific input behaviors
 * 
 * This component manages:
 * - Auto-scrolling inputs into view when keyboard opens
 * - Preventing layout shifts on mobile
 */
export function MobileInputHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      // Only handle input, textarea, and select elements
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        // Small delay to ensure keyboard has opened
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }, 300);
      }
    };

    // Add event listener
    document.addEventListener('focusin', handleFocusIn);

    // Cleanup
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return null;
}

