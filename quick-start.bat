@echo off
echo ===========================================
echo  FuturaLab - Avvio Rapido
echo ===========================================
echo.

:: Imposta la codifica UTF-8
chcp 65001 > nul

:: Variabili di configurazione
set MAVEN_HOME=%USERPROFILE%\maven
set NGROK_DIR=%USERPROFILE%\ngrok

:: Verifica se è la prima volta o se mancano componenti
set NEED_SETUP=0

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Prima esecuzione rilevata: Maven non trovato.
    set NEED_SETUP=1
)

if not exist "%NGROK_DIR%\ngrok.exe" (
    echo Prima esecuzione rilevata: Ngrok non trovato.
    set NEED_SETUP=1
)

:: Se è necessaria la configurazione, eseguila
if %NEED_SETUP%==1 (
    echo.
    echo Avvio configurazione iniziale...
    call setup-first-time.bat
    if errorlevel 1 (
        echo Errore durante la configurazione iniziale.
        pause
        exit /b 1
    )
    echo.
    echo Configurazione completata! Ora avvio il backend...
    echo.
)

:: Aggiungi i percorsi al PATH per questa sessione
if exist "%MAVEN_HOME%\bin\mvn.cmd" set PATH=%MAVEN_HOME%\bin;%PATH%
if exist "%NGROK_DIR%\ngrok.exe" set PATH=%NGROK_DIR%;%PATH%

:: Avvia il backend
echo Avvio del backend con ngrok...
call start-backend.bat 