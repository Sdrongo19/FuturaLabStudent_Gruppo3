CREATE DATABASE  IF NOT EXISTS `futuralab` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `futuralab`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: futuralab
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `classe`
--

DROP TABLE IF EXISTS `classe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grado` enum('1','2') NOT NULL,
  `nome_scuola` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classe`
--

LOCK TABLES `classe` WRITE;
/*!40000 ALTER TABLE `classe` DISABLE KEYS */;
INSERT INTO `classe` VALUES (1,'1','Tommaso D\'Aquino'),(2,'2','Medaglie D\'Oro');
/*!40000 ALTER TABLE `classe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classe_materia`
--

DROP TABLE IF EXISTS `classe_materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classe_materia` (
  `id_classe` int NOT NULL,
  `id_materia` int NOT NULL,
  PRIMARY KEY (`id_classe`,`id_materia`),
  KEY `materia_idx` (`id_materia`),
  CONSTRAINT `classe2` FOREIGN KEY (`id_classe`) REFERENCES `classe` (`id`),
  CONSTRAINT `materia` FOREIGN KEY (`id_materia`) REFERENCES `materia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classe_materia`
--

LOCK TABLES `classe_materia` WRITE;
/*!40000 ALTER TABLE `classe_materia` DISABLE KEYS */;
INSERT INTO `classe_materia` VALUES (1,1),(2,1),(1,2),(2,2),(1,3),(2,3),(1,4),(2,4);
/*!40000 ALTER TABLE `classe_materia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insegnante`
--

DROP TABLE IF EXISTS `insegnante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insegnante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(64) NOT NULL,
  `cognome` varchar(64) NOT NULL,
  `username` varchar(32) NOT NULL,
  `email` varchar(32) NOT NULL,
  `psw` varchar(256) NOT NULL,
  `id_classe` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `classe` (`id_classe`),
  CONSTRAINT `classe` FOREIGN KEY (`id_classe`) REFERENCES `classe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insegnante`
--

