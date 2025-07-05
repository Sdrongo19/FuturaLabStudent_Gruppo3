/**
 * Sistema di logging per il debug del Login 3D
 */
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.logElement = null;
        this.createLogDisplay();
    }

    /**
     * Crea un elemento per visualizzare i log sulla pagina
     */
    createLogDisplay() {
        // Crea un div per i log
        this.logElement = document.createElement('div');
        this.logElement.id = 'debug-logs';
        this.logElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            height: 300px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border: 2px solid #00ff00;
            border-radius: 5px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
        `;
        
        // Aggiungi alla pagina
        document.body.appendChild(this.logElement);
        
        // Crea pulsante per mostrare/nascondere i log
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'DEBUG LOG';
        toggleButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 420px;
            background: #00ff00;
            color: black;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10000;
            font-weight: bold;
        `;
        
        toggleButton.onclick = () => {
            if (this.logElement.style.display === 'none') {
                this.logElement.style.display = 'block';
                toggleButton.textContent = 'NASCONDI LOG';
            } else {
                this.logElement.style.display = 'none';
                toggleButton.textContent = 'DEBUG LOG';
            }
        };
        
        document.body.appendChild(toggleButton);
    }

    /**
     * Aggiunge un log
     */
    log(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            time: timestamp,
            message: message,
            data: data
        };
        
        this.logs.push(logEntry);
        
        // Mantieni solo gli ultimi N log
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Aggiorna la visualizzazione
        this.updateDisplay();
        
        // Anche console.log per backup
        if (data) {
            console.log(`[${timestamp}] ${message}`, data);
        } else {
            console.log(`[${timestamp}] ${message}`);
        }
    }

    /**
     * Aggiorna la visualizzazione dei log
     */
    updateDisplay() {
        if (!this.logElement) return;
        
        const logText = this.logs.map(entry => {
            let line = `[${entry.time}] ${entry.message}`;
            if (entry.data) {
                line += ` | ${JSON.stringify(entry.data)}`;
            }
            return line;
        }).join('\n');
        
        this.logElement.textContent = logText;
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }

    /**
     * Pulisce i log
     */
    clear() {
        this.logs = [];
        this.updateDisplay();
    }

    /**
     * Scarica i log come file
     */
    download() {
        const logText = this.logs.map(entry => {
            let line = `[${entry.time}] ${entry.message}`;
            if (entry.data) {
                line += ` | ${JSON.stringify(entry.data)}`;
            }
            return line;
        }).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `login3d-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Crea istanza globale del logger
window.debugLogger = new Logger();

// Aggiungi pulsante per scaricare i log
const downloadButton = document.createElement('button');
downloadButton.textContent = 'SCARICA LOG';
downloadButton.style.cssText = `
    position: fixed;
    top: 50px;
    right: 420px;
    background: #ff8c00;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 10000;
    font-weight: bold;
`;

downloadButton.onclick = () => {
    window.debugLogger.download();
};

document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(downloadButton);
}); 