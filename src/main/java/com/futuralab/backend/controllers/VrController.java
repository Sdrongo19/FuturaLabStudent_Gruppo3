package com.futuralab.backend.controllers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.futuralab.backend.config.DatabaseConfig;
import com.futuralab.backend.models.LoginResponseStudente;
import com.futuralab.backend.models.Studente;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class VrController {

    @PostMapping("/vrLogin")
    public LoginResponseStudente vrLogin(@RequestBody Map<String, String> credentials) {
        String query = "SELECT * FROM studente WHERE username = ? AND psw = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, credentials.get("username"));
            stmt.setString(2, credentials.get("password"));

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Studente studente = new Studente(
                        rs.getInt("id"),
                        rs.getString("nome"),
                        rs.getString("cognome"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getInt("id_classe"),
                        rs.getString("psw")
                );
                return new LoginResponseStudente(true, "Login effettuato con successo", studente);
            } else {
                return new LoginResponseStudente(false, "Credenziali non valide", null);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return new LoginResponseStudente(false, "Errore durante il login: " + e.getMessage(), null);
        }
    }
}
