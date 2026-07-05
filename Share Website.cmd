@echo off
title Go cabs^&Taxi Kigali - Share with client
echo Starting the local website server...
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0.claude\serve.ps1" -Port 8080
timeout /t 2 /nobreak >nul
echo.
echo ============================================================
echo  Creating your public share link...
echo.
echo  Look for the line with  https://....trycloudflare.com
echo  below. Send that link to your client on WhatsApp.
echo.
echo  KEEP THIS WINDOW OPEN while the client views the site.
echo  Closing it stops the share link (the site stays on
echo  http://localhost:8080 for you).
echo ============================================================
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8080 --http-host-header localhost
pause
