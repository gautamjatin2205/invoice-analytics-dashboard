import os
from dotenv import load_dotenv
from groq import Groq
import psycopg2

load_dotenv()

# Test 1: Check environment variables
print("Testing environment variables...")
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"DATABASE_URL exists: {DATABASE_URL is not None}")
print(f"GROQ_API_KEY exists: {GROQ_API_KEY is not None}")

# Test 2: Test database connection
print("\nTesting database connection...")
try:
    conn = psycopg2.connect(DATABASE_URL)
    print("✓ Database connection successful")
    conn.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")

# Test 3: Test Groq client
print("\nTesting Groq client...")
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("✓ Groq client initialized")
    
    # Test API call
    response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[
            {"role": "user", "content": "Say hello"}
        ],
        temperature=0.1,
        max_tokens=50
    )
    print(f"✓ Groq API call successful: {response.choices[0].message.content}")
except Exception as e:
    print(f"✗ Groq test failed: {e}")

print("\nAll tests completed!")
