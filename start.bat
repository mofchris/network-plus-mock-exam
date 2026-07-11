@echo off
rem Network+ Exam Simulator - local launcher
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting local server at http://localhost:8421  (Ctrl+C to stop)
  start "" http://localhost:8421/
  python -m http.server 8421
) else (
  echo Python not found - opening index.html directly instead.
  start "" "%~dp0index.html"
)
