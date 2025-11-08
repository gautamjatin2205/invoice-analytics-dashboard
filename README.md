# Invoice Analytics Dashboard

A production-grade full-stack web application featuring an interactive analytics dashboard and AI-powered natural language data querying.

## 🎯 Features

- **Interactive Analytics Dashboard**: Real-time metrics, charts, and data visualization
- **Chat with Data**: Natural language queries powered by Vanna AI + Groq LLM
- **RESTful API**: Comprehensive backend with 7+ endpoints
- **PostgreSQL Database**: Normalized schema with proper relationships
- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma, Express

## 📁 Project Structure

```
invoice-analytics/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utilities and API client
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   └── api/                    # Express backend
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   └── seed.ts        # Data seeding script
│       ├── src/
│       │   └── index.ts       # API server
│       ├── package.json
│       └── tsconfig.json
│
├── services/
│   └── vanna/                  # Vanna AI service
│       ├── main.py            # FastAPI server
│       ├── requirements.txt
│       └── .env.example
│
├── data/
│   └── Analytics_Test_Data.json  # Source data
│
├── package.json               # Root package.json
├── turbo.json                 # Turborepo configuration
└── README.md                  # This file
```

## 🏗️ Database Schema

### Entity Relationship Overview

```
organizations (1) ──< (M) departments
organizations (1) ──< (M) users
organizations (1) ──< (M) documents

departments (1) ──< (M) documents

users (1) ──< (M) documents [as uploadedBy]
users (1) ──< (M) documents [as assignedTo]

documents (1) ─── (1) invoices
documents (1) ─── (1) vendors
documents (1) ─── (1) customers
documents (1) ─── (1) payments
documents (1) ──< (M) line_items
```

### Key Tables

- **organizations**: Company/tenant data
- **departments**: Department within organizations
- **users**: Users who upload/validate documents
- **documents**: Core document metadata
- **invoices**: Invoice-specific data (amounts, dates)
- **vendors**: Vendor information
- **customers**: Customer information
- **payments**: Payment terms and details
- **line_items**: Individual line items with categories

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Python >= 3.9 (for Vanna AI service)
- npm >= 9.0.0

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd invoice-analytics
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### 3. Set Up PostgreSQL Database

```bash
# Create database
createdb invoice_analytics

# Or using psql
psql -U postgres
CREATE DATABASE invoice_analytics;
\q
```

### 4. Configure Environment Variables

**Backend (`apps/api/.env`)**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/invoice_analytics?schema=public"
VANNA_API_BASE_URL="http://localhost:8000"
PORT=3001
```

**Frontend (`apps/web/.env.local`)**:
```env
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Vanna AI Service (`services/vanna/.env`)**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/invoice_analytics
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

