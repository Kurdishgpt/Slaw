# ⚡ Quick Start Guide - 5 Minutes to Deploy

The absolute fastest way to get your Discord bot + website running 24/7 for FREE.

## 🎯 Prerequisites (2 minutes)

1. **Discord Bot Token**
   - Go to https://discord.com/developers/applications
   - Create app → Bot → Copy token

2. **Channel ID**
   - Discord Settings → Advanced → Enable Developer Mode
   - Right-click channel → Copy ID

3. **Database URL**
   - Go to https://neon.tech
   - Sign up → Create project → Copy connection string

## 🚀 Deploy Bot (1.5 minutes)

1. Go to https://wispbyte.com/free-discord-bot-hosting
2. Create account → New server (Node.js)
3. Upload files from `discord-bot-deployment/` folder
4. Set environment variables:
   - `DISCORD_BOT_TOKEN` = your token
   - `DISCORD_TARGET_CHANNEL_ID` = your channel ID
   - `DATABASE_URL` = your Neon URL
5. Startup command: `npm start`
6. Click Start!

**✅ Bot is online!**

## 🌐 Deploy Website (1.5 minutes)

1. In this Replit, run: `npm run build`
2. Go to https://app.netlify.com
3. Drag `website-deployment/` folder to deploy
4. After deploy: Site Settings → Environment Variables
5. Add: `DATABASE_URL` = your Neon URL
6. Redeploy

**✅ Website is live!**

## 🎉 Test (30 seconds)

1. **Invite bot** to your Discord server
2. **Post a paste link** in the designated channel
3. **Visit your Netlify URL** - see your points!

**Done! Everything is running 24/7 for free!**

---

For detailed instructions, see [FREE-DEPLOYMENT-GUIDE.md](FREE-DEPLOYMENT-GUIDE.md)
