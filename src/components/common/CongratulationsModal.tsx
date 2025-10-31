'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { celebrateWorkoutComplete } from '@/lib/confetti';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CongratulationsModal({ isOpen, onClose }: CongratulationsModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti when modal opens
      celebrateWorkoutComplete();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-md border-2 border-primary/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Congratulations!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-lg text-muted-foreground">
            Amazing work! You&apos;ve completed your workout.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Keep up the great progress and stay consistent!
          </p>
          <Button
            onClick={onClose}
            className="w-full"
            size="lg"
          >
            Awesome!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

