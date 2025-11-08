# Deployment Guide

Complete guide for deploying the Invoice Analytics Dashboard to production.

## Architecture Overview

```
Frontend (Vercel) → Backend API (Vercel) → PostgreSQL (Vercel Postgres)
                           ↓
                    Vanna AI (Render/Railway)
```

---

## Prerequisites

Before deploying, ensure you have:

1. GitHub account with repository
2. Vercel account
3. PostgreSQL database (Vercel Postgres, Supabase, or Railway)
4. Groq API key
5. Render/Railway account (for Vanna AI)

---

## Part 1: Deploy PostgreSQL Database

### Option A: Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Choose your region and create
5. Copy the connection string (starts with `postgres://`)

### Option B: Supabase

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Wait for database to provision
4. Go to Settings → Database
5. Copy "Connection string" under "URI"

### Option C: Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection URL from Variables tab

---

## Part 2: Initialize Database

### 1. Update DATABASE_URL locally

```bash
# apps/api/.env
DATABASE_URL="your_production_database_url"
```

### 2. Push schema and seed data

```bash
cd apps/api

# Generate Prisma Client
npm run db:generate

# Push schema to production database
npm run db:push

# Seed with data
npm run db:seed
```

Verify:
```bash
# Connect to database
psql "your_production_database_url"

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM invoices;
\q
```

---

## Part 3: Deploy Vanna AI Service

### Option A: Render

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select branch (main/master)

2. **Configure Service**
   - Name: `vanna-ai-service`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `services/vanna`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`

3. **Environment Variables**
   ```
   DATABASE_URL=your_production_database_url
   GROQ_API_KEY=your_groq_api_key
   PORT=8000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy service URL: `https://vanna-ai-service.onrender.com`

5. **Test**
   ```bash
   curl https://vanna-ai-service.onrender.com/health
   ```

### Option B: Railway

1. **Create Service**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Create new project from GitHub repo
   - Select `services/vanna` as root directory

2. **Configure**
   - Add environment variables (same as above)
   - Railway will auto-detect Python and install dependencies

3. **Deploy**
   - Push changes to trigger deployment
   - Copy public URL from settings

### Option C: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   cd services/vanna
   fly auth login
   fly launch --name vanna-ai-service
   ```

3. **Set Secrets**
   ```bash
   fly secrets set DATABASE_URL="your_database_url"
   fly secrets set GROQ_API_KEY="your_groq_key"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

---

## Part 4: Deploy Backend + Frontend to Vercel

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will detect Next.js automatically

### 2. Configure Build Settings

**Framework Preset**: Next.js

**Build & Development Settings**:
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Root Directory**: `apps/web`

### 3. Environment Variables

Add these in Vercel Project Settings → Environment Variables:

#### For Backend (applies to API routes)
```
DATABASE_URL=your_production_database_url
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
NODE_ENV=production
```

#### For Frontend
```
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (3-5 minutes)
3. Vercel will provide a URL: `https://your-app.vercel.app`

### 5. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Part 5: Backend API Deployment

Since our backend is Express (not Next.js API routes), we need separate deployment:

### Option 1: Vercel (as serverless functions)

Convert Express to serverless:

1. **Create `apps/api/vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

2. **Update `apps/api/src/index.ts`**:
```typescript
// Export for Vercel
export default app;

// Only listen if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  });
}
```

3. **Deploy**:
```bash
cd apps/api
vercel
```

### Option 2: Railway (Recommended)

1. Create new project in Railway
2. Add service from GitHub repo
3. Set root directory: `apps/api`
4. Add environment variables
5. Railway will auto-deploy

### Option 3: Render

Same process as Vanna AI service but for `apps/api`.

---

## Part 6: Configure CORS

Update backend CORS configuration for production:

```typescript
// apps/api/src/index.ts
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

Redeploy after changes.

---

## Part 7: Update Frontend API Base URL

Update frontend to use correct API URL:

```env
# apps/web/.env.production
NEXT_PUBLIC_API_BASE=https://your-api.railway.app/api
```

Or if using Vercel API routes:
```env
NEXT_PUBLIC_API_BASE=/api
```

---

## Part 8: Health Checks & Monitoring

### 1. Verify All Services

```bash
# Frontend
curl https://your-app.vercel.app

# Backend API
curl https://your-api.railway.app/health

# Vanna AI
curl https://your-vanna.onrender.com/health
```

### 2. Test End-to-End

