@echo off
echo ===========================================
echo  FuturaLab Backend Starter con Ngrok
echo ===========================================
echo.

:: Imposta la codifica UTF-8 per caratteri speciali
chcp 65001 > nul

:: Verifica se siamo nella directory corretta
if not exist "pom.xml" (
    echo ERRORE: File pom.xml non trovato!
    echo Assicurati di eseguire questo script dalla directory principale del progetto.
    pause
    exit /b 1
)

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
call mvn clean install
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
start /b "Ngrok" ngrok http --url=supposedly-intent-gannet.ngrok-free.app 8080

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

call mvn spring-boot:run

echo.
echo Backend arrestato.
pause 