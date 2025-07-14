package com.futuralab.backend.models;

public class Preferiti {
    private int id;
    private int idInsegnante;

    // Costruttore
    public Preferiti() {}

    public Preferiti(int id, int idInsegnante) {
        this.id = id;
        this.idInsegnante = idInsegnante;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdInsegnante() { return idInsegnante; }
    public void setIdInsegnante(int idInsegnante) { this.idInsegnante = idInsegnante; }
} 