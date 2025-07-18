@echo off
setlocal enabledelayedexpansion
echo ================================
echo  Verifica Dipendenze FuturaLab
echo ================================
echo.

set DEPENDENCIES_OK=1

REM Verifica Java
echo [1/3] Verifica Java JDK...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java JDK non trovato
    echo    Scarica e installa JDK 11+ da: https://www.oracle.com/java/technologies/downloads/
    set DEPENDENCIES_OK=0
) else (
    echo ✅ Java JDK trovato
    java -version 2>&1 | findstr "version"
)

echo.

REM Verifica Maven
echo [2/3] Verifica Apache Maven...
mvn -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Maven non trovato
    echo    Scarica e installa Maven da: https://maven.apache.org/download.cgi
    echo    Assicurati di aggiungere Maven al PATH del sistema
    set DEPENDENCIES_OK=0
) else (
    echo ✅ Maven trovato
    mvn -version 2>&1 | findstr "Apache Maven"
)

echo.

REM Verifica ngrok
echo [3/3] Verifica ngrok...
ngrok version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok non trovato
    echo.
    echo Tentativo di installazione tramite Chocolatey...
    
    REM Verifica se Chocolatey è installato
    where choco >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Chocolatey non trovato. Installazione manuale richiesta:
        echo    1. Installa Chocolatey da: https://chocolatey.org/install
        echo    2. Oppure scarica ngrok da: https://ngrok.com/download
        set DEPENDENCIES_OK=0
    ) else (
        echo ✅ Chocolatey trovato. Installazione di ngrok...
        choco install ngrok -y
        if %ERRORLEVEL% EQU 0 (
            echo ✅ ngrok installato con successo
            echo.
            echo Configurazione del token...
            if exist "ngrok.yml" (
                for /f "tokens=2" %%a in ('findstr "authtoken:" ngrok.yml') do set NGROK_TOKEN=%%a
                if defined NGROK_TOKEN (
                    ngrok config add-authtoken !NGROK_TOKEN!
                    echo ✅ Token configurato da ngrok.yml
                ) else (
                    echo ❌ Token non trovato in ngrok.yml
                    set DEPENDENCIES_OK=0
                )
            ) else (
                echo ❌ File ngrok.yml non trovato
                set DEPENDENCIES_OK=0
            )
        ) else (
            echo ❌ Errore durante l'installazione di ngrok
            set DEPENDENCIES_OK=0
        )
    )
) else (
    echo ✅ ngrok trovato
    ngrok version
    
    REM Verifica se il token è configurato
    echo Verifica configurazione token...
    if exist "ngrok.yml" (
        for /f "tokens=2" %%a in ('findstr "authtoken:" ngrok.yml') do set NGROK_TOKEN=%%a
        if defined NGROK_TOKEN (
            ngrok config add-authtoken !NGROK_TOKEN! >nul 2>&1
            echo ✅ Token aggiornato da ngrok.yml
        )
    )
)

echo.
echo ================================

if %DEPENDENCIES_OK%==1 (
    echo ✅ Tutte le dipendenze sono installate correttamente!
    echo    Puoi ora eseguire start-backend.bat per avviare il progetto
) else (
    echo ❌ Alcune dipendenze mancano. Installa i componenti mancanti e riprova.
    echo.
    echo GUIDA RAPIDA INSTALLAZIONE:
    echo.
    echo 1. Java JDK 11+:
    echo    - Scarica da: https://www.oracle.com/java/technologies/downloads/
    echo    - Installa e aggiungi JAVA_HOME alle variabili d'ambiente
    echo.
    echo 2. Apache Maven:
    echo    - Scarica da: https://maven.apache.org/download.cgi
    echo    - Estrai e aggiungi bin/ al PATH del sistema
    echo.
    echo 3. ngrok:
    echo    - Scarica da: https://ngrok.com/download
    echo    - Copia l'eseguibile in una cartella nel PATH o aggiungi la cartella al PATH
    echo.
    exit /b 1
)

echo.
pause 