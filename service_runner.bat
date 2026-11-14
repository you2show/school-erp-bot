@echo off
cd /d "%~dp0"
title School ERP Telegram Bot Service

:loop
echo [%date% %time%] Starting School ERP Bot (@SchoolERPSystemBot)... >> "bot_service.log"
node index.js >> "bot_service.log" 2>&1
echo [%date% %time%] Bot stopped with exit code %errorlevel%. Restarting in 5 seconds... >> "bot_service.log"
timeout /t 5 /nobreak >nul
goto loop
