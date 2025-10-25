# LiftIQ Project Context

## Project Overview
**LiftIQ** is a modern workout split management application built with Next.js, React, TypeScript, and Shadcn UI. The application allows users to create, manage, and organize workout routines with detailed exercise tracking including sets, reps, RPE, and rest times.

## Current Project State
- **Status**: Core workout split functionality complete with custom UI
- **Git Status**: No commits yet, all files untracked
- **Last Updated**: Workout split application implementation phase

## Tech Stack & Dependencies

### Core Framework
- **Next.js**: 16.0.0 (with App Router)
- **React**: 19.2.0
- **TypeScript**: ^5
- **Node.js**: ^20

### UI & Styling
- **Shadcn UI**: Component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom color scheme
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Fonts**: Geist Sans & Geist Mono (Google Fonts)
- **Design System**: Custom color palette with CSS variables and light/dark theme support
- **Color Scheme**: Teal Blue primary, Warm Orange accent, Mint Green success
- **Responsive Design**: Mobile-first approach with proper spacing and padding

### Development Tools
- **ESLint**: ^9 with Next.js configuration
- **TypeScript**: Strict mode enabled
- **Tailwind CSS**: ^3.x with PostCSS and Autoprefixer

## Project Structure
```
/Users/maxrutherford/Desktop/LiftIQ/
├── src/
│   ├── app/
│   │   ├── globals.css      # Tailwind CSS with design system variables
│   │   ├── layout.tsx       # Root layout with Geist fonts
│   │   └── page.tsx         # Main workout split dashboard
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   │   ├── button.tsx   # Button component with variants
│   │   │   ├── card.tsx     # Card components
│   │   │   ├── input.tsx    # Input component
│   │   │   ├── label.tsx    # Label component
│   │   │   └── textarea.tsx # Textarea component
│   │   ├── ExerciseCard.tsx         # Exercise display component
│   │   ├── ExerciseForm.tsx         # Exercise input form
│   │   ├── WorkoutDayCard.tsx       # Workout day management
│   │   ├── WorkoutSplitCard.tsx     # Workout split display
│   │   ├── WorkoutSplitManager.tsx  # Split creation/editing
│   │   └── WorkoutSplitDashboard.tsx # Main dashboard
│   └── lib/
│       ├── types.ts         # TypeScript type definitions
│       ├── utils.ts         # Utility functions (cn helper)
│       └── workout-utils.ts # Workout-specific utilities
├── public/                  # Static assets (Next.js defaults)
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration (minimal)
├── eslint.config.mjs       # ESLint configuration
└── .gitignore             # Git ignore rules
```

## Current Implementation Details

### Layout (`src/app/layout.tsx`)
- Basic Next.js layout with Geist fonts
- Metadata configured for "LiftIQ"
- Clean, minimal structure

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

### Workout Split Management (`src/components/WorkoutSplitManager.tsx`)
- Create and edit workout splits
- Add multiple workout days to splits
- Real-time statistics and validation
- Form management with proper error handling
- Split details (name, description) configuration

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

### Styling (`src/app/globals.css`)
- Tailwind CSS with custom design system
- Custom color palette implemented with CSS variables
- Light/dark theme support with adapted colors
- HSL color values for better color manipulation
- Responsive design with Tailwind breakpoints
- Modern component-based styling approach

### Color Scheme (`src/app/globals.css` & `tailwind.config.js`)
- **Primary**: Teal Blue (`#0E5E6F`) - Main brand color
- **Accent**: Warm Orange (`#FF7E3B`) - Call-to-action elements
- **Success**: Mint Green (`#59D19C`) - Success states and confirmations
- **Background**: Off-White Gray (`#F7F9FA`) - Page background
- **Surface**: White (`#FFFFFF`) - Card and component backgrounds
- **Text Primary**: Charcoal (`#1A2630`) - Main text color
- **Text Secondary**: Slate Gray (`#5B6B72`) - Secondary text
- **Shadow**: `rgba(0,0,0,0.08)` - Subtle shadows and borders

### Configuration
- **TypeScript**: Strict mode, path aliases (`@/*` → `./src/*`)
- **Next.js**: Minimal configuration, ready for customization
- **ESLint**: Next.js recommended rules with TypeScript support

## Key Observations

### What's Working
✅ Next.js 16 with App Router setup
✅ TypeScript configuration with strict mode
✅ Shadcn UI with Radix primitives
✅ Tailwind CSS with custom design system
✅ Custom color scheme implementation
✅ Complete workout split management system
✅ Exercise creation and editing with validation
✅ Local storage data persistence
✅ Responsive design with proper spacing
✅ ESLint configuration
✅ Modern font integration
✅ Light/dark theme support
✅ Simplified UI with single-value inputs
✅ Exercise templates for quick setup
✅ Real-time form validation
✅ Mobile-first responsive design

### What's Missing/Incomplete
❌ No actual workout session tracking
❌ No exercise logging during workouts
❌ No progress tracking and analytics
❌ No database or API integration
❌ No authentication system
❌ No testing setup
❌ No data export/import functionality

### Potential Issues
⚠️ No git history (project not committed)
⚠️ Data only stored in localStorage (not persistent across devices)
⚠️ No workout session management yet

## Next Steps Recommendations

### Immediate
1. **Initial Git Commit** - Commit current workout split functionality
2. **Workout Session Tracking** - Implement actual workout logging
3. **Exercise Progress Tracking** - Add weight/reps tracking over time
4. **Data Export/Import** - Add backup and restore functionality

### Short Term
1. **Workout Analytics** - Add progress charts and statistics
2. **Exercise Library** - Expand exercise database with more templates
3. **Workout Templates** - Pre-built popular workout splits
4. **Database Setup** - Move from localStorage to proper database
5. **Authentication** - Implement user management for multi-user support

### Long Term
1. **Mobile App** - React Native version for mobile devices
2. **Social Features** - Share workouts and progress with others
3. **AI Recommendations** - Smart workout suggestions based on progress
4. **Testing Setup** - Add unit and integration tests
5. **Deployment** - Configure production deployment
6. **Performance** - Optimize and monitor

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Notes for Future Development
- The project has a solid foundation with Shadcn UI and Tailwind CSS
- Complete workout split management system is fully functional
- Custom color scheme is fully implemented and ready for use
- Design system uses semantic color roles for consistency
- Component library is extensible and follows best practices
- Color palette provides excellent contrast and accessibility
- Simplified UI makes data entry fast and intuitive
- Local storage provides client-side data persistence
- TypeScript ensures type safety throughout the application
- Responsive design works well on all screen sizes
- Exercise templates speed up workout creation
- Form validation prevents data entry errors
- Component architecture supports easy feature additions
- Ready for workout session tracking implementation
- Easy to add more Shadcn UI components with consistent styling
- Color scheme supports both light and dark themes

---
*This context file should be updated as the project evolves and new features are added.*
