/**
 * Simulazione Interattiva - FuturaLab
 * Gestisce le simulazioni di tipo 0 (non video)
 */

// Variabili globali
let currentStep = 0;
let currentUser = null;
let currentSimulazione = null;
let simulationMonitoringInterval = null;
let draggedElement = null;
let isSimulationFinished = false;

// Stati della simulazione basati sulle immagini del Figma
const SIMULATION_STEPS = [
    {
        id: 0,
        title: "Inizio Esperimento",
        speechText: "Che l'esperimento abbia inizio... Iniziamo afferrando l'ampolla con il bicarbonato",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png" },
            { type: "right-hand", image: "simulazioneFoto/Pugno destro.png", draggable: true, id: "right-hand-draggable" },
            { type: "flask", image: "simulazioneFoto/Bicarbonato.png", dropZone: true, id: "flask-bicarbonato" },
            { type: "test-tube-rack", image: "simulazioneFoto/provetta mantenuta.png" }
        ],
        requiredAction: "drag-right-hand-to-flask"
    },
    {
        id: 1,
        title: "Afferrare la Provetta",
        speechText: "Ben fatto, ora afferra la provetta contenente il succo di limone",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png", draggable: true, id: "left-hand-draggable" },
            { type: "right-hand", image: "simulazioneFoto/Mano destra bicarbonato.png" },
            //{ type: "flask", image: "simulazioneFoto/Bicarbonato.png" },
            { type: "test-tube-rack", image: "simulazioneFoto/provetta mantenuta.png", dropZone: true, id: "test-tube-drop-zone" }
        ],
        requiredAction: "drag-left-hand-to-test-tube"
    },
    {
        id: 2,
        title: "Versare il Contenuto",
        speechText: "Ottimo ora non ci resta che versare il contenuto della provetta all'interno dell'ampolla",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Sinistra provetta.png", draggable: true, id: "left-hand-draggable-step2" },
            { type: "right-hand", image: "simulazioneFoto/Mano destra bicarbonato.png", dropZone: true, id: "right-hand-drop-zone" },
            //{ type: "flask", image: "simulazioneFoto/Bicarbonato.png", dropZone: true, id: "flask-drop-zone" },
            //{ type: "test-tube-rack", image: "simulazioneFoto/provetta acqua.png", draggable: true, id: "test-tube-draggable" }
        ],
        requiredAction: "drag-left-hand-to-right-hand"
    },
    {
        id: 3,
        title: "Aspettare la Reazione",
        speechText: "Bravissimo, ora aspettiamo che la reazione abbia inizio e posiamo gli strumenti sul tavolo",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            //{ type: "left-hand", image: "simulazioneFoto/Mani che versano.png" },
            //{ type: "right-hand", image: "simulazioneFoto/Destra con provetta.png" },
            { type: "flask", image: "simulazioneFoto/versare bicarbonato.png" }
        ],
        requiredAction: "wait-reaction"
    },
    {
        id: 4,
        title: "Reazione Acida",
        speechText: "Wow, si è formata tantissima schiuma! Questo significa che il succo di limone è una soluzione acida.",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png" },
            { type: "right-hand", image: "simulazioneFoto/Pugno destro.png" },
            { type: "flask", image: "simulazioneFoto/Ampolla esplosiva.png" }
        ],
        requiredAction: "observe-acid-reaction"
    },
    {
        id: 5,
        title: "Spiegazione pH",
        speechText: "Una sostanza è acida quando il suo pH è minore di 7. Quello del succo di limone è 2.",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png" },
            { type: "right-hand", image: "simulazioneFoto/Pugno destro.png" },
            { type: "flask", image: "simulazioneFoto/Ampolla esplosiva.png" }
        ],
        requiredAction: "understand-ph"
    },
    {
        id: 6,
        title: "Test con Acqua",
        speechText: "E se invece mischiassimo il bicarbonato con l'acqua?",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png" },
            { type: "right-hand", image: "simulazioneFoto/Pugno destro.png" },
            { type: "flask", image: "simulazioneFoto/Bicarbonato.png" },
            { type: "test-tube", image: "simulazioneFoto/provetta acqua.png" }
        ],
        requiredAction: "wait-step6"
    },
    {
        id: 7,
        title: "Test con Acqua",
        speechText: "E se invece mischiassimo il bicarbonato con l'acqua?, come prima cosa afferriamo l’ampolla con il bicarbonato",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png" },
            { type: "right-hand", image: "simulazioneFoto/Pugno destro.png", draggable: true, id: "right-hand-draggable-step7" },
            { type: "flask", image: "simulazioneFoto/Bicarbonato.png", dropZone: true, id: "flask-drop-zone-2" },
            { type: "test-tube", image: "simulazioneFoto/provetta acqua.png" }
        ],
        requiredAction: "drag-right-hand-to-flask-step7"
    },
    {
        id: 8,
        title: "Test con Acqua",
        speechText: "Sta andando benissimo, ora afferra la provetta con l'acqua",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png" , draggable: true, id: "left-hand-draggable-step8" },
            { type: "right-hand", image: "simulazioneFoto/Mano destra bicarbonato.png"},
            //{ type: "flask", image: "simulazioneFoto/Bicarbonato.png", dropZone: true, id: "flask-drop-zone-2" },
            { type: "test-tube", image: "simulazioneFoto/provetta acqua.png", dropZone: true, id: "test-tube-drop-zone-step8" }
        ],
        requiredAction: "drag-left-hand-to-test-tube-step8"
    },
    {
        id: 9,
        title: "Reazione Neutra",
        speechText: "Ops, stavolta non è successo niente. L'acqua è neutra! Il suo pH è 7",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno sinistro.png", draggable: true, id: "left-hand-draggable-step7" },
            { type: "right-hand", image: "simulazioneFoto/mano destra bicarbonato.png" },
            //{ type: "flask", image: "simulazioneFoto/Acqua in bicarbonato.png" }
            { type: "test-tube", image: "simulazioneFoto/provetta acqua.png", dropZone: true, id: "test-tube-drop-zone-step7" }
        ],
        requiredAction: "drag-left-hand-to-test-tube-step8"
    },
    {
        id: 10,
        title: "Fine Lezione",
        speechText: "Hai fatto davvero un ottimo lavoro qui, per oggi la nostra lezione di chimica finisce qui",
        elements: [
            { type: "water-drop", image: "simulazioneFoto/mascotte.png" },
            { type: "left-hand", image: "simulazioneFoto/Pugno destro.png" },
            { type: "right-hand", image: "simulazioneFoto/Pugno sinistro.png" }
        ],
        requiredAction: "finish-simulation"
    }
];

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simulazione: DOM caricato, inizializzazione...');
    try {
        initializeSimulation();
    } catch (error) {
        console.error('❌ Errore durante l\'inizializzazione:', error);
        alert('Errore durante l\'inizializzazione della simulazione: ' + error.message);
    }
});

