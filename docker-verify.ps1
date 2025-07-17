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
    Write-Host "✓ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not in PATH" -ForegroundColor Red
    $errors++
}

# Check Docker Compose
Write-Host ""
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose is not installed" -ForegroundColor Red
    $errors++
}

# Check if Docker is running
Write-Host ""
Write-Host "Checking if Docker daemon is running..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker daemon is not running" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "✗ Cannot connect to Docker daemon" -ForegroundColor Red
    $errors++
}

# Validate docker-compose.yml
Write-Host ""
Write-Host "Validating docker-compose.yml..." -ForegroundColor Yellow
try {
    docker-compose config > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ docker-compose.yml is valid" -ForegroundColor Green
    } else {
        Write-Host "✗ docker-compose.yml has errors" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "✗ Failed to validate docker-compose.yml" -ForegroundColor Red
    $errors++
}

# Check environment files
Write-Host ""
Write-Host "Checking environment files..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✓ .env exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env not found (copy from .env.example)" -ForegroundColor Yellow
    $warnings++
}

if (Test-Path "api\.env") {
    Write-Host "✓ api\.env exists" -ForegroundColor Green
} else {
    Write-Host "⚠ api\.env not found (copy from api\.env.example)" -ForegroundColor Yellow
    $warnings++
}

# Check Dockerfiles
Write-Host ""
Write-Host "Checking Dockerfiles..." -ForegroundColor Yellow

if (Test-Path "api\Dockerfile") {
    Write-Host "✓ api/Dockerfile exists" -ForegroundColor Green
} else {
    Write-Host "✗ api/Dockerfile not found" -ForegroundColor Red
    $errors++
}

if (Test-Path "Dockerfile.frontend") {
    Write-Host "✓ Dockerfile.frontend exists" -ForegroundColor Green
} else {
    Write-Host "✗ Dockerfile.frontend not found" -ForegroundColor Red
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
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $file not found" -ForegroundColor Red
        $errors++
    }
}

# Check available disk space
Write-Host ""
Write-Host "Checking disk space..." -ForegroundColor Yellow
try {
    $drive = Get-PSDrive -Name C
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeSpaceGB -gt 10) {
        Write-Host "✓ Available space: $freeSpaceGB GB" -ForegroundColor Green
    } elseif ($freeSpaceGB -gt 5) {
        Write-Host "⚠ Available space: $freeSpaceGB GB (low)" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "✗ Available space: $freeSpaceGB GB (insufficient)" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "⚠ Could not check disk space" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✓ All checks passed! Docker setup is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy environment files if needed:" -ForegroundColor White
    Write-Host "   Copy-Item .env.example .env" -ForegroundColor Gray
    Write-Host "   Copy-Item api\.env.example api\.env" -ForegroundColor Gray
    Write-Host "2. Start services:" -ForegroundColor White
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
    Write-Host "3. Or use the quick start script:" -ForegroundColor White
    Write-Host "   .\docker-start.ps1" -ForegroundColor Gray
} elseif ($errors -eq 0) {
    Write-Host "⚠ $warnings warning(s) found, but setup should work." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Cyan
    Write-Host "- Copy .env.example to .env if not done" -ForegroundColor White
    Write-Host "- Copy api\.env.example to api\.env if not done" -ForegroundColor White
} else {
    Write-Host "✗ $errors error(s) and $warnings warning(s) found." -ForegroundColor Red
    Write-Host "Please fix the errors above before proceeding." -ForegroundColor Red
    exit 1
}

Write-Host ""
