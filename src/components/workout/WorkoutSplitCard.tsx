'use client';

import { WorkoutSplit } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Play, Calendar } from 'lucide-react';

interface WorkoutSplitCardProps {
  split: WorkoutSplit;
  onEdit: (split: WorkoutSplit) => void;
  onDelete: (splitId: string) => void;
  onStart: (split: WorkoutSplit, dayId: string) => void;
}

export function WorkoutSplitCard({ split, onEdit, onDelete, onStart }: WorkoutSplitCardProps) {
  const totalExercises = split.days.reduce((total, day) => total + day.exercises.length, 0);
  const avgExercisesPerDay = Math.round(totalExercises / split.days.length);

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{split.name}</CardTitle>
            {split.description && (
              <p className="text-sm text-muted-foreground">{split.description}</p>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(split)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(split.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{split.days.length}</p>
            <p className="text-muted-foreground">Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{totalExercises}</p>
            <p className="text-muted-foreground">Exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{avgExercisesPerDay}</p>
            <p className="text-muted-foreground">Avg/Day</p>
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Workout Days:</h4>
          <div className="space-y-2">
            {split.days.map((day) => {
              const isRestDay = day.name === 'Rest Day';
              return (
                <div
                  key={day.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isRestDay ? 'bg-muted/50 border border-muted' : 'bg-muted'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-medium text-sm ${isRestDay ? 'text-muted-foreground' : ''}`}>
                      {day.name}
                    </span>
                    {!isRestDay && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {isRestDay && (
                      <span className="text-xs text-muted-foreground mt-0.5">Rest Day</span>
                    )}
                  </div>
                  {!isRestDay && (
                    <Button
                      size="sm"
                      onClick={() => onStart(split, day.id)}
                      className="h-7 px-3"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onEdit(split)}
            size="sm"
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Split
          </Button>
          <Button 
            variant="outline"
            onClick={() => onDelete(split.id)}
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Created {split.createdAt.toLocaleDateString()}</span>
          </div>
          {split.updatedAt.getTime() !== split.createdAt.getTime() && (
            <span>Updated {split.updatedAt.toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