async function initializeSimulation() {
    try {
        console.log('🔍 Simulazione: Inizializzazione...');
        updateDebugInfo('Inizializzazione...');
        
        // Recupera i dati della sessione
        currentUser = getUserFromSession();
        console.log('👤 Simulazione: Utente dalla sessione:', currentUser);
        
        if (!currentUser) {
            console.error('❌ Simulazione: Utente non trovato nella sessione');
            updateDebugInfo('❌ Utente non trovato');
            alert('Utente non trovato. Effettua il login.');
            window.location.href = 'index.html';
            return;
        }

        // Recupera i dati della simulazione dall'URL
        const urlParams = new URLSearchParams(window.location.search);
        const simulazioneId = urlParams.get('simulazioneId');
        console.log('🎯 Simulazione: ID simulazione dall\'URL:', simulazioneId);
        
        if (!simulazioneId) {
            console.error('❌ Simulazione: ID simulazione non trovato nell\'URL');
            updateDebugInfo('❌ ID simulazione non trovato');
            alert('ID simulazione non trovato.');
            window.location.href = 'index.html';
            return;
        }

        // Carica i dati della simulazione
        console.log('📊 Simulazione: Caricamento dati simulazione...');
        updateDebugInfo('Caricamento dati simulazione...');
        await loadSimulazioneData(simulazioneId);
        
        // Avvia il monitoring
        console.log('🔄 Simulazione: Avvio monitoring...');
        updateDebugInfo('Avvio monitoring...');
        startSimulationMonitoring();
        
        // Mostra il primo step
        console.log('🎬 Simulazione: Mostra primo step...');
        updateDebugInfo('Mostra primo step...');
        showCurrentStep();
        
        // Nascondi il loading
        console.log('✅ Simulazione: Inizializzazione completata');
        updateDebugInfo('✅ Simulazione pronta!');
        hideLoading();
        
    } catch (error) {
        console.error('❌ Simulazione: Errore durante l\'inizializzazione:', error);
        alert('Errore durante l\'inizializzazione: ' + error.message);
        hideLoading();
    }
}

