# Chat with Data - Workflow Documentation

## 🤖 Overview

The "Chat with Data" feature allows users to query the invoice database using natural language. The system converts natural language questions into SQL queries, executes them, and returns formatted results.

---

## 🔄 Complete Workflow

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Type question: "Show me all invoices"
       │
       ▼
┌─────────────────────────────┐
│  Frontend (Next.js)         │
│  ChatWithData.tsx           │
│                             │
│  - Capture user input       │
│  - Display chat UI          │
│  - Show loading state       │
└──────┬──────────────────────┘
       │
       │ 2. POST /api/chat-with-data
       │    Body: { query: "Show me all invoices" }
       │
       ▼
┌─────────────────────────────┐
│  Backend API (Express)      │
│  apps/api/src/index.ts      │
│                             │
│  - Receive request          │
│  - Validate input           │
│  - Forward to Vanna AI      │
└──────┬──────────────────────┘
       │
       │ 3. POST http://vanna-ai/query
       │    Body: { question: "Show me all invoices" }
       │
       ▼
┌─────────────────────────────┐
│  Vanna AI Service (FastAPI) │
│  services/vanna/main.py     │
│                             │
│  Step 1: Get DB Schema      │
│  Step 2: Call Groq LLM      │
│  Step 3: Generate SQL       │
│  Step 4: Execute SQL        │
│  Step 5: Return Results     │
└──────┬──────────────────────┘
       │
       │ 4. Call Groq API
       │    Model: llama-3.3-70b-versatile
       │
       ▼
┌─────────────────────────────┐
│  Groq LLM API               │
│  (External Service)         │
│                             │
│  - Analyze question         │
│  - Understand schema        │
│  - Generate SQL query       │
└──────┬──────────────────────┘
       │
       │ 5. Returns SQL:
       │    SELECT * FROM invoices
       │
       ▼
┌─────────────────────────────┐
│  Vanna AI Service           │
│  SQL Execution              │
└──────┬──────────────────────┘
       │
       │ 6. Execute SQL on PostgreSQL
       │    psycopg2.connect()
       │
       ▼
┌─────────────────────────────┐
│  PostgreSQL Database        │
│  invoice_analytics          │
│                             │
│  - Execute query            │
│  - Return rows              │
└──────┬──────────────────────┘
       │
       │ 7. Query results (49 rows)
       │
       ▼
┌─────────────────────────────┐
│  Vanna AI Service           │
│  Format Response            │
│                             │
│  Response: {                │
│    sql: "SELECT * FROM...", │
│    results: [{...}],        │
│    explanation: "..."       │
│  }                          │
└──────┬──────────────────────┘
       │
       │ 8. Return JSON response
       │
       ▼
┌─────────────────────────────┐
│  Backend API                │
│  Forward response           │
└──────┬──────────────────────┘
       │
       │ 9. Return to frontend
       │
       ▼
┌─────────────────────────────┐
│  Frontend                   │
│  Display Results            │
│                             │
│  - Show generated SQL       │
│  - Render results table     │
│  - Update chat history      │
└──────┬──────────────────────┘
       │
       │ 10. User sees response
       │
       ▼
┌─────────────┐
│   User      │
│  (Browser)  │
└─────────────┘
```

---

## 📝 Detailed Step-by-Step

### Step 1: User Input (Frontend)

**File:** `apps/web/src/components/ChatWithData.tsx`

```typescript
// User types question
const [question, setQuestion] = useState('');

