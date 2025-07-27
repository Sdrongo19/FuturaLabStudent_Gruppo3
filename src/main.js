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
        
        // Controlla se è il pannello video
        if (clickedObject.userData && clickedObject.userData.type === 'videoPanel') {
            window.debugLogger.log('Click su pannello video CSS3D');
            handleVideoInteractionCSS3D(clickedObject);
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
    
    // Cambia il cursore se stiamo hovering su oggetti interattivi
    let isHoveringInteractive = false;
    
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        
        // Controlla se stiamo hovering sul pannello video
        if (hoveredObject.userData && hoveredObject.userData.type === 'videoPanel') {
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
        </div>
    `;
    
    document.body.appendChild(banner);
    window.debugLogger.log('Banner di attesa mostrato per utente', user.nome);
    
    // Dopo 3 secondi, controlla se la simulazione è stata avviata
    setTimeout(() => {
        checkSimulazioneInCorso(user);
    }, 3000);
}

/**
 * Controlla se c'è una simulazione in corso per la classe dell'utente
 * @param {Object} user - Dati dell'utente
 */
async function checkSimulazioneInCorso(user) {
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
            setTimeout(() => {
                checkSimulazioneInCorso(user);
            }, 5000);
        }
    } catch (error) {
        window.debugLogger.log('Errore nel controllo simulazione', error.message);
        console.error('Errore nel controllo simulazione:', error);
        
        // In caso di errore, riprova dopo 10 secondi
        setTimeout(() => {
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
        </div>
    `;
    
    document.body.appendChild(banner);
    window.debugLogger.log('Banner avvio simulazione mostrato', simulazione);
    
    // Event listener per il pulsante Avvia
    const avviaBtn = document.getElementById('avvia-simulazione-btn');
    avviaBtn.addEventListener('click', () => {
        avviaSimulazione(user, simulazione);
    });
}

/**
 * Avvia la simulazione per lo studente
 * @param {Object} user - Dati dell'utente
 * @param {Object} simulazione - Dati della simulazione
 */
async function avviaSimulazione(user, simulazione) {
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
            
            // Gestisci in base al tipo di simulazione
            if (simulazione.tipoSimulazione === 1) {
                // È un video - avvia il sistema video
                window.debugLogger.log('Avvio sistema video', simulazione.macrocategoria.video);
                createVideoPanel(simulazione.macrocategoria.video);
            } else {
                // È una simulazione normale - logic da implementare in futuro
                window.debugLogger.log('Simulazione normale - da implementare');
                alert(`Simulazione normale avviata! Buon lavoro, ${user.nome}!`);
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
        // Pulisci elementi precedenti
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
        height: 450px;
        background: #000;
        border: 3px solid #ff6b35;
        border-radius: 10px;
        padding: 5px;
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        overflow: hidden;
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
    
    // URL dell'iframe con parametri per ridurre errori cross-origin
    const embedUrl = `https://www.youtube.com/embed/${videoId}?` + new URLSearchParams({
        autoplay: 1,
        controls: 1,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        fs: 1,
        enablejsapi: 0, // Disabilita JS API per ridurre errori cross-origin
        origin: window.location.origin,
        allow: 'autoplay; encrypted-media',
        mute: 0
    });
    
    iframe.src = embedUrl;
    iframe.allow = 'autoplay; encrypted-media; fullscreen';
    iframe.allowfullscreen = true;
    
    // Aggiungi un overlay per gestire i click
    const clickOverlay = document.createElement('div');
    clickOverlay.id = 'video-click-overlay';
    clickOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        z-index: 10;
        cursor: pointer;
        display: none;
    `;
    
    clickOverlay.addEventListener('click', () => {
        window.debugLogger.log('🎮 Click su video overlay');
        showVideoStatusMessage('Click rilevato sul video');
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
    
    // Assembla il contenitore
    containerDiv.appendChild(loadingMsg);
    containerDiv.appendChild(iframe);
    containerDiv.appendChild(clickOverlay);
    
    // Crea l'oggetto CSS3D
    const css3dObject = new THREE.CSS3DObject(containerDiv);
    
    // Posiziona il pannello in modo ottimale
    css3dObject.position.set(0, 15, -8);
    css3dObject.rotation.y = 0;
    css3dObject.scale.set(0.025, 0.025, 0.025);
    
    // Salva il riferimento
    videoPanel = css3dObject;
    videoPanel.userData = { 
        type: 'videoPanel', 
        videoId: videoId,
        iframe: iframe,
        container: containerDiv,
        clickOverlay: clickOverlay
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
        
        // Abilita overlay per click dopo il caricamento
        setTimeout(() => {
            clickOverlay.style.display = 'block';
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
        iframeSrc: videoObject.userData.iframe.src
    });
    
    // Mostra informazioni sul video
    showVideoStatusMessage('Video YouTube attivo - Usa i controlli del player');
    
    // Attiva temporaneamente l'overlay click se disponibile
    if (videoObject.userData.clickOverlay) {
        const overlay = videoObject.userData.clickOverlay;
        overlay.style.background = 'rgba(255,107,53,0.1)';
        overlay.style.display = 'block';
        
        setTimeout(() => {
            overlay.style.background = 'transparent';
        }, 500);
    }
    
    // Focus sull'iframe per permettere l'interazione diretta
    if (videoObject.userData.iframe) {
        try {
            videoObject.userData.iframe.focus();
            window.debugLogger.log('✅ Focus impostato su iframe YouTube');
        } catch (e) {
            window.debugLogger.log('⚠️ Impossibile impostare focus su iframe');
        }
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
            finishSimulation();
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
 * Funzione globale per testare il sistema video CSS3D con YouTube
 * @param {string} videoUrl - URL del video da testare (opzionale)
 */
window.testNewVideoSystem = function(videoUrl = 'https://www.youtube.com/watch?v=WIRoDrrGPx4') {
    window.debugLogger.log('🧪 Test sistema video CSS3D con YouTube', videoUrl);
    
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
    
    // Debug dopo 3 secondi per permettere il caricamento dell'iframe
    setTimeout(() => {
        debugVideoSystem();
        window.debugLogger.log('✅ Se vedi il video YouTube nel pannello 3D, il sistema funziona!');
        window.debugLogger.log('💡 Usa i controlli del player YouTube per play/pause/volume');
    }, 3000);
    
    window.debugLogger.log('✅ Test sistema video CSS3D avviato - attendi il caricamento...');
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
 * Termina la simulazione settando lo stato a "finito"
 */
async function finishSimulation() {
    if (!currentUser || !currentSimulazione) {
        console.error('Dati utente o simulazione mancanti');
        return;
    }

    const API_BASE_URL = 'http://localhost:80/api';
    
    try {
        window.debugLogger.log('Terminando simulazione', { 
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
        window.debugLogger.log('Simulazione terminata', result);

        // Pulisci tutto
        cleanupVideoSystem();
        
        // Mostra messaggio di completamento
        alert('Simulazione completata con successo!');
        
    } catch (error) {
        console.error('Errore nel terminare la simulazione:', error);
        window.debugLogger.log('Errore nel terminare la simulazione', error.message);
        alert('Errore nel completare la simulazione');
    }
}

/**
 * Pulisce il sistema video
 */
function cleanupVideoSystem() {
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
        
        // Mostra il banner di attesa per la simulazione
        showWaitingBanner(savedUser);
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