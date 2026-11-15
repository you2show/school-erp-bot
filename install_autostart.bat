@echo off
title Setup Auto-Startup for School ERP Bot
echo ====================================================
echo    Installing School ERP Bot to Windows Startup...
echo ====================================================

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Startup'), 'SchoolERPSystemBot.lnk')); " ^
  "$s.TargetPath = 'wscript.exe'; " ^
  "$s.Arguments = '\"' + (Get-Item '%~dp0launch_background.vbs').FullName + '\"'; " ^
  "$s.WorkingDirectory = (Get-Item '%~dp0').FullName; " ^
  "$s.WindowStyle = 7; " ^
  "$s.IconLocation = 'shell32.dll,13'; " ^
  "$s.Save(); " ^
  "Write-Host 'Auto-startup shortcut created successfully!' -ForegroundColor Green"

echo.
echo ====================================================
echo Done! School ERP Bot will start automatically when Windows boots.
echo ====================================================
pause
