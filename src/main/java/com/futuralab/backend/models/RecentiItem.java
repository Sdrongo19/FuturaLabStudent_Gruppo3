package com.futuralab.backend.models;

public class RecentiItem {
    private int id;
    private int idRecenti;
    private int idMacrocategoria;

    // Costruttore
    public RecentiItem() {}

    public RecentiItem(int id, int idRecenti, int idMacrocategoria) {
        this.id = id;
        this.idRecenti = idRecenti;
        this.idMacrocategoria = idMacrocategoria;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdRecenti() { return idRecenti; }
    public void setIdRecenti(int idRecenti) { this.idRecenti = idRecenti; }

    public int getIdMacrocategoria() { return idMacrocategoria; }
    public void setIdMacrocategoria(int idMacrocategoria) { this.idMacrocategoria = idMacrocategoria; }
} 