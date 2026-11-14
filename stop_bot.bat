@echo off
title Stop School ERP Bot
echo ====================================================
echo        Stopping School ERP Telegram Bot...
echo ====================================================
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*service_runner.bat*' -or $_.CommandLine -like '*telegram-school-report-bot\index.js*' } | ForEach-Object { Write-Host 'Stopping Process:' $_.ProcessId $_.Name; Stop-Process -Id $_.ProcessId -Force }"
echo.
echo School ERP Bot has been stopped.
echo ====================================================
pause
