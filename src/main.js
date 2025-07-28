/**
 * Simulazione Educativa VR - Three.js
 * Script principale per la gestione della scena 3D
 */

// Variabili globali per la scena Three.js
let scene, camera, renderer, css3dRenderer, controls;
let classroomModel;
let raycaster, mouse;
let isLoadingComplete = false;
let isUserLoggedIn = false; // Controlla se l'utente ha effettuato il login

// Variabili per il sistema video
let videoPanel = null;
let css3dScene = null;
let youtubePlayer = null;
let currentSimulazione = null;
let currentUser = null;
let videoPlayerReady = false;
let simulationMonitoringInterval = null;

// Variabili per gestire i timer e le chiamate API
let activeTimers = [];
let isLoggedOut = false;

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

    // Creazione del renderer WebGL
    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Creazione del CSS3DRenderer per video YouTube
    css3dRenderer = new THREE.CSS3DRenderer();
    css3dRenderer.setSize(window.innerWidth, window.innerHeight);
    css3dRenderer.domElement.style.position = 'absolute';
    css3dRenderer.domElement.style.top = '0';
    css3dRenderer.domElement.style.left = '0';
    css3dRenderer.domElement.style.pointerEvents = 'none';
    css3dRenderer.domElement.style.zIndex = '1000'; // Assicura che sia sopra il canvas 3D
    css3dRenderer.domElement.id = 'css3d-container';
    document.body.appendChild(css3dRenderer.domElement);
    
    window.debugLogger.log('CSS3D Renderer inizializzato e aggiunto al DOM');

    // Creazione della scena CSS3D separata
    css3dScene = new THREE.Scene();

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
            hideLoadingMessage();
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
    hideLoadingMessage();
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
 * Controlla se il click è su controlli video specifici (pulsanti)
 * @param {Event} event - Evento del mouse
 * @returns {boolean} - True se il click è stato gestito
 */
function checkVideoClick(event) {
    // Controlla se c'è un pannello video attivo
    if (!videoPanel || !videoPanel.userData) {
        return false;
    }
    
    // Ottieni l'elemento cliccato usando elementFromPoint
    const clickedElement = document.elementFromPoint(event.clientX, event.clientY);
    if (!clickedElement) {
        return false;
    }
    
    // Lista degli ID dei pulsanti specifici (solo play/pause)
    const buttonIds = [
        'play-pause-btn'
    ];
    
    // Verifica se il click è su uno dei pulsanti specifici
    const isSpecificButton = buttonIds.includes(clickedElement.id);
    const isButtonInControls = clickedElement.tagName === 'BUTTON' && 
                              clickedElement.closest('#video-controls-overlay');
    
    // Verifica se il click è direttamente sui controlli (ma non sui pulsanti specifici)
    const controlsOverlay = document.getElementById('video-controls-overlay');
    const isControlsArea = controlsOverlay && controlsOverlay.contains(clickedElement) && 
                          !isSpecificButton && !isButtonInControls;
    
    if (isSpecificButton || isButtonInControls) {
        window.debugLogger.log('🎛️ Click su pulsante specifico', {
            elemento: clickedElement.id,
            isSpecificButton,
            isButtonInControls
        });
        
        // I pulsanti hanno i loro event listener - non fare nulla qui
        return true;
    }
    
    if (isControlsArea) {
        window.debugLogger.log('🎮 Click su area controlli (non pulsante) - toggle play/pause');
        
        // Click sull'area controlli ma non su un pulsante = toggle play/pause
        if (videoPanel) {
            handleVideoInteractionCSS3D(videoPanel);
        }
        return true;
    }
    
    // NON gestire click generali sull'area video - questi vanno al raycaster 3D
    return false;
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
    
    // PRIMA controlla se è un click sui controlli specifici (massima priorità)
    const videoControlsClickHandled = checkVideoClick(event);
    if (videoControlsClickHandled) {
        window.debugLogger.log('✅ Click gestito dai controlli video specifici');
        return;
    }
    
    // POI controlla il raycaster per oggetti 3D generali
    raycaster.setFromCamera(mouse, camera);
    
    // Trova gli oggetti intersecati nella scena principale
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Controlla anche la scena CSS3D se esiste
    let css3dIntersects = [];
    if (css3dScene && css3dScene.children.length > 0) {
        css3dIntersects = raycaster.intersectObjects(css3dScene.children, true);
    }
    
    // Combina i risultati
    const allIntersects = [...intersects, ...css3dIntersects];
    
    window.debugLogger.log('🎯 Oggetti intersecati dettagliato', {
        scena3D: intersects.length,
        scenaCSS3D: css3dIntersects.length,
        totale: allIntersects.length,
        modalitaFPS: fpControls && fpControls.isLocked,
        mousePos: {x: mouse.x, y: mouse.y},
        intersectsDetails: allIntersects.map(hit => ({
            type: hit.object.userData?.type || 'unknown',
            distance: hit.distance,
            point: hit.point
        }))
    });
    
    if (allIntersects.length > 0) {
        // DEBUG: Mostra tutti gli oggetti intersecati
        window.debugLogger.log('🎯 CLICK DEBUG - Tutti gli oggetti intersecati:', allIntersects.map((hit, index) => ({
            index: index,
            type: hit.object.userData?.type || 'no-type',
            distance: hit.distance,
            isFirst: index === 0
        })));
        
        // Cerca prima il pulsante Termina Esercizio tra tutti gli intersetti
        const buttonHit = allIntersects.find(hit => 
            hit.object.userData && hit.object.userData.type === 'terminaEsercizioBtn'
        );
        
        // Cerca il pannello video tra tutti gli intersetti
        const videoHit = allIntersects.find(hit => 
            hit.object.userData && hit.object.userData.type === 'videoPanel'
        );
        
        // PRIORITÀ: elemento più vicino alla camera
        if (buttonHit && videoHit) {
            // Se entrambi sono rilevati, scegli quello più vicino
            // Aggiungi un margine di tolleranza di 0.1 unità per evitare problemi di precisione
            const distanceDifference = Math.abs(buttonHit.distance - videoHit.distance);
            const tolerance = 0.1;
            
            window.debugLogger.log('🎯 CLICK DEBUG - Entrambi gli elementi rilevati:', {
                buttonDistance: buttonHit.distance,
                videoDistance: videoHit.distance,
                difference: distanceDifference,
                tolerance: tolerance,
                buttonCloser: buttonHit.distance < videoHit.distance,
                withinTolerance: distanceDifference < tolerance
            });
            
            if (buttonHit.distance < videoHit.distance && distanceDifference > tolerance) {
                // Pulsante è più vicino
                const clickedObject = buttonHit.object;
                window.debugLogger.log('🎯 CLICK DEBUG - Pulsante rilevato (più vicino):', {
                    nome: clickedObject.name, 
                    userData: clickedObject.userData,
                    distance: buttonHit.distance,
                    videoDistance: videoHit.distance
                });
                
                window.debugLogger.log('🏁 Click su pulsante Termina Esercizio via raycaster');
                
                // Simula il click sul pulsante CSS3D
                if (videoPanel && videoPanel.userData.terminaBtn) {
                    const terminaBtn = videoPanel.userData.terminaBtn;
                    window.debugLogger.log('✅ Triggering click su pulsante Termina Esercizio');
                    
                    // In modalità FPS, esci automaticamente dal pointer lock
                    if (fpControls && fpControls.isLocked) {
                        window.debugLogger.log('🔓 Uscita automatica da modalità FPS per valutazione');
                        fpControls.unlock();
                    }
                    
                    terminaBtn.click();
                } else {
                    window.debugLogger.log('❌ Pulsante Termina Esercizio non trovato nel videoPanel');
                }
            } else if (videoHit.distance < buttonHit.distance && distanceDifference > tolerance) {
                // Video è più vicino
                const clickedObject = videoHit.object;
                window.debugLogger.log('🎯 CLICK DEBUG - Video rilevato (più vicino):', {
                    nome: clickedObject.name, 
                    userData: clickedObject.userData,
                    distance: videoHit.distance,
                    buttonDistance: buttonHit.distance
                });
                window.debugLogger.log('🎮 Click su pannello video 3D via raycaster');
                
                // Se è il piano di raycasting, usa il videoPanel globale
                if (clickedObject.userData.isRaycastPlane) {
                    window.debugLogger.log('Click rilevato su piano raycasting - toggle play/pause');
                    if (videoPanel) {
                        handleVideoInteractionCSS3D(videoPanel);
                    }
                } else {
                    handleVideoInteractionCSS3D(clickedObject);
                }
            } else {
                // Le distanze sono simili (entro la tolleranza) - priorità al video per evitare click accidentali sul pulsante
                window.debugLogger.log('🎯 CLICK DEBUG - Distanze simili, priorità al video per sicurezza');
                const clickedObject = videoHit.object;
                window.debugLogger.log('🎮 Click su pannello video 3D (priorità sicurezza):', {
                    nome: clickedObject.name, 
                    userData: clickedObject.userData,
                    distance: videoHit.distance,
                    buttonDistance: buttonHit.distance
                });
                
                // Se è il piano di raycasting, usa il videoPanel globale
                if (clickedObject.userData.isRaycastPlane) {
                    window.debugLogger.log('Click rilevato su piano raycasting - toggle play/pause');
                    if (videoPanel) {
                        handleVideoInteractionCSS3D(videoPanel);
                    }
                } else {
                    handleVideoInteractionCSS3D(clickedObject);
                }
            }
        } else if (buttonHit) {
            const clickedObject = buttonHit.object;
            window.debugLogger.log('🎯 CLICK DEBUG - Pulsante rilevato:', {
                nome: clickedObject.name, 
                userData: clickedObject.userData,
                distance: buttonHit.distance
            });
            
            window.debugLogger.log('🏁 Click su pulsante Termina Esercizio via raycaster');
            
            // Simula il click sul pulsante CSS3D
            if (videoPanel && videoPanel.userData.terminaBtn) {
                const terminaBtn = videoPanel.userData.terminaBtn;
                window.debugLogger.log('✅ Triggering click su pulsante Termina Esercizio');
                
                // In modalità FPS, esci automaticamente dal pointer lock
                if (fpControls && fpControls.isLocked) {
                    window.debugLogger.log('🔓 Uscita automatica da modalità FPS per valutazione');
                    fpControls.unlock();
                }
                
                terminaBtn.click();
            } else {
                window.debugLogger.log('❌ Pulsante Termina Esercizio non trovato nel videoPanel');
            }
        }
        // Controlla se è il pannello video
        else if (videoHit) {
            const clickedObject = videoHit.object;
            window.debugLogger.log('🎯 CLICK DEBUG - Video rilevato:', {
                nome: clickedObject.name, 
                userData: clickedObject.userData,
                distance: videoHit.distance
            });
            window.debugLogger.log('🎮 Click su pannello video 3D via raycaster');
            
            // Se è il piano di raycasting, usa il videoPanel globale
            if (clickedObject.userData.isRaycastPlane) {
                window.debugLogger.log('Click rilevato su piano raycasting - toggle play/pause');
                if (videoPanel) {
                    handleVideoInteractionCSS3D(videoPanel);
                }
            } else {
                handleVideoInteractionCSS3D(clickedObject);
            }
        }
        // FALLBACK: Se siamo in FPS e non abbiamo trovato il pulsante, prova metodi alternativi
        else if (fpControls && fpControls.isLocked) {
            window.debugLogger.log('🔍 FALLBACK FPS: Tentativo click diretto su pulsante');
            
            // Prova a cliccare direttamente il pulsante se è visibile e nella giusta area
            if (videoPanel && videoPanel.userData.terminaBtn) {
                const terminaBtn = videoPanel.userData.terminaBtn;
                const buttonRect = terminaBtn.getBoundingClientRect();
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                window.debugLogger.log('🔍 FALLBACK - Check area pulsante:', {
                    centerScreen: { x: centerX, y: centerY },
                    buttonRect: {
                        left: buttonRect.left,
                        right: buttonRect.right,
                        top: buttonRect.top,
                        bottom: buttonRect.bottom
                    },
                    isInArea: (centerX >= buttonRect.left && centerX <= buttonRect.right &&
                              centerY >= buttonRect.top && centerY <= buttonRect.bottom)
                });
                
                                if (centerX >= buttonRect.left && centerX <= buttonRect.right &&
                    centerY >= buttonRect.top && centerY <= buttonRect.bottom) {
                    window.debugLogger.log('✅ FALLBACK: Click su area pulsante rilevato');
                    
                    // In modalità FPS, esci automaticamente dal pointer lock
                    if (fpControls && fpControls.isLocked) {
                        window.debugLogger.log('🔓 FALLBACK: Uscita automatica da modalità FPS per valutazione');
                        fpControls.unlock();
                    }
                    
                    terminaBtn.click();
                    return;
                } else {
                    window.debugLogger.log('❌ FALLBACK: Crosshair non sopra il pulsante');
                }
            }
        }
        else {
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
    
    // Cambia il cursore se stiamo hovering su oggetti interattivi
    let isHoveringInteractive = false;
    
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        
        // Controlla se stiamo hovering su oggetti interattivi
        if (hoveredObject.userData && (
            hoveredObject.userData.type === 'videoPanel' || 
            hoveredObject.userData.type === 'terminaEsercizioBtn'
        )) {
            isHoveringInteractive = true;
        }
    }
    
    // Aggiorna il crosshair in modalità FPS
    if (fpControls && fpControls.isLocked) {
        const crosshair = document.querySelector('.crosshair');
        if (crosshair) {
            if (isHoveringInteractive) {
                crosshair.classList.add('interactive-target');
            } else {
                crosshair.classList.remove('interactive-target');
            }
        }
    } else {
        // Cambia il cursore in modalità normale
        renderer.domElement.style.cursor = isHoveringInteractive ? 'pointer' : 'grab';
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
    
    // Animazione del pannello video (se presente)
    if (videoPanel && videoPanel.userData) {
        // Leggero ondeggiamento del pannello video CSS3D
        videoPanel.position.y = 15 + Math.sin(Date.now() * 0.001) * 0.2;
    }
    
    renderer.render(scene, camera);
    
    // Renderizza CSS3D solo se necessario (per compatibilità)
    if (css3dRenderer && css3dScene) {
    css3dRenderer.render(css3dScene, camera);
    }
}

/**
 * Gestisce il ridimensionamento della finestra
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    css3dRenderer.setSize(window.innerWidth, window.innerHeight);
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
 * Mostra il banner di attesa per la simulazione
 * @param {Object} user - Dati dell'utente loggato
 */
function showWaitingBanner(user) {
    const banner = document.createElement('div');
    banner.id = 'waiting-banner';
    banner.className = 'login-modal';
    
    banner.innerHTML = `
        <div class="login-modal-content">
            <div class="login-header">
                <h2>🚀 FuturaLab VR</h2>
                <p>Ciao ${user.nome}, attendi che la tua insegnante avvii la simulazione/video</p>
            </div>
            
            <div class="banner-loading">
                <div class="loading-spinner"></div>
                <p>In attesa dell'insegnante...</p>
            </div>
            
            <div class="banner-buttons" style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="logout-waiting-btn" class="login-button" style="background: linear-gradient(135deg, #dc3545, #c82333);">
                    <span class="login-text">Logout</span>
                    <span class="login-loading" style="display: none;">Logout in corso...</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    window.debugLogger.log('Banner di attesa mostrato per utente', user.nome);
    
    // Event listener per il pulsante Logout
    const logoutBtn = document.getElementById('logout-waiting-btn');
    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });
    
    // Dopo 3 secondi, controlla se la simulazione è stata avviata
    createSafeTimer(() => {
        checkSimulazioneInCorso(user);
    }, 3000);
}

/**
 * Controlla se c'è una simulazione in corso per la classe dell'utente
 * @param {Object} user - Dati dell'utente
 */
async function checkSimulazioneInCorso(user) {
    // Controlla se l'utente è stato disconnesso
    if (isLoggedOut) {
        console.log('Controllo simulazione bloccato - utente disconnesso');
        return;
    }
    
    const API_BASE_URL = 'http://localhost:80/api';
    
    try {
        window.debugLogger.log('Controllo simulazione in corso per classe', user.idClasse);
        
        const response = await fetch(`${API_BASE_URL}/getSimulazioneInCorso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                idClasse: user.idClasse
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const simulazioneResponse = await response.json();
        window.debugLogger.log('Risposta simulazione in corso', simulazioneResponse);

        if (simulazioneResponse.success && simulazioneResponse.simulazione) {
            // Simulazione trovata, mostra il banner di avvio
            hideWaitingBanner();
            showStartSimulazioneBanner(user, simulazioneResponse.simulazione);
        } else {
            // Nessuna simulazione trovata, continua a controllare
            window.debugLogger.log('Nessuna simulazione trovata, nuovo controllo tra 5 secondi');
            createSafeTimer(() => {
                checkSimulazioneInCorso(user);
            }, 5000);
        }
    } catch (error) {
        window.debugLogger.log('Errore nel controllo simulazione', error.message);
        console.error('Errore nel controllo simulazione:', error);
        
        // In caso di errore, riprova dopo 10 secondi
        createSafeTimer(() => {
            checkSimulazioneInCorso(user);
        }, 10000);
    }
}

/**
 * Nasconde il banner di attesa
 */
function hideWaitingBanner() {
    const banner = document.getElementById('waiting-banner');
    if (banner) {
        banner.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            if (banner.parentNode) {
                document.body.removeChild(banner);
            }
        }, 500);
    }
}

