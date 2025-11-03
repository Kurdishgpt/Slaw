# 🚀 Free 24/7 Deployment Guide
## Discord Point Tracker - Complete Free Hosting Setup

This guide shows you how to deploy your **Discord bot** and **web dashboard** completely **FREE** with **24/7 uptime**.

---

## 📊 Architecture Overview

Your system has three main components that work together:

```
┌─────────────────────────────────────────────────────────────┐
│                     FREE 24/7 HOSTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🤖 Discord Bot          →  Wispbyte/Bot-Hosting.net        │
│     (Persistent 24/7)        (FREE, no renewals)            │
│                                                              │
│  🌐 Web Dashboard        →  Netlify                         │
│     (Static Frontend)        (FREE, unlimited)              │
│                                                              │
│  ⚡ API Endpoints        →  Netlify Functions               │
│     (Serverless)             (FREE, 125K requests/month)    │
│                                                              │
│  💾 Database            →  Neon PostgreSQL                  │
│     (Shared Storage)         (FREE, 0.5 GB)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### How They Connect:

1. **Discord Bot** → Tracks activity → Saves to **Database**
2. **Web Dashboard** → Reads from **Database** → Shows stats
3. **API Functions** → Query **Database** → Send data to website

All three share the same PostgreSQL database, so they stay synchronized automatically!

---

## 🎯 What You Need

Before starting, gather these:

- ✅ Discord Bot Token ([Get it here](#step-1-create-discord-bot))
- ✅ Discord Channel ID ([How to find](#step-2-get-channel-id))
- ✅ Database URL ([Create free database](#step-3-create-database))
- ✅ GitHub account (for Netlify deployment)

---

## 📋 Complete Deployment Steps

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Point Tracker")
4. Go to "Bot" section → Click "Add Bot"
5. Under "Privileged Gateway Intents", enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
   - ✅ Presence Intent
6. Click "Reset Token" → **Copy and save the token** (you'll need it later)

**⚠️ Important:** Never share your bot token publicly!

---

### Step 2: Get Channel ID

1. In Discord, go to Settings → Advanced
2. Enable "Developer Mode"
3. Right-click the channel where users will post links
4. Click "Copy Channel ID"
5. **Save this ID** (you'll need it later)

---

### Step 3: Create Database

We'll use **Neon** (free PostgreSQL hosting):

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Click "Create Project"
4. Name it (e.g., "discord-bot-db")
5. Choose a region close to you
6. Click "Create Project"
7. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/database
   ```

**💡 Tip:** The connection string is shown right after creating the project. You can also find it later in "Dashboard" → "Connection Details"

---

### Step 4: Deploy Discord Bot (Free 24/7)

#### Using Wispbyte (Recommended - No Renewals)

