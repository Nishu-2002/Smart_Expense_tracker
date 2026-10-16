@echo off
title Smart Expense Tracker Launcher
echo ======================================================================
echo           SMART EXPENSE TRACKER - LOCAL & NETWORK RUNNER
echo ======================================================================
echo.

:: Detect Local IPv4
for /f "tokens=4" %%a in ('route print^|findstr 0.0.0.0.*0.0.0.0^|findstr /v "Default"') do (
    set LOCAL_IP=%%a
)

echo [1/2] Launching Python Flask Backend on 0.0.0.0:5000...
start "Smart Expense Tracker - Backend (Flask)" cmd /k "cd /d %~dp0backend && python app.py"

echo [2/2] Launching React Vite Frontend on 0.0.0.0:5173...
start "Smart Expense Tracker - Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host"

echo.
echo ----------------------------------------------------------------------
echo  App URLs:
echo    * Local Machine:    http://localhost:5173
echo    * On Wi-Fi/Network: http://%LOCAL_IP%:5173  (Open this on your Phone / Tablet)
echo.
echo  Backend APIs:
echo    * Local API:        http://localhost:5000/api/auth/me
echo    * Network API:      http://%LOCAL_IP%:5000/api/auth/me
echo ----------------------------------------------------------------------
echo.
echo Keep both terminal windows open while using the application.
echo ======================================================================
pause
