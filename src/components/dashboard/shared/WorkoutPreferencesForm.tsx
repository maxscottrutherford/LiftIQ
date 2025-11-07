'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface WorkoutPreferences {
  trainingDays: number;
  workoutDuration: number; // in minutes
  splitFormat: string;
  exercisesPerDay: number;
  extraNotes: string;
  // Advanced fields
  fitnessGoal?: string;
  experienceLevel?: string;
  equipmentAccess?: string;
  trainingFocus?: string[]; // Array of selected focus areas
  includeCardio?: boolean;
  cardioFrequency?: string; // 'none', 'light', 'moderate', 'high'
  cardioType?: string; // 'running', 'cycling', 'rowing', 'hiit', 'mixed', 'preference'
}

interface WorkoutPreferencesFormProps {
  onSubmit: (preferences: WorkoutPreferences) => void;
  isLoading?: boolean;
}

const SPLIT_FORMATS = [
  { value: 'fullbody', label: 'Full Body' },
  { value: 'upper/lower', label: 'Upper/Lower' },
  { value: 'push/pull/legs', label: 'Push/Pull/Legs' },
  { value: 'push/pull', label: 'Push/Pull' },
  { value: 'bro-split', label: 'Bro Split (Chest/Back/Shoulders/Arms/Legs)' },
  { value: 'custom', label: 'Custom (Let AI decide)' },
];

const FITNESS_GOALS = [
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Hypertrophy / Muscle Building' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'general-fitness', label: 'General Fitness' },
  { value: 'athletic-performance', label: 'Athletic Performance' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'full-gym', label: 'Full Commercial Gym' },
  { value: 'home-gym', label: 'Home Gym (Limited Equipment)' },
  { value: 'minimal', label: 'Minimal Equipment (Dumbbells/Kettlebells)' },
  { value: 'bodyweight', label: 'Bodyweight Only' },
  { value: 'no-equipment', label: 'No Equipment' },
];

const TRAINING_FOCUS_OPTIONS = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'full-body', label: 'Full Body' },
];

const CARDIO_FREQUENCY_OPTIONS = [
  { value: 'none', label: 'No Cardio' },
  { value: 'light', label: 'Light (1-2x per week)' },
  { value: 'moderate', label: 'Moderate (2-3x per week)' },
  { value: 'high', label: 'High (3-4x per week)' },
];

const CARDIO_TYPE_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'rowing', label: 'Rowing' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'mixed', label: 'Mixed (Variety)' },
  { value: 'preference', label: 'Let AI decide' },
];