LOCK TABLES `insegnante` WRITE;
/*!40000 ALTER TABLE `insegnante` DISABLE KEYS */;
INSERT INTO `insegnante` VALUES (1,'Emma','Watson','H.watson','h.watson@gmail.com','12345678',1),(2,'Niccolò','Morriconi','ultimo','ultimo22@gmail.com','12345678',2);
/*!40000 ALTER TABLE `insegnante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `macrocategoria`
--

DROP TABLE IF EXISTS `macrocategoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `macrocategoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(64) NOT NULL,
  `id_materia` int NOT NULL,
  `video` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `macro_materia_idx` (`id_materia`),
  CONSTRAINT `macro_materia` FOREIGN KEY (`id_materia`) REFERENCES `materia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `macrocategoria`
--

LOCK TABLES `macrocategoria` WRITE;
/*!40000 ALTER TABLE `macrocategoria` DISABLE KEYS */;
INSERT INTO `macrocategoria` VALUES (1,'Acqua e le sue proprietà',3,'https://www.youtube.com/watch?v=LqLCknkpjqA'),(2,'Batteri e virus',3,'https://www.youtube.com/watch?v=wSeMjBeoJY8'),(3,'Ciclo di vita delle cellule',3,'https://www.youtube.com/watch?v=pOuhuWSnRTI'),(4,'Soluzioni acide e basiche',3,'https://www.youtube.com/watch?v=WIRoDrrGPx4'),(5,'Le Ossa',1,'https://youtu.be/0uSauOFLyTM?si=ZWbbUfVYkqQnYBQ8'),(6,'L\'apparato digerente',1,'https://youtu.be/nnde_b89qp8?si=px1izVvO7Hx5qfU6'),(7,'Il sistema nervoso',1,'https://youtu.be/pnY5-VuECd4?si=6X3dhw5x2fl64T67'),(8,'L\'occhio',1,'https://youtu.be/CmvPu4cy6Zc?si=jPiYQTNI5ufWTINt'),(9,'Il sistema solare',2,'https://youtu.be/A9bEEiXWYEc?si=52h_hkkh_M_nWn9Q'),(10,'La terra',2,'https://youtu.be/h9Jsa_3edKE?si=xtg4wfLTTokxtfXC'),(11,'La luna',2,'https://youtu.be/pdOzAzA6SfQ?si=6I3ViWNo6AFetLYQ'),(12,'Le eclissi',2,'https://youtu.be/Fv56Nk2kpqU?si=vcdV-NwOoywHxU2j'),(13,'Esseri viventi',4,'https://youtu.be/H0lZian9phc?si=0gWgzBxN4fBI6pCp'),(14,'Piante e fotosintesi',4,'https://youtu.be/mkhfLAm85sU?si=nbnbqWqnMemftEoy'),(15,'Funzioni vitali',4,'https://youtu.be/D0vayNKIGx0?si=3S1ee2wgwKKE35r-'),(16,'Habitat',4,'https://youtu.be/yQHgI5G_Ogc?si=TPH9QrIJ0Xpt7nLu');
/*!40000 ALTER TABLE `macrocategoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materia`
--

DROP TABLE IF EXISTS `materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materia`
--

LOCK TABLES `materia` WRITE;
/*!40000 ALTER TABLE `materia` DISABLE KEYS */;
INSERT INTO `materia` VALUES (1,'Corpo umano'),(2,'Universo'),(3,'Chimica e biologia'),(4,'Animali e piante');
/*!40000 ALTER TABLE `materia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferiti`
--

DROP TABLE IF EXISTS `preferiti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferiti` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_insegnante` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `insegnante_idx` (`id_insegnante`),
  CONSTRAINT `insegnante_pref` FOREIGN KEY (`id_insegnante`) REFERENCES `insegnante` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferiti`
--

LOCK TABLES `preferiti` WRITE;
/*!40000 ALTER TABLE `preferiti` DISABLE KEYS */;
INSERT INTO `preferiti` VALUES (1,1),(2,2);
/*!40000 ALTER TABLE `preferiti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferiti_item`
--

DROP TABLE IF EXISTS `preferiti_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferiti_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_macrocategoria` int NOT NULL,
  `id_preferiti` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pref_item_idx` (`id_preferiti`),
  KEY `pref_macro_idx` (`id_macrocategoria`),
  CONSTRAINT `pref_item` FOREIGN KEY (`id_preferiti`) REFERENCES `preferiti` (`id`),
  CONSTRAINT `pref_macro` FOREIGN KEY (`id_macrocategoria`) REFERENCES `macrocategoria` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferiti_item`
--

LOCK TABLES `preferiti_item` WRITE;
/*!40000 ALTER TABLE `preferiti_item` DISABLE KEYS */;
INSERT INTO `preferiti_item` VALUES (2,1,2),(4,2,2),(6,4,2),(9,3,1),(11,4,1);
/*!40000 ALTER TABLE `preferiti_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `richiesta_simulazione`
--

DROP TABLE IF EXISTS `richiesta_simulazione`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `richiesta_simulazione` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_macrocategoria` int NOT NULL,
  `id_insegnante` int NOT NULL,
  `stato` enum('richiesta','avviato','conclusa') NOT NULL DEFAULT 'richiesta',
  `id_classe` int NOT NULL,
  `isVideo` tinyint(1) NOT NULL DEFAULT '0',
  `data` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `macro_simulazione_idx` (`id_macrocategoria`),
  KEY `insegnante_simulazione_idx` (`id_insegnante`),
  KEY `classe_simulazione_idx` (`id_classe`),
  CONSTRAINT `classe_simulazione` FOREIGN KEY (`id_classe`) REFERENCES `classe` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `insegnante_simulazione` FOREIGN KEY (`id_insegnante`) REFERENCES `insegnante` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `macro_simulazione` FOREIGN KEY (`id_macrocategoria`) REFERENCES `macrocategoria` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `richiesta_simulazione`
--

LOCK TABLES `richiesta_simulazione` WRITE;
/*!40000 ALTER TABLE `richiesta_simulazione` DISABLE KEYS */;
INSERT INTO `richiesta_simulazione` VALUES (61,3,1,'conclusa',1,1,'2025-07-28 00:22:43.579178'),(62,1,1,'conclusa',1,1,'2025-07-28 00:51:03.717817'),(63,10,1,'conclusa',1,1,'2025-07-28 00:55:42.292084'),(64,13,1,'conclusa',1,1,'2025-07-28 01:20:43.554649'),(65,11,1,'conclusa',1,1,'2025-07-28 01:56:33.481784'),(66,4,1,'conclusa',1,0,'2025-07-28 02:07:44.900536'),(67,1,1,'conclusa',1,1,'2025-07-28 02:08:25.974853'),(68,4,1,'avviato',1,0,'2025-07-28 02:12:02.123749'),(69,4,1,'conclusa',1,0,'2025-07-28 19:40:35.870631');
/*!40000 ALTER TABLE `richiesta_simulazione` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `simulazione_studenti`
--

DROP TABLE IF EXISTS `simulazione_studenti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `simulazione_studenti` (
  `id_studente` int NOT NULL AUTO_INCREMENT,
  `id_richiesta_simulazione` int NOT NULL,
  `stato` enum('nonIniziato','inCorso','finito') NOT NULL DEFAULT 'nonIniziato',
  PRIMARY KEY (`id_studente`,`id_richiesta_simulazione`),
  KEY `sim_idx` (`id_richiesta_simulazione`),
  CONSTRAINT `sim` FOREIGN KEY (`id_richiesta_simulazione`) REFERENCES `richiesta_simulazione` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `studente` FOREIGN KEY (`id_studente`) REFERENCES `studente` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `simulazione_studenti`
--

LOCK TABLES `simulazione_studenti` WRITE;
/*!40000 ALTER TABLE `simulazione_studenti` DISABLE KEYS */;
INSERT INTO `simulazione_studenti` VALUES (1,61,'inCorso'),(1,62,'inCorso'),(1,63,'inCorso'),(1,64,'finito'),(1,65,'nonIniziato'),(1,66,'inCorso'),(1,67,'finito'),(1,68,'inCorso'),(1,69,'nonIniziato'),(2,61,'nonIniziato'),(2,62,'nonIniziato'),(2,63,'nonIniziato'),(2,64,'nonIniziato'),(2,65,'nonIniziato'),(2,66,'nonIniziato'),(2,67,'nonIniziato'),(2,68,'nonIniziato'),(2,69,'nonIniziato'),(3,61,'nonIniziato'),(3,62,'nonIniziato'),(3,63,'nonIniziato'),(3,64,'nonIniziato'),(3,65,'nonIniziato'),(3,66,'nonIniziato'),(3,67,'nonIniziato'),(3,68,'nonIniziato'),(3,69,'nonIniziato'),(4,61,'nonIniziato'),(4,62,'nonIniziato'),(4,63,'nonIniziato'),(4,64,'nonIniziato'),(4,65,'nonIniziato'),(4,66,'nonIniziato'),(4,67,'nonIniziato'),(4,68,'nonIniziato'),(4,69,'nonIniziato'),(5,61,'nonIniziato'),(5,62,'nonIniziato'),(5,63,'nonIniziato'),(5,64,'nonIniziato'),(5,65,'nonIniziato'),(5,66,'nonIniziato'),(5,67,'nonIniziato'),(5,68,'nonIniziato'),(5,69,'nonIniziato'),(6,61,'nonIniziato'),(6,62,'nonIniziato'),(6,63,'nonIniziato'),(6,64,'nonIniziato'),(6,65,'nonIniziato'),(6,66,'nonIniziato'),(6,67,'nonIniziato'),(6,68,'nonIniziato'),(6,69,'nonIniziato'),(7,61,'nonIniziato'),(7,62,'nonIniziato'),(7,63,'nonIniziato'),(7,64,'nonIniziato'),(7,65,'nonIniziato'),(7,66,'nonIniziato'),(7,67,'nonIniziato'),(7,68,'nonIniziato'),(7,69,'nonIniziato'),(8,61,'nonIniziato'),(8,62,'nonIniziato'),(8,63,'nonIniziato'),(8,64,'nonIniziato'),(8,65,'nonIniziato'),(8,66,'nonIniziato'),(8,67,'nonIniziato'),(8,68,'nonIniziato'),(8,69,'nonIniziato'),(9,61,'nonIniziato'),(9,62,'nonIniziato'),(9,63,'nonIniziato'),(9,64,'nonIniziato'),(9,65,'nonIniziato'),(9,66,'nonIniziato'),(9,67,'nonIniziato'),(9,68,'nonIniziato'),(9,69,'nonIniziato'),(10,61,'nonIniziato'),(10,62,'nonIniziato'),(10,63,'nonIniziato'),(10,64,'nonIniziato'),(10,65,'nonIniziato'),(10,66,'nonIniziato'),(10,67,'nonIniziato'),(10,68,'nonIniziato'),(10,69,'nonIniziato'),(11,61,'nonIniziato'),(11,62,'nonIniziato'),(11,63,'nonIniziato'),(11,64,'nonIniziato'),(11,65,'nonIniziato'),(11,66,'nonIniziato'),(11,67,'nonIniziato'),(11,68,'nonIniziato'),(11,69,'nonIniziato'),(12,61,'nonIniziato'),(12,62,'nonIniziato'),(12,63,'nonIniziato'),(12,64,'nonIniziato'),(12,65,'nonIniziato'),(12,66,'nonIniziato'),(12,67,'nonIniziato'),(12,68,'nonIniziato'),(12,69,'nonIniziato'),(13,61,'nonIniziato'),(13,62,'nonIniziato'),(13,63,'nonIniziato'),(13,64,'nonIniziato'),(13,65,'nonIniziato'),(13,66,'nonIniziato'),(13,67,'nonIniziato'),(13,68,'nonIniziato'),(13,69,'nonIniziato'),(14,61,'nonIniziato'),(14,62,'nonIniziato'),(14,63,'nonIniziato'),(14,64,'nonIniziato'),(14,65,'nonIniziato'),(14,66,'nonIniziato'),(14,67,'nonIniziato'),(14,68,'nonIniziato'),(14,69,'nonIniziato'),(15,61,'nonIniziato'),(15,62,'nonIniziato'),(15,63,'nonIniziato'),(15,64,'nonIniziato'),(15,65,'nonIniziato'),(15,66,'nonIniziato'),(15,67,'nonIniziato'),(15,68,'nonIniziato'),(15,69,'nonIniziato'),(16,61,'nonIniziato'),(16,62,'nonIniziato'),(16,63,'nonIniziato'),(16,64,'nonIniziato'),(16,65,'nonIniziato'),(16,66,'nonIniziato'),(16,67,'nonIniziato'),(16,68,'nonIniziato'),(16,69,'nonIniziato'),(17,61,'nonIniziato'),(17,62,'nonIniziato'),(17,63,'nonIniziato'),(17,64,'nonIniziato'),(17,65,'nonIniziato'),(17,66,'nonIniziato'),(17,67,'nonIniziato'),(17,68,'nonIniziato'),(17,69,'nonIniziato'),(18,61,'nonIniziato'),(18,62,'nonIniziato'),(18,63,'nonIniziato'),(18,64,'nonIniziato'),(18,65,'nonIniziato'),(18,66,'nonIniziato'),(18,67,'nonIniziato'),(18,68,'nonIniziato'),(18,69,'nonIniziato'),(19,61,'nonIniziato'),(19,62,'nonIniziato'),(19,63,'nonIniziato'),(19,64,'nonIniziato'),(19,65,'nonIniziato'),(19,66,'nonIniziato'),(19,67,'nonIniziato'),(19,68,'nonIniziato'),(19,69,'nonIniziato'),(20,61,'nonIniziato'),(20,62,'nonIniziato'),(20,63,'nonIniziato'),(20,64,'nonIniziato'),(20,65,'nonIniziato'),(20,66,'nonIniziato'),(20,67,'nonIniziato'),(20,68,'nonIniziato'),(20,69,'nonIniziato');
/*!40000 ALTER TABLE `simulazione_studenti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studente`
--

DROP TABLE IF EXISTS `studente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(64) NOT NULL,
  `cognome` varchar(64) NOT NULL,
  `username` varchar(32) NOT NULL,
  `email` varchar(32) NOT NULL,
  `id_classe` int NOT NULL,
  `psw` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `classe_studenti_idx` (`id_classe`),
  CONSTRAINT `classe_studenti` FOREIGN KEY (`id_classe`) REFERENCES `classe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studente`
--

LOCK TABLES `studente` WRITE;
/*!40000 ALTER TABLE `studente` DISABLE KEYS */;
INSERT INTO `studente` VALUES (1,'Luca','Rossi','lrossi','luca.rossi@example.it',1,'12345678'),(2,'Giulia','Bianchi','gbianchi','giulia.bianchi@example.it',1,'12345678'),(3,'Marco','Verdi','mverdi','marco.verdi@example.it',1,'12345678'),(4,'Elena','Ferrari','eferrari','elena.ferrari@example.it',1,'12345678'),(5,'Alessia','Conti','aconti','alessia.conti@example.it',1,'12345678'),(6,'Paolo','Esposito','pesposito','paolo.esposito@example.it',1,'12345678'),(7,'Federica','Moretti','fmoretti','federica.moretti@example.it',1,'12345678'),(8,'Simone','Rinaldi','srinaldi','simone.rinaldi@example.it',1,'12345678'),(9,'Sofia','Gatti','sgatti','sofia.gatti@example.it',1,'12345678'),(10,'Andrea','Marchetti','amarchetti','andrea.marchetti@example.it',1,'12345678'),(11,'Davide','Gallo','dgallo','davide.gallo@example.it',1,'12345678'),(12,'Sara','Romano','sromano','sara.romano@example.it',1,'12345678'),(13,'Matteo','Greco','mgreco','matteo.greco@example.it',1,'12345678'),(14,'Chiara','Costa','ccosta','chiara.costa@example.it',1,'12345678'),(15,'Francesco','Longo','flongo','francesco.longo@example.it',1,'12345678'),(16,'Martina','Deluca','mdeluca','martina.deluca@example.it',1,'12345678'),(17,'Filippo','Testa','ftesta','filippo.testa@example.it',1,'12345678'),(18,'Laura','Serra','lserra','laura.serra@example.it',1,'12345678'),(19,'Riccardo','Fontana','rfontana','riccardo.fontana@example.it',1,'12345678'),(20,'Valentina','Leone','vleone','valentina.leone@example.it',1,'12345678');
/*!40000 ALTER TABLE `studente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valutazione_simulazione`
--

DROP TABLE IF EXISTS `valutazione_simulazione`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valutazione_simulazione` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_studente` int NOT NULL,
  `id_simulazione` int NOT NULL,
  `voto` enum('1','2','3') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stud_idx` (`id_studente`),
  KEY `simulazione_idx` (`id_simulazione`),
  CONSTRAINT `simulazione` FOREIGN KEY (`id_simulazione`) REFERENCES `richiesta_simulazione` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stud` FOREIGN KEY (`id_studente`) REFERENCES `studente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valutazione_simulazione`
--

LOCK TABLES `valutazione_simulazione` WRITE;
/*!40000 ALTER TABLE `valutazione_simulazione` DISABLE KEYS */;
INSERT INTO `valutazione_simulazione` VALUES (34,1,61,'3'),(35,1,61,'3'),(36,1,61,'3'),(37,1,61,'3'),(38,1,62,'3'),(39,1,63,'3'),(40,1,64,'3'),(41,1,67,'3');
/*!40000 ALTER TABLE `valutazione_simulazione` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-28 20:18:30
