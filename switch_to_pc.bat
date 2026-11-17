@echo off
title Switch Bot to Local PC / Fix Connection
chcp 65001 >nul
cd /d "%~dp0"
echo ====================================================
echo    School ERP Bot - Switch to PC & Fix Connection
echo ====================================================
echo.

echo [1/3] Disconnecting any external Telegram Webhook...
node -e "
const https = require('https');
require('dotenv').config();
const token = process.env.BOT_TOKEN || '9241388793:AAHvUswsGqRHaoW8LhZlND2TaOd_I8pBko0';
const req = https.request({
  hostname: 'api.telegram.org',
  path: '/bot' + token + '/deleteWebhook',
  method: 'POST'
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const j = JSON.parse(d);
      if (j.ok) console.log('  -> Webhook successfully cleared (Polling mode enabled).');
      else console.log('  -> Notice:', j.description);
    } catch(e) { console.log('  -> Done.'); }
  });
});
req.on('error', e => console.log('  -> Notice:', e.message));
req.end();
"

echo.
echo [2/3] Stopping any old/duplicate Bot processes...
powershell -NoProfile -Command ^
  "$dir = (Get-Item '%~dp0').FullName.TrimEnd('\'); " ^
  "Get-CimInstance Win32_Process | Where-Object { " ^
  "  ($_.CommandLine -like '*service_runner.bat*' -and $_.CommandLine -like ('*' + $dir + '*')) -or " ^
  "  ($_.CommandLine -like ('*' + $dir + '\index.js*')) -or " ^
  "  ($_.CommandLine -like '*school-erp-bot\index.js*') " ^
  "} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; " ^
  "Write-Host '  -> Lingering processes cleared.'"

echo.
echo [3/3] Launching School ERP Bot in Background...
start "" wscript.exe "%~dp0launch_background.vbs"
timeout /t 3 /nobreak >nul

echo.
echo ====================================================
powershell -NoProfile -Command ^
  "$dir = (Get-Item '%~dp0').FullName.TrimEnd('\'); " ^
  "$p = Get-CimInstance Win32_Process | Where-Object { $_.Name -like '*node*' -and ($_.CommandLine -like ('*' + $dir + '\index.js*') -or $_.CommandLine -like '*index.js*') }; " ^
  "if ($p) { Write-Host '✅ Bot is now RUNNING on PC (Online & Listening)!' -ForegroundColor Green } else { Write-Host '⚠️ Please check status_bot.bat' -ForegroundColor Yellow }"
echo ====================================================
echo.
pause
