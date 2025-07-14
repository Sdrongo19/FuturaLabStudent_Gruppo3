package com.futuralab.backend.models;

public class SimulazioneStudenti {
    private int idStudenti;
    private int idRichiestaSimulazione;
    private String stato;

    // Costruttore
    public SimulazioneStudenti() {}

    public SimulazioneStudenti(int idStudenti, int idRichiestaSimulazione, String stato) {
        this.idStudenti = idStudenti;
        this.idRichiestaSimulazione = idRichiestaSimulazione;
        this.stato = stato;
    }

    // Getters e Setters
    public int getIdStudenti() { return idStudenti; }
    public void setIdStudenti(int idStudenti) { this.idStudenti = idStudenti; }

    public int getIdRichiestaSimulazione() { return idRichiestaSimulazione; }
    public void setIdRichiestaSimulazione(int idRichiestaSimulazione) { this.idRichiestaSimulazione = idRichiestaSimulazione; }

    public String getStato() { return stato; }
    public void setStato(String stato) { this.stato = stato; }
} 