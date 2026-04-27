@echo off
set PYTHONUTF8=1
cd /d "%~dp0..\.."
python scripts\tools\generate-fun-facts.py >> "%TEMP%\ffgen-out.log" 2>> "%TEMP%\ffgen-err.log"
