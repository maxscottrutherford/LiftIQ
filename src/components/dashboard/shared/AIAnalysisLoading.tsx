import { Card, CardContent } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface AIAnalysisLoadingProps {
  className?: string;
}

export function AIAnalysisLoading({ className }: AIAnalysisLoadingProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Brain className="h-6 w-6 animate-pulse text-primary" />
          <p className="text-muted-foreground">Analyzing workouts...</p>
        </div>
      </CardContent>
    </Card>
  );
}