/**
 * Mostra il banner per avviare la simulazione
 * @param {Object} user - Dati dell'utente
 * @param {Object} simulazione - Dati della simulazione
 */
function showStartSimulazioneBanner(user, simulazione) {
    const banner = document.createElement('div');
    banner.id = 'start-simulazione-banner';
    banner.className = 'login-modal';
    
    const tipoSimulazione = simulazione.tipoSimulazione === 1 ? 'Video' : 'Simulazione';
    
    banner.innerHTML = `
        <div class="login-modal-content">
            <div class="login-header">
                <h2>🎬 Simulazione Pronta</h2>
                <p>La tua insegnante ha avviato un ${tipoSimulazione}</p>
            </div>
            
            <div class="simulazione-info">
                <p><strong>Insegnante:</strong> ${simulazione.insegnante.nome} ${simulazione.insegnante.cognome}</p>
                <p><strong>Argomento:</strong> ${simulazione.macrocategoria.nome}</p>
                <p><strong>Tipo:</strong> ${tipoSimulazione}</p>
            </div>
            
            <button id="avvia-simulazione-btn" class="login-button">
                <span class="login-text">Avvia</span>
                <span class="login-loading" style="display: none;">Avvio in corso...</span>
            </button>
            
            <div class="banner-buttons" style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                <button id="reload-simulazione-btn" class="login-button" style="background: linear-gradient(135deg, #17a2b8, #138496);">
                    <span class="login-text">🔄 Ricarica</span>
                    <span class="login-loading" style="display: none;">Ricarica in corso...</span>
                </button>
                
                <button id="logout-simulazione-btn" class="login-button" style="background: linear-gradient(135deg, #dc3545, #c82333);">
                    <span class="login-text">Logout</span>
                    <span class="login-loading" style="display: none;">Logout in corso...</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    window.debugLogger.log('Banner avvio simulazione mostrato', simulazione);
    
    // Event listener per il pulsante Avvia
    const avviaBtn = document.getElementById('avvia-simulazione-btn');
    avviaBtn.addEventListener('click', () => {
        avviaSimulazione(user, simulazione);
    });
    
    // Event listener per il pulsante Ricarica
    const reloadBtn = document.getElementById('reload-simulazione-btn');
    reloadBtn.addEventListener('click', () => {
        handleReloadSimulazione(user);
    });
    
    // Event listener per il pulsante Logout
    const logoutBtn = document.getElementById('logout-simulazione-btn');
    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });
}

/**
 * Avvia la simulazione per lo studente
 * @param {Object} user - Dati dell'utente
 * @param {Object} simulazione - Dati della simulazione
 */
async function avviaSimulazione(user, simulazione) {
    // Controlla se l'utente è stato disconnesso
    if (isLoggedOut) {
        console.log('Avvio simulazione bloccato - utente disconnesso');
        return;
    }
    
    const API_BASE_URL = 'http://localhost:80/api';
    const avviaBtn = document.getElementById('avvia-simulazione-btn');
    
    try {
        // Mostra loading
        avviaBtn.disabled = true;
        document.querySelector('#avvia-simulazione-btn .login-text').style.display = 'none';
        document.querySelector('#avvia-simulazione-btn .login-loading').style.display = 'inline';
        
        window.debugLogger.log('Avvio simulazione per studente', { studente: user.id, simulazione: simulazione.id });
        
        const response = await fetch(`${API_BASE_URL}/setStatoSimulazioneStudente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                idSimulazione: simulazione.id,
                idStudente: user.id,
                stato: 'inCorso'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        window.debugLogger.log('Risposta avvio simulazione', result);

        if (result.includes('successo')) {
            // Simulazione avviata con successo
            hideStartSimulazioneBanner();
            window.debugLogger.log('Simulazione avviata con successo per studente', user.nome);
            
            // Salva i dati per uso futuro
            currentUser = user;
            currentSimulazione = simulazione;
            
            // Avvia il monitoraggio periodico della simulazione
            startSimulationMonitoring();
            
            // Gestisci in base al tipo di simulazione
            if (simulazione.tipoSimulazione === 1) {
                // È un video - avvia il sistema video
                window.debugLogger.log('Avvio sistema video', simulazione.macrocategoria.video);
                createVideoPanel(simulazione.macrocategoria.video);
            } else if (simulazione.tipoSimulazione === 0) {
                // È una simulazione interattiva - reindirizza alla pagina di simulazione
                window.debugLogger.log('Avvio simulazione interattiva', simulazione.id);
                window.location.href = `simulazione.html?simulazioneId=${simulazione.id}`;
            } else {
                // Tipo di simulazione non riconosciuto
                window.debugLogger.log('Tipo simulazione non riconosciuto', simulazione.tipoSimulazione);
                alert(`Tipo di simulazione non supportato: ${simulazione.tipoSimulazione}`);
            }
        } else {
            // Errore nell'avvio
            throw new Error(result);
        }
    } catch (error) {
        window.debugLogger.log('Errore nell\'avvio simulazione', error.message);
        console.error('Errore nell\'avvio simulazione:', error);
        
        // Mostra errore all'utente
        alert(`Errore nell'avvio della simulazione: ${error.message}`);
    } finally {
        // Nasconde loading
        avviaBtn.disabled = false;
        document.querySelector('#avvia-simulazione-btn .login-text').style.display = 'inline';
        document.querySelector('#avvia-simulazione-btn .login-loading').style.display = 'none';
    }
}

/**
 * Nasconde il banner di avvio simulazione
 */
function hideStartSimulazioneBanner() {
    const banner = document.getElementById('start-simulazione-banner');
    if (banner) {
        banner.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            if (banner.parentNode) {
                document.body.removeChild(banner);
            }
        }, 500);
    }
}

/**
 * Estrae l'ID video da un URL YouTube
 * @param {string} url - URL YouTube completo
 * @returns {string|null} - ID del video o null se non valido
 */
function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Crea il pannello video fluttuante nella scena VR usando CSS3D con iframe YouTube
 * @param {string} videoUrl - URL del video YouTube
 */
