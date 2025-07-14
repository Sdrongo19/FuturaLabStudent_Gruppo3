package com.futuralab.backend.models;

public class ValutazioneSimulazione {
    private int id;
    private int idStudente;
    private int idSimulazione;
    private String voto;

    // Costruttore
    public ValutazioneSimulazione() {}

    public ValutazioneSimulazione(int id, int idStudente, int idSimulazione, String voto) {
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

    public String getVoto() { return voto; }
    public void setVoto(String voto) { this.voto = voto; }
} 