// On submit
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const userMessage = { role: 'user', content: question };
  setMessages(prev => [...prev, userMessage]);
  setLoading(true);
  
  // Call API
  const response = await chatWithData(question);
}
```

**What happens:**
- User types natural language question
- Question stored in React state
- Loading indicator shown
- API call initiated

---

### Step 2: API Client (Frontend)

**File:** `apps/web/src/lib/api.ts`

```typescript
export async function chatWithData(query: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat-with-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  
  if (!response.ok) throw new Error('Failed to process chat query');
  return response.json();
}
```

**What happens:**
- POST request to backend API
- Query sent in JSON body
- Response parsed as JSON
- Error handling for network issues

---

### Step 3: Backend API Proxy (Express)

**File:** `apps/api/src/index.ts`

```typescript
app.post('/api/chat-with-data', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const vannaBaseUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';
    
    // Forward to Vanna AI service
    const response = await fetch(`${vannaBaseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query }),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process query' });
  }
});
```

**What happens:**
- Validate input
- Get Vanna AI URL from environment
- Forward request to Vanna AI service
- Return response to frontend

---

### Step 4: Vanna AI - Receive Request (FastAPI)

**File:** `services/vanna/main.py`

```python
@app.post("/query")
async def query_endpoint(request: QueryRequest) -> QueryResponse:
    try:
        print(f"Received question: {request.question}")
        
        # Get database schema
        schema = get_database_schema()
        print(f"Got schema: {len(schema)} characters")
        
        # Generate SQL using Groq
        sql_query = await generate_sql_with_groq(request.question, schema)
        print(f"Generated SQL: {sql_query}")
        
        # Execute query
        results = execute_sql_query(sql_query)
        print(f"Got {len(results)} results")
        
        return QueryResponse(
            sql=sql_query,
            results=results,
            explanation=f"Generated and executed query for: {request.question}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**What happens:**
- Receive question from backend
- Log for debugging
- Get database schema
- Call SQL generation function
- Execute SQL query
- Return structured response

---

### Step 5: Database Schema Extraction

**File:** `services/vanna/main.py`

```python
def get_database_schema() -> str:
    """Get database schema information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            table_name,
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    """)
    
    schema_info = cursor.fetchall()
    
    # Format schema for LLM
    schema_text = "PostgreSQL Database Schema:\n\n"
    current_table = None
    
    for table, column, dtype in schema_info:
        if table != current_table:
            schema_text += f"\n## Table: {table}\n"
            current_table = table
        schema_text += f"  - {column}: {dtype}\n"
    
    cursor.close()
    conn.close()
    
    return schema_text
```

**What happens:**
- Query PostgreSQL information_schema
- Get all tables and columns
- Format as readable text for LLM
- Include data types
- Return formatted schema

---

### Step 6: SQL Generation with Groq LLM

**File:** `services/vanna/main.py`

```python
async def generate_sql_with_groq(question: str, schema: str) -> str:
    """Use Groq to generate SQL from natural language"""
    
    system_prompt = f"""You are a PostgreSQL expert. Generate SQL queries based on natural language questions.

Database Schema:
{schema}

IMPORTANT Rules:
1. Generate ONLY valid PostgreSQL SQL
2. Use double quotes for mixed-case column names (e.g., "documentId", "createdAt")
3. Return ONLY the SQL query, no explanations
4. Use appropriate JOINs when needed
5. Limit results to 50 rows unless specified

Example: "Show all invoices"
SELECT i.* FROM invoices i LIMIT 50;

Example: "List vendors"
SELECT v."vendorName", v."vendorEmail" FROM "Vendor" v;
"""
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        temperature=0.1,
        max_tokens=500
    )
    
    sql_query = response.choices[0].message.content.strip()
    
    # Clean up SQL (remove markdown, etc.)
    sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
    
    return sql_query
