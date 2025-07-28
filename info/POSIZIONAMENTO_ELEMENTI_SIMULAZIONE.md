# 📍 Guida al Posizionamento Elementi Simulazione

## Panoramica

Questo documento spiega come modificare le posizioni e dimensioni di tutti gli elementi nella pagina di simulazione (`simulazione.html`). Tutti gli elementi usano `position: fixed` per mantenere posizioni costanti indipendentemente dall'immagine di sfondo.

## 🎯 Sistema di Trascinamento

Il sistema di drag & drop utilizza `transform` invece di modificare `position` per garantire:
- **Layout stabile**: Gli altri elementi non cambiano dimensione durante il trascinamento
- **Performance migliore**: `transform` è più efficiente per le animazioni
- **Movimento fluido**: Nessun salto o posizionamento errato

### Come Funziona il Transform
```css
/* Durante il trascinamento */
.elemento-trascinato {
    transform: translate(deltaX, deltaY) scale(1.1);
    z-index: 1000;
}

/* A riposo */
.elemento-normale {
    transform: none;
    z-index: normale;
}
```

## 📁 File da Modificare

**File principale**: `simulazione.html`
**Sezione CSS**: All'interno del tag `<style>` (righe ~50-300)

## 🎯 Elementi e loro Posizioni

### 1. Personaggio Goccia (Water Drop Character)

**Classe CSS**: `.water-drop-character`
**Posizione attuale**: Basso a sinistra
**File**: `simulazione.html` (righe ~120-130)

```css
.water-drop-character {
    position: fixed;
    left: 80px;           /* ← Distanza dal bordo sinistro */
    bottom: 120px;        /* ← Distanza dal bordo inferiore */
    width: 140px;         /* ← Larghezza */
    height: 140px;        /* ← Altezza */
    z-index: 20;          /* ← Livello di sovrapposizione */
}
```

**Come modificare**:
- `left: 80px` → Cambia la distanza dal bordo sinistro
- `bottom: 120px` → Cambia la distanza dal bordo inferiore
- `width: 140px` → Cambia la larghezza
- `height: 140px` → Cambia l'altezza

### 2. Fumetto di Dialogo (Speech Bubble)

**Classe CSS**: `.speech-bubble`
**Posizione attuale**: Sopra la goccia
**File**: `simulazione.html` (righe ~135-155)

```css
.speech-bubble {
    position: fixed;
    left: 240px;          /* ← Distanza dal bordo sinistro */
    bottom: 180px;        /* ← Distanza dal bordo inferiore */
    background: white;
    border: 3px solid #333;
    border-radius: 20px;
    padding: 20px 25px;   /* ← Spazio interno */
    max-width: 350px;     /* ← Larghezza massima */
    font-size: 18px;      /* ← Dimensione testo */
    color: #333;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 25;          /* ← Livello di sovrapposizione */
}
```

**Come modificare**:
- `left: 240px` → Posizione orizzontale
- `bottom: 180px` → Posizione verticale
- `max-width: 350px` → Larghezza massima del fumetto
- `font-size: 18px` → Dimensione del testo
- `padding: 20px 25px` → Spazio interno (verticale orizzontale)

### 3. Container delle Mani (Hands Container)

**Classe CSS**: `.hands-container`
**Posizione attuale**: Centro in basso
**File**: `simulazione.html` (righe ~175-185)

```css
.hands-container {
    position: fixed;
    left: 50%;            /* ← Centro orizzontale */
    bottom: 100px;        /* ← Distanza dal bordo inferiore */
    transform: translateX(-50%); /* ← Centra l'elemento */
    display: flex;
    gap: 30px;            /* ← Spazio tra le mani */
    z-index: 15;          /* ← Livello di sovrapposizione */
}
```

**Come modificare**:
- `left: 50%` → Posizione orizzontale (50% = centro)
- `bottom: 100px` → Distanza dal basso
- `gap: 30px` → Spazio tra le due mani

### 4. Mani Individuali (Individual Hands)

