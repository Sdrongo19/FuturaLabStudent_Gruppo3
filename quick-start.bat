@echo off
echo ===========================================
echo  FuturaLab - Avvio Rapido
echo ===========================================
echo.

:: Imposta la codifica UTF-8
chcp 65001 > nul

:: Verifica se è la prima volta
if not exist "%USERPROFILE%\maven\bin\mvn.cmd" (
    echo Prima esecuzione rilevata. Avvio configurazione iniziale...
    call setup-first-time.bat
    if errorlevel 1 exit /b 1
    echo.
)

if not exist "%USERPROFILE%\ngrok\ngrok.exe" (
    echo Ngrok non trovato. Avvio configurazione iniziale...
    call setup-first-time.bat
    if errorlevel 1 exit /b 1
    echo.
)

:: Avvia il backend
echo Avvio del backend con ngrok...
call start-backend.bat 