function createVideoPanel(videoUrl) {
    // Rimuovi pannello esistente se presente
    if (videoPanel) {
        if (videoPanel.parent === scene) {
            scene.remove(videoPanel);
        } else if (videoPanel.parent === css3dScene) {
        css3dScene.remove(videoPanel);
        }
        
        // Rimuovi anche i piani di raycasting se esistono
        if (videoPanel.userData && videoPanel.userData.raycastPlane) {
            scene.remove(videoPanel.userData.raycastPlane);
            window.debugLogger.log('Piano raycasting video rimosso');
        }
        
        if (videoPanel.userData && videoPanel.userData.buttonRaycastPlane) {
            scene.remove(videoPanel.userData.buttonRaycastPlane);
            window.debugLogger.log('Piano raycasting pulsante rimosso');
        }
        
        // Pulisci elementi DOM precedenti
        const oldVideo = document.getElementById('vr-video-element');
        if (oldVideo) oldVideo.remove();
        const oldIframe = document.getElementById('youtube-player-container');
        if (oldIframe) oldIframe.remove();
        videoPanel = null;
    }

    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
        console.error('URL YouTube non valido:', videoUrl);
        window.debugLogger.log('URL YouTube non valido', videoUrl);
        showVideoErrorBanner('URL video non valido');
        return;
    }

    window.debugLogger.log('ID video estratto', videoId);

    // Crea un contenitore per l'iframe YouTube con design migliorato
    const containerDiv = document.createElement('div');
    containerDiv.id = 'youtube-player-container';
    containerDiv.className = 'youtube-video-element';
    containerDiv.style.cssText = `
        width: 800px;
        height: 520px;
        background: #000;
        border: 3px solid #ff6b35;
        border-radius: 10px;
        padding: 5px;
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        overflow: visible;
        position: relative;
    `;
    
    // Crea l'iframe YouTube con parametri ottimizzati
    const iframe = document.createElement('iframe');
    iframe.id = 'youtube-player-iframe';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 7px;
    `;
    
    // URL dell'iframe con parametri ottimizzati per controlli
    const embedUrl = `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
        autoplay: 1,
        controls: 1,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        fs: 1,
        enablejsapi: 1, // Abilita JS API per controlli play/pause
        origin: window.location.origin,
        allow: 'autoplay; encrypted-media',
        mute: 0,
        widget_referrer: window.location.origin
    });
    
    iframe.src = embedUrl;
    iframe.allow = 'autoplay; encrypted-media; fullscreen';
    iframe.allowfullscreen = true;
    
    // Crea controlli personalizzati avanzati sopra l'iframe
    const controlsOverlay = document.createElement('div');
    controlsOverlay.id = 'video-controls-overlay';
    controlsOverlay.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        height: 80px;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 15px;
        gap: 10px;
        z-index: 15;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: auto;
    `;
    
    // Pulsante Play/Pause (unico controllo) - al centro
    const playPauseBtn = document.createElement('button');
    playPauseBtn.id = 'play-pause-btn';
    playPauseBtn.innerHTML = '⏸️';
    playPauseBtn.title = 'Play/Pausa';
    playPauseBtn.style.cssText = `
        background: linear-gradient(45deg, #ff6b35, #ff8c42);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
        margin: 0 auto;
    `;
    
    // Indicatore di stato
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'status-indicator';
    statusIndicator.innerHTML = 'In riproduzione';
    statusIndicator.style.cssText = `
        color: white;
        font-size: 11px;
        font-weight: bold;
        text-align: center;
        min-width: 80px;
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Assembla i controlli semplificati - solo play/pause al centro
    controlsOverlay.appendChild(playPauseBtn);
    controlsOverlay.appendChild(statusIndicator);
    
    // Event listener solo per play/pause
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.debugLogger.log('🎮 Click su pulsante play/pause');
        toggleVideoPlayback(iframe, playPauseBtn, statusIndicator);
    });
    
    // Effetto hover solo per play/pause
    playPauseBtn.addEventListener('mouseenter', () => {
        playPauseBtn.style.transform = 'scale(1.15)';
        playPauseBtn.style.filter = 'brightness(1.2)';
        playPauseBtn.style.boxShadow = '0 6px 12px rgba(255, 107, 53, 0.5)';
    });
    
    playPauseBtn.addEventListener('mouseleave', () => {
        playPauseBtn.style.transform = 'scale(1)';
        playPauseBtn.style.filter = 'brightness(1)';
        playPauseBtn.style.boxShadow = '0 4px 8px rgba(255, 107, 53, 0.3)';
    });
    
    // Overlay per mostrare/nascondere controlli (NON copre l'area controlli)
    const hoverArea = document.createElement('div');
    hoverArea.id = 'video-hover-area';
    hoverArea.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: calc(100% - 90px);
        background: transparent;
        z-index: 12;
        cursor: pointer;
        pointer-events: auto;
    `;
    
    // Gestione hover per mostrare controlli
    hoverArea.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        controlsOverlay.style.opacity = '1';
        window.debugLogger.log('👀 Controlli video visibili');
    });
    
    hoverArea.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        // NON nascondere controlli immediatamente - lascia che l'hover sui controlli li mantenga
        setTimeout(() => {
            if (!controlsOverlay.matches(':hover')) {
                controlsOverlay.style.opacity = '0';
            }
        }, 200);
    });
    
    // Click generico sull'area video (NON sui controlli)
    hoverArea.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        window.debugLogger.log('🎮 Click su area video (non controlli) - toggle play/pause');
        toggleVideoPlayback(iframe, playPauseBtn, statusIndicator);
    });
    
    // Hover sui controlli per mantenerli visibili
    controlsOverlay.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        controlsOverlay.style.opacity = '1';
    });
    
    controlsOverlay.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        controlsOverlay.style.opacity = '0';
    });
    
    // Aggiungi messaggio di caricamento
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'loading-message';
    loadingMsg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        z-index: 5;
        background: rgba(0,0,0,0.7);
        padding: 20px;
        border-radius: 10px;
    `;
    loadingMsg.innerHTML = '🎬 Caricamento video YouTube...<br>Attendere...';
    
    // Crea il pulsante Termina Esercizio
    const terminaBtn = document.createElement('button');
    terminaBtn.id = 'termina-esercizio-btn';
    terminaBtn.innerHTML = '🏁 Termina Esercizio';
    terminaBtn.style.cssText = `
        position: absolute;
        bottom: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #e74c3c, #c0392b);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        transition: all 0.3s ease;
        z-index: 20;
        pointer-events: auto;
    `;
    
    // Hover effects per il pulsante
    terminaBtn.addEventListener('mouseenter', () => {
        terminaBtn.style.transform = 'translateX(-50%) scale(1.05)';
        terminaBtn.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.5)';
    });
    
    terminaBtn.addEventListener('mouseleave', () => {
        terminaBtn.style.transform = 'translateX(-50%) scale(1)';
        terminaBtn.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
    });
    
    // Event listener per il click
    terminaBtn.addEventListener('click', async () => {
        window.debugLogger.log('🏁 Pulsante Termina Esercizio cliccato');
        
        // Disabilita il pulsante durante l'operazione
        terminaBtn.disabled = true;
        terminaBtn.innerHTML = '⏳ Terminando...';
        terminaBtn.style.opacity = '0.7';
        
        try {
            // Chiama setStatoSimulazioneStudente con stato "finito"
            await setStudentSimulationFinished();
            
            // Chiama finishSimulation per mostrare il banner di valutazione
            finishSimulation();
            
        } catch (error) {
            window.debugLogger.log('❌ Errore nel terminare esercizio', error.message);
            alert('Errore nel terminare l\'esercizio. Riprova.');
            
            // Riabilita il pulsante in caso di errore
            terminaBtn.disabled = false;
            terminaBtn.innerHTML = '🏁 Termina Esercizio';
            terminaBtn.style.opacity = '1';
        }
    });
    
    // Assembla il contenitore
    containerDiv.appendChild(loadingMsg);
    containerDiv.appendChild(iframe);
    containerDiv.appendChild(hoverArea);
    containerDiv.appendChild(controlsOverlay);
    containerDiv.appendChild(terminaBtn);
    
    // Crea l'oggetto CSS3D
    const css3dObject = new THREE.CSS3DObject(containerDiv);
    
    // Posiziona il pannello ruotato di 90° (non specchiato) e spostato verso sinistra
    css3dObject.position.set(-8, 15, 0); // X più negativo = più a sinistra
    css3dObject.rotation.y = Math.PI / 2; // 90° = rotazione verso sinistra (non specchiato)
    css3dObject.scale.set(0.025, 0.025, 0.025);
    
    // Crea un piano invisibile per il raycasting del video (stesso size e posizione del CSS3D)
    const raycastGeometry = new THREE.PlaneGeometry(16, 9); // Dimensioni simili al video
    const raycastMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    const raycastPlane = new THREE.Mesh(raycastGeometry, raycastMaterial);
    raycastPlane.position.copy(css3dObject.position);
    raycastPlane.rotation.copy(css3dObject.rotation); // Copia la stessa rotazione
    raycastPlane.userData = { 
        type: 'videoPanel', 
        isRaycastPlane: true,
        videoId: videoId 
    };
    
    // Crea un piano invisibile per il pulsante "Termina Esercizio"
    // Pulsante CSS: ~200px x 48px, con scala 0.025 = ~5 x 1.2 unità nel mondo 3D
    const buttonRaycastGeometry = new THREE.PlaneGeometry(5, 1.2); // Dimensioni del pulsante
    const buttonRaycastMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0, // Invisibile
        color: 0xff0000,
        side: THREE.DoubleSide
    });
    const buttonRaycastPlane = new THREE.Mesh(buttonRaycastGeometry, buttonRaycastMaterial);
    
    // Posiziona il piano del pulsante sotto il video
    // Il container CSS3D ha scala 0.025, quindi il pulsante è a circa -60px = -1.5 unità nel mondo 3D
    buttonRaycastPlane.position.copy(css3dObject.position);
    buttonRaycastPlane.position.y -= 1.5; // Aggiustato per la posizione reale del pulsante (-60px * 0.025)
    buttonRaycastPlane.rotation.copy(css3dObject.rotation);
    buttonRaycastPlane.userData = { 
        type: 'terminaEsercizioBtn', 
        isRaycastPlane: true,
        videoId: videoId 
    };
    
    // Aggiungi entrambi i piani invisibili alla scena principale per il raycasting
    scene.add(raycastPlane);
    scene.add(buttonRaycastPlane);
    
    // DEBUG: Log delle posizioni
    window.debugLogger.log('🎮 Piani raycasting creati', {
        videoPanelPos: css3dObject.position,
        videoPlanePos: raycastPlane.position,
        buttonPlanePos: buttonRaycastPlane.position,
        buttonPlaneDimensions: {width: 5, height: 1.2},
        videoPlaneUserData: raycastPlane.userData,
        buttonPlaneUserData: buttonRaycastPlane.userData
    });
    
    // Salva il riferimento
    videoPanel = css3dObject;
    videoPanel.userData = { 
        type: 'videoPanel', 
        videoId: videoId,
        iframe: iframe,
        container: containerDiv,
        controlsOverlay: controlsOverlay,
        playPauseBtn: playPauseBtn,
        statusIndicator: statusIndicator,
        raycastPlane: raycastPlane,
        buttonRaycastPlane: buttonRaycastPlane,
        terminaBtn: terminaBtn,
        isPlaying: true
    };
    
    // Aggiungi alla scena CSS3D
    css3dScene.add(videoPanel);

    // Gestione eventi iframe
    iframe.onload = () => {
        window.debugLogger.log('✅ Iframe YouTube caricato completamente');
        
        // Rimuovi messaggio di caricamento dopo un breve delay
        setTimeout(() => {
            if (loadingMsg.parentNode) {
                loadingMsg.style.opacity = '0';
                setTimeout(() => {
                    if (loadingMsg.parentNode) {
                        loadingMsg.remove();
                    }
                }, 300);
            }
        }, 2000);
        
        // Abilita controlli personalizzati dopo il caricamento
        setTimeout(() => {
            hoverArea.style.pointerEvents = 'auto';
            controlsOverlay.style.pointerEvents = 'auto';
            containerDiv.style.pointerEvents = 'auto';
            
            // Forza l'attivazione dei controlli
            window.debugLogger.log('✅ Controlli video abilitati');
            
            // Abilita il listener per messaggi YouTube API
            setupYouTubeMessageListener(iframe, statusIndicator);
            
            // Test di visibilità controlli
            window.debugLogger.log('Debug controlli:', {
                hoverAreaVisible: hoverArea.offsetParent !== null,
                controlsVisible: controlsOverlay.offsetParent !== null,
                containerVisible: containerDiv.offsetParent !== null
            });
        }, 3000);
    };
    
    iframe.onerror = () => {
        window.debugLogger.log('❌ Errore caricamento iframe YouTube');
        loadingMsg.innerHTML = '❌ Errore caricamento video<br>Verifica la connessione';
        loadingMsg.style.background = 'rgba(255,0,0,0.7)';
    };
    
    window.debugLogger.log('Pannello video CSS3D creato con iframe YouTube', {
        position: css3dObject.position,
        videoId: videoId,
        embedUrl: embedUrl
    });
    
    // Debug del sistema dopo la creazione
    setTimeout(() => {
        debugVideoSystem();
    }, 1000);
}

/**
 * Carica un video YouTube nell'elemento video HTML5
 * @param {string} videoId - ID del video YouTube
 * @param {HTMLVideoElement} videoElement - Elemento video HTML5
 */
function loadVideoFromYouTube(videoId, videoElement) {
    window.debugLogger.log('🎬 Tentativo caricamento video YouTube', videoId);
    
    // Lista di possibili formati video YouTube
    const videoUrls = [
        `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`,
        `https://invidio.us/embed/${videoId}?autoplay=1`
    ];
    
    // Crea un iframe nascosto per gestire il player YouTube
    const hiddenIframe = document.createElement('iframe');
    hiddenIframe.id = 'hidden-youtube-iframe';
    hiddenIframe.style.display = 'none';
    hiddenIframe.style.position = 'absolute';
    hiddenIframe.style.top = '-1000px';
    hiddenIframe.src = videoUrls[0];
    hiddenIframe.allow = 'autoplay; encrypted-media';
    document.body.appendChild(hiddenIframe);
    
    // Mostra un messaggio di caricamento sulla texture
    showVideoLoadingMessage(videoElement);
    
    // Gestione eventi per l'iframe
    hiddenIframe.onload = () => {
        window.debugLogger.log('✅ Iframe YouTube caricato');
        
        // Tenta di ottenere l'audio dal iframe
        setTimeout(() => {
            checkVideoPlayback(videoElement, hiddenIframe);
        }, 2000);
    };
    
    hiddenIframe.onerror = () => {
        window.debugLogger.log('❌ Errore caricamento iframe YouTube');
        showVideoErrorMessage(videoElement);
    };
    
    // Gestione eventi dell'elemento video
    videoElement.addEventListener('loadstart', () => {
        window.debugLogger.log('📺 Video inizia a caricare');
    });
    
    videoElement.addEventListener('loadeddata', () => {
        window.debugLogger.log('✅ Dati video caricati');
        hideVideoLoadingMessage(videoElement);
    });
    
    videoElement.addEventListener('error', (e) => {
        window.debugLogger.log('❌ Errore video:', e.error);
        showVideoErrorMessage(videoElement);
    });
    
    // Fallback: usa un video di test se YouTube non funziona
    setTimeout(() => {
        if (videoElement.readyState === 0) {
            window.debugLogger.log('⚠️ Timeout YouTube, uso video di test');
            useTestVideo(videoElement);
        }
    }, 10000);
}

/**
 * Mostra un messaggio di caricamento sulla texture video
 */
function showVideoLoadingMessage(videoElement) {
    // Crea un canvas temporaneo per mostrare il messaggio
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Sfondo scuro
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bordo arancione
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Testo di caricamento
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 Caricamento Video...', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '60px Arial';
    ctx.fillText('Preparazione del contenuto YouTube', canvas.width / 2, canvas.height / 2 + 50);
    
    // Converti canvas in blob e usalo come sorgente video temporanea
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        videoElement.poster = url;
    });
}

/**
 * Nasconde il messaggio di caricamento
 */
function hideVideoLoadingMessage(videoElement) {
    if (videoElement.poster) {
        URL.revokeObjectURL(videoElement.poster);
        videoElement.poster = '';
    }
}

/**
 * Mostra un messaggio di errore sulla texture video
 */
function showVideoErrorMessage(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Sfondo rosso scuro
    ctx.fillStyle = '#2d1b1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bordo rosso
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Testo di errore
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('❌ Errore Video', canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = '60px Arial';
    ctx.fillText('Il video YouTube non può essere caricato', canvas.width / 2, canvas.height / 2);
    ctx.font = '50px Arial';
    ctx.fillText('Verifica la connessione internet', canvas.width / 2, canvas.height / 2 + 80);
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        videoElement.poster = url;
    });
}

