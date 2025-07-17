@echo off
title FuturaLab Backend Launcher
echo ==========================================
echo  FuturaLab - Launcher con CMD
echo ==========================================
echo.

echo Apertura di un nuovo Prompt dei Comandi...
echo.
echo Nel nuovo terminale che si aprira, vedrai tutto l'output 
echo e il terminale non si chiudera automaticamente.
echo.

REM Apri un nuovo cmd che rimane aperto e esegue quick-start
start "FuturaLab Backend" cmd /k "cd /d "%~dp0" && quick-start.bat"

echo.
echo Un nuovo terminale si e aperto con il processo di avvio.
echo Puoi chiudere questa finestra.
echo.
pause 