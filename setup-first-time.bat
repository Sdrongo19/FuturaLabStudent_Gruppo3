@echo off
echo ===========================================
echo  Configurazione Iniziale FuturaLab
echo ===========================================
echo.

:: Imposta la codifica UTF-8
chcp 65001 > nul

:: Variabili di configurazione
set MAVEN_HOME=%USERPROFILE%\maven
set NGROK_DIR=%USERPROFILE%\ngrok

echo Questo script configurerà automaticamente l'ambiente per FuturaLab.
echo.

:: Aggiungi i percorsi al PATH per questa sessione se esistono
if exist "%MAVEN_HOME%\bin\mvn.cmd" set PATH=%MAVEN_HOME%\bin;%PATH%
if exist "%NGROK_DIR%\ngrok.exe" set PATH=%NGROK_DIR%;%PATH%

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
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" --version
) else (
    mvn --version
)

if errorlevel 1 (
    echo ERRORE: Maven non funziona correttamente
    pause
    exit /b 1
)

echo.
echo Test Ngrok...
if exist "%NGROK_DIR%\ngrok.exe" (
    "%NGROK_DIR%\ngrok.exe" version
) else (
    ngrok version
)

if errorlevel 1 (
    echo ERRORE: Ngrok non funziona correttamente
    pause
    exit /b 1
)

echo.
echo Verifica autenticazione Ngrok...
if exist "%NGROK_DIR%\ngrok.exe" (
    "%NGROK_DIR%\ngrok.exe" config check >nul 2>&1
) else (
    ngrok config check >nul 2>&1
)

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