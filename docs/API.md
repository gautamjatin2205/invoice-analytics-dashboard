# API Documentation

## Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication
Currently, no authentication is required. For production, implement JWT or API key authentication.

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the API server is running.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T10:30:00.000Z"
}
```

---

### 2. Get Dashboard Statistics

**GET** `/api/stats`

Returns overview metrics for dashboard cards.

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

**Fields**:
- `totalSpend`: Total YTD spending amount
- `totalSpendChange`: Percentage change from last period
- `totalInvoices`: Count of processed invoices
- `totalInvoicesChange`: Percentage change in invoice count
- `documentsUploaded`: Total documents uploaded
- `documentsUploadedChange`: Percentage change in uploads
- `averageInvoiceValue`: Mean invoice amount
- `averageInvoiceValueChange`: Percentage change in average

---

### 3. Get Invoice Trends

**GET** `/api/invoice-trends`

Returns monthly invoice counts and spending totals for trend chart.

**Response**:
```json
[
  {
    "month": "2025-01",
    "invoiceCount": 12,
    "totalSpend": 3245.50
  },
  {
    "month": "2025-02",
    "invoiceCount": 15,
    "totalSpend": 4123.75
  }
]
```

**Fields**:
- `month`: Year-month in YYYY-MM format
- `invoiceCount`: Number of invoices in that month
- `totalSpend`: Total spending for that month

---

### 4. Get Top 10 Vendors

**GET** `/api/vendors/top10`

Returns top 10 vendors by total spending.

**Response**:
```json
[
  {
    "vendorName": "AcmeCorp",
    "totalSpend": 15234.50
  },
  {
    "vendorName": "GlobalSupply",
    "totalSpend": 12456.00
  }
]
```

**Fields**:
- `vendorName`: Name of the vendor
- `totalSpend`: Total amount spent with this vendor

---

### 5. Get Category Spending

**GET** `/api/category-spend`

Returns spending grouped by category (Operations, Marketing, Facilities).

**Response**:
```json
[
  {
    "category": "Operations",
    "total": 8500.00
  },
  {
    "category": "Marketing",
    "total": 2250.00
  },
  {
    "category": "Facilities",
    "total": 1000.00
  }
]
```

**Fields**:
- `category`: Spending category name
- `total`: Total spending in this category

---

### 6. Get Cash Outflow Forecast

**GET** `/api/cash-outflow`

Returns expected cash outflow grouped by due date ranges.

**Response**:
```json
[
  {
    "range": "0-7 days",
    "amount": 4567.00
  },
  {
    "range": "8-30 days",
    "amount": 8910.00
  },
  {
    "range": "31-60 days",
    "amount": 5432.00
  },
  {
    "range": "60+ days",
    "amount": 2345.00
  }
]
```

**Fields**:
- `range`: Due date range
- `amount`: Total amount due in this range

---

### 7. Get Invoices (Paginated)

**GET** `/api/invoices`

Returns a paginated list of invoices with optional filtering and sorting.

**Query Parameters**:
- `search` (optional): Search in invoice ID or vendor name
- `status` (optional): Filter by document status (`pending`, `processed`, `validated`)
- `sortBy` (optional): Field to sort by (default: `invoiceDate`)
- `order` (optional): Sort order `asc` or `desc` (default: `desc`)
- `page` (optional): Page number (default: `1`)
- `limit` (optional): Results per page (default: `50`)

**Example Request**:
```
GET /api/invoices?search=Musterfirma&status=processed&page=1&limit=20&sortBy=invoiceDate&order=desc
```

**Response**:
```json
{
  "invoices": [
    {
      "id": "abc-123",
      "invoiceId": "INV-2025-001",
      "invoiceDate": "2025-11-04T00:00:00.000Z",
      "vendorName": "Musterfirma Müller",
      "invoiceTotal": 358.79,
      "status": "processed",
      "documentId": "doc-456"
    }
  ],
  "pagination": {
    "total": 64,
    "page": 1,
    "limit": 20,
    "totalPages": 4
  }
}
```

**Fields**:
- `invoices`: Array of invoice objects
  - `id`: Invoice record ID
  - `invoiceId`: Invoice number from document
  - `invoiceDate`: Invoice date
  - `vendorName`: Vendor name
  - `invoiceTotal`: Total invoice amount (absolute value)
  - `status`: Document processing status
  - `documentId`: Parent document ID
- `pagination`: Pagination metadata
  - `total`: Total number of invoices
  - `page`: Current page number
  - `limit`: Results per page
  - `totalPages`: Total number of pages

---

### 8. Chat with Data

**POST** `/api/chat-with-data`

Process natural language queries and return SQL + results.

**Request Body**:
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response**:
```json
{
  "sql": "SELECT SUM(ABS(invoice_total)) as total FROM invoices WHERE invoice_date >= NOW() - INTERVAL '90 days';",
  "results": [
    {
      "total": 12679.25
    }
  ],
  "explanation": "Generated and executed query for: What's the total spend in the last 90 days?"
}
```

**Fields**:
- `sql`: Generated SQL query
- `results`: Array of result objects
- `explanation`: Human-readable explanation

**Example Queries**:
- "List top 5 vendors by spend"
- "Show all invoices from October 2025"
- "What is the average invoice value?"
- "How many processed invoices do we have?"
- "Show overdue payments"

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request**:
```json
{
  "error": "Query is required"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to fetch statistics"
}
```

---

## Rate Limiting

Currently not implemented. For production, consider implementing rate limiting per IP or API key.

---

## CORS

CORS is enabled for all origins in development. Configure appropriately for production:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## Sample cURL Commands

### Get Stats
```bash
curl http://localhost:3001/api/stats
```

### Get Invoices with Search
```bash
curl "http://localhost:3001/api/invoices?search=Musterfirma&page=1&limit=10"
```

### Chat with Data
```bash
curl -X POST http://localhost:3001/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "List top 5 vendors by spend"}'
```

---

## Database Schema Reference

See `apps/api/prisma/schema.prisma` for the complete database schema.

### Key Relationships:
- `Document` → `Invoice` (1:1)
- `Document` → `Vendor` (1:1)
- `Document` → `Customer` (1:1)
- `Document` → `Payment` (1:1)
- `Document` → `LineItem` (1:many)

---

## Next Steps

1. Implement authentication (JWT, API keys)
2. Add rate limiting
3. Implement caching (Redis)
4. Add request validation (Zod schemas)
5. Implement logging (Winston, Pino)
6. Add metrics and monitoring
7. Implement WebSocket for real-time updates
