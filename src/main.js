/**
 * Simulazione Educativa VR - Three.js
 * Script principale per la gestione della scena 3D
 */

// Variabili globali per la scena Three.js
let scene, camera, renderer, controls;
let classroomModel, provettaModel;
let loadedProvette = []; // Array per tenere traccia delle provette caricate
let raycaster, mouse;
let isLoadingComplete = false;

// Colori per l'interazione con la provetta
const PROVETTA_COLORS = [
    0xff0000, // Rosso
    0x00ff00, // Verde
    0x0000ff, // Blu
    0xffff00, // Giallo
    0xff00ff, // Magenta
    0x00ffff  // Ciano
];
let currentColorIndex = 0;

// Variabili per i controlli FPS
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let fpControls;
let prevTime = performance.now();

// Costanti per il movimento e la camera
const MOVEMENT_SPEED = 10.0;
const JUMP_SPEED = 20.0;
const GRAVITY = 30.0;
const PLAYER_HEIGHT = 10.0; // Altezza della camera dal suolo
const MIN_CAMERA_HEIGHT = PLAYER_HEIGHT - 0.5; // Altezza minima per le collisioni

/**
 * Inizializza la scena Three.js
 */
function initScene() {
    // Creazione della scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Colore cielo

    // Configurazione della camera
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near plane
        1000 // Far plane
    );
    camera.position.set(10, PLAYER_HEIGHT, 10); // Posiziona la camera all'altezza corretta

    // Creazione del renderer
    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Configurazione dei controlli orbit
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2; // Impedisce di andare sotto il pavimento

    // Configurazione del raycaster per le interazioni
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    console.log('Scena Three.js inizializzata con successo');
}

/**
 * Aggiunge illuminazione alla scena
 */
function setupLighting() {
    // Luce ambientale
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Luce direzionale (simula il sole)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    
    // Configurazione delle ombre
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    
    scene.add(directionalLight);

    // Luce puntuale per maggiore dettaglio
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    console.log('Illuminazione configurata');
}

/**
 * Carica un modello GLB
 * @param {string} path - Percorso del file GLB
 * @param {Function} onLoad - Callback quando il modello è caricato
 * @param {Function} onError - Callback in caso di errore
 */
function loadGLBModel(path, onLoad, onError) {
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        path,
        (gltf) => {
            console.log(`Modello caricato: ${path}`);
            onLoad(gltf);
        },
        (progress) => {
            console.log(`Caricamento ${path}: ${(progress.loaded / progress.total * 100)}%`);
        },
        (error) => {
            console.error(`Errore nel caricamento di ${path}:`, error);
            if (onError) onError(error);
        }
    );
}

/**
 * Carica il modello della classroom
 */
function loadClassroom() {
    loadGLBModel(
        'models/low_poly_classroom.glb',
        (gltf) => {
            classroomModel = gltf.scene;
            
            // Scala e posiziona il modello
            classroomModel.scale.set(2, 2, 2); // Modifica questi valori in base alle dimensioni del tuo modello
            classroomModel.position.set(0, 0, 0);
            
            // Abilita le ombre per tutti i mesh
            classroomModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Migliora i materiali se necessario
                    if (child.material) {
                        child.material.metalness = 0.1;
                        child.material.roughness = 0.8;
                    }
                }
            });
            
            scene.add(classroomModel);
            console.log('Classroom caricata con successo');
        },
        (error) => {
            console.error('Errore nel caricamento della classroom:', error);
            console.log('Creo una classroom semplice come fallback');
            createSimpleClassroom();
        }
    );
}

/**
 * Crea una classroom semplice con geometrie basic
 */
function createSimpleClassroom() {
    // Pavimento
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Pareti
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    // Parete posteriore
    const backWallGeometry = new THREE.PlaneGeometry(20, 8);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 4, -10);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Parete sinistra
    const leftWallGeometry = new THREE.PlaneGeometry(20, 8);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-10, 4, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Scrivania semplice
    const deskGeometry = new THREE.BoxGeometry(4, 0.2, 2);
    const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 1, -5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Gambe della scrivania
    const legGeometry = new THREE.BoxGeometry(0.1, 1.8, 0.1);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    const positions = [
        [-1.8, 0.9, -5.8], [1.8, 0.9, -5.8],
        [-1.8, 0.9, -4.2], [1.8, 0.9, -4.2]
    ];
    
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        scene.add(leg);
    });

    console.log('Classroom semplice creata');
}

/**
 * Carica il modello della provetta
 */
