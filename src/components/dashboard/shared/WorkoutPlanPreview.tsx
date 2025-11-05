'use client';

import { useState } from 'react';
import { WorkoutSplit } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Calendar, Clock, Dumbbell, Loader2, CheckCircle2 } from 'lucide-react';
import { formatRestTime, formatRepRange, formatSets, formatIntensityMetric } from '@/lib/workout/utils';

interface WorkoutPlanPreviewProps {
  plan: WorkoutSplit;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function WorkoutPlanPreview({ plan, onSave, isSaving = false, isSaved = false }: WorkoutPlanPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalExercises = plan.days.reduce((total, day) => total + day.exercises.length, 0);

  return (
    <Card className="border-2 border-primary/20 bg-card">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{plan.days.length} day{plan.days.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{totalExercises} exercise{totalExercises !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {plan.days.map((day, dayIndex) => (
              <div key={day.id} className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">
                  {day.name}
                </h4>
                <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exercise.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{exercise.name}</p>
                          {exercise.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {/* Warmup Sets */}
                        {exercise.warmupSets > 0 && (
                          <span className="px-2 py-1 rounded bg-accent/20 text-accent">
                            {exercise.warmupSets} warmup sets
                          </span>
                        )}
                        
                        {/* Working Sets */}
                        <span className="px-2 py-1 rounded bg-primary/20 text-primary">
                          {exercise.workingSets} working sets
                        </span>
                        
                        {/* Rep Range */}
                        <span className="px-2 py-1 rounded bg-secondary/20 text-secondary">
                          {formatRepRange(exercise.repRange.min, exercise.repRange.max)}
                        </span>
                        
                        {/* Intensity Metric */}
                        {exercise.intensityMetric.type && (
                          <span className="px-2 py-1 rounded bg-muted">
                            {formatIntensityMetric(exercise.intensityMetric.type, exercise.intensityMetric.value)}
                          </span>
                        )}
                        
                        {/* Rest Time */}
                        {exercise.restTime > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted">
                            <Clock className="h-3 w-3" />
                            {formatRestTime(exercise.restTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {onSave && (
          <div className="pt-3 border-t">
            <Button
              onClick={onSave}
              disabled={isSaving || isSaved}
              className="w-full"
              variant={isSaved ? "outline" : "default"}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                  Saved to Splits
                </>
              ) : (
                <>
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Save as Workout Split
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

