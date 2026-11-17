# RideWala PowerShell Launcher
$root = $PSScriptRoot
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "          Starting RideWala Platform Services" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "[1/4] Starting RideWala Backend API (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root/backend'; npm run dev"
Start-Sleep -Seconds 4

Write-Host "[2/4] Starting RideWala Customer Web App (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root/frontend'; npm run dev"
Start-Sleep -Seconds 2

Write-Host "[3/4] Starting RideWala Rider Captain (Port 5174)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root/rider-app'; npm run dev -- --port 5174"
Start-Sleep -Seconds 2

Write-Host "[4/4] Starting RideWala Admin Dashboard (Port 5175)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root/admin-dashboard'; npm run dev -- --port 5175"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "All RideWala services are booting!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Backend API:      http://localhost:5000"
Write-Host "👤 Customer Portal:  http://localhost:5173"
Write-Host "🏍️ Rider Captain:    http://localhost:5174"
Write-Host "🛡️ Admin Dashboard:  http://localhost:5175"
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "Customer: customer@demo.com  / Demo@123"
Write-Host "Rider:    captain@demo.com   / Demo@123"
Write-Host "Admin:    admin@ridewala.in  / Admin@12345"
Write-Host "========================================================" -ForegroundColor Green