async function loadSimulazioneData(simulazioneId) {
    try {
        // Simula il caricamento dei dati della simulazione
        // In un'implementazione reale, qui faresti una chiamata API
        currentSimulazione = {
            id: simulazioneId,
            titolo: "Esperimento di Chimica",
            tipo: 0,
            stato: "in_corso"
        };
    } catch (error) {
        console.error('Errore nel caricamento dati simulazione:', error);
        throw error;
    }
}

function showCurrentStep() {
    console.log('🎬 Simulazione: Mostra step corrente:', currentStep);
    const step = SIMULATION_STEPS[currentStep];
    if (!step) {
        console.error('❌ Simulazione: Step non trovato per indice:', currentStep);
        return;
    }

    console.log('📋 Simulazione: Step da mostrare:', step);
    const desk = document.querySelector('.simulation-desk');
    if (!desk) {
        console.error('❌ Simulazione: Elemento .simulation-desk non trovato');
        return;
    }
    
    desk.innerHTML = '';

    // Aggiungi il personaggio goccia
    const waterDrop = document.createElement('img');
    const waterDropImage = step.elements.find(el => el.type === 'water-drop')?.image || 'simulazioneFoto/felice.png';
    waterDrop.src = waterDropImage;
    waterDrop.className = 'water-drop-character';
    console.log('💧 Simulazione: Aggiunta goccia d\'acqua con immagine:', waterDropImage);
    desk.appendChild(waterDrop);

    // Aggiungi il fumetto di dialogo
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = step.speechText;
    console.log('💬 Simulazione: Aggiunto fumetto con testo:', step.speechText);
    desk.appendChild(speechBubble);

    // Aggiungi le mani solo se esistono negli elementi dello step
    const leftHandElement = step.elements.find(el => el.type === 'left-hand');
    const rightHandElement = step.elements.find(el => el.type === 'right-hand');
    
    // Crea il container delle mani solo se almeno una mano è presente
    if (leftHandElement || rightHandElement) {
        const handsContainer = document.createElement('div');
        handsContainer.className = 'hands-container';

        // Mano sinistra
        if (leftHandElement) {
            const leftHand = document.createElement('img');
            leftHand.src = leftHandElement.image;
            leftHand.className = 'hand';
            
            // Controlla se la mano sinistra è trascinabile
            if (leftHandElement.draggable) {
                leftHand.classList.add('draggable');
                leftHand.dataset.id = leftHandElement.id;
                leftHand.addEventListener('mousedown', startDrag, { passive: false });
                leftHand.addEventListener('touchstart', startDrag, { passive: false });
                console.log('🎯 Simulazione: Mano sinistra trascinabile aggiunta:', leftHandElement.id);
            }
            
            handsContainer.appendChild(leftHand);
        }

        // Mano destra
        if (rightHandElement) {
            const rightHand = document.createElement('img');
            rightHand.src = rightHandElement.image;
            rightHand.className = 'hand';
            
            // Controlla se la mano destra è trascinabile o drop zone
            if (rightHandElement.draggable) {
                rightHand.classList.add('draggable');
                rightHand.dataset.id = rightHandElement.id;
                rightHand.addEventListener('mousedown', startDrag, { passive: false });
                rightHand.addEventListener('touchstart', startDrag, { passive: false });
                console.log('🎯 Simulazione: Mano destra trascinabile aggiunta:', rightHandElement.id);
            } else if (rightHandElement.dropZone) {
                rightHand.classList.add('drop-zone');
                rightHand.dataset.dropZone = true;
                rightHand.dataset.id = rightHandElement.id;
                console.log('🎯 Simulazione: Mano destra drop zone aggiunta:', rightHandElement.id);
            }
            
            handsContainer.appendChild(rightHand);
        }
        
        desk.appendChild(handsContainer);
    }

    // Aggiungi gli elementi di laboratorio
    step.elements.forEach(element => {
        if (element.type !== 'water-drop' && element.type !== 'left-hand' && element.type !== 'right-hand') {
            const labElement = document.createElement('img');
            labElement.src = element.image;
            labElement.className = `lab-equipment ${element.type}`;
            
            // Aggiungi eventi per debug caricamento immagini
            labElement.onload = () => {
                console.log('✅ Simulazione: Immagine caricata:', element.image);
            };
            labElement.onerror = () => {
                console.error('❌ Simulazione: Errore caricamento immagine:', element.image);
            };
            
            if (element.draggable) {
                labElement.classList.add('draggable');
                labElement.dataset.id = element.id;
                labElement.addEventListener('mousedown', startDrag, { passive: false });
                labElement.addEventListener('touchstart', startDrag, { passive: false });
                console.log('🎯 Simulazione: Elemento trascinabile aggiunto:', element.id);
            }
            
            if (element.dropZone) {
                labElement.classList.add('drop-zone');
                labElement.dataset.dropZone = true;
                console.log('🎯 Simulazione: Zona di drop aggiunta per:', element.id);
            }
            
            console.log('🧪 Simulazione: Aggiunto elemento laboratorio:', element.type, 'con immagine:', element.image);
            desk.appendChild(labElement);
        }
    });

    // Gestisci step automatici (che non richiedono interazione)
    if (step.requiredAction === 'wait-reaction' || 
        step.requiredAction === 'observe-acid-reaction' || 
        step.requiredAction === 'understand-ph' || 
        step.requiredAction === 'observe-neutral-reaction' ||
        step.requiredAction === 'wait-step6' ||
        step.requiredAction === 'finish-simulation') {
        
        // Aggiungi un pulsante "Continua" per questi step
        const continueBtn = document.createElement('button');
        continueBtn.textContent = 'Continua';
        continueBtn.className = 'continue-btn';
        continueBtn.onclick = () => {
            setTimeout(() => {
                nextStep();
            }, 500);
        };
        desk.appendChild(continueBtn);
    }
}

