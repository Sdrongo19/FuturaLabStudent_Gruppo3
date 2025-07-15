package com.futuralab.backend.models;

public class Insegnante {
    private int id;
    private String nome;
    private String cognome;
    private String username;
    private String email;
    private String psw;
    private Integer idClasse;

    // Costruttore
    public Insegnante(int id, String nome, String cognome, String username, String email, String psw, Integer idClasse) {
        this.id = id;
        this.nome = nome;
        this.cognome = cognome;
        this.username = username;
        this.email = email;
        this.psw = psw;
        this.idClasse = idClasse;
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

    public String getPsw() { return psw; }
    public void setPsw(String psw) { this.psw = psw; }

    public Integer getIdClasse() { return idClasse; }
    public void setIdClasse(Integer idClasse) { this.idClasse = idClasse; }
} 