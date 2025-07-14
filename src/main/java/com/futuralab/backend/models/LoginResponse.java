package com.futuralab.backend.models;

public class LoginResponse {
    private boolean success;
    private String message;
    private Insegnante insegnante;

    public LoginResponse(boolean success, String message, Insegnante insegnante) {
        this.success = success;
        this.message = message;
        this.insegnante = insegnante;
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

    public Insegnante getInsegnante() {
        return insegnante;
    }

    public void setInsegnante(Insegnante insegnante) {
        this.insegnante = insegnante;
    }
} 