1. **Sign up** at [wispbyte.com/free-discord-bot-hosting](https://wispbyte.com/free-discord-bot-hosting)

2. **Create new server:**
   - Click "Create Server"
   - Choose "Node.js"
   - Name it (e.g., "point-tracker-bot")

3. **Upload bot files:**
   - Download the `discord-bot-deployment` folder from this project
   - Upload all files to your Wispbyte server

4. **Set environment variables** in the server settings:
   ```
   DISCORD_BOT_TOKEN=your_bot_token_from_step_1
   DISCORD_TARGET_CHANNEL_ID=your_channel_id_from_step_2
   DATABASE_URL=your_neon_connection_string_from_step_3
   ```

5. **Set startup command:**
   ```
   npm start
   ```

6. **Start the server!**

**✅ Your bot is now online 24/7!**

#### Alternative: Bot-Hosting.net (Also No Renewals)

1. Sign up at [bot-hosting.net](https://bot-hosting.net)
2. Create new bot
3. Upload files from `discord-bot-deployment`
4. Set environment variables (same as above)
5. Start bot

**✅ Done!**

---

### Step 5: Deploy Website (Free 24/7)

#### Option A: Quick Deploy (Drag & Drop)

1. **Build your website** (in this Replit project):
   ```bash
   npm run build
   ```

2. **Copy files to deployment folder:**
   ```bash
   cp -r dist website-deployment/
   cp -r client website-deployment/
   cp -r shared website-deployment/
   ```

3. **Deploy to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in (or create free account)
   - Drag the `website-deployment` folder onto the page
   - Wait for deployment to complete

4. **Set environment variable:**
   - Go to Site Settings → Environment Variables
   - Add: `DATABASE_URL` = your Neon connection string

5. **Redeploy** to apply environment variable:
   - Go to Deploys → Trigger deploy

**✅ Your website is live!**

#### Option B: Git-Based Deploy (Recommended)

This allows automatic updates when you push changes.

1. **Create GitHub repository:**
   ```bash
   cd website-deployment
   git init
   git add .
   git commit -m "Initial website deployment"
   ```

2. **Push to GitHub:**
   - Create new repository on GitHub
   - Follow instructions to push your code

3. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: `netlify/functions`

4. **Set environment variable:**
   - DATABASE_URL = your Neon connection string

5. **Deploy!**

**✅ Your website is live and will auto-update when you push to GitHub!**

---

### Step 6: Invite Bot to Server

1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "OAuth2" → "URL Generator"
4. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
5. Select bot permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Connect (for voice)
   - ✅ Speak (for voice)
6. Copy the generated URL
7. Open it in browser and add bot to your server

**✅ Bot is now in your server!**

---

## 🎉 Testing Your Setup

### Test Discord Bot:

1. Go to the channel you specified
2. Post a paste link (e.g., `https://pastebin.com/test123`)
3. Bot should respond with: `📋 +1 point! You now have 1 points.`

### Test Voice Points:

1. Join any voice channel
2. Wait 1 hour (or check back later)
3. You should automatically earn 1 point

### Test Website Dashboard:

1. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. You should see:
   - Total users (at least 1 - you!)
   - Total points
   - Recent activity
   - Leaderboard

### Test API Key Linking:

1. On website, go to "API Keys" page
2. Click "Generate New Key"
3. Copy the key
4. In Discord, type: `/login apikey:paste_your_key_here`
5. Bot should confirm: `✅ Your Discord account has been successfully linked!`

---

## 💰 Cost Breakdown

| Service | Component | Free Tier | Your Cost |
|---------|-----------|-----------|-----------|
| **Wispbyte** | Discord Bot | 1 GB, 24/7 hosting | **$0/month** |
| **Netlify** | Website + API | 100 GB bandwidth, 125K functions | **$0/month** |
| **Neon** | Database | 0.5 GB storage | **$0/month** |
| | | **TOTAL:** | **$0/month** 🎉 |

### Free Tier Limits:

- **Wispbyte**: No limits, completely free
- **Netlify**: 
  - 100 GB bandwidth/month (plenty for small-medium servers)
  - 300 build minutes/month
  - 125,000 function requests/month
- **Neon**:
  - 0.5 GB storage (enough for ~10,000 users with full activity history)
  - Unlimited queries

**For most Discord servers, you'll never hit these limits!**

---

## 🔧 Maintenance

### Wispbyte:
- ✅ No maintenance required
- ✅ No renewals needed
- ✅ Runs forever for free

### Bot-Hosting.net:
- ✅ No maintenance required
- ✅ No renewals needed

### HidenCloud (if using):
- 🔄 Renew weekly (just click a button, takes 5 seconds)

### Netlify:
- ✅ Auto-updates if using Git deployment
- ✅ No maintenance required

### Neon Database:
- ✅ No maintenance required
- ⚠️ Free tier projects may suspend after 14 days inactivity
- 💡 Bot activity keeps it alive automatically

---

## 📁 File Structure

```
your-project/
├── discord-bot-deployment/          # Bot deployment package
│   ├── index.js                     # Main bot file
│   ├── database.js                  # Database functions
│   ├── schema.js                    # Database schema
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment variables template
│   └── README.md                    # Bot deployment guide
│
├── website-deployment/              # Website deployment package
│   ├── dist/                        # Built frontend (after build)
│   ├── netlify/
│   │   └── functions/               # API endpoints
│   │       ├── stats.js
│   │       ├── users-top.js
│   │       ├── activities-recent.js
│   │       ├── keys.js
│   │       ├── keys-generate.js
│   │       └── keys-delete.js
│   ├── shared/
│   │   └── schema.js                # Database schema
│   ├── netlify.toml                 # Netlify configuration
│   ├── package.json                 # Dependencies
│   └── README.md                    # Website deployment guide
│
└── FREE-DEPLOYMENT-GUIDE.md         # This file!
```

---

## 🆘 Troubleshooting

### Bot Not Responding

**Problem:** Bot is online but doesn't respond to links

**Solutions:**
1. Check `DISCORD_TARGET_CHANNEL_ID` is correct
2. Verify bot has permissions in that channel
3. Check bot logs on Wispbyte dashboard
4. Ensure "Message Content Intent" is enabled in Discord Developer Portal

---

### Website Shows Zero Users

**Problem:** Dashboard shows 0 users despite bot activity

**Solutions:**
1. Check `DATABASE_URL` is same for both bot and website
2. Verify database connection string format
3. Check Netlify function logs for errors
4. Test database connection in Neon dashboard

---

### "Database Connection Failed"

**Problem:** Can't connect to database

**Solutions:**
1. Verify connection string format: `postgresql://user:pass@host/db`
2. Check Neon project isn't suspended (sign in to reactivate)
3. Ensure connection string has no extra spaces
4. Try copying connection string again from Neon dashboard

---

### Voice Points Not Working

**Problem:** Users don't earn points in voice

**Solutions:**
1. Bot needs "View Channels" and "Connect" permissions
2. Voice checker runs every 5 minutes (be patient)
3. Users must stay in voice for full 1 hour to earn point
4. Check bot logs for errors

---

### Netlify Functions Timeout

**Problem:** API endpoints timeout or error

**Solutions:**
1. Check database isn't suspended (Neon)
2. Verify `DATABASE_URL` environment variable is set
3. View function logs in Netlify dashboard
4. Ensure using `@neondatabase/serverless` HTTP client (not WebSocket)

---

## 🔄 Updating Your Deployment

### Update Discord Bot:

1. Edit code in `discord-bot-deployment/`
2. Re-upload files to Wispbyte/Bot-Hosting.net
3. Restart server

### Update Website:

**If using drag & drop:**
1. Make changes to your frontend code
2. Run `npm run build`
3. Copy new `dist` folder to `website-deployment/`
4. Drag folder to Netlify deploy area

**If using Git:**
1. Make changes
2. Commit and push to GitHub
3. Netlify auto-deploys!

---

## 🌟 Custom Domain (Optional)

Want to use your own domain instead of `yoursite.netlify.app`?

### For Website:

1. Buy domain from Namecheap, Google Domains, etc. (~$10/year)
2. In Netlify Dashboard → Domain Settings
3. Click "Add custom domain"
4. Follow DNS configuration instructions
5. Netlify provides free SSL certificate!

---

## 📊 Monitoring Usage

### Netlify:
- Dashboard → Usage
- Track bandwidth and function invocations
- Free tier: 100 GB bandwidth, 125K functions

### Neon:
- Dashboard → Project → Usage
- Track storage and query performance
- Free tier: 0.5 GB storage

### Bot Hosting:
- Check logs in hosting platform dashboard
- Monitor uptime and errors

---

## 🎓 How It All Works

```mermaid
graph LR
    A[Discord User] -->|Posts link| B[Discord Bot]
    A -->|Joins voice| B
    B -->|Saves data| C[Neon Database]
    D[Web User] -->|Visits site| E[Netlify Website]
    E -->|Calls API| F[Netlify Functions]
    F -->|Queries| C
    C -->|Returns data| F
    F -->|Shows stats| E
```

1. **User posts a paste link** in Discord
2. **Bot detects it** and validates (cooldown, daily limit, duplicates)
3. **Bot saves** activity to PostgreSQL database
4. **User visits website** hosted on Netlify
5. **Website calls** Netlify serverless function
6. **Function queries** Neon database
7. **Data flows back** to website
8. **User sees** updated leaderboard and stats!

**All happening in real-time across three free platforms!** 🎉

---

## ✅ Checklist

Use this to track your deployment progress:

### Discord Bot Setup:
- [ ] Created Discord application
- [ ] Got bot token
- [ ] Enabled required intents
- [ ] Got channel ID
- [ ] Invited bot to server

### Database Setup:
- [ ] Created Neon account
- [ ] Created PostgreSQL database
- [ ] Copied connection string

### Bot Deployment:
- [ ] Signed up for Wispbyte/Bot-Hosting.net
- [ ] Uploaded bot files
- [ ] Set environment variables
- [ ] Started bot
- [ ] Tested link detection
- [ ] Tested voice points

### Website Deployment:
- [ ] Built frontend (`npm run build`)
- [ ] Deployed to Netlify
- [ ] Set DATABASE_URL environment variable
- [ ] Tested dashboard loads
- [ ] Tested leaderboard
- [ ] Tested API key generation

### Final Testing:
- [ ] Posted paste link → earned point
- [ ] Posted server invite → earned point
- [ ] Joined voice for 1 hour → earned point
- [ ] Checked leaderboard on website
- [ ] Generated and linked API key

---

## 🎉 Congratulations!

You now have a fully functional Discord point tracker system running **completely FREE** with **24/7 uptime**!

### What You've Built:

- ✅ Discord bot tracking points (paste links, invites, voice)
- ✅ Beautiful web dashboard with real-time stats
- ✅ Leaderboard showing top contributors
- ✅ API key system for data export
- ✅ All running free, forever!

### Next Steps:

1. **Customize**: Edit bot messages, point values, cooldown times
2. **Share**: Give users the website URL to view their progress
3. **Monitor**: Check dashboards periodically to ensure everything runs smoothly
4. **Scale**: As your server grows, everything scales automatically!

---

## 📞 Support

- **Wispbyte Support**: Join their Discord server
- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **Discord.js Guide**: https://discordjs.guide

---

## 📜 License

This project is open source. Use it freely for your Discord community!

---

**Made with ❤️ for the Discord community**

*Enjoy your free 24/7 point tracker system!* 🚀
