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
INSERT INTO `classe_materia` VALUES (1,1),(2,1),(1,2),(2,2),(1,3),(2,3),(1,4),(2,4),(1,5),(1,6);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `macrocategoria`
--

LOCK TABLES `macrocategoria` WRITE;
/*!40000 ALTER TABLE `macrocategoria` DISABLE KEYS */;
INSERT INTO `macrocategoria` VALUES (1,'Acqua e le sue proprietà',3,'https://www.youtube.com/watch?v=LqLCknkpjqA'),(2,'Batteri e virus',3,'https://www.youtube.com/watch?v=wSeMjBeoJY8'),(3,'Ciclo di vita delle cellule',3,'https://www.youtube.com/watch?v=pOuhuWSnRTI'),(4,'Soluzioni acide e basiche',3,'https://www.youtube.com/watch?v=WIRoDrrGPx4');
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
INSERT INTO `materia` VALUES (1,'Corpo umano'),(2,'Universo'),(3,'Chimica e biologia'),(4,'Animali e piantee'),(5,'Stelle'),(6,'Boh');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferiti_item`
--

LOCK TABLES `preferiti_item` WRITE;
/*!40000 ALTER TABLE `preferiti_item` DISABLE KEYS */;
INSERT INTO `preferiti_item` VALUES (2,1,2),(4,2,2),(6,4,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `richiesta_simulazione`
--

LOCK TABLES `richiesta_simulazione` WRITE;
/*!40000 ALTER TABLE `richiesta_simulazione` DISABLE KEYS */;
INSERT INTO `richiesta_simulazione` VALUES (27,1,1,'conclusa',1,1,'2025-07-26 01:09:33.024978'),(28,2,1,'conclusa',1,0,'2025-07-26 01:16:42.519681');
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
INSERT INTO `simulazione_studenti` VALUES (1,27,'finito'),(1,28,'nonIniziato'),(2,27,'inCorso'),(2,28,'nonIniziato'),(3,27,'nonIniziato'),(3,28,'nonIniziato'),(4,27,'nonIniziato'),(4,28,'nonIniziato'),(5,27,'nonIniziato'),(5,28,'nonIniziato'),(6,27,'nonIniziato'),(6,28,'nonIniziato'),(7,27,'nonIniziato'),(7,28,'nonIniziato'),(8,27,'nonIniziato'),(8,28,'nonIniziato'),(9,27,'nonIniziato'),(9,28,'nonIniziato'),(10,27,'nonIniziato'),(10,28,'nonIniziato'),(11,27,'nonIniziato'),(11,28,'nonIniziato'),(12,27,'nonIniziato'),(12,28,'nonIniziato'),(13,27,'nonIniziato'),(13,28,'nonIniziato'),(14,27,'nonIniziato'),(14,28,'nonIniziato'),(15,27,'nonIniziato'),(15,28,'nonIniziato'),(16,27,'nonIniziato'),(16,28,'nonIniziato'),(17,27,'nonIniziato'),(17,28,'nonIniziato'),(18,27,'nonIniziato'),(18,28,'nonIniziato'),(19,27,'nonIniziato'),(19,28,'nonIniziato'),(20,27,'nonIniziato'),(20,28,'nonIniziato');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valutazione_simulazione`
--

LOCK TABLES `valutazione_simulazione` WRITE;
/*!40000 ALTER TABLE `valutazione_simulazione` DISABLE KEYS */;
INSERT INTO `valutazione_simulazione` VALUES (18,1,27,'3'),(19,2,27,'2'),(20,3,27,'1'),(21,3,27,'2');
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

-- Dump completed on 2025-07-26  3:26:38
