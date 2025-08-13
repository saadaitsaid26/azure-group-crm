# Accessibility Test Script
# Tests the dialog components for accessibility compliance

Write-Host "Testing Dialog Accessibility..." -ForegroundColor Cyan
Write-Host ""

# Check if the dev server is running
$devServerRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($devServerRunning) {
    Write-Host "[OK] Dev server is running" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Dev server is not running. Start it with 'npm run dev'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Accessibility Checklist:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open http://localhost:8080 in your browser" -ForegroundColor White
Write-Host "2. Open Chrome DevTools (F12)" -ForegroundColor White
Write-Host "3. Navigate to Contacts page" -ForegroundColor White
Write-Host "4. Click 'Add Contact' button" -ForegroundColor White
Write-Host "5. Check the Console tab - should be NO aria-hidden errors" -ForegroundColor White
Write-Host "6. Try to focus on input fields - should work smoothly" -ForegroundColor White
Write-Host "7. Press Tab to navigate between fields" -ForegroundColor White
Write-Host "8. Press Escape to close the dialog" -ForegroundColor White
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "  - No aria-hidden warnings in console" -ForegroundColor Green
Write-Host "  - All form inputs are focusable" -ForegroundColor Green
Write-Host "  - Tab navigation works correctly" -ForegroundColor Green
Write-Host "  - Dialog closes on Escape key" -ForegroundColor Green
Write-Host "  - Screen readers can access all fields" -ForegroundColor Green
Write-Host ""
Write-Host "Additional Testing:" -ForegroundColor Yellow
Write-Host "  - Test with NVDA or JAWS screen reader" -ForegroundColor White
Write-Host "  - Verify keyboard-only navigation" -ForegroundColor White
Write-Host "  - Check focus trap within dialog" -ForegroundColor White
Write-Host ""