/**
 * Usa un video di test quando YouTube non funziona
 */
function useTestVideo(videoElement) {
    window.debugLogger.log('🧪 Caricamento video di test');
    
    // Crea un canvas animato come fallback
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    let frame = 0;
    const animate = () => {
        // Sfondo animato
        const hue = (frame * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 50%, 20%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Bordo arancione
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Testo animato
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        const scale = 1 + Math.sin(frame * 0.1) * 0.1;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.fillText('🎬 VIDEO DEMO', 0, -50);
        ctx.restore();
        
        ctx.font = '60px Arial';
        ctx.fillText('Simulazione Educativa VR', canvas.width / 2, canvas.height / 2 + 100);
        
        frame++;
        if (frame < 300) { // 10 secondi a 30fps
            requestAnimationFrame(animate);
        }
    };
    
    animate();
    
    // Converti canvas in stream video
    const stream = canvas.captureStream(30);
    videoElement.srcObject = stream;
    videoElement.play();
}

/**
 * Controlla se il video sta riproducendo correttamente
 */
function checkVideoPlayback(videoElement, iframe) {
    let checks = 0;
    const maxChecks = 10;
    
    const monitor = setInterval(() => {
        checks++;
        window.debugLogger.log(`🔍 Check playback ${checks}/${maxChecks}`);
        
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
            window.debugLogger.log('✅ Video pronto per la riproduzione');
            clearInterval(monitor);
            return;
        }
        
        if (checks >= maxChecks) {
            window.debugLogger.log('⚠️ Video non pronto, uso fallback');
            useTestVideo(videoElement);
            clearInterval(monitor);
        }
    }, 1000);
}

/**
 * Controlla la riproduzione del video YouTube (play/pause) usando postMessage
 * @param {HTMLIFrameElement} iframe - L'iframe YouTube
 * @param {HTMLButtonElement} playPauseBtn - Il pulsante play/pause
 * @param {HTMLElement} statusIndicator - L'indicatore di stato
 */
function toggleVideoPlayback(iframe, playPauseBtn, statusIndicator) {
    if (!iframe || !playPauseBtn || !statusIndicator) {
        window.debugLogger.log('❌ Elementi controllo video mancanti');
        return;
    }
    
    const userData = videoPanel.userData;
    
    if (userData.isPlaying) {
        // Metti in pausa usando postMessage API
        try {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            window.debugLogger.log('📤 Comando pausa inviato al player YouTube');
        } catch (error) {
            window.debugLogger.log('⚠️ Errore postMessage pausa, uso metodo fallback');
            // Fallback: overlay di pausa visivo
            showPauseOverlay(true);
        }
        
        playPauseBtn.innerHTML = '▶️';
        statusIndicator.innerHTML = 'In pausa';
        userData.isPlaying = false;
        
        window.debugLogger.log('⏸️ Video messo in pausa');
        showVideoStatusMessage('Video in pausa');
    } else {
        // Riprendi la riproduzione usando postMessage API
        try {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            window.debugLogger.log('📤 Comando play inviato al player YouTube');
        } catch (error) {
            window.debugLogger.log('⚠️ Errore postMessage play, uso metodo fallback');
            // Fallback: rimuovi overlay di pausa
            showPauseOverlay(false);
        }
        
        playPauseBtn.innerHTML = '⏸️';
        statusIndicator.innerHTML = 'In riproduzione';
        userData.isPlaying = true;
        
        window.debugLogger.log('▶️ Video ripreso dalla posizione corrente');
        showVideoStatusMessage('Video in riproduzione');
    }
}

/**
 * Configura il listener per i messaggi dal player YouTube
 * @param {HTMLIFrameElement} iframe - L'iframe YouTube
 * @param {HTMLElement} statusIndicator - L'indicatore di stato
 */
function setupYouTubeMessageListener(iframe, statusIndicator) {
    if (window.youtubeMessageListener) {
        window.removeEventListener('message', window.youtubeMessageListener);
    }
    
    window.youtubeMessageListener = function(event) {
        // Verifica che il messaggio venga dall'iframe YouTube
        if (event.origin !== 'https://www.youtube.com') {
            return;
        }
        
        try {
            const data = JSON.parse(event.data);
            if (data.event === 'video-progress' && data.info) {
                // Aggiorna lo stato basato sui dati del player
                const playerState = data.info.playerState;
                window.debugLogger.log('📺 Stato player YouTube:', {
                    playerState,
                    currentTime: data.info.currentTime,
                    duration: data.info.duration
                });
                
                // Sincronizza lo stato dei controlli
                if (videoPanel && videoPanel.userData) {
                    const userData = videoPanel.userData;
                    const playPauseBtn = userData.playPauseBtn;
                    
                    if (playerState === 1) { // Playing
                        userData.isPlaying = true;
                        if (playPauseBtn) playPauseBtn.innerHTML = '⏸️';
                        if (statusIndicator) statusIndicator.innerHTML = 'In riproduzione';
                        showPauseOverlay(false);
                    } else if (playerState === 2) { // Paused
                        userData.isPlaying = false;
                        if (playPauseBtn) playPauseBtn.innerHTML = '▶️';
                        if (statusIndicator) statusIndicator.innerHTML = 'In pausa';
                    }
                }
            }
        } catch (e) {
            // Ignora messaggi non JSON o non rilevanti
        }
    };
    
    window.addEventListener('message', window.youtubeMessageListener);
    window.debugLogger.log('🎧 Listener messaggi YouTube API configurato');
}

/**
 * Mostra/nasconde un overlay di pausa visivo come fallback
 * @param {boolean} show - Se mostrare o nascondere l'overlay
 */
