/**
 * Sistema di Login 3D con tastiera virtuale
 * Gestisce l'interfaccia di login all'interno della scena 3D
 */

class Login3D {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
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
                color: 0xf5f5f5,
                transparent: true,
                opacity: 0.95
            }),
            button: new THREE.MeshLambertMaterial({ 
                color: 0x4CAF50,
                transparent: true,
                opacity: 0.9
            }),
            buttonHover: new THREE.MeshLambertMaterial({ 
                color: 0x45a049,
                transparent: true,
                opacity: 0.9
            }),
            key: new THREE.MeshLambertMaterial({ 
                color: 0xeeeeee,
                transparent: true,
                opacity: 0.9
            }),
            keyHover: new THREE.MeshLambertMaterial({ 
                color: 0xdddddd,
                transparent: true,
                opacity: 0.9
            }),
            keyPressed: new THREE.MeshLambertMaterial({ 
                color: 0xcccccc,
                transparent: true,
                opacity: 0.9
            }),
            text: new THREE.MeshLambertMaterial({ 
                color: 0x333333,
                transparent: true,
                opacity: 1.0
            }),
            fieldActive: new THREE.MeshLambertMaterial({ 
                color: 0x2196F3,
                transparent: true,
                opacity: 0.8
            }),
            fieldInactive: new THREE.MeshLambertMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
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
     * Inizializza il sistema di login 3D
     */
    initializeLogin() {
        // Posiziona il login più in alto e più vicino al centro della stanza
        this.loginGroup.position.set(0, 20, 0);
        this.loginGroup.rotation.x = 0; // Leggera inclinazione per migliore visibilità
        this.loginGroup.rotation.y = Math.PI/2; // Ruota il login di 180 gradi sull'asse Y
        this.scene.add(this.loginGroup);
        
        this.createLoginForm();
        this.createVirtualKeyboard();
        this.hideLogin();
    }

    /**
     * Crea il form di login 3D
     */
    createLoginForm() {
        // Pannello principale più grande e colorato
        const panelGeometry = new THREE.PlaneGeometry(12, 8);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f0f0,
            transparent: true,
            opacity: 0.95
        });
        const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
        panelMesh.position.set(0, 0, 0.1);
        
        // Bordo del pannello
        const borderGeometry = new THREE.PlaneGeometry(12.2, 8.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, 0.05);
        
        this.formGroup.add(borderMesh);
        this.formGroup.add(panelMesh);
        
        // Titolo più grande
        this.createText('FuturaLab Login', 0, 3, 0.8, 0x2196F3, 'titleText');
        
        // Campo Email più grande
        this.createInputField('email', 'Email', 0, 1.5, 8, 1.2);
        
        // Campo Password più grande
        this.createInputField('password', 'Password', 0, 0, 8, 1.2);
        
        // Pulsante Login più grande
        this.createButton('loginBtn', 'ACCEDI', 0, -2, 3, 1, this.materials.button);
        
        // Messaggio di stato
        this.createText('', 0, -3.2, 0.5, 0xff0000, 'statusMessage');
        
        this.loginGroup.add(this.formGroup);
    }

    /**
     * Crea un campo di input 3D
     */
    createInputField(id, label, x, y, width, height) {
        const fieldGroup = new THREE.Group();
        
        // Sfondo del campo più visibile
        const fieldGeometry = new THREE.PlaneGeometry(width, height);
        const fieldMaterial = id === 'email' ? 
            this.materials.fieldActive.clone() : 
            this.materials.fieldInactive.clone();
        fieldMaterial.transparent = true;
        fieldMaterial.opacity = 0.8;
        
        const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
        fieldMesh.userData = { type: 'inputField', id: id };
        fieldGroup.add(fieldMesh);
        
        // Bordo del campo
        const borderGeometry = new THREE.PlaneGeometry(width + 0.2, height + 0.2);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.01);
        fieldGroup.add(borderMesh);
        
        // Etichetta più grande
        this.createText(label, x - width/2 + 0.8, y + height/2 + 0.6, 0.5, 0x333333, `${id}Label`);
        
        // Testo del campo
        this.createText('', x - width/2 + 0.5, y, 0.6, 0x333333, `${id}Text`);
        
        fieldGroup.position.set(x, y, 0.05);
        this.formGroup.add(fieldGroup);
        
        // Salva il riferimento al campo
        this.textMeshes[`${id}Field`] = fieldMesh;
    }

    /**
     * Crea un pulsante 3D
     */
    createButton(id, text, x, y, width, height, material) {
        const buttonGroup = new THREE.Group();
        
        // Geometria del pulsante più spessa
        const buttonGeometry = new THREE.BoxGeometry(width, height, 0.3);
        const buttonMaterial = material.clone();
        buttonMaterial.transparent = true;
        buttonMaterial.opacity = 0.9;
        
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.userData = { type: 'button', id: id };
        buttonGroup.add(buttonMesh);
        
        // Bordo del pulsante
        const borderGeometry = new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.25);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.05);
        buttonGroup.add(borderMesh);
        
        // Testo del pulsante più grande
        this.createText(text, 0, 0, 0.6, 0xffffff, `${id}Text`);
        
        buttonGroup.position.set(x, y, 0.15);
        this.formGroup.add(buttonGroup);
        
        return buttonMesh;
    }

    /**
     * Crea la tastiera virtuale 3D
     */
    createVirtualKeyboard() {
        const keySize = 1.2; // Tasti più grandi
        const keySpacing = 1.4; // Spaziatura aumentata
        const startY = -5.5; // Posizione più bassa
        
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
        
        // Geometria del tasto più grande e visibile
        let keyWidth = size;
        if (keyValue === 'SPACE') keyWidth = size * 3;
        if (keyValue === 'BACK') keyWidth = size * 1.5;
        if (keyValue === 'SWITCH') keyWidth = size * 1.3;
        if (keyValue === 'LOGIN') keyWidth = size * 1.3;
        
        const keyGeometry = new THREE.BoxGeometry(keyWidth, size, 0.3);
        const keyMaterial = this.materials.key.clone();
        keyMaterial.transparent = true;
        keyMaterial.opacity = 0.9;
        
        const keyMesh = new THREE.Mesh(keyGeometry, keyMaterial);
        keyMesh.userData = { type: 'key', value: keyValue };
        keyGroup.add(keyMesh);
        
        // Bordo del tasto
        const borderGeometry = new THREE.BoxGeometry(keyWidth + 0.1, size + 0.1, 0.25);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(0, 0, -0.05);
        keyGroup.add(borderMesh);
        
        // Testo del tasto più grande
        let displayText = keyValue;
        if (keyValue === 'SPACE') displayText = 'SPAZIO';
        if (keyValue === 'BACK') displayText = '⌫';
        if (keyValue === 'SWITCH') displayText = 'CAMPO';
        
        this.createText(displayText, 0, 0, 0.4, 0x333333, `key_${keyValue}`);
        
        keyGroup.position.set(x, y, 0.15);
        this.keyboardGroup.add(keyGroup);
        
        this.keys.push(keyMesh);
    }

    /**
     * Crea testo 3D più visibile
     */
    createText(text, x, y, size, color, id = null) {
        if (!text) return null;
        
        // Crea un piano per il testo più grande
        const textWidth = Math.max(text.length * size * 0.8, size);
        const textGeometry = new THREE.PlaneGeometry(textWidth, size * 1.2);
        const textMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true,
            opacity: 1.0
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, 0.02);
        
        // Aggiungi un'ombra/sfondo per il testo
        const shadowGeometry = new THREE.PlaneGeometry(textWidth + 0.2, size * 1.2 + 0.2);
        const shadowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowMesh.position.set(x, y, 0.01);
        
        this.formGroup.add(shadowMesh);
        this.formGroup.add(textMesh);
        
        if (id) {
            this.textMeshes[id] = textMesh;
        }
        
        return textMesh;
    }

    /**
     * Gestisce il click su un elemento
     */
    handleClick(intersectedObject) {
        if (!this.isLoginVisible) return false;
        
        const userData = intersectedObject.userData;
        
        if (userData.type === 'key') {
            this.handleKeyPress(userData.value);
            return true;
        } else if (userData.type === 'inputField') {
            this.setActiveField(userData.id);
            return true;
        } else if (userData.type === 'button' && userData.id === 'loginBtn') {
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
        if (this.activeField === 'email') {
            this.emailText += char;
        } else if (this.activeField === 'password') {
            this.passwordText += char;
        }
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
            this.textMeshes.emailField.material = this.activeField === 'email' ? 
                this.materials.fieldActive : this.materials.fieldInactive;
        }
        if (this.textMeshes.passwordField) {
            this.textMeshes.passwordField.material = this.activeField === 'password' ? 
                this.materials.fieldActive : this.materials.fieldInactive;
        }
    }

    /**
     * Aggiorna la visualizzazione dei campi
     */
    updateFieldDisplay() {
        if (this.textMeshes.emailText) {
            // Aggiorna il testo email (placeholder per ora)
            console.log('Email:', this.emailText);
        }
        if (this.textMeshes.passwordText) {
            // Aggiorna il testo password con asterischi
            console.log('Password:', '*'.repeat(this.passwordText.length));
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
        console.log('Status:', message);
        // Aggiorna il mesh del testo del messaggio
    }

    /**
     * Callback per login riuscito
     */
    onLoginSuccess(user) {
        console.log('Login riuscito per:', user);
        // Qui puoi aggiungere logica per dopo il login
        if (window.onUserLogin) {
            window.onUserLogin(user);
        }
    }

    /**
     * Mostra il sistema di login
     */
    showLogin() {
        this.isLoginVisible = true;
        this.loginGroup.visible = true;
        this.resetForm();
        this.updateFieldHighlight();
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
        this.emailText = '';
        this.passwordText = '';
        this.activeField = 'email';
        this.updateFieldDisplay();
        this.showMessage('', 0x333333);
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