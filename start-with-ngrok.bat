@echo off
echo ================================
echo   FUTURALAB + NGROK STARTUP
echo ================================

echo Verificando Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRORE: Java non trovato! Installa Java 11+ e riprova.
    pause
    exit /b 1
)

echo Verificando Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRORE: Maven non trovato! Installa Maven e riprova.
    pause
    exit /b 1
)

echo Verificando ngrok...
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRORE: ngrok non trovato!
    echo Scarica ngrok da: https://ngrok.com/download
    echo E aggiungilo al PATH di sistema
    pause
    exit /b 1
)

echo.
echo Compilando il progetto...
call mvn clean install -DskipTests

if %errorlevel% neq 0 (
    echo ERRORE: Compilazione fallita!
    pause
    exit /b 1
)

echo.
echo Avviando il backend in background...
start /b cmd /c "call mvn spring-boot:run"

echo Attendendo l'avvio del backend...
timeout /t 15 /nobreak > nul

echo.
echo ==========================================
echo   NGROK TUNNEL ATTIVO!
echo   Le tue API sono ora pubbliche
echo   URL mostrato sotto:
echo ==========================================
echo.
ngrok http 8080 --log=stdout

pause 