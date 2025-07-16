package com.futuralab.backend.models;

public class StudenteConStato {
    private int id;
    private String nome;
    private String cognome;
    private String username;
    private String email;
    private int idClasse;
    private String stato; // stato dalla tabella simulazione_studenti

    // Costruttore
    public StudenteConStato() {}

    public StudenteConStato(int id, String nome, String cognome, String username, String email, int idClasse, String stato) {
        this.id = id;
        this.nome = nome;
        this.cognome = cognome;
        this.username = username;
        this.email = email;
        this.idClasse = idClasse;
        this.stato = stato;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCognome() { return cognome; }
    public void setCognome(String cognome) { this.cognome = cognome; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getIdClasse() { return idClasse; }
    public void setIdClasse(int idClasse) { this.idClasse = idClasse; }

    public String getStato() { return stato; }
    public void setStato(String stato) { this.stato = stato; }
} 