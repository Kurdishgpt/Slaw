# Discord Bot Point Tracker Dashboard

## Overview

This is a full-stack web application that serves as an admin dashboard for a Discord bot that tracks user points based on link sharing activities. The bot monitors a specific Discord channel for paste links (e.g., pastebin.com, paste.ee) and server invites, awarding points to users who share them. The dashboard provides real-time statistics, user leaderboards, activity logs, and API key management for data export.

**Core Purpose**: Enable administrators to monitor bot performance, track user engagement through a point system, view activity history, and manage API access for programmatic data retrieval.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**:
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and API data fetching

**UI Component Strategy**:
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system
- Design follows Fluent Design principles with Discord-inspired aesthetics (per design_guidelines.md)
- Theme system supporting light/dark modes with CSS custom properties

**State Management Approach**:
- Server state: TanStack Query with automatic caching and background refetching
- Client state: React Context for theme management
- No global state library needed due to query-based architecture

**Routing Structure**:
- `/` - Dashboard (stats overview, recent activity, top users)
- `/leaderboard` - Full user rankings with points and cooldown status
- `/api-keys` - API key generation and management interface

### Backend Architecture

**Server Framework**:
- Express.js with TypeScript running on Node.js
- ESM modules throughout the codebase
- Custom middleware for request logging and JSON body parsing with raw body preservation

**API Design**:
- RESTful endpoints under `/api` prefix
- Endpoints:
  - `GET /api/stats` - Dashboard statistics (total users, activities, bot status)
  - `GET /api/users` - All users sorted by points
  - `GET /api/users/top` - Top N users for dashboard widget
  - `GET /api/activities/recent` - Recent point-earning activities
  - `GET /api/keys` - List all API keys
  - `POST /api/keys/generate` - Create new API key
  - `DELETE /api/keys/:id` - Revoke an API key

**Discord Bot Integration**:
- Discord.js v14 for bot functionality
- Bot monitors a single channel (configured via DISCORD_TARGET_CHANNEL_ID)
- Link detection using regex patterns for paste sites and server invites
- Cooldown system: 14-hour wait between point awards per user
- Maximum 10 points per qualifying link shared
- Bot runs in same process as web server (server/discord-bot.ts)

**Business Logic**:
- Point award conditions:
  - User must share a valid paste link or server invite
  - User must not be in cooldown period (14 hours since last award)
  - Points calculated based on link type
- Activity logging for audit trail
- User profile creation on first point award with Discord metadata (username, avatar)

### Data Storage

**Database Choice**: PostgreSQL via Neon serverless driver
- Rationale: Relational data with clear relationships between users, activities, and API keys
- Connection pooling handled by @neondatabase/serverless
- Database URL configured via DATABASE_URL environment variable

**ORM**: Drizzle ORM
- Schema-first approach with type safety
- Migration generation via drizzle-kit
- Schema location: shared/schema.ts for shared types between client/server

**Database Schema**:

1. **discord_users** table:
   - Primary key: Discord user ID (varchar)
   - Stores username, discriminator, avatar URL
   - Points total and lastPointEarned timestamp for cooldown tracking

2. **activities** table:
   - UUID primary key
   - Foreign key to user via userId
   - Records type ('paste' or 'server'), link URL, points earned, timestamp
   - Provides audit trail of all point-earning events

3. **api_keys** table:
   - UUID primary key
   - Unique API key string
   - Timestamps for creation and last usage tracking

**Data Access Pattern**:
- In-memory storage implementation (MemStorage class) for development/testing
- Interface-based design (IStorage) allows swapping storage backends
- All database operations return typed objects matching Drizzle schema

### External Dependencies

**Third-Party Services**:
- **Discord API**: Bot authentication and message monitoring via discord.js
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Fonts**: Inter (UI text) and JetBrains Mono (monospace) fonts

**Authentication**:
- Discord bot token authentication (DISCORD_BOT_TOKEN environment variable)
- No user authentication system - dashboard is admin-only access
- API keys for programmatic data access (self-service generation)

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `DISCORD_BOT_TOKEN` - Bot authentication token
- `DISCORD_TARGET_CHANNEL_ID` - Channel to monitor for links
- `NODE_ENV` - Environment mode (development/production)

**Build & Deployment**:
- Development: Vite dev server with HMR + Express server
- Production: Vite builds static assets, esbuild bundles server code
- Single deployable artifact in dist/ directory
- Designed for Replit deployment with Replit-specific plugins (@replit/vite-plugin-*)

**Key Design Decisions**:

1. **Monorepo Structure**: Client, server, and shared code in single repository with path aliases for clean imports
2. **Type Sharing**: Drizzle schema exports TypeScript types used by both frontend and backend via @shared imports
3. **Real-time Updates**: Polling via TanStack Query refetch intervals rather than WebSockets for simplicity
4. **Component Library**: shadcn/ui chosen for flexibility (components owned by project) vs. packaged library
5. **Bot Collocation**: Discord bot runs in same process as web server to simplify deployment and data access