'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseFormData } from '@/lib/types';
import { validateExerciseForm, formatRestTime, exerciseTemplates } from '@/lib/workout-utils';

interface ExerciseFormProps {
  onSubmit: (exercise: ExerciseFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ExerciseFormData>;
  isEditing?: boolean;
}

export function ExerciseForm({ onSubmit, onCancel, initialData, isEditing = false }: ExerciseFormProps) {
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: initialData?.name || '',
    warmupSets: initialData?.warmupSets ?? 2,
    workingSets: initialData?.workingSets ?? 3,
    repRangeMin: initialData?.repRangeMin ?? 8,
    repRangeMax: initialData?.repRangeMax ?? 12,
    rpe: initialData?.rpe ?? 8,
    restTime: initialData?.restTime ?? 2,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateExerciseForm(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onSubmit(formData);
  };

  const handleTemplateSelect = (template: Partial<ExerciseFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...template,
    }));
  };

  const updateFormData = (field: keyof ExerciseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-6">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Exercise' : 'Add Exercise'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="e.g., Bench Press, Squat, Pull-ups"
              required
            />
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {exerciseTemplates.map((template, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Sets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warmupSets">Warmup Sets</Label>
              <Input
                id="warmupSets"
                type="number"
                min="0"
                value={formData.warmupSets}
                onChange={(e) => updateFormData('warmupSets', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingSets">Working Sets *</Label>
              <Input
                id="workingSets"
                type="number"
                min="1"
                value={formData.workingSets}
                onChange={(e) => updateFormData('workingSets', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Rep Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repRangeMin">Min Reps *</Label>
              <Input
                id="repRangeMin"
                type="number"
                min="1"
                value={formData.repRangeMin}
                onChange={(e) => updateFormData('repRangeMin', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repRangeMax">Max Reps *</Label>
              <Input
                id="repRangeMax"
                type="number"
                min="1"
                value={formData.repRangeMax}
                onChange={(e) => updateFormData('repRangeMax', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* RPE */}
          <div className="space-y-2">
            <Label htmlFor="rpe">RPE (1-10) *</Label>
            <Input
              id="rpe"
              type="number"
              min="1"
              max="10"
              value={formData.rpe}
              onChange={(e) => updateFormData('rpe', parseInt(e.target.value) || 1)}
              required
            />
          </div>

          {/* Rest Time */}
          <div className="space-y-2">
            <Label htmlFor="restTime">Rest Time (minutes) *</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="restTime"
                type="number"
                min="0"
                step="0.5"
                value={formData.restTime}
                onChange={(e) => updateFormData('restTime', parseFloat(e.target.value) || 0)}
                required
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                ({formatRestTime(formData.restTime)})
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Any additional notes about this exercise..."
              rows={3}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Exercise' : 'Add Exercise'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
