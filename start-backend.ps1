# Script PowerShell per avviare il backend FuturaLab con ngrok
# Esegui con: PowerShell -ExecutionPolicy Bypass -File start-backend.ps1

Write-Host "================================" -ForegroundColor Green
Write-Host " FuturaLab Backend Startup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Funzione per verificare se un comando esiste
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Verifica dipendenze
Write-Host "Verifica delle dipendenze..." -ForegroundColor Yellow

# Verifica Java
if (-not (Test-Command "java")) {
    Write-Host "❌ Java non trovato nel PATH" -ForegroundColor Red
    Write-Host "Installa Java JDK 11+ da: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Red
    Read-Host "Premi Enter per uscire"
    exit 1
}
Write-Host "✅ Java trovato" -ForegroundColor Green

# Verifica Maven
if (-not (Test-Command "mvn")) {
    Write-Host "❌ Maven non trovato nel PATH" -ForegroundColor Red
    Write-Host "Installa Maven da: https://maven.apache.org/download.cgi" -ForegroundColor Red
    Read-Host "Premi Enter per uscire"
    exit 1
}
Write-Host "✅ Maven trovato" -ForegroundColor Green

# Verifica ngrok
if (-not (Test-Command "ngrok")) {
    Write-Host "❌ ngrok non trovato nel PATH" -ForegroundColor Red
    Write-Host "Installa ngrok da: https://ngrok.com/download" -ForegroundColor Red
    Read-Host "Premi Enter per uscire"
    exit 1
}
Write-Host "✅ ngrok trovato" -ForegroundColor Green

Write-Host ""

# Verifica che siamo nella directory corretta
if (-not (Test-Path "pom.xml")) {
    Write-Host "❌ File pom.xml non trovato!" -ForegroundColor Red
    Write-Host "Assicurati di eseguire questo script dalla directory principale del progetto." -ForegroundColor Red
    Read-Host "Premi Enter per uscire"
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host " Avvio dell'applicazione" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "L'applicazione sarà accessibile su:" -ForegroundColor Cyan
Write-Host "- Locale:  http://localhost:80" -ForegroundColor White
Write-Host "- Remoto:  https://supposedly-intent-gannet.ngrok-free.app (dopo l'avvio di ngrok)" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Dopo che Spring Boot si avvia, apri un NUOVO terminale ed esegui:" -ForegroundColor Yellow
Write-Host "  ngrok http --url=supposedly-intent-gannet.ngrok-free.app 80" -ForegroundColor White
Write-Host ""
Write-Host "Premi Ctrl+C per fermare l'applicazione" -ForegroundColor Yellow
Write-Host ""

# Avvia l'applicazione Spring Boot
& mvn spring-boot:run 