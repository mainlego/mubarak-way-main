# 🚀 Render.com Deployment Guide

Complete guide for deploying MubarakWay to Render.com using the optimized blueprint.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Using Blueprint)](#quick-start-using-blueprint)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Manual Deployment](#manual-deployment)
5. [Build Optimization Tips](#build-optimization-tips)
6. [Troubleshooting](#troubleshooting)
7. [Cost Optimization](#cost-optimization)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account with repository access
- ✅ Render.com account (free tier works)
- ✅ MongoDB Atlas account (free tier M0 cluster)
- ✅ Telegram Bot Token (from @BotFather)
- ✅ Anthropic API Key (for AI features)

### Repository Setup
```bash
git clone https://github.com/mainlego/mubarak-way-main.git
cd mubarak-way-main/mubarak-way-unified
```

---

## Quick Start (Using Blueprint)

### Method 1: One-Click Deploy

1. **Click the Deploy Button:**

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mainlego/mubarak-way-main)

2. **Fill in Environment Variables:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Random secure string (auto-generated)
   - `TELEGRAM_BOT_TOKEN`: From @BotFather
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `VITE_QURAN_API_TOKEN`: E-Replika API token (optional)

3. **Deploy!**
   - Wait 5-10 minutes for initial deployment
   - Backend: `https://mubarak-way-backend.onrender.com`
   - Frontend: `https://mubarak-way-frontend.onrender.com`

### Method 2: Import from Dashboard

1. **Login to Render:**
   - Go to https://dashboard.render.com

2. **Create New Blueprint:**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select `mubarak-way-main` repository
   - Render will auto-detect `render.yaml`

3. **Configure Services:**
   - Review the two services (backend + frontend)
   - Add required environment variables
   - Click "Apply"

---

## Environment Variables Setup

### Backend Environment Variables

#### Required Variables

```bash
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mubarakway?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
# Or let Render auto-generate: generateValue: true

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# AI Service (Anthropic Claude)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx

# Production Settings
NODE_ENV=production
PORT=10000
```

#### Optional Variables

```bash
# CORS Origins (default includes frontend URL)
ALLOWED_ORIGINS=https://mubarak-way-frontend.onrender.com,https://web.telegram.org

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Data Source
USE_MOCK_DATA=false

# Admin Access (Telegram User IDs)
ADMIN_TELEGRAM_IDS=123456789,987654321
```

### Frontend Environment Variables

#### Required Variables

```bash
# Backend API
VITE_API_URL=https://mubarak-way-backend.onrender.com/api/v1

# Telegram Bot
VITE_TELEGRAM_BOT_USERNAME=MubarakWayBot

# Production Mode
VITE_ENV=production
NODE_ENV=production
```

#### Optional Variables

```bash
# E-Replika Quran API (fallback)
VITE_QURAN_API_URL=https://bot.e-replika.ru/api/v1
VITE_QURAN_API_TOKEN=your-token-here
```

---

## Manual Deployment

If you prefer manual setup without blueprint:

### 1. Deploy Backend

```bash
# Create new Web Service
Service Name: mubarak-way-backend
Runtime: Node
Region: Frankfurt (or closest to your users)
Branch: main

# Build Command
npm install --legacy-peer-deps --prefer-offline && \
cd shared && npm install && npm run build && \
cd ../backend && npm install --include=dev --legacy-peer-deps && npm run build

# Start Command
cd backend && npm start

# Health Check Path
/health
```

### 2. Deploy Frontend

```bash
# Create new Static Site
Service Name: mubarak-way-frontend
Runtime: Static
Region: Frankfurt

# Build Command
npm install --legacy-peer-deps --prefer-offline && \
cd shared && npm run build && \
cd ../frontend && npm install --legacy-peer-deps && npm run build:prod

# Publish Directory
./frontend/dist
```

### 3. Configure Environment Variables

Add all required env vars through Render Dashboard:
- Backend: Settings → Environment → Add Environment Variable
- Frontend: Settings → Environment → Add Environment Variable

---

## Build Optimization Tips

### Minimize Build Minutes Usage

#### 1. Use `--prefer-offline` Flag
```bash
npm install --prefer-offline
```
This uses cached packages when possible, reducing download time.

#### 2. Selective Auto-Deploy

Disable auto-deploy for development branches:

```yaml
autoDeploy: true
branch: main  # Only auto-deploy main branch
```

For other branches, deploy manually when needed.

#### 3. Pull Request Previews

Disable PR previews if not needed:
```yaml
pullRequestPreviewsEnabled: false
```

Or enable only for frontend:
```yaml
# Only for frontend
pullRequestPreviewsEnabled: true
```

#### 4. Consolidate Commits

Before pushing to production:
```bash
# Squash multiple commits
git rebase -i HEAD~5
```

This reduces the number of builds triggered.

#### 5. Use Manual Deploy

For non-critical changes:
1. Disable auto-deploy in Render Dashboard
2. Deploy manually: Dashboard → Service → Manual Deploy

### Build Caching

Render automatically caches:
- ✅ `node_modules/`
- ✅ Build artifacts
- ✅ npm cache

To force clean build:
```bash
# In Render Dashboard
Settings → Clear build cache & deploy
```

---

## Troubleshooting

### Common Issues

#### Issue: "Your workspace has run out of pipeline minutes"

**Solutions:**
1. **Wait for next billing period** (1st of month)
2. **Upgrade to Starter plan** ($7/month for more minutes)
3. **Optimize builds** (see tips above)
4. **Use manual deploy** instead of auto-deploy

#### Issue: Build fails with "Module not found"

**Solution:**
```bash
# Ensure shared package is built first
cd shared && npm run build
```

Check `render.yaml` build order is correct.

#### Issue: Frontend shows "API Error"

**Solution:**
Check CORS settings in backend:
```bash
# Backend env var
ALLOWED_ORIGINS=https://mubarak-way-frontend.onrender.com
```

#### Issue: Telegram Bot not responding

**Solution:**
Check webhook URL in Telegram:
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Update webhook:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://mubarak-way-backend.onrender.com/webhook"
```

#### Issue: MongoDB connection timeout

**Solution:**
1. Whitelist Render IPs in MongoDB Atlas:
   - Go to Network Access → Add IP Address
   - Select "Allow Access from Anywhere" (0.0.0.0/0)

2. Check connection string format:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

### Debug Mode

Enable verbose logging:

**Backend:**
```bash
# Add to env vars
DEBUG=*
LOG_LEVEL=debug
```

**Frontend:**
```bash
# Add to env vars
VITE_DEBUG=true
```

### Check Service Logs

```bash
# In Render Dashboard
Service → Logs → View Logs

# Or use Render CLI
render logs -s mubarak-way-backend --tail
```

---

## Cost Optimization

### Free Tier Limits

**Render Free Tier:**
- ✅ 750 hours/month (per service)
- ✅ 100 GB bandwidth/month
- ✅ 500 build minutes/month (shared across workspace)
- ⚠️ Services sleep after 15 min inactivity

### Strategies

#### 1. Use Static Site for Frontend
```yaml
type: web  # ❌ Uses runtime hours
type: static  # ✅ No runtime hours, only build minutes
```

#### 2. Minimize Rebuilds
- Combine multiple changes into one commit
- Use manual deploy for minor updates
- Disable PR previews if not needed

#### 3. Optimize Build Time
```yaml
# Use cache-friendly commands
npm ci --prefer-offline  # Faster than npm install
```

#### 4. Use Scheduled Tasks Wisely
```yaml
# Cron jobs count towards build minutes
# Run only when necessary
schedule: "0 2 * * 0"  # Weekly instead of daily
```

#### 5. Monitor Usage

Check usage in Render Dashboard:
```
Settings → Usage → Build Minutes
```

Set up alerts when approaching limits.

### Upgrade Plans Comparison

| Plan | Price | Build Minutes | Features |
|------|-------|---------------|----------|
| Free | $0 | 500/month | Services sleep after 15min |
| Starter | $7/mo | 500/month | No sleeping |
| Standard | $25/mo | 1000/month | More resources |
| Pro | $85/mo | Unlimited | Priority support |

**Recommendation for Production:**
- Development: Free tier
- Production: Starter ($7/mo) - Services don't sleep

---

## Advanced Configuration

### Custom Domains

**Backend:**
```yaml
# In render.yaml or Dashboard
customDomains:
  - api.mubarakway.com
```

**Frontend:**
```yaml
customDomains:
  - mubarakway.com
  - www.mubarakway.com
```

### Environment-Specific Configs

**Staging Environment:**
```yaml
- type: web
  name: mubarak-way-backend-staging
  branch: develop
  envVars:
    - key: NODE_ENV
      value: staging
```

### Database Backups

**MongoDB Atlas:**
1. Go to Clusters → Backup
2. Enable Continuous Backups (M10+ clusters)
3. Or use manual snapshots (free tier)

**Render Postgres (if using):**
```yaml
databases:
  - name: mubarak-way-db
    plan: free
    # Automatic daily backups included
```

### Monitoring & Alerts

**Set up monitors:**
```yaml
# In Render Dashboard
Service → Monitors → Add Monitor

# Alert on:
- High memory usage (>80%)
- High CPU usage (>80%)
- Response time >2s
- Failed health checks
```

---

## Deployment Checklist

### Before First Deploy

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Telegram bot created via @BotFather
- [ ] Anthropic API key obtained
- [ ] GitHub repository connected to Render
- [ ] All environment variables configured
- [ ] Health check endpoint verified locally

### After Deploy

- [ ] Backend health check responding: `/health`
- [ ] Frontend loading correctly
- [ ] Telegram bot responding to commands
- [ ] MongoDB connection successful
- [ ] AI chat working (if configured)
- [ ] CORS working between frontend and backend
- [ ] PWA installable on mobile devices
- [ ] Custom domain configured (if applicable)

### Production Readiness

- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Performance monitoring configured
- [ ] Database backups enabled
- [ ] SSL certificates active
- [ ] Rate limiting configured
- [ ] Security headers in place
- [ ] Admin access restricted
- [ ] Logs being collected and reviewed

---

## Support & Resources

### Documentation
- [Render Documentation](https://render.com/docs)
- [Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Build & Deploy](https://render.com/docs/deploys)

### Community
- [Render Community](https://community.render.com)
- [GitHub Issues](https://github.com/mainlego/mubarak-way-main/issues)

### Contact
- Render Support: support@render.com
- Project Issues: Create issue on GitHub

---

## Changelog

### Version 2.0 (Current)
- ✅ Optimized build commands with `--prefer-offline`
- ✅ Added comprehensive environment variable documentation
- ✅ Improved security headers (CSP, X-Frame-Options)
- ✅ Added caching strategies
- ✅ Pull request preview support
- ✅ Health check endpoints
- ✅ Auto-generated JWT secrets

### Version 1.0
- Initial Render blueprint
- Basic frontend and backend deployment
- MongoDB integration

---

**Generated with ❤️ by MubarakWay Team**
