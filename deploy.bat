@echo off
REM TravelNest Deployment Script for Windows
REM This script automates the deployment process

echo ========================================
echo     TravelNest Deployment Script
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist .env (
    echo [INFO] Creating .env file from .env.example...
    copy .env.example .env
    echo [INFO] Please edit .env file with your configuration
    pause
    exit /b 1
)

echo [OK] .env file exists
echo.

REM Stop existing containers
echo [INFO] Stopping existing containers...
docker-compose down

REM Build images
echo [INFO] Building Docker images...
docker-compose build

REM Start containers
echo [INFO] Starting containers...
docker-compose up -d

REM Wait for services
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check services status
docker-compose ps

echo.
echo ========================================
echo     Deployment Completed!
echo ========================================
echo.
echo Access URLs:
echo   Frontend: http://localhost
echo   Backend:  http://localhost:3000
echo   Health:   http://localhost:3000/health
echo.
echo View logs:
echo   docker-compose logs -f
echo.

pause
