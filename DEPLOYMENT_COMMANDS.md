# 🚀 DEPLOYMENT COMMANDS - Copy & Paste Ready

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 1: PUSH TO GITHUB
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Create repository at: https://github.com/new
# Repository name: invoice-analytics-dashboard
# Make it PUBLIC
# Do NOT initialize with README

# Then run these commands:
git remote add origin https://github.com/YOUR_USERNAME/invoice-analytics-dashboard.git
git branch -M main
git push -u origin main

# ✅ Verify: Visit https://github.com/YOUR_USERNAME/invoice-analytics-dashboard


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 2: RAILWAY DATABASE SETUP
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Go to: https://railway.app
# 1. Sign in with GitHub
# 2. New Project → Provision PostgreSQL
# 3. Click on PostgreSQL → Variables → Copy connection string
# 4. Save it as: RAILWAY_DATABASE_URL

# Format will be: postgresql://postgres:password@monorail.proxy.rlwy.net:12345/railway

# Seed the database locally:
cd apps/api

# Update apps/api/.env:
# DATABASE_URL=<paste your RAILWAY_DATABASE_URL here>

npm run db:push
npm run db:seed

cd ../..

# ✅ Verify: Check Railway dashboard - should see 9 tables


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 3: RENDER - DEPLOY VANNA AI (PYTHON)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Go to: https://render.com
# 1. Sign in with GitHub
# 2. New → Web Service
# 3. Connect your GitHub repository: invoice-analytics-dashboard

# Configuration:
Name: invoice-vanna-ai
Root Directory: services/vanna
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free

# Environment Variables (Click "Add Environment Variable"):

DATABASE_URL=postgresql+psycopg://postgres:password@monorail.proxy.rlwy.net:12345/railway
# ⚠️ Use YOUR Railway URL from Step 2, but change 'postgresql://' to 'postgresql+psycopg://'

GROQ_API_KEY=your_groq_api_key_here

ALLOWED_ORIGINS=https://YOUR-APP-NAME.vercel.app
# ⚠️ You'll update this after Vercel deployment in Step 4

PORT=8000

# 4. Click "Create Web Service"
# 5. Wait 5-10 minutes for deployment
# 6. Copy your Render URL: https://invoice-vanna-ai-xxx.onrender.com

# Test Vanna AI (replace with your URL):
# Visit: https://your-vanna.onrender.com/
# Visit: https://your-vanna.onrender.com/health

# ✅ Verify: Should see {"status":"healthy","database":"connected"}


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 4: VERCEL - DEPLOY FRONTEND + BACKEND
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Go to: https://vercel.com/new
# 1. Sign in with GitHub
# 2. Import your repository: invoice-analytics-dashboard

# Configuration:
Framework Preset: Next.js
Root Directory: apps/web

# Build & Development Settings:
Build Command: cd ../.. && npm install && npm run build --filter=web
Output Directory: .next
Install Command: npm install

# Environment Variables (Click "Add" for each):

NEXT_PUBLIC_API_BASE=/api

NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT-NAME.vercel.app
# ⚠️ Leave blank for now, you'll update after first deploy

DATABASE_URL=postgresql://postgres:password@monorail.proxy.rlwy.net:12345/railway
# ⚠️ Use YOUR Railway URL from Step 2 (keep 'postgresql://')

VANNA_API_BASE_URL=https://invoice-vanna-ai-xxx.onrender.com
# ⚠️ Use YOUR Render URL from Step 3 (without trailing slash)

# 3. Click "Deploy"
# 4. Wait 2-3 minutes
# 5. Copy your Vercel URL: https://your-project.vercel.app

# ✅ Verify: Visit your Vercel URL - dashboard should load


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 5: UPDATE CORS & REDEPLOY
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 5A. Update Vercel Environment Variable:
# Go to: https://vercel.com/dashboard
# Select your project → Settings → Environment Variables
# Find: NEXT_PUBLIC_APP_URL
# Edit value to: https://your-actual-project.vercel.app
# Save
# Click "Redeploy" (top right)

