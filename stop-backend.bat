@echo off
echo ===========================================
echo  Arresto FuturaLab Backend e Ngrok
echo ===========================================
echo.

:: Imposta la codifica UTF-8
chcp 65001 > nul

echo Arresto dei processi...

:: Trova e termina i processi Spring Boot
echo Arresto Spring Boot...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq java.exe" /fo table /nh ^| findstr "java.exe"') do (
    echo Terminazione processo Java %%i...
    taskkill /pid %%i /f >nul 2>&1
)

:: Trova e termina i processi Ngrok
echo Arresto Ngrok...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq ngrok.exe" /fo table /nh ^| findstr "ngrok.exe"') do (
    echo Terminazione processo Ngrok %%i...
    taskkill /pid %%i /f >nul 2>&1
)

:: Pulisci le porte (forza la chiusura delle connessioni sulla porta 8080)
echo Pulizia porta 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ✓ Processi arrestati
echo ✓ Il backend e ngrok sono stati fermati
echo.
pause 