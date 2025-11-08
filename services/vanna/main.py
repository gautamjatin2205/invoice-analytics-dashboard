import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import psycopg2
from typing import List, Dict, Any
import json

load_dotenv()

app = FastAPI(title="Vanna AI Service", version="1.0.0")

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PORT = int(os.getenv("PORT", 8000))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# CORS configuration - production ready
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Will use env variable or allow all
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    sql: str
    results: List[Dict[str, Any]]
    explanation: str = ""

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Vanna AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "query": "/query (POST)",
            "schema": "/schema"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms"""
    try:
        # Test database connection
        conn = get_db_connection()
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "groq_api": "configured" if GROQ_API_KEY else "not_configured"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

def get_db_connection():
    """Create a database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

def get_database_schema() -> str:
    """Get database schema information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    schema_info = []
    
    # Get all tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    
    for (table_name,) in tables:
        # Get columns for each table
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position;
        """, (table_name,))
        
        columns = cursor.fetchall()
        
        schema_info.append(f"\nTable: {table_name}")
        for col_name, data_type, nullable in columns:
            schema_info.append(f"  - {col_name}: {data_type} {'NULL' if nullable == 'YES' else 'NOT NULL'}")
    
    cursor.close()
    conn.close()
    
    return "\n".join(schema_info)

def generate_sql_with_groq(question: str, schema: str) -> str:
    """Generate SQL query using Groq LLM"""
    
    system_prompt = f"""You are an expert SQL query generator for a PostgreSQL database containing invoice and vendor data.

Database Schema:
{schema}

Important notes:
- The main tables are: documents, invoices, vendors, customers, payments, line_items
- Column names use camelCase (e.g., documentId, createdAt) - ALWAYS use double quotes around column names with mixed case
- invoices table has "documentId" as foreign key to documents
- vendors, customers, payments have "documentId" as foreign key to documents
- line_items have "documentId" as foreign key to documents
- To get invoice with vendor info, JOIN documents, invoices, and vendors on "documentId"
- Dates are in timestamp format
- Amounts may be negative (represent credits), use ABS() for totals
- Always use proper JOIN conditions
- ALWAYS wrap column names in double quotes when they contain mixed case

Example: SELECT i."documentId", i."invoiceTotal" FROM invoices i

Generate ONLY the SQL query without any explanation or formatting. The query should be ready to execute.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a SQL query for: {question}"}
            ],
            temperature=0.1,
            max_tokens=1024
        )
        
        sql_query = response.choices[0].message.content.strip()
        
        # Clean up the SQL query
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
        
        return sql_query
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate SQL: {str(e)}")

def execute_sql_query(sql: str) -> List[Dict[str, Any]]:
    """Execute SQL query and return results"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(sql)
        
        # Get column names
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        
        # Fetch results
        rows = cursor.fetchall()
        
        # Convert to list of dicts
        results = []
        for row in rows:
            result_dict = {}
            for idx, col in enumerate(columns):
                value = row[idx]
                # Handle special types
                if hasattr(value, 'isoformat'):  # datetime objects
                    value = value.isoformat()
                elif isinstance(value, (bytes, bytearray)):
                    value = str(value)
                result_dict[col] = value
            results.append(result_dict)
        
        cursor.close()
        conn.close()
        
        return results
    
    except Exception as e:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail=f"SQL execution failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "service": "Vanna AI Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def query_data(request: QueryRequest):
    """
    Process natural language query and return SQL + results
    """
    try:
        print(f"Received question: {request.question}")
        
        # Get database schema
        schema = get_database_schema()
        print(f"Got schema: {len(schema)} characters")
        
        # Generate SQL query using Groq
        sql_query = generate_sql_with_groq(request.question, schema)
        print(f"Generated SQL: {sql_query}")
        
        # Execute the query
        results = execute_sql_query(sql_query)
        print(f"Got {len(results)} results")
        
        return QueryResponse(
            sql=sql_query,
            results=results,
            explanation=f"Generated and executed query for: {request.question}"
        )
    
    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@app.get("/schema")
async def get_schema():
    """Get database schema information"""
    try:
        schema = get_database_schema()
        return {"schema": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schema: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
