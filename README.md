# LiftIQ

A modern workout split management application built with Next.js, React, TypeScript, and Shadcn UI. Create, organize, and manage your workout routines with detailed exercise tracking.

## Features

- 🏋️‍♂️ **Workout Split Management** - Create and organize multiple workout routines
- 📝 **Exercise Tracking** - Detailed exercise logging with sets, reps, RPE, and rest times
- 🎨 **Custom Color Scheme** - Beautiful teal blue, warm orange, and mint green palette
- 📱 **Responsive Design** - Mobile-first approach with proper spacing
- ⚡ **Next.js 16** with App Router and Turbopack
- 🔷 **TypeScript** for complete type safety
- 🎯 **Shadcn UI** with Radix primitives for accessible components
- 💾 **Local Storage** - Data persistence across sessions
- 🚀 **Exercise Templates** - Quick setup for common exercises
- ✅ **Form Validation** - Real-time input validation

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/maxscottrutherford/LiftIQ.git
cd LiftIQ
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Creating Workout Splits

1. **Create a Split**: Click "Create Split" to start a new workout routine
2. **Add Days**: Add workout days (e.g., "Push Day", "Pull Day", "Leg Day")
3. **Add Exercises**: For each day, add exercises with:
   - Exercise name
   - Warmup sets (optional)
   - Working sets
   - Rep range (min-max)
   - RPE (Rate of Perceived Exertion 1-10)
   - Rest time in minutes
   - Optional notes

### Managing Your Workouts

- **View Splits**: See all your workout splits in a grid layout
- **Edit Splits**: Modify existing splits and exercises
- **Delete Splits**: Remove splits you no longer need
- **Statistics**: View totals and averages for your routines

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind CSS with custom color scheme
│   ├── layout.tsx       # Root layout with Geist fonts
│   └── page.tsx         # Main workout split dashboard
├── components/
│   ├── ui/              # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── ExerciseCard.tsx         # Exercise display component
│   ├── ExerciseForm.tsx         # Exercise input form
│   ├── WorkoutDayCard.tsx       # Workout day management
│   ├── WorkoutSplitCard.tsx     # Workout split display
│   ├── WorkoutSplitManager.tsx  # Split creation/editing
│   └── WorkoutSplitDashboard.tsx # Main dashboard
├── lib/
│   ├── types.ts         # TypeScript type definitions
│   ├── utils.ts         # Utility functions
│   └── workout-utils.ts # Workout-specific utilities
└── public/
    └── liftiq-logo.png  # Application logo
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Exercise Management
- **Simplified Input**: Single values for sets, RPE, and rest time
- **Rep Ranges**: Min/max rep ranges for flexibility
- **Quick Templates**: Pre-filled exercise templates for common movements
- **Real-time Validation**: Form validation with helpful error messages

### Workout Organization
- **Split Creation**: Create custom workout splits with multiple days
- **Day Management**: Add, edit, and remove workout days
- **Exercise Tracking**: Comprehensive exercise logging system
- **Statistics Dashboard**: Overview of splits, days, and exercises

### UI/UX Features
- **Custom Color Scheme**: Teal blue primary, warm orange accent, mint green success
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Accessible Components**: Built with Radix UI primitives
- **Smooth Animations**: Hover effects and transitions

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict mode
- **UI Library**: Shadcn UI with Radix primitives
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **State Management**: React hooks with localStorage
- **Linting**: ESLint with Next.js configuration

## Data Storage

Currently uses browser localStorage for data persistence. This means:
- ✅ Data persists between browser sessions
- ✅ No server required
- ❌ Data is device-specific (not synced across devices)
- ❌ Data can be lost if browser storage is cleared

## Future Roadmap

- [ ] Workout session tracking
- [ ] Exercise progress tracking over time
- [ ] Data export/import functionality
- [ ] Workout analytics and charts
- [ ] Exercise library expansion
- [ ] Database integration for multi-device sync
- [ ] Mobile app development

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

This project is for personal use.
