package com.futuralab.backend.controllers;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.futuralab.backend.models.RichiestaSimulazione;
import com.futuralab.backend.models.RichiestaSimulazioneRidotta;
import com.futuralab.backend.models.SommaVoti;
import com.futuralab.backend.models.Studente;
import com.futuralab.backend.models.StudenteConStato;
import com.futuralab.backend.models.MacroCategoriaPreferita;

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
    public List<MacroCategoriaPreferita> getMacrocategorieByMateria(@RequestBody Map<String, Integer> request) {
        List<MacroCategoriaPreferita> macrocategorie = new ArrayList<>();
        String query = "SELECT * FROM macrocategoria WHERE id_materia = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idMateria"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                // Verifica se la macrocategoria è tra i preferiti
                int isPreferito = verifyPreferito(request.get("idInsegnante"), rs.getInt("id"));
                
                macrocategorie.add(new MacroCategoriaPreferita(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getInt("id_materia"),
                    rs.getString("video"),
                    isPreferito
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return macrocategorie;
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
 
    @PostMapping("/macrocategoriePreferiteByInsegnante")
    public List<MacroCategoriaPreferita> getMacrocategoriePreferiteByInsegnante(@RequestBody Map<String, Integer> request) {
        List<MacroCategoriaPreferita> macrocategorie = new ArrayList<>();
        String query = "SELECT m.id, m.nome, m.id_materia, m.video " +
                      "FROM macrocategoria m " +
                      "JOIN preferiti_item pi ON pi.id_macrocategoria = m.id " +
                      "JOIN preferiti p ON p.id = pi.id_preferiti " +
                      "WHERE p.id_insegnante = ?";

        try (Connection conn = DatabaseConfig.getConnection(); 
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                macrocategorie.add(new MacroCategoriaPreferita(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getInt("id_materia"),
                    rs.getString("video"),
                    1  // È nei preferiti perché la query seleziona solo i preferiti
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return macrocategorie;
    }
    
    @PostMapping("/getPreferitiIdByInsegnante")
    public int getPreferitiIdByInsegnante(@RequestBody Map<String, Integer> request) {
        String query = "SELECT id FROM preferiti WHERE id_insegnante = ?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            } else {
                return 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
    }

    @PostMapping("/setPreferitoItem")
    public boolean setPreferitoItem(@RequestBody Map<String, Integer> request) {
        String query = "INSERT INTO preferiti_item (id_preferiti, id_macrocategoria) VALUES (?, ?)";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            int idPreferiti = getPreferitiIdByInsegnante(request);
            if (idPreferiti == 0) {
                return false;
            }
            stmt.setInt(1, idPreferiti);
            stmt.setInt(2, request.get("idMacrocategoria"));
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @PostMapping("/creaRichiestaSimulazione")
    public int creaRichiestaSimulazione(@RequestBody Map<String, Integer> request) {
        String queryRichiesta = "INSERT INTO richiesta_simulazione (id_macrocategoria, id_insegnante, id_classe, stato, isVideo, data) VALUES (?, ?, ?, 'avviato', ?, ?)";
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
            stmtRichiesta.setObject(5, LocalDateTime.now());
            
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
            return idRichiestaSimulazione;
            
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
            return 0;
            
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

    @PostMapping("/studentiConStatoSimulazione")
    public List<StudenteConStato> getStudentiConStatoSimulazione(@RequestBody Map<String, Integer> request) {
        List<StudenteConStato> studentiConStato = new ArrayList<>();
        String query = "SELECT s.id, s.nome, s.cognome, s.username, s.email, s.id_classe, ss.stato " +
                      "FROM studente s " +
                      "JOIN simulazione_studenti ss ON s.id = ss.id_studente " +
                      "WHERE s.id_classe = ? AND ss.id_richiesta_simulazione = ?";

        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, request.get("idClasse"));
            stmt.setInt(2, request.get("idRichiestaSimulazione"));
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                studentiConStato.add(new StudenteConStato(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("cognome"),
                    rs.getString("username"),
                    rs.getString("email"),
                    rs.getInt("id_classe"),
                    rs.getString("stato")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return studentiConStato;
    }

    @PostMapping("/terminaSimulazione")
    public boolean terminaSimulazione(@RequestBody Map<String, Integer> request) {
        String query = "UPDATE richiesta_simulazione SET stato = 'conclusa' WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, request.get("idRichiestaSimulazione"));
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @PostMapping("/getStatoSimulazione")
    public String getStatoSimulazione(@RequestBody Map<String, Integer> request) {
        String query = "SELECT stato FROM richiesta_simulazione WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, request.get("idRichiestaSimulazione"));
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("stato");
            } else {
                return "non trovato";
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return "errore";
        }
    }

    @PostMapping("/getValutazioniStudente")
    public SommaVoti getValutazioniStudente(@RequestBody Map<String, Integer> request) {
        String query = "SELECT " +
                      "SUM(CASE WHEN voto = 1 THEN 1 ELSE 0 END) as somma_voti_1, " +
                      "SUM(CASE WHEN voto = 2 THEN 1 ELSE 0 END) as somma_voti_2, " +
                      "SUM(CASE WHEN voto = 3 THEN 1 ELSE 0 END) as somma_voti_3 " +
                      "FROM valutazione_simulazione WHERE id_simulazione = ?";
        
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, request.get("idRichiestaSimulazione"));
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return new SommaVoti(
                    rs.getInt("somma_voti_1"),
                    rs.getInt("somma_voti_2"),
                    rs.getInt("somma_voti_3")
                );
            } else {
                return new SommaVoti(0, 0, 0);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return new SommaVoti(0, 0, 0);
        }
    }

    @PostMapping("/getRichiesteSimulazioneConcluse")
    public List<RichiestaSimulazioneRidotta> getRichiesteSimulazioneConcluse(@RequestBody Map<String, Integer> request) {
        List<RichiestaSimulazioneRidotta> richiesteSimulazione = new ArrayList<>();
        String query = "SELECT r.id, m.nome as nome_macrocategoria, r.isVideo, r.data " +
                      "FROM richiesta_simulazione r " +
                      "JOIN macrocategoria m ON r.id_macrocategoria = m.id " +
                      "WHERE r.stato = 'conclusa' AND r.id_insegnante = ?";
                      
        try (Connection conn = DatabaseConfig.getConnection(); 
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, request.get("idInsegnante"));
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                // Formatta la data nel formato richiesto
                LocalDateTime data = rs.getObject("data", LocalDateTime.class);
                String dataFormattata = data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                
                // Determina il tipo di simulazione
                String tipoSimulazione = rs.getInt("isVideo") == 1 ? "Video" : "Simulazione";
                
                richiesteSimulazione.add(new RichiestaSimulazioneRidotta(
                    rs.getInt("id"),
                    rs.getString("nome_macrocategoria"),
                    tipoSimulazione,
                    dataFormattata
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
        return richiesteSimulazione;
    }

    public int verifyPreferito(int idInsegnante, int idMacrocategoria) {
        String query = "SELECT 1 FROM preferiti_item pi " +
                      "JOIN preferiti p ON pi.id_preferiti = p.id " +
                      "WHERE p.id_insegnante = ? AND pi.id_macrocategoria = ?";
        try (Connection conn = DatabaseConfig.getConnection(); 
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            stmt.setInt(1, idInsegnante);
            stmt.setInt(2, idMacrocategoria);
            ResultSet rs = stmt.executeQuery();
            
            return rs.next() ? 1 : 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return 0;
        }
    }

    @PostMapping("/addPreferito")
    public boolean addPreferito(@RequestBody Map<String, Integer> request) {
        try (Connection conn = DatabaseConfig.getConnection()) {
            int idPreferiti = getPreferitiIdByInsegnante(request);
            if (idPreferiti <= 0) {
                return false;
            }

            // Prima verifichiamo se esiste già
            String checkQuery = "SELECT 1 FROM preferiti_item WHERE id_preferiti = ? AND id_macrocategoria = ?";
            try (PreparedStatement checkStmt = conn.prepareStatement(checkQuery)) {
                checkStmt.setInt(1, idPreferiti);
                checkStmt.setInt(2, request.get("idMacrocategoria"));
                ResultSet rs = checkStmt.executeQuery();
                if (rs.next()) {
                    // Se esiste già, restituiamo true
                    return true;
                }
            }

            // Se non esiste, lo inseriamo
            String insertQuery = "INSERT INTO preferiti_item (id_preferiti, id_macrocategoria) VALUES (?, ?)";
            try (PreparedStatement insertStmt = conn.prepareStatement(insertQuery)) {
                insertStmt.setInt(1, idPreferiti);
                insertStmt.setInt(2, request.get("idMacrocategoria"));
                insertStmt.executeUpdate();
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @PostMapping("/removePreferito")
    public boolean removePreferito(@RequestBody Map<String, Integer> request) {
        String query = "DELETE FROM preferiti_item WHERE id_preferiti = ? AND id_macrocategoria = ?";
        try (Connection conn = DatabaseConfig.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            int idPreferiti = getPreferitiIdByInsegnante(request);
            if (idPreferiti <= 0) {
                return false;
            }
            stmt.setInt(1, idPreferiti);
            stmt.setInt(2, request.get("idMacrocategoria"));
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
