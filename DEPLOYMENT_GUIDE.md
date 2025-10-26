# 🚀 MubarakWay Unified - Deployment Guide

## 📋 Prerequisites

### Required Services
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key (for AI features)
- Vercel/Netlify account (for frontend)
- Railway/Render account (for backend)
- Domain name (optional)
- Telegram Bot Token

### Required Tools
- Node.js 18+ and npm
- Git
- MongoDB Compass (optional, for database management)

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create Account:**
   - Go to https://cloud.mongodb.com
   - Sign up for free tier (512MB storage, perfect for start)

2. **Create Cluster:**
   ```
   Cluster Name: mubarak-way-cluster
   Region: Closest to your users
   Tier: M0 Sandbox (Free)
   ```

3. **Create Database User:**
   ```
   Username: mubarakway-admin
   Password: [Generate strong password]
   Database User Privileges: Read and write to any database
   ```

4. **Configure Network Access:**
   ```
   IP Access List: 0.0.0.0/0 (Allow from anywhere)
   Or: Add your server IP addresses
   ```

5. **Get Connection String:**
   ```
   mongodb+srv://mubarakway-admin:<password>@mubarak-way-cluster.xxxxx.mongodb.net/mubarak-way-unified?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Start MongoDB service
# Windows: Run MongoDB as service
# Mac/Linux: brew services start mongodb-community
# Or: sudo systemctl start mongod

# Connection string
mongodb://localhost:27017/mubarak-way-unified
```

---

## 🔑 Environment Variables

### Backend (.env)

Create `backend/.env` file:

```env
# Environment
NODE_ENV=production

# Server
PORT=4000
CLIENT_URL=https://your-app.vercel.app

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mubarak-way-unified?retryWrites=true&w=majority

# Authentication
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-random-string

# AI Service
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (.env)

Create `frontend/.env` file:

```env
# API Configuration
VITE_API_URL=https://your-backend.railway.app/api/v1
VITE_TELEGRAM_BOT_USERNAME=YourBotUsername

# Environment
VITE_ENV=production
```

---

## 📊 Database Seeding

### 1. Create Admin Script

Create `backend/scripts/seed.ts`:

```typescript
import mongoose from 'mongoose';
import { Surah, Ayah, Book, Nashid, Lesson, SubscriptionPlan } from '../models';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);

  console.log('🌱 Seeding database...');

  // Seed Subscription Plans
  await SubscriptionPlan.insertMany([
    {
      tier: 'free',
      name: 'Free',
      price: 0,
      duration: 0,
      limits: {
        offlineBooks: 2,
        offlineNashids: 5,
        aiRequests: 10,
      },
      features: ['Basic Quran access', 'Prayer times', 'Limited offline content'],
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: 4.99,
      duration: 30,
      limits: {
        offlineBooks: 20,
        offlineNashids: 50,
        aiRequests: 100,
      },
      features: ['All books', 'All nashids', 'AI assistant', 'Offline mode'],
    },
    {
      tier: 'premium',
      name: 'Premium',
      price: 9.99,
      duration: 30,
      limits: {
        offlineBooks: -1,
        offlineNashids: -1,
        aiRequests: -1,
      },
      features: ['Unlimited everything', 'Priority support', 'Early features'],
    },
  ]);

  // Seed sample Surahs (you'll need to import actual Quran data)
  // Use a Quran API or dataset

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch(error => {
  console.error('❌ Seeding error:', error);
  process.exit(1);
});
```

### 2. Import Quran Data

Use existing Quran APIs or datasets:
- https://api.alquran.cloud/v1/quran/quran-uthmani (Arabic)
- https://api.alquran.cloud/v1/quran/en.sahih (English translation)
- https://api.alquran.cloud/v1/quran/ru.kuliev (Russian translation)

### 3. Run Seeding

```bash
cd backend
npm run seed
# Or: npx tsx scripts/seed.ts
```

---

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Build

```bash
cd frontend
npm run build
# Creates dist/ folder
```

### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Import Git repository
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install --legacy-peer-deps
   ```

