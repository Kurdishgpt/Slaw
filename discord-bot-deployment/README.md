# Discord Point Tracker Bot - Deployment Package

This package contains the standalone Discord bot for tracking user points from paste links, server invites, and voice channel activity.

## Features

- ✅ **Paste Link Points**: Award 1 point for posting paste links (Pastebin, Paste.ee, etc.)
- ✅ **Server Invite Points**: Award 1 point for posting Discord server invites
- ✅ **Voice Channel Points**: Award 1 point per hour spent in voice channels
- ✅ **Cooldown System**: 14-hour cooldown between earning points from links
- ✅ **Daily Limits**: Maximum 10 links per day
- ✅ **Max Points**: 999 points maximum per user
- ✅ **Message Deletion**: Automatically removes points if message is deleted

## Requirements

- Node.js 18.0.0 or higher
- PostgreSQL database (Neon recommended for free hosting)
- Discord Bot Token
- Discord Channel ID (for link tracking)

**Note:** This bot uses HTTP-based database connections (not WebSocket), making it compatible with all serverless and free hosting platforms.

## Free Hosting Platforms

This bot can be deployed to these **free 24/7 hosting platforms**:

### Recommended: Wispbyte (No Renewals)
- Website: https://wispbyte.com/free-discord-bot-hosting
- Features: True 24/7 hosting, 1 GB storage, no renewals needed
- Best for: Set-it-and-forget-it hosting

### Alternative: Bot-Hosting.net (No Renewals)
- Website: https://bot-hosting.net
- Features: 24/7 uptime, easy setup, 125K+ users
- Best for: Beginners

### Alternative: HidenCloud (Weekly Renewal)
- Website: https://www.hidencloud.com/free-discord-hosting
- Features: 3 GB RAM, 15 GB storage (best resources)
- Renewal: Weekly (just click a button in dashboard)

## Setup Instructions

### 1. Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to "Bot" section
4. Click "Reset Token" or "Copy" to get your token
5. **Enable these intents:**
   - Message Content Intent
   - Server Members Intent
   - Presence Intent

### 2. Get Your Channel ID

1. In Discord, go to Settings → Advanced → Enable "Developer Mode"
2. Right-click the text channel where users will post links
3. Click "Copy Channel ID"

### 3. Get Your Database URL

**If using Neon (Recommended Free Option):**
1. Go to [Neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string (starts with `postgresql://`)

**Your connection string should look like:**
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/database
```

### 4. Deploy to Wispbyte

1. Sign up at [wispbyte.com](https://wispbyte.com/free-discord-bot-hosting)
2. Create a new server
3. Choose "Node.js" as the server type
4. Upload all files from this folder
5. Set environment variables:
   - `DISCORD_BOT_TOKEN`: Your bot token
   - `DISCORD_TARGET_CHANNEL_ID`: Your channel ID
   - `DATABASE_URL`: Your Neon database connection string
6. Set startup command: `npm start`
7. Click "Start Server"

### 5. Deploy to Bot-Hosting.net

1. Sign up at [bot-hosting.net](https://bot-hosting.net)
2. Create a new bot
3. Upload all files from this folder
4. Configure environment variables in the panel
5. Start the bot

### 6. Deploy to HidenCloud

1. Sign up at [hidencloud.com](https://www.hidencloud.com/free-discord-hosting)
2. Create a new server (Node.js)
3. Upload files via SFTP or panel
4. Set environment variables in panel
5. Start server
6. Remember to renew weekly (free button in dashboard)

## Environment Variables

Create a `.env` file or set these in your hosting panel:

```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_TARGET_CHANNEL_ID=your_channel_id_here
DATABASE_URL=postgresql://user:password@host/database
```

## Commands

### Slash Commands

- `/login <apikey>` - Link Discord account with website API key

### How Users Earn Points

1. **Paste Links** (1 point each):
   - Post a paste link in the designated channel
   - Supported: Pastebin, Paste.ee, Hastebin, Ghostbin, etc.
   - 14-hour cooldown between points
   - Max 10 links per day

2. **Server Invites** (1 point each):
   - Post a Discord server invite link
   - Same cooldown and daily limits as paste links

3. **Voice Channels** (1 point per hour):
   - Join any voice channel
   - Automatically earn points every hour
   - No cooldown, no daily limits

## Testing

After deployment, test your bot:

1. Invite bot to your Discord server (get invite URL from Developer Portal)
2. Post a paste link in the designated channel
3. Join a voice channel and wait 5 minutes (checker runs every 5 min)
4. Check your points on the website dashboard

## Troubleshooting

### Bot Not Responding
- Check that bot token is correct
- Verify bot has "Message Content Intent" enabled
- Check channel ID is correct
- Ensure bot has permissions in the channel

### Database Errors
- Verify DATABASE_URL is correct
- Check Neon database is active (not suspended)
- Ensure database tables exist (they'll be created automatically)

### Voice Points Not Working
- Bot needs "View Channels" and "Connect" permissions
- Voice checker runs every 5 minutes
- Points awarded after 1 hour in voice

## Support

- Check your hosting platform's Discord server for support
- Verify all environment variables are set correctly
- Check bot logs for error messages

## Files Included

- `index.js` - Main bot logic
- `database.js` - Database connection and storage functions
- `schema.js` - Database schema definitions
- `package.json` - Dependencies and scripts
- `.env.example` - Example environment variables
- `README.md` - This file

## License

This bot is part of the Discord Point Tracker system. Use it freely for your Discord server!
