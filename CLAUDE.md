# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo that combines photo organization features with habit tracking capabilities. The app originally started as a photo organization tool ("照片整理大师") but has evolved to include a comprehensive habit tracking system.

## Development Commands

### Basic Development
- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator  
- `npm run web` - Start in web browser
- `npm run lint` - Run ESLint for code linting

### Claude Code Configuration
- Default command: `claude --dangerously-skip-permissions` (automatically skips permission confirmations)
- Default mode: Web mode for development

### Project Management
- `npm run reset-project` - Reset the project to initial state

## Architecture Overview

### Core Technologies
- **React Native (0.79.5)** - Cross-platform mobile development
- **Expo (~53.0.20)** - Development platform and toolchain
- **Expo Router (~5.1.4)** - File-based routing system
- **TypeScript** - Type safety
- **React Native Reanimated (~3.17.4)** - Advanced animations
- **React Native Gesture Handler (~2.24.0)** - Gesture handling
- **AsyncStorage** - Local data persistence

### Navigation Structure
The app uses a tab-based navigation with three main screens:
- **相册 (Photos)** - `app/(tabs)/index.tsx` - Photo organization features
- **习惯 (Habits)** - `app/(tabs)/habits.tsx` - Habit tracking system
- **我的 (Profile)** - `app/(tabs)/explore.tsx` - User profile and settings

Additional screens:
- **organize.tsx** - Photo organization interface
- **add-habit.tsx** - Create new habits

### Data Management
- **HabitsService** (`services/HabitsService.ts`) - Core service for habit data management
- **MediaLibraryService** (`services/MediaLibraryService.ts`) - Photo library integration
- Uses AsyncStorage for local persistence
- Implements comprehensive habit tracking with check-ins and statistics

### Key Components
- **HabitCalendar** (`components/HabitCalendar.tsx`) - Calendar view for habit tracking
- **StackedCards** (`components/StackedCards.tsx`) - Swipeable card interface for photo organization
- **ThemedText/ThemedView** - Theme-aware UI components
- **HapticTab** - Tab bar with haptic feedback

### State Management
- Uses React hooks (useState, useEffect) for local state
- Service layer for data operations
- No external state management library (Redux, Context API, etc.)

### Styling and Theming
- **Colors.ts** - Theme color definitions
- **useColorScheme** hook - Dark/light theme support
- StyleSheet for component styling
- Responsive design considerations

### File Organization
```
app/
├── (tabs)/           # Tab navigation screens
├── _layout.tsx       # Root layout with navigation
├── organize.tsx      # Photo organization
└── add-habit.tsx     # Habit creation

components/
├── HabitCalendar.tsx
├── StackedCards.tsx
├── ThemedText.tsx
├── ThemedView.tsx
└── ui/               # Reusable UI components

services/
├── HabitsService.ts  # Habit data management
└── MediaLibraryService.ts # Photo library operations

hooks/                # Custom React hooks
constants/            # App constants and colors
```

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use existing component patterns
- Maintain consistent naming conventions
- Implement proper error handling

### Data Patterns
- Use the service layer for all data operations
- Implement proper async/await patterns
- Handle loading states and error cases
- Use type interfaces for data structures

### UI/UX Considerations
- Support both light and dark themes
- Implement haptic feedback for interactions
- Use consistent spacing and typography
- Follow React Native best practices for performance

### Testing
- Currently no testing framework configured
- Manual testing through Expo development server
- Consider adding Jest/React Native Testing Library for unit tests

## Branch Strategy
- Main branch: `main`
- Current development branch: `app-习惯` (app-habits)
- Feature branches should be descriptive and prefixed with feature/