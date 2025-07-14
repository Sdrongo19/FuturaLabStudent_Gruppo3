package com.futuralab.backend.models;

public class Classe {
    private int id;
    private String grado;
    private String nomeScuola;

    // Costruttore
    public Classe() {}

    public Classe(int id, String grado, String nomeScuola) {
        this.id = id;
        this.grado = grado;
        this.nomeScuola = nomeScuola;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getGrado() { return grado; }
    public void setGrado(String grado) { this.grado = grado; }

    public String getNomeScuola() { return nomeScuola; }
    public void setNomeScuola(String nomeScuola) { this.nomeScuola = nomeScuola; }
} 