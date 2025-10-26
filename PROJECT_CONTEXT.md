# LiftIQ Project Context

## Project Overview
**LiftIQ** is a modern workout split management application built with Next.js 16, React 19, TypeScript, and Shadcn UI. The application allows users to create, manage, and organize workout routines with detailed exercise tracking including sets, reps, RPE/RIR, and rest times. The app now includes complete workout session tracking, progress monitoring, and comprehensive workout management features.

## Current Project State
- **Status**: Complete workout management system with session tracking
- **Git Status**: Clean working tree, ready for commits
- **Last Updated**: December 2024 - Full workout session tracking and management system
- **Phase**: Production-ready with comprehensive workout tracking features

## Tech Stack & Dependencies

### Core Framework
- **Next.js**: 16.0.0 (with App Router and Turbopack)
- **React**: 19.2.0 (latest with modern hooks)
- **TypeScript**: ^5 (strict mode enabled)
- **Node.js**: ^20

### UI & Styling
- **Shadcn UI**: Component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom color scheme and dark mode
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Fonts**: Geist Sans & Geist Mono (Google Fonts)
- **Design System**: Custom color palette with CSS variables and light/dark theme support
- **Color Scheme**: Teal Blue primary, Warm Orange accent, Mint Green success
- **Responsive Design**: Mobile-first approach with proper spacing and padding
- **Dark Mode**: Complete theme switching with persistent user preference

### Development Tools
- **ESLint**: ^9 with Next.js configuration
- **TypeScript**: Strict mode enabled
- **Tailwind CSS**: ^3.x with PostCSS and Autoprefixer

## Project Structure
```
/Users/maxrutherford/Desktop/LiftIQ/
├── src/
│   ├── app/
│   │   ├── globals.css      # Tailwind CSS with design system variables and dark mode
│   │   ├── layout.tsx       # Root layout with Geist fonts and ThemeProvider
│   │   └── page.tsx         # Main workout split dashboard
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   │   ├── button.tsx   # Button component with variants
│   │   │   ├── card.tsx     # Card components
│   │   │   ├── input.tsx    # Input component
│   │   │   ├── label.tsx    # Label component
│   │   │   ├── textarea.tsx # Textarea component
│   │   │   └── select.tsx   # Select component with custom styling
│   │   ├── ExerciseCard.tsx         # Exercise display component
│   │   ├── ExerciseForm.tsx         # Exercise input form
│   │   ├── WorkoutDayCard.tsx       # Workout day management with rest day support
│   │   ├── WorkoutSplitCard.tsx     # Workout split display with session starting
│   │   ├── WorkoutSplitManager.tsx  # Split creation/editing with rest days
│   │   ├── WorkoutSplitDashboard.tsx # Main dashboard with session management
│   │   ├── WorkoutSessionManager.tsx # Live workout session tracking
│   │   ├── WorkoutSessionHistory.tsx # Historical workout sessions
│   │   ├── WorkoutSessionDetails.tsx # Detailed session view with analytics
│   │   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   │   └── ThemeProvider.tsx        # Theme context provider
│   └── lib/
│       ├── types.ts         # TypeScript type definitions (extended for sessions)
│       ├── utils.ts         # Utility functions (cn helper)
│       ├── workout-utils.ts # Workout-specific utilities (extended for sessions)
│       └── theme-context.tsx # Theme management context
├── public/                  # Static assets (Next.js defaults)
├── components.json         # Shadcn UI configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration with dark mode
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration (minimal)
├── eslint.config.mjs       # ESLint configuration
└── .gitignore             # Git ignore rules
```

## Current Implementation Details

### Layout (`src/app/layout.tsx`)
- Next.js layout with Geist fonts and ThemeProvider
- Metadata configured for "LiftIQ"
- Dark mode support with theme context
- Clean, minimal structure with theme switching

### Home Page (`src/app/page.tsx`)
- Main workout split dashboard interface
- Responsive padding and spacing for all screen sizes
- Clean layout with proper margins and padding
- Mobile-first responsive design

### Workout Split Dashboard (`src/components/WorkoutSplitDashboard.tsx`)
- Main application interface for managing workout splits
- Statistics overview with totals and averages
- Grid layout for displaying workout splits
- Local storage persistence for data
- Create, edit, delete functionality for splits
- Empty state with call-to-action
- **NEW**: Session management with navigation between views
- **NEW**: "Past Lifts" button for workout history
- **NEW**: Responsive subtitle (hidden on mobile)
- **NEW**: Floating theme toggle button

