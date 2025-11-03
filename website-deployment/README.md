# Discord Point Tracker - Website Deployment (Netlify)

This package contains the web dashboard for viewing Discord bot statistics, leaderboards, and managing API keys.

## Features

- ✅ **Real-time Dashboard**: View total users, points, and activity
- ✅ **Leaderboard**: Top 100 users by points
- ✅ **Activity Feed**: Recent point-earning activities
- ✅ **API Key Management**: Generate and manage API keys
- ✅ **Serverless Architecture**: Uses Netlify Functions (free tier)

## Free Hosting: Netlify

Netlify offers **unlimited free hosting** for static websites with:
- Global CDN (fast worldwide)
- Free SSL certificate
- Automatic deployments from Git
- 100GB bandwidth/month (more than enough)
- Netlify Functions (125K requests/month free)

## Prerequisites

- Netlify account (sign up free at [netlify.com](https://netlify.com))
- GitHub/GitLab account (for automatic deployments)
- PostgreSQL database URL (Neon recommended for free tier)
- Your frontend build files

## Setup Instructions

### Step 1: Prepare Your Files

1. **Build your frontend** (from your main project):
   ```bash
   npm run build
   ```

2. **Copy the dist folder** to this directory:
   ```bash
   cp -r dist website-deployment/
   ```

3. **Copy your frontend source** (optional, for rebuilding):
   ```bash
   cp -r client website-deployment/
   cp -r shared website-deployment/
   cp vite.config.ts website-deployment/
   cp tailwind.config.ts website-deployment/
   cp tsconfig.json website-deployment/
   ```

### Step 2: Deploy to Netlify

#### Option A: Drag & Drop (Easiest)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the `website-deployment` folder to the deploy area
3. Set environment variables (see below)
4. Your site is live!

#### Option B: Git-Based Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   cd website-deployment
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: `netlify/functions`

3. **Set environment variables** (see below)

4. **Deploy!**

### Step 3: Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:

```
DATABASE_URL=your_neon_database_url_here
```

**Get your Database URL:**
- If using Neon (recommended free option): Copy from [neon.tech](https://neon.tech) dashboard
- Format: `postgresql://username:password@host/database`

### Step 4: Test Your Website

After deployment:

1. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Check that dashboard shows stats
3. Verify leaderboard loads
4. Test API key generation

## API Endpoints (Netlify Functions)

All API endpoints are serverless functions:

- `GET /api/stats` - Dashboard statistics
- `GET /api/users/top` - Top 100 users leaderboard
- `GET /api/activities/recent` - Recent activity feed
- `GET /api/keys` - List all API keys
- `POST /api/keys/generate` - Generate new API key
- `DELETE /api/keys/:id` - Delete an API key

## File Structure

```
website-deployment/
├── dist/                    # Built frontend (copy from main project)
├── netlify/
│   └── functions/          # API endpoints (serverless)
│       ├── stats.js
│       ├── users-top.js
│       ├── activities-recent.js
│       ├── keys.js
│       ├── keys-generate.js
│       └── keys-delete.js
├── shared/
│   └── schema.js           # Database schema
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Custom Domain (Optional)

To use your own domain:

1. Go to Netlify Dashboard → Domain Settings
2. Click "Add custom domain"
3. Follow instructions to update DNS records
4. Netlify provides free SSL certificate

## Connecting to Your Discord Bot

Your website and Discord bot work together through the shared database:

1. **Discord Bot** (on Wispbyte/Bot-Hosting.net) writes data to database
2. **Website** (on Netlify) reads data from the same database
3. They communicate automatically through PostgreSQL

No additional configuration needed - just make sure both use the same `DATABASE_URL`!

## Troubleshooting

### Functions Not Working
- Check environment variables are set in Netlify dashboard
- Verify `DATABASE_URL` is correct
- Check function logs in Netlify dashboard

### Database Connection Errors
- Ensure DATABASE_URL uses `postgresql://` (not `postgres://`)
- Verify Neon database is active and accessible
- Check database allows connections from Netlify IPs (Neon allows all by default)

### Build Errors
- Make sure `dist` folder exists with your built frontend
- Check that all dependencies are in `package.json`
- Verify build command runs successfully locally

### Slow Response Times
- Netlify Functions have cold start (~300ms first request)
- Subsequent requests are faster
- Free tier has 125K requests/month limit

## Monitoring

**View Function Logs:**
- Netlify Dashboard → Functions → Select function → Logs

**Monitor Usage:**
- Netlify Dashboard → Usage
- Track bandwidth and function invocations

## Cost

**Completely Free!** Netlify's free tier includes:
- Unlimited sites
- 100 GB bandwidth/month
- 300 build minutes/month
- 125K serverless function requests/month
- Custom domain support
- SSL certificates

This is more than enough for most Discord bot dashboards.

## Updating Your Site

### If using drag & drop:
1. Build frontend: `npm run build`
2. Copy to `website-deployment/dist`
3. Drag folder to Netlify deploy area again

### If using Git:
1. Make changes
2. Build: `npm run build`
3. Commit and push to GitHub
4. Netlify auto-deploys!

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Community**: https://answers.netlify.com

## License

Part of the Discord Point Tracker system. Use freely for your Discord server!
