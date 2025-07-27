package com.futuralab.backend.models;

import java.time.LocalDateTime;

public class SimulazioneInsegnante {

    private int id;
    private Macrocategoria macrocategoria;
    private String tipoSimulazione;
    private LocalDateTime dataFormattata;
    private String stato;
    private Insegnante insegnante;

    public SimulazioneInsegnante(int id, Macrocategoria macrocategoria, String tipoSimulazione, LocalDateTime dataFormattata, String stato, Insegnante insegnante) {
        this.id = id;
        this.macrocategoria = macrocategoria;
        this.tipoSimulazione = tipoSimulazione;
        this.dataFormattata = dataFormattata;
        this.stato = stato;
        this.insegnante = insegnante;
    }

    public int getId() {
        return id;
    }

    public Macrocategoria getMacrocategoria() {
        return macrocategoria;
    }

    public String getTipoSimulazione() {
        return tipoSimulazione;
    }

    public LocalDateTime getDataFormattata() {
        return dataFormattata;
    }

    public String getStato() {
        return stato;
    }

    public Insegnante getInsegnante() {
        return insegnante;
    }
}