### Workout Split Management (`src/components/WorkoutSplitManager.tsx`)
- Create and edit workout splits
- Add multiple workout days to splits
- Real-time statistics and validation
- Form management with proper error handling
- Split details (name, description) configuration
- **NEW**: Rest day functionality with dedicated button
- **NEW**: Rest day creation and management

### Workout Session Management (`src/components/WorkoutSessionManager.tsx`)
- **NEW**: Live workout session tracking
- **NEW**: Set-by-set exercise logging with weight, reps, RPE, RIR
- **NEW**: Rest timer functionality with skip option
- **NEW**: Progress tracking with visual progress bar
- **NEW**: Target reps display from exercise configuration
- **NEW**: "Last Time" data showing previous workout performance
- **NEW**: Session completion with notes
- **NEW**: Exercise progress visualization with set completion status

### Workout Session History (`src/components/WorkoutSessionHistory.tsx`)
- **NEW**: Historical workout sessions display
- **NEW**: Filtering by split and sorting options
- **NEW**: Session duration and completion tracking
- **NEW**: Session deletion functionality
- **NEW**: Navigation to detailed session view
- **NEW**: Custom Shadcn Select components for better UX

### Workout Session Details (`src/components/WorkoutSessionDetails.tsx`)
- **NEW**: Detailed view of completed workout sessions
- **NEW**: Comprehensive statistics (total sets, duration, average RPE/RIR)
- **NEW**: Exercise-by-exercise breakdown with set details
- **NEW**: Conditional stats display (only shows RPE/RIR if data exists)
- **NEW**: Session notes display
- **NEW**: Navigation back to history

### Exercise Management (`src/components/ExerciseForm.tsx` & `src/components/ExerciseCard.tsx`)
- Comprehensive exercise input form with validation
- Simplified UI: single values for sets, RPE, rest time
- Rep ranges as min/max pairs
- Rest time in minutes with decimal support
- Quick exercise templates for common exercises
- Visual exercise cards with all details
- Edit/delete functionality for individual exercises

### Workout Day Management (`src/components/WorkoutDayCard.tsx`)
- Manage exercises within each workout day
- Add, edit, delete exercises
- Inline editing capabilities
- Visual organization of exercises per day
- **NEW**: Rest day support with special styling
- **NEW**: Rest day content (no exercise management)
- **NEW**: Recovery-focused messaging for rest days

### Workout Split Cards (`src/components/WorkoutSplitCard.tsx`)
- Display workout splits with statistics
- Edit and delete functionality
- **NEW**: Individual "Start" buttons for each workout day
- **NEW**: Rest day prevention (no start button for rest days)
- **NEW**: Visual distinction for rest days
- **NEW**: Exercise count display (hidden for rest days)

### Theme System (`src/lib/theme-context.tsx` & `src/components/ThemeToggle.tsx`)
- **NEW**: Complete dark/light mode implementation
- **NEW**: Persistent theme preference in localStorage
- **NEW**: Floating action button for theme toggle
- **NEW**: Smooth theme transitions
- **NEW**: Theme-aware color system

### Styling (`src/app/globals.css`)
- Tailwind CSS with custom design system
- Custom color palette implemented with CSS variables
- **NEW**: Complete light/dark theme support with adapted colors
- HSL color values for better color manipulation
- Responsive design with Tailwind breakpoints
- Modern component-based styling approach
- **NEW**: Dark mode color variables and transitions

### Color Scheme (`src/app/globals.css` & `tailwind.config.js`)
- **Primary**: Teal Blue (`#0E5E6F`) - Main brand color
- **Accent**: Warm Orange (`#FF7E3B`) - Call-to-action elements
- **Success**: Mint Green (`#59D19C`) - Success states and confirmations
- **Background**: Off-White Gray (`#F7F9FA`) - Page background
- **Surface**: White (`#FFFFFF`) - Card and component backgrounds
- **Text Primary**: Charcoal (`#1A2630`) - Main text color
- **Text Secondary**: Slate Gray (`#5B6B72`) - Secondary text
- **Shadow**: `rgba(0,0,0,0.08)` - Subtle shadows and borders
- **NEW**: Complete dark mode color palette with proper contrast

### Configuration
- **TypeScript**: Strict mode, path aliases (`@/*` → `./src/*`)
- **Next.js**: Minimal configuration, ready for customization
- **ESLint**: Next.js recommended rules with TypeScript support
- **NEW**: Shadcn UI configuration with components.json
- **NEW**: Dark mode configuration in Tailwind

