# Simulazione Educativa VR con Three.js

Un progetto web per simulazioni educative in stile VR utilizzando Three.js per la grafica 3D. Il progetto permette di esplorare una classroom virtuale e interagire con oggetti 3D come provette da laboratorio.

## 🚀 Caratteristiche Principali

- **Scena 3D interattiva** con Three.js
- **Caricamento modelli GLB** tramite GLTFLoader
- **Controlli OrbitControls** per l'esplorazione della scena
- **Interazioni con oggetti** (click per cambiare colore)
- **Interfaccia utente minimale** e responsive
- **Animazioni fluide** e effetti visivi
- **Supporto per dispositivi touch** e desktop

## 📁 Struttura del Progetto

```
/
├── index.html          # File HTML principale
├── style.css           # Stili CSS per l'interfaccia
├── README.md           # Documentazione del progetto
├── /models/            # Cartella per i modelli GLB
│   ├── classroom.glb   # Modello della classroom (opzionale)
│   └── provetta.glb    # Modello della provetta (opzionale)
└── /src/
    └── main.js         # Script JavaScript principale
```

## 🛠️ Installazione e Avvio

### Requisiti
- Un browser web moderno (Chrome, Firefox, Safari, Edge)
- Un server web locale (per evitare problemi CORS)

### Avvio Rapido

1. **Clona o scarica** il progetto
2. **Avvia un server locale** nella cartella del progetto:

   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Python 2
   python -m SimpleHTTPServer 8000
   
   # Con Node.js (se hai live-server installato)
   npx live-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Apri il browser** e vai su `http://localhost:8000`

## 🎮 Come Usare

### Controlli
- **Mouse**: Ruota e esplora la scena
- **Rotella del mouse**: Zoom in/out
- **Click sinistro**: Interagisce con gli oggetti
- **Touch**: Supporto per dispositivi mobili

### Interazioni
1. **Aggiungi Provetta**: Clicca il pulsante "Aggiungi Provetta" per aggiungere una nuova provetta sulla scrivania
2. **Cambia Colore**: Clicca su una provetta per cambiarle colore
3. **Esplora**: Usa il mouse per ruotare e esplorare la scena

## 🔧 Personalizzazione

### Aggiungere Modelli GLB

1. Posiziona i tuoi file `.glb` nella cartella `models/`
2. Modifica il file `src/main.js` per caricare i tuoi modelli:

```javascript
// Decommenta e modifica queste sezioni nel file main.js
loadGLBModel(
    'models/tuo-modello.glb',
    (gltf) => {
        // Gestisci il modello caricato
        const model = gltf.scene;
        scene.add(model);
    }
);
```

### Modificare i Colori delle Provette

Nel file `src/main.js`, modifica l'array `PROVETTA_COLORS`:

```javascript
const PROVETTA_COLORS = [
    0xff0000, // Rosso
    0x00ff00, // Verde
    0x0000ff, // Blu
    // Aggiungi altri colori...
];
```

### Personalizzare l'Interfaccia

Modifica il file `style.css` per cambiare l'aspetto dell'interfaccia utente.

## 📚 Dipendenze

Il progetto utilizza le seguenti librerie caricate via CDN:

- **Three.js** (r128): Libreria principale per la grafica 3D
- **OrbitControls**: Controlli per l'esplorazione della scena
- **GLTFLoader**: Caricamento di modelli 3D in formato GLB/GLTF

## 🔍 Funzionalità Tecniche

### Illuminazione
- Luce ambientale per illuminazione generale
- Luce direzionale con ombre dinamiche
- Luce puntuale per dettagli aggiuntivi

### Rendering
- Antialiasing abilitato per una migliore qualità visiva
- Ombre dinamiche PCF (Percentage-Closer Filtering)
- Rendering responsive che si adatta alle dimensioni della finestra

### Interazioni
- Raycasting per il rilevamento dei click
- Hover effects con cambio del cursore
- Animazioni fluide per il feedback visivo

## 🎯 Possibili Estensioni

- **Fisica**: Integrazione con Cannon.js o Ammo.js
- **Audio**: Effetti sonori per le interazioni
- **Multiplayer**: Supporto per più utenti
- **VR/AR**: Integrazione con WebXR
- **Più oggetti**: Aggiunta di altri strumenti da laboratorio
- **Simulazioni**: Esperimenti chimici o fisici interattivi

## 🐛 Risoluzione Problemi

### Modelli GLB non si caricano
- Verifica che i file siano nella cartella `models/`
- Controlla che il server web sia avviato
- Verifica la console del browser per errori

### Controlli non funzionano
- Assicurati che JavaScript sia abilitato
- Controlla la console per errori di caricamento

### Performance scadenti
- Riduci la qualità delle ombre nel file `main.js`
- Diminuisci la risoluzione della shadow map
- Ottimizza i modelli GLB

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Puoi utilizzarlo liberamente per scopi educativi e commerciali.

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di:
- Segnalare bug
- Proporre nuove funzionalità
- Migliorare la documentazione
- Ottimizzare il codice

---

**Buon divertimento con la tua simulazione educativa VR!** 🎓✨