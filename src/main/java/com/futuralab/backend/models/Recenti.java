package com.futuralab.backend.models;

public class Recenti {
    private int id;
    private int idInsegnante;

    // Costruttore
    public Recenti() {}

    public Recenti(int id, int idInsegnante) {
        this.id = id;
        this.idInsegnante = idInsegnante;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdInsegnante() { return idInsegnante; }
    public void setIdInsegnante(int idInsegnante) { this.idInsegnante = idInsegnante; }
} 