# 5B. Update Render CORS:
# Go to: https://dashboard.render.com
# Select: invoice-vanna-ai
# Go to: Environment
# Find: ALLOWED_ORIGINS
# Edit value to: https://your-actual-project.vercel.app
# Save (service auto-restarts)

# Wait 2-3 minutes for both services to restart

# ✅ Verify all endpoints:

# Frontend:
# https://your-project.vercel.app

# API Health:
# https://your-project.vercel.app/api/health

# Vanna Health:
# https://your-vanna.onrender.com/health


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 6: TEST CHAT WITH DATA
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. Visit: https://your-project.vercel.app
# 2. Click "Chat with Data" tab
# 3. Test these queries:

Query 1: What is the total revenue?
Query 2: Show me invoices from October 2024
Query 3: Which vendor has the highest invoices?
Query 4: Show me paid invoices only
Query 5: What's the average invoice amount?

# ✅ For each query, verify:
# - SQL query appears (syntax highlighted)
# - Results table displays data
# - No CORS errors in browser console


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 7: RECORD DEMO VIDEO
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Use Loom (easiest): https://loom.com
# Or OBS Studio: https://obsproject.com
# Or Zoom screen recording

# Follow VIDEO_SCRIPT.md for detailed script (12 scenes, 4:30 minutes)

# Quick outline:
# 0:00-0:30   Introduction & Tech Stack
# 0:30-1:00   Dashboard Tour (charts, metrics)
# 1:00-1:30   Table Features (search, pagination)
# 1:30-3:30   Chat Queries (5 examples from Step 6)
# 3:30-4:00   Architecture Explanation
# 4:00-4:30   Closing (GitHub & URLs)

# Upload to:
# - YouTube (Unlisted): https://youtube.com/upload
# - Loom: Auto-uploads, copy link
# - Google Drive: Share link

# ✅ Save the video URL for submission


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 8: UPDATE FINAL_SUBMISSION.md
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Open: FINAL_SUBMISSION.md
# Update these sections with YOUR actual URLs:

# Line ~12-15 (Student Information):
- **Name:** [Your Full Name]
- **Student ID:** [Your Student ID]
- **Assignment:** Invoice Analytics Dashboard with AI Chat
- **Submission Date:** November 8, 2025

# Line ~25-32 (Live URLs):
| Service | URL | Status |
|---------|-----|--------|
| **Frontend Dashboard** | https://your-project.vercel.app | 🟢 Live |
| **Backend API** | https://your-project.vercel.app/api | 🟢 Live |
| **Vanna AI Service** | https://your-vanna.onrender.com | 🟢 Live |
| **Database** | Railway PostgreSQL (Internal) | 🟢 Connected |

# Line ~65-72 (GitHub):
**URL:** https://github.com/YOUR_USERNAME/invoice-analytics-dashboard

# Line ~93-95 (Demo Video):
**URL:** [YOUR YOUTUBE/LOOM LINK]
**Duration:** 4 minutes 30 seconds

# Save the file
# Commit and push:
git add FINAL_SUBMISSION.md
git commit -m "Update submission with deployment URLs"
git push


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STEP 9: FINAL VERIFICATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Check all URLs work:

✅ GitHub Repository (public)
   https://github.com/YOUR_USERNAME/invoice-analytics-dashboard

✅ Frontend Dashboard
   https://your-project.vercel.app

✅ Backend API Health
   https://your-project.vercel.app/api/health
   Should return: {"status":"ok"}

✅ Vanna AI Health
   https://your-vanna.onrender.com/health
   Should return: {"status":"healthy","database":"connected"}

✅ Chat with Data
   Go to: https://your-project.vercel.app
   Click: Chat with Data tab
   Try: "What is the total revenue?"
   Should: Display SQL and results

✅ Demo Video
   Your YouTube/Loom link should play

