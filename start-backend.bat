@echo off
echo ================================
echo  FuturaLab Backend Startup
echo ================================
echo.

REM Verifica che ngrok sia installato
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: ngrok non trovato nel PATH
    echo Installa ngrok da https://ngrok.com/download
    pause
    exit /b 1
)

REM Verifica che Maven sia installato
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: Maven non trovato nel PATH
    echo Installa Maven da https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

echo.
echo Avvio dell'applicazione Spring Boot sulla porta 80...
echo L'applicazione sarà accessibile su:
echo - Locale: http://localhost:80
echo - Remoto: https://supposedly-intent-gannet.ngrok-free.app (dopo l'avvio di ngrok)
echo.
echo IMPORTANTE: Dopo che Spring Boot si avvia, apri un NUOVO terminale ed esegui:
echo   ngrok http --url=supposedly-intent-gannet.ngrok-free.app 80
echo.
echo.
echo Premi Ctrl+C per fermare l'applicazione
echo.

mvn spring-boot:run 