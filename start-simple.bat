@echo off
title FuturaLab Backend - Start Simple
cls

echo ==========================================
echo  FuturaLab Backend - Avvio Semplificato
echo ==========================================
echo.

REM Variabili
set MAVEN_HOME=%USERPROFILE%\maven
set NGROK_DIR=%USERPROFILE%\ngrok

echo Controllo Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo ERRORE: Java non installato!
    echo Installa Java e riprova.
    pause
    exit /b 1
) else (
    echo [OK] Java trovato
)

echo.
echo Controllo Maven...
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo [OK] Maven trovato
    set PATH=%MAVEN_HOME%\bin;%PATH%
) else (
    echo [INFO] Maven non trovato, procedo con installazione...
    call install-dependencies.bat
    if errorlevel 1 (
        echo ERRORE durante installazione Maven
        pause
        exit /b 1
    )
)

echo.
echo Controllo Ngrok...
if exist "%NGROK_DIR%\ngrok.exe" (
    echo [OK] Ngrok trovato
    set PATH=%NGROK_DIR%;%PATH%
) else (
    echo [INFO] Ngrok non trovato, sara installato con Maven
)

echo.
echo Compilazione progetto...
mvn clean install
if errorlevel 1 (
    echo ERRORE durante compilazione
    pause
    exit /b 1
)

echo.
echo Avvio Ngrok...
start /b "Ngrok" ngrok http --url=supposedly-intent-gannet.ngrok-free.app 8080

echo.
echo Avvio backend...
echo Il backend sara disponibile su:
echo - Locale: http://localhost:8080
echo - Pubblico: https://supposedly-intent-gannet.ngrok-free.app
echo.
echo Premi Ctrl+C per fermare il backend
echo.

mvn spring-boot:run

echo.
echo Backend arrestato.
pause 