function loadProvettaModel() {
    // Crea una provetta semplice se il modello GLB non esiste
    createSimpleProvetta();
    
    // Tentativo di caricamento del modello GLB (commentato per ora)
    /*
    loadGLBModel(
        'models/provetta.glb',
        (gltf) => {
            provettaModel = gltf.scene.clone();
            console.log('Modello provetta caricato con successo');
            hideLoadingMessage();
        },
        (error) => {
            console.log('Modello provetta non trovato, uso provetta semplice');
            createSimpleProvetta();
        }
    );
    */
}

/**
 * Crea una provetta semplice con geometrie basic
 */
function createSimpleProvetta() {
    const provettaGroup = new THREE.Group();
    
    // Corpo della provetta (cilindro)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 16);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    provettaGroup.add(body);
    
    // Tappo della provetta
    const capGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    const capMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.1;
    cap.castShadow = true;
    provettaGroup.add(cap);
    
    // Salva il modello per uso futuro
    provettaModel = provettaGroup;
    
    console.log('Provetta semplice creata');
    hideLoadingMessage();
}

/**
 * Aggiunge una provetta alla scena
 */
function addProvetta() {
    if (!provettaModel) {
        console.warn('Modello provetta non ancora caricato');
        return;
    }
    
    // Clona il modello della provetta
    const newProvetta = provettaModel.clone();
    
    // Posiziona la provetta casualmente sul tavolo
    const x = (Math.random() - 0.5) * 3;
    const z = -5 + (Math.random() - 0.5) * 1.5;
    newProvetta.position.set(x, 2.2, z);
    
    // Aggiungi proprietà personalizzate per l'interazione
    newProvetta.userData = {
        type: 'provetta',
        id: `provetta_${Date.now()}`,
        colorIndex: 0,
        isInteractive: true
    };
    
    // Aggiungi alla scena e all'array di tracciamento
    scene.add(newProvetta);
    loadedProvette.push(newProvetta);
    
    console.log(`Provetta aggiunta: ${newProvetta.userData.id}`);
}

/**
 * Gestisce l'interazione con la provetta
 * @param {THREE.Object3D} provetta - L'oggetto provetta cliccato
 */
function interactWithProvetta(provetta) {
    if (!provetta.userData || provetta.userData.type !== 'provetta') {
        return;
    }
    
    // Cambia colore della provetta
    provetta.userData.colorIndex = (provetta.userData.colorIndex + 1) % PROVETTA_COLORS.length;
    const newColor = PROVETTA_COLORS[provetta.userData.colorIndex];
    
    // Trova il mesh del corpo della provetta e cambia colore
    provetta.traverse((child) => {
        if (child.isMesh && child.material.color) {
            child.material.color.setHex(newColor);
        }
    });
    
    // Mostra un alert
    alert(`Provetta ${provetta.userData.id} - Colore cambiato!`);
    
    // Animazione di "rimbalzo"
    const originalY = provetta.position.y;
    provetta.position.y += 0.3;
    
    setTimeout(() => {
        provetta.position.y = originalY;
    }, 200);
    
    console.log(`Interazione con provetta: ${provetta.userData.id}`);
}

/**
 * Gestisce gli eventi del mouse
 */
function setupMouseEvents() {
    // Event listener per il click
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // Event listener per il movimento del mouse (per hover effects)
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
}

/**
 * Gestisce il click del mouse
 * @param {Event} event - Evento del mouse
 */
function onMouseClick(event) {
    // Calcola la posizione del mouse normalizzata
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Aggiorna il raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Trova gli oggetti intersecati
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // Risali nella gerarchia per trovare l'oggetto provetta
        let provetta = clickedObject;
        while (provetta && (!provetta.userData || provetta.userData.type !== 'provetta')) {
            provetta = provetta.parent;
        }
        
        if (provetta && provetta.userData && provetta.userData.type === 'provetta') {
            interactWithProvetta(provetta);
        }
    }
}

/**
 * Gestisce il movimento del mouse per effetti hover
 * @param {Event} event - Evento del mouse
 */
function onMouseMove(event) {
    // Calcola la posizione del mouse normalizzata
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Aggiorna il raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Trova gli oggetti intersecati
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Cambia il cursore se stiamo hovering su una provetta
    let isHoveringProvetta = false;
    
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        
        // Risali nella gerarchia per trovare l'oggetto provetta
        let provetta = hoveredObject;
        while (provetta && (!provetta.userData || provetta.userData.type !== 'provetta')) {
            provetta = provetta.parent;
        }
        
        if (provetta && provetta.userData && provetta.userData.type === 'provetta') {
            isHoveringProvetta = true;
        }
    }
    
    // Cambia il cursore
    renderer.domElement.style.cursor = isHoveringProvetta ? 'pointer' : 'grab';
}

