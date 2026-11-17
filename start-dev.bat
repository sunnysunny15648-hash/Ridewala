@echo off
title RideWala Master Launcher
set ROOT=%~dp0
cd /d "%ROOT%"

echo ========================================================
echo           Starting RideWala Platform Services
echo ========================================================
echo.

echo [1/4] Starting RideWala Backend API (Port 5000)...
start "RideWala [1/4] Backend Server (5000)" /D "%ROOT%backend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [2/4] Starting RideWala Customer Web App (Port 5173)...
start "RideWala [2/4] Customer App (5173)" /D "%ROOT%frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo [3/4] Starting RideWala Rider Captain Portal (Port 5174)...
start "RideWala [3/4] Rider Captain (5174)" /D "%ROOT%rider-app" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo [4/4] Starting RideWala Admin Dashboard (Port 5175)...
start "RideWala [4/4] Admin Dashboard (5175)" /D "%ROOT%admin-dashboard" cmd /k "npm run dev"

echo.
echo ========================================================
echo All RideWala services are booting!
echo.
echo 🌐 Backend API:      http://localhost:5000
echo 👤 Customer Portal:  http://localhost:5173
echo 🏍️ Rider Captain:    http://localhost:5174
echo 🛡️ Admin Dashboard:  http://localhost:5175
echo.
echo Demo Accounts Ready for Testing:
echo - Customer: customer@demo.com  / Demo@123
echo - Rider:    captain@demo.com   / Demo@123
echo - Admin:    admin@ridewala.in  / Admin@12345
echo ========================================================
echo.
echo Leave this window open, or close it when done.
pause