export function WorkoutPreferencesForm({ onSubmit, isLoading = false }: WorkoutPreferencesFormProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [trainingDays, setTrainingDays] = useState<number>(3);
  const [workoutDuration, setWorkoutDuration] = useState<string>('60');
  const [splitFormat, setSplitFormat] = useState<string>('push/pull/legs');
  const [exercisesPerDay, setExercisesPerDay] = useState<string>('5');
  const [extraNotes, setExtraNotes] = useState<string>('');
  
  // Advanced fields
  const [fitnessGoal, setFitnessGoal] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [equipmentAccess, setEquipmentAccess] = useState<string>('');
  const [trainingFocus, setTrainingFocus] = useState<string[]>([]);
  const [includeCardio, setIncludeCardio] = useState<boolean>(false);
  const [cardioFrequency, setCardioFrequency] = useState<string>('none');
  const [cardioType, setCardioType] = useState<string>('preference');

  const handleFocusToggle = (value: string) => {
    setTrainingFocus(prev => 
      prev.includes(value) 
        ? prev.filter(f => f !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse and validate number inputs, using defaults if empty or invalid
    // Handle workout duration - default to 60 if empty or invalid
    let duration: number;
    if (workoutDuration.trim() === '') {
      duration = 60; // Default value
    } else {
      const parsed = parseInt(workoutDuration);
      if (isNaN(parsed) || parsed < 15 || parsed > 180) {
        duration = 60; // Default to 60 if invalid or out of range
      } else {
        duration = parsed;
      }
    }
    
    // Handle exercises per day - default to 5 if empty or invalid
    let exercises: number;
    if (exercisesPerDay.trim() === '') {
      exercises = 5; // Default value
    } else {
      const parsed = parseInt(exercisesPerDay);
      if (isNaN(parsed) || parsed < 3 || parsed > 12) {
        exercises = 5; // Default to 5 if invalid or out of range
      } else {
        exercises = parsed;
      }
    }
    
    const preferences: WorkoutPreferences = {
      trainingDays,
      workoutDuration: duration,
      splitFormat,
      exercisesPerDay: exercises,
      extraNotes,
    };

    // Add advanced fields if in advanced mode
    if (isAdvanced) {
      preferences.fitnessGoal = fitnessGoal;
      preferences.experienceLevel = experienceLevel;
      preferences.equipmentAccess = equipmentAccess;
      preferences.trainingFocus = trainingFocus;
      preferences.includeCardio = includeCardio;
      preferences.cardioFrequency = includeCardio ? cardioFrequency : 'none';
      preferences.cardioType = includeCardio ? cardioType : undefined;
    }
    
    onSubmit(preferences);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        {/* Mode Toggle */}
        <div className="mb-2 text-center p-2 bg-muted rounded-lg space-y-4">
          <div>
            <Label className="text-base sm:text-lg font-semibold">Planner Mode</Label>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={!isAdvanced ? "default" : "outline"}
              size="lg"
              onClick={() => setIsAdvanced(false)}
              className="flex-1"
            >
              Simple
            </Button>
            <Button
              type="button"
              variant={isAdvanced ? "default" : "outline"}
              size="lg"
              onClick={() => setIsAdvanced(true)}
              className="flex-1"
            >
              Advanced
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isAdvanced 
              ? 'Advanced mode includes additional customization options for more personalized plans'
              : 'Simple mode uses essential preferences for quick plan generation'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Advanced: Fitness Goal */}
          {isAdvanced && (
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal">
                What is your primary fitness goal?
              </Label>
              <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                <SelectTrigger id="fitnessGoal">
                  <SelectValue placeholder="Select your fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  {FITNESS_GOALS.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps determine rep ranges, volume, and exercise selection
              </p>
            </div>
          )}

          {/* Training Days */}
          <div className="space-y-2">
            <Label htmlFor="trainingDays">How many days per week can you train?</Label>
            <Select
              value={trainingDays.toString()}
              onValueChange={(value) => setTrainingDays(parseInt(value))}
            >
              <SelectTrigger id="trainingDays">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7].map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? 'day' : 'days'} per week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workout Duration */}
          <div className="space-y-2">
            <Label htmlFor="workoutDuration">How long are your workouts? (minutes)</Label>
            <Input
              id="workoutDuration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={workoutDuration}
              onChange={(e) => setWorkoutDuration(e.target.value)}
              placeholder="60"
            />
            <p className="text-xs text-muted-foreground">
              Typical workouts are 45-90 minutes
            </p>
          </div>

          {/* Advanced: Experience Level */}
          {isAdvanced && (
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">What is your experience level?</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps determine program complexity and progression
              </p>
            </div>
          )}

          {/* Advanced: Equipment Access */}
          {isAdvanced && (
            <div className="space-y-2">
              <Label htmlFor="equipmentAccess">What equipment do you have access to?</Label>
              <Select value={equipmentAccess} onValueChange={setEquipmentAccess}>
                <SelectTrigger id="equipmentAccess">
                  <SelectValue placeholder="Select equipment access" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This ensures exercises match your available equipment
              </p>
            </div>
          )}

          {/* Split Format */}
          <div className="space-y-2">
            <Label htmlFor="splitFormat">Preferred workout split format</Label>
            <Select value={splitFormat} onValueChange={setSplitFormat}>
              <SelectTrigger id="splitFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPLIT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a format that matches your schedule and goals
            </p>
          </div>

          {/* Exercises Per Day */}
          <div className="space-y-2">
            <Label htmlFor="exercisesPerDay">How many exercises per workout day?</Label>
            <Input
              id="exercisesPerDay"
              type="number"
              min="3"
              max="12"
              step="1"
              value={exercisesPerDay}
              onChange={(e) => setExercisesPerDay(e.target.value)}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Typical workouts have 4-8 exercises per day
            </p>
          </div>

          {/* Advanced: Training Focus */}
          {isAdvanced && (
            <div className="space-y-2">
              <Label>Which areas would you like to focus on? (Select all that apply)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {TRAINING_FOCUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={trainingFocus.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFocusToggle(option.value)}
                    className="justify-start"
                  >
                    {trainingFocus.includes(option.value) && '✓ '}
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select muscle groups or areas you want to prioritize in your program
              </p>
            </div>
          )}

          {/* Advanced: Cardio Preferences */}
          {isAdvanced && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeCardio" className="text-base font-medium cursor-pointer">
                  Include Cardio in Workouts
                </Label>
                <input
                  type="checkbox"
                  id="includeCardio"
                  checked={includeCardio}
                  onChange={(e) => {
                    setIncludeCardio(e.target.checked);
                    if (e.target.checked) {
                      setCardioFrequency('light');
                    } else {
                      setCardioFrequency('none');
                    }
                  }}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              
              {includeCardio && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="cardioFrequency">Cardio Frequency</Label>
                    <Select value={cardioFrequency} onValueChange={setCardioFrequency}>
                      <SelectTrigger id="cardioFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CARDIO_FREQUENCY_OPTIONS.filter(opt => opt.value !== 'none').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How often you'd like cardio included in your weekly program
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardioType">Preferred Cardio Type</Label>
                    <Select value={cardioType} onValueChange={setCardioType}>
                      <SelectTrigger id="cardioType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CARDIO_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select your preferred type of cardiovascular exercise
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Extra Notes */}
          <div className="space-y-2">
            <Label htmlFor="extraNotes">
              Additional preferences or goals (optional)
            </Label>
            <Textarea
              id="extraNotes"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder={isAdvanced 
                ? "e.g., I have a lower back injury, I prefer compound movements, I want to improve my squat..."
                : "e.g., Focus on strength, I have access to a full gym, I prefer compound movements, I want to target my legs more..."
              }
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Any specific goals, equipment access, injuries, or preferences you'd like to include
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || (isAdvanced && !fitnessGoal)}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Generating...' : 'Generate Workout Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
