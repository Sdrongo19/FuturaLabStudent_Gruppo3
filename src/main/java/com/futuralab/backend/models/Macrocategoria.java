package com.futuralab.backend.models;

public class Macrocategoria {
    private int id;
    private String nome;
    private int idMateria;
    private String video;

    // Costruttore
    public Macrocategoria() {}

    public Macrocategoria(int id, String nome, int idMateria, String video) {
        this.id = id;
        this.nome = nome;
        this.idMateria = idMateria;
        this.video = video;
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
} 