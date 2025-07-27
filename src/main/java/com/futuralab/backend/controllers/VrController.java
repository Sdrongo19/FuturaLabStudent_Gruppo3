package com.futuralab.backend.controllers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.futuralab.backend.config.DatabaseConfig;
import com.futuralab.backend.models.Insegnante;
import com.futuralab.backend.models.LoginResponseStudente;
import com.futuralab.backend.models.Macrocategoria;
import com.futuralab.backend.models.SimulazioneInsegnante;
import com.futuralab.backend.models.SimulazioneResponse;
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

    @PostMapping("/getSimulazioneInCorso")
    public SimulazioneResponse getSimulazioneInCorso(@RequestBody Map<String, Integer> request) {
        String query = "SELECT rs.id as simulazione_id, rs.isVideo as tipo_simulazione, rs.data as data_formattata, rs.stato, " +
                      "i.id as insegnante_id, i.nome as insegnante_nome, i.cognome as insegnante_cognome, " +
                      "i.username as insegnante_username, i.email as insegnante_email, i.psw as insegnante_psw, i.id_classe as insegnante_id_classe, " +
                      "m.id as macrocategoria_id, m.nome as macrocategoria_nome, m.id_materia as macrocategoria_id_materia, m.video as macrocategoria_video " +
                      "FROM richiesta_simulazione rs " +
                      "JOIN insegnante i ON rs.id_insegnante = i.id " +
                      "JOIN macrocategoria m ON rs.id_macrocategoria = m.id " +
                      "WHERE rs.id_classe = ? AND rs.stato = 'avviato' " +
                      "ORDER BY rs.data DESC " +
                      "LIMIT 1";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, request.get("idClasse"));
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                // Creo l'oggetto Insegnante dai dati del risultato
                Insegnante insegnante = new Insegnante(
                    rs.getInt("insegnante_id"),
                    rs.getString("insegnante_nome"),
                    rs.getString("insegnante_cognome"),
                    rs.getString("insegnante_username"),
                    rs.getString("insegnante_email"),
                    rs.getString("insegnante_psw"),
                    rs.getInt("insegnante_id_classe")
                );

                Macrocategoria macrocategoria = new Macrocategoria(
                    rs.getInt("macrocategoria_id"),
                    rs.getString("macrocategoria_nome"),
                    rs.getInt("macrocategoria_id_materia"),
                    rs.getString("macrocategoria_video")
                );

                SimulazioneInsegnante simulazione = new SimulazioneInsegnante(
                    rs.getInt("simulazione_id"),
                    macrocategoria,
                    rs.getInt("tipo_simulazione"),
                    LocalDateTime.parse(rs.getString("data_formattata"), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS")),
                    rs.getString("stato"),
                    insegnante
                );

                return new SimulazioneResponse(true, simulazione);
            } else {
                return new SimulazioneResponse(false, "Non è stata trovata nessuna lezione avviata");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return new SimulazioneResponse(false, "Errore durante la ricerca della simulazione");
        }
    }

    @PostMapping("/verifySimulazioneInCorso")
    public boolean verifySimulazioneInCorso(@RequestBody Map<String, Integer> request) {
        String query = "SELECT stato FROM richiesta_simulazione WHERE id = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, request.get("idSimulazione"));
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                String stato = rs.getString("stato");
                if ("avviato".equals(stato)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @PostMapping("/setStatoSimulazioneStudente")
    public String setStatoSimulazioneStudente(@RequestBody Map<String, Object> request) {
        String stato = (String) request.get("stato");
        
        // Validazione dello stato - accetta solo "inCorso" o "finito"
        if (!"inCorso".equals(stato) && !"finito".equals(stato)) {
            return "Stato non valido. I valori accettati sono: 'inCorso' o 'finito'";
        }
        
        // Se lo stato richiesto è "inCorso", controlla che lo stato attuale non sia "finito"
        if ("inCorso".equals(stato)) {
            String checkQuery = "SELECT stato FROM simulazione_studenti WHERE id_richiesta_simulazione = ? AND id_studente = ?";
            
            try (Connection conn = DatabaseConfig.getConnection(); 
                 PreparedStatement checkStmt = conn.prepareStatement(checkQuery)) {
                checkStmt.setInt(1, (Integer) request.get("idSimulazione"));
                checkStmt.setInt(2, (Integer) request.get("idStudente"));
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    String statoAttuale = rs.getString("stato");
                    if ("finito".equals(statoAttuale)) {
                        return "Impossibile passare da 'finito' a 'inCorso'. Lo studente ha già completato la simulazione.";
                    }
                }
            } catch (SQLException e) {
                e.printStackTrace();
                return "Errore durante la verifica dello stato attuale";
            }
        }
        
        String query = "UPDATE simulazione_studenti SET stato = ? WHERE id_richiesta_simulazione = ? AND id_studente = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, stato);
            stmt.setInt(2, (Integer) request.get("idSimulazione"));
            stmt.setInt(3, (Integer) request.get("idStudente"));
            stmt.executeUpdate();
            return "Stato simulazione aggiornato con successo";
        } catch (SQLException e) {
            e.printStackTrace();
            return "Errore durante la modifica dello stato della simulazione";
        }
    }

}