// Funzioni per il drag and drop
function startDrag(e) {
    e.preventDefault();
    draggedElement = e.target;
    draggedElement.classList.add('dragging');
    
    // Memorizza solo la posizione iniziale del touch/mouse
    const touch = e.touches ? e.touches[0] : e;
    draggedElement.dataset.startX = touch.clientX;
    draggedElement.dataset.startY = touch.clientY;
    
    console.log('🎯 Simulazione: Inizio drag per elemento:', draggedElement.dataset.id);
    console.log('📍 Touch iniziale:', touch.clientX, touch.clientY);
    
    document.addEventListener('mousemove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag, { passive: false });
}

function onDrag(e) {
    if (!draggedElement) return;
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    
    // Calcola il movimento dal punto di inizio
    const startX = parseFloat(draggedElement.dataset.startX);
    const startY = parseFloat(draggedElement.dataset.startY);
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    // Usa transform invece di position per evitare di rompere il layout
    draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
    draggedElement.style.zIndex = '1000';
    
    console.log('🔄 Movimento:', deltaX, deltaY);
}

function endDrag(e) {
    if (!draggedElement) return;
    
    e.preventDefault();
    
    const dropZones = document.querySelectorAll('[data-drop-zone="true"]');
    let dropped = false;
    
    dropZones.forEach(zone => {
        if (isOverlapping(draggedElement, zone)) {
            handleDrop(draggedElement, zone);
            dropped = true;
        }
    });
    
    if (!dropped) {
        // Riporta l'elemento alla posizione originale
        draggedElement.style.transform = '';
        draggedElement.style.zIndex = '';
    }
    
    draggedElement.classList.remove('dragging');
    
    // Pulisci i dati temporanei
    delete draggedElement.dataset.startX;
    delete draggedElement.dataset.startY;
    
    draggedElement = null;
    
    document.removeEventListener('mousemove', onDrag, { passive: false });
    document.removeEventListener('mouseup', endDrag, { passive: false });
    document.removeEventListener('touchmove', onDrag, { passive: false });
    document.removeEventListener('touchend', endDrag, { passive: false });
}

function isOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function handleDrop(draggedElement, dropZone) {
    const step = SIMULATION_STEPS[currentStep];
    
    // Verifica se l'azione è corretta
    if (step.requiredAction === 'drag-right-hand-to-flask' && 
        draggedElement.dataset.id === 'right-hand-draggable') {
        // Primo step: mano destra trascinata sull'ampolla
        console.log('✅ Simulazione: Mano destra trascinata correttamente sull\'ampolla!');
        showSuccessAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 1500);
    } else if (step.requiredAction === 'drag-left-hand-to-test-tube' && 
        draggedElement.dataset.id === 'left-hand-draggable') {
        // Secondo step: mano sinistra trascinata sulla provetta
        console.log('✅ Simulazione: Mano sinistra trascinata correttamente sulla provetta!');
        showSuccessAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 1500);
    } else if (step.requiredAction === 'drag-left-hand-to-right-hand' && 
        draggedElement.dataset.id === 'left-hand-draggable-step2') {
        // Step 2: mano sinistra trascinata sulla mano destra
        console.log('✅ Simulazione: Mano sinistra trascinata correttamente sulla mano destra!');
        showSuccessAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 1500);
    } else if (step.requiredAction === 'drag-right-hand-to-flask-step7' && 
        draggedElement.dataset.id === 'right-hand-draggable-step7') {
        // Step 6: mano destra trascinata sull'ampolla
        console.log('✅ Simulazione: Mano destra trascinata correttamente sull\'ampolla!');
        showSuccessAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 1500);
    } else if (step.requiredAction === 'drag-left-hand-to-test-tube-step8' && 
        draggedElement.dataset.id === 'left-hand-draggable-step8') {
        // Step 8: mano sinistra trascinata sulla provetta
        console.log('✅ Simulazione: Mano sinistra trascinata correttamente sulla provetta!');
        showSuccessAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 1500);
    } else if (step.requiredAction === 'pour-test-tube-into-flask' && 
        draggedElement.dataset.id === 'test-tube-draggable') {
        // Reazione corretta - mostra animazione
        showReactionAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 2000);
    } else if (step.requiredAction === 'mix-bicarbonato-water' && 
               draggedElement.dataset.id === 'test-tube-water') {
        // Reazione corretta - mostra animazione
        showReactionAnimation(draggedElement, dropZone);
        setTimeout(() => {
            nextStep();
        }, 2000);
    } else {
        // Azione non corretta, riporta l'elemento
        draggedElement.style.transform = '';
        draggedElement.style.zIndex = '';
        
        // Mostra feedback visivo di errore
        showErrorFeedback();
    }
}

