# Vercel Deployment Guide - Frontend + Backend

## 🚀 Deploying to Vercel

This guide covers deploying both the Next.js frontend and Express.js backend to Vercel.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Your Vanna AI service already deployed (see `services/vanna/DEPLOYMENT.md`)
- PostgreSQL database hosted somewhere (Supabase, Neon, Railway, etc.)

---

## 🎨 Part 1: Deploy Frontend (Next.js)

### Step 1: Prepare Repository

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → "Project"**
3. Import your GitHub repository
4. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel:

```bash
NEXT_PUBLIC_API_BASE=https://your-project-name.vercel.app/api
```

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

---

## 🔧 Part 2: Deploy Backend API (Express.js)

Vercel supports serverless functions, but Express.js needs a small modification.

### Option A: API Routes (Recommended for Vercel)

Create `apps/api/vercel.json`:
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
      "src": "/api/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

Update `apps/api/package.json` to add:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && tsc"
  }
}
```

### Option B: Separate Backend Deployment

Deploy the backend as a separate Vercel project:

1. Create a new Vercel project
2. Root Directory: `apps/api`
3. Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `VANNA_API_BASE_URL`: Your Vanna AI service URL
   - `PORT`: 3001 (optional)

---

## 🔐 Environment Variables - Complete List

### Frontend (`apps/web`)
| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_BASE` | `https://your-backend.vercel.app/api` | Backend API URL |

### Backend (`apps/api`)
| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection |
| `VANNA_API_BASE_URL` | `https://your-vanna-service.onrender.com` | Vanna AI URL |
| `NODE_ENV` | `production` | Environment |
| `PORT` | `3001` | Server port |

---

## 🔗 Connecting Everything

After deployment, your architecture will look like:

```
User Browser
    ↓
Next.js Frontend (Vercel)
    ↓
Express Backend (Vercel)
    ↓
    ├─→ PostgreSQL Database (Cloud)
    └─→ Vanna AI Service (Render/Railway/Fly.io)
          ↓
        Groq LLM API
```

---

## ✅ Post-Deployment Checklist

1. **Update CORS in Vanna AI:**
   - Set `ALLOWED_ORIGINS=https://your-app.vercel.app`
   - Redeploy Vanna AI service

2. **Test Frontend:**
   - Visit your Vercel URL
   - Check Dashboard loads correctly
   - Verify charts display data

3. **Test Chat Feature:**
   - Switch to "Chat with Data" tab
   - Ask: "Show me all invoices"
   - Verify SQL and results display

4. **Check Logs:**
   - Vercel Dashboard → Your Project → Logs
   - Look for any errors

---

## 🐛 Troubleshooting

### Frontend Build Fails
```bash
# Common issues:
# 1. Missing dependencies
npm install

# 2. TypeScript errors
npm run build  # Check errors locally

# 3. Environment variables not set
# Verify in Vercel Dashboard → Settings → Environment Variables
```

### Backend API Errors
```bash
# 1. Prisma not generating
# Add to package.json scripts:
"vercel-build": "prisma generate && npm run build"

# 2. Database connection fails
# Verify DATABASE_URL is correct
# Check if database allows connections from Vercel IPs

# 3. CORS errors
# Update backend CORS settings to allow Vercel domain
```

### Chat Feature Not Working
```bash
# 1. Check Vanna AI is running
curl https://your-vanna-service.com/health

# 2. Verify VANNA_API_BASE_URL is set in backend
# 3. Check CORS on Vanna AI service

# 4. Test backend endpoint directly
curl https://your-backend.vercel.app/api/chat-with-data \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"show invoices"}'
```

---

## 🎯 Alternative: Monorepo Deployment

Deploy everything from root with Turborepo:

**`vercel.json` (in root):**
```json
{
  "buildCommand": "cd apps/web && npm install && npm run build",
  "outputDirectory": "apps/web/.next",
  "devCommand": "cd apps/web && npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "crons": []
}
```

---

## 💰 Cost Estimate

**Free Tier Limits:**
- Vercel: 100GB bandwidth/month, unlimited deployments
- Render (Vanna AI): 750 hours/month free
- Supabase (Database): 500MB database, 2GB bandwidth
- Groq API: Generous free tier

**Total Monthly Cost:** $0 on free tiers! 🎉

---

## 🔒 Production Best Practices

1. ✅ Enable HTTPS only (automatic on Vercel)
2. ✅ Set up custom domain (optional)
3. ✅ Configure environment variables per environment (dev/staging/prod)
4. ✅ Enable Vercel Analytics
5. ✅ Set up monitoring and alerts
6. ✅ Regular dependency updates
7. ✅ Database backups

---

## 📊 Monitoring

**Vercel Built-in Monitoring:**
1. Function logs
2. Edge network analytics
3. Web vitals
4. Real-time visitor insights

**Additional Recommendations:**
- Sentry for error tracking
- LogRocket for session replay
- Datadog for infrastructure monitoring

---

## 🚀 Deployment Commands

```bash
# Deploy from CLI (optional)
npm i -g vercel
vercel login
vercel --prod

# Or use GitHub integration (recommended)
# Every push to main auto-deploys
```

---

## 📝 Domain Setup (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain
5. Update Vanna AI CORS settings

---

## 🎓 Learn More

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Your app is now live! 🎉**

Share your deployed URL: `https://your-project.vercel.app`