function showPauseOverlay(show) {
    if (!videoPanel || !videoPanel.userData.container) {
        return;
    }
    
    const container = videoPanel.userData.container;
    let pauseOverlay = container.querySelector('#pause-overlay');
    
    if (show) {
        if (!pauseOverlay) {
            pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20;
                color: white;
                font-size: 60px;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                backdrop-filter: blur(2px);
            `;
            pauseOverlay.innerHTML = '⏸️<br><span style="font-size: 20px;">Video in pausa</span>';
            container.appendChild(pauseOverlay);
        }
        pauseOverlay.style.display = 'flex';
        window.debugLogger.log('🛑 Overlay pausa mostrato');
    } else {
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
            window.debugLogger.log('▶️ Overlay pausa nascosto');
        }
    }
}

/**
 * Salta il video avanti o indietro di un numero specifico di secondi
 * @param {HTMLIFrameElement} iframe - L'iframe YouTube
 * @param {number} seconds - Secondi da saltare (positivo = avanti, negativo = indietro)
 * @param {HTMLElement} statusIndicator - L'indicatore di stato
 */
function skipVideo(iframe, seconds, statusIndicator) {
    if (!iframe || !statusIndicator) {
        window.debugLogger.log('❌ Elementi per skip video mancanti');
        return;
    }
    
    const direction = seconds > 0 ? 'avanti' : 'indietro';
    const absSeconds = Math.abs(seconds);
    
    window.debugLogger.log(`⏯️ Skip video ${direction} di ${absSeconds} secondi`);
    
    try {
        // Usa l'API YouTube per saltare
        const command = seconds > 0 ? 'seekTo' : 'seekTo';
        const message = {
            event: 'command',
            func: 'getCurrentTime',
            args: ''
        };
        
        // Prima ottieni il tempo corrente, poi calcola il nuovo tempo
        iframe.contentWindow.postMessage(JSON.stringify(message), '*');
        
        // Fallback: usa una stima temporale
        setTimeout(() => {
            const seekMessage = {
                event: 'command',
                func: 'seekTo',
                args: [seconds > 0 ? 10 : 0] // Semplificato per ora
            };
            iframe.contentWindow.postMessage(JSON.stringify(seekMessage), '*');
            
            statusIndicator.innerHTML = `Skip ${direction} ${absSeconds}s`;
            setTimeout(() => {
                statusIndicator.innerHTML = videoPanel.userData.isPlaying ? 'In riproduzione' : 'In pausa';
            }, 1500);
            
            window.debugLogger.log(`✅ Comando skip ${direction} inviato`);
        }, 100);
        
        showVideoStatusMessage(`Skip ${direction} ${absSeconds} secondi`);
        
    } catch (error) {
        window.debugLogger.log(`❌ Errore skip ${direction}:`, error.message);
        showVideoStatusMessage(`Errore skip ${direction}`);
    }
}

/**
 * Regola il volume del video
 * @param {HTMLIFrameElement} iframe - L'iframe YouTube
 * @param {number} change - Cambiamento volume (-10 a +10)
 * @param {HTMLElement} statusIndicator - L'indicatore di stato
 */
function adjustVolume(iframe, change, statusIndicator) {
    if (!iframe || !statusIndicator) {
        window.debugLogger.log('❌ Elementi per volume mancanti');
        return;
    }
    
    // Mantieni il volume corrente (semplificato)
    if (!window.currentVolume) {
        window.currentVolume = 100; // Volume iniziale
    }
    
    const newVolume = Math.max(0, Math.min(100, window.currentVolume + change));
    window.currentVolume = newVolume;
    
    const action = change > 0 ? 'alzato' : 'abbassato';
    
    window.debugLogger.log(`🔊 Volume ${action} a ${newVolume}%`);
    
    try {
        // Usa l'API YouTube per il volume
        const message = {
            event: 'command',
            func: 'setVolume',
            args: [newVolume]
        };
        
        iframe.contentWindow.postMessage(JSON.stringify(message), '*');
        
        // Aggiorna indicatore
        statusIndicator.innerHTML = `Volume: ${newVolume}%`;
        setTimeout(() => {
            statusIndicator.innerHTML = videoPanel.userData.isPlaying ? 'In riproduzione' : 'In pausa';
        }, 1500);
        
        // Aggiorna icone volume in base al livello
        updateVolumeIcons(newVolume);
        
        window.debugLogger.log(`✅ Volume impostato a ${newVolume}%`);
        showVideoStatusMessage(`Volume: ${newVolume}%`);
        
    } catch (error) {
        window.debugLogger.log('❌ Errore controllo volume:', error.message);
        showVideoStatusMessage('Errore controllo volume');
    }
}

/**
 * Aggiorna le icone del volume in base al livello
 * @param {number} volume - Livello volume (0-100)
 */
function updateVolumeIcons(volume) {
    const volumeDownBtn = document.getElementById('volume-down-btn');
    const volumeUpBtn = document.getElementById('volume-up-btn');
    
    if (volumeDownBtn && volumeUpBtn) {
        if (volume === 0) {
            volumeDownBtn.innerHTML = '🔇';
            volumeUpBtn.innerHTML = '🔊';
        } else if (volume < 30) {
            volumeDownBtn.innerHTML = '🔈';
            volumeUpBtn.innerHTML = '🔊';
        } else if (volume < 70) {
            volumeDownBtn.innerHTML = '🔉';
            volumeUpBtn.innerHTML = '🔊';
        } else {
            volumeDownBtn.innerHTML = '🔉';
            volumeUpBtn.innerHTML = '🔊';
        }
    }
}

/**
 * Riavvia il video dall'inizio
 * @param {HTMLIFrameElement} iframe - L'iframe YouTube
 * @param {HTMLElement} statusIndicator - L'indicatore di stato
 */
function restartVideo(iframe, statusIndicator) {
    if (!iframe || !statusIndicator) {
        window.debugLogger.log('❌ Elementi controllo video mancanti per restart');
        return;
    }
    
    window.debugLogger.log('🔄 Riavvio video dall\'inizio');
    
    // Forza il reload dell'iframe per riavviare dall'inizio
    const currentSrc = iframe.src;
    const restartUrl = currentSrc.replace('autoplay=0', 'autoplay=1');
    
    iframe.src = '';
    setTimeout(() => {
        iframe.src = restartUrl;
        statusIndicator.innerHTML = 'Riavvio video...';
        
        // Aggiorna stato
        if (videoPanel.userData) {
            videoPanel.userData.isPlaying = true;
            videoPanel.userData.playPauseBtn.innerHTML = '⏸️';
        }
        
        setTimeout(() => {
            statusIndicator.innerHTML = 'In riproduzione';
        }, 2000);
        
        window.debugLogger.log('✅ Video riavviato con successo');
        showVideoStatusMessage('Video riavviato dall\'inizio');
    }, 100);
}

/**
 * Gestisce l'interazione con il pannello video CSS3D
 * @param {THREE.Object3D} videoObject - L'oggetto video CSS3D cliccato
 */
function handleVideoInteractionCSS3D(videoObject) {
    if (!videoObject.userData || !videoObject.userData.iframe) {
        window.debugLogger.log('❌ Oggetto video CSS3D non valido');
        return;
    }
    
    window.debugLogger.log('🎮 Interazione video CSS3D', {
        videoId: videoObject.userData.videoId,
        isPlaying: videoObject.userData.isPlaying
    });
    
    // Attiva toggle play/pause
    toggleVideoPlayback(
        videoObject.userData.iframe,
        videoObject.userData.playPauseBtn,
        videoObject.userData.statusIndicator
    );
    
    // Mostra temporaneamente i controlli
    if (videoObject.userData.controlsOverlay) {
        const controls = videoObject.userData.controlsOverlay;
        controls.style.opacity = '1';
        
        setTimeout(() => {
            controls.style.opacity = '0';
        }, 3000);
    }
}

/**
 * Gestisce l'interazione con il pannello video (VideoTexture - legacy)
 * @param {THREE.Object3D} videoObject - L'oggetto video cliccato
 */
function handleVideoInteraction(videoObject) {
    if (!videoObject.userData || !videoObject.userData.videoElement) {
        window.debugLogger.log('❌ Oggetto video non valido');
        return;
    }
    
    const video = videoObject.userData.videoElement;
    
    window.debugLogger.log('🎮 Interazione video', {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        readyState: video.readyState
    });
    
    // Toggle play/pause
    if (video.paused) {
        video.play()
            .then(() => {
                window.debugLogger.log('▶️ Video in riproduzione');
                showVideoStatusMessage('Video in riproduzione');
            })
            .catch(error => {
                window.debugLogger.log('❌ Errore riproduzione video:', error.message);
                showVideoStatusMessage('Errore: ' + error.message);
            });
    } else {
        video.pause();
        window.debugLogger.log('⏸️ Video in pausa');
        showVideoStatusMessage('Video in pausa');
    }
}

/**
 * Mostra un messaggio di stato video
 * @param {string} message - Messaggio da mostrare
 */
function showVideoStatusMessage(message) {
    // Rimuovi messaggio precedente se esiste
    const existingMessage = document.getElementById('video-status-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crea nuovo messaggio
    const messageDiv = document.createElement('div');
    messageDiv.id = 'video-status-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 107, 53, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Rimuovi automaticamente dopo 3 secondi
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * Carica l'API YouTube se non è già caricata
 * @param {Function} callback - Funzione da chiamare quando l'API è pronta
 */
function loadYouTubeAPI(callback) {
    // Se l'API è già disponibile, esegui il callback
    if (window.YT && window.YT.Player) {
        window.debugLogger.log('API YouTube già caricata');
        callback();
        return;
    }

    // Se l'API sta caricando, aggiungi il callback alla coda
    if (window.youTubeAPICallbacks) {
        window.youTubeAPICallbacks.push(callback);
        return;
    }

    // Inizializza la coda dei callback
    window.youTubeAPICallbacks = [callback];

    // Sostituisci la funzione onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function() {
        window.debugLogger.log('API YouTube caricata, esecuzione callback');
        
        // Esegui tutti i callback in attesa
        window.youTubeAPICallbacks.forEach(cb => {
            try {
                cb();
            } catch (error) {
                console.error('Errore nel callback YouTube API:', error);
            }
        });
        
        // Pulisci la coda
        window.youTubeAPICallbacks = [];
    };

    window.debugLogger.log('Attesa caricamento API YouTube...');
}

/**
 * Inizializza il player YouTube
 * @param {string} videoId - ID del video YouTube
 */
function initYouTubePlayer(videoId) {
    window.debugLogger.log('Inizializzazione player YouTube', videoId);

    // Aspetta che l'elemento DOM sia disponibile nel CSS3D
    setTimeout(() => {
        const playerElement = document.getElementById('youtube-player');
        if (!playerElement) {
            window.debugLogger.log('Elemento youtube-player non trovato nel DOM');
            showVideoErrorBanner('Elemento player non trovato');
            return;
        }

        window.debugLogger.log('Elemento youtube-player trovato, creazione player...');

        try {
        youtubePlayer = new YT.Player('youtube-player', {
                height: '450',
                width: '800',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0,
                'showinfo': 0,
                    'modestbranding': 1,
                    'fs': 1,
                    'enablejsapi': 1,
                    'origin': window.location.origin
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });

            window.debugLogger.log('Player YouTube istanziato con successo');
            
            // Avvia il monitoraggio del player
            monitorYouTubePlayer();
        } catch (error) {
            console.error('Errore nella creazione del player YouTube:', error);
            window.debugLogger.log('Errore creazione player', error.message);
            showVideoErrorBanner('Errore nella creazione del player video');
        }
    }, 500); // Aspetta 500ms per assicurarsi che l'elemento sia nel DOM

    function onPlayerReady(event) {
        videoPlayerReady = true;
        window.debugLogger.log('🎉 Player YouTube pronto per la riproduzione');
        
        // Prova ad avviare il video
        try {
            event.target.playVideo();
            window.debugLogger.log('▶️ Avvio riproduzione video richiesto');
        } catch (error) {
            console.error('Errore nell\'avvio del video:', error);
            window.debugLogger.log('❌ Errore avvio video', error.message);
        }
    }

    function onPlayerStateChange(event) {
        const states = {
            '-1': 'NON_INIZIATO',
            '0': 'TERMINATO',
            '1': 'IN_RIPRODUZIONE',
            '2': 'IN_PAUSA',
            '3': 'BUFFERING',
            '5': 'IN_CODA'
        };
        
        const stateName = states[event.data] || 'SCONOSCIUTO';
        window.debugLogger.log('📺 Stato player cambiato', `${event.data} (${stateName})`);
        
        // Se il video è in riproduzione
        if (event.data === YT.PlayerState.PLAYING) {
            window.debugLogger.log('✅ Video in riproduzione');
        }
        
        // Se il video è finito (stato 0)
        if (event.data === YT.PlayerState.ENDED) {
            window.debugLogger.log('🏁 Video terminato');
            // Rimosso finishSimulation() automatico - ora gestito dal pulsante manuale
        }
        
        // Se c'è un errore di buffering prolungato
        if (event.data === YT.PlayerState.BUFFERING) {
            window.debugLogger.log('⏳ Video in buffering...');
        }
    }

    function onPlayerError(event) {
        const errorMessages = {
            2: 'Parametro richiesta non valido',
            5: 'Errore del player HTML5',
            100: 'Video non trovato o privato',
            101: 'Video non disponibile per la riproduzione incorporata',
            150: 'Video non disponibile per la riproduzione incorporata'
        };
        
        const errorMsg = errorMessages[event.data] || `Errore sconosciuto (${event.data})`;
        console.error('Errore player YouTube:', event.data, errorMsg);
        window.debugLogger.log('❌ Errore player YouTube', `${event.data}: ${errorMsg}`);
        showVideoErrorBanner(`Errore video: ${errorMsg}`);
    }
}

/**
 * Funzione di debug per verificare lo stato del sistema video CSS3D
 */
function debugVideoSystem() {
    window.debugLogger.log('=== DEBUG SISTEMA VIDEO (CSS3D + YouTube) ===');
    
    // Verifica presenza pannello video
    window.debugLogger.log('Video Panel presente', !!videoPanel);
    if (videoPanel) {
        window.debugLogger.log('Video Panel tipo', videoPanel.type);
        window.debugLogger.log('Video Panel position', {
            x: videoPanel.position.x,
            y: videoPanel.position.y,
            z: videoPanel.position.z
        });
        window.debugLogger.log('Video Panel rotation', {
            x: (videoPanel.rotation.x * 180 / Math.PI).toFixed(1) + '°',
            y: (videoPanel.rotation.y * 180 / Math.PI).toFixed(1) + '°',
            z: (videoPanel.rotation.z * 180 / Math.PI).toFixed(1) + '°'
        });
        window.debugLogger.log('Video Panel scale', {
            x: videoPanel.scale.x,
            y: videoPanel.scale.y,
            z: videoPanel.scale.z
        });
        window.debugLogger.log('Video Panel userData', videoPanel.userData);
        
        // Verifica iframe YouTube
        if (videoPanel.userData && videoPanel.userData.iframe) {
            const iframe = videoPanel.userData.iframe;
            window.debugLogger.log('YouTube Iframe presente', !!iframe);
            window.debugLogger.log('YouTube Iframe src', iframe.src);
            window.debugLogger.log('YouTube Iframe dimensioni', {
                width: iframe.style.width,
                height: iframe.style.height
            });
        }
        
        // Verifica container
        if (videoPanel.userData && videoPanel.userData.container) {
            const container = videoPanel.userData.container;
            window.debugLogger.log('Container presente', !!container);
            window.debugLogger.log('Container ID', container.id);
            window.debugLogger.log('Container dimensioni', {
                width: container.style.width,
                height: container.style.height
            });
        }
    }
    
    // Verifica CSS3D renderer e scena
    window.debugLogger.log('CSS3D Renderer presente', !!css3dRenderer);
    window.debugLogger.log('CSS3D Scene presente', !!css3dScene);
    if (css3dScene) {
        window.debugLogger.log('Oggetti nella scena CSS3D', css3dScene.children.length);
        const videoObjects = css3dScene.children.filter(obj => 
            obj.userData && obj.userData.type === 'videoPanel'
        );
        window.debugLogger.log('Oggetti video nella scena CSS3D', videoObjects.length);
    }
    
    // Verifica container CSS3D nel DOM
    const css3dContainer = document.getElementById('css3d-container');
    window.debugLogger.log('CSS3D Container presente', !!css3dContainer);
    if (css3dContainer) {
        window.debugLogger.log('CSS3D Container visibile', css3dContainer.style.display !== 'none');
        window.debugLogger.log('CSS3D Container z-index', css3dContainer.style.zIndex);
        window.debugLogger.log('CSS3D Container dimensioni', {
            width: css3dContainer.style.width,
            height: css3dContainer.style.height
        });
    }
    
    // Verifica elementi DOM YouTube
    const youtubeContainer = document.getElementById('youtube-player-container');
    window.debugLogger.log('YouTube Container DOM presente', !!youtubeContainer);
    if (youtubeContainer) {
        window.debugLogger.log('YouTube Container visibile', youtubeContainer.style.display !== 'none');
        window.debugLogger.log('YouTube Container figli', youtubeContainer.children.length);
    }
    
    const youtubeIframe = document.getElementById('youtube-player-iframe');
    window.debugLogger.log('YouTube Iframe DOM presente', !!youtubeIframe);
    if (youtubeIframe) {
        window.debugLogger.log('YouTube Iframe loaded', youtubeIframe.complete);
        window.debugLogger.log('YouTube Iframe contentDocument', !!youtubeIframe.contentDocument);
    }
    
    // Verifica renderer
    window.debugLogger.log('WebGL Renderer presente', !!renderer);
    if (renderer) {
        window.debugLogger.log('Renderer info', {
            width: renderer.domElement.width,
            height: renderer.domElement.height,
            pixelRatio: renderer.getPixelRatio()
        });
    }
    
    window.debugLogger.log('=== FINE DEBUG ===');
}

/**
 * Monitora il player YouTube per 10 secondi dopo l'inizializzazione
 */
function monitorYouTubePlayer() {
    let checks = 0;
    const maxChecks = 20; // 10 secondi con check ogni 500ms
    
    const monitor = setInterval(() => {
        checks++;
        window.debugLogger.log(`🔍 Monitor YouTube ${checks}/${maxChecks}`);
        
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            const iframe = playerElement.querySelector('iframe');
            if (iframe) {
                window.debugLogger.log('✅ Iframe YouTube rilevato!', iframe.src);
                clearInterval(monitor);
                return;
            }
        }
        
        if (youtubePlayer && youtubePlayer.getPlayerState) {
            try {
                const state = youtubePlayer.getPlayerState();
                if (state !== -1) {
                    window.debugLogger.log('✅ Player YouTube attivo, stato:', state);
                    clearInterval(monitor);
                    return;
                }
            } catch (e) {
                // Player non ancora pronto
            }
        }
        
        if (checks >= maxChecks) {
            window.debugLogger.log('❌ Timeout monitoring YouTube player');
            clearInterval(monitor);
            debugVideoSystem();
        }
    }, 500);
}

// Esponi le funzioni di debug globalmente per test manuali
window.debugVideoSystem = debugVideoSystem;

/**
 * Funzione globale per testare il sistema video CSS3D con YouTube e controlli
 * @param {string} videoUrl - URL del video da testare (opzionale)
 */
window.testNewVideoSystem = function(videoUrl = 'https://www.youtube.com/watch?v=WIRoDrrGPx4') {
    window.debugLogger.log('🧪 Test sistema video CSS3D con controlli personalizzati', videoUrl);
    
    // Pulisci sistema precedente
    if (videoPanel) {
        if (videoPanel.parent === scene) {
            scene.remove(videoPanel);
        } else if (videoPanel.parent === css3dScene) {
            css3dScene.remove(videoPanel);
        }
        
        // Pulisci elementi DOM
        const oldVideo = document.getElementById('vr-video-element');
        if (oldVideo) oldVideo.remove();
        const oldContainer = document.getElementById('youtube-player-container');
        if (oldContainer) oldContainer.remove();
        
        videoPanel = null;
    }
    
    // Crea nuovo pannello video
    createVideoPanel(videoUrl);
    
    // Debug dopo 4 secondi per permettere il caricamento completo
    setTimeout(() => {
        debugVideoSystem();
        window.debugLogger.log('✅ Video YouTube caricato nel pannello 3D!');
        window.debugLogger.log('🎮 CONTROLLI AVANZATI DISPONIBILI:');
        window.debugLogger.log('  • Hover sul video = Mostra controlli personalizzati');
        window.debugLogger.log('  • ⏪ Skip indietro 10 secondi');
        window.debugLogger.log('  • ⏮️ Riavvia dall\'inizio');
        window.debugLogger.log('  • ⏸️▶️ Play/Pausa (mantiene posizione)');
        window.debugLogger.log('  • ⏩ Skip avanti 10 secondi');
        window.debugLogger.log('  • 🔉🔊 Controlli volume (+/- 10%)');
        window.debugLogger.log('  • Click pannello 3D = Toggle play/pause rapido');
    }, 4000);
    
    window.debugLogger.log('✅ Test sistema video con controlli avviato - attendi il caricamento...');
};

/**
 * Funzione per testare i controlli video direttamente
 */
window.testVideoControls = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo per testare i controlli');
        return;
    }
    
    window.debugLogger.log('🎮 Test controlli video');
    
    // Debug dello stato attuale
    const container = document.getElementById('youtube-player-container');
    const controls = document.getElementById('video-controls-overlay');
    const hover = document.getElementById('video-hover-area');
    
    window.debugLogger.log('Stato elementi video:', {
        container: !!container,
        controls: !!controls,
        hover: !!hover,
        containerPointerEvents: container?.style.pointerEvents,
        controlsPointerEvents: controls?.style.pointerEvents,
        hoverPointerEvents: hover?.style.pointerEvents
    });
    
    // Mostra i controlli forzatamente
    if (videoPanel.userData.controlsOverlay) {
        videoPanel.userData.controlsOverlay.style.opacity = '1';
        videoPanel.userData.controlsOverlay.style.pointerEvents = 'auto';
        
        setTimeout(() => {
            videoPanel.userData.controlsOverlay.style.opacity = '0';
        }, 8000);
    }
    
    // Test del sistema di toggle
    setTimeout(() => {
        window.debugLogger.log('🔄 Esecuzione test toggle play/pause');
        handleVideoInteractionCSS3D(videoPanel);
    }, 2000);
    
    window.debugLogger.log('✅ Test controlli in corso - osserva il pannello video!');
    window.debugLogger.log('💡 Prova anche a cliccare direttamente sul pannello video nella scena!');
};

/**
 * Forza l'attivazione dei controlli video
 */
window.forceVideoControlsActivation = function() {
    const container = document.getElementById('youtube-player-container');
    const controls = document.getElementById('video-controls-overlay');
    const hover = document.getElementById('video-hover-area');
    
    if (container) {
        container.style.pointerEvents = 'auto';
        window.debugLogger.log('✅ Container pointer-events attivato');
    }
    
    if (controls) {
        controls.style.pointerEvents = 'auto';
        controls.style.opacity = '1';
        window.debugLogger.log('✅ Controlli attivati e visibili');
        
        setTimeout(() => {
            controls.style.opacity = '0';
        }, 5000);
    }
    
    if (hover) {
        hover.style.pointerEvents = 'auto';
        hover.style.background = 'rgba(255,107,53,0.1)';
        window.debugLogger.log('✅ Area hover attivata');
        
        setTimeout(() => {
            hover.style.background = 'transparent';
        }, 2000);
    }
    
    window.debugLogger.log('🎮 Controlli video forzatamente attivati!');
};

/**
 * Testa il nuovo sistema play/pause senza restart
 */
window.testPlayPauseWithoutRestart = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo per testare play/pause');
        return;
    }
    
    window.debugLogger.log('🧪 Test play/pause senza restart');
    
    const userData = videoPanel.userData;
    window.debugLogger.log('Stato iniziale:', {
        isPlaying: userData.isPlaying,
        iframe: !!userData.iframe,
        hasAPI: !!window.youtubeMessageListener
    });
    
    // Mostra controlli
    if (userData.controlsOverlay) {
        userData.controlsOverlay.style.opacity = '1';
        
        setTimeout(() => {
            userData.controlsOverlay.style.opacity = '0';
        }, 10000);
    }
    
    // Test sequenza play/pause
    setTimeout(() => {
        window.debugLogger.log('🔄 Test pausa (dovrebbe mantenere posizione)');
        toggleVideoPlayback(userData.iframe, userData.playPauseBtn, userData.statusIndicator);
    }, 2000);
    
    setTimeout(() => {
        window.debugLogger.log('🔄 Test ripresa (dovrebbe continuare da dove fermato)');
        toggleVideoPlayback(userData.iframe, userData.playPauseBtn, userData.statusIndicator);
    }, 5000);
    
    window.debugLogger.log('✅ Test sequenza play/pause avviato!');
    window.debugLogger.log('📺 Osserva se il video riprende dalla stessa posizione');
};

/**
 * Logging sicuro che evita riferimenti circolari
 * @param {string} message - Messaggio
 * @param {any} data - Dati da loggare (saranno puliti da riferimenti circolari)
 */
function safeDebugLog(message, data) {
    try {
        // Crea una copia semplificata dell'oggetto evitando riferimenti circolari
        const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
            // Evita proprietà che possono causare riferimenti circolari
            if (key === 'parent' || key === 'children' || key === 'object' || key === 'element') {
                return '[Object Reference]';
            }
            // Converte oggetti Three.js in rappresentazioni semplici
            if (value && typeof value === 'object' && value.isObject3D) {
                return `[Object3D: ${value.type || 'Unknown'}]`;
            }
            if (value && typeof value === 'object' && value.isVector3) {
                return { x: value.x, y: value.y, z: value.z };
            }
            return value;
        }));
        
        window.debugLogger.log(message, safeData);
    } catch (error) {
        window.debugLogger.log(message + ' [Errore serializzazione]', String(data));
    }
}

/**
 * Testa il rilevamento del pulsante Termina Esercizio
 */
window.testButtonDetection = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo per testare il pulsante');
        return;
    }
    
    window.debugLogger.log('🎯 Test rilevamento pulsante Termina Esercizio');
    
    const userData = videoPanel.userData;
    const buttonPlane = userData.buttonRaycastPlane;
    
    window.debugLogger.log('🔍 Elementi per il pulsante:', {
        buttonRaycastPlane: !!buttonPlane,
        terminaBtn: !!userData.terminaBtn,
        buttonPosition: buttonPlane ? buttonPlane.position : 'N/A',
        buttonInScene: buttonPlane ? scene.children.includes(buttonPlane) : false,
        totalObjectsInScene: scene.children.length,
        buttonDisabled: userData.terminaBtn ? userData.terminaBtn.disabled : 'N/A',
        buttonVisible: userData.terminaBtn ? getComputedStyle(userData.terminaBtn).display !== 'none' : 'N/A'
    });
    
    if (buttonPlane) {
        // Test raycasting manuale verso il pulsante
        const direction = new THREE.Vector3();
        direction.subVectors(buttonPlane.position, camera.position).normalize();
        
        raycaster.set(camera.position, direction);
        const intersects = raycaster.intersectObject(buttonPlane);
        
        window.debugLogger.log('🎯 Test raycasting diretto al pulsante:', {
            intersects: intersects.length,
            buttonVisible: buttonPlane.visible,
            distance: intersects.length > 0 ? intersects[0].distance : 'N/A'
        });
        
        // Lista tutti gli oggetti nella scena con userData.type
        const typedObjects = scene.children.filter(obj => obj.userData && obj.userData.type);
        window.debugLogger.log('🗂️ Oggetti tipizzati nella scena:', typedObjects.map(obj => ({
            type: obj.userData.type,
            position: obj.position,
            visible: obj.visible
        })));
    }
};

/**
 * Test manuale del click sul pulsante Termina Esercizio
 */
window.testButtonClick = function() {
    if (!videoPanel || !videoPanel.userData || !videoPanel.userData.terminaBtn) {
        window.debugLogger.log('❌ Pulsante non disponibile per il test');
        return;
    }
    
    const terminaBtn = videoPanel.userData.terminaBtn;
    window.debugLogger.log('🧪 Test manuale click pulsante', {
        disabled: terminaBtn.disabled,
        visible: getComputedStyle(terminaBtn).display !== 'none',
        inDOM: document.contains(terminaBtn)
    });
    
    try {
        terminaBtn.click();
        window.debugLogger.log('✅ Click manuale eseguito');
    } catch (error) {
        window.debugLogger.log('❌ Errore nel click manuale', error.message);
    }
};

/**
 * Test specifico per modalità FPS - simula un click dal centro schermo
 */
window.testFPSClick = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Video non disponibile per test FPS');
        return;
    }
    
    window.debugLogger.log('🎯 TEST FPS - Simulazione click dal centro schermo');
    
    // Simula modalità FPS: raycaster dal centro (0,0)
    const mouse = { x: 0, y: 0 };
    raycaster.setFromCamera(mouse, camera);
    
    // Testa solo la scena principale (dove sono i piani raycasting)
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    window.debugLogger.log('🎯 TEST FPS - Intersects dal centro:', {
        totalIntersects: intersects.length,
        details: intersects.map((hit, index) => ({
            index: index,
            type: hit.object.userData?.type || 'no-type',
            distance: hit.distance,
            position: hit.point
        }))
    });
    
    // Cerca specificamente il pulsante
    const buttonHit = intersects.find(hit => 
        hit.object.userData && hit.object.userData.type === 'terminaEsercizioBtn'
    );
    
    if (buttonHit) {
        window.debugLogger.log('✅ TEST FPS - Pulsante trovato!', {
            distance: buttonHit.distance,
            point: buttonHit.point
        });
    } else {
        window.debugLogger.log('❌ TEST FPS - Pulsante NON trovato');
        
        // Test aggiuntivo: controlla se il piano del pulsante è visibile
        const buttonPlane = videoPanel.userData.buttonRaycastPlane;
        if (buttonPlane) {
            window.debugLogger.log('🔍 TEST FPS - Info piano pulsante:', {
                position: buttonPlane.position,
                rotation: buttonPlane.rotation,
                visible: buttonPlane.visible,
                inScene: scene.children.includes(buttonPlane),
                scale: buttonPlane.scale
            });
        }
    }
};

/**
 * Testa il click corretto sul pannello video
 */
window.testVideoClickDetection = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo per testare il click');
        return;
    }
    
    window.debugLogger.log('🎯 Test rilevamento click video');
    
    const userData = videoPanel.userData;
    window.debugLogger.log('Elementi per click:', {
        css3dObject: !!videoPanel,
        raycastPlane: !!userData.raycastPlane,
        scenaCSS3D: !!css3dScene,
        scenaPrincipale: !!scene
    });
    
    if (userData.raycastPlane) {
        window.debugLogger.log('Piano raycasting:', {
            position: {
                x: userData.raycastPlane.position.x,
                y: userData.raycastPlane.position.y,
                z: userData.raycastPlane.position.z
            },
            visible: userData.raycastPlane.visible,
            inScene: scene.children.includes(userData.raycastPlane),
            userData: userData.raycastPlane.userData
        });
    }
    
    // Mostra controlli temporaneamente
    if (userData.controlsOverlay) {
        userData.controlsOverlay.style.opacity = '1';
        setTimeout(() => {
            userData.controlsOverlay.style.opacity = '0';
        }, 5000);
    }
    
    window.debugLogger.log('✅ Test preparato');
    window.debugLogger.log('🎯 Clicca SUL pannello video nella scena per testare');
    window.debugLogger.log('❌ Clicca FUORI dal pannello - non dovrebbe funzionare');
};

/**
 * Testa tutti i controlli video avanzati
 */
window.testAdvancedVideoControls = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo per testare i controlli avanzati');
        return;
    }
    
    window.debugLogger.log('🎮 Test controlli video avanzati');
    
    const userData = videoPanel.userData;
    safeDebugLog('Controlli disponibili:', {
        playPause: !!userData.playPauseBtn,
        restart: !!userData.restartBtn,
        skipBack: !!userData.skipBackBtn,
        skipForward: !!userData.skipForwardBtn,
        volumeDown: !!userData.volumeDownBtn,
        volumeUp: !!userData.volumeUpBtn,
        raycastPlane: !!userData.raycastPlane
    });
    
    // Mostra controlli
    if (userData.controlsOverlay) {
        userData.controlsOverlay.style.opacity = '1';
        window.debugLogger.log('🎛️ Controlli mostrati - Prova tutti i pulsanti!');
        
        setTimeout(() => {
            userData.controlsOverlay.style.opacity = '0';
        }, 15000);
    }
    
    // Sequenza di test automatica
    let step = 0;
    const testSequence = [
        () => {
            window.debugLogger.log('🔊 Test: Volume su');
            adjustVolume(userData.iframe, 10, userData.statusIndicator);
        },
        () => {
            window.debugLogger.log('🔉 Test: Volume giù');
            adjustVolume(userData.iframe, -20, userData.statusIndicator);
        },
        () => {
            window.debugLogger.log('⏩ Test: Skip avanti 10 sec');
            skipVideo(userData.iframe, 10, userData.statusIndicator);
        },
        () => {
            window.debugLogger.log('⏪ Test: Skip indietro 10 sec');
            skipVideo(userData.iframe, -10, userData.statusIndicator);
        },
        () => {
            window.debugLogger.log('⏸️ Test: Pausa');
            toggleVideoPlayback(userData.iframe, userData.playPauseBtn, userData.statusIndicator);
        },
        () => {
            window.debugLogger.log('▶️ Test: Riprendi');
            toggleVideoPlayback(userData.iframe, userData.playPauseBtn, userData.statusIndicator);
        }
    ];
    
    function runNextTest() {
        if (step < testSequence.length) {
            testSequence[step]();
            step++;
            setTimeout(runNextTest, 2000);
        } else {
            window.debugLogger.log('✅ Sequenza test controlli completata!');
        }
    }
    
    // Inizia test automatico dopo 3 secondi
    setTimeout(runNextTest, 3000);
    
    window.debugLogger.log('🎯 CONTROLLI DISPONIBILI:');
    window.debugLogger.log('  ⏪ Skip indietro 10 sec');
    window.debugLogger.log('  ⏮️ Riavvia dall\'inizio');
    window.debugLogger.log('  ⏸️▶️ Play/Pausa');
    window.debugLogger.log('  ⏩ Skip avanti 10 sec');
    window.debugLogger.log('  🔉 Volume giù');
    window.debugLogger.log('  🔊 Volume su');
    window.debugLogger.log('✨ Test automatico inizia tra 3 secondi...');
};

/**
 * Test semplificato per controlli video (senza logging complesso)
 */
window.testVideoControlsSimple = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo');
        return;
    }
    
    window.debugLogger.log('🎮 Test controlli video semplice');
    
    const userData = videoPanel.userData;
    
    // Mostra controlli
    if (userData.controlsOverlay) {
        userData.controlsOverlay.style.opacity = '1';
        window.debugLogger.log('🎛️ Controlli mostrati');
        
        setTimeout(() => {
            userData.controlsOverlay.style.opacity = '0';
        }, 10000);
    }
    
    window.debugLogger.log('✅ Controlli attivi per 10 secondi');
    window.debugLogger.log('🎯 Prova tutti i pulsanti sul pannello video!');
};

/**
 * Test specifico per ogni singolo pulsante
 */
window.testIndividualButtons = function() {
    if (!videoPanel || !videoPanel.userData) {
        window.debugLogger.log('❌ Nessun video attivo');
        return;
    }
    
    window.debugLogger.log('🎛️ Test pulsanti individuali');
    
    const userData = videoPanel.userData;
    
    // Mostra controlli
    if (userData.controlsOverlay) {
        userData.controlsOverlay.style.opacity = '1';
    }
    
    // Test solo il pulsante play/pause
    const buttons = [
        { name: 'Play/Pause', btn: userData.playPauseBtn, delay: 1000 }
    ];
    
    buttons.forEach(({name, btn, delay}) => {
        setTimeout(() => {
            if (btn) {
                window.debugLogger.log(`🎯 Test: ${name}`);
                btn.style.transform = 'scale(1.2)';
                btn.style.filter = 'brightness(1.5)';
                
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                    btn.style.filter = 'brightness(1)';
                }, 300);
            } else {
                window.debugLogger.log(`❌ Pulsante ${name} non trovato`);
            }
        }, delay);
    });
    
    window.debugLogger.log('🎯 Test visuale pulsanti in corso...');
    window.debugLogger.log('💡 Clicca ogni pulsante per testare la funzionalità');
    
    // Nascondi controlli dopo il test
    setTimeout(() => {
        if (userData.controlsOverlay) {
            userData.controlsOverlay.style.opacity = '0';
        }
    }, 8000);
};

/**
 * Test specifico per la rotazione del pannello
 */
window.testVideoRotation = function() {
    if (!videoPanel) {
        window.debugLogger.log('❌ Nessun video attivo per test rotazione');
        return;
    }
    
    window.debugLogger.log('🔄 TEST ROTAZIONE PANNELLO VIDEO');
    
    const rotation = videoPanel.rotation;
    window.debugLogger.log('Rotazione attuale (radianti)', {
        x: rotation.x.toFixed(3),
        y: rotation.y.toFixed(3), 
        z: rotation.z.toFixed(3)
    });
    
    window.debugLogger.log('Rotazione attuale (gradi)', {
        x: (rotation.x * 180 / Math.PI).toFixed(1) + '°',
        y: (rotation.y * 180 / Math.PI).toFixed(1) + '°',
        z: (rotation.z * 180 / Math.PI).toFixed(1) + '°'
    });
    
    const expectedYRotation = 90; // 90° = rotazione verso sinistra (non specchiato)
    const actualYRotation = rotation.y * 180 / Math.PI;
    
    if (Math.abs(actualYRotation - expectedYRotation) < 1) {
        window.debugLogger.log('✅ Rotazione corretta: ' + actualYRotation.toFixed(1) + '° (atteso: 90°)');
        window.debugLogger.log('✅ Pannello NON specchiato');
    } else {
        window.debugLogger.log('❌ Rotazione errata: ' + actualYRotation.toFixed(1) + '° (atteso: 90°)');
    }
    
    // Verifica posizione
    const position = videoPanel.position;
    window.debugLogger.log('Posizione attuale', {
        x: position.x.toFixed(1),
        y: position.y.toFixed(1),
        z: position.z.toFixed(1)
    });
    
    if (position.x < 0) {
        window.debugLogger.log('✅ Pannello spostato verso sinistra (x=' + position.x.toFixed(1) + ')');
    } else {
        window.debugLogger.log('⚠️ Pannello non spostato verso sinistra');
    }
    
    // Verifica anche il raycast plane
    if (videoPanel.userData && videoPanel.userData.raycastPlane) {
        const raycastRotation = videoPanel.userData.raycastPlane.rotation;
        const raycastPosition = videoPanel.userData.raycastPlane.position;
        
        window.debugLogger.log('Raycast Plane rotazione', {
            x: (raycastRotation.x * 180 / Math.PI).toFixed(1) + '°',
            y: (raycastRotation.y * 180 / Math.PI).toFixed(1) + '°',
            z: (raycastRotation.z * 180 / Math.PI).toFixed(1) + '°'
        });
        
        window.debugLogger.log('Raycast Plane posizione', {
            x: raycastPosition.x.toFixed(1),
            y: raycastPosition.y.toFixed(1),
            z: raycastPosition.z.toFixed(1)
        });
        
        if (Math.abs(raycastRotation.y - rotation.y) < 0.01 && 
            Math.abs(raycastPosition.x - position.x) < 0.01) {
            window.debugLogger.log('✅ Raycast Plane sincronizzato con pannello CSS3D');
        } else {
            window.debugLogger.log('❌ Raycast Plane NON sincronizzato');
        }
    }
    
    window.debugLogger.log('💡 Il pannello dovrebbe ora essere ruotato di 90° (non specchiato) e spostato verso sinistra');
};

/**
 * Mostra un banner di errore video
 * @param {string} errorMessage - Messaggio di errore
 */
function showVideoErrorBanner(errorMessage) {
    const banner = document.createElement('div');
    banner.id = 'video-error-banner';
    banner.className = 'login-modal';
    
    banner.innerHTML = `
        <div class="login-modal-content">
            <div class="login-header">
                <h2>❌ Errore Video</h2>
                <p>${errorMessage}</p>
            </div>
            
            <button id="termina-simulazione-btn" class="login-button" style="background: linear-gradient(135deg, #dc3545, #c82333);">
                <span class="login-text">Termina</span>
                <span class="login-loading" style="display: none;">Terminando...</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Event listener per il pulsante Termina
    const terminaBtn = document.getElementById('termina-simulazione-btn');
    terminaBtn.addEventListener('click', () => {
        finishSimulation();
    });
}

/**
 * Termina la simulazione e mostra il banner di valutazione
 * Ora chiamata solo dal pulsante "Termina Esercizio"
 */
async function finishSimulation() {
    if (!currentUser || !currentSimulazione) {
        console.error('Dati utente o simulazione mancanti');
        return;
    }

    window.debugLogger.log('🏁 Simulazione terminata, avvio processo di valutazione');
    
    // Ferma il controllo periodico se attivo
    stopSimulationMonitoring();
    
    // Disabilita i controlli FPS per permettere l'interazione con il banner
    if (fpControls && fpControls.isLocked) {
        fpControls.unlock();
        window.debugLogger.log('🔓 Controlli FPS disabilitati per banner valutazione');
    }
    
    // Mostra il banner di valutazione
    // NOTA: setStudentSimulationFinished() ora è chiamato dal pulsante prima di questa funzione
    showRatingBanner();
}

/**
 * Imposta lo stato della simulazione dello studente a "finito"
 */
async function setStudentSimulationFinished() {
    // Controlla se l'utente è stato disconnesso
    if (isLoggedOut) {
        console.log('Terminazione simulazione bloccata - utente disconnesso');
        return;
    }
    
    const API_BASE_URL = 'http://localhost:80/api';
    
    try {
        window.debugLogger.log('Impostando stato studente a finito', { 
            studente: currentUser.id, 
            simulazione: currentSimulazione.id 
        });
        
        const response = await fetch(`${API_BASE_URL}/setStatoSimulazioneStudente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                idSimulazione: currentSimulazione.id,
                idStudente: currentUser.id,
                stato: 'finito'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        window.debugLogger.log('Stato studente aggiornato', result);
        
    } catch (error) {
        console.error('Errore nel settare stato finito:', error);
        window.debugLogger.log('Errore nel settare stato finito', error.message);
    }
}

/**
 * Avvia il monitoraggio periodico della simulazione
 */
function startSimulationMonitoring() {
    if (simulationMonitoringInterval) {
        clearInterval(simulationMonitoringInterval);
    }
    
    // Controlla se l'utente è stato disconnesso
    if (isLoggedOut) {
        console.log('Monitoraggio simulazione bloccato - utente disconnesso');
        return;
    }
    
    window.debugLogger.log('🔄 Avvio monitoraggio periodico simulazione');
    
    simulationMonitoringInterval = setInterval(async () => {
        // Controlla se l'utente è stato disconnesso prima di ogni verifica
        if (isLoggedOut) {
            console.log('Monitoraggio simulazione interrotto - utente disconnesso');
            stopSimulationMonitoring();
            return;
        }
        
        const isStillRunning = await verifySimulazioneInCorso();
        if (!isStillRunning) {
            window.debugLogger.log('❌ Simulazione non più attiva - terminazione forzata');
            finishSimulation();
        }
    }, 5000); // Controlla ogni 5 secondi
}

/**
 * Ferma il monitoraggio periodico della simulazione
 */
function stopSimulationMonitoring() {
    if (simulationMonitoringInterval) {
        clearInterval(simulationMonitoringInterval);
        simulationMonitoringInterval = null;
        window.debugLogger.log('⏹️ Monitoraggio simulazione fermato');
    }
}

/**
 * Verifica se la simulazione è ancora in corso
 * @returns {boolean} true se la simulazione è ancora attiva, false altrimenti
 */
async function verifySimulazioneInCorso() {
    // Controlla se l'utente è stato disconnesso
    if (isLoggedOut) {
        console.log('Verifica simulazione bloccata - utente disconnesso');
        return false;
    }
    
    if (!currentSimulazione) {
        return false;
    }
    
    const API_BASE_URL = 'http://localhost:80/api';
    
    try {
        const response = await fetch(`${API_BASE_URL}/verifySimulazioneInCorso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                idSimulazione: currentSimulazione.id
            })
        });

        if (!response.ok) {
            window.debugLogger.log('❌ Errore nella verifica simulazione', response.status);
            return false;
        }

        const isRunning = await response.json();
        window.debugLogger.log('✅ Verifica simulazione completata', isRunning);
        return isRunning;
        
    } catch (error) {
        console.error('Errore nella verifica simulazione:', error);
        window.debugLogger.log('❌ Errore verifica simulazione', error.message);
        return false;
    }
}

