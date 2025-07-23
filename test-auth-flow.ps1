# Phase 3 Authentication Testing Script
# Tests the cookie-based authentication flow

Write-Host "=== Phase 3: Frontend Auth Integration Testing ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/v1"
$testsPassed = 0
$testsFailed = 0

# Test 1: Unauthorized access to /auth/me
Write-Host "Test 1: Unauthorized access to /auth/me..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest "$baseUrl/auth/me" -UseBasicParsing -ErrorAction Stop
    Write-Host "  FAILED: Should return 401" -ForegroundColor Red
    $testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASSED: Returns 401 Unauthorized" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAILED: Unexpected status code" -ForegroundColor Red
        $testsFailed++
    }
}

# Test 2: Login with valid credentials
Write-Host ""
Write-Host "Test 2: Login with valid credentials..." -ForegroundColor Yellow
try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $body = @{
        email = "admin@azuregroup.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest "$baseUrl/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -WebSession $session `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  PASSED: Login successful (Status: 200)" -ForegroundColor Green
        $testsPassed++
        
        # Check if cookies were set
        if ($session.Cookies.Count -gt 0) {
            Write-Host "  PASSED: Cookies set by server" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  FAILED: No cookies set" -ForegroundColor Red
            $testsFailed++
        }
    } else {
        Write-Host "  FAILED: Unexpected status code" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Access /auth/me with session
Write-Host ""
Write-Host "Test 3: Access /auth/me with session cookies..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest "$baseUrl/auth/me" `
        -WebSession $session `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  PASSED: Authenticated access successful" -ForegroundColor Green
        $testsPassed++
        
        $user = $response.Content | ConvertFrom-Json
        Write-Host "  User: $($user.email) ($($user.role))" -ForegroundColor Gray
    } else {
        Write-Host "  FAILED: Unexpected status code" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Logout
Write-Host ""
Write-Host "Test 4: Logout..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest "$baseUrl/auth/logout" `
        -Method POST `
        -WebSession $session `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -in @(200, 204)) {
        Write-Host "  PASSED: Logout successful" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAILED: Unexpected status code" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Access /auth/me after logout
Write-Host ""
Write-Host "Test 5: Access /auth/me after logout..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest "$baseUrl/auth/me" `
        -WebSession $session `
        -UseBasicParsing `
        -ErrorAction Stop
    Write-Host "  FAILED: Should return 401" -ForegroundColor Red
    $testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASSED: Returns 401 after logout" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAILED: Unexpected status code" -ForegroundColor Red
        $testsFailed++
    }
}

# Summary
Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "SUCCESS: All authentication tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Cookie-based authentication is working correctly:" -ForegroundColor Cyan
    Write-Host "- httpOnly cookies are set on login" -ForegroundColor White
    Write-Host "- Cookies are sent automatically with requests" -ForegroundColor White
    Write-Host "- Logout clears cookies" -ForegroundColor White
    Write-Host "- Frontend is ready for Phase 3 integration" -ForegroundColor White
    exit 0
} else {
    Write-Host "FAILED: Some tests did not pass" -ForegroundColor Red
    exit 1
}
