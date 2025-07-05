/**
 * Sistema di gestione del database per il login
 * Simulazione di un database con localStorage per il momento
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'futuralab_users';
        this.initializeDatabase();
    }

    /**
     * Inizializza il database con alcuni utenti di esempio
     */
    initializeDatabase() {
        const existingUsers = localStorage.getItem(this.dbName);
        if (!existingUsers) {
            const defaultUsers = [
                { 
                    id: 1, 
                    email: 'admin@futuralab.com', 
                    password: 'admin123',
                    name: 'Amministratore',
                    role: 'admin'
                },
                { 
                    id: 2, 
                    email: 'studente@futuralab.com', 
                    password: 'studente123',
                    name: 'Studente',
                    role: 'student'
                },
                { 
                    id: 3, 
                    email: 'docente@futuralab.com', 
                    password: 'docente123',
                    name: 'Docente',
                    role: 'teacher'
                }
            ];
            localStorage.setItem(this.dbName, JSON.stringify(defaultUsers));
            console.log('Database inizializzato con utenti di esempio');
        }
    }

    /**
     * Autentica un utente
     * @param {string} email - Email dell'utente
     * @param {string} password - Password dell'utente
     * @returns {Object|null} - Dati dell'utente se l'autenticazione è riuscita, null altrimenti
     */
    async authenticateUser(email, password) {
        return new Promise((resolve) => {
            // Simula un delay del database
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(this.dbName) || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    resolve(userWithoutPassword);
                } else {
                    resolve(null);
                }
            }, 500); // Simula 500ms di latenza
        });
    }

    /**
     * Registra un nuovo utente
     * @param {string} email - Email dell'utente
     * @param {string} password - Password dell'utente
     * @param {string} name - Nome dell'utente
     * @returns {Object|null} - Dati dell'utente se la registrazione è riuscita, null altrimenti
     */
    async registerUser(email, password, name) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem(this.dbName) || '[]');
                
                // Controlla se l'email esiste già
                if (users.find(u => u.email === email)) {
                    resolve({ error: 'Email già esistente' });
                    return;
                }
                
                const newUser = {
                    id: users.length + 1,
                    email,
                    password,
                    name,
                    role: 'student'
                };
                
                users.push(newUser);
                localStorage.setItem(this.dbName, JSON.stringify(users));
                
                const { password: _, ...userWithoutPassword } = newUser;
                resolve(userWithoutPassword);
            }, 500);
        });
    }

    /**
     * Ottiene tutti gli utenti (solo per admin)
     * @returns {Array} - Lista degli utenti senza password
     */
    getAllUsers() {
        const users = JSON.parse(localStorage.getItem(this.dbName) || '[]');
        return users.map(({ password, ...user }) => user);
    }
}

// Istanza globale del database
const dbManager = new DatabaseManager();

// Espone il database manager globalmente
window.dbManager = dbManager; 