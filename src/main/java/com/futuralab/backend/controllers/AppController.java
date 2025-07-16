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
import com.futuralab.backend.models.Classe;
import com.futuralab.backend.models.Insegnante;
import com.futuralab.backend.models.LoginResponse;
import com.futuralab.backend.models.Macrocategoria;
import com.futuralab.backend.models.Materia;
import com.futuralab.backend.models.PreferitiItem;
import com.futuralab.backend.models.RecentiItem;
import com.futuralab.backend.models.Studente;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AppController {

    @PostMapping("/login")
    public LoginResponse loginInsegnante(@RequestBody Map<String, String> credentials) {
        String query = "SELECT * FROM insegnante WHERE username = ? AND psw = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

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
    public List<Classe> getClasseInsegnante(@RequestBody Map<String, Integer> request) {
        List<Classe> classi = new ArrayList<>();
        String query = "SELECT cl.* FROM classe As cl JOIN insegnante As i ON i.id_classe = cl.id WHERE i.id = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Classe classe = new Classe(
                        rs.getInt("id"),
                        rs.getString("grado"),
                        rs.getString("nome_scuola")
                );
                classi.add(classe);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return classi;
    }

    @PostMapping("/materieByClasse")
    public List<Materia> getMaterieByClasse(@RequestBody Map<String, Integer> request) {
        List<Materia> materie = new ArrayList<>();
        //Gli passo l'id della classe preso dall'insegnante presente in sessione
        String query
                = "SELECT m.* "
                + // oppure specifica le colonne: m.id, m.nome
                "FROM materia AS m "
                + "JOIN classe_materia AS cm ON cm.id_materia = m.id "
                + "WHERE cm.id_classe = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idClasse"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                materie.add(new Materia(
                        rs.getInt("id"),
                        rs.getString("nome")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return materie;
    }

    @PostMapping("/macrocategorieByMateria")
    public List<Macrocategoria> getMacrocategorieByMateria(@RequestBody Map<String, Integer> request) {
        List<Macrocategoria> macrocategorie = new ArrayList<>();
        String query = "SELECT * FROM macrocategoria WHERE id_materia = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idMateria"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                macrocategorie.add(new Macrocategoria(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getInt("id_materia"),
                    rs.getString("video")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return macrocategorie;
    }

    @PostMapping("/recentiItems")
    public List<RecentiItem> getRecentiItems(@RequestBody Map<String, Integer> request) {
        List<RecentiItem> items = new ArrayList<>();
        String query = "SELECT ri.* FROM recenti_item As ri JOIN recenti as rec ON ri.id_recenti = rec.id WHERE rec.id_insegnante = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                items.add(new RecentiItem(
                    rs.getInt("id"),
                    rs.getInt("id_recenti"),
                    rs.getInt("id_macrocategoria")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    @PostMapping("/preferitiItems")
    public List<PreferitiItem> getPreferitiItems(@RequestBody Map<String, Integer> request) {
        List<PreferitiItem> items = new ArrayList<>();
        String query = "SELECT pi.* FROM preferiti_item As pi JOIN preferiti as pref ON pi.id_preferiti = pref.id WHERE pref.id_insegnante = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                items.add(new PreferitiItem(
                    rs.getInt("id"),
                    rs.getInt("id_preferiti"),
                    rs.getInt("id_macrocategoria")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    @PostMapping("/studentiByClasse")
    public List<Studente> getStudentiByClasse(@RequestBody Map<String, Integer> request) {
        List<Studente> studenti = new ArrayList<>();
        String query = "SELECT * FROM studente WHERE id_classe = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idClasse"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                studenti.add(new Studente(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("cognome"),
                    rs.getString("username"),
                    rs.getString("email"),
                    rs.getInt("id_classe"),
                    rs.getString("psw")
                ));
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

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

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

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                macrocategorie.add(rs.getString("nome"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return macrocategorie;
    }

    @PostMapping("/creaRichiestaSimulazione")
    public boolean creaRichiestaSimulazione(@RequestBody Map<String, Integer> request) {
        String queryRichiesta = "INSERT INTO richiesta_simulazione (id_macrocategoria, id_insegnante, id_classe, stato, isVideo) VALUES (?, ?, ?, 'richiesta', ?)";
        String queryStudenti = "INSERT INTO simulazione_studenti (id_studente, id_richiesta_simulazione, stato) VALUES (?, ?, 'nonIniziato')";
        
        Connection conn = null;
        PreparedStatement stmtRichiesta = null;
        PreparedStatement stmtStudenti = null;
        ResultSet generatedKeys = null;
        
        try {
            // Ottieni la connessione
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false);  // Inizia la transazione
            
            // 1. Prima creiamo la richiesta simulazione
            stmtRichiesta = conn.prepareStatement(queryRichiesta, PreparedStatement.RETURN_GENERATED_KEYS);
            stmtRichiesta.setInt(1, request.get("idMacrocategoria"));
            stmtRichiesta.setInt(2, request.get("idInsegnante"));
            stmtRichiesta.setInt(3, request.get("idClasse"));
            stmtRichiesta.setInt(4, request.get("isVideo"));
            
            int affectedRows = stmtRichiesta.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creazione richiesta simulazione fallita, nessuna riga inserita.");
            }
            
            // 2. Otteniamo l'ID della richiesta appena creata
            generatedKeys = stmtRichiesta.getGeneratedKeys();
            int idRichiestaSimulazione;
            if (generatedKeys.next()) {
                idRichiestaSimulazione = generatedKeys.getInt(1);
            } else {
                throw new SQLException("Creazione richiesta simulazione fallita, nessun ID ottenuto.");
            }
            
            // 3. Otteniamo gli studenti della classe
            List<Studente> studenti = getStudentiByClasse(request);
            if (studenti.isEmpty()) {
                throw new SQLException("Nessuno studente trovato per la classe specificata.");
            }
            
            // 4. Creiamo i record per ogni studente usando l'ID della richiesta
            stmtStudenti = conn.prepareStatement(queryStudenti);
            for (Studente studente : studenti) {
                stmtStudenti.setInt(1, studente.getId());          // Prima id_studente
                stmtStudenti.setInt(2, idRichiestaSimulazione);   // Poi id_richiesta_simulazione
                stmtStudenti.executeUpdate();
            }
            
            // Se arriviamo qui, tutto è andato bene
            conn.commit();
            return true;
            
        } catch (SQLException e) {
            // Gestione dell'errore con rollback
            if (conn != null) {
                try {
                    System.err.println("Transazione fallita. Eseguo il rollback");
                    conn.rollback();
                } catch (SQLException excep) {
                    System.err.println("Anche il rollback è fallito: " + excep.getMessage());
                }
            }
            System.err.println("Errore durante la creazione della simulazione: " + e.getMessage());
            e.printStackTrace();
            return false;
            
        } finally {
            // Chiusura di tutte le risorse in ordine inverso
            try {
                if (generatedKeys != null) generatedKeys.close();
                if (stmtStudenti != null) stmtStudenti.close();
                if (stmtRichiesta != null) stmtRichiesta.close();
                if (conn != null) {
                    conn.setAutoCommit(true);  // Ripristina l'auto-commit
                    conn.close();
                }
            } catch (SQLException e) {
                System.err.println("Errore durante la chiusura delle risorse: " + e.getMessage());
            }
        }
    }

}