/**
 * Inizializza i controlli in prima persona
 */
function initFPControls() {
    fpControls = new THREE.PointerLockControls(camera, document.body);

    // Elementi UI
    const startButton = document.getElementById('start-button');
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    document.body.appendChild(overlay);

    const menu = document.createElement('div');
    menu.id = 'pause-menu';
    menu.innerHTML = `
        <h2>Gioco in Pausa</h2>
        <button id="resume-button">Riprendi</button>
    `;
    overlay.appendChild(menu);

    // Crosshair
    const crosshair = document.createElement('div');
    crosshair.className = 'crosshair';
    document.body.appendChild(crosshair);

    // Event listeners per il pointer lock
    startButton.addEventListener('click', () => {
        fpControls.lock();
    });

    document.getElementById('resume-button').addEventListener('click', () => {
        fpControls.lock();
    });

    fpControls.addEventListener('lock', () => {
        document.body.classList.add('pointer-lock');
        overlay.style.display = 'none';
        controls.enabled = false; // Disabilita OrbitControls
    });

    fpControls.addEventListener('unlock', () => {
        document.body.classList.remove('pointer-lock');
        overlay.style.display = 'flex';
        controls.enabled = true; // Riabilita OrbitControls
    });

    // Gestione dei tasti
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

/**
 * Gestisce la pressione dei tasti
 */
function onKeyDown(event) {
    if (!fpControls.isLocked) return;

    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump) {
                velocity.y = JUMP_SPEED;
                canJump = false;
            }
            break;
    }
}

/**
 * Gestisce il rilascio dei tasti
 */
function onKeyUp(event) {
    if (!fpControls.isLocked) return;

    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

/**
 * Aggiorna il movimento del personaggio
 */
function updateMovement() {
    if (!fpControls.isLocked) return;

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    // Applica la gravità
    velocity.y -= GRAVITY * delta;

    // Calcola la direzione del movimento
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    // Muovi il personaggio
    if (moveForward || moveBackward) {
        fpControls.moveForward(direction.z * MOVEMENT_SPEED * delta);
    }
    if (moveLeft || moveRight) {
        fpControls.moveRight(direction.x * MOVEMENT_SPEED * delta);
    }

    // Applica il movimento verticale (salto/gravità)
    fpControls.getObject().position.y += velocity.y * delta;

    // Controlla la collisione con il pavimento
    if (fpControls.getObject().position.y < MIN_CAMERA_HEIGHT) {
        velocity.y = 0;
        fpControls.getObject().position.y = MIN_CAMERA_HEIGHT;
        canJump = true;
    }

    prevTime = time;
}

/**
 * Loop di animazione principale
 */
function animate() {
    requestAnimationFrame(animate);
    
    // Aggiorna il movimento FPS
    updateMovement();
    
    // Aggiorna i controlli orbit solo se non in modalità FPS
    if (!fpControls || !fpControls.isLocked) {
        controls.update();
    }
    
    // Animazione delle provette
    loadedProvette.forEach((provetta, index) => {
        if (provetta.userData && provetta.userData.type === 'provetta') {
            provetta.rotation.y += 0.005 * (index + 1);
        }
    });
    
    renderer.render(scene, camera);
}

/**
 * Gestisce il ridimensionamento della finestra
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Nasconde il messaggio di caricamento
 */
function hideLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.classList.add('hidden');
        isLoadingComplete = true;
    }
}

/**
 * Configura gli event listener per l'interfaccia utente
 */
function setupUI() {
    // Pulsante per aggiungere provette
    const addProvettaBtn = document.getElementById('add-provetta-btn');
    if (addProvettaBtn) {
        addProvettaBtn.addEventListener('click', addProvetta);
    }
    
    // Event listener per il ridimensionamento della finestra
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Funzione principale di inizializzazione
 */
function init() {
    console.log('Inizializzazione della simulazione educativa VR...');
    
    // Inizializza la scena Three.js
    initScene();
    
    // Configura l'illuminazione
    setupLighting();
    
    // Carica i modelli
    loadClassroom();
    loadProvettaModel();
    
    // Configura gli eventi del mouse
    setupMouseEvents();
    
    // Configura l'interfaccia utente
    setupUI();
    
    // Inizializza i controlli FPS
    initFPControls();
    
    // Posiziona la camera all'altezza corretta
    camera.position.set(10, PLAYER_HEIGHT, 10);
    
    // Avvia il loop di animazione
    animate();
    
    console.log('Simulazione educativa VR inizializzata con successo!');
}

// Avvia l'applicazione quando il DOM è caricato
document.addEventListener('DOMContentLoaded', init); 