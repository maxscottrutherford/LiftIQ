import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

interface ExerciseSelectorProps {
  exercises: string[];
  selectedExercise: string;
  onExerciseChange: (exercise: string) => void;
}

export function ExerciseSelector({ exercises, selectedExercise, onExerciseChange }: ExerciseSelectorProps) {
  if (exercises.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
        <div className="space-y-2">
          <label htmlFor="exercise-select-ai" className="text-sm font-medium">
            Select Exercise to Analyze
          </label>
          <div className="relative">
            <select
              id="exercise-select-ai"
              value={selectedExercise}
              onChange={(e) => onExerciseChange(e.target.value)}
              className="w-full px-3 py-2.5 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer touch-manipulation"
            >
              {exercises.map(exercise => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

