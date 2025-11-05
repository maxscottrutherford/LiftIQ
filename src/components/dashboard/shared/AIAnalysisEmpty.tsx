import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface AIAnalysisEmptyProps {
  className?: string;
}

export function AIAnalysisEmpty({ className }: AIAnalysisEmptyProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Workout Insights
        </CardTitle>
        <CardDescription>
          Complete at least 3 workout sessions to receive AI-powered insights and recommendations.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

