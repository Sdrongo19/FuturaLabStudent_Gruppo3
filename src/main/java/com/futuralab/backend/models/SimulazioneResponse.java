package com.futuralab.backend.models;

public class SimulazioneResponse {
    private boolean success;
    private String message;
    private SimulazioneInsegnante simulazione;

    // Costruttore per successo
    public SimulazioneResponse(boolean success, SimulazioneInsegnante simulazione) {
        this.success = success;
        this.simulazione = simulazione;
        this.message = success ? "Simulazione trovata" : null;
    }

    // Costruttore per errore
    public SimulazioneResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.simulazione = null;
    }

    // Getters e Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public SimulazioneInsegnante getSimulazione() { return simulazione; }
    public void setSimulazione(SimulazioneInsegnante simulazione) { this.simulazione = simulazione; }
} 