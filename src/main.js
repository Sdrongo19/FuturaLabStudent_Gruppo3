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
let isUserLoggedIn = false; // Controlla se l'utente ha effettuato il login

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
const PLAYER_HEIGHT = 10.0; // Altezza della camera dal suolo (altezza occhi)
const PLAYER_BODY_HEIGHT = 6.0; // Altezza del corpo del personaggio
const PLAYER_FOOT_HEIGHT = 0.5; // Altezza dei piedi dal suolo
const MIN_CAMERA_HEIGHT = PLAYER_HEIGHT - 0.5; // Altezza minima per le collisioni

// Variabili per le collisioni
let collidableObjects = [];
const COLLISION_DISTANCE = 1.5; // Distanza di collisione ridotta per essere più precisi
const collisionRaycaster = new THREE.Raycaster();
const playerDirection = new THREE.Vector3();
const playerPosition = new THREE.Vector3();
const footPosition = new THREE.Vector3();

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
 * Controlla le collisioni a livello dei piedi del personaggio
 * @param {THREE.Vector3} direction - La direzione in cui controllare
 * @returns {boolean} - True se c'è una collisione
 */
function checkFootCollision(direction) {
    // Ottieni la posizione attuale del giocatore (telecamera)
    fpControls.getObject().getWorldPosition(playerPosition);
    
    // Calcola la posizione dei piedi (molto più in basso rispetto alla telecamera)
    footPosition.copy(playerPosition);
    footPosition.y = PLAYER_FOOT_HEIGHT; // Posizione dei piedi vicino al suolo
    
    // Imposta il raycaster dalla posizione dei piedi nella direzione del movimento
    collisionRaycaster.set(footPosition, direction);
    
    // Controlla le intersezioni con gli oggetti collidibili
    const intersections = collisionRaycaster.intersectObjects(collidableObjects, true);
    
    // Filtra le collisioni per altezza - solo oggetti che bloccano il movimento a livello dei piedi
    for (let intersection of intersections) {
        if (intersection.distance < COLLISION_DISTANCE) {
            // Controlla se l'oggetto è abbastanza alto da bloccare il movimento
            // (ad esempio, muri e mobili alti, ma non tavoli bassi)
            const hitPoint = intersection.point;
            const objectHeight = intersection.object.geometry.boundingBox ? 
                intersection.object.geometry.boundingBox.max.y : 
                hitPoint.y;
            
            // Se l'oggetto è più alto del corpo del personaggio, blocca il movimento
            if (objectHeight > PLAYER_BODY_HEIGHT) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Controlla le collisioni a livello del corpo del personaggio
 * @param {THREE.Vector3} direction - La direzione in cui controllare
 * @returns {boolean} - True se c'è una collisione
 */
function checkBodyCollision(direction) {
    // Ottieni la posizione attuale del giocatore (telecamera)
    fpControls.getObject().getWorldPosition(playerPosition);
    
    // Controlla le collisioni a diverse altezze del corpo
    const bodyCheckHeights = [
        PLAYER_FOOT_HEIGHT + 1.0,  // Piedi
        PLAYER_FOOT_HEIGHT + 3.0,  // Vita
        PLAYER_FOOT_HEIGHT + 5.0   // Petto
    ];
    
    for (let height of bodyCheckHeights) {
        const checkPosition = playerPosition.clone();
        checkPosition.y = height;
        
        collisionRaycaster.set(checkPosition, direction);
        const intersections = collisionRaycaster.intersectObjects(collidableObjects, true);
        
        if (intersections.length > 0 && intersections[0].distance < COLLISION_DISTANCE) {
            return true;
        }
    }
    
    return false;
}

/**
 * Aggiunge un oggetto alla lista degli oggetti con cui si può collidere
 * @param {THREE.Object3D} object - L'oggetto da rendere collidibile
 */
function addCollidableObject(object) {
    object.traverse((child) => {
        if (child.isMesh) {
            // Calcola il bounding box per determinare l'altezza dell'oggetto
            if (!child.geometry.boundingBox) {
                child.geometry.computeBoundingBox();
            }
            
            collidableObjects.push(child);
            console.log(`Aggiunto oggetto collidibile: ${child.name || 'unnamed mesh'} - Altezza: ${child.geometry.boundingBox ? child.geometry.boundingBox.max.y : 'unknown'}`);
        }
    });
}

/**
 * Aggiorna il movimento del personaggio
 */
function updateMovement() {
    // Blocca il movimento se l'utente non ha effettuato il login
    if (!isUserLoggedIn || !fpControls.isLocked) return;

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    // Applica la gravità
    velocity.y -= GRAVITY * delta;

    // Calcola la direzione del movimento
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    // Movimento avanti/indietro
    if (moveForward || moveBackward) {
        // Ottieni la direzione in cui sta guardando il giocatore
        playerDirection.setFromMatrixColumn(camera.matrix, 0);
        playerDirection.crossVectors(camera.up, playerDirection);
        playerDirection.y = 0; // Mantieni il movimento orizzontale
        playerDirection.normalize();
        
        // Calcola il movimento previsto
        const moveZ = direction.z * MOVEMENT_SPEED * delta;
        
        // Controlla la collisione del corpo nella direzione Z
        if (moveZ !== 0) {
            playerDirection.multiplyScalar(Math.sign(moveZ));
            if (!checkBodyCollision(playerDirection)) {
                fpControls.moveForward(moveZ);
            } else {
                console.log('Collisione rilevata - movimento bloccato avanti/indietro');
            }
        }
    }

    // Movimento laterale
    if (moveLeft || moveRight) {
        // Ottieni la direzione laterale
        playerDirection.setFromMatrixColumn(camera.matrix, 0);
        playerDirection.y = 0; // Mantieni il movimento orizzontale
        playerDirection.normalize();
        
        // Calcola il movimento previsto
        const moveX = direction.x * MOVEMENT_SPEED * delta;
        
        // Controlla la collisione del corpo nella direzione X
        if (moveX !== 0) {
            playerDirection.multiplyScalar(Math.sign(moveX));
            if (!checkBodyCollision(playerDirection)) {
                fpControls.moveRight(moveX);
            } else {
                console.log('Collisione rilevata - movimento bloccato lateralmente');
            }
        }
    }

    // Applica il movimento verticale (salto/gravità)
    fpControls.getObject().position.y += velocity.y * delta;

    // Controlla la collisione con il pavimento
    if (fpControls.getObject().position.y < MIN_CAMERA_HEIGHT) {
        velocity.y = 0;
        fpControls.getObject().position.y = MIN_CAMERA_HEIGHT;
        canJump = true;
    }

    // Mantieni la telecamera sempre all'altezza corretta
    if (fpControls.getObject().position.y < PLAYER_HEIGHT && canJump) {
        fpControls.getObject().position.y = PLAYER_HEIGHT;
    }

    prevTime = time;
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
            classroomModel.scale.set(2, 2, 2);
            classroomModel.position.set(0, 0, 0);
            
            // Abilita le ombre e aggiungi gli oggetti alla lista dei collidibili
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
            
            // Aggiungi tutti gli oggetti della classroom come collidibili
            addCollidableObject(classroomModel);
            
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

    // Aggiungi gli oggetti creati come collidibili
    addCollidableObject(floor);
    addCollidableObject(backWall);
    addCollidableObject(leftWall);
    addCollidableObject(desk);

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
    // Event listener per il click su canvas
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // Event listener per il click su document (cattura anche in modalità pointer lock)
    document.addEventListener('click', onMouseClick, false);
    
    // Event listener per il movimento del mouse (per hover effects)
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mousemove', onMouseMove, false);
    
    window.debugLogger.log('Eventi del mouse configurati');
}

/**
 * Gestisce il click del mouse
 * @param {Event} event - Evento del mouse
 */
function onMouseClick(event) {
    // Se siamo in modalità pointer lock, usa il centro dello schermo
    if (fpControls && fpControls.isLocked) {
        // In modalità FPS, il raycast parte dal centro dello schermo
        mouse.x = 0;
        mouse.y = 0;
        window.debugLogger.log('Click in modalità FPS', {centro: true});
    } else {
        // Modalità normale, usa la posizione del mouse
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        window.debugLogger.log('Click in modalità normale', {x: mouse.x, y: mouse.y});
    }
    
    // Aggiorna il raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Trova gli oggetti intersecati
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    window.debugLogger.log('Oggetti intersecati', {numero: intersects.length});
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        window.debugLogger.log('Oggetto cliccato', {nome: clickedObject.name, userData: clickedObject.userData});
        
        // Prima controlla se è un elemento del login 3D
        // if (login3D && login3D.isVisible()) { // login3D è rimosso
        //     window.debugLogger.log('Login è visibile, tentando gestione click');
            
        //     // Se l'oggetto cliccato non ha userData valido, cerca nell'area circostante
        //     let targetObject = clickedObject;
        //     if (!clickedObject.userData || (!clickedObject.userData.type)) {
        //         window.debugLogger.log('Oggetto senza userData, cercando nell\'area circostante');
                
        //         // Cerca tra tutti gli oggetti intersecati per trovare uno con userData valido
        //         for (let i = 0; i < Math.min(intersects.length, 5); i++) {
        //             const obj = intersects[i].object;
        //             if (obj.userData && (obj.userData.type === 'key' || obj.userData.type === 'button' || obj.userData.type === 'inputField')) {
        //                 targetObject = obj;
        //                 window.debugLogger.log('Trovato oggetto valido nell\'area', {userData: obj.userData});
        //                 break;
        //             }
        //         }
        //     }
            
        //     if (login3D.handleClick(targetObject)) {
        //         window.debugLogger.log('Click gestito dal sistema di login');
        //         return; // Il login ha gestito il click
        //     } else {
        //         window.debugLogger.log('Login non ha gestito il click');
        //     }
        // } else {
        //     window.debugLogger.log('Login non visibile o non inizializzato');
        // }
        
        // Poi controlla se è una provetta
        let provetta = clickedObject;
        while (provetta && (!provetta.userData || provetta.userData.type !== 'provetta')) {
            provetta = provetta.parent;
        }
        
        if (provetta && provetta.userData && provetta.userData.type === 'provetta') {
            // Blocca l'interazione con le provette se l'utente non è loggato
            if (!isUserLoggedIn) {
                alert('Devi effettuare il login prima di poter interagire con le provette!');
                return;
            }
            window.debugLogger.log('Click su provetta');
            interactWithProvetta(provetta);
        } else {
            window.debugLogger.log('Click su oggetto non interattivo');
        }
    } else {
        window.debugLogger.log('Nessun oggetto intersecato');
    }
}

/**
 * Gestisce il movimento del mouse per effetti hover
 * @param {Event} event - Evento del mouse
 */
function onMouseMove(event) {
    // Se siamo in modalità pointer lock, usa il centro dello schermo
    if (fpControls && fpControls.isLocked) {
        mouse.x = 0;
        mouse.y = 0;
    } else {
        // Calcola la posizione del mouse normalizzata
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    // Aggiorna il raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Trova gli oggetti intersecati
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Cambia il cursore se stiamo hovering su una provetta o sul login
    let isHoveringProvetta = false;
    let isHoveringLogin = false;
    
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        
        // Controlla se stiamo hovering sul login 3D
        // if (login3D && login3D.isVisible() && hoveredObject.userData) { // login3D è rimosso
        //     if (hoveredObject.userData.type === 'key' || 
        //         hoveredObject.userData.type === 'inputField' || 
        //         hoveredObject.userData.type === 'button') {
        //         isHoveringLogin = true;
        //     }
        // }
        
        // Risali nella gerarchia per trovare l'oggetto provetta
        let provetta = hoveredObject;
        while (provetta && (!provetta.userData || provetta.userData.type !== 'provetta')) {
            provetta = provetta.parent;
        }
        
        if (provetta && provetta.userData && provetta.userData.type === 'provetta') {
            isHoveringProvetta = true;
        }
    }
    
    // Aggiorna il crosshair in modalità FPS
    if (fpControls && fpControls.isLocked) {
        const crosshair = document.querySelector('.crosshair');
        if (crosshair) {
            // if (isHoveringLogin) { // login3D è rimosso
            //     crosshair.classList.add('login-target');
            // } else {
            //     crosshair.classList.remove('login-target');
            // }
        }
    } else {
        // Cambia il cursore in modalità normale
        renderer.domElement.style.cursor = (isHoveringProvetta || isHoveringLogin) ? 'pointer' : 'grab';
    }
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
        // Blocca l'accesso ai controlli FPS se l'utente non è loggato
        if (!isUserLoggedIn) {
            alert('Devi effettuare il login prima di poter entrare in modalità FPS!');
            return;
        }
        fpControls.lock();
    });

    document.getElementById('resume-button').addEventListener('click', () => {
        // Blocca l'accesso ai controlli FPS se l'utente non è loggato
        if (!isUserLoggedIn) {
            alert('Devi effettuare il login prima di poter riprendere!');
            return;
        }
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
    
    // Pulsante per mostrare il login
    // const loginBtn = document.getElementById('login-button'); // login3D è rimosso
    // if (loginBtn) {
    //     loginBtn.addEventListener('click', () => {
    //         if (login3D) {
    //             login3D.showLogin();
    //         }
    //     });
    // }
    
    // Pulsante per logout
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Event listener per il ridimensionamento della finestra
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Salva i dati dell'utente in sessione
 * @param {Object} user - Dati dell'utente da salvare
 */
function saveUserToSession(user) {
    try {
        const sessionData = {
            id: user.id,
            nome: user.nome,
            cognome: user.cognome,
            username: user.username,
            email: user.email,
            idClasse: user.idClasse,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('futuralab_user', JSON.stringify(sessionData));
        window.debugLogger.log('Dati utente salvati in localStorage', sessionData);
    } catch (error) {
        console.error('Errore nel salvare i dati utente in sessione:', error);
        window.debugLogger.log('Errore nel salvare i dati utente in sessione', error.message);
    }
}

/**
 * Recupera i dati dell'utente dalla sessione
 * @returns {Object|null} - Dati dell'utente o null se non presente
 */
function getUserFromSession() {
    try {
        const sessionData = localStorage.getItem('futuralab_user');
        if (sessionData) {
            const user = JSON.parse(sessionData);
            window.debugLogger.log('Dati utente recuperati da localStorage', user);
            return user;
        }
        return null;
    } catch (error) {
        console.error('Errore nel recuperare i dati utente dalla sessione:', error);
        window.debugLogger.log('Errore nel recuperare i dati utente dalla sessione', error.message);
        return null;
    }
}

/**
 * Rimuove i dati dell'utente dalla sessione (logout)
 */
function clearUserSession() {
    try {
        localStorage.removeItem('futuralab_user');
        window.debugLogger.log('Dati utente cancellati da localStorage');
    } catch (error) {
        console.error('Errore nel cancellare la sessione utente:', error);
        window.debugLogger.log('Errore nel cancellare la sessione utente', error.message);
    }
}

/**
 * Verifica se l'utente è loggato controllando la sessione
 * @returns {boolean} - True se l'utente è loggato
 */
function isUserSessionActive() {
    const user = getUserFromSession();
    if (!user) return false;
    
    // Verifica se la sessione è scaduta (24 ore)
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const sessionDuration = now - loginTime;
    const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 ore in millisecondi
    
    if (sessionDuration > maxSessionDuration) {
        window.debugLogger.log('Sessione scaduta, rimozione automatica');
        clearUserSession();
        return false;
    }
    
    return true;
}

/**
 * Gestisce il login riuscito
 * @param {Object} user - Dati dell'utente
 */
function handleLoginSuccess(user) {
    console.log('Utente loggato:', user);
    
    // Salva l'utente in sessione
    saveUserToSession(user);
    window.debugLogger.log('Utente salvato in localStorage', user);
    
    // Rimuovi la modale di login statica
    removeStaticLoginModal();
    
    // Aggiorna l'interfaccia utente
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const logoutButton = document.getElementById('logout-button');
    
    if (userInfo && userName && userRole) {
        userName.textContent = user.name;
        userRole.textContent = user.role;
        userInfo.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'block';
    }
    
    // Abilita funzionalità in base al ruolo
    enableUserFeatures(user);
    isUserLoggedIn = true; // Imposta l'utente come loggato
    
    // Mostra un messaggio di benvenuto
    setTimeout(() => {
        alert(`Benvenuto nell'ambiente VR, ${user.name}! Ora puoi interagire liberamente.`);
    }, 1000);
}

/**
 * Gestisce il logout
 */
function handleLogout() {
    console.log('Logout effettuato');
    
    // Cancella la sessione utente
    clearUserSession();
    
    // Aggiorna l'interfaccia utente
    const userInfo = document.getElementById('user-info');
    const logoutButton = document.getElementById('logout-button');
    
    if (userInfo) userInfo.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';
    
    // Reset del sistema di login
    // if (login3D) { // login3D è rimosso
    //     login3D.resetForm();
    // }
    
    // Disabilita funzionalità specifiche
    disableUserFeatures();
    isUserLoggedIn = false; // Imposta l'utente come non loggato
    createStaticLoginModal(); // Ristabilisce la modale di login
}

/**
 * Abilita funzionalità in base al ruolo dell'utente
 * @param {Object} user - Dati dell'utente
 */
function enableUserFeatures(user) {
    switch (user.role) {
        case 'admin':
            console.log('Funzionalità admin abilitate');
            // Abilita tutte le funzionalità
            break;
        case 'teacher':
            console.log('Funzionalità docente abilitate');
            // Abilita funzionalità per docenti
            break;
        case 'student':
            console.log('Funzionalità studente abilitate');
            // Abilita funzionalità limitate per studenti
            break;
        default:
            console.log('Ruolo non riconosciuto');
            break;
    }
}

/**
 * Disabilita le funzionalità specifiche dell'utente
 */
function disableUserFeatures() {
    console.log('Funzionalità utente disabilitate');
    // Disabilita funzionalità specifiche
}

/**
 * Crea la modale di login statica
 */
function createStaticLoginModal() {
    const existingModal = document.getElementById('login-modal');
    if (!existingModal) {
        const modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.className = 'login-modal';
        
        modal.innerHTML = `
            <div class="login-modal-content">
                <div class="login-header">
                    <h2>🚀 FuturaLab VR</h2>
                    <p>Accedi per entrare nell'ambiente virtuale</p>
                </div>
                
                <form id="login-form" class="login-form">
                    <div class="input-group">
                        <label for="email">Username</label>
                        <input type="text" id="email" name="email" required placeholder="Inserisci il tuo username">
                    </div>
                    
                    <div class="input-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required placeholder="Inserisci la password">
                    </div>
                    
                    <button type="submit" id="login-btn" class="login-button">
                        <span class="login-text">Accedi</span>
                        <span class="login-loading" style="display: none;">Caricamento...</span>
                    </button>
                    
                    <div id="login-message" class="login-message"></div>
                </form>
                
                <div class="login-footer">
                    <p><strong>Account di test:</strong></p>
                    <div class="test-accounts">
                        <div onclick="fillTestAccount('student')">👨‍🎓 Studente: testuser</div>
                    </div>
                    <p><small>Nota: Usa username e password del database studenti</small></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Aggiungi event listeners
        setupLoginModalEvents();
    }
}

/**
 * Autentica un utente tramite l'endpoint /vrLogin del backend
 * @param {string} username - Username o email dell'utente  
 * @param {string} password - Password dell'utente
 * @returns {Promise<Object|null>} - Dati dell'utente se l'autenticazione è riuscita, null altrimenti
 */
async function authenticateVRUser(username, password) {
    const API_BASE_URL = 'http://localhost:80/api';
    
    try {
        window.debugLogger.log('Tentativo di login VR', { username, password: '***' });
        
        const response = await fetch(`${API_BASE_URL}/vrLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const loginResponse = await response.json();
        window.debugLogger.log('Risposta login VR', loginResponse);

        if (loginResponse.success && loginResponse.studente) {
            // Converti i dati dello studente nel formato utilizzato dall'app
            const userData = {
                id: loginResponse.studente.id,
                nome: loginResponse.studente.nome,
                cognome: loginResponse.studente.cognome,
                username: loginResponse.studente.username,
                email: loginResponse.studente.email,
                idClasse: loginResponse.studente.idClasse,
                role: 'student', // Gli studenti hanno sempre ruolo 'student'
                name: `${loginResponse.studente.nome} ${loginResponse.studente.cognome}` // Per compatibilità
            };
            
            window.debugLogger.log('Login VR riuscito', userData);
            return userData;
        } else {
            window.debugLogger.log('Login VR fallito', loginResponse.message);
            return null;
        }
    } catch (error) {
        window.debugLogger.log('Errore durante il login VR', error.message);
        console.error('Errore durante l\'autenticazione VR:', error);
        throw error;
    }
}

/**
 * Configura gli event listeners per la modale di login
 */
function setupLoginModalEvents() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const messageDiv = document.getElementById('login-message');
    
    // Gestione submit del form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showLoginMessage('Inserisci username e password', 'error');
            return;
        }
        
        // Mostra loading
        loginBtn.disabled = true;
        document.querySelector('.login-text').style.display = 'none';
        document.querySelector('.login-loading').style.display = 'inline';
        
        try {
            // Autenticazione tramite endpoint /vrLogin del backend
            const user = await authenticateVRUser(username, password);
            
            if (user) {
                showLoginMessage(`Benvenuto, ${user.nome} ${user.cognome}!`, 'success');
                setTimeout(() => {
                    removeStaticLoginModal();
                    handleLoginSuccess(user);
                }, 1500);
            } else {
                showLoginMessage('Credenziali non valide', 'error');
            }
        } catch (error) {
            console.error('Errore durante l\'autenticazione:', error);
            showLoginMessage('Errore di connessione al server', 'error');
        } finally {
            // Nasconde loading
            loginBtn.disabled = false;
            document.querySelector('.login-text').style.display = 'inline';
            document.querySelector('.login-loading').style.display = 'none';
        }
    });
    
    // Focus automatico sul primo campo
    emailInput.focus();
}

