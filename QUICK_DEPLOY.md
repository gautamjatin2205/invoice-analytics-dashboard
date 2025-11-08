# 🚀 Quick Deployment Reference Card

## ⚡ Fast Track Deployment (30 minutes)

### Step 1: GitHub (5 min)
```powershell
# Create repo at: https://github.com/new
# Name: invoice-analytics-dashboard
# Public repository

# Push code
git remote add origin https://github.com/YOUR_USERNAME/invoice-analytics-dashboard.git
git branch -M main
git push -u origin main
```

---

### Step 2: PostgreSQL Database (5 min)

**Railway** (Recommended): https://railway.app
1. New Project → Provision PostgreSQL
2. Copy connection string
3. Format: `postgresql://user:pass@host:port/dbname`

**Seed locally:**
```powershell
# Update apps/api/.env with Railway URL
cd apps/api
npm run db:push
npm run db:seed
```

---

### Step 3: Deploy Vanna AI - Render (10 min)

**URL:** https://render.com

**Quick Config:**
```yaml
Name: invoice-vanna-ai
Root Directory: services/vanna
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Plan: Free
```

**Environment Variables:**
```env
DATABASE_URL=postgresql+psycopg://[RAILWAY_URL]
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=https://YOUR-APP.vercel.app
PORT=8000
```

**Test:** `https://your-vanna.onrender.com/health`

---

### Step 4: Deploy Frontend + Backend - Vercel (10 min)

**URL:** https://vercel.com

**Quick Config:**
```yaml
Framework: Next.js
Root Directory: apps/web
Build Command: cd ../.. && npm install && npm run build --filter=web
Output Directory: .next
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://YOUR-APP.vercel.app
DATABASE_URL=postgresql://[RAILWAY_URL]
VANNA_API_BASE_URL=https://your-vanna.onrender.com
```

**Update CORS in Render:**
- Go to Vanna service
- Update `ALLOWED_ORIGINS=https://YOUR-APP.vercel.app`
- Save (auto-restarts)

---

## ✅ Verification Checklist

### Test URLs (Replace with yours)

```bash
# Frontend
https://YOUR-APP.vercel.app
✅ Dashboard loads
✅ Charts display
✅ Table works

# API Health
https://YOUR-APP.vercel.app/api/health
✅ Returns: {"status":"ok"}

# Vanna Health
https://your-vanna.onrender.com/health
✅ Returns: {"status":"healthy","database":"connected"}

# Chat Test
Go to: https://YOUR-APP.vercel.app
Click: Chat with Data
Query: "What is the total revenue?"
✅ SQL appears
✅ Results display
```

---

## 🔧 Environment Variables - Complete List

### Vercel (Frontend + Backend)
```env
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://invoice-dashboard-xyz.vercel.app
DATABASE_URL=postgresql://postgres:pass@monorail.proxy.rlwy.net:12345/railway
VANNA_API_BASE_URL=https://invoice-vanna-ai.onrender.com
```

### Render (Vanna AI)
```env
DATABASE_URL=postgresql+psycopg://postgres:pass@monorail.proxy.rlwy.net:12345/railway
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=https://invoice-dashboard-xyz.vercel.app
PORT=8000
```

**⚠️ Important:** 
- Use `postgresql://` for Vercel
- Use `postgresql+psycopg://` for Render (Python)
- Update ALLOWED_ORIGINS after Vercel deployment

---

## 🎬 Demo Video Checklist (4-5 min)

### Recording Tool
- **Loom** (easiest): https://loom.com
- **OBS Studio** (free): https://obsproject.com
- **Zoom**: Screen share + record

### Script (Follow VIDEO_SCRIPT.md)
```
0:00 - 0:30  Intro (Name, Project, Tech Stack)
0:30 - 1:00  Dashboard Tour (6 charts, metrics)
1:00 - 1:30  Table Features (search, pagination)
1:30 - 3:30  Chat Queries (5 examples)
             1. "What is the total revenue?"
             2. "Show me invoices from October 2024"
             3. "Which vendor has the highest invoices?"
             4. "Show me paid invoices only"
             5. "What's the average invoice amount?"
3:30 - 4:00  Architecture (Tech stack, workflow)
4:00 - 4:30  Closing (GitHub link, live URL)
```

