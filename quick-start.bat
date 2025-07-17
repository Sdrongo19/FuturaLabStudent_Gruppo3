@echo off
title FuturaLab - Avvio Rapido
echo ==========================================
echo  FuturaLab - Avvio Rapido
echo ==========================================
echo.

REM Imposta la codifica UTF-8
chcp 65001 > nul

REM Pausa iniziale per permettere di vedere l'output
echo ATTENZIONE: Se il terminale si chiude improvvisamente, 
echo apri il Prompt dei Comandi manualmente e naviga nella cartella del progetto,
echo poi esegui: quick-start.bat
echo.
echo Premere un tasto per continuare con l'avvio...
pause

REM Variabili di configurazione
set MAVEN_HOME=%USERPROFILE%\maven
set NGROK_DIR=%USERPROFILE%\ngrok

echo Debug: Controllo percorsi...
echo MAVEN_HOME: %MAVEN_HOME%
echo NGROK_DIR: %NGROK_DIR%
echo.
pause

REM Verifica se e la prima volta o se mancano componenti
set NEED_SETUP=0

echo Controllo Maven in: %MAVEN_HOME%\bin\mvn.cmd
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Prima esecuzione rilevata: Maven non trovato.
    set NEED_SETUP=1
) else (
    echo Maven trovato in: %MAVEN_HOME%\bin\mvn.cmd
)

echo.
echo Controllo Ngrok in: %NGROK_DIR%\ngrok.exe
if not exist "%NGROK_DIR%\ngrok.exe" (
    echo Prima esecuzione rilevata: Ngrok non trovato.
    set NEED_SETUP=1
) else (
    echo Ngrok trovato in: %NGROK_DIR%\ngrok.exe
)

echo.
echo NEED_SETUP: %NEED_SETUP%
echo.
echo Premere un tasto per continuare...
pause

REM Se e necessaria la configurazione, eseguila
if %NEED_SETUP%==1 (
    echo.
    echo ===============================================
    echo  CONFIGURAZIONE INIZIALE NECESSARIA
    echo ===============================================
    echo.
    echo Questo e il primo avvio, devo installare:
    if not exist "%MAVEN_HOME%\bin\mvn.cmd" echo - Apache Maven
    if not exist "%NGROK_DIR%\ngrok.exe" echo - Ngrok
    echo.
    echo L'installazione richiedera alcuni minuti.
    echo.
    echo Premere un tasto per continuare con l'installazione...
    pause
    
    echo Avvio configurazione iniziale...
    call setup-first-time.bat
    if errorlevel 1 (
        echo.
        echo ===============================================
        echo  ERRORE DURANTE LA CONFIGURAZIONE
        echo ===============================================
        echo.
        echo La configurazione iniziale e fallita.
        echo Controlla i messaggi di errore sopra.
        echo.
        echo Premere un tasto per uscire...
        pause
        exit /b 1
    )
    echo.
    echo ===============================================
    echo  CONFIGURAZIONE COMPLETATA!
    echo ===============================================
    echo.
    echo Configurazione completata con successo!
    echo Ora procedo con l'avvio del backend...
    echo.
    echo Premere un tasto per continuare...
    pause
)

REM Aggiungi i percorsi al PATH per questa sessione
echo ===============================================
echo  PREPARAZIONE AMBIENTE
echo ===============================================
echo.
echo Aggiunta percorsi al PATH...
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    set PATH=%MAVEN_HOME%\bin;%PATH%
    echo [OK] Maven aggiunto al PATH
) else (
    echo [WARNING] ATTENZIONE: Maven non trovato, utilizzero il PATH di sistema
)

if exist "%NGROK_DIR%\ngrok.exe" (
    set PATH=%NGROK_DIR%;%PATH%
    echo [OK] Ngrok aggiunto al PATH
) else (
    echo [WARNING] ATTENZIONE: Ngrok non trovato, utilizzero il PATH di sistema
)

echo.
echo PATH aggiornato per questa sessione.
echo.
echo Premere un tasto per continuare con l'avvio del backend...
pause

REM Avvia il backend
echo.
echo ===============================================
echo  AVVIO DEL BACKEND CON NGROK
echo ===============================================
echo.
echo Ora avvio il backend FuturaLab con Ngrok...
echo Questo processo puo richiedere alcuni minuti.
echo.
echo Premere un tasto per iniziare...
pause

call start-backend.bat

REM Se arriviamo qui, mostra un messaggio finale
echo.
echo ===============================================
echo  COMPLETAMENTO SCRIPT
echo ===============================================
echo.
echo Script quick-start completato.
echo.
echo Se il backend e stato avviato correttamente, 
echo non chiudere questa finestra mentre il backend e in esecuzione.
echo.
echo Premere un tasto per uscire...
pause 