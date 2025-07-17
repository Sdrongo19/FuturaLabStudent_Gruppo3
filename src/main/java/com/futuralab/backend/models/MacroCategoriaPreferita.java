package com.futuralab.backend.models;

public class MacroCategoriaPreferita {
    private int id;
    private String nome;
    private int idMateria;
    private String video;
    private int preferito;

    // Costruttore
    public MacroCategoriaPreferita() {}

    public MacroCategoriaPreferita(int id, String nome, int idMateria, String video, int preferito) {
        this.id = id;
        this.nome = nome;
        this.idMateria = idMateria;
        this.video = video;
        this.preferito = preferito;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public int getIdMateria() { return idMateria; }
    public void setIdMateria(int idMateria) { this.idMateria = idMateria; }

    public String getVideo() { return video; }
    public void setVideo(String video) { this.video = video; }

    public int getPreferito() { return preferito; }
    public void setPreferito(int preferito) { this.preferito = preferito; }
} 