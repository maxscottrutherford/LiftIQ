"use client";

import { celebrate } from "@/lib/confetti";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

interface PersonalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalRecordModal({
  isOpen,
  onClose,
}: PersonalRecordModalProps) {
  useEffect(() => {
    if (isOpen) {
      celebrate();
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
          <CardTitle className="text-3xl font-bold">Great Job!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-lg text-muted-foreground">
            I see you working! You just got a new PR!
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Keepo doing what you're doing and you'll keep setting new records!
          </p>
          <Button onClick={onClose} className="w-full" size="lg">
            Awesome!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
