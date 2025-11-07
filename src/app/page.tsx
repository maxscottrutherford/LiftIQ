import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import Link from "next/link"
import { Dumbbell, TrendingUp, Calendar, Target } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen py-8 relative z-10" style={{ backgroundColor: 'transparent' }}>
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-6xl">

          {/* Main Heading */}
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              LiftIQ
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Elevate Your Training
            </p>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Track workouts, monitor progress, and reach your fitness goals with intelligent workout management.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 rounded-full bg-primary/10">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Workout Splits</h3>
              <p className="text-sm text-muted-foreground">
                Organize your training with customizable workout splits
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your growth with detailed analytics and charts
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 rounded-full bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Session Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Log sets, reps, and RPE in real-time
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Stay Focused</h3>
              <p className="text-sm text-muted-foreground">
                Built-in rest timers and workout guidance
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto min-w-[200px] text-lg"
            >
              <Link href="/signup">
                Get Started
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto min-w-[200px] text-lg"
            >
              <Link href="/signin">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-muted-foreground">
            Start tracking your fitness the right way
          </p>
        </div>
      </div>
    </main>
  );
}
