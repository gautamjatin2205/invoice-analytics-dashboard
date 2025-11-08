@echo off
echo Invoice Analytics Dashboard - Setup Script
echo ==========================================
echo.

echo Checking prerequisites...

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js >= 18.0.0
    exit /b 1
)
echo [OK] Node.js found

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)
echo [OK] npm found

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Python not found. Required for Vanna AI service.
) else (
    echo [OK] Python found
)

echo.
echo Installing dependencies...

:: Install root dependencies
call npm install

:: Install workspace dependencies
call npm install --workspaces

echo.
echo Setting up environment variables...

:: Backend .env
if not exist "apps\api\.env" (
    echo Creating apps/api/.env from example...
    copy "apps\api\.env.example" "apps\api\.env"
    echo [WARNING] Please update DATABASE_URL in apps/api/.env
) else (
    echo [OK] apps/api/.env already exists
)

:: Frontend .env.local
if not exist "apps\web\.env.local" (
    echo Creating apps/web/.env.local...
    (
        echo NEXT_PUBLIC_API_BASE=http://localhost:3001/api
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
    ) > "apps\web\.env.local"
    echo [OK] Created apps/web/.env.local
) else (
    echo [OK] apps/web/.env.local already exists
)

:: Vanna .env
if not exist "services\vanna\.env" (
    echo Creating services/vanna/.env from example...
    copy "services\vanna\.env.example" "services\vanna\.env"
    echo [WARNING] Please update DATABASE_URL and GROQ_API_KEY in services/vanna/.env
) else (
    echo [OK] services/vanna/.env already exists
)

echo.
echo Setting up database...
echo Please ensure DATABASE_URL is configured in apps/api/.env
echo.
pause

cd apps\api

:: Generate Prisma Client
echo Generating Prisma Client...
call npm run db:generate

:: Push schema to database
echo Pushing schema to database...
call npm run db:push

:: Seed database
echo Seeding database with test data...
call npm run db:seed

cd ..\..

echo.
echo Setup complete!
echo.
echo Next steps:
echo.
echo 1. Update environment variables if needed:
echo    - apps/api/.env (DATABASE_URL, VANNA_API_BASE_URL)
echo    - services/vanna/.env (DATABASE_URL, GROQ_API_KEY)
echo.
echo 2. Set up Vanna AI service:
echo    cd services\vanna
echo    python -m venv venv
echo    venv\Scripts\activate
echo    pip install -r requirements.txt
echo    python main.py
echo.
echo 3. Start the development servers:
echo    npm run dev
echo.
echo 4. Open your browser:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    Vanna AI: http://localhost:8000
echo.
echo For more information, see README.md
echo.
pause
