"use client";

import { celebrate } from "@/lib/confetti";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

interface PersonalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
  weight?: number;
}

export function PersonalRecordModal({
  isOpen,
  onClose,
  exerciseName,
  weight,
}: PersonalRecordModalProps) {
  useEffect(() => {
    if (isOpen) {
      celebrate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasDetails = exerciseName && weight != null && weight > 0;

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
          <CardTitle className="text-3xl font-bold">New Personal Record!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasDetails ? (
            <p className="text-center text-lg text-muted-foreground">
              You hit{" "}
              <span className="font-semibold text-foreground">{weight} lbs</span> on{" "}
              <span className="font-semibold text-foreground">{exerciseName}</span>
              — your heaviest working set yet.
            </p>
          ) : (
            <p className="text-center text-lg text-muted-foreground">
              You just set a new personal record. Keep pushing!
            </p>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Keep doing what you&apos;re doing and you&apos;ll keep setting new records!
          </p>
          <Button onClick={onClose} className="w-full" size="lg">
            Awesome!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