function showSuccessAnimation(draggedElement, dropZone) {
    // Animazione di successo per il primo step
    console.log('🎉 Simulazione: Mostra animazione di successo');
    
    // Aggiungi classe per animazione di successo
    dropZone.classList.add('success-animation');
    
    // Feedback visivo positivo
    const successFeedback = document.createElement('div');
    successFeedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        z-index: 1000;
        font-size: 20px;
        font-weight: bold;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        animation: fadeInOut 1.5s ease-in-out;
    `;
    successFeedback.textContent = '✅ Ottimo lavoro!';
    document.body.appendChild(successFeedback);
    
    // Rimuovi il feedback dopo l'animazione
    setTimeout(() => {
        successFeedback.remove();
        dropZone.classList.remove('success-animation');
    }, 1500);
}

function showReactionAnimation(draggedElement, dropZone) {
    // Aggiungi classe per animazione
    dropZone.classList.add('reaction-animation');
    
    // Cambia l'immagine per mostrare la reazione
    if (currentStep === 2) {
        // Reazione acida
        dropZone.src = 'simulazioneFoto/Acqua in bicarbonato.png';
    } else if (currentStep === 6) {
        // Reazione neutra
        dropZone.src = 'simulazioneFoto/Acqua in bicarbonato.png';
    }
    
    // Nascondi l'elemento trascinato
    draggedElement.style.display = 'none';
    
    // Rimuovi l'animazione dopo 2 secondi
    setTimeout(() => {
        dropZone.classList.remove('reaction-animation');
    }, 2000);
}

function showErrorFeedback() {
    // Crea un feedback visivo per l'errore
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        font-size: 18px;
        font-weight: bold;
    `;
    feedback.textContent = 'Prova di nuovo!';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1500);
}

function nextStep() {
    currentStep++;
    
    if (currentStep >= SIMULATION_STEPS.length) {
        // Simulazione completata
        finishSimulation();
    } else {
        showCurrentStep();
    }
}

async function finishSimulation() {
    isSimulationFinished = true;
    
    try {
        // Imposta lo stato della simulazione come finita
        await setStudentSimulationFinished();
        
        // Mostra il banner di valutazione
        showRatingBanner();
        
    } catch (error) {
        console.error('Errore durante il completamento della simulazione:', error);
    }
}

async function setStudentSimulationFinished() {
    try {
        const response = await fetch('/api/simulazione/finish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studenteId: currentUser.id,
                simulazioneId: currentSimulazione.id
            })
        });

        if (!response.ok) {
            throw new Error('Errore nel completamento della simulazione');
        }

        return await response.json();
    } catch (error) {
        console.error('Errore nel completamento simulazione:', error);
        throw error;
    }
}

