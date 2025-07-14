package com.futuralab.backend.models;

public class RichiestaSimulazione {
    private int id;
    private int idMacrocategoria;
    private int idInsegnante;
    private String stato;
    private int idClasse;

    // Costruttore
    public RichiestaSimulazione() {}

    public RichiestaSimulazione(int id, int idMacrocategoria, int idInsegnante, String stato, int idClasse) {
        this.id = id;
        this.idMacrocategoria = idMacrocategoria;
        this.idInsegnante = idInsegnante;
        this.stato = stato;
        this.idClasse = idClasse;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdMacrocategoria() { return idMacrocategoria; }
    public void setIdMacrocategoria(int idMacrocategoria) { this.idMacrocategoria = idMacrocategoria; }

    public int getIdInsegnante() { return idInsegnante; }
    public void setIdInsegnante(int idInsegnante) { this.idInsegnante = idInsegnante; }

    public String getStato() { return stato; }
    public void setStato(String stato) { this.stato = stato; }

    public int getIdClasse() { return idClasse; }
    public void setIdClasse(int idClasse) { this.idClasse = idClasse; }
} 