@echo off
echo ================================
echo  Avvio ngrok per FuturaLab
echo ================================
echo.

REM Verifica che ngrok sia installato
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: ngrok non trovato nel PATH
    echo Installa ngrok da https://ngrok.com/download
    echo Oppure usa: choco install ngrok
    pause
    exit /b 1
)

echo Verifica della configurazione del token...
if exist "ngrok.yml" (
    for /f "tokens=2" %%a in ('findstr "authtoken:" ngrok.yml') do set NGROK_TOKEN=%%a
    if defined NGROK_TOKEN (
        echo ✅ Token trovato in ngrok.yml
        ngrok config add-authtoken %NGROK_TOKEN% >nul 2>&1
    ) else (
        echo ⚠️ Token non trovato in ngrok.yml
    )
) else (
    echo ⚠️ File ngrok.yml non trovato
)

echo.
echo Avvio di ngrok...
echo URL remoto: https://supposedly-intent-gannet.ngrok-free.app
echo Porta locale: 80
echo.
echo IMPORTANTE: Assicurati che Spring Boot sia già in esecuzione sulla porta 80
echo.

ngrok http --url=supposedly-intent-gannet.ngrok-free.app 80 