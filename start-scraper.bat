@echo off
echo ========================================
echo   KoraLegend Auto-Scraper
echo   Updating every 1 minute
echo ========================================
echo.
echo Starting scraper in daemon mode...
echo Press Ctrl+C to stop
echo.
node scraper.js --daemon --interval=1
