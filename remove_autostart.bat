@echo off
title Remove Auto-Startup for School ERP Bot
echo ====================================================
echo   Removing School ERP Bot from Windows Startup...
echo ====================================================

powershell -NoProfile -Command ^
  "$path = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Startup'), 'SchoolERPSystemBot.lnk'); " ^
  "if (Test-Path $path) { Remove-Item $path -Force; Write-Host 'Removed from Startup successfully.' -ForegroundColor Yellow } else { Write-Host 'Shortcut was not in Startup.' -ForegroundColor Gray }"

echo.
echo ====================================================
pause
