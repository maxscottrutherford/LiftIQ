import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { WorkoutSplit } from '@/lib/types';

interface ActiveWorkoutNoticeProps {
  activeSession: {
    splitId: string;
    dayId: string;
    startedAt: Date;
  };
  splits: WorkoutSplit[];
  onResume: () => void;
  onCancel: () => void;
}

export function ActiveWorkoutNotice({
  activeSession,
  splits,
  onResume,
  onCancel,
}: ActiveWorkoutNoticeProps) {
  const split = splits.find(s => s.id === activeSession.splitId);
  const day = split?.days.find(d => d.id === activeSession.dayId);

  if (!split || !day) return null;

  return (
    <Card className="border-accent bg-accent/5">
      <CardContent className="pt-6 space-y-4">
        {/* Top: Play icon and workout day name */}
        <div className="flex items-center justify-center space-x-4">
          <div className="p-2 rounded-full bg-accent">
            <Play className="h-6 w-6 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{day.name}</h3>
        </div>
        
        {/* Middle: Split name and date/time */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{split.name}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Started {new Date(activeSession.startedAt).toLocaleString()}
          </p>
        </div>
        
        {/* Bottom: Cancel and Resume buttons */}
        <div className="flex justify-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onResume} className="bg-accent hover:bg-accent/90">
            <Play className="h-4 w-4 mr-2" />
            Resume Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