**Classe CSS**: `.hand`
**File**: `simulazione.html` (righe ~187-200)

```css
.hand {
    width: 90px;          /* ← Larghezza */
    height: 90px;         /* ← Altezza */
    cursor: grab;
    transition: transform 0.2s ease;
}
```

**Come modificare**:
- `width: 90px` → Larghezza delle mani
- `height: 90px` → Altezza delle mani

### 5. Ampolla (Flask)

**Classe CSS**: `.flask`
**Posizione attuale**: Centro
**File**: `simulazione.html` (righe ~220-230)

```css
.flask {
    left: 50%;            /* ← Centro orizzontale */
    bottom: 140px;        /* ← Distanza dal bordo inferiore */
    transform: translateX(-50%); /* ← Centra l'elemento */
    width: 70px;          /* ← Larghezza */
    height: 90px;         /* ← Altezza */
}
```

**Come modificare**:
- `left: 50%` → Posizione orizzontale
- `bottom: 140px` → Distanza dal basso
- `width: 70px` → Larghezza dell'ampolla
- `height: 90px` → Altezza dell'ampolla

### 6. Provetta (Test Tube)

**Classe CSS**: `.test-tube`
**Posizione attuale**: Destra
**File**: `simulazione.html` (righe ~235-245)

```css
.test-tube {
    right: 120px;         /* ← Distanza dal bordo destro */
    bottom: 140px;        /* ← Distanza dal bordo inferiore */
    width: 50px;          /* ← Larghezza */
    height: 70px;         /* ← Altezza */
}
```

**Come modificare**:
- `right: 120px` → Distanza dal bordo destro
- `bottom: 140px` → Distanza dal basso
- `width: 50px` → Larghezza della provetta
- `height: 70px` → Altezza della provetta

### 7. Supporto Provette (Test Tube Rack)

**Classe CSS**: `.test-tube-rack`
**Posizione attuale**: Destra
**File**: `simulazione.html` (righe ~250-260)

```css
.test-tube-rack {
    right: 100px;         /* ← Distanza dal bordo destro */
    bottom: 120px;        /* ← Distanza dal bordo inferiore */
    width: 90px;          /* ← Larghezza */
    height: 110px;        /* ← Altezza */
}
```

**Come modificare**:
- `right: 100px` → Distanza dal bordo destro
- `bottom: 120px` → Distanza dal basso
- `width: 90px` → Larghezza del supporto
- `height: 110px` → Altezza del supporto

### 8. Pulsante Continua (Continue Button)

**Classe CSS**: `.continue-btn`
**Posizione attuale**: Basso al centro
**File**: `simulazione.html` (righe ~265-280)

```css
.continue-btn {
    position: fixed;
    bottom: 30px;         /* ← Distanza dal bordo inferiore */
    left: 50%;            /* ← Centro orizzontale */
    transform: translateX(-50%); /* ← Centra l'elemento */
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 15px 30px;   /* ← Spazio interno */
    border-radius: 25px;
    font-size: 18px;      /* ← Dimensione testo */
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    z-index: 30;          /* ← Livello di sovrapposizione */
}
```

**Come modificare**:
- `bottom: 30px` → Distanza dal basso
- `left: 50%` → Posizione orizzontale (centro)
- `padding: 15px 30px` → Spazio interno
- `font-size: 18px` → Dimensione del testo

## 🎨 Elementi di Controllo

### Titolo della Simulazione

**Classe CSS**: `.simulation-header`
**File**: `simulazione.html` (righe ~70-80)

```css
.simulation-header {
    position: absolute;
    top: 20px;            /* ← Distanza dal bordo superiore */
    left: 20px;           /* ← Distanza dal bordo sinistro */
    color: white;
    font-size: 24px;      /* ← Dimensione testo */
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
```

### Pulsante Termina Simulazione

**Classe CSS**: `.termina-simulazione-btn`
**File**: `simulazione.html` (righe ~85-105)