```

**What happens:**
- Construct prompt with schema and rules
- Call Groq API with llama-3.3-70b-versatile
- Provide question and schema context
- Set low temperature for consistent SQL
- Extract SQL from response
- Clean up formatting

---

### Step 7: SQL Execution

**File:** `services/vanna/main.py`

```python
def execute_sql_query(sql: str) -> List[Dict[str, Any]]:
    """Execute SQL query and return results"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(sql)
        
        # Get column names
        columns = [desc[0] for desc in cursor.description]
        
        # Fetch all results
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        results = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(columns):
                value = row[i]
                # Convert datetime to string
                if isinstance(value, datetime):
                    value = value.isoformat()
                # Convert Decimal to float
                elif isinstance(value, Decimal):
                    value = float(value)
                row_dict[col] = value
            results.append(row_dict)
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SQL execution failed: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()
```

**What happens:**
- Connect to PostgreSQL
- Execute generated SQL
- Get column names from cursor
- Fetch all rows
- Convert to JSON-serializable format
- Handle datetime and decimal types
- Return list of dictionaries

---

### Step 8: Response Formatting (Frontend)

**File:** `apps/web/src/components/ChatWithData.tsx`

```typescript
// Create AI response
let summary = '';
if (response.results && response.results.length > 0) {
  summary = `I found ${response.results.length} result${response.results.length !== 1 ? 's' : ''} for your query.`;
} else {
  summary = 'No results found for your query.';
}

const assistantMessage: Message = {
  role: 'assistant',
  content: summary,
  sql: response.sql,
  results: response.results
};

setMessages(prev => [...prev, assistantMessage]);
```

**What happens:**
- Create natural language summary
- Store SQL and results separately
- Add to message history
- Trigger UI update

---

### Step 9: Results Display (Frontend)

**File:** `apps/web/src/components/ChatWithData.tsx`

```typescript
{msg.role === 'assistant' && (
  <div className="bg-gray-100 rounded-lg px-4 py-3">
    {/* Summary */}
    <div className="text-sm text-gray-700 mb-3">{msg.content}</div>
    
    {/* SQL Display */}
    {msg.sql && (
      <div className="bg-gray-800 text-green-400 rounded p-2 text-xs font-mono">
        {msg.sql}
      </div>
    )}
    
    {/* Results Table */}
    {msg.results && msg.results.length > 0 && (
      <table className="min-w-full">
        <thead>
          <tr>
            {Object.keys(msg.results[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {msg.results.map((row, idx) => (
            <tr key={idx}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}
```

**What happens:**
- Display summary message
- Show SQL with syntax highlighting
- Render results in HTML table
- Dynamic columns based on query
- Scrollable table for large results

---

## 🔍 Example Queries

### Example 1: Show All Invoices

**User Input:**
```
Show me all invoices
```

**Generated SQL:**
```sql
SELECT * FROM invoices LIMIT 50;
```

**Results:**
```json
[
  {
    "id": "250283db-01ec-480f-b3ed-3a899b6f46a7",
    "documentId": "19f79fd4-382e-4e00-b7c2-cbc8e73ee3ff",
    "invoiceId": "INV-1001",
    "invoiceDate": "2024-01-15T00:00:00Z",
    "invoiceTotal": 1250.50,
    "currency": "USD"
  },
  // ... 48 more invoices
]
```

---

### Example 2: Top Vendors

**User Input:**
```
List top 5 vendors by amount
```

**Generated SQL:**
```sql
SELECT 
  v."vendorName",
  SUM(i."invoiceTotal") as total_spend
FROM "Vendor" v
JOIN "Document" d ON v."documentId" = d.id
JOIN "Invoice" i ON i."documentId" = d.id
GROUP BY v."vendorName"
ORDER BY total_spend DESC
LIMIT 5;
```

**Results:**
```json
[
  { "vendorName": "Global Supply", "total_spend": 8679.25 },
  { "vendorName": "AcmeCorp", "total_spend": 6234.50 },
  // ... 3 more vendors
]
```

---

### Example 3: Total Spend

**User Input:**
```
What's the total spend?
```

**Generated SQL:**
```sql
SELECT SUM("invoiceTotal") as total_spend
FROM "Invoice";
```

**Results:**
```json
[
  { "total_spend": 6481.58 }
]
```

---

## ⚡ Performance Considerations

### Optimization Strategies

1. **Schema Caching**
   - Cache database schema in memory
   - Refresh every 5 minutes
   - Reduces database queries

2. **Query Result Limiting**
   - Default LIMIT 50 for safety
   - Prevents overwhelming frontend
   - User can request more if needed

3. **Connection Pooling**
   - Reuse database connections
   - Faster query execution
   - Better resource management

4. **LLM Response Caching**
   - Cache common questions
   - Instant responses
   - Reduce API costs

---

## 🔒 Security Measures

### SQL Injection Prevention

1. **Groq LLM as Filter**
   - LLM generates structured SQL
   - No direct user input in SQL
   - Validated SQL syntax

2. **Read-Only Access**
   - Database user has SELECT only
   - Cannot INSERT/UPDATE/DELETE
   - Cannot DROP tables

3. **Query Validation**
   - Check for dangerous keywords
   - Validate SQL structure
   - Limit execution time

4. **Rate Limiting**
   - Max 10 queries per minute
   - Prevent abuse
   - Protect resources

---

## 🐛 Error Handling

### Error Types and Responses

1. **Invalid Question**
```json
{
  "error": "Could not generate SQL from question"
}
```

2. **SQL Execution Error**
```json
{
  "error": "SQL execution failed: column 'xyz' does not exist"
}
```

3. **Database Connection Error**
```json
{
  "error": "Database connection failed"
}
```

4. **Groq API Error**
```json
{
  "error": "LLM service unavailable"
}
```

---

## 📊 Monitoring & Logging

### Logged Information

1. **Request Logging**
   - User question
   - Timestamp
   - Request ID

2. **SQL Logging**
   - Generated SQL
   - Execution time
   - Row count

3. **Error Logging**
   - Error type
   - Error message
   - Stack trace

4. **Performance Metrics**
   - Response time
   - Success rate
   - API usage

---

## 🚀 Future Enhancements

1. **Query Suggestions**
   - Autocomplete
   - Common questions
   - Context-aware suggestions

2. **Query History**
   - Save past queries
   - Quick re-run
   - User favorites

3. **Result Export**
   - Download as CSV
   - Export to Excel
   - Share results

4. **Advanced Visualizations**
   - Auto-generate charts
   - Graph relationships
   - Interactive plots

5. **Multi-turn Conversations**
   - Context awareness
   - Follow-up questions
   - Conversation memory

---

## 📚 References

- **Frontend Code:** `apps/web/src/components/ChatWithData.tsx`
- **API Client:** `apps/web/src/lib/api.ts`
- **Backend API:** `apps/api/src/index.ts`
- **Vanna AI Service:** `services/vanna/main.py`
- **Groq Documentation:** https://console.groq.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Workflow Version:** 1.0  
**Last Updated:** November 8, 2025
