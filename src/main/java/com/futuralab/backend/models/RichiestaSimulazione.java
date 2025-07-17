package com.futuralab.backend.models;

import java.time.LocalDateTime;

public class RichiestaSimulazione {
    private int id;
    private int idMacrocategoria;
    private int idInsegnante;
    private String stato;
    private int idClasse;
    private int isVideo;
    private LocalDateTime data;

    // Costruttore
    public RichiestaSimulazione() {}

    public RichiestaSimulazione(int id, int idMacrocategoria, int idInsegnante, String stato, int idClasse, int isVideo, LocalDateTime data) {
        this.id = id;
        this.idMacrocategoria = idMacrocategoria;
        this.idInsegnante = idInsegnante;
        this.stato = stato;
        this.idClasse = idClasse;
        this.isVideo = isVideo;
        this.data = data;
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

    public int getIsVideo() { return isVideo; }
    public void setIsVideo(int isVideo) { this.isVideo = isVideo; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }
} 