@echo off
echo ===========================================
echo  Configurazione Iniziale FuturaLab
echo ===========================================
echo.

:: Imposta la codifica UTF-8
chcp 65001 > nul

echo Questo script configurerà automaticamente l'ambiente per FuturaLab.
echo.

:: Installa le dipendenze
echo Installazione e configurazione automatica delle dipendenze...
call install-dependencies.bat
if errorlevel 1 (
    echo Errore durante l'installazione delle dipendenze.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo  Test della configurazione
echo ===========================================
echo.

:: Test Maven
echo Test Maven...
mvn --version
if errorlevel 1 (
    echo ERRORE: Maven non funziona correttamente
    pause
    exit /b 1
)

echo.
echo Test Ngrok...
ngrok version
if errorlevel 1 (
    echo ERRORE: Ngrok non funziona correttamente
    pause
    exit /b 1
)

echo.
echo Verifica autenticazione Ngrok...
ngrok config check >nul 2>&1
if errorlevel 1 (
    echo ATTENZIONE: Ngrok potrebbe non essere configurato correttamente
) else (
    echo ✓ Ngrok autenticato correttamente
)

echo.
echo ===========================================
echo  Configurazione completata!
echo ===========================================
echo.
echo Il tuo ambiente è ora configurato correttamente.
echo.
echo Per avviare il backend con ngrok, esegui:
echo start-backend.bat
echo.
echo Il backend sarà disponibile su:
echo - Locale: http://localhost:8080
echo - Ngrok: https://supposedly-intent-gannet.ngrok-free.app
echo.
echo Nota: Assicurati che MySQL sia in esecuzione e che il database sia configurato.
echo.
pause 