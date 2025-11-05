'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { WorkoutSplit } from '@/lib/types';
import { parseAIWorkoutPlan } from '@/lib/ai-coaching/workout-plan-parser';
import { generateWorkoutPlan } from '@/lib/ai-coaching/openai-service';
import { saveWorkoutSplit } from '@/lib/supabase/workout-service';
import { WorkoutPlanPreview } from './WorkoutPlanPreview';
import { AIWorkoutLoadingState } from './AIWorkoutLoadingState';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workoutPlan?: WorkoutSplit | null; // Parsed workout plan if this message contains one
}

interface WorkoutPlanningAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkoutPlanningAssistant({ isOpen, onClose }: WorkoutPlanningAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI workout planning assistant. Tell me about your fitness goals and I\'ll help you create a personalized workout plan.\n\nFor example:\n• "I want to build muscle in my legs, train 3x per week"\n• "Create a 4-day upper/lower split for strength"\n• "I have 45 minutes, 3 days a week, focus on full body"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState<string | null>(null); // Message ID being saved
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set()); // Message IDs that have been saved
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus textarea when modal opens and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Minimum loading duration to ensure animation completes (6 steps × ~2s + pauses = ~13s)
    const minLoadingDuration = 13000;
    const startTime = Date.now();

    try {
      // Call OpenAI API to generate workout plan
      const aiResponse = await generateWorkoutPlan({
        userInput: currentInput,
      });

      // Parse the workout plan from AI response
      const parsedPlan = parseAIWorkoutPlan(aiResponse);

      if (!parsedPlan) {
        throw new Error('Failed to parse workout plan from AI response');
      }

      // Create a user-friendly message
      const assistantContent = `I've created a personalized workout plan for you based on: "${currentInput}"\n\nReview the plan below and save it to your workout splits when you're ready!`;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        workoutPlan: parsedPlan,
      };

      // Wait for minimum duration before showing response
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      
      // Wait for minimum duration even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      // Show error message to user
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I apologize, but I encountered an error while generating your workout plan. ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async (messageId: string, plan: WorkoutSplit) => {
    setSavingPlan(messageId);
    try {
      const saved = await saveWorkoutSplit(plan);
      if (saved) {
        setSavedPlans(prev => new Set(prev).add(messageId));
        // Show success message
        const successMessage: Message = {
          id: `success-${Date.now()}`,
          role: 'assistant',
          content: `✅ Successfully saved "${plan.name}" to your workout splits! You can now find it in your Workout Splits section.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error('Failed to save workout split');
      }
    } catch (error) {
      console.error('Error saving workout plan:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Failed to save workout plan. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSavingPlan(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
      }}
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-3xl h-[80vh] flex flex-col border-2 border-primary/20 shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <CardHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Workout Planner</CardTitle>
                <CardDescription>
                  Describe your goals and I'll create a personalized plan
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages Container */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                {/* Message Bubble */}
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                {/* Workout Plan Preview - Show below message if plan exists */}
                {message.role === 'assistant' && message.workoutPlan && (
                  <div className="mt-3">
                    <WorkoutPlanPreview
                      plan={message.workoutPlan}
                      onSave={() => handleSavePlan(message.id, message.workoutPlan!)}
                      isSaving={savingPlan === message.id}
                      isSaved={savedPlans.has(message.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && <AIWorkoutLoadingState />}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t p-4 space-y-2">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your fitness goals, schedule, preferences..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}