### Upload
- YouTube: https://youtube.com/upload (Unlisted)
- Loom: Auto-uploads, copy link
- Google Drive: Share link → "Anyone with link"

---

## 📝 Final Submission Template

### Update FINAL_SUBMISSION.md with:

```markdown
## 🔗 Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://YOUR-ACTUAL-URL.vercel.app |
| Backend API | https://YOUR-ACTUAL-URL.vercel.app/api |
| Vanna AI | https://YOUR-ACTUAL-VANNA.onrender.com |
| GitHub Repo | https://github.com/YOUR-USERNAME/invoice-analytics-dashboard |
| Demo Video | https://www.loom.com/share/YOUR-VIDEO-ID |

## 👨‍💻 Student Info
- Name: [Your Name]
- Student ID: [Your ID]
- Email: [Your Email]
```

---

## 🆘 Common Issues & Fixes

### ❌ "Cannot connect to database"
```bash
# Check DATABASE_URL format
# Vercel: postgresql://
# Render: postgresql+psycopg://
# Ensure database is seeded
```

### ❌ "CORS error in browser"
```bash
# Update ALLOWED_ORIGINS in Render
# Match exact Vercel URL (with https://)
# Restart Render service
```

### ❌ "Chat returns error"
```bash
# Verify VANNA_API_BASE_URL in Vercel
# Check Vanna service is running on Render
# Test: curl https://your-vanna.onrender.com/health
```

### ❌ "Build fails on Vercel"
```bash
# Check build command includes monorepo setup
# Verify all dependencies in package.json
# Check Node version (18.x or 20.x)
```

---

## 📊 Project Stats for Submission

```
Total Files: 58
Lines of Code: 69,000+
Components: 4 (Dashboard, Sidebar, ChatWithData, Tabs)
API Endpoints: 7
Database Tables: 9
Test Records: 500+
Charts: 6
AI Model: Groq Llama 3.3 70B
Deployment Time: ~30 minutes
Monthly Cost: $0
```

---

## 🎯 Success Metrics

Your deployment is **COMPLETE** when:

✅ All services are live and accessible
✅ Dashboard displays data from cloud database
✅ Chat with Data returns SQL and results
✅ All 5 test queries work
✅ Health endpoints return success
✅ Demo video uploaded and link works
✅ GitHub repo is public with all code
✅ FINAL_SUBMISSION.md has all URLs filled in

---

## 📞 Help Resources

| Issue | Resource |
|-------|----------|
| Setup | `README.md` |
| Deployment | `FINAL_DEPLOYMENT_GUIDE.md` |
| API Docs | `docs/API.md` |
| Database | `docs/ER_DIAGRAM.md` |
| Chat Flow | `CHAT_WORKFLOW.md` |
| Video | `VIDEO_SCRIPT.md` |
| Submission | `FINAL_SUBMISSION.md` |

---

## 🎉 Final Steps

1. **Deploy** (30 min):
   - [ ] Push to GitHub
   - [ ] Setup Railway database
   - [ ] Deploy Vanna to Render
   - [ ] Deploy Frontend to Vercel
   - [ ] Test all URLs

2. **Record Video** (15 min):
   - [ ] Follow VIDEO_SCRIPT.md
   - [ ] Show dashboard
   - [ ] Demo 5 chat queries
   - [ ] Upload to YouTube/Loom

3. **Submit** (5 min):
   - [ ] Update FINAL_SUBMISSION.md with URLs
   - [ ] Add video link
   - [ ] Double-check all links work
   - [ ] Submit!

---

**Total Time:** ~50 minutes from start to submission

**Good luck! 🚀**

---

## 📧 Quick Links

- **Vercel:** https://vercel.com
- **Render:** https://render.com
- **Railway:** https://railway.app
- **GitHub:** https://github.com/new
- **Loom:** https://loom.com
- **YouTube Upload:** https://youtube.com/upload

---

**Print this card and keep it handy during deployment!** 📌
