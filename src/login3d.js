/**
 * Sistema di Login 3D con tastiera virtuale
 * Gestisce l'interfaccia di login all'interno della scena 3D
 */

class Login3D {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Pulisci qualsiasi stato precedente
        this.cleanupPreviousState();
        
        // Stato del login
        this.isLoginVisible = false;
        this.currentUser = null;
        this.activeField = 'email'; // 'email' o 'password'
        this.emailText = '';
        this.passwordText = '';
        this.isLoading = false;
        
        // Gruppi 3D
        this.loginGroup = new THREE.Group();
        this.keyboardGroup = new THREE.Group();
        this.formGroup = new THREE.Group();
        
        // Materiali più visibili e contrastanti
        this.materials = {
            panel: new THREE.MeshLambertMaterial({ 
                color: 0x333333, // Sfondo scuro per maggior contrasto
                transparent: true,
                opacity: 0.95
            }),
            button: new THREE.MeshLambertMaterial({ 
                color: 0xFF8C00, // Arancione per i pulsanti
                transparent: true,
                opacity: 0.95
            }),
            buttonHover: new THREE.MeshLambertMaterial({ 
                color: 0xFFA500, // Arancione più chiaro per hover
                transparent: true,
                opacity: 0.95
            }),
            key: new THREE.MeshLambertMaterial({ 
                color: 0x444444, // Tasti scuri
                transparent: true,
                opacity: 0.95
            }),
            keyHover: new THREE.MeshLambertMaterial({ 
                color: 0x666666, // Tasti hover più chiari
                transparent: true,
                opacity: 0.95
            }),
            keyPressed: new THREE.MeshLambertMaterial({ 
                color: 0xFF8C00, // Arancione quando premuto
                transparent: true,
                opacity: 0.95
            }),
            text: new THREE.MeshLambertMaterial({ 
                color: 0xFFFFFF, // Testo bianco per massimo contrasto
                transparent: false,
                opacity: 1.0
            }),
            fieldActive: new THREE.MeshLambertMaterial({ 
                color: 0xFF8C00, // Campo attivo arancione
                transparent: true,
                opacity: 0.9
            }),
            fieldInactive: new THREE.MeshLambertMaterial({ 
                color: 0x444444, // Campo inattivo scuro
                transparent: true,
                opacity: 0.9
            })
        };
        
