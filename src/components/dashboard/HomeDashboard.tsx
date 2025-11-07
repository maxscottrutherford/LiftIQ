'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CongratulationsModal } from '@/components/common/CongratulationsModal';
import { NavigationCard } from './shared/NavigationCard';
import { useAuth } from '@/lib/auth-context';
import { useWorkoutCompletion } from '@/hooks/useWorkoutCompletion';
import { Dumbbell, Calendar, BarChart3, History, LogOut, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavigationItem {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  iconBgColor: string;
  iconColor?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    icon: Dumbbell,
    title: 'Log a Workout',
    description: 'Record your workout as you go',
    route: '/dashboard?view=freestyle',
    iconBgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Calendar,
    title: 'Workout Splits',
    description: 'Create and manage your workout programs',
    route: '/dashboard?view=splits',
    iconBgColor: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    icon: Sparkles,
    title: 'AI Workout Planner',
    description: 'Get personalized workout plans',
    route: '/dashboard/ai-planner',
    iconBgColor: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    icon: History,
    title: 'Past Lifts',
    description: 'View your workout history',
    route: '/dashboard?view=history',
    iconBgColor: 'bg-secondary/10',
    iconColor: 'text-foreground dark:text-white',
  },
  {
    icon: BarChart3,
    title: 'Statistics',
    description: 'Analyze your progress and gains',
    route: '/dashboard?view=statistics',
    iconBgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
];

export function HomeDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showCongratulations, setShowCongratulations } = useWorkoutCompletion();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleNavigationClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center space-x-2">
            <span>LiftIQ</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and optimize your training
          </p>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {NAVIGATION_ITEMS.map((item) => (
          <NavigationCard
            key={item.route}
            icon={item.icon}
            title={item.title}
            description={item.description}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
            onClick={() => handleNavigationClick(item.route)}
          />
        ))}
      </div>

      <ThemeToggle />
      
      {/* Sign Out Button */}
      <div className="flex justify-center pt-8 pb-4">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
      
      {/* Congratulations Modal */}
      <CongratulationsModal
        isOpen={showCongratulations}
        onClose={() => setShowCongratulations(false)}
      />
    </div>
  );
}

