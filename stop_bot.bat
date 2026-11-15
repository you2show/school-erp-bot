@echo off
title Stop School ERP Bot
echo ====================================================
echo        Stopping School ERP Telegram Bot...
echo ====================================================
powershell -NoProfile -Command "$dir = (Get-Item '%~dp0').FullName.TrimEnd('\'); Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -like '*service_runner.bat*' -and $_.CommandLine -like ('*' + $dir + '*')) -or ($_.CommandLine -like ('*' + $dir + '\index.js*')) -or ($_.CommandLine -like '*school-erp-bot\index.js*') -or ($_.CommandLine -like '*telegram-school-report-bot\index.js*') } | ForEach-Object { Write-Host 'Stopping Process:' $_.ProcessId $_.Name; Stop-Process -Id $_.ProcessId -Force }"
echo.
echo School ERP Bot has been stopped.
echo ====================================================
pause
