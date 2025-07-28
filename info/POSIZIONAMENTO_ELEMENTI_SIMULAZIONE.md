# 📍 Guida al Posizionamento Elementi Simulazione

## Panoramica

Questo documento spiega come modificare le posizioni e dimensioni di tutti gli elementi nella pagina di simulazione (`simulazione.html`). Tutti gli elementi usano `position: fixed` per mantenere posizioni costanti indipendentemente dall'immagine di sfondo.

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

## 💡 Suggerimenti

1. **Testa sempre** dopo ogni modifica
2. **Usa la console del browser** per debug
3. **Mantieni proporzioni** per elementi correlati
4. **Considera il responsive** per dispositivi mobili
5. **Z-index**: Elementi con z-index più alto appaiono sopra

## 🐛 Debug

Se un elemento non appare:
1. Controlla che la classe CSS sia corretta
2. Verifica che l'elemento sia presente nel DOM
3. Controlla la console per errori JavaScript
4. Verifica che l'immagine dell'elemento esista 