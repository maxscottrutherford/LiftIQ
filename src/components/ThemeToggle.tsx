'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render icon after client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show sun icon when theme is dark, moon when light
  const showSun = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg border bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:shadow-xl z-50 text-foreground hover:text-foreground transition-all"
    >
      {mounted ? (
        showSun ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        // Render Moon as placeholder during SSR to match server render
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {mounted && showSun ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
}