✅ Documentation
   README.md, docs/API.md, docs/ER_DIAGRAM.md all in repo


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SUBMISSION CHECKLIST
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- [ ] GitHub repository is public
- [ ] Code is pushed to main branch
- [ ] README.md has clear setup instructions
- [ ] All services deployed and accessible
- [ ] Environment variables configured correctly
- [ ] Database seeded with test data (500+ records)
- [ ] Chat with Data works with all 5 test queries
- [ ] Demo video recorded (3-5 minutes)
- [ ] Demo video uploaded and link works
- [ ] FINAL_SUBMISSION.md updated with all URLs
- [ ] All documentation complete (API, ER diagram, workflow)
- [ ] Health endpoints return success
- [ ] No CORS errors in browser console
- [ ] Dashboard displays charts and data
- [ ] Table search and pagination work

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SUBMISSION PACKAGE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submit these items:

1. GitHub Repository Link
   https://github.com/YOUR_USERNAME/invoice-analytics-dashboard

2. Live Frontend URL
   https://your-project.vercel.app

3. Demo Video Link
   https://www.youtube.com/watch?v=YOUR_VIDEO or https://loom.com/share/YOUR_ID

4. Brief Description (for submission form):
   """
   Invoice Analytics Dashboard - Full-stack application with AI-powered chat.
   
   Tech Stack: Next.js 14, Express.js, Python FastAPI, PostgreSQL, Groq AI
   
   Features:
   - Interactive dashboard with 6 charts and real-time metrics
   - AI-powered "Chat with Data" using Vanna AI + Groq Llama 3.3 70B
   - Natural language to SQL conversion
   - 500+ records seeded from test data
   - Production deployment on Vercel, Render, Railway
   
   All 7 REST API endpoints documented. Complete ER diagram and architecture documentation included.
   """


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TROUBLESHOOTING QUICK FIXES
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Problem: Vercel build fails
Fix: Check build command is correct
cd ../.. && npm install && npm run build --filter=web

# Problem: Database connection error
Fix: Check DATABASE_URL format
Vercel: postgresql://...
Render: postgresql+psycopg://...

# Problem: CORS error in browser
Fix: Update ALLOWED_ORIGINS in Render
Must match exact Vercel URL (with https://)
Restart Render service after change

# Problem: Chat returns "Failed to fetch"
Fix: Check VANNA_API_BASE_URL in Vercel
Should be: https://your-vanna.onrender.com (no trailing slash)
Redeploy Vercel after change

# Problem: Vanna shows unhealthy
Fix: Check Render logs
Verify DATABASE_URL and GROQ_API_KEY
Ensure database was seeded

# Problem: No data in dashboard
Fix: Verify database seeding
cd apps/api && npm run db:seed
Check Railway dashboard for tables


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## YOUR DEPLOYMENT URLS (Fill in as you deploy)
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GitHub Repository:
_______________________________________________________________

Railway Database URL:
_______________________________________________________________

Render Vanna URL:
_______________________________________________________________

Vercel Frontend URL:
_______________________________________________________________

Demo Video URL:
_______________________________________________________________


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TIME ESTIMATE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GitHub Push:          5 minutes
Railway Setup:        5 minutes
Render Deploy:        10 minutes
Vercel Deploy:        10 minutes
Update CORS:          5 minutes
Testing:              10 minutes
Record Video:         15 minutes
Update Docs:          5 minutes
Final Verification:   5 minutes
────────────────────────────────
TOTAL:                ~70 minutes


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SUPPORT
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Documentation:
- QUICK_DEPLOY.md           - Quick reference
- FINAL_DEPLOYMENT_GUIDE.md - Detailed guide
- README.md                 - Setup instructions
- docs/API.md               - API documentation
- CHAT_WORKFLOW.md          - AI workflow
- VIDEO_SCRIPT.md           - Video guide

Platform Docs:
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Railway: https://docs.railway.app


## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 You're ready to deploy! Follow steps 1-9 in order.

Good luck! 🚀

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
