@echo off
title Push School ERP Bot to GitHub
echo ====================================================
echo        Push School ERP Bot to GitHub
echo ====================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/school-erp-bot.git): "
if "%REPO_URL%"=="" (
    echo No repository URL provided. Aborting.
    pause
    exit /b
)

"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin %REPO_URL%
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
echo ====================================================
echo Done! Now connect your GitHub repo to Render or Koyeb.
echo ====================================================
pause