1. Visit your app: `https://your-app.vercel.app`
2. Check dashboard loads with data
3. Test "Chat with Data" feature
4. Verify all charts and tables work

### 3. Set Up Monitoring

**Vercel**:
- Go to Project → Analytics
- Enable Web Vitals monitoring

**Render/Railway**:
- Check deployment logs
- Set up alerts for downtime

**Database**:
- Monitor connection count
- Set up backup schedule

---

## Part 9: Environment Variables Summary

### Complete List for Each Service

**Frontend (Vercel)**:
```env
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Backend API (Railway/Render)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
VANNA_API_BASE_URL=https://your-vanna.onrender.com
PORT=3001
NODE_ENV=production
```

**Vanna AI (Render/Railway)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GROQ_API_KEY=gsk_...
PORT=8000
PYTHON_VERSION=3.11
```

---

## Part 10: Post-Deployment

### 1. Test All Features

- [ ] Dashboard loads
- [ ] Stats cards show correct data
- [ ] All charts render
- [ ] Invoice table pagination works
- [ ] Search functionality works
- [ ] Chat with Data generates SQL
- [ ] Chat returns results

### 2. Performance Optimization

1. Enable Vercel Edge Caching:
```typescript
// apps/web/src/app/api/stats/route.ts
export const revalidate = 300; // 5 minutes
```

2. Add database connection pooling
3. Implement Redis caching for frequent queries

### 3. Security Checklist

- [ ] Environment variables are secret
- [ ] CORS is properly configured
- [ ] API keys are not exposed
- [ ] Database credentials are secure
- [ ] HTTPS is enforced

### 4. Documentation Updates

Update README with:
- Live URLs (frontend, API, Vanna)
- Demo video link
- Any deployment-specific notes

---

## Troubleshooting

### Frontend Not Loading Data

**Check**:
1. `NEXT_PUBLIC_API_BASE` is correct
2. Backend API is running
3. CORS is configured
4. Browser console for errors

### Backend Database Connection Fails

**Check**:
1. `DATABASE_URL` format is correct
2. Database is accessible from backend host
3. Prisma client is generated
4. Database has tables (run `db:push`)

### Vanna AI Not Responding

**Check**:
1. Service is running (`/health` endpoint)
2. `GROQ_API_KEY` is set
3. `DATABASE_URL` is accessible
4. Python dependencies installed

### Build Failures

**Common fixes**:
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma
cd apps/api
npx prisma generate
```

---

## Rollback Procedure

If deployment fails:

1. **Vercel**: Go to Deployments → Select previous → Promote to Production
2. **Render/Railway**: Redeploy previous commit from dashboard
3. **Database**: Restore from backup if schema changed

---

## Continuous Deployment

Enable automatic deployments:

1. **Vercel**: Enabled by default on push to main
2. **Render**: Enable "Auto-Deploy" in settings
3. **Railway**: Automatic on git push

---

## Monitoring & Logs

### View Logs

**Vercel**:
```bash
vercel logs your-app.vercel.app
```

**Render**:
- Dashboard → Service → Logs tab

**Railway**:
- Dashboard → Service → Deployments → View Logs

### Set Up Alerts

1. Uptime monitoring: [UptimeRobot](https://uptimerobot.com)
2. Error tracking: [Sentry](https://sentry.io)
3. Performance: [New Relic](https://newrelic.com)

---

## Scaling Considerations

### When to Scale:

**Frontend**: Vercel scales automatically

**Backend API**:
- Railway: Upgrade plan for more resources
- Render: Scale up instance size
- Consider moving to Kubernetes for high traffic

**Database**:
- Connection pooling (PgBouncer)
- Read replicas for queries
- Upgrade plan for more connections

**Vanna AI**:
- Cache frequent queries
- Queue system for heavy load
- Multiple instances behind load balancer

---

## Cost Estimation

**Hobby/Free Tier**:
- Vercel: Free (hobby plan)
- Render: $7/month (web service)
- Railway: $5/month (500h)
- Database: $0-20/month (depending on provider)

**Total**: ~$12-35/month

---

## Next Steps After Deployment

1. Set up custom domain
2. Enable SSL certificate
3. Configure CDN for static assets
4. Implement authentication
5. Add monitoring and alerts
6. Set up backup schedule
7. Create incident response plan
8. Document runbooks

---

For issues, check [Troubleshooting](#troubleshooting) or open a GitHub issue.
