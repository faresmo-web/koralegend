@echo off
title KoraLegend Scraper Daemon
cd /d "c:\Users\EssaM\Documents\GitHub\koralegend"
echo ==========================================
echo   KoraLegend Scraper - Auto Start
echo ==========================================
echo Running... (you can minimize this window)
node scraper.js --daemon --interval=2
