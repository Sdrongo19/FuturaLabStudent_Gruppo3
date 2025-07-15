package com.futuralab.backend.controllers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.futuralab.backend.config.DatabaseConfig;
import com.futuralab.backend.models.Insegnante;
import com.futuralab.backend.models.LoginResponse;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AppController {
    
    @PostMapping("/login")
    public LoginResponse loginInsegnante(@RequestBody Map<String, String> credentials) {
        String query = "SELECT * FROM insegnante WHERE username = ? AND psw = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setString(1, credentials.get("username"));
            stmt.setString(2, credentials.get("password"));
            
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                Insegnante insegnante = new Insegnante(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("cognome"),
                    rs.getString("username"),
                    rs.getString("email"),
                    rs.getString("psw"),
                    rs.getInt("id_classe")
                );
                return new LoginResponse(true, "Login effettuato con successo", insegnante);
            } else {
                return new LoginResponse(false, "Credenziali non valide", null);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return new LoginResponse(false, "Errore durante il login: " + e.getMessage(), null);
        }
    }

    @PostMapping("/classeInsegnante")
    public List<String> getClasseInsegnante(@RequestBody Map<String, Integer> request) {
        List<String> classi = new ArrayList<>();
        String query = "SELECT cl.* FROM classe As cl JOIN insegnante As i ON i.id_classe = cl.id WHERE i.id = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                classi.add(rs.getString("id"));
                classi.add(rs.getString("grado"));
                classi.add(rs.getString("nome_scuola"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return classi;
    }

    @PostMapping("/macrocategorie")
    public List<String> getMacrocategorieByMateria(@RequestBody Map<String, Integer> request) {
        List<String> macrocategorie = new ArrayList<>();
        String query = "SELECT nome FROM macrocategoria WHERE id_materia = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idMateria"));
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                macrocategorie.add(rs.getString("nome"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return macrocategorie;
    }

    @PostMapping("/recentiItems")
    public List<String> getRecentiItems(@RequestBody Map<String, Integer> request) {
        List<String> items = new ArrayList<>();
        String query = "SELECT ri.* FROM recenti_item As ri JOIN recenti as rec ON ri.id_recenti = rec.id WHERE rec.id_insegnante = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                items.add(rs.getString("id"));
                items.add(rs.getString("id_recenti"));
                items.add(rs.getString("id_macrocategoria"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    @PostMapping("/preferitiItems")
    public List<String> getPreferitiItems(@RequestBody Map<String, Integer> request) {
        List<String> items = new ArrayList<>();
        String query = "SELECT pi.* FROM preferiti_item As pi JOIN preferiti as pref ON pi.id_preferiti = pref.id WHERE pref.id_insegnante = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                items.add(rs.getString("id"));
                items.add(rs.getString("id_preferiti"));
                items.add(rs.getString("id_macrocategoria"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    @PostMapping("/studenti")
    public List<String> getStudentiByClasse(@RequestBody Map<String, Integer> request) {
        List<String> studenti = new ArrayList<>();
        String query = "SELECT nome, cognome FROM studenti WHERE id_classe = ?";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idClasse"));
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

    @GetMapping("/materie")
    public List<String> getMaterie() {
        List<String> materie = new ArrayList<>();
        String query = "SELECT nome FROM materia";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                materie.add(rs.getString("nome"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return materie;
    }

    @GetMapping("/macrocategorie")
    public List<String> getMacrocategorie() {
        List<String> macrocategorie = new ArrayList<>();
        String query = "SELECT nome FROM macrocategoria";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
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
    
} 