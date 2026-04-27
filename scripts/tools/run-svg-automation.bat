@echo off
REM MagicPencil — Complete Automation Workflow
REM Run this file from anywhere; it auto-switches to the project root.

REM ── Switch to project root (two levels up from scripts/tools/) ──────────────
cd /d "%~dp0..\.."

echo ============================================================
echo   MagicPencil — Complete Automation Workflow
echo ============================================================
echo   Working directory: %CD%
echo.

REM ── Check Python ────────────────────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo.
    echo   Install Python 3.6+ from https://www.python.org/downloads/
    echo   Check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo Python detected. Starting automation...
echo.

REM ============================================================
REM STEP 1/4 — Process SVG files, update image catalog
REM ============================================================
echo [STEP 1/4] Processing SVG files and updating image catalog...
echo.
python scripts\tools\svg-automation.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] SVG automation failed — see messages above.
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Step 1 complete.
echo.

REM ============================================================
REM STEP 2/4 — Generate sitemap.xml
REM ============================================================
echo [STEP 2/4] Generating sitemap.xml...
echo.
python scripts\tools\generate-sitemap.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Sitemap generation failed — see messages above.
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Step 2 complete.
echo.

REM ============================================================
REM STEP 3/4 — Generate fun facts via Ollama (optional)
REM ============================================================
echo [STEP 3/4] Fun fact generation (requires Ollama running locally).
echo   Only NEW images without a cached fact will be processed.
echo   Press Enter to skip, or type Y and Enter to run.
echo.
set /p RUN_FACTS=  Generate fun facts? [y/N]:

if /i "%RUN_FACTS%"=="y" (
    echo.
    python scripts\tools\generate-fun-facts.py

    if %errorlevel% neq 0 (
        echo.
        echo [WARN] Fun fact generation encountered errors — continuing anyway.
        echo        Check that Ollama is running: ollama serve
        echo.
    ) else (
        echo.
        echo [OK] Step 3 complete.
    )
) else (
    echo   Skipped. Existing fun-facts.json will be used if present.
)
echo.

REM ============================================================
REM STEP 4/4 — Generate HTML pages (coloring + category)
REM ============================================================
echo [STEP 4/4] Generating coloring and category pages...
echo.
python scripts\tools\generate-pages.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Page generation failed — see messages above.
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Step 4 complete.
echo.

REM ── Summary ─────────────────────────────────────────────────────────────────
echo ============================================================
echo   All automation tasks completed successfully!
echo ============================================================
echo.
echo   Updated files:
echo     js/data/image-catalog.js       (SVG catalog)
echo     sitemap.xml                    (clean URLs)
echo     scripts/tools/fun-facts.json   (fun fact cache)
echo     js/data/fun-facts.js           (mobile JS bundle)
echo     color/*/*.html                 (coloring pages)
echo     categories/*.html              (category pages)
echo.
echo   Next steps:
echo     1. Open a generated page in your browser and test it
echo     2. git add . && git commit -m "Regenerate pages"
echo     3. git push  (Netlify auto-deploys)
echo.
pause
