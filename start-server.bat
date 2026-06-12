@echo off
title KoraLegend Live Server
cd /d "%~dp0"
echo ==========================================
echo   KoraLegend Live Server
echo   http://localhost:3000
echo ==========================================
echo.
node server.js
pause
