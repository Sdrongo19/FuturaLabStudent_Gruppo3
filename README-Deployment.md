# 🚀 FuturaLab Backend - Deployment Automatizzato

Questo progetto include un sistema di deployment automatizzato che semplifica l'avvio del backend con Ngrok su qualsiasi PC Windows.

## 📁 File del Sistema di Deployment

- `quick-start.bat` - Avvio rapido con rilevamento automatico
- `run-in-cmd.bat` - **RACCOMANDATO** - Apre un terminale permanente
- `setup-first-time.bat` - Configurazione iniziale dell'ambiente
- `start-backend.bat` - Avvio del backend con Ngrok
- `stop-backend.bat` - Arresto pulito del backend e Ngrok
- `install-dependencies.bat` - Installazione automatica delle dipendenze

## 🔧 Configurazione Iniziale (Prima Volta)

### ⭐ Metodo Raccomandato (Evita Chiusure Improvvise)

```bash
# Fai doppio click su:
run-in-cmd.bat
```

Questo script:
- Apre un nuovo Prompt dei Comandi che non si chiude
- Esegue automaticamente `quick-start.bat` nel nuovo terminale
- Ti permette di vedere tutto l'output senza interruzioni

### Metodo Alternativo

```bash
# Fai doppio click su:
quick-start.bat
```

⚠️ **Nota**: Se il terminale si chiude improvvisamente:
1. Apri manualmente il **Prompt dei Comandi** (cmd)
2. Naviga nella cartella del progetto: `cd "percorso\del\progetto"`
3. Esegui: `quick-start.bat`

## 🚀 Processo di Avvio

Il sistema esegue automaticamente questi passaggi:

### 1. **Rilevamento Dipendenze**
- Verifica e installa Java (se necessario, ti chiederà di installarlo manualmente)
- Scarica e installa Maven automaticamente
- Scarica e installa Ngrok automaticamente
- **Configura automaticamente il token di autenticazione Ngrok** ✨

### 2. **Configurazione Automatica**
🎉 **Il token Ngrok è già configurato automaticamente!**

Non è più necessario inserire manualmente il token. Il sistema utilizza il token preconfigurato:
- `2zwptUywEAzU4N2DNOG0napPHjt_4vzBvWiK8q4hYYiTJ3mu9`

### 3. **Avvio del Backend**
Il sistema:
1. Compila il progetto con `mvn clean install`
2. Avvia Ngrok sulla porta 8080 con l'URL statico configurato
3. Avvia il backend Spring Boot
4. Mostra le informazioni di connessione

### 📱 URL di Accesso

Dopo l'avvio, il backend sarà disponibile su:

- **Locale**: http://localhost:8080
- **Ngrok (pubblico)**: https://supposedly-intent-gannet.ngrok-free.app

## 🛑 Arresto del Backend

Per fermare il backend e Ngrok:

```bash
# Fai doppio click su:
stop-backend.bat
```

Oppure premi `Ctrl+C` nella finestra del terminal dove è in esecuzione il backend.

## 📋 Requisiti del Sistema

### Automaticamente Installati
- ✅ **Maven 3.9.6** - Viene scaricato e installato automaticamente
- ✅ **Ngrok** - Viene scaricato e installato automaticamente
- ✅ **Token Ngrok** - Viene configurato automaticamente

### Da Installare Manualmente
- ❗ **Java 11+** - Deve essere installato manualmente se non presente
- ❗ **MySQL** - Deve essere in esecuzione con il database configurato

## 🔧 Configurazione del Database

Assicurati che MySQL sia configurato correttamente:

1. **Avvia MySQL** sul tuo sistema
2. **Importa il database**:
   ```sql
   mysql -u root -p < futuraLab.sql
   ```
3. **Configura le credenziali** nel file `DatabaseConfig.java` (se necessario)

## 📱 Configurazione App Mobile

Una volta avviato il backend, configura l'app mobile per utilizzare l'URL Ngrok:

```
Base URL: https://supposedly-intent-gannet.ngrok-free.app
```

### Endpoint Disponibili

- `POST /api/login` - Login insegnante
- `POST /api/classeInsegnante` - Ottieni classe dell'insegnante
- `POST /api/materie` - Ottieni materie per classe
- `POST /api/macrocategorie` - Ottieni macrocategorie per materia
- `POST /api/studentiByClasse` - Ottieni studenti per classe
- `POST /api/creaRichiestaSimulazione` - Crea richiesta simulazione
- `POST /api/getStudentiSimulazione` - Ottieni studenti per simulazione
- E molti altri...

## 🐛 Risoluzione Problemi

### Il terminale si chiude improvvisamente
```
Il terminale scompare dopo aver premuto un tasto
```
**Soluzione**: Usa `run-in-cmd.bat` invece di `quick-start.bat` direttamente

### Java non trovato
```
ERRORE: Java non è installato o non è nel PATH!
```
**Soluzione**: Installa Java da https://openjdk.org/install/ o https://www.oracle.com/java/technologies/downloads/

### Maven non funziona
```
mvn: comando non riconosciuto
```
**Soluzione**: Il sistema dovrebbe installarlo automaticamente. Se persiste, riavvia il computer dopo l'installazione

### Ngrok non si autentica
```
ERROR: authentication failed
```
**Soluzione**: Il token dovrebbe essere configurato automaticamente. Se persistono problemi, esegui nuovamente `setup-first-time.bat`

### Porta 8080 occupata
```
Port 8080 is already in use
```
**Soluzione**: Esegui `stop-backend.bat` per pulire le porte

### Database non si connette
```
SQLException: Access denied
```
**Soluzione**: Verifica che MySQL sia in esecuzione e le credenziali siano corrette in `DatabaseConfig.java`

## 📞 Supporto

Se incontri problemi:

1. **Usa sempre** `run-in-cmd.bat` per vedere l'output completo
2. Controlla che MySQL sia in esecuzione
3. Esegui `setup-first-time.bat` per riconfigurare l'ambiente
4. Controlla i log nella finestra del terminal per errori specifici
5. Verifica che Java sia installato correttamente

## 🔄 Aggiornamenti

Per aggiornare le dipendenze:

1. Elimina le cartelle `%USERPROFILE%\maven` e `%USERPROFILE%\ngrok`
2. Esegui nuovamente `setup-first-time.bat`

## 🎯 Uso Semplificato

### ⭐ Per Tutti gli Utenti (RACCOMANDATO)
```bash
run-in-cmd.bat  # Apre terminale permanente ed esegue tutto automaticamente
```

### Per Nuovi Utenti (Prima Volta)
```bash
quick-start.bat  # Configura tutto automaticamente e avvia (ma può chiudersi)
```

### Per Utenti Esperti
```bash
start-backend.bat  # Avvia direttamente il backend (da cmd aperto manualmente)
```

### Per Debug
```bash
setup-first-time.bat  # Riconfigura l'ambiente
```

## 📝 Note Importanti

- ⚠️ Il backend deve essere ricompilato (`mvn clean install`) ogni volta che modifichi il codice sorgente
- 🌐 L'URL Ngrok statico (`supposedly-intent-gannet.ngrok-free.app`) è configurato per questo progetto
- 🔒 Il token Ngrok è preconfigurato e viene applicato automaticamente
- 💾 Assicurati che MySQL sia sempre in esecuzione prima di avviare il backend
- ✨ Non è più necessario inserire manualmente alcun token o configurazione!
- 🖥️ **Usa sempre `run-in-cmd.bat` per evitare chiusure improvvise del terminale** 