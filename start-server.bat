@echo off
title KoraLegend Live Server
cd /d "c:\Users\EssaM\Documents\GitHub\koralegend"
echo ==========================================
echo   KoraLegend Live Server
echo   http://localhost:3001
echo ==========================================
echo.
node server.js --port=3001
pause