```css
.termina-simulazione-btn {
    position: absolute;
    top: 20px;            /* ← Distanza dal bordo superiore */
    right: 20px;          /* ← Distanza dal bordo destro */
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    border: none;
    padding: 12px 24px;   /* ← Spazio interno */
    border-radius: 25px;
    font-size: 16px;      /* ← Dimensione testo */
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
}
```

## 📱 Responsive Design

### Breakpoint Mobile (max-width: 768px)

**File**: `simulazione.html` (righe ~300-350)

```css
@media (max-width: 768px) {
    .simulation-header {
        font-size: 18px;      /* ← Dimensione testo mobile */
        top: 10px;            /* ← Posizione mobile */
        left: 10px;
    }

    .termina-simulazione-btn {
        top: 10px;            /* ← Posizione mobile */
        right: 10px;
        padding: 8px 16px;    /* ← Spazio interno mobile */
        font-size: 14px;      /* ← Dimensione testo mobile */
    }

    .water-drop-character {
        left: 20px;           /* ← Posizione mobile */
        bottom: 60px;
        width: 80px;          /* ← Dimensione mobile */
        height: 80px;
    }

    .speech-bubble {
        left: 120px;          /* ← Posizione mobile */
        bottom: 100px;
        max-width: 200px;     /* ← Larghezza mobile */
        font-size: 14px;      /* ← Dimensione testo mobile */
    }

    .hands-container {
        bottom: 40px;         /* ← Posizione mobile */
        gap: 10px;            /* ← Spazio mobile */
    }

    .hand {
        width: 60px;          /* ← Dimensione mobile */
        height: 60px;
    }
}
```

## 🔧 Come Modificare

### 1. Apri il file
```bash
# Apri il file simulazione.html
code simulazione.html
```

### 2. Trova la sezione CSS
Cerca il tag `<style>` nel file (circa riga 50)

### 3. Modifica le proprietà
Cambia i valori delle proprietà CSS come mostrato sopra

### 4. Salva e testa
Salva il file e ricarica la pagina per vedere le modifiche

## 📏 Unità di Misura

- **px**: Pixel (es. `80px`)
- **%**: Percentuale (es. `50%` = centro)
- **em**: Unità relativa al font (es. `1.2em`)
- **rem**: Unità relativa al root font (es. `1.5rem`)

## 🎯 Z-Index (Livelli di Sovrapposizione)

- **10-15**: Elementi di base (mani, provette)
- **20**: Personaggio goccia
- **25**: Fumetto di dialogo
- **30**: Pulsanti e controlli
- **1000**: Elementi trascinati

## 🎮 Implementazione Drag & Drop

### Aggiungere un Nuovo Elemento Trascinabile

**1. Nel JavaScript (simulazione.js)**:
```javascript
// Definisci l'elemento negli SIMULATION_STEPS
{
    type: "nome-elemento", 
    image: "percorso/immagine.png", 
    draggable: true, 
    id: "id-univoco"
}

// Oppure per drop zone
{
    type: "nome-elemento", 
    image: "percorso/immagine.png", 
    dropZone: true, 
    id: "id-drop-zone"
}
```

**2. Gestione dell'interazione**:
```javascript
// In handleDrop() aggiungi il nuovo caso
if (step.requiredAction === 'nuova-azione' && 
    draggedElement.dataset.id === 'id-univoco') {
    // Azione completata correttamente
    showSuccessAnimation(draggedElement, dropZone);
    setTimeout(() => {
        nextStep();
    }, 1500);
}
```

### Funzioni Transform Disponibili

**1. startDrag()**: Inizializza il trascinamento
- Memorizza posizione iniziale del touch/mouse
- Aggiunge classe `dragging`
- Attiva event listeners

**2. onDrag()**: Gestisce il movimento
- Calcola delta dal punto iniziale
- Applica `transform: translate(deltaX, deltaY) scale(1.1)`
- Mantiene z-index elevato

**3. endDrag()**: Finalizza l'interazione
- Controlla sovrapposizione con drop zones
- Resetta `transform` se non droppato
- Pulisce dati temporanei

