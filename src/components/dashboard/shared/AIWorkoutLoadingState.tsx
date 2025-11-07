'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Dumbbell } from 'lucide-react';

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
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-3xl px-4 sm:px-6 space-y-8">
        {/* Icon and Title */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-primary/10 rounded-full p-6 border-2 border-primary/30">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Creating Your Workout Plan
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our AI is crafting a personalized program just for you
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium text-foreground">Overall Progress</span>
            <span className="text-lg sm:text-xl font-bold text-primary">{Math.min(Math.round(overallProgress), 100)}%</span>
          </div>
          <div className="w-full h-4 sm:h-5 bg-muted-foreground/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animation: 'shimmer 2s infinite'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg text-foreground font-medium">{LOADING_STEPS[currentStep]?.label || 'Processing...'}</span>
            <span className="text-base sm:text-lg font-bold text-accent">{Math.min(Math.round(progress), 100)}%</span>
          </div>
          <div className="w-full h-3 bg-muted-foreground/20 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 sm:gap-3 pt-4">
          {LOADING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 sm:h-2.5 flex-1 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-primary shadow-lg shadow-primary/50'
                  : index === currentStep
                  ? 'bg-accent shadow-lg shadow-accent/50 animate-pulse'
                  : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center items-center gap-4 pt-4 opacity-30">
          <Dumbbell className="h-6 w-6 text-primary animate-bounce" style={{ animationDelay: '0s' }} />
          <Dumbbell className="h-5 w-5 text-accent animate-bounce" style={{ animationDelay: '0.3s' }} />
          <Dumbbell className="h-6 w-6 text-primary animate-bounce" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}

