@echo off
REM MagicPencil Complete Automation Workflow
REM This batch file runs SVG processing and sitemap generation

echo ============================================================
echo   MagicPencil - Complete Automation Workflow
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

echo Python detected. Starting automation workflow...
echo.

REM ============================================================
REM STEP 1: Process SVG files and generate image catalog
REM ============================================================
echo [STEP 1/2] Processing SVG files and generating image catalog...
echo.
python svg-automation.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] SVG automation failed!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] SVG processing completed successfully.
echo.

REM ============================================================
REM STEP 2: Generate sitemap.xml
REM ============================================================
echo [STEP 2/2] Generating sitemap.xml...
echo.
python generate-sitemap.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Sitemap generation failed!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   All automation tasks completed successfully!
echo ============================================================
echo.
echo Summary:
echo   - SVG files processed
echo   - Image catalog updated (js/data/image-catalog.js)
echo   - Sitemap generated (sitemap.xml)
echo.
echo NOTE: Changes are not automatically committed.
echo       Review the changes and commit manually when ready.
echo.

REM Pause to see the results
pause
