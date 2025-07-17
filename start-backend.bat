@echo off
echo ===========================================
echo  FuturaLab Backend Starter con Ngrok
echo ===========================================
echo.

:: Imposta la codifica UTF-8 per caratteri speciali
chcp 65001 > nul

:: Variabili di configurazione
set MAVEN_HOME=%USERPROFILE%\maven
set NGROK_DIR=%USERPROFILE%\ngrok

:: Verifica se siamo nella directory corretta
if not exist "pom.xml" (
    echo ERRORE: File pom.xml non trovato!
    echo Assicurati di eseguire questo script dalla directory principale del progetto.
    pause
    exit /b 1
)

:: Aggiungi i percorsi al PATH per questa sessione
if exist "%MAVEN_HOME%\bin\mvn.cmd" set PATH=%MAVEN_HOME%\bin;%PATH%
if exist "%NGROK_DIR%\ngrok.exe" set PATH=%NGROK_DIR%;%PATH%

:: Chiama lo script di installazione
echo Verifica e installazione dipendenze...
call install-dependencies.bat
if errorlevel 1 (
    echo Errore durante l'installazione delle dipendenze.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo  Compilazione e avvio del backend
echo ===========================================

:: Pulisci e compila il progetto
echo Pulizia e compilazione del progetto Maven...
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" clean install
) else (
    mvn clean install
)

if errorlevel 1 (
    echo ERRORE: Compilazione Maven fallita!
    pause
    exit /b 1
)

echo.
echo Compilazione completata con successo!
echo.

:: Avvia ngrok in background
echo Avvio di ngrok su porta 8080...
if exist "%NGROK_DIR%\ngrok.exe" (
    start /b "Ngrok" "%NGROK_DIR%\ngrok.exe" http --url=supposedly-intent-gannet.ngrok-free.app 8080
) else (
    start /b "Ngrok" ngrok http --url=supposedly-intent-gannet.ngrok-free.app 8080
)

:: Aspetta un momento per permettere a ngrok di avviarsi
timeout /t 3 /nobreak > nul

echo.
echo Ngrok avviato! Il backend sarà accessibile tramite:
echo https://supposedly-intent-gannet.ngrok-free.app
echo.

:: Avvia il backend Spring Boot
echo ===========================================
echo  Avvio del backend Spring Boot...
echo ===========================================
echo Il backend sarà disponibile localmente su: http://localhost:8080
echo Il backend sarà disponibile tramite ngrok su: https://supposedly-intent-gannet.ngrok-free.app
echo.
echo Premi Ctrl+C per fermare il backend
echo.

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run
) else (
    mvn spring-boot:run
)

echo.
echo Backend arrestato.
pause 