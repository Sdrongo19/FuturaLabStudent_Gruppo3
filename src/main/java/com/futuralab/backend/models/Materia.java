package com.futuralab.backend.models;

public class Materia {
    private int id;
    private String nome;

    // Costruttore
    public Materia() {}

    public Materia(int id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
} 