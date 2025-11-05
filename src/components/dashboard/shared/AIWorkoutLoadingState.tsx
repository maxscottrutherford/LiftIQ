'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingStep {
  label: string;
  duration: number;
}

const LOADING_STEPS: LoadingStep[] = [
  { label: 'Analyzing your fitness goals...', duration: 2000 },
  { label: 'Understanding your schedule...', duration: 1800 },
  { label: 'Selecting optimal exercises...', duration: 2000 },
  { label: 'Calculating rep ranges...', duration: 1800 },
  { label: 'Designing your program...', duration: 2000 },
  { label: 'Finalizing workout plan...', duration: 1800 },
];

export function AIWorkoutLoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length) return;

    // Reset progress when step changes
    setProgress(0);

    const step = LOADING_STEPS[currentStep];
    const stepDuration = step.duration;
    
    // Simple linear progress animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / stepDuration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        if (currentStep < LOADING_STEPS.length - 1) {
          // Pause briefly before moving to next step so user can read
          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
          }, 500);
        }
      }
    }, 50); // Update every 50ms for smoother animation

    return () => clearInterval(interval);
  }, [currentStep]);

  const overallProgress = Math.min(((currentStep + progress / 100) / LOADING_STEPS.length) * 100, 100);

  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg p-4 w-full max-w-md space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <Loader2 className="h-4 w-4 text-primary animate-spin absolute inset-0" />
          </div>
          <span className="text-sm font-medium text-foreground">Creating your workout plan...</span>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Overall Progress</span>
            <span className="text-xs font-medium text-primary">{Math.min(Math.round(overallProgress), 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{LOADING_STEPS[currentStep]?.label || 'Processing...'}</span>
            <span className="text-xs font-medium text-accent">{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-1.5 pt-1">
          {LOADING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-primary'
                  : index === currentStep
                  ? 'bg-accent'
                  : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