function showRatingBanner() {
    // Crea il banner di valutazione
    const banner = document.createElement('div');
    banner.className = 'rating-banner';
    banner.innerHTML = `
        <div class="rating-content">
            <h3>Valuta la simulazione</h3>
            <div class="rating-stars">
                <span class="star" data-rating="1">⭐</span>
                <span class="star" data-rating="2">⭐</span>
                <span class="star" data-rating="3">⭐</span>
                <span class="star" data-rating="4">⭐</span>
                <span class="star" data-rating="5">⭐</span>
            </div>
            <div class="rating-buttons">
                <button id="skip-rating">Salta</button>
                <button id="submit-rating">Invia</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Aggiungi eventi per le stelle
    const stars = banner.querySelectorAll('.star');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            stars.forEach((s, i) => {
                s.style.color = i < selectedRating ? '#FFD700' : '#ccc';
            });
        });
    });
    
    // Aggiungi eventi per i pulsanti
    banner.querySelector('#skip-rating').addEventListener('click', () => {
        submitRating(0);
    });
    
    banner.querySelector('#submit-rating').addEventListener('click', () => {
        submitRating(selectedRating);
    });
}

async function submitRating(rating) {
    try {
        const response = await fetch('/api/simulazione/rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studenteId: currentUser.id,
                simulazioneId: currentSimulazione.id,
                rating: rating
            })
        });

        if (!response.ok) {
            throw new Error('Errore nell\'invio della valutazione');
        }

        // Rimuovi il banner
        const banner = document.querySelector('.rating-banner');
        if (banner) {
            banner.remove();
        }

        // Ritorna alla pagina principale con flag per controllare nuove attività
        window.location.href = 'index.html?fromSimulation=true';

    } catch (error) {
        console.error('Errore nell\'invio valutazione:', error);
        // In caso di errore, ritorna comunque alla pagina principale
        window.location.href = 'index.html?fromSimulation=true';
    }
}

function startSimulationMonitoring() {
    simulationMonitoringInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/simulazione/status/${currentSimulazione.id}`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.stato === 'terminata' && !isSimulationFinished) {
                    // La simulazione è stata terminata dall'insegnante
                    clearInterval(simulationMonitoringInterval);
                    showRatingBanner();
                }
            }
        } catch (error) {
            console.error('Errore nel monitoring della simulazione:', error);
        }
    }, 5000); // Controlla ogni 5 secondi
}

function stopSimulationMonitoring() {
    if (simulationMonitoringInterval) {
        clearInterval(simulationMonitoringInterval);
        simulationMonitoringInterval = null;
    }
}

function terminaSimulazione() {
    if (confirm('Sei sicuro di voler terminare la simulazione?')) {
        // Termina immediatamente e torna alla pagina principale
        window.location.href = 'index.html?fromSimulation=true';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function updateDebugInfo(message) {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.textContent = message;
        console.log('🔍 Debug Info:', message);
    }
}

// Funzioni di utilità per la sessione
function getUserFromSession() {
    console.log('🔍 Simulazione: Recupero utente da localStorage...');
    
    // Prova prima localStorage (come nella VR)
    let userData = localStorage.getItem('futuralab_user');
    console.log('📦 Simulazione: Dati utente da localStorage:', userData);
    
    if (!userData) {
        // Fallback su sessionStorage (per compatibilità)
        console.log('🔄 Simulazione: Prova sessionStorage...');
        userData = sessionStorage.getItem('user');
        console.log('📦 Simulazione: Dati utente da sessionStorage:', userData);
    }
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('✅ Simulazione: Utente parsato:', user);
            return user;
        } catch (error) {
            console.error('❌ Simulazione: Errore parsing utente:', error);
            return null;
        }
    } else {
        console.log('❌ Simulazione: Nessun dato utente trovato');
        return null;
    }
}

// Cleanup quando la pagina viene chiusa
window.addEventListener('beforeunload', () => {
    stopSimulationMonitoring();
});

// Stili CSS per il banner di valutazione
const ratingStyles = `
    .rating-banner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .rating-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .rating-stars {
        margin: 20px 0;
        font-size: 30px;
    }

    .star {
        cursor: pointer;
        margin: 0 5px;
        transition: color 0.2s ease;
    }

    .rating-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .rating-buttons button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }

    .rating-buttons button:first-child {
        background: #ccc;
        color: #333;
    }

    .rating-buttons button:last-child {
        background: #4CAF50;
        color: white;
    }
`;

// Aggiungi gli stili al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = ratingStyles;
document.head.appendChild(styleSheet); 