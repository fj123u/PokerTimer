@echo off
title PokerTimer
echo ========================================
echo        PokerTimer - Demarrage
echo ========================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Installation des dependances...
    npm install
    echo.
)

echo Lancement de l'application...
echo L'application s'ouvre sur http://localhost:5173
echo.
start http://localhost:5173
npm run dev
