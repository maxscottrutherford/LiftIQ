'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { WorkoutPreferencesForm, WorkoutPreferences } from '@/components/dashboard/shared/WorkoutPreferencesForm';
import { AIWorkoutLoadingState } from '@/components/dashboard/shared/AIWorkoutLoadingState';
import { WorkoutPlanPreview } from '@/components/dashboard/shared/WorkoutPlanPreview';
import { WorkoutSplit } from '@/lib/types';
import { parseAIWorkoutPlan } from '@/lib/ai-coaching/workout-plan-parser';
import { generateWorkoutPlan } from '@/lib/ai-coaching/openai-service';
import { saveWorkoutSplit } from '@/lib/supabase/workout-service';

export default function AIPlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutSplit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitPreferences = async (preferences: WorkoutPreferences) => {
    setStep('loading');
    setError(null);

    // Build the user input from preferences
    let userInput = `Create a ${preferences.splitFormat} workout program for ${preferences.trainingDays} days per week. `;
    userInput += `Each workout should be approximately ${preferences.workoutDuration} minutes long. `;
    userInput += `IMPORTANT: Each workout day must include exactly ${preferences.exercisesPerDay} exercises. `;
    
    // Add advanced fields if provided
    if (preferences.fitnessGoal) {
      const goalLabels: Record<string, string> = {
        'strength': 'strength building',
        'hypertrophy': 'muscle building/hypertrophy',
        'endurance': 'endurance and cardiovascular fitness',
        'weight-loss': 'weight loss and fat burning',
        'general-fitness': 'general fitness and health',
        'athletic-performance': 'athletic performance',
      };
      userInput += `Primary fitness goal: ${goalLabels[preferences.fitnessGoal] || preferences.fitnessGoal}. `;
    }
    
    if (preferences.experienceLevel) {
      userInput += `Experience level: ${preferences.experienceLevel}. Adjust program complexity and progression accordingly. `;
    }
    
    if (preferences.equipmentAccess) {
      const equipmentLabels: Record<string, string> = {
        'full-gym': 'full commercial gym with all equipment',
        'home-gym': 'home gym with limited equipment',
        'minimal': 'minimal equipment (dumbbells, kettlebells, etc.)',
        'bodyweight': 'bodyweight exercises only',
        'no-equipment': 'no equipment available',
      };
      userInput += `Equipment access: ${equipmentLabels[preferences.equipmentAccess] || preferences.equipmentAccess}. Only include exercises that can be performed with this equipment. `;
    }
    
    if (preferences.trainingFocus && preferences.trainingFocus.length > 0) {
      const focusLabels: Record<string, string> = {
        'chest': 'chest',
        'back': 'back',
        'shoulders': 'shoulders',
        'arms': 'arms (biceps and triceps)',
        'legs': 'legs',
        'core': 'core/abs',
        'full-body': 'full body',
      };
      const focusList = preferences.trainingFocus.map(f => focusLabels[f] || f).join(', ');
      userInput += `Prioritize and emphasize these muscle groups/areas: ${focusList}. `;
    }
    
    // Add cardio preferences if specified
    if (preferences.includeCardio && preferences.cardioFrequency && preferences.cardioFrequency !== 'none' && preferences.cardioType) {
      const frequencyLabels: Record<string, string> = {
        'light': '1-2 times per week',
        'moderate': '2-3 times per week',
        'high': '3-4 times per week',
      };
      const typeLabels: Record<string, string> = {
        'running': 'running',
        'cycling': 'cycling',
        'rowing': 'rowing',
        'hiit': 'HIIT (High Intensity Interval Training)',
        'mixed': 'a variety of cardio types',
        'preference': 'cardio types based on the program',
      };
      userInput += `Include cardiovascular exercise ${frequencyLabels[preferences.cardioFrequency] || preferences.cardioFrequency} with a focus on ${typeLabels[preferences.cardioType] || preferences.cardioType}. `;
      userInput += `Cardio exercises should be formatted as time-based exercises (duration in minutes). `;
    }
    
    if (preferences.extraNotes.trim()) {
      userInput += `Additional preferences: ${preferences.extraNotes}`;
    }

    // Minimum loading duration to ensure animation completes (6 steps × ~2s + pauses = ~13s)
    const minLoadingDuration = 13000;
    const startTime = Date.now();

    try {
      // Call OpenAI API to generate workout plan
      const aiResponse = await generateWorkoutPlan({
        userInput,
      });

      // Parse the workout plan from AI response
      const parsedPlan = parseAIWorkoutPlan(aiResponse);

      if (!parsedPlan) {
        throw new Error('Failed to parse workout plan from AI response');
      }

      // Wait for minimum duration before showing response
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setWorkoutPlan(parsedPlan);
      setStep('result');
    } catch (error) {
      console.error('Error generating workout plan:', error);
      
      // Wait for minimum duration even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setError(error instanceof Error ? error.message : 'Failed to generate workout plan. Please try again.');
      setStep('form');
    }
  };

  const handleSavePlan = async () => {
    if (!workoutPlan) return;

    setIsSaving(true);
    try {
      const saved = await saveWorkoutSplit(workoutPlan);
      if (saved) {
        setIsSaved(true);
      } else {
        throw new Error('Failed to save workout split');
      }
    } catch (error) {
      console.error('Error saving workout plan:', error);
      setError('Failed to save workout plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateNew = () => {
    setStep('form');
    setWorkoutPlan(null);
    setIsSaved(false);
    setError(null);
  };

  return (
    <main className="min-h-screen relative z-10" style={{ backgroundColor: 'transparent' }}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AI Workout Planner</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Create a personalized workout plan tailored to your goals and schedule
              </p>
            </div>
          </div>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-6">
            {error && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}
            <WorkoutPreferencesForm onSubmit={handleSubmitPreferences} />
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <AIWorkoutLoadingState />
        )}

        {/* Result Step */}
        {step === 'result' && workoutPlan && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Your Workout Plan is Ready!</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      Review the plan below and save it to your workout splits when you're ready.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerateNew}
                      className="w-full sm:w-auto"
                    >
                      Create New Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <WorkoutPlanPreview
              plan={workoutPlan}
              onSave={handleSavePlan}
              isSaving={isSaving}
              isSaved={isSaved}
            />

            {isSaved && (
              <Card className="border-success bg-success/10">
                <CardContent className="p-4">
                  <p className="text-sm sm:text-base text-success font-medium">
                    ✅ Successfully saved "{workoutPlan.name}" to your workout splits! You can now find it in your Workout Splits section.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard?view=splits')}
                      className="w-full sm:w-auto"
                    >
                      View My Splits
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateNew}
                      className="w-full sm:w-auto"
                    >
                      Create Another Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

