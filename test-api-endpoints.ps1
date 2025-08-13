# ========================================
# Azure Group CRM - API Testing Script
# ========================================
# This script tests all major API endpoints

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "    Azure Group CRM - API Verification Tests" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$apiUrl = "$baseUrl/api/v1"

# Test counter
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " [PASS]" -ForegroundColor Green
            Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
            $script:testsPassed++
            return $response
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
            Write-Host "  Expected: $ExpectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    } catch {
        # Check if it's an expected auth error (401/403)
        if ($_.Exception.Response.StatusCode.value__ -in @(401, 403) -and $ExpectedStatus -in @(401, 403)) {
            Write-Host " [PASS] (Auth Required)" -ForegroundColor Green
            Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
            $script:testsPassed++
            return $null
        }
        
        Write-Host " [FAIL]" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host "`n1. HEALTH & DOCUMENTATION ENDPOINTS" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Test-Endpoint -Name "Health Check" -Url "$baseUrl/health"
Test-Endpoint -Name "API Schema" -Url "$baseUrl/api/schema/"
Test-Endpoint -Name "Swagger UI" -Url "$baseUrl/api/docs/"
Test-Endpoint -Name "ReDoc UI" -Url "$baseUrl/api/redoc/"

Write-Host "`n2. DASHBOARD ENDPOINTS" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Test-Endpoint -Name "Dashboard Stats" -Url "$apiUrl/dashboard/" -ExpectedStatus 401
Test-Endpoint -Name "Dashboard Summary" -Url "$apiUrl/dashboard/summary/" -ExpectedStatus 401

Write-Host "`n3. AUTHENTICATION ENDPOINTS" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow
Test-Endpoint -Name "Auth Login" -Url "$apiUrl/auth/login" -Method "POST" -ExpectedStatus 400
Test-Endpoint -Name "Auth Logout" -Url "$apiUrl/auth/logout" -Method "POST" -ExpectedStatus 401
Write-Host "  Note: Registration endpoint not implemented (admin creates users)" -ForegroundColor Gray

Write-Host "`n4. USER ENDPOINTS" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Test-Endpoint -Name "Users List" -Url "$apiUrl/users/" -ExpectedStatus 401
Test-Endpoint -Name "Current User Profile" -Url "$apiUrl/users/profile/" -ExpectedStatus 401

Write-Host "`n5. ORGANIZATIONS ENDPOINTS" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Test-Endpoint -Name "Organizations List" -Url "$apiUrl/organizations/" -ExpectedStatus 401
Test-Endpoint -Name "Organizations Search" -Url "$apiUrl/organizations/search/" -ExpectedStatus 401

Write-Host "`n6. CONTACTS ENDPOINTS" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Test-Endpoint -Name "Contacts List" -Url "$apiUrl/contacts/" -ExpectedStatus 401
Test-Endpoint -Name "Contacts Search" -Url "$apiUrl/contacts/search/" -ExpectedStatus 401

Write-Host "`n7. LEADS ENDPOINTS" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Test-Endpoint -Name "Leads List" -Url "$apiUrl/leads/" -ExpectedStatus 401
Test-Endpoint -Name "Leads Pipeline" -Url "$apiUrl/leads/pipeline/" -ExpectedStatus 401
Test-Endpoint -Name "Leads Pipeline Stats" -Url "$apiUrl/leads/pipeline-stats/" -ExpectedStatus 401

Write-Host "`n8. ACTIVITIES ENDPOINTS" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Test-Endpoint -Name "Activities List" -Url "$apiUrl/activities/" -ExpectedStatus 401
Test-Endpoint -Name "Activities Upcoming" -Url "$apiUrl/activities/upcoming/" -ExpectedStatus 401

Write-Host "`n9. PRODUCTS ENDPOINTS" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Test-Endpoint -Name "Products List" -Url "$apiUrl/products/" -ExpectedStatus 401
Test-Endpoint -Name "Products Search" -Url "$apiUrl/products/search/" -ExpectedStatus 401

Write-Host "`n10. QUOTES ENDPOINTS" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Test-Endpoint -Name "Quotes List" -Url "$apiUrl/quotes/" -ExpectedStatus 401

Write-Host "`n11. REFERENCE DATA ENDPOINTS" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Test-Endpoint -Name "Lead Sources" -Url "$apiUrl/reference/lead-sources/" -ExpectedStatus 401
Test-Endpoint -Name "Pipeline Stages" -Url "$apiUrl/reference/pipeline-stages/" -ExpectedStatus 401
Test-Endpoint -Name "Contact Types" -Url "$apiUrl/reference/contact-types/" -ExpectedStatus 401
Test-Endpoint -Name "Activity Types" -Url "$apiUrl/reference/activity-types/" -ExpectedStatus 401

Write-Host "`n12. ADMIN INTERFACE" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow
Test-Endpoint -Name "Django Admin" -Url "$baseUrl/admin/" -ExpectedStatus 200

# Summary
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "                  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "Passed:      $testsPassed" -ForegroundColor Green
Write-Host "Failed:      $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
Write-Host "==================================================" -ForegroundColor Cyan

# Next Steps
Write-Host "`nNEXT STEPS FOR INTERACTIVE TESTING:" -ForegroundColor Cyan
Write-Host "1. Open Swagger UI: http://localhost:3000/api/docs/" -ForegroundColor White
Write-Host "2. Open ReDoc UI:   http://localhost:3000/api/redoc/" -ForegroundColor White
Write-Host "3. Login to get auth token (use Swagger UI or frontend)" -ForegroundColor White
Write-Host "4. Test authenticated endpoints with token" -ForegroundColor White
Write-Host ""
Write-Host "TIP: Most endpoints require authentication (401 = needs login)" -ForegroundColor Yellow
Write-Host ""
