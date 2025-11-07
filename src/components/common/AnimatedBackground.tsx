'use client';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Floating circle outlines - positioned at different starting points to match animation */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] border-2 border-primary/30 dark:border-primary/40 rounded-full animate-float-around"></div>
      <div className="absolute top-3/4 right-1/4 w-[500px] h-[500px] border-2 border-accent/30 dark:border-accent/40 rounded-full animate-float-around-reverse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border-2 border-primary/25 dark:border-primary/35 rounded-full animate-float-around" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/5 right-1/6 w-[400px] h-[400px] border-2 border-accent/28 dark:border-accent/38 rounded-full animate-float-around-reverse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-4/5 left-1/6 w-[350px] h-[350px] border-2 border-primary/27 dark:border-primary/37 rounded-full animate-float-around" style={{ animationDelay: '3s' }}></div>
    </div>
  );
}