## Key Observations

### What's Working
✅ Next.js 16 with App Router and Turbopack setup
✅ React 19 with modern hooks and patterns
✅ TypeScript configuration with strict mode
✅ Shadcn UI with Radix primitives for accessibility
✅ Tailwind CSS with custom design system
✅ Custom color scheme with CSS variables
✅ Complete workout split management system
✅ Exercise creation and editing with comprehensive validation
✅ Local storage data persistence with error handling
✅ Responsive design with mobile-first approach
✅ ESLint configuration with Next.js rules
✅ Geist font integration (Sans & Mono)
✅ **NEW**: Complete light/dark theme support with persistent preferences
✅ **NEW**: Full workout session tracking and logging
✅ **NEW**: Live workout management with set-by-set tracking
✅ **NEW**: Rest timer functionality with visual countdown
✅ **NEW**: Historical workout session viewing and analysis
✅ **NEW**: Comprehensive workout statistics and analytics
✅ **NEW**: Target reps display for workout guidance
✅ **NEW**: "Last Time" data for performance comparison
✅ **NEW**: Rest day functionality in workout splits
✅ **NEW**: Session completion with notes and duration tracking
✅ **NEW**: Custom Select components for better UX
✅ **NEW**: Floating theme toggle for better accessibility
✅ **NEW**: Responsive UI improvements (mobile-friendly)
✅ **NEW**: Progress visualization with set completion status
✅ **NEW**: Conditional statistics display based on available data

### What's Missing/Incomplete
❌ **Database Integration** - Currently localStorage only (not persistent across devices)
❌ **Authentication System** - No user management or multi-user support
❌ **Testing Setup** - No unit tests, integration tests, or test coverage
❌ **Data Export/Import** - No backup, restore, or data migration functionality
❌ **Error Boundaries** - No graceful error handling for component failures
❌ **Loading States** - No loading indicators for async operations
❌ **API Integration** - No backend services or external API connections
❌ **Advanced Analytics** - No charts, graphs, or advanced progress tracking
❌ **Exercise Library** - Limited exercise database and templates
❌ **Workout Templates** - No pre-built workout routines or templates

### Potential Issues
⚠️ **Data Persistence** - Data only stored in localStorage (device-specific, can be lost)
⚠️ **No Error Recovery** - Limited error handling for data corruption or failures
⚠️ **No Data Validation** - No validation of localStorage data on load
⚠️ **Performance** - No bundle analysis or performance optimization yet
⚠️ **Session Data** - Large amounts of session data could impact localStorage limits

## Next Steps Recommendations

### Immediate (High Priority)
1. **Database Setup** - Move from localStorage to proper database (SQLite/PostgreSQL)
2. **Data Export/Import** - Add backup and restore functionality for data portability
3. **Error Handling** - Add error boundaries and loading states for better UX
4. **Advanced Analytics** - Add progress charts, statistics, and visualizations

### Short Term (Medium Priority)
1. **Exercise Library** - Expand exercise database with more templates and categories
2. **Testing Setup** - Add unit tests, integration tests, and test coverage
3. **Performance Optimization** - Bundle analysis, code splitting, and optimization
4. **Workout Templates** - Add pre-built workout routines and templates
5. **Data Validation** - Add validation of localStorage data on application load

### Long Term (Future Features)
1. **Authentication** - Implement user management for multi-user support
2. **Mobile App** - React Native version for mobile devices
3. **Social Features** - Share workouts and progress with others
4. **AI Recommendations** - Smart workout suggestions based on progress and goals
5. **API Integration** - Connect to fitness APIs and external services
6. **Advanced Analytics** - Machine learning insights and predictions
7. **Workout Scheduling** - Calendar integration and workout planning
8. **Nutrition Tracking** - Integration with nutrition and meal planning