/**
 * Mostra un messaggio nella modale di login
 */
function showLoginMessage(message, type) {
    const messageDiv = document.getElementById('login-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `login-message ${type}`;
        messageDiv.style.display = 'block';
    }
}

/**
 * Riempie automaticamente i campi con account di test
 */
function fillTestAccount(type) {
    const usernameInput = document.getElementById('email'); // Il campo ha ancora id 'email' ma ora è username
    const passwordInput = document.getElementById('password');
    
    switch (type) {
        case 'student':
            usernameInput.value = 'testuser';
            passwordInput.value = 'testpass';
            break;
        default:
            // Solo account studenti sono supportati per il sistema VR
            usernameInput.value = 'testuser';
            passwordInput.value = 'testpass';
            break;
    }
    
    // Focus sul pulsante di login
    document.getElementById('login-btn').focus();
}

/**
 * Rimuove la modale di login statica
 */
function removeStaticLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 500);
    }
}

// Espone le funzioni globalmente
window.fillTestAccount = fillTestAccount;
window.getUserFromSession = getUserFromSession;
window.saveUserToSession = saveUserToSession;
window.clearUserSession = clearUserSession;
window.isUserSessionActive = isUserSessionActive;

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
    
    // Configura il callback per il login riuscito
    window.onUserLogin = handleLoginSuccess;
    
    // Controlla se c'è già un utente loggato in sessione
    const savedUser = getUserFromSession();
    if (savedUser && isUserSessionActive()) {
        console.log('Utente trovato in sessione, login automatico');
        window.debugLogger.log('Login automatico da localStorage', savedUser);
        handleLoginSuccess(savedUser);
    } else {
        // Crea la modale di login statica solo se l'utente non è già loggato
        createStaticLoginModal();
    }
    
    // Posiziona la camera all'altezza corretta
    camera.position.set(10, PLAYER_HEIGHT, 10);
    
    // Avvia il loop di animazione
    animate();
    
    console.log('Simulazione educativa VR inizializzata con successo!');
    console.log('Sistema di login integrato con endpoint /vrLogin del backend');
    console.log('Gestione sessione utente attiva con localStorage (condivisa tra schede)');
    console.log('Assicurati che il backend sia avviato su http://localhost:80');
}

// Avvia l'applicazione quando il DOM è caricato
document.addEventListener('DOMContentLoaded', init); 