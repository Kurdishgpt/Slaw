# Discord Bot Integration Setup

This guide explains how to integrate the Discord bot with the Netlify-hosted dashboard.

## Overview

The dashboard now runs as a static site on Netlify with serverless functions for the API. The Discord bot needs to run separately (on a server, VPS, or service like Railway/Heroku) and communicate with the Netlify functions via webhook.

## Architecture

```
Discord Bot (External) → Webhook → Netlify Functions → Database
                                          ↓
                                   Dashboard (React)
```

## Setup Instructions

### 1. Configure Environment Variables in Netlify

Add these environment variables in your Netlify site settings:

- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `DISCORD_WEBHOOK_SECRET` - A secure random string for webhook authentication
- `DISCORD_BOT_TOKEN` - Your Discord bot token (optional, for status display)

### 2. Deploy to Netlify

The site will automatically deploy with the serverless functions in `netlify/functions/`.

### 3. Run Discord Bot Separately

You need to host the Discord bot separately. The bot code is in `server/discord-bot.ts`.

**Option A: Modify the existing bot to use webhooks**

Update `server/discord-bot.ts` to send webhook requests to your Netlify functions:

```typescript
// After awarding points, send webhook
await fetch('https://your-site.netlify.app/api/discord/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DISCORD_WEBHOOK_SECRET}`
  },
  body: JSON.stringify({
    type: 'message',
    userId: message.author.id,
    username: message.author.username,
    points: newPoints,
    linkType: 'paste',
    link: extractedLink,
    messageId: message.id
  })
});
```

**Option B: Use a service like Railway or Heroku**

1. Create a new project on Railway/Heroku
2. Deploy the bot code from `server/`
3. Set environment variables:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_TARGET_CHANNEL_ID`
   - `DATABASE_URL` (same as Netlify)
   - `NETLIFY_WEBHOOK_URL` (your Netlify function URL)
   - `DISCORD_WEBHOOK_SECRET` (same as Netlify)

## Available Endpoints

### API Endpoints (for frontend)
- `GET /api/stats` - Dashboard statistics
- `GET /api/users` - All users sorted by points
- `GET /api/users/top` - Top 5 users
- `GET /api/keys` - List all API keys
- `POST /api/keys/generate` - Generate new API key
- `DELETE /api/keys/:id` - Delete API key
- `GET /api/activities/recent` - Recent activities
- `GET /api/discord/status` - Discord bot status

### Webhook Endpoint (for bot)
- `POST /api/discord/webhook` - Receive Discord bot events

**Webhook Payload Examples:**

```typescript
// User posted a link
{
  type: "message",
  userId: "123456789",
  username: "User#1234",
  points: 10,
  linkType: "paste",
  link: "pastebin.com/abc123",
  messageId: "987654321"
}

// User joined voice
{
  type: "voice_join",
  userId: "123456789",
  username: "User#1234",
  channelName: "General Voice"
}

// User left voice
{
  type: "voice_leave",
  userId: "123456789",
  username: "User#1234"
}

// User linked API key
{
  type: "login",
  userId: "123456789",
  username: "User#1234",
  apiKey: "abc123..."
}
```

## Security

- All webhook requests must include the `Authorization: Bearer <DISCORD_WEBHOOK_SECRET>` header
- Store the webhook secret securely in environment variables
- Never commit secrets to the repository

## Testing

1. Deploy to Netlify
2. Test API endpoints: `curl https://your-site.netlify.app/api/stats`
3. Test webhook: 
```bash
curl -X POST https://your-site.netlify.app/api/discord/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"type":"voice_join","userId":"123","username":"test"}'
```

## Troubleshooting

- **API returns empty data**: Check DATABASE_URL environment variable
- **Webhook returns 401**: Verify DISCORD_WEBHOOK_SECRET matches in both bot and Netlify
- **Bot offline status**: The bot must run separately and update the database

## Notes

- The dashboard will show "Bot Status: Offline" until you deploy the bot separately
- API keys work independently of the bot status
- The database is shared between the bot and the dashboard
