# 🎬 Demo Video Script (3-5 minutes)

## 📋 Pre-Recording Checklist
- [ ] All services running (Frontend, Backend, Vanna AI)
- [ ] Database seeded with data
- [ ] Browser cache cleared
- [ ] Screen recording software ready
- [ ] Audio microphone tested
- [ ] Open relevant tabs:
  - Application (http://localhost:3000)
  - Code editor (optional)
  - Architecture diagram (optional)

---

## 🎥 Scene-by-Scene Script

### Scene 1: Introduction (30 seconds)
**Screen:** Show application home screen

**Script:**
> "Hello! Welcome to my Invoice Analytics Dashboard with AI-powered data querying.
>
> This is a production-grade full-stack application built with Next.js, Express, PostgreSQL, and a self-hosted Vanna AI service powered by Groq's LLM.
>
> The application has two main features: an interactive analytics dashboard and a natural language chat interface. Let me show you."

**Actions:**
- Show the landing page
- Point to the two tabs: "Dashboard" and "Chat with Data"

---

### Scene 2: Dashboard Loading (15 seconds)
**Screen:** Dashboard tab

**Script:**
> "When you first load the dashboard, it fetches real data from our PostgreSQL database containing 50 invoice documents."

**Actions:**
- Refresh the page (optional)
- Show loading state briefly
- Dashboard appears with all data

---

### Scene 3: Metric Cards (20 seconds)
**Screen:** Top section with 4 cards

**Script:**
> "At the top, we have four key metrics:
> - Total Spend Year-to-Date: €12,679 with an 8.2% increase
> - Total Invoices Processed: 64 invoices, also up 8.2%
> - Documents Uploaded: 17 this month, down 16%
> - Average Invoice Value: €2,455, up 8.2%
>
> Each card shows the trend indicator with a sparkline."

**Actions:**
- Move cursor over each card
- Point out the trend arrows and mini charts

---

### Scene 4: Line Chart (20 seconds)
**Screen:** Invoice Volume + Value Trend chart

**Script:**
> "This line chart shows the invoice volume and total spend over 12 months. You can see both metrics trending together, with a peak in October 2025 at 47 invoices and €8,679 in spending."

**Actions:**
- Hover over data points to show tooltip
- Point out the legend (Invoice Count vs Total Spend)

---

### Scene 5: Bar Charts (25 seconds)
**Screen:** Top Vendors and Categories

**Script:**
> "Here we have the Top 10 Vendors by spend. Global Supply leads with over €30,000, representing about 40% of cumulative spend.
>
> And this donut chart breaks down spending by category - Operations at $1,000, Marketing at $7,250, and Facilities at $1,000."

**Actions:**
- Point to the horizontal bar chart
- Hover over donut chart sections
- Show the color legend

---

### Scene 6: Cash Forecast & Table (20 seconds)
**Screen:** Bottom sections

**Script:**
> "The Cash Outflow Forecast shows expected payments by due date ranges, with over €35,000 due in the next 60+ days.
>
> And this table lists all invoices by vendor, showing dates and net values. It's sortable and searchable."

**Actions:**
- Point to bar chart
- Scroll through the data table
- (Optional) Show search/sort functionality

---

### Scene 7: Switch to Chat (5 seconds)
**Screen:** Click "Chat with Data" tab

**Script:**
> "Now, let me show you the AI-powered chat feature."

**Actions:**
- Click the "Chat with Data" tab
- Show the empty chat interface

---

### Scene 8: First Chat Query (30 seconds)
**Screen:** Chat interface

**Script:**
> "I can ask questions in natural language. Let me try: 'Show me all invoices'"

**Actions:**
- Type: "Show me all invoices"
- Press Send
- Wait for AI response (show loading animation)
- Response appears with:
  - Summary: "I found 49 results for your query"
  - Generated SQL (highlighted)
  - Results table with all invoices

**Script (continue):**
> "Amazing! The AI generated the SQL query, executed it on our database, and returned 49 invoices in a formatted table. You can see the generated SQL here with proper syntax highlighting."

**Actions:**
- Point to the SQL code block
- Scroll through the results table

---

### Scene 9: Second Query (30 seconds)
**Screen:** Chat interface

**Script:**
> "Let me ask another question: 'List top 5 vendors by amount'"

**Actions:**
- Type: "List top 5 vendors by amount"
- Press Send
- Wait for response
- Response shows:
  - New SQL with GROUP BY and SUM
  - Top 5 vendors with totals

**Script (continue):**
> "The AI understood my question, generated a SQL query with GROUP BY and aggregation, and returned the top 5 vendors sorted by total spending."

**Actions:**
- Point to the SQL showing JOINs and aggregations
- Highlight the results

---

### Scene 10: Third Query (25 seconds)
**Screen:** Chat interface

**Script:**
> "One more: 'What's the total spend?'"

**Actions:**
- Type: "What's the total spend?"
- Press Send
- Response shows single result with total

**Script (continue):**
> "Perfect! The AI knows I want an aggregated sum and returns the total spend across all invoices: €6,481.58"

**Actions:**
- Show the simple query result
- Scroll up to show conversation history

---

### Scene 11: Behind the Scenes (30 seconds)
**Screen:** Can show architecture diagram or code (optional)

**Script:**
> "Here's how it works: When you ask a question, the frontend sends it to the Express backend, which forwards it to our self-hosted Vanna AI service.
>
> The Vanna AI service uses Groq's llama-3.3-70b-versatile model to generate SQL from natural language. It knows our database schema and generates proper PostgreSQL queries.
>
> The SQL is then executed on our database, and results are sent back through the chain to display in the UI.
>
> Everything is self-hosted except the Groq API, giving us full control over our data."

**Actions (optional):**
- Show architecture diagram
- Briefly show code structure
- Show environment variables

---

### Scene 12: Conclusion (20 seconds)
**Screen:** Dashboard or chat

**Script:**
> "To summarize, this application features:
> - A fully interactive analytics dashboard with real-time data
> - Five different chart types powered by Recharts
> - An AI chat interface that converts natural language to SQL
> - Self-hosted Vanna AI service with Groq LLM
> - All built with modern technologies: Next.js, Express, FastAPI, and PostgreSQL
>
> The entire stack is deployed on free tiers - Vercel for the frontend and backend, and Render for the AI service.
>
> Thank you for watching!"

**Actions:**
- Show final overview of the app
- Maybe show both tabs quickly
- End recording

---

## 🎯 Recording Tips

### Before Recording:
1. ✅ Test everything works
2. ✅ Clear browser cache
3. ✅ Close unnecessary tabs
4. ✅ Hide bookmarks bar
5. ✅ Use incognito mode (no extensions)
6. ✅ Set zoom to 100%
7. ✅ Practice run once

### During Recording:
1. ✅ Speak clearly and slowly
2. ✅ Pause between scenes
3. ✅ Move cursor deliberately
4. ✅ Wait for animations to complete
5. ✅ Don't rush through features
6. ✅ Show enthusiasm!

### After Recording:
1. ✅ Review the video
2. ✅ Check audio quality
3. ✅ Verify all features shown
4. ✅ Add timestamps (optional)
5. ✅ Upload to YouTube/Loom
6. ✅ Set to public/unlisted
7. ✅ Copy link for submission

---

## 📊 Timing Breakdown

| Scene | Duration | Cumulative |
|-------|----------|------------|
| Introduction | 30s | 0:30 |
| Dashboard Loading | 15s | 0:45 |
| Metric Cards | 20s | 1:05 |
| Line Chart | 20s | 1:25 |
| Bar Charts | 25s | 1:50 |
| Forecast & Table | 20s | 2:10 |
| Switch to Chat | 5s | 2:15 |
| First Query | 30s | 2:45 |
| Second Query | 30s | 3:15 |
| Third Query | 25s | 3:40 |
| Behind Scenes | 30s | 4:10 |
| Conclusion | 20s | 4:30 |

**Total:** ~4.5 minutes ✅ (Target: 3-5 minutes)

---

## 🎤 Sample Queries for Chat Demo

Choose 3-4 of these for your video:

### Basic Queries:
- "Show me all invoices"
- "List all vendors"
- "How many invoices are there?"

### Aggregation Queries:
- "What's the total spend?"
- "List top 5 vendors by amount"
- "Show spending by category"

### Filtered Queries:
- "Show invoices over $1000"
- "List invoices from last month"
- "Find invoices from Global Supply"

### Complex Queries:
- "What's the average invoice value by vendor?"
- "Show me vendors with more than 3 invoices"
- "Which category has the highest spending?"

---

## 📹 Recommended Recording Software

### Free Options:
- **OBS Studio** (Desktop - Best quality)
- **Loom** (Browser - Easy to use)
- **Windows Game Bar** (Win + G)
- **Mac QuickTime** (Built-in)

### Settings:
- Resolution: 1920x1080 (1080p)
- Frame Rate: 30 FPS
- Audio: 44.1 kHz
- Format: MP4

---

## 🌐 Upload Platforms

### YouTube (Recommended):
1. Upload as "Unlisted"
2. Title: "Invoice Analytics Dashboard - Demo"
3. Description: Include GitHub link
4. Copy shareable link

### Loom:
1. Record directly in browser
2. Auto-uploads when done
3. Get shareable link
4. No editing needed

### Google Drive:
1. Upload MP4
2. Set sharing to "Anyone with link"
3. Copy link

---

## ✅ Video Checklist

Before submitting:
- [ ] Video is 3-5 minutes long
- [ ] Audio is clear
- [ ] Shows dashboard loading
- [ ] Demonstrates all 5 charts
- [ ] Shows data table
- [ ] Demonstrates chat feature (3+ queries)
- [ ] Shows SQL generation
- [ ] Shows results tables
- [ ] Explains workflow briefly
- [ ] Has conclusion
- [ ] Uploaded and link copied
- [ ] Link works when tested
- [ ] Video is public/unlisted (not private)

---

## 📝 Video Description Template

```
Invoice Analytics Dashboard - AI-Powered Data Querying

A production-grade full-stack application featuring:
✅ Interactive analytics dashboard with real-time data
✅ AI-powered natural language to SQL conversion
✅ Self-hosted Vanna AI service with Groq LLM
✅ PostgreSQL database with 50 invoice documents
✅ Built with Next.js, Express, FastAPI, and TypeScript

GitHub: [YOUR_REPO_LINK]
Live Demo: [YOUR_VERCEL_URL]

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Recharts
- Backend: Express.js, Prisma ORM
- AI Layer: Python FastAPI + Groq API
- Database: PostgreSQL
- Deployment: Vercel + Render

Features Demonstrated:
⏱️ 0:00 - Introduction
⏱️ 0:30 - Dashboard Metrics
⏱️ 1:05 - Interactive Charts
⏱️ 2:15 - AI Chat Demo
⏱️ 3:40 - Architecture Overview
⏱️ 4:10 - Conclusion
```

---

**Good luck with your recording! 🎥🚀**
