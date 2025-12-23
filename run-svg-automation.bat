@echo off
REM SVG Automation Script Runner for ColorTap
REM This batch file runs the Python automation script

echo ============================================================
echo   ColorTap SVG Automation Script
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python 3.6+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo Python detected. Starting automation...
echo.

REM Run the Python script
python svg-automation.py

echo.
echo ============================================================
echo   Script execution completed
echo ============================================================
echo.

REM Pause to see the results
pause
