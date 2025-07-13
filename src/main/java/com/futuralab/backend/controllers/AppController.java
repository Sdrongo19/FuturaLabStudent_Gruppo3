package com.futuralab.backend.controllers;

import com.futuralab.backend.config.DatabaseConfig;
import com.futuralab.backend.models.Insegnante;
import org.springframework.web.bind.annotation.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AppController {
    
    @PostMapping("/login")
    public Insegnante loginInsegnante(@RequestBody Map<String, String> credentials) {
        String query = "SELECT * FROM insegnante WHERE username = ? AND psw = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setString(1, credentials.get("username"));
            stmt.setString(2, credentials.get("password"));
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return new Insegnante(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("cognome"),
                    rs.getString("username"),
                    rs.getString("email"),
                    rs.getString("psw")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @GetMapping("/macrocategorie/{idMateria}")
    public List<String> getMacrocategorieByMateria(@PathVariable int idMateria) {
        List<String> macrocategorie = new ArrayList<>();
        String query = "SELECT nome FROM macrocategoria WHERE id_materia = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, idMateria);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                macrocategorie.add(rs.getString("nome"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return macrocategorie;
    }

    @PostMapping("/simulazione")
    public boolean creaRichiestaSimulazione(@RequestBody Map<String, Integer> request) {
        String query = "INSERT INTO richiesta_simulazione (id_macrocategoria, id_insegnante, id_classe, stato) VALUES (?, ?, ?, 'richiesta')";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idMacrocategoria"));
            stmt.setInt(2, request.get("idInsegnante"));
            stmt.setInt(3, request.get("idClasse"));
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @GetMapping("/studenti/{idClasse}")
    public List<String> getStudentiByClasse(@PathVariable int idClasse) {
        List<String> studenti = new ArrayList<>();
        String query = "SELECT nome, cognome FROM studenti WHERE id_classe = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, idClasse);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                String nomeCompleto = rs.getString("nome") + " " + rs.getString("cognome");
                studenti.add(nomeCompleto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return studenti;
    }
} 