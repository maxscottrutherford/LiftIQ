'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown } from 'lucide-react';
import { ExerciseFormData } from '@/lib/types';
import { validateExerciseForm, formatRestTime } from '@/lib/workout/utils';

interface ExerciseFormProps {
  onSubmit: (exercise: ExerciseFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ExerciseFormData>;
  isEditing?: boolean;
}

export function ExerciseForm({ onSubmit, onCancel, initialData, isEditing = false }: ExerciseFormProps) {
  // Helper function to convert total minutes (decimal) to minutes and seconds
  const parseRestTime = (totalMinutes: number | string): { minutes: number; seconds: number } => {
    if (totalMinutes === '' || totalMinutes === null || totalMinutes === undefined) {
      return { minutes: 0, seconds: 0 };
    }
    const minutesDecimal = typeof totalMinutes === 'string' ? parseFloat(totalMinutes) : totalMinutes;
    if (isNaN(minutesDecimal)) {
      return { minutes: 0, seconds: 0 };
    }
    const minutes = Math.floor(minutesDecimal);
    const seconds = Math.round((minutesDecimal % 1) * 60);
    return { minutes, seconds };
  };

  // Parse initial rest time into minutes and seconds
  const initialRestTime = parseRestTime(initialData?.restTime ?? 0);
  
  const [restMinutes, setRestMinutes] = useState<string>(initialRestTime.minutes.toString());
  const [restSeconds, setRestSeconds] = useState<string>(initialRestTime.seconds.toString());

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
    
    // Convert minutes and seconds to total minutes (decimal)
    const minutesValue = parseInt(restMinutes) || 0;
    const secondsValue = parseInt(restSeconds) || 0;
    const totalMinutes = minutesValue + (secondsValue / 60);
    
    // Update formData with calculated restTime
    const updatedFormData = {
      ...formData,
      restTime: totalMinutes,
    };
    
    const validationErrors = validateExerciseForm(updatedFormData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onSubmit(updatedFormData);
  };

  const handleTemplateSelect = (template: Partial<ExerciseFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...template,
    }));
    
    // Update rest time inputs if template includes restTime
    if (template.restTime !== undefined) {
      const parsedRest = parseRestTime(template.restTime);
      setRestMinutes(parsedRest.minutes.toString());
      setRestSeconds(parsedRest.seconds.toString());
    }
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
                <div className="relative">
                  <select
                    id="intensityMetricType"
                    value={formData.intensityMetricType || 'none'}
                    onChange={(e) => updateFormData('intensityMetricType', e.target.value === 'none' ? '' : e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                  >
                    <option value="none">None</option>
                    <option value="rpe">RPE (Rate of Perceived Exertion)</option>
                    <option value="rir">RIR (Reps in Reserve)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
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
            <Label>Rest Time *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restMinutes" className="text-sm text-muted-foreground">Minutes</Label>
                <Input
                  id="restMinutes"
                  type="number"
                  min="0"
                  value={restMinutes}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                      setRestMinutes(value);
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restSeconds" className="text-sm text-muted-foreground">Seconds</Label>
                <Input
                  id="restSeconds"
                  type="number"
                  min="0"
                  max="59"
                  value={restSeconds}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setRestSeconds(value);
                    }
                  }}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter rest time between sets
            </p>
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
