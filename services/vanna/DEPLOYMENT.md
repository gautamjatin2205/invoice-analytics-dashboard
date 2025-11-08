# Vanna AI Service - Deployment Guide

## 🚀 Overview

This is a self-hosted Vanna AI service built with FastAPI that:
- ✅ Connects to PostgreSQL database
- ✅ Uses Groq LLM API for SQL generation
- ✅ Responds to natural-language questions about data
- ✅ Returns generated SQL and query results
- ✅ Production-ready with health checks and CORS

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL database (can be hosted anywhere)
- Groq API Key (from https://console.groq.com/)

## 🛠️ Local Development

1. **Install dependencies:**
```bash
cd services/vanna
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Run the service:**
```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

4. **Test the service:**
```bash
curl http://localhost:8000/health
```

## ☁️ Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. **Create account at [Render](https://render.com/)**

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Select "Python 3" environment
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GROQ_API_KEY`: Your Groq API key
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

4. **Deploy:** Render will automatically deploy your service

**Note:** The `render.yaml` file is already configured for easy deployment.

---

### Option 2: Railway

1. **Create account at [Railway](https://railway.app/)**

2. **Deploy from GitHub:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Add Environment Variables:**
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `ALLOWED_ORIGINS`

4. **Railway will auto-detect the configuration** from `railway.json`

---

### Option 3: Fly.io

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login and create app:**
```bash
fly auth login
fly launch
```

3. **Set secrets:**
```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set GROQ_API_KEY="gsk_..."
fly secrets set ALLOWED_ORIGINS="https://your-app.vercel.app"
```

4. **Deploy:**
```bash
fly deploy
```

**Note:** The `fly.toml` file is already configured.

---

### Option 4: Digital Ocean App Platform

1. **Create account at [Digital Ocean](https://www.digitalocean.com/)**

2. **Create new App:**
   - Select "Python" as the resource type
   - Connect your GitHub repository
   - Select `services/vanna` as the source directory

3. **Configure:**
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables:**
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `ALLOWED_ORIGINS`

---

### Option 5: Docker Deployment (Any Platform)

1. **Build the image:**
```bash
cd services/vanna
docker build -t vanna-ai-service .
```

2. **Run the container:**
```bash
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e GROQ_API_KEY="gsk_..." \
  -e ALLOWED_ORIGINS="https://your-app.vercel.app" \
  vanna-ai-service
```

3. **Deploy to any Docker-compatible platform:**
   - AWS ECS
   - Google Cloud Run
   - Azure Container Apps
   - Your own VPS with Docker

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `GROQ_API_KEY` | Yes | Groq API key for LLM | `gsk_...` |
| `PORT` | No | Server port (default: 8000) | `8000` |
| `ALLOWED_ORIGINS` | No | CORS origins (comma-separated) | `https://app.vercel.app,*` |

---

## 🔗 Connecting to Frontend

Once deployed, update your frontend environment variables:

**For Vercel deployment:**

1. Go to your Vercel project settings
2. Add environment variable:
   ```
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   ```
   (or your Railway/Fly.io/Digital Ocean URL)

3. Update `apps/api/.env`:
   ```bash
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   ```

---

## 🧪 Testing Deployment

After deployment, test these endpoints:

1. **Health Check:**
```bash
curl https://your-service-url.com/health
```

2. **Query Endpoint:**
```bash
curl -X POST https://your-service-url.com/query \
  -H "Content-Type: application/json" \
  -d '{"question": "show me all invoices"}'
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/health` | GET | Health check for monitoring |
| `/query` | POST | Natural language to SQL |
| `/schema` | GET | Database schema information |

---

## 🚨 Troubleshooting

### Database Connection Issues
- Ensure your PostgreSQL database allows connections from your deployment platform's IP
- For cloud databases (Supabase, Neon, etc.), enable "Allow all connections" or whitelist IPs
- Verify DATABASE_URL format is correct

### CORS Issues
- Update `ALLOWED_ORIGINS` to include your Vercel domain
- Format: `https://your-app.vercel.app` (no trailing slash)
- For multiple origins: `https://app1.com,https://app2.com`

### Groq API Issues
- Verify your API key is valid at https://console.groq.com/
- Check API quota limits
- Ensure the model `llama-3.3-70b-versatile` is available

---

## 💡 Recommended Setup

**For Production:**
1. **Frontend + Backend:** Vercel (automatic HTTPS, global CDN)
2. **Vanna AI:** Render (free tier with 750 hours/month)
3. **Database:** Supabase, Neon, or Railway PostgreSQL (free tiers available)

**Cost:** $0/month on free tiers! 🎉

---

## 📝 Notes

- The service uses Groq's `llama-3.3-70b-versatile` model
- SQL queries are automatically formatted with proper column quoting for PostgreSQL
- Health checks run every 30 seconds (configurable in Dockerfile)
- Automatic restart on failure (configured in deployment files)

---

## 🔒 Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Use environment variables for all secrets
3. ✅ Set specific CORS origins in production (not `*`)
4. ✅ Keep dependencies updated
5. ✅ Monitor API usage and set rate limits
6. ✅ Use HTTPS only in production

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Groq API Docs](https://console.groq.com/docs)
- [Render Deployment Guide](https://render.com/docs)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Fly.io Deployment Guide](https://fly.io/docs/)

---

## 🤝 Support

If you encounter issues:
1. Check the service logs on your deployment platform
2. Verify all environment variables are set correctly
3. Test the `/health` endpoint
4. Check database connectivity

---

**Happy Deploying! 🚀**
