# Setup e Avvio del Backend FuturaLab

Questa guida descrive tutti i passaggi necessari per configurare e avviare il backend del progetto FuturaLab con ngrok.

## Prerequisiti

### 1. Java Development Kit (JDK)
- **Versione richiesta**: JDK 11 o superiore
- **Download**: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) o [OpenJDK](https://openjdk.org/)
- **Verifica installazione**: 
  ```bash
  java -version
  javac -version
  ```

### 2. Apache Maven
- **Versione richiesta**: Maven 3.6 o superiore
- **Download**: [Apache Maven](https://maven.apache.org/download.cgi)->Scarica il binary zip archive, dovrebbe scaricarti un file zip nominato: apache-maven-3.9.11-bin.zip
                Ora effettua l'unzip di questo archivio, e inserisci la cartella "apache-maven-3.9.11" in C:\Program Files\Apache, se la cartella Apache non esiste creala, una volta fatto questo, modifichiamo le variabili d'ambiente
                inserendo il file bin contenuto nella cartella "apache-maven-3.9.11" nei "path" dell'utente e anche in quelli di sistema, l'ipotetico path da aggiungere è "C:\Program Files\Apache\apache-maven-3.9.10\bin" se non è questo selezionare il proprio
                Ora applica quindi le variabili d'ambiente, adesso per vedere la modifica potrewsti dover riavviare il pc o la powershell
- **Verifica installazione**:
  ```bash
  mvn -version
  ```

### 3. ngrok
- **Installazione automatica (raccomandato)**: Se hai Chocolatey installato:
  ```bash
  choco install ngrok
  ```
  Quando viene chiesto di confermare l'installazione digirtare A e premere invio.
- **Verifica installazione**:
  ```bash
  ngrok version
  ```

#### Installazione di Chocolatey (se non presente) Quando fai copia e incolla su powershell in modalita amministratore potrebbe automaticamente eliminare i trattini(-)quindi reinseriscili e lancia gli script
Se non hai Chocolatey installato, puoi installarlo eseguendo questi comandi in PowerShell come Amministratore:

Prima di tutto controlla che l’esecuzione degli script non sia bloccata:
Esegui:
    Get‑ExecutionPolicy
Se il risultato è Restricted, imposta una policy temporanea
Esegui:
    Set‑ExecutionPolicy Bypass ‑Scope Process ‑Force
Ora lancia lo script di installazione 
Esegui:
    Set‑ExecutionPolicy Bypass ‑Scope Process ‑Force; `
[System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol ‑bor 3072; `
iex ((New‑Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

Al termine verifica se è stato installato usando 
Esegui:
    choco --version
Se vedi un numero di versione, l’installazione è andata a buon fine.

## Configurazione

### 1. Configurazione ngrok
Dopo aver installato ngrok(punto 3 dei prerequisiti)
```bash
ngrok config add-authtoken 2zwptUywEAzU4N2DNOG0napPHjt_4vzBvWiK8q4hYYiTJ3mu9
 ```

### 2. Indirizzo statico ngrok
L'applicazione è configurata per utilizzare l'indirizzo statico:
```bash
ngrok http --url=supposedly-intent-gannet.ngrok-free.app 80
```
### Avvio Manuale

#### Passo 1: Importazione DB
Su MySQL Workbench:
    Vai su File > Open SQL Script.
    Seleziona il file futuraLab.sql e aprilo.
    Una volta che il file SQL è stato caricato, clicca su Esegui per importare i dati nel tuo database.

#### Passo 2: Preparazione del progetto
```bash
# Naviga nella directory del progetto
cd /path/to/FuturaLabStudent

# Compila il progetto (opzionale, verrà fatto automaticamente da spring-boot:run)
mvn clean compile
```

#### Passo 3: Avvio dell'applicazione Spring Boot
In un terminale, avvia l'applicazione:

```bash
mvn spring-boot:run
```

L'applicazione si avvierà sulla porta 80.

#### Passo 4: Avvio di ngrok
**Dopo** che Spring Boot si è avviato completamente, apri un **nuovo terminale separato** e avvia ngrok:

```bash
ngrok http --url=supposedly-intent-gannet.ngrok-free.app 80


**Importante**: 
- Avvia Spring Boot PRIMA di ngrok
- Mantieni entrambi i terminali aperti durante l'esecuzione

## Verifica del funzionamento

1. **Controllo locale**: L'applicazione dovrebbe essere accessibile su `http://localhost:80`
2. **Controllo remoto**: L'applicazione dovrebbe essere accessibile su `https://supposedly-intent-gannet.ngrok-free.app`

### Test delle API
Puoi testare le API con questi endpoint:

```bash
# Test locale
curl -X POST http://localhost:80/api/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'

# Test remoto (dopo aver avviato ngrok)
curl -X POST https://supposedly-intent-gannet.ngrok-free.app/api/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
```

## Struttura del progetto

```
FuturaLabStudent/
├── src/main/java/com/futuralab/backend/
│   ├── Application.java          # Classe principale Spring Boot
│   ├── controllers/              # Controller REST
│   └── models/                   # Modelli dati
├── src/main/resources/
│   └── application.properties    # Configurazione Spring Boot
├── pom.xml                       # Configurazione Maven
├── ngrok.yml                     # Configurazione ngrok
├── start-backend.bat             # Script avvio Spring Boot
├── start-backend.ps1             # Script avvio Spring Boot (PowerShell)
├── start-ngrok.bat               # Script avvio ngrok separato
├── install-dependencies.bat      # Script verifica dipendenze
└── BACKEND_SETUP.md             # Questa guida
```


## Risoluzione problemi comuni

### Errore: "ngrok command not found"
- Prova l'installazione automatica: `choco install ngrok` (se hai Chocolatey)
- Verifica che ngrok sia installato e nel PATH del sistema
- Su Windows, potrebbe essere necessario riavviare il terminale dopo l'installazione
- Lo script `install-dependencies.bat` tenterà automaticamente l'installazione tramite Chocolatey

### Errore: "Port 80 already in use"
- Verifica che non ci siano altri servizi in esecuzione sulla porta 80
- Considera l'utilizzo di una porta diversa (es. 8080) e modifica il comando ngrok di conseguenza:
  ```bash
  ngrok http --url=supposedly-intent-gannet.ngrok-free.app 8080
  ```

### Errore Maven: "JAVA_HOME not set"
- Imposta la variabile d'ambiente JAVA_HOME che punta alla directory di installazione del JDK
- Su Windows: `set JAVA_HOME=C:\Program Files\Java\jdk-XX`
- Su Linux/Mac: `export JAVA_HOME=/path/to/jdk`

### Problemi di connessione al database
- Verifica che MySQL sia in esecuzione
- Controlla le credenziali di connessione nel file `application.properties`

## Note aggiuntive

- L'authtoken di ngrok è privato e non deve essere condiviso pubblicamente
- L'indirizzo statico ngrok è associato al tuo account e ha limitazioni basate sul piano utilizzato
- Per ambienti di produzione, considera l'utilizzo di soluzioni di hosting dedicate invece di ngrok 