        // Layout tastiera
        this.keyboardLayout = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '@'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', 'BACK'],
            ['SPACE', 'SWITCH', 'LOGIN']
        ];
        
        this.keys = [];
        this.textMeshes = {};
        
        this.initializeLogin();
    }

    /**
     * Pulisce lo stato precedente per evitare valori residui
     */
    cleanupPreviousState() {
        // Pulisci variabili globali che potrebbero essere rimaste
        if (window.login3D) {
            window.login3D = null;
        }
        
        // Forza la pulizia della memoria
        if (typeof window.gc === 'function') {
            window.gc();
        }
        
        window.debugLogger.log('Stato precedente pulito');
    }

    /**
     * Inizializza il sistema di login 3D
     */
    initializeLogin() {
        // Posiziona il login in posizione elegante e ben visibile
        this.loginGroup.position.set(-3, 15, 6);
        this.loginGroup.rotation.x = 0;
        this.loginGroup.rotation.y = Math.PI/2;
        this.loginGroup.scale.set(1.2, 1.2, 1.2); // Leggermente più grande ma elegante
        this.scene.add(this.loginGroup);
        
        this.createLoginForm();
        this.createVirtualKeyboard();
        this.addLoginLighting();
        this.hideLogin();
    }

    /**
     * Aggiunge illuminazione specifica per il form di login
     */
    addLoginLighting() {
        // Luce direzionale per il form
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(0, 20, 10);
        directionalLight.target.position.set(0, 15, -10);
        this.loginGroup.add(directionalLight);
        this.loginGroup.add(directionalLight.target);
        
        // Luce ambientale per il form
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.loginGroup.add(ambientLight);
        
        // Luce puntiforme per maggiore illuminazione
        const pointLight = new THREE.PointLight(0xffffff, 1, 50);
        pointLight.position.set(0, 20, 0);
        this.loginGroup.add(pointLight);
    }

    /**
     * Crea il form di login 3D elegante e moderno
     */
    createLoginForm() {
        // Pannello principale elegante con sfondo scuro moderno
        const panelGeometry = new THREE.PlaneGeometry(12, 8);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2C3E50, // Blu scuro elegante
            transparent: false,
            opacity: 1.0
        });
        const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
        panelMesh.position.set(0, 0, 0.0); // Sfondo principale
        
        // Bordo del pannello arancione elegante
        const borderGeometry = new THREE.PlaneGeometry(12.3, 8.3);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE67E22, // Arancione elegante
            transparent: false,
            opacity: 1.0
        });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.05); // Dietro al pannello principale
        
        this.formGroup.add(borderMesh);
        this.formGroup.add(panelMesh);
        
        // Titolo elegante
        this.createText('FuturaLab Login', 0, 3, 1.0, 0xFFFFFF, 'titleText');
        
        // Campo Email
        this.createInputField('email', 'Email', 0, 1.5, 9, 1.0);
        
        // Campo Password
        this.createInputField('password', 'Password', 0, 0, 9, 1.0);
        
        // Pulsante Login
        this.createButton('loginBtn', 'ACCEDI', 0, -1.5, 4, 1.0, this.materials.button);
        
        // Messaggio di stato
        this.createText('', 0, -2.5, 0.6, 0xE74C3C, 'statusMessage');
        
        this.loginGroup.add(this.formGroup);
    }

    /**
     * Crea un campo di input 3D elegante e moderno
     */
    createInputField(id, label, x, y, width, height) {
        const fieldGroup = new THREE.Group();
        
        // Sfondo del campo elegante
        const fieldGeometry = new THREE.PlaneGeometry(width, height);
        const fieldMaterial = new THREE.MeshLambertMaterial({
            color: id === 'email' ? 0x3498DB : 0x34495E, // Blu per email, grigio scuro per password
            transparent: false,
            opacity: 1.0
        });
        
        const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
        fieldMesh.userData = { type: 'inputField', id: id };
        fieldGroup.add(fieldMesh);
        
        // Bordo del campo arancione elegante
        const borderGeometry = new THREE.PlaneGeometry(width + 0.2, height + 0.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE67E22, // Arancione elegante
            transparent: false,
            opacity: 1.0
        });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.05); // Dietro al campo
        fieldGroup.add(borderMesh);
        
        // Etichetta elegante - posizione relativa al fieldGroup
        const labelText = this.createText(label, 0, 0, 0.6, 0xFFFFFF, `${id}Label`, false);
        if (labelText) {
            labelText.position.set(-width/2 + 1.5, height/2 + 0.6, 0.3);
            fieldGroup.add(labelText);
        }
        
        // Testo del campo - posizione relativa al fieldGroup
        const textGroup = new THREE.Group();
        const fieldText = this.createText('', 0, 0, 0.7, 0xFFFFFF, `${id}Text`, false);
        if (fieldText) {
            // Posiziona il testo al centro del campo
            fieldText.position.set(0, 0, 0.3);
            textGroup.position.set(-width/2 + 2, 0, 0);
            textGroup.add(fieldText);
            fieldGroup.add(textGroup);
        }
        
        fieldGroup.position.set(x, y, 0.1); // Più avanti per evitare z-fighting
        this.formGroup.add(fieldGroup);
        
        // Salva il riferimento al campo
        this.textMeshes[`${id}Field`] = fieldMesh;
    }

    /**
     * Crea un pulsante 3D elegante
     */
    createButton(id, text, x, y, width, height, material) {
        const buttonGroup = new THREE.Group();
        
        // Geometria del pulsante arancione elegante
        const buttonGeometry = new THREE.BoxGeometry(width, height, 0.3);
        const buttonMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE67E22, // Arancione elegante
            transparent: false,
            opacity: 1.0
        });
        
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.userData = { type: 'button', id: id };
        buttonGroup.add(buttonMesh);
        
        // Bordo del pulsante scuro elegante
        const borderGeometry = new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.25);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2C3E50, // Bordo blu scuro
            transparent: false,
            opacity: 1.0
        });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.05);
        buttonGroup.add(borderMesh);
        
        // Testo del pulsante bianco su sfondo arancione
        this.createText(text, 0, 0, 0.6, 0xFFFFFF, `${id}Text`);
        
        buttonGroup.position.set(x, y, 0.2); // Più avanti per evitare z-fighting
        this.formGroup.add(buttonGroup);
        
        return buttonMesh;
    }

    /**
     * Crea la tastiera virtuale 3D
     */
    createVirtualKeyboard() {
        const keySize = 0.8; // Tasti più piccoli
        const keySpacing = 1.0; // Spaziatura ridotta
        const startY = -4.5; // Posizione più bassa
        
        this.keyboardLayout.forEach((row, rowIndex) => {
            const rowY = startY - (rowIndex * keySpacing);
            const rowWidth = row.length * keySpacing;
            const startX = -rowWidth / 2;
            
            row.forEach((key, keyIndex) => {
                const keyX = startX + (keyIndex * keySpacing) + keySpacing/2;
                this.createKey(key, keyX, rowY, keySize);
            });
        });
        
        this.loginGroup.add(this.keyboardGroup);
    }

    /**
     * Crea un singolo tasto della tastiera
     */
    createKey(keyValue, x, y, size) {
        const keyGroup = new THREE.Group();
        
        // Geometria del tasto più piccola
        let keyWidth = size;
        if (keyValue === 'SPACE') keyWidth = size * 3;
        if (keyValue === 'BACK') keyWidth = size * 1.5;
        if (keyValue === 'SWITCH') keyWidth = size * 1.3;
        if (keyValue === 'LOGIN') keyWidth = size * 1.3;
        
        const keyGeometry = new THREE.BoxGeometry(keyWidth, size, 0.2);
        const keyMaterial = this.materials.key.clone();
        keyMaterial.transparent = true;
        keyMaterial.opacity = 0.95;
        
        const keyMesh = new THREE.Mesh(keyGeometry, keyMaterial);
        keyMesh.userData = { type: 'key', value: keyValue };
        keyGroup.add(keyMesh);
        
        // Aggiungi un'area di click invisibile più grande per catturare meglio i click
        const clickAreaGeometry = new THREE.BoxGeometry(keyWidth + 0.2, size + 0.2, 0.3);
        const clickAreaMaterial = new THREE.MeshBasicMaterial({ 
            transparent: true, 
            opacity: 0,
            visible: false 
        });
        const clickAreaMesh = new THREE.Mesh(clickAreaGeometry, clickAreaMaterial);
        clickAreaMesh.userData = { type: 'key', value: keyValue };
        clickAreaMesh.position.set(0, 0, 0.1);
        keyGroup.add(clickAreaMesh);
        
        // Bordo del tasto più sottile
        const borderGeometry = new THREE.BoxGeometry(keyWidth + 0.05, size + 0.05, 0.15);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF8C00,
            transparent: true,
            opacity: 0.95
        });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.05);
        keyGroup.add(borderMesh);
        
        // Testo del tasto più grande e con sfondo per contrasto
        let displayText = keyValue;
        if (keyValue === 'SPACE') displayText = 'SPAZIO';
        if (keyValue === 'BACK') displayText = '⌫';
        if (keyValue === 'SWITCH') displayText = 'CAMPO';
        
        // Aggiungi uno sfondo al testo per maggiore contrasto
        const textBgGeometry = new THREE.PlaneGeometry(keyWidth - 0.1, size - 0.1);
        const textBgMaterial = new THREE.MeshLambertMaterial({
            color: 0x222222,
            transparent: true,
            opacity: 0.8
        });
        const textBgMesh = new THREE.Mesh(textBgGeometry, textBgMaterial);
        textBgMesh.position.set(0, 0, 0.11);
        keyGroup.add(textBgMesh);
        
        // Testo più grande e bianco - creiamo direttamente invece di usare createText
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = size * 30;
        canvas.width = Math.max(displayText.length * fontSize * 0.7, fontSize * 2);
        canvas.height = fontSize * 1.5;
        
        // Sfondo trasparente
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Stile del testo
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#FFFFFF';
        context.fillText(displayText, canvas.width / 2, canvas.height / 2);
        
        // Crea texture e materiale
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const textMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0
        });
        
        // Crea geometria e mesh
        const textGeometry = new THREE.PlaneGeometry(size * 0.8, size * 0.6);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 0, 0.12);
        
        // Rendi il testo trasparente ai raycast ma mantieni i dati del tasto padre
        textMesh.userData = { type: 'key', value: keyValue };
        textMesh.raycast = function() {}; // Disabilita il raycast per il testo
        
        keyGroup.add(textMesh);
        
        keyGroup.position.set(x, y, 0.15);
        this.keyboardGroup.add(keyGroup);
        
        this.keys.push(keyMesh);
    }

    /**
     * Crea testo 3D elegante e ben leggibile
     */
    createText(text, x, y, size, color, id = null, addToGroup = true) {
        // Crea un canvas per il testo con dimensioni appropriate
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Dimensioni proporzionate
        const fontSize = Math.max(32, size * 50);
        canvas.width = Math.max((text || '').length * fontSize * 0.7, fontSize * 2);
        canvas.height = fontSize * 1.8;
        
        // Imposta il font prima di misurare il testo
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Testo principale con colore appropriato
        const colorStr = `#${color.toString(16).padStart(6, '0')}`;
        context.fillStyle = colorStr;
        if (text) {
            context.fillText(text, canvas.width / 2, canvas.height / 2);
        }
        
        // Crea texture dal canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Crea il materiale
        const textMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide // Rendi il testo visibile da entrambi i lati
        });
        
        // Crea la geometria proporzionata
        const textWidth = size * Math.max((text || '').length * 0.6, 1);
        const textHeight = size * 1.2;
        const textGeometry = new THREE.PlaneGeometry(textWidth, textHeight);
        
        // Crea il mesh
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, 0.3); // Più avanti per evitare z-fighting
        
        // Se è un testo di un pulsante, eredita i dati del pulsante
        if (id && id.includes('loginBtn')) {
            textMesh.userData = { type: 'button', id: 'loginBtn' };
        }
        
        // Aggiungi al formGroup solo se richiesto
        if (addToGroup) {
            this.formGroup.add(textMesh);
        }
        
        if (id) {
            this.textMeshes[id] = textMesh;
            if (!this.textMeshes[id].userData) {
                this.textMeshes[id].userData = {};
            }
            this.textMeshes[id].userData.text = text;
            this.textMeshes[id].userData.canvas = canvas;
            this.textMeshes[id].userData.context = context;
        }
        
        return textMesh;
    }

    /**
     * Aggiorna il testo di un elemento esistente
     */
    updateText(id, newText) {
        window.debugLogger.log('updateText chiamato', {id: id, testo: newText});
        if (!this.textMeshes[id] || !this.textMeshes[id].userData) {
            window.debugLogger.log('ERRORE: Mesh o userData non trovato', {id: id});
            return;
        }
        
        const mesh = this.textMeshes[id];
        const userData = mesh.userData;
        
        // Ricrea il canvas con dimensioni appropriate per il nuovo testo
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Dimensioni proporzionate al testo
        const fontSize = Math.max(32, 0.7 * 50);
        canvas.width = Math.max(newText.length * fontSize * 0.7, fontSize * 2);
        canvas.height = fontSize * 1.8;
        
        // Pulisci il canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Imposta il font prima di misurare il testo
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Ridisegna il testo principale bianco
        context.fillStyle = '#FFFFFF';
        context.fillText(newText, canvas.width / 2, canvas.height / 2);
        
        // Crea una nuova texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Aggiorna il materiale con la nuova texture
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
        
        // Aggiorna i riferimenti
        userData.canvas = canvas;
        userData.context = context;
        userData.text = newText;
        
        window.debugLogger.log('Testo aggiornato con successo', {id: id});
    }

    /**
     * Gestisce il click su un elemento
     */
    handleClick(intersectedObject) {
        if (!this.isLoginVisible) return false;
        
        const userData = intersectedObject.userData;
        window.debugLogger.log('Click su elemento rilevato', userData);
        
        if (userData.type === 'key') {
            window.debugLogger.log('Tasto premuto', {valore: userData.value});
            this.handleKeyPress(userData.value);
            return true;
        } else if (userData.type === 'inputField') {
            window.debugLogger.log('Campo selezionato', {id: userData.id});
            this.setActiveField(userData.id);
            return true;
        } else if (userData.type === 'button' && userData.id === 'loginBtn') {
            window.debugLogger.log('Pulsante login premuto');
            this.handleLoginAttempt();
            return true;
        }
        
        return false;
    }

    /**
     * Gestisce la pressione di un tasto
     */
    handleKeyPress(key) {
        if (this.isLoading) return;
        
        switch (key) {
            case 'BACK':
                this.handleBackspace();
                break;
            case 'SPACE':
                this.addCharacter(' ');
                break;
            case 'SWITCH':
                this.switchActiveField();
                break;
            case 'LOGIN':
                this.handleLoginAttempt();
                break;
            default:
                this.addCharacter(key.toLowerCase());
                break;
        }
        
        this.updateFieldDisplay();
    }

    /**
     * Aggiunge un carattere al campo attivo
     */
    addCharacter(char) {
        window.debugLogger.log('Aggiungendo carattere al campo', {char: char, campo: this.activeField});
        if (this.activeField === 'email') {
            this.emailText += char;
        } else if (this.activeField === 'password') {
            this.passwordText += char;
        }
        window.debugLogger.log('Stato testi aggiornato', {email: this.emailText, password: '*'.repeat(this.passwordText.length)});
    }

    /**
     * Gestisce il backspace
     */
    handleBackspace() {
        if (this.activeField === 'email' && this.emailText.length > 0) {
            this.emailText = this.emailText.slice(0, -1);
        } else if (this.activeField === 'password' && this.passwordText.length > 0) {
            this.passwordText = this.passwordText.slice(0, -1);
        }
    }

    /**
     * Cambia il campo attivo
     */
    switchActiveField() {
        this.activeField = this.activeField === 'email' ? 'password' : 'email';
        this.updateFieldHighlight();
    }

    /**
     * Imposta il campo attivo
     */
    setActiveField(fieldId) {
        this.activeField = fieldId;
        this.updateFieldHighlight();
    }

    /**
     * Aggiorna l'evidenziazione del campo attivo
     */
    updateFieldHighlight() {
        if (this.textMeshes.emailField) {
            this.textMeshes.emailField.material.color.setHex(
                this.activeField === 'email' ? 0x3498DB : 0x34495E
            );
        }
        if (this.textMeshes.passwordField) {
            this.textMeshes.passwordField.material.color.setHex(
                this.activeField === 'password' ? 0x3498DB : 0x34495E
            );
        }
    }

    /**
     * Aggiorna la visualizzazione dei campi
     */
    updateFieldDisplay() {
        window.debugLogger.log('Aggiornando display dei campi');
        window.debugLogger.log('Stato textMeshes', {
            emailText: !!this.textMeshes.emailText,
            passwordText: !!this.textMeshes.passwordText,
            emailTextData: this.textMeshes.emailText ? this.textMeshes.emailText.userData : 'N/A',
            passwordTextData: this.textMeshes.passwordText ? this.textMeshes.passwordText.userData : 'N/A'
        });
        
        if (this.textMeshes.emailText) {
            // Aggiorna il testo email
            const displayText = this.emailText || 'Inserisci email...';
            window.debugLogger.log('Aggiornando email display', {testo: displayText});
            this.updateText('emailText', displayText);
        } else {
            window.debugLogger.log('ERRORE: emailText mesh non trovato');
        }
        
        if (this.textMeshes.passwordText) {
            // Aggiorna il testo password con asterischi
            const displayText = this.passwordText ? '*'.repeat(this.passwordText.length) : 'Inserisci password...';
            window.debugLogger.log('Aggiornando password display', {testo: displayText});
            this.updateText('passwordText', displayText);
        } else {
            window.debugLogger.log('ERRORE: passwordText mesh non trovato');
        }
    }

    /**
     * Gestisce il tentativo di login
     */
    async handleLoginAttempt() {
        if (this.isLoading) return;
        
        if (!this.emailText || !this.passwordText) {
            this.showMessage('Inserisci email e password', 0xff0000);
            return;
        }
        
        this.isLoading = true;
        this.showMessage('Accesso in corso...', 0x2196F3);
        
        try {
            const user = await window.dbManager.authenticateUser(this.emailText, this.passwordText);
            
            if (user) {
                this.currentUser = user;
                this.showMessage(`Benvenuto, ${user.name}!`, 0x4CAF50);
                setTimeout(() => {
                    this.hideLogin();
                    this.onLoginSuccess(user);
                }, 2000);
            } else {
                this.showMessage('Credenziali non valide', 0xff0000);
            }
        } catch (error) {
            this.showMessage('Errore di connessione', 0xff0000);
        }
        
        this.isLoading = false;
    }

    /**
     * Mostra un messaggio di stato
     */
    showMessage(message, color) {
        window.debugLogger.log('Messaggio di stato', {messaggio: message, colore: color});
        if (this.textMeshes.statusMessage) {
            this.updateText('statusMessage', message);
        }
    }

    /**
     * Callback per login riuscito
     */
    onLoginSuccess(user) {
        window.debugLogger.log('Login riuscito', {utente: user.name, ruolo: user.role});
        // Qui puoi aggiungere logica per dopo il login
        if (window.onUserLogin) {
            window.onUserLogin(user);
        }
    }

    /**
     * Mostra il sistema di login
     */
    showLogin() {
        window.debugLogger.log('Mostrando sistema di login');
        this.isLoginVisible = true;
        this.loginGroup.visible = true;
        
        // Forza la pulizia completa prima di mostrare
        this.emailText = '';
        this.passwordText = '';
        this.activeField = 'email';
        this.isLoading = false;
        
        this.resetForm();
        this.updateFieldHighlight();
        this.updateFieldDisplay();
        window.debugLogger.log('Login mostrato, campo attivo:', this.activeField);
    }

    /**
     * Nasconde il sistema di login
     */
    hideLogin() {
        this.isLoginVisible = false;
        this.loginGroup.visible = false;
    }

    /**
     * Resetta il form
     */
    resetForm() {
        window.debugLogger.log('Resettando form - stato prima', {
            emailText: this.emailText,
            passwordText: this.passwordText.length > 0 ? '*'.repeat(this.passwordText.length) : 'vuoto'
        });
        
        // Pulisci completamente i valori
        this.emailText = '';
        this.passwordText = '';
        this.activeField = 'email';
        this.isLoading = false;
        
        // Forza l'aggiornamento del display
        this.updateFieldDisplay();
        this.updateFieldHighlight();
        this.showMessage('', 0x333333);
        
        window.debugLogger.log('Form resettato - stato dopo', {
            emailText: this.emailText,
            passwordText: this.passwordText.length > 0 ? '*'.repeat(this.passwordText.length) : 'vuoto'
        });
    }

    /**
     * Verifica se il login è visibile
     */
    isVisible() {
        return this.isLoginVisible;
    }

    /**
     * Ottiene l'utente corrente
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Espone la classe globalmente
window.Login3D = Login3D; 