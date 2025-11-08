#!/bin/bash

# Invoice Analytics Dashboard - Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Invoice Analytics Dashboard Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18.0.0. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed and accessible."
fi

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "⚠️  Python not found. Required for Vanna AI service."
else
    PYTHON_CMD=$(command -v python3 || command -v python)
    echo "✅ Python $($PYTHON_CMD --version)"
fi

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces

echo ""
echo "🔧 Setting up environment variables..."

# Backend .env
if [ ! -f "apps/api/.env" ]; then
    echo "Creating apps/api/.env from example..."
    cp apps/api/.env.example apps/api/.env
    echo "⚠️  Please update DATABASE_URL in apps/api/.env"
else
    echo "✅ apps/api/.env already exists"
fi

# Frontend .env.local
if [ ! -f "apps/web/.env.local" ]; then
    echo "Creating apps/web/.env.local..."
    cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created apps/web/.env.local"
else
    echo "✅ apps/web/.env.local already exists"
fi

# Vanna .env
if [ ! -f "services/vanna/.env" ]; then
    echo "Creating services/vanna/.env from example..."
    cp services/vanna/.env.example services/vanna/.env
    echo "⚠️  Please update DATABASE_URL and GROQ_API_KEY in services/vanna/.env"
else
    echo "✅ services/vanna/.env already exists"
fi

echo ""
echo "🗄️  Setting up database..."

# Check if DATABASE_URL is set
if grep -q "postgresql://user:password" apps/api/.env; then
    echo "⚠️  Please configure DATABASE_URL in apps/api/.env before proceeding"
    echo ""
    echo "Example DATABASE_URL:"
    echo "  postgresql://postgres:postgres@localhost:5432/invoice_analytics"
    echo ""
    read -p "Press Enter after updating DATABASE_URL, or Ctrl+C to exit..."
fi

cd apps/api

# Generate Prisma Client
echo "Generating Prisma Client..."
npm run db:generate

# Push schema to database
echo "Pushing schema to database..."
npm run db:push

# Seed database
echo "Seeding database with test data..."
npm run db:seed

cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Update environment variables if needed:"
echo "   - apps/api/.env (DATABASE_URL, VANNA_API_BASE_URL)"
echo "   - services/vanna/.env (DATABASE_URL, GROQ_API_KEY)"
echo ""
echo "2. Set up Vanna AI service:"
echo "   cd services/vanna"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   pip install -r requirements.txt"
echo "   python main.py"
echo ""
echo "3. Start the development servers:"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Vanna AI: http://localhost:8000"
echo ""
echo "📖 For more information, see README.md"
echo ""
