# Quick Start Guide

Get the Invoice Analytics Dashboard up and running in 10 minutes.

## ⚡ Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Python 3.9+ (for Vanna AI)
- Groq API key ([Get one here](https://console.groq.com/))

## 🚀 Steps

### 1. Clone and Install (2 min)

```bash
git clone <your-repo>
cd invoice-analytics

# Run setup script
# On Windows:
setup.bat

# On macOS/Linux:
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
npm install
npm install --workspaces
```

### 2. Configure Database (3 min)

Create PostgreSQL database:

```bash
# Using psql
createdb invoice_analytics

# Or
psql -U postgres
CREATE DATABASE invoice_analytics;
\q
```

Update `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/invoice_analytics?schema=public"
VANNA_API_BASE_URL="http://localhost:8000"
```

Initialize database:

```bash
cd apps/api
npm run db:generate
npm run db:push
npm run db:seed
cd ../..
```

### 3. Configure Vanna AI (2 min)

Get Groq API key from https://console.groq.com/

Update `services/vanna/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/invoice_analytics
GROQ_API_KEY=gsk_your_api_key_here
PORT=8000
```

Install Python dependencies:

```bash
cd services/vanna

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

cd ../..
```

### 4. Start Everything (1 min)

**Terminal 1 - Vanna AI:**
```bash
cd services/vanna
# Activate venv if not already active
python main.py
```

**Terminal 2 - Backend + Frontend:**
```bash
# From project root
npm run dev
```

### 5. Open Browser (1 min)

Visit:
- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **Vanna AI**: http://localhost:8000/health

## ✅ Verify Installation

### Check Backend API

```bash
curl http://localhost:3001/api/stats
```

Should return:
```json
{
  "totalSpend": 12679.25,
  "totalInvoices": 64,
  ...
}
```

### Check Vanna AI

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test Chat Feature

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the total spend?"}'
```

## 🎯 What You Should See

1. **Dashboard**: Metrics cards showing totals
2. **Charts**: Line chart with invoice trends
3. **Tables**: List of invoices
4. **Chat**: Working "Chat with Data" interface

## 🐛 Common Issues

### "Cannot connect to database"

**Fix**: Check DATABASE_URL is correct and PostgreSQL is running

```bash
# Check if PostgreSQL is running
# macOS:
brew services list
# Linux:
systemctl status postgresql
# Windows: Check Services app
```

### "Groq API error"

**Fix**: Verify GROQ_API_KEY in `services/vanna/.env`

### "Module not found" errors

**Fix**: Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
npm install --workspaces
```

### Port already in use

**Fix**: Kill process on port

```bash
# Find process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📚 Next Steps

1. **Explore the Dashboard**: Check all metrics and charts
2. **Try Chat Queries**: 
   - "List top 5 vendors by spend"
   - "Show invoices from October 2025"
   - "What's the average invoice value?"
3. **Read Full Docs**: See [README.md](./README.md)
4. **Deploy to Production**: See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🆘 Need Help?

- **Full Documentation**: [README.md](./README.md)
- **API Reference**: [docs/API.md](./docs/API.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **GitHub Issues**: Open an issue on the repository

## 🎉 Success!

You now have a fully functional invoice analytics dashboard with AI-powered querying!

**Quick Test Checklist:**

- [ ] Dashboard loads with data
- [ ] All charts render correctly
- [ ] Invoice table shows data
- [ ] Search works
- [ ] Chat returns SQL and results
- [ ] All API endpoints respond

Ready to deploy? See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
