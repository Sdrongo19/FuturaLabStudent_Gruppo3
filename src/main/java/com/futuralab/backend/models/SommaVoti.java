package com.futuralab.backend.models;

public class SommaVoti {
    private int sommaVoti1;
    private int sommaVoti2;
    private int sommaVoti3;

    // Costruttore
    public SommaVoti() {}

    public SommaVoti(int sommaVoti1, int sommaVoti2, int sommaVoti3) {
        this.sommaVoti1 = sommaVoti1;
        this.sommaVoti2 = sommaVoti2;
        this.sommaVoti3 = sommaVoti3;
    }

    // Getters e Setters
    public int getSommaVoti1() { return sommaVoti1; }
    public void setSommaVoti1(int sommaVoti1) { this.sommaVoti1 = sommaVoti1; }

    public int getSommaVoti2() { return sommaVoti2; }
    public void setSommaVoti2(int sommaVoti2) { this.sommaVoti2 = sommaVoti2; }

    public int getSommaVoti3() { return sommaVoti3; }
    public void setSommaVoti3(int sommaVoti3) { this.sommaVoti3 = sommaVoti3; }
} 