## Development Commands
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint with Next.js configuration
```

## Code Quality Assessment

### Architecture Strengths
- **Modern React Patterns**: Uses React 19 with latest hooks and patterns
- **Type Safety**: Comprehensive TypeScript implementation with strict mode
- **Component Architecture**: Well-organized, reusable components with clear separation
- **Form Management**: Robust validation with real-time error messages
- **State Management**: Clean React hooks pattern with efficient re-renders
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Performance**: Optimized component structure and state updates
- **NEW**: **Session Management**: Complete workout session tracking with proper data flow
- **NEW**: **Theme System**: Robust dark/light mode implementation
- **NEW**: **Data Persistence**: Comprehensive localStorage management for all data types

### Technical Implementation
- **Data Flow**: Clear unidirectional data flow with proper prop drilling
- **Error Handling**: Form validation with comprehensive error messages
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Design System**: Consistent color scheme with CSS variables
- **Component Library**: Extensible Shadcn UI foundation
- **Code Organization**: Logical file structure with clear responsibilities
- **NEW**: **Session Tracking**: Real-time workout logging with progress visualization
- **NEW**: **Historical Data**: Complete workout history with filtering and analysis
- **NEW**: **Theme Management**: Persistent theme preferences with smooth transitions

### Areas for Improvement
- **Error Boundaries**: Need graceful error handling for component failures
- **Loading States**: Missing loading indicators for async operations
- **Data Validation**: No validation of localStorage data on application load
- **Testing**: No test coverage or testing infrastructure
- **Performance Monitoring**: No bundle analysis or performance metrics
- **Database Migration**: Need to move from localStorage to proper database

## Key Development Notes

### Foundation Strengths
- **Solid Architecture**: Well-structured Next.js 16 + React 19 foundation
- **Complete Core System**: Full workout split management functionality
- **Modern Tech Stack**: Latest versions with best practices
- **Design System**: Custom color scheme with CSS variables and theme support
- **Type Safety**: Comprehensive TypeScript implementation
- **Accessibility**: Built with Radix UI primitives for proper ARIA support
- **Responsive Design**: Mobile-first approach with excellent UX
- **NEW**: **Complete Workout Tracking**: Full session management and historical analysis
- **NEW**: **Theme System**: Production-ready dark/light mode implementation
- **NEW**: **User Experience**: Polished UI with floating controls and responsive design

### Ready for Next Phase
- **Database Migration**: Data structures ready for database integration
- **Advanced Analytics**: Session data ready for charts and progress tracking
- **Component Extensibility**: Shadcn UI foundation supports easy feature additions
- **State Management**: React hooks pattern scales well for complex features
- **NEW**: **Production Deployment**: Complete feature set ready for production use
- **NEW**: **Data Export**: Session data structured for easy export/import functionality

### Development Guidelines
- Follow existing component patterns for consistency
- Use TypeScript strict mode for all new code
- Maintain accessibility standards with Radix UI components
- Keep responsive design principles for all new features
- Use existing utility functions and extend as needed
- Follow the established color scheme and design tokens
- **NEW**: Maintain theme consistency across all components
- **NEW**: Use session data structures for any new tracking features
- **NEW**: Follow the established navigation patterns for new views

## Recent Feature Additions (December 2024)

### Workout Session Tracking System
- **Live Workout Management**: Complete set-by-set tracking during workouts
- **Rest Timer**: Visual countdown timer with skip functionality
- **Progress Visualization**: Real-time progress bar and set completion status
- **Target Reps Display**: Shows exercise target ranges during workouts
- **"Last Time" Data**: Displays previous workout performance for guidance
- **Session Completion**: Notes, duration tracking, and completion workflow

### Historical Data & Analytics
- **Workout History**: Complete historical session viewing and management
- **Session Details**: Comprehensive session analysis with statistics
- **Filtering & Sorting**: Advanced filtering by split and sorting options
- **Conditional Statistics**: Smart display of RPE/RIR data when available
- **Session Management**: Delete, view, and analyze completed workouts

### UI/UX Improvements
- **Dark Mode**: Complete theme system with persistent preferences
- **Floating Theme Toggle**: Accessible theme switching button
- **Custom Select Components**: Better UX with Shadcn Select components
- **Responsive Design**: Mobile-friendly improvements and layout adjustments
- **Navigation Simplification**: Cleaner back buttons and navigation flow

### Rest Day Functionality
- **Rest Day Creation**: Easy rest day addition to workout splits
- **Visual Distinction**: Special styling and messaging for rest days
- **Start Prevention**: Rest days cannot be started as workout sessions
- **Recovery Focus**: Encouraging messaging about rest and recovery

### Data Management
- **Extended Type System**: Comprehensive types for sessions, logs, and progress
- **Session Utilities**: Complete utility functions for session management
- **Data Persistence**: Robust localStorage management for all data types
- **Error Handling**: Improved error handling and data validation

---
*This context file should be updated as the project evolves and new features are added.*