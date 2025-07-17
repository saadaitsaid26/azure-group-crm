# Docker Configuration Verification Script
# Run this to verify Docker setup without starting services

Write-Host "=== Docker Configuration Verification ===" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check Docker installation
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "OK $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR Docker is not installed or not in PATH" -ForegroundColor Red
    $errors++
}

# Check Docker Compose
Write-Host ""
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "OK $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR Docker Compose is not installed" -ForegroundColor Red
    $errors++
}

# Check if Docker is running
Write-Host ""
Write-Host "Checking if Docker daemon is running..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "ERROR Docker daemon is not running" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "ERROR Cannot connect to Docker daemon" -ForegroundColor Red
    $errors++
}

# Validate docker-compose.yml
Write-Host ""
Write-Host "Validating docker-compose.yml..." -ForegroundColor Yellow
try {
    docker-compose config > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK docker-compose.yml is valid" -ForegroundColor Green
    } else {
        Write-Host "ERROR docker-compose.yml has errors" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "ERROR Failed to validate docker-compose.yml" -ForegroundColor Red
    $errors++
}

# Check environment files
Write-Host ""
Write-Host "Checking environment files..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "OK .env exists" -ForegroundColor Green
} else {
    Write-Host "WARN .env not found (will be created)" -ForegroundColor Yellow
    $warnings++
}

if (Test-Path "api\.env") {
    Write-Host "OK api\.env exists" -ForegroundColor Green
} else {
    Write-Host "WARN api\.env not found (will be created)" -ForegroundColor Yellow
    $warnings++
}

# Check Dockerfiles
Write-Host ""
Write-Host "Checking Dockerfiles..." -ForegroundColor Yellow

if (Test-Path "api\Dockerfile") {
    Write-Host "OK api/Dockerfile exists" -ForegroundColor Green
} else {
    Write-Host "ERROR api/Dockerfile not found" -ForegroundColor Red
    $errors++
}

if (Test-Path "Dockerfile.frontend") {
    Write-Host "OK Dockerfile.frontend exists" -ForegroundColor Green
} else {
    Write-Host "ERROR Dockerfile.frontend not found" -ForegroundColor Red
    $errors++
}

# Check required files
Write-Host ""
Write-Host "Checking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "api\requirements.txt",
    "api\manage.py",
    "package.json",
    "vite.config.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "OK $file exists" -ForegroundColor Green
    } else {
        Write-Host "ERROR $file not found" -ForegroundColor Red
        $errors++
    }
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "SUCCESS All checks passed! Docker setup is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start services with: .\docker-start.ps1" -ForegroundColor White
    Write-Host "2. Or manually: docker-compose up -d" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "WARNING $warnings warning(s) found, but setup should work." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Environment files will be created automatically." -ForegroundColor White
} else {
    Write-Host "FAILED $errors error(s) and $warnings warning(s) found." -ForegroundColor Red
    Write-Host "Please fix the errors above before proceeding." -ForegroundColor Red
    exit 1
}

Write-Host ""