/**
 * Mostra il banner di valutazione con emoji
 */
function showRatingBanner() {
    // NON pulire il sistema video qui - sarà fatto quando si nasconde il banner
    
    const banner = document.createElement('div');
    banner.id = 'rating-banner';
    banner.className = 'login-modal';
    
    banner.innerHTML = `
        <div class="login-modal-content">
            <div class="login-header">
                <h2>🎬 Simulazione Completata!</h2>
                <p>Come valuti questa esperienza?</p>
            </div>
            
            <div class="rating-container" style="margin: 30px 0; text-align: center;">
                <p style="margin-bottom: 20px; font-weight: bold;">Clicca su una faccina per esprimere il tuo voto:</p>
                
                <div class="emoji-rating" style="display: flex; justify-content: center; gap: 30px; margin: 20px 0;">
                    <div class="emoji-option" data-rating="1" style="cursor: pointer; padding: 15px; border-radius: 10px; transition: all 0.3s ease;">
                        <div style="font-size: 60px; margin-bottom: 10px;">😢</div>
                        <div style="font-weight: bold; color: #e74c3c;">Non mi è piaciuto</div>
                    </div>
                    
                    <div class="emoji-option" data-rating="2" style="cursor: pointer; padding: 15px; border-radius: 10px; transition: all 0.3s ease;">
                        <div style="font-size: 60px; margin-bottom: 10px;">😐</div>
                        <div style="font-weight: bold; color: #f39c12;">Così così</div>
                    </div>
                    
                    <div class="emoji-option" data-rating="3" style="cursor: pointer; padding: 15px; border-radius: 10px; transition: all 0.3s ease;">
                        <div style="font-size: 60px; margin-bottom: 10px;">😊</div>
                        <div style="font-weight: bold; color: #27ae60;">Mi è piaciuto!</div>
                    </div>
                </div>
                
                <div id="selected-rating" style="margin: 20px 0; font-size: 18px; font-weight: bold; color: #3498db; display: none;">
                    Voto selezionato: <span id="rating-text"></span>
                </div>
            </div>
            
            <div class="rating-buttons" style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirm-rating-btn" class="login-button" disabled style="opacity: 0.5;">
                    <span class="login-text">Conferma Voto</span>
                    <span class="login-loading" style="display: none;">Invio in corso...</span>
                </button>
                
                <button id="skip-rating-btn" class="login-button" style="background: #95a5a6;">
                    Salta Valutazione
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    window.debugLogger.log('🌟 Banner valutazione mostrato');
    
    let selectedRating = null;
    
    // Event listeners per le emoji
    const emojiOptions = document.querySelectorAll('.emoji-option');
    emojiOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Rimuovi selezione precedente
            emojiOptions.forEach(opt => {
                opt.style.background = 'transparent';
                opt.style.transform = 'scale(1)';
            });
            
            // Seleziona l'opzione corrente
            option.style.background = 'rgba(52, 152, 219, 0.2)';
            option.style.transform = 'scale(1.1)';
            
            selectedRating = parseInt(option.dataset.rating);
            
            // Mostra il voto selezionato
            const ratingTexts = {
                1: '😢 Non mi è piaciuto',
                2: '😐 Così così',
                3: '😊 Mi è piaciuto!'
            };
            
            document.getElementById('selected-rating').style.display = 'block';
            document.getElementById('rating-text').textContent = ratingTexts[selectedRating];
            
            // Abilita il pulsante conferma
            const confirmBtn = document.getElementById('confirm-rating-btn');
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            
            window.debugLogger.log('⭐ Voto selezionato', selectedRating);
        });
        
        // Hover effects
        option.addEventListener('mouseenter', () => {
            if (!option.style.background.includes('rgba(52, 152, 219')) {
                option.style.background = 'rgba(255, 255, 255, 0.1)';
                option.style.transform = 'scale(1.05)';
            }
        });
        
        option.addEventListener('mouseleave', () => {
            if (!option.style.background.includes('rgba(52, 152, 219')) {
                option.style.background = 'transparent';
                option.style.transform = 'scale(1)';
            }
        });
    });
    
    // Event listener per conferma voto
    document.getElementById('confirm-rating-btn').addEventListener('click', () => {
        window.debugLogger.log('🔘 Pulsante Conferma Voto cliccato', selectedRating);
        if (selectedRating) {
            window.debugLogger.log('✅ Voto presente, chiamata submitRating');
            submitRating(selectedRating);
        } else {
            window.debugLogger.log('❌ Nessun voto selezionato');
            alert('Seleziona prima una faccina per esprimere il tuo voto!');
        }
    });
    
    // Event listener per saltare valutazione
    document.getElementById('skip-rating-btn').addEventListener('click', () => {
        window.debugLogger.log('⏭️ Valutazione saltata dall\'utente');
        hideRatingBanner();
        returnToMainPage();
    });
}

/**
 * Invia il voto al backend
 * @param {number} rating - Il voto da 1 a 3
 */
async function submitRating(rating) {
    // Controlla se l'utente è stato disconnesso
    if (isLoggedOut) {
        console.log('Invio valutazione bloccato - utente disconnesso');
        return;
    }
    
    window.debugLogger.log('🚀 submitRating chiamata con voto:', rating);
    
    if (!currentUser || !currentSimulazione) {
        console.error('Dati utente o simulazione mancanti per la valutazione');
        window.debugLogger.log('❌ Dati mancanti:', { currentUser, currentSimulazione });
        return;
    }
    
    const API_BASE_URL = 'http://localhost:80/api';
    const confirmBtn = document.getElementById('confirm-rating-btn');
    
    if (!confirmBtn) {
        window.debugLogger.log('❌ Pulsante conferma non trovato nel DOM');
        return;
    }
    
    try {
        // Mostra loading
        confirmBtn.disabled = true;
        
        const loginText = document.querySelector('#confirm-rating-btn .login-text');
        const loginLoading = document.querySelector('#confirm-rating-btn .login-loading');
        
        if (loginText) loginText.style.display = 'none';
        if (loginLoading) loginLoading.style.display = 'inline';
        
        window.debugLogger.log('📤 Invio valutazione', { 
            studente: currentUser.id, 
            simulazione: currentSimulazione.id,
            voto: rating
        });
        
        const response = await fetch(`${API_BASE_URL}/setVotoSimulazioneStudente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                idStudente: currentUser.id,
                idSimulazione: currentSimulazione.id,
                voto: rating
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const success = await response.json();
        window.debugLogger.log('📬 Risposta valutazione', success);

        if (success === true) {
            window.debugLogger.log('✅ Valutazione inviata con successo');
            hideRatingBanner();
            
            // Mostra messaggio di successo
            alert('Grazie per la tua valutazione! 🌟');
            returnToMainPage();
        } else {
            throw new Error('Il server ha restituito false');
        }
        
    } catch (error) {
        console.error('Errore nell\'invio della valutazione:', error);
        window.debugLogger.log('❌ Errore invio valutazione', error.message);
        
        // Mostra errore e torna alla pagina principale
        alert(`Errore nell'invio della valutazione: ${error.message}\nVerrai riportato alla pagina principale.`);
        hideRatingBanner();
        returnToMainPage();
        
    } finally {
        // Nasconde loading se il banner è ancora visibile
        if (document.getElementById('confirm-rating-btn')) {
            confirmBtn.disabled = false;
            document.querySelector('#confirm-rating-btn .login-text').style.display = 'inline';
            document.querySelector('#confirm-rating-btn .login-loading').style.display = 'none';
        }
    }
}

