package com.futuralab.backend.models;

public class LoginResponseStudente {
    private boolean success;
    private String message;
    private Studente studente;

    public LoginResponseStudente(boolean success, String message, Studente studente) {
        this.success = success;
        this.message = message;
        this.studente = studente;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Studente getStudente() {
        return studente;
    }

    public void setStudente(Studente studente) {
        this.studente = studente;
    }
} 