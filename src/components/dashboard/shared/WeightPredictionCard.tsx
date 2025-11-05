import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WeightProgressionPrediction } from '@/lib/ai-analysis/ml-predictions';
import { getConfidenceBadgeClass } from '@/lib/ai-analysis/utils';

interface WeightPredictionCardProps {
  exerciseId: string;
  prediction: WeightProgressionPrediction;
}

export function WeightPredictionCard({ exerciseId, prediction }: WeightPredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progression
        </CardTitle>
        <CardDescription>
          Suggested weights for your next workout based on your training trends
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-3">
          <div className="p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceBadgeClass(prediction.confidence)}`}>
                    {Math.round(prediction.confidence * 100)}% confidence
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                    <p className="text-base sm:text-lg font-bold text-muted-foreground">
                      {prediction.currentWeight} lbs
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Suggested Next Weight</p>
                    <p className="text-base sm:text-lg font-bold text-primary">
                      {prediction.predictedNextWeight} lbs
                    </p>
                    {prediction.weightIncrease > 0 && (
                      <p className="text-xs text-success mt-1">
                        +{prediction.weightIncrease} lbs increase
                      </p>
                    )}
                    {prediction.weightIncrease < 0 && (
                      <p className="text-xs text-destructive mt-1">
                        {prediction.weightIncrease} lbs (deload suggested)
                      </p>
                    )}
                    {prediction.weightIncrease === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Maintain current weight
                      </p>
                    )}
                  </div>
                </div>

                {prediction.weightIncrease > 0 && (
                  <div className="p-2 sm:p-3 bg-success/10 rounded-md mb-2">
                    <p className="text-xs font-medium text-success mb-1">
                      Ready to Progress!
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {prediction.reasoning}
                    </p>
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-1">Prediction Details:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {prediction.reasoning}
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation"
                onClick={toggleExpanded}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