/**
 * Nasconde il banner di valutazione
 */
function hideRatingBanner() {
    const banner = document.getElementById('rating-banner');
    if (banner) {
        banner.remove();
        window.debugLogger.log('🗑️ Banner valutazione rimosso');
    }
    
    // Pulisci il sistema video quando si nasconde il banner
    cleanupVideoSystem();
}

/**
 * Torna alla pagina principale (localhost:8000)
 */
function returnToMainPage() {
    window.debugLogger.log('🏠 Reindirizzamento a localhost:8000');
    
    // Reset delle variabili globali
    currentSimulazione = null;
    currentUser = null;
    youtubePlayer = null;
    videoPlayerReady = false;
    
    // Ferma il monitoraggio se attivo
    stopSimulationMonitoring();
    
    // Riabilita i controlli FPS se erano disabilitati
    if (fpControls && !fpControls.isLocked) {
        fpControls.lock();
        window.debugLogger.log('🔒 Controlli FPS riabilitati per tornare alla pagina principale');
    }
    
    // Reindirizza a localhost:8000 per ripartire da capo
    window.location.href = 'http://localhost:8000';
}

/**
 * Gestisce il ritorno dalla pagina di simulazione
 * Controlla se ci sono nuove attività disponibili
 */
async function handleReturnFromSimulation() {
    const user = getUserFromSession();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Controlla se ci sono simulazioni in corso
    await checkSimulazioneInCorso(user);
}