4. Add Environment Variables in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend.railway.app/api/v1
   VITE_TELEGRAM_BOT_USERNAME=YourBotUsername
   VITE_ENV=production
   ```

5. Deploy

### 3. Configure Custom Domain (Optional)

```
Settings → Domains → Add Domain
Example: app.mubarakway.com
Follow DNS configuration instructions
```

---

## 🖥️ Backend Deployment (Railway)

### 1. Create Railway Account

Go to https://railway.app and sign up

### 2. Create New Project

```
New Project → Deploy from GitHub repo
Select: mubarak-way-unified
Root Directory: backend
```

### 3. Configure Build

In Railway dashboard:

**Build Settings:**
```
Build Command: npm install && npm run build
Start Command: npm start
Watch Paths: backend/**
```

**Environment Variables:**
Add all variables from backend/.env

### 4. Add MongoDB Plugin (Optional)

```
New → Database → MongoDB
Railway will auto-generate MONGODB_URI
```

### 5. Deploy

```bash
# Automatic deployment on git push
git push origin main
```

### 6. Get Deployment URL

```
Railway provides: https://your-app.up.railway.app
Use this as VITE_API_URL in frontend
```

---

## 🔐 Telegram Bot Setup

### 1. Create Bot

Talk to [@BotFather](https://t.me/BotFather):

```
/newbot
Bot name: MubarakWay
Bot username: MubarakWayBot
```

Save the API token.

### 2. Configure Bot

```
/setdomain
Select: @MubarakWayBot
Domain: https://your-app.vercel.app

/setdescription
Description: Your Islamic companion - Learn Quran, Prayer, and more

/setmenubutton
Button text: Open App
Web App URL: https://your-app.vercel.app
```

### 3. Test Bot

Search for your bot on Telegram and open the web app.

---

## 🧪 Testing Deployment

### 1. Frontend Tests

```bash
# Check if app loads
curl https://your-app.vercel.app

# Check environment variables
Open browser console and check window.env (if exposed)
```

### 2. Backend Tests

```bash
# Health check
curl https://your-backend.railway.app/health

# Test auth endpoint
curl -X POST https://your-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telegramId": "123456"}'

# Test Quran endpoint
curl https://your-backend.railway.app/api/v1/quran/surahs
```

### 3. Integration Tests

1. Open Telegram bot
2. Launch web app
3. Test each module:
   - Quran reading
   - Library browsing
   - Prayer times
   - AI assistant
   - Settings

---

## 📈 Monitoring & Analytics

### 1. Setup Sentry (Error Tracking)

**Frontend:**
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Backend:**
```bash
npm install @sentry/node
```

Configure in code:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

### 2. Setup Analytics

Add to frontend:
```typescript
// Google Analytics or Plausible
// Add script tag in index.html
```

### 3. Setup Logging

**Backend (Winston):**
```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install --legacy-peer-deps
      - run: npm run test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install --legacy-peer-deps
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: bltavares/actions/railway@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🛡️ Security Checklist

- [ ] All environment variables are set correctly
- [ ] MongoDB user has minimal required permissions
- [ ] CORS is configured with specific origins (not *)
- [ ] Rate limiting is enabled
- [ ] JWT secret is strong and random (32+ characters)
- [ ] Telegram bot token is kept secret
- [ ] HTTPS is enforced everywhere
- [ ] API endpoints have proper authentication
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Security headers are configured (helmet.js)

---

## 📊 Performance Optimization

### Frontend

1. **Code Splitting:**
```typescript
// Lazy load pages
const QuranModule = lazy(() => import('./pages/quran'));
```

2. **Image Optimization:**
```bash
# Use next-gen formats (WebP)
# Compress images
# Use CDN for static assets
```

3. **Bundle Analysis:**
```bash
npm run build -- --analyze
```

### Backend

1. **Database Indexing:**
```typescript
// Add indexes to frequently queried fields
surahSchema.index({ number: 1 });
ayahSchema.index({ surahNumber: 1, numberInSurah: 1 });
```

2. **Caching:**
```typescript
// Use Redis for caching
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

3. **Response Compression:**
```typescript
import compression from 'compression';
app.use(compression());
```

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: MongooseServerSelectionError
Solution: Check MONGODB_URI, network access, user permissions
```

**2. CORS Errors**
```
Error: Access-Control-Allow-Origin
Solution: Add frontend URL to CORS_ORIGIN in backend .env
```

**3. Telegram WebApp Not Loading**
```
Error: Failed to load web app
Solution: Check HTTPS is enabled, bot domain is configured
```

**4. Build Failures**
```
Error: Module not found
Solution: Clear node_modules, reinstall with --legacy-peer-deps
```

**5. API 404 Errors**
```
Error: Cannot GET /api/v1/...
Solution: Check VITE_API_URL is correct, backend is deployed
```

---

## 📝 Post-Deployment Checklist

- [ ] Frontend is accessible at production URL
- [ ] Backend health check returns 200
- [ ] MongoDB connection is working
- [ ] All API endpoints respond correctly
- [ ] Telegram bot opens the web app
- [ ] User can authenticate via Telegram
- [ ] Quran module works (load surahs, read)
- [ ] Library module works (books, nashids)
- [ ] Prayer module works (lessons, times, qibla)
- [ ] Progress tracking saves correctly
- [ ] Settings update properly
- [ ] Language switching works (RU/EN/AR)
- [ ] Theme switching works (Light/Dark)
- [ ] AI assistant responds (if API key configured)
- [ ] Subscription limits are enforced
- [ ] Error tracking is active
- [ ] Monitoring dashboards show data

---

## 🎯 Next Steps After Deployment

1. **Content Population:**
   - Import complete Quran with translations
   - Add Islamic books
   - Upload nashids
   - Create prayer lessons

2. **User Testing:**
   - Beta testing with small group
   - Collect feedback
   - Fix bugs and improve UX

3. **Marketing:**
   - Create landing page
   - Social media presence
   - App Store / Google Play (if mobile apps)

4. **Monetization:**
   - Setup payment gateway (Stripe/Paddle)
   - Implement subscription checkout
   - Configure webhooks

5. **Scaling:**
   - Monitor performance
   - Optimize slow queries
   - Add caching layers
   - Consider CDN for assets

---

## 📞 Support

**Documentation:** See README.md and other docs/
**Issues:** Create GitHub issue
**Email:** support@mubarakway.com

---

**Last Updated:** 26 October 2025
**Version:** 1.0.0
**Status:** Production Ready 🚀
