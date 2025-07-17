@echo off
echo ================================
echo   FUTURALAB BACKEND STARTUP
echo ================================

echo Verificando Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRORE: Java non trovato! Installa Java 11+ e riprova.
    echo Download: https://adoptium.net/
    pause
    exit /b 1
)

echo Verificando Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRORE: Maven non trovato! Installa Maven e riprova.
    echo Download: https://maven.apache.org/download.cgi
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
echo ==========================================
echo   BACKEND AVVIATO CON SUCCESSO!
echo   API disponibili su: http://localhost:8080/api/
echo   Premi Ctrl+C per fermare il server
echo ==========================================
echo.
call mvn spring-boot:run

pause 