/**
 * Pulisce il sistema video
 */
function cleanupVideoSystem() {
    // Ferma il monitoraggio della simulazione
    stopSimulationMonitoring();
    
    // Rimuovi il pannello video dalla scena CSS3D
    if (videoPanel) {
        css3dScene.remove(videoPanel);
        videoPanel = null;
    }
    
    // Ferma e rimuovi il player YouTube
    if (youtubePlayer) {
        youtubePlayer.destroy();
        youtubePlayer = null;
        videoPlayerReady = false;
    }
    
    // Rimuovi elementi DOM (canvas non più necessario con CSS3DRenderer)
    
    const playerDiv = document.getElementById('youtube-player');
    if (playerDiv) playerDiv.remove();
    
    const errorBanner = document.getElementById('video-error-banner');
    if (errorBanner) errorBanner.remove();
    
    // Reset variabili
    currentSimulazione = null;
    
    window.debugLogger.log('Sistema video pulito');
}

/**
 * Gestisce il login riuscito
 * @param {Object} user - Dati dell'utente
 */
function handleLoginSuccess(user) {
    console.log('Utente loggato:', user);
    
    // Reset del flag di logout
    isLoggedOut = false;
    
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
    
    // Mostra il banner di attesa per la simulazione
    showWaitingBanner(user);
}

/**
 * Gestisce il logout
 */
/**
 * Ferma tutti i timer attivi e blocca le chiamate API
 */
function stopAllTimers() {
    console.log('Fermando tutti i timer attivi...');
    window.debugLogger.log('Fermando tutti i timer attivi');
    
    // Ferma tutti i timer registrati
    activeTimers.forEach(timerId => {
        clearTimeout(timerId);
    });
    activeTimers = [];
    
    // Ferma il monitoraggio della simulazione
    stopSimulationMonitoring();
    
    // Imposta il flag di logout
    isLoggedOut = true;
}

/**
 * Crea un timer sicuro che rispetta il flag di logout
 * @param {Function} callback - Funzione da eseguire
 * @param {number} delay - Ritardo in millisecondi
 * @returns {number} ID del timer
 */
function createSafeTimer(callback, delay) {
    if (isLoggedOut) {
        console.log('Timer bloccato - utente non loggato');
        return null;
    }
    
    const timerId = setTimeout(() => {
        if (!isLoggedOut) {
            callback();
        }
    }, delay);
    
    activeTimers.push(timerId);
    return timerId;
}

function handleLogout() {
    console.log('Logout effettuato');
    window.debugLogger.log('Logout effettuato dall\'utente');
    
    // Ferma tutti i timer e blocca le chiamate API
    stopAllTimers();
    
    // Nascondi tutti i banner attivi
    hideWaitingBanner();
    hideStartSimulazioneBanner();
    
    // Pulisci il sistema video se attivo
    cleanupVideoSystem();
    
    // Cancella la sessione utente
    clearUserSession();
    
    // Aggiorna l'interfaccia utente
    const userInfo = document.getElementById('user-info');
    const logoutButton = document.getElementById('logout-button');
    
    if (userInfo) userInfo.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'none';
    
    // Disabilita funzionalità specifiche
    disableUserFeatures();
    isUserLoggedIn = false; // Imposta l'utente come non loggato
    createStaticLoginModal(); // Ristabilisce la modale di login
}

/**
 * Gestisce la ricarica della simulazione dal banner di simulazione pronta
 * @param {Object} user - Dati dell'utente
 */
function handleReloadSimulazione(user) {
    console.log('Ricarica simulazione richiesta');
    window.debugLogger.log('Ricarica simulazione richiesta per utente', user.nome);
    
    // Nascondi il banner di simulazione pronta
    hideStartSimulazioneBanner();
    
    // Mostra di nuovo il banner di attesa
    showWaitingBanner(user);
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
                    <p><small>Nota: Usa username e password del database studenti reale</small></p>
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
 * Crea un overlay video semplice per test (senza CSS3D)
 * @param {string} videoUrl - URL del video YouTube
 */
function createSimpleVideoOverlay(videoUrl) {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
        window.debugLogger.log('URL YouTube non valido', videoUrl);
        return;
    }

    // Rimuovi overlay esistente
    const existingOverlay = document.getElementById('simple-video-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Crea overlay semplice
    const overlay = document.createElement('div');
    overlay.id = 'simple-video-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: rgba(0,0,0,0.9);
        padding: 20px;
        border-radius: 10px;
        border: 3px solid #ff6b35;
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
    `;

    // Crea elemento player
    const playerDiv = document.createElement('div');
    playerDiv.id = 'simple-youtube-player';
    playerDiv.style.width = '800px';
    playerDiv.style.height = '450px';
    playerDiv.style.backgroundColor = '#000';

    // Pulsante chiudi
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌ Chiudi';
    closeBtn.style.cssText = `
        position: absolute;
        top: -10px;
        right: -10px;
        background: #ff6b35;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 50%;
        cursor: pointer;
    `;
    closeBtn.onclick = () => {
        overlay.remove();
        if (window.simpleYoutubePlayer) {
            window.simpleYoutubePlayer.destroy();
            window.simpleYoutubePlayer = null;
        }
    };

    overlay.appendChild(closeBtn);
    overlay.appendChild(playerDiv);
    document.body.appendChild(overlay);

    window.debugLogger.log('🧪 Overlay video semplice creato per test');

    // Inizializza player YouTube semplice
    setTimeout(() => {
        try {
            window.simpleYoutubePlayer = new YT.Player('simple-youtube-player', {
                height: '450',
                width: '800',
                videoId: videoId,
                playerVars: {
                    'autoplay': 1,
                    'controls': 1,
                    'rel': 0
                },
                events: {
                    'onReady': (event) => {
                        window.debugLogger.log('🎉 Player semplice pronto!');
                        event.target.playVideo();
                    },
                    'onStateChange': (event) => {
                        window.debugLogger.log('📺 Stato player semplice:', event.data);
                    },
                    'onError': (event) => {
                        window.debugLogger.log('❌ Errore player semplice:', event.data);
                    }
                }
            });
        } catch (error) {
            window.debugLogger.log('❌ Errore creazione player semplice:', error.message);
        }
    }, 100);
}

// Esponi la funzione per test manuali
window.createSimpleVideoOverlay = createSimpleVideoOverlay;

/**
 * Funzione principale di inizializzazione
 */
function init() {
    console.log('Inizializzazione della simulazione educativa VR...');
    
    // Reset del flag di logout all'avvio
    isLoggedOut = false;
    
    // Inizializza la scena Three.js
    initScene();
    
    // Configura l'illuminazione
    setupLighting();
    
    // Carica i modelli
    loadClassroom();
    
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
        // Imposta l'utente come loggato senza mostrare la modale
        isUserLoggedIn = true;
        
        // Aggiorna l'interfaccia utente
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const logoutButton = document.getElementById('logout-button');
        
        if (userInfo && userName && userRole) {
            userName.textContent = savedUser.name;
            userRole.textContent = savedUser.role;
            userInfo.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'block';
        }
        
        // Abilita funzionalità in base al ruolo
        enableUserFeatures(savedUser);
        
        // Controlla se si sta tornando da una simulazione
        const urlParams = new URLSearchParams(window.location.search);
        const fromSimulation = urlParams.get('fromSimulation');
        
        if (fromSimulation === 'true') {
            // Si sta tornando da una simulazione, controlla nuove attività
            handleReturnFromSimulation();
        } else {
            // Mostra il banner di attesa per la simulazione
            showWaitingBanner(savedUser);
        }
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