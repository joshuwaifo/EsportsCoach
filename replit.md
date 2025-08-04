# Live Esports Coach

## Overview

This is a React single-page application that demonstrates a Live Esports Coach proof-of-concept. The app allows users to sign up with their gaming profile, select a game category (MOBA, Fighting, or Sport), and receive real-time AI coaching through an overlay interface during gameplay. The system provides live analysis, post-game recaps, and personalized training recommendations using Google's Gemini AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with TypeScript and Vite for fast development and modern tooling
- **Component Structure**: Three main views - SignupPage, LiveCoachPage, and RecapPage with clean separation of concerns
- **State Management**: React Context API (GameContext) manages user profiles, game sessions, AI messages, and coaching history across components
- **UI Framework**: Shadcn/ui components with Tailwind CSS for consistent, accessible design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Express Server**: Minimal REST API setup with health check endpoints
- **Database Layer**: Drizzle ORM configured for PostgreSQL with schema definitions in shared directory
- **Storage**: In-memory storage implementation for demo purposes with interface for future database integration
- **Development**: Vite middleware integration for hot reloading and development workflow

### Data Models
- **User Profiles**: Comprehensive gaming profiles including rank, preferences, and coaching settings
- **Game Sessions**: Track live coaching sessions with timestamps, AI interactions, and performance metrics
- **Key Moments**: Store significant gameplay events for post-game analysis
- **Chat History**: Maintain conversation logs between users and AI coach

### AI Integration Architecture
- **Gemini Service**: Wrapper around Google's Generative AI for coaching responses
- **Live Coaching**: Real-time AI feedback during gameplay with context-aware responses
- **Post-Game Analysis**: Comprehensive performance analysis with strengths, improvements, and drill recommendations
- **Fallback System**: Simulated responses when API is unavailable for demo continuity

### Styling and Design
- **Gaming Theme**: Dark color scheme with accent colors optimized for gaming interfaces
- **Responsive Design**: Mobile-first approach with overlay positioning for different screen sizes
- **Typography**: Inter and Rajdhani fonts for modern, readable gaming aesthetic
- **Component Library**: Extensive UI component system with consistent variants and animations

## External Dependencies

### Core Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast build tool and development server
- **Express.js**: Lightweight Node.js web framework

### Database and ORM
- **Drizzle ORM**: Type-safe PostgreSQL ORM with schema-first approach
- **Neon Database**: Serverless PostgreSQL database service
- **Database Migrations**: Automated schema management and versioning

### AI Services
- **Google Generative AI (@google/genai)**: Gemini AI integration for coaching responses
- **Gemini 2.5 Flash**: Specific model for real-time coaching interactions

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library for consistent iconography

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Development Tools
- **Wouter**: Lightweight React router
- **TanStack Query**: Server state management and caching
- **ESBuild**: Fast JavaScript bundler for production builds

### Replit Integration
- **Replit Vite Plugins**: Development environment integration with error overlays and cartographer support for enhanced development experience