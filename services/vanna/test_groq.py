import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

schema = """
Table: invoices
  - id: uuid
  - documentId: uuid
  - invoiceTotal: numeric
"""

system_prompt = f"""You are an expert SQL query generator for a PostgreSQL database containing invoice and vendor data.

Database Schema:
{schema}

Generate ONLY the SQL query without any explanation or formatting. The query should be ready to execute.
"""

try:
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Generate a SQL query for: Show me all invoices"}
        ],
        temperature=0.1,
        max_tokens=1024
    )
    
    sql_query = response.choices[0].message.content.strip()
    print("Generated SQL:")
    print(sql_query)
    
except Exception as e:
    print(f"Error: {e}")
