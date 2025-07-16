package com.futuralab.backend.models;

public class ValutazioneSimulazione {
    private int id;
    private int idStudente;
    private int idSimulazione;
    private int voto;

    // Costruttore
    public ValutazioneSimulazione() {}

    public ValutazioneSimulazione(int id, int idStudente, int idSimulazione, int voto) {
        this.id = id;
        this.idStudente = idStudente;
        this.idSimulazione = idSimulazione;
        this.voto = voto;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdStudente() { return idStudente; }
    public void setIdStudente(int idStudente) { this.idStudente = idStudente; }

    public int getIdSimulazione() { return idSimulazione; }
    public void setIdSimulazione(int idSimulazione) { this.idSimulazione = idSimulazione; }

    public int getVoto() { return voto; }
    public void setVoto(int voto) { this.voto = voto; }
} 