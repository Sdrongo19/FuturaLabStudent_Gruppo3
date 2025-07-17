package com.futuralab.backend.models;

public class RichiestaSimulazioneRidotta {
    private int id;
    private String nomeMacrocategoria;
    private String tipoSimulazione;
    private String dataFormattata;

    // Costruttore
    public RichiestaSimulazioneRidotta(int id, String nomeMacrocategoria, String tipoSimulazione, String dataFormattata) {
        this.id = id;
        this.nomeMacrocategoria = nomeMacrocategoria;
        this.tipoSimulazione = tipoSimulazione;
        this.dataFormattata = dataFormattata;
    }

    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNomeMacrocategoria() { return nomeMacrocategoria; }
    public void setNomeMacrocategoria(String nomeMacrocategoria) { this.nomeMacrocategoria = nomeMacrocategoria; }

    public String getTipoSimulazione() { return tipoSimulazione; }
    public void setTipoSimulazione(String tipoSimulazione) { this.tipoSimulazione = tipoSimulazione; }

    public String getDataFormattata() { return dataFormattata; }
    public void setDataFormattata(String dataFormattata) { this.dataFormattata = dataFormattata; }
} 