# Sistema di Simulazione Interattiva - FuturaLab

## Panoramica

Il sistema implementa simulazioni interattive di tipo 0 (non video) per la piattaforma FuturaLab. Le simulazioni sono basate su esperimenti scientifici con interfaccia drag-and-drop e personaggi guida.

## File Principali

### `simulazione.html`
- Pagina principale per le simulazioni interattive
- Design responsive con glassmorphism
- Sfondo sfocato di aula scolastica
- Elementi interattivi sovrapposti

### `js/simulazione.js`
- Logica principale della simulazione
- Sistema di drag-and-drop
- Gestione degli step della simulazione
- Integrazione con il backend

## Flusso della Simulazione

### 1. Avvio
- L'utente clicca "Avvia" nella VR
- Se `tipoSimulazione === 0`, reindirizzamento a `simulazione.html`
- Passaggio dell'ID simulazione tramite URL

### 2. Step della Simulazione
La simulazione è divisa in 9 step basati sulle immagini del Figma:

1. **Inizio Esperimento** - Afferrare l'ampolla con bicarbonato
2. **Afferrare la Provetta** - Prendere la provetta con succo di limone
3. **Versare il Contenuto** - Trascinare provetta nell'ampolla (drag & drop)
4. **Aspettare la Reazione** - Step automatico con pulsante "Continua"
5. **Reazione Acida** - Osservazione della schiuma
6. **Spiegazione pH** - Spiegazione teorica
7. **Test con Acqua** - Nuovo esperimento con acqua
8. **Reazione Neutra** - Osservazione reazione neutra
9. **Fine Lezione** - Completamento simulazione

### 3. Interazioni

#### Drag & Drop
- Elementi trascinabili: provette, ampolle
- Zone di drop: ampolle per le reazioni
- Feedback visivo per azioni corrette/errate
- Animazioni di reazione

#### Step Automatici
- Step 4, 5, 6, 7, 8, 9: pulsante "Continua"
- Nessuna interazione drag & drop richiesta
- Progressione guidata

### 4. Completamento
- Raggiungimento dell'ultimo step
- Impostazione stato "finito" nel backend
- Apertura banner di valutazione
- Ritorno alla pagina principale

## Integrazione con Backend

### Endpoint Utilizzati
- `POST /api/setStatoSimulazioneStudente` - Avvio simulazione
- `POST /api/simulazione/finish` - Completamento simulazione
- `POST /api/simulazione/rate` - Invio valutazione
- `GET /api/simulazione/status/{id}` - Monitoring stato

### Monitoring
- Controllo ogni 5 secondi dello stato simulazione
- Gestione terminazione da parte dell'insegnante
- Cleanup automatico al chiusura pagina

## Gestione Sessione

### Condivisione Dati
- Utilizzo di `sessionStorage` per dati utente
- Persistenza tra VR e pagina simulazione
- Controllo automatico login

### Ritorno alla VR
- Flag `fromSimulation=true` nell'URL
- Controllo automatico nuove attività
- Gestione banner di attesa

## Elementi Visivi

### Personaggio Guida
- Goccia d'acqua animata
- Cambio espressione per step diversi
- Fumetti di dialogo con istruzioni

### Elementi di Laboratorio
- Ampolle, provette, supporti
- Immagini dalla cartella `simulazioneFoto/`
- Posizionamento dinamico per step

### Animazioni
- Reazioni chimiche con cambio immagini
- Feedback visivo per azioni
- Transizioni fluide tra step

## Responsive Design

### Desktop
- Controlli mouse per drag & drop
- Interfaccia ottimizzata per schermi grandi

### Mobile
- Supporto touch per drag & drop
- Layout adattivo per schermi piccoli
- Controlli ottimizzati per touch

## Gestione Errori

### Fallback
- In caso di errore API, ritorno alla VR
- Gestione sessioni scadute
- Cleanup automatico risorse

### Feedback Utente
- Messaggi di errore chiari
- Indicatori visivi per azioni
- Conferme per azioni critiche

## Estensibilità

### Nuove Simulazioni
- Aggiunta step in `SIMULATION_STEPS`
- Nuove immagini in `simulazioneFoto/`
- Configurazione drag & drop

### Personalizzazione
- Stili CSS modulari
- Configurazione step flessibile
- Sistema di eventi estendibile

## Testing

### Funzionalità da Testare
1. Login e reindirizzamento
2. Drag & drop funzionante
3. Progressione step corretta
4. Completamento simulazione
5. Valutazione e ritorno VR
6. Monitoring stato
7. Responsive design

### Debug
- Logger integrato per tracciamento
- Console log per sviluppo
- Gestione errori dettagliata 