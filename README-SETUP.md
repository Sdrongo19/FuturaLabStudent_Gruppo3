# 🚀 Setup Rapido FuturaLab Backend (Windows)

## 📋 Prerequisiti (da installare una volta sola)

1. **Java 11+** - [Download qui](https://adoptium.net/)
2. **Maven** - [Download qui](https://maven.apache.org/download.cgi) 
3. **MySQL** - Con database `futuralab` già configurato
4. **ngrok** (opzionale per accesso pubblico) - [Download qui](https://ngrok.com/download)

## ⚡ Avvio Rapido

### Solo Backend Locale
```batch
# Doppio click su:
start-backend.bat

# Oppure da terminale:
start-backend.bat
```

**API disponibili su:** `http://localhost:8080/api/`

### Backend + Accesso Pubblico (ngrok)
```batch
# Doppio click su:
start-with-ngrok.bat

# Oppure da terminale:
start-with-ngrok.bat
```

**API disponibili su:** URL pubblico mostrato da ngrok (es. `https://abc123.ngrok-free.app/api/`)

## 🔧 Configurazione Database Personalizzata

Se vuoi usare credenziali database diverse, crea un file `.env` nella root del progetto:

```env
DB_URL=jdbc:mysql://localhost:3306/futuralab
DB_USER=tuo_username
DB_PASSWORD=tua_password
```

## ✅ Test delle API

Testa che tutto funzioni:

```bash
# Test login locale
curl -X POST http://localhost:8080/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"H.watson\",\"password\":\"12345678\"}"

# Test login pubblico (sostituisci URL ngrok)
curl -X POST https://abc123.ngrok-free.app/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"H.watson\",\"password\":\"12345678\"}"
```

## 🔄 Workflow Tipico

1. **Prima volta**: Installa prerequisiti
2. **Sviluppo locale**: Usa `start-backend.bat`
3. **Demo/Condivisione**: Usa `start-with-ngrok.bat`
4. **Stop**: Premi `Ctrl+C` nel terminale

## 🆘 Risoluzione Problemi

### "Java non trovato"
- Installa Java 11+ da [adoptium.net](https://adoptium.net/)
- Assicurati che sia nel PATH

### "Maven non trovato"  
- Installa Maven da [maven.apache.org](https://maven.apache.org/download.cgi)
- Aggiungi Maven al PATH

### "Errore connessione database"
- Verifica che MySQL sia avviato
- Controlla credenziali nel file `DatabaseConfig.java`
- Importa il database con `futuraLab.sql`

### "ngrok non trovato"
- Scarica ngrok da [ngrok.com](https://ngrok.com/download)
- Estrailo e aggiungilo al PATH
- Oppure metti `ngrok.exe` nella cartella del progetto

## 📱 Frontend

Il frontend può essere avviato separatamente con:
```batch
python -m http.server 8000
```

E sarà disponibile su: `http://localhost:8000` 