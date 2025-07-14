# Docker Quick Start Script for Windows PowerShell
# Run this script to set up and start the development environment

Write-Host "=== Azure Group CRM - Docker Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "✓ Docker is running" -ForegroundColor Green
    }
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Copy environment files if they don't exist
Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env from .env.example" -ForegroundColor Green
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

if (-not (Test-Path "api\.env")) {
    Copy-Item "api\.env.example" "api\.env"
    Write-Host "✓ Created api\.env from api\.env.example" -ForegroundColor Green
} else {
    Write-Host "✓ api\.env already exists" -ForegroundColor Green
}

# Build containers
Write-Host ""
Write-Host "Building Docker containers..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green

# Start containers
Write-Host ""
Write-Host "Starting containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start containers!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Containers started" -ForegroundColor Green

# Wait for services to be healthy
Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Show status
Write-Host ""
Write-Host "=== Service Status ===" -ForegroundColor Cyan
docker-compose ps

# Show access URLs
Write-Host ""
Write-Host "=== Access Information ===" -ForegroundColor Cyan
Write-Host "Frontend:          http://localhost:8080" -ForegroundColor White
Write-Host "Backend API:       http://localhost:3000" -ForegroundColor White
Write-Host "Swagger Docs:      http://localhost:3000/api/docs/" -ForegroundColor White
Write-Host "ReDoc:             http://localhost:3000/api/redoc/" -ForegroundColor White
Write-Host "Health Check:      http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "=== Test Credentials ===" -ForegroundColor Cyan
Write-Host "Admin:             admin@example.com / admin123" -ForegroundColor White
Write-Host "User:              user@example.com / user123" -ForegroundColor White
Write-Host ""
Write-Host "=== Useful Commands ===" -ForegroundColor Cyan
Write-Host "View logs:         docker-compose logs -f" -ForegroundColor White
Write-Host "Stop services:     docker-compose down" -ForegroundColor White
Write-Host "Restart service:   docker-compose restart api" -ForegroundColor White
Write-Host "Run tests:         docker-compose exec api pytest -v" -ForegroundColor White
Write-Host ""
Write-Host "✓ Setup complete! Your development environment is ready." -ForegroundColor Green
Write-Host ""

# Ask if user wants to view logs
$viewLogs = Read-Host "Would you like to view logs? (y/n)"
if ($viewLogs -eq "y" -or $viewLogs -eq "Y") {
    docker-compose logs -f
}
