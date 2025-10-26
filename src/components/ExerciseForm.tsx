'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExerciseFormData } from '@/lib/types';
import { validateExerciseForm, formatRestTime } from '@/lib/workout-utils';

interface ExerciseFormProps {
  onSubmit: (exercise: ExerciseFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ExerciseFormData>;
  isEditing?: boolean;
}

export function ExerciseForm({ onSubmit, onCancel, initialData, isEditing = false }: ExerciseFormProps) {
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: initialData?.name || '',
    warmupSets: initialData?.warmupSets ?? '',
    workingSets: initialData?.workingSets ?? '',
    repRangeMin: initialData?.repRangeMin ?? '',
    repRangeMax: initialData?.repRangeMax ?? '',
    intensityMetricType: initialData?.intensityMetricType ?? '',
    intensityMetricValue: initialData?.intensityMetricValue ?? '',
    restTime: initialData?.restTime ?? '',
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

          {/* Sets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warmupSets">Warmup Sets</Label>
              <Input
                id="warmupSets"
                type="number"
                min="0"
                value={formData.warmupSets}
                onChange={(e) => updateFormData('warmupSets', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingSets">Working Sets *</Label>
              <Input
                id="workingSets"
                type="number"
                min="1"
                value={formData.workingSets}
                onChange={(e) => updateFormData('workingSets', e.target.value)}
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
                onChange={(e) => updateFormData('repRangeMin', e.target.value)}
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
                onChange={(e) => updateFormData('repRangeMax', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Intensity Metric */}
          <div className="space-y-2">
            <Label htmlFor="intensityMetricType">Intensity Metric</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  id="intensityMetricType"
                  value={formData.intensityMetricType}
                  onChange={(e) => updateFormData('intensityMetricType', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">None</option>
                  <option value="rpe">RPE (Rate of Perceived Exertion)</option>
                  <option value="rir">RIR (Reps in Reserve)</option>
                </select>
              </div>
              <div>
                <Input
                  id="intensityMetricValue"
                  type="number"
                  min={formData.intensityMetricType === 'rpe' ? '1' : '0'}
                  max="10"
                  value={formData.intensityMetricValue}
                  onChange={(e) => updateFormData('intensityMetricValue', e.target.value)}
                  placeholder={formData.intensityMetricType === 'rpe' ? '1-10' : formData.intensityMetricType === 'rir' ? '0-10' : 'Select metric first'}
                  disabled={!formData.intensityMetricType}
                />
              </div>
            </div>
            {formData.intensityMetricType && (
              <p className="text-xs text-muted-foreground">
                {formData.intensityMetricType === 'rpe' 
                  ? 'RPE: How hard the set felt (1: easy, 10: max effort)'
                  : 'RIR: How many more reps you could have done (0: no reps left, 10: 10 reps left)'
                }
              </p>
            )}
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
                onChange={(e) => updateFormData('restTime', e.target.value)}
                required
                className="flex-1"
              />
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
