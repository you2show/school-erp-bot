@echo off
title School ERP Bot Status
echo ====================================================
echo        Checking School ERP Bot Status...
echo ====================================================
powershell -NoProfile -Command "$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*telegram-school-report-bot\index.js*' }; if ($procs) { Write-Host 'Status: RUNNING (ONLINE)' -ForegroundColor Green; $procs | Select-Object ProcessId, CommandLine | Format-Table -AutoSize } else { Write-Host 'Status: STOPPED (OFFLINE)' -ForegroundColor Red }"
echo.
echo Recent Service Logs:
echo ----------------------------------------------------
if exist bot_service.log (
    powershell -NoProfile -Command "Get-Content bot_service.log -Tail 15"
) else (
    echo (No log file found yet)
)
echo ====================================================
pause
