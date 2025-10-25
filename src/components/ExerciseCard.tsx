'use client';

import { Exercise } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRepRange, formatSets, formatRPE, formatRestTime } from '@/lib/workout-utils';
import { Edit, Trash2 } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exerciseId: string) => void;
  showActions?: boolean;
}

export function ExerciseCard({ exercise, onEdit, onDelete, showActions = true }: ExerciseCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          {showActions && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(exercise)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(exercise.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sets and Reps */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Working Sets:</span>
            <p className="font-semibold">
              {formatSets(exercise.workingSets)}
            </p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Reps:</span>
            <p className="font-semibold">
              {formatRepRange(exercise.repRange.min, exercise.repRange.max)}
            </p>
          </div>
        </div>

        {/* Warmup and RPE */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Warmup Sets:</span>
            <p className="font-semibold">
              {exercise.warmupSets === 0 ? 'None' : formatSets(exercise.warmupSets)}
            </p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">RPE:</span>
            <p className="font-semibold">
              {formatRPE(exercise.rpe)}
            </p>
          </div>
        </div>

        {/* Rest Time */}
        <div className="text-sm">
          <span className="font-medium text-muted-foreground">Rest Time:</span>
          <p className="font-semibold">{formatRestTime(exercise.restTime)}</p>
        </div>

        {/* Notes */}
        {exercise.notes && (
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Notes:</span>
            <p className="mt-1 text-foreground">{exercise.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