> **Note**: Get your Groq API key from [https://console.groq.com/](https://console.groq.com/)

### 5. Initialize Database

```bash
# Generate Prisma client
cd apps/api
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with test data
npm run db:seed
```

This will import all data from `Analytics_Test_Data.json` into your PostgreSQL database.

### 6. Start Vanna AI Service

```bash
cd services/vanna

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start service
python main.py
```

The Vanna AI service will run on `http://localhost:8000`

### 7. Start Development Servers

```bash
# From project root, start all services
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📡 API Endpoints

### Overview Cards

**GET** `/api/stats`
- Returns: Total spend, invoices count, documents uploaded, average invoice value

**Response**:
```json
{
  "totalSpend": 12679.25,
  "totalSpendChange": 8.2,
  "totalInvoices": 64,
  "totalInvoicesChange": 6.0,
  "documentsUploaded": 17,
  "documentsUploadedChange": -14.0,
  "averageInvoiceValue": 2455.00,
  "averageInvoiceValueChange": 12.5
}
```

### Charts Data

**GET** `/api/invoice-trends`
- Returns: Monthly invoice count and total spend

**GET** `/api/vendors/top10`
- Returns: Top 10 vendors by spend

**GET** `/api/category-spend`
- Returns: Spending grouped by category (Operations, Marketing, Facilities)

**GET** `/api/cash-outflow`
- Returns: Expected cash outflow by date ranges

### Invoices

**GET** `/api/invoices`
- Query params: `search`, `status`, `sortBy`, `order`, `page`, `limit`
- Returns: Paginated list of invoices with vendor info

**Example**:
```bash
GET /api/invoices?search=Musterfirma&page=1&limit=20
```

### Chat with Data

**POST** `/api/chat-with-data`
- Body: `{ "query": "What's the total spend in the last 90 days?" }`
- Returns: Generated SQL, results, and explanation

**Example Request**:
```json
{
  "query": "List top 5 vendors by spend"
}
```

**Example Response**:
```json
{
  "sql": "SELECT v.vendor_name, SUM(ABS(i.invoice_total)) as total_spend FROM vendors v JOIN documents d ON v.document_id = d.id JOIN invoices i ON i.document_id = d.id GROUP BY v.vendor_name ORDER BY total_spend DESC LIMIT 5;",
  "results": [
    { "vendor_name": "AcmeCorp", "total_spend": 15234.50 },
    { "vendor_name": "GlobalSupply", "total_spend": 12456.00 }
  ],
  "explanation": "Generated and executed query for: List top 5 vendors by spend"
}
```

## 🎨 UI Components

The dashboard includes:

### Overview Cards
- Total Spend (YTD) with % change
- Total Invoices Processed with % change  
- Documents Uploaded with % change
- Average Invoice Value with % change

### Charts
- **Line Chart**: Invoice Volume + Value Trend (12 months)
- **Horizontal Bar Chart**: Spend by Vendor (Top 10)
- **Pie Chart**: Spend by Category
- **Bar Chart**: Cash Outflow Forecast (by due date ranges)

### Invoices Table
- Searchable and sortable
- Columns: Vendor, Date, Invoice Number, Amount, Status
- Pagination support

### Chat Interface
- Natural language input
- Displays generated SQL
- Results in table format
- Error handling

## 🐳 Deployment

### Frontend + Backend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:

```env
# Root project
DATABASE_URL=postgresql://...
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com

# App: web
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. Deploy!

### Vanna AI Service (Render/Railway/Fly.io)

**Using Render:**

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`
   - Environment: `services/vanna`
4. Add environment variables:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `PORT=8000`

**Using Docker:**

```dockerfile
# services/vanna/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["python", "main.py"]
```

```bash
docker build -t vanna-service ./services/vanna
docker run -p 8000:8000 --env-file ./services/vanna/.env vanna-service
```

### PostgreSQL (Vercel Postgres / Supabase / Railway)

Use any managed PostgreSQL service:

1. Create database instance
2. Get connection string
3. Update `DATABASE_URL` in both backend and Vanna service
4. Run migrations:

```bash
npx prisma db push
npx prisma db seed
```

## 🧪 Testing

### Test Backend API

```bash
# Check health
curl http://localhost:3001/health

# Get stats
curl http://localhost:3001/api/stats

# Get invoices
curl http://localhost:3001/api/invoices?page=1&limit=10
```

### Test Vanna AI Service

```bash
# Check health
curl http://localhost:8000/health

# Query data
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the total spend?"}'
```

## 📊 Data Model

The `Analytics_Test_Data.json` contains nested invoice data that is normalized into:

- **Documents**: File metadata, status, dates
- **Invoices**: Invoice ID, dates, totals, taxes
- **Vendors**: Name, address, tax ID
- **Customers**: Name, address
- **Payments**: Due dates, payment terms, bank details
- **Line Items**: Description, quantity, prices, category

Categories are auto-assigned based on description keywords:
- "marketing"/"advertising" → Marketing
- "facility"/"rent" → Facilities
- Default → Operations

## 🔒 Environment Variables Reference

### Required

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Backend + Vanna | PostgreSQL connection string |
| `GROQ_API_KEY` | Vanna | Groq LLM API key |

### Optional

| Variable | Location | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Backend | 3001 | Backend server port |
| `PORT` | Vanna | 8000 | Vanna service port |
| `VANNA_API_BASE_URL` | Backend | http://localhost:8000 | Vanna service URL |
| `NEXT_PUBLIC_API_BASE` | Frontend | /api | API base path |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: This README
- API Reference: See API Endpoints section above

## ✅ Checklist

- [x] Monorepo with Turborepo
- [x] PostgreSQL database with normalized schema
- [x] Prisma ORM with seed script
- [x] Express.js backend with 7 API endpoints
- [x] Next.js 14 frontend with App Router
- [x] Vanna AI service with Groq integration
- [x] Comprehensive documentation
- [x] Environment configuration examples
- [x] Deployment instructions
- [x] Production-ready CORS and health checks
- [x] Multi-platform deployment configs (Render, Railway, Fly.io, Docker)

## ☁️ Deployment

### Quick Deploy

**Frontend + Backend:** Deploy to Vercel  
**Vanna AI Service:** Deploy to Render/Railway/Fly.io/Digital Ocean

See detailed guides:
- **[Vercel Deployment (Frontend + Backend)](./DEPLOYMENT_VERCEL.md)**
- **[Vanna AI Deployment (Multiple Options)](./services/vanna/DEPLOYMENT.md)**

### Deployment Architecture

```
User → Vercel (Next.js + Express API) → Cloud PostgreSQL
                        ↓
                  Render/Railway
                  (Vanna AI + Groq)
```

### Environment Variables Needed

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_BASE=https://your-app.vercel.app/api
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
```

**Vanna AI (.env):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
GROQ_API_KEY=gsk_your_api_key
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Cost Estimate

**Free Tier Available:**
- ✅ Vercel: Free (100GB bandwidth/month)
- ✅ Render: Free (750 hours/month)
- ✅ Groq API: Generous free tier
- ✅ Supabase/Neon PostgreSQL: Free tier available

**Total Monthly Cost: $0** on free tiers! 🎉

## 🎓 Architecture

```
┌─────────────────┐
│   Browser       │
│  (Next.js App)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │
│  (Node.js)      │◄────┐
└────────┬────────┘     │
         │              │
         ▼              │
┌─────────────────┐     │
│   PostgreSQL    │     │
│   Database      │◄────┤
└─────────────────┘     │
                        │
         ┌──────────────┘
         │
         ▼
┌─────────────────┐
│  Vanna AI       │
│  (FastAPI +     │
│   Groq LLM)     │
└─────────────────┘
```

## 📞 Contact

For questions or feedback, please open an issue on GitHub.
