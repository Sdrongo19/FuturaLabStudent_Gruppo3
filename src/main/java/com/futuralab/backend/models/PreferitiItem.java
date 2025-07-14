package com.futuralab.backend.models;

public class PreferitiItem {
    private int id;
    private int idMacrocategoria;
    private int idPreferiti;

    // Costruttore
    public PreferitiItem() {}

    public PreferitiItem(int id, int idMacrocategoria, int idPreferiti) {
        this.id = id;
        this.idMacrocategoria = idMacrocategoria;
        this.idPreferiti = idPreferiti;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdMacrocategoria() { return idMacrocategoria; }
    public void setIdMacrocategoria(int idMacrocategoria) { this.idMacrocategoria = idMacrocategoria; }

    public int getIdPreferiti() { return idPreferiti; }
    public void setIdPreferiti(int idPreferiti) { this.idPreferiti = idPreferiti; }
} 