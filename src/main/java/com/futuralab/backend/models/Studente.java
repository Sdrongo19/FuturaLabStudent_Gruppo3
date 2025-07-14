package com.futuralab.backend.models;

public class Studente {
    private int id;
    private String nome;
    private String cognome;
    private String username;
    private String email;
    private int idClasse;
    private String password;

    // Costruttore
    public Studente() {}

    public Studente(int id, String nome, String cognome, String username, String email, int idClasse, String password) {
        this.id = id;
        this.nome = nome;
        this.cognome = cognome;
        this.username = username;
        this.email = email;
        this.idClasse = idClasse;
        this.password = password;
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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
} 