**4. handleDrop()**: Gestisce il rilascio
- Verifica azione corretta
- Mostra animazioni di feedback
- Avanza al prossimo step

### CSS per Elementi Trascinabili

```css
.elemento.draggable {
    cursor: grab;
    border: 3px dashed #4CAF50;
    border-radius: 10px;
    padding: 5px;
    background: rgba(76, 175, 80, 0.1);
    animation: pulse 2s infinite;
    transition: transform 0.2s ease;
}

.elemento.draggable:hover {
    background: rgba(76, 175, 80, 0.2);
    transform: scale(1.05);
}

.elemento.dragging {
    z-index: 1000;
    /* transform viene applicato dinamicamente */
}
```

### Animazioni di Feedback

**Successo**:
```javascript
function showSuccessAnimation(draggedElement, dropZone) {
    dropZone.classList.add('success-animation');
    // Mostra messaggio di successo
    // Rimuovi animazione dopo 1.5s
}
```

**Errore**:
```javascript
function showErrorFeedback() {
    // Mostra messaggio "Prova di nuovo!"
    // Feedback visivo rosso
}
```

## 💡 Suggerimenti

1. **Testa sempre** dopo ogni modifica
2. **Usa la console del browser** per debug
3. **Mantieni proporzioni** per elementi correlati
4. **Considera il responsive** per dispositivi mobili
5. **Z-index**: Elementi con z-index più alto appaiono sopra
6. **Transform**: Usa sempre `transform` per il drag, mai `position`
7. **Animazioni**: Aggiungi sempre feedback visivo per le interazioni

## 🐛 Debug

### Se un elemento non appare:
1. Controlla che la classe CSS sia corretta
2. Verifica che l'elemento sia presente nel DOM
3. Controlla la console per errori JavaScript
4. Verifica che l'immagine dell'elemento esista

### Se il drag & drop non funziona:
1. **Controlla la console**: Verifica errori JavaScript
2. **Event listeners**: Assicurati che `{ passive: false }` sia presente
3. **ID elementi**: Controlla che gli ID siano univoci e corretti
4. **Overlap detection**: Verifica che `isOverlapping()` funzioni
5. **Transform reset**: Assicurati che `transform` venga resettato

### Debug del Transform System:
```javascript
// Aggiungi questi log per debug
console.log('🎯 Start drag:', draggedElement.dataset.id);
console.log('📍 Touch iniziale:', touch.clientX, touch.clientY);
console.log('🔄 Movimento:', deltaX, deltaY);
console.log('✅ Drop su:', dropZone.dataset.id);
```

### Messaggi Console Importanti:
- `🎯 Simulazione: Inizio drag per elemento:` - Drag iniziato
- `🔄 Movimento:` - Coordinate di movimento
- `✅ Simulazione: Mano destra trascinata correttamente!` - Drop riuscito
- `❌ Simulazione: Errore caricamento immagine:` - Immagine mancante

## 📋 Checklist per Nuovi Elementi

### ✅ JavaScript (simulazione.js)
- [ ] Aggiunto negli `SIMULATION_STEPS`
- [ ] Configurato `draggable: true` o `dropZone: true`
- [ ] ID univoco assegnato
- [ ] Caso aggiunto in `handleDrop()`
- [ ] `requiredAction` definito

### ✅ CSS (simulazione.html)
- [ ] Posizione fissa definita
- [ ] Dimensioni corrette
- [ ] Z-index appropriato
- [ ] Stili hover per elementi trascinabili
- [ ] Responsive design considerato

### ✅ Risorse
- [ ] Immagine presente in `simulazioneFoto/`
- [ ] Percorso immagine corretto
- [ ] Immagine ottimizzata per web

### ✅ Test
- [ ] Elemento visibile nella posizione corretta
- [ ] Drag & drop funzionante
- [ ] Feedback animazioni presenti
- [ ] Funziona su mobile
- [ ] Console senza errori 