# Discord Bot Point Tracker

A complete Discord bot system with a beautiful web dashboard for tracking user points earned by posting paste links and server invites.

## Project Overview

This application consists of two main components:

1. **Discord Bot** - Monitors a target Discord channel and awards points to users who post paste links or server invites
2. **Web Dashboard** - Beautiful React-based interface to view statistics, leaderboards, and manage API keys for data export

## Features

### Discord Bot
- **Automatic Point Tracking**: Awards 1 point for each paste link or server invite posted
- **Cooldown System**: 14-hour cooldown between point awards per user
- **Point Limit**: Maximum of 10 points per user
- **Link Detection**: Supports multiple paste services (pastebin, paste.ee, hastebin, etc.) and Discord server invites
- **User Feedback**: Bot replies with confirmation messages showing point totals and remaining cooldown time

### Web Dashboard
- **Dashboard Page**: Real-time statistics showing total users, points, active users, and links posted
- **Leaderboard**: Full ranking of all users sorted by points with cooldown status indicators
- **API Keys Management**: Generate and manage API keys for exporting point data
- **Recent Activity Feed**: View the latest point-earning activities
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices

### API Export
Generate API keys to export user and point data:
- `GET /api/export/users` - Export all user data
- `GET /api/export/points` - Export point data for all users

## Setup Instructions

### Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Enable "Message Content Intent" under Privileged Gateway Intents
5. Copy the bot token
6. Go to OAuth2 > URL Generator, select:
   - Scopes: `bot`
   - Bot Permissions: `Read Messages/View Channels`, `Send Messages`, `Read Message History`
7. Use the generated URL to invite the bot to your server

### Get Channel ID
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel you want to monitor
3. Click "Copy Channel ID"

### Environment Variables
The following secrets are already configured:
- `DISCORD_BOT_TOKEN` - Your Discord bot token
- `DISCORD_TARGET_CHANNEL_ID` - The channel ID where the bot monitors for links

## How It Works

### Point System
- **1 Point**: Awarded for posting a valid paste link or server invite
- **Cooldown**: 14 hours between earning points
- **Maximum**: 10 points per user
- **Detection**: Automatically detects supported paste services and Discord invites

### Supported Paste Services
- pastebin.com
- paste.ee
- hastebin.com
- ghostbin.com
- dpaste.com
- paste.ubuntu.com
- controlc.com
- privnote.com
- jpst.it
- rentry.co

### Server Invites
- discord.gg/...
- discord.app.com/invite/...

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Dashboard, Leaderboard, API Keys pages
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Query client and utilities
├── server/                 # Express backend
│   ├── discord-bot.ts     # Discord bot implementation
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # In-memory data storage
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Data models for users, activities, API keys
└── design_guidelines.md   # Design system documentation
```

## Technology Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- shadcn/ui component library
- Tailwind CSS for styling

### Backend
- Express.js
- Discord.js v14
- In-memory storage (MemStorage)
- Zod for validation

## Usage

### For Server Admins
1. Invite the bot to your server using the OAuth2 URL
2. Configure the target channel ID
3. The bot will automatically start monitoring and awarding points

### For Server Members
1. Post a paste link or server invite in the monitored channel
2. Bot will reply with confirmation if points are awarded
3. View your ranking on the web dashboard

### For Developers
1. Access the web dashboard to view real-time statistics
2. Generate API keys to export data programmatically
3. Use the export endpoints for integrations

## API Endpoints

### Public Endpoints
- `GET /api/stats` - Dashboard statistics
- `GET /api/users` - All users (sorted by points)
- `GET /api/users/top` - Top 5 users
- `GET /api/activities/recent` - Recent 10 activities
- `GET /api/keys` - List all API keys

### Protected Endpoints (require API key)
- `GET /api/export/users` - Export all user data
- `GET /api/export/points` - Export points data

### Management Endpoints
- `POST /api/keys/generate` - Generate new API key
- `DELETE /api/keys/:id` - Revoke API key

## Development

The application runs on port 5000 and serves both the frontend and backend.

To start the application:
```bash
npm run dev
```

## Storage

Currently using in-memory storage (MemStorage) which resets on server restart. Data includes:
- Discord users with point totals
- Activity history
- API keys for data export

## Bot Status

The web dashboard shows real-time bot status:
- **Online**: Bot is connected to Discord and monitoring
- **Offline**: Bot is disconnected

Last sync time is also displayed to show the most recent bot activity.

## Design System

The application follows a modern design system with:
- Discord-inspired color scheme
- Consistent spacing and typography
- Beautiful loading and empty states
- Smooth animations and transitions
- Full dark mode support

See `design_guidelines.md` for complete design specifications.
