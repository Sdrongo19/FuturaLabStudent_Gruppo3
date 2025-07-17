@echo off
echo ===========================================
echo  Installazione Dipendenze FuturaLab
echo ===========================================
echo.

:: Imposta la codifica UTF-8
chcp 65001 > nul

:: Variabili di configurazione
set MAVEN_VERSION=3.9.6
set MAVEN_URL=https://dlcdn.apache.org/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip
set MAVEN_HOME=%USERPROFILE%\maven
set NGROK_URL=https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip
set NGROK_DIR=%USERPROFILE%\ngrok
set NGROK_TOKEN=2zwptUywEAzU4N2DNOG0napPHjt_4vzBvWiK8q4hYYiTJ3mu9

echo Debug: Percorsi configurati
echo MAVEN_HOME: %MAVEN_HOME%
echo NGROK_DIR: %NGROK_DIR%
echo.

echo Controllo Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ATTENZIONE: Java non è installato o non è nel PATH!
    echo.
    echo Per installare Java, visita: https://www.oracle.com/java/technologies/downloads/
    echo Oppure installa OpenJDK: https://openjdk.org/install/
    echo.
    echo Dopo l'installazione, riavvia questo script.
    echo Premere un tasto per uscire...
    pause
    exit /b 1
) else (
    echo ✓ Java trovato
)

echo.
echo Controllo Maven...
:: Aggiungi Maven al PATH per la sessione corrente se esiste
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    set PATH=%MAVEN_HOME%\bin;%PATH%
    echo Debug: Maven trovato, aggiunto al PATH
)

echo Tentativo di esecuzione: mvn -version
mvn -version >nul 2>&1
if errorlevel 1 (
    echo Maven non trovato nel PATH. Installazione in corso...
    echo Premere un tasto per continuare con l'installazione di Maven...
    pause
    call :install_maven
    if errorlevel 1 (
        echo Errore durante l'installazione di Maven!
        echo Premere un tasto per uscire...
        pause
        exit /b 1
    )
) else (
    echo ✓ Maven trovato e funzionante
)

echo.
echo Controllo Ngrok...
:: Aggiungi Ngrok al PATH per la sessione corrente se esiste
if exist "%NGROK_DIR%\ngrok.exe" (
    set PATH=%NGROK_DIR%;%PATH%
    echo Debug: Ngrok trovato, aggiunto al PATH
)

echo Tentativo di esecuzione: ngrok version
"%NGROK_DIR%\ngrok.exe" version >nul 2>&1
if errorlevel 1 (
    echo Ngrok non trovato. Installazione in corso...
    echo Premere un tasto per continuare con l'installazione di Ngrok...
    pause
    call :install_ngrok
    if errorlevel 1 (
        echo Errore durante l'installazione di Ngrok!
        echo Premere un tasto per uscire...
        pause
        exit /b 1
    )
) else (
    echo ✓ Ngrok trovato e funzionante
    :: Configura il token anche se Ngrok è già installato
    call :configure_ngrok_token
)

echo.
echo ===========================================
echo  Tutte le dipendenze sono installate!
echo ===========================================
echo.
echo Premere un tasto per continuare...
pause
exit /b 0

:install_maven
echo.
echo Installazione di Apache Maven %MAVEN_VERSION%...

:: Crea la directory per Maven
if not exist "%MAVEN_HOME%" (
    echo Creazione directory: %MAVEN_HOME%
    mkdir "%MAVEN_HOME%"
)

:: Scarica Maven usando PowerShell
echo Scaricamento Maven da %MAVEN_URL%...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%TEMP%\maven.zip'}"
if errorlevel 1 (
    echo Errore durante il download di Maven
    echo Premere un tasto per continuare...
    pause
    exit /b 1
)

:: Estrai Maven
echo Estrazione Maven in %MAVEN_HOME%...
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%TEMP%\maven.zip', '%MAVEN_HOME%')}"
if errorlevel 1 (
    echo Errore durante l'estrazione di Maven
    echo Premere un tasto per continuare...
    pause
    exit /b 1
)

:: Sposta i file dalla sottocartella alla directory principale
echo Riorganizzazione file Maven...
for /d %%i in ("%MAVEN_HOME%\apache-maven-*") do (
    echo Spostamento da %%i a %MAVEN_HOME%
    xcopy "%%i\*" "%MAVEN_HOME%\" /s /e /y
    rmdir "%%i" /s /q
)

:: Aggiungi Maven al PATH per la sessione corrente
set PATH=%MAVEN_HOME%\bin;%PATH%
echo Maven aggiunto al PATH della sessione corrente

:: Aggiungi Maven al PATH permanentemente
echo Aggiunta di Maven al PATH di sistema...
powershell -Command "& {$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';%MAVEN_HOME%\bin'; [System.Environment]::SetEnvironmentVariable('Path', $env:Path, 'Machine')}"

:: Pulisci
echo Pulizia file temporanei...
del "%TEMP%\maven.zip"

echo ✓ Maven installato con successo in %MAVEN_HOME%
exit /b 0

:install_ngrok
echo.
echo Installazione di Ngrok...

:: Crea la directory per Ngrok
if not exist "%NGROK_DIR%" (
    echo Creazione directory: %NGROK_DIR%
    mkdir "%NGROK_DIR%"
)

:: Scarica Ngrok usando PowerShell
echo Scaricamento Ngrok da %NGROK_URL%...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NGROK_URL%' -OutFile '%TEMP%\ngrok.zip'}"
if errorlevel 1 (
    echo Errore durante il download di Ngrok
    echo Premere un tasto per continuare...
    pause
    exit /b 1
)

:: Estrai Ngrok
echo Estrazione Ngrok in %NGROK_DIR%...
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%TEMP%\ngrok.zip', '%NGROK_DIR%')}"
if errorlevel 1 (
    echo Errore durante l'estrazione di Ngrok
    echo Premere un tasto per continuare...
    pause
    exit /b 1
)

:: Aggiungi Ngrok al PATH per la sessione corrente
set PATH=%NGROK_DIR%;%PATH%
echo Ngrok aggiunto al PATH della sessione corrente

:: Aggiungi Ngrok al PATH permanentemente
echo Aggiunta di Ngrok al PATH di sistema...
powershell -Command "& {$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';%NGROK_DIR%'; [System.Environment]::SetEnvironmentVariable('Path', $env:Path, 'Machine')}"

:: Pulisci
echo Pulizia file temporanei...
del "%TEMP%\ngrok.zip"

echo ✓ Ngrok installato con successo in %NGROK_DIR%

:: Configura automaticamente il token
call :configure_ngrok_token

exit /b 0

:configure_ngrok_token
echo Configurazione del token Ngrok...
echo Utilizzo token: %NGROK_TOKEN%
"%NGROK_DIR%\ngrok.exe" config add-authtoken %NGROK_TOKEN%
if errorlevel 1 (
    echo Errore durante la configurazione del token Ngrok
    echo Premere un tasto per continuare...
    pause
    exit /b 1
) else (
    echo ✓ Token Ngrok configurato con successo
)
exit /b 0 