CREATE DATABASE  IF NOT EXISTS `futuralab` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `futuralab`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: futuralab
-- ------------------------------------------------------
-- Server version	8.0.42

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materia`
--

LOCK TABLES `materia` WRITE;
/*!40000 ALTER TABLE `materia` DISABLE KEYS */;
INSERT INTO `materia` VALUES (1,'Corpo umano'),(2,'Universo'),(3,'Chimica e biologia'),(4,'Animali e piant');
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
INSERT INTO `preferiti_item` VALUES (1,1,1),(2,1,2),(3,2,1),(4,2,2),(5,3,1),(6,4,2);
/*!40000 ALTER TABLE `preferiti_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recenti`
--

DROP TABLE IF EXISTS `recenti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recenti` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_insegnante` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recenti_insengnante_idx` (`id_insegnante`),
  CONSTRAINT `recenti_insengnante` FOREIGN KEY (`id_insegnante`) REFERENCES `insegnante` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recenti`
--

LOCK TABLES `recenti` WRITE;
/*!40000 ALTER TABLE `recenti` DISABLE KEYS */;
INSERT INTO `recenti` VALUES (1,1),(2,2);
/*!40000 ALTER TABLE `recenti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recenti_item`
--

DROP TABLE IF EXISTS `recenti_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recenti_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_recenti` int NOT NULL,
  `id_macrocategoria` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recenti_items_idx` (`id_recenti`),
  KEY `recenti_macro_idx` (`id_macrocategoria`),
  CONSTRAINT `recenti_items` FOREIGN KEY (`id_recenti`) REFERENCES `recenti` (`id`),
  CONSTRAINT `recenti_macro` FOREIGN KEY (`id_macrocategoria`) REFERENCES `macrocategoria` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recenti_item`
--

LOCK TABLES `recenti_item` WRITE;
/*!40000 ALTER TABLE `recenti_item` DISABLE KEYS */;
INSERT INTO `recenti_item` VALUES (1,1,1),(2,1,2),(3,1,3);
/*!40000 ALTER TABLE `recenti_item` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `macro_simulazione_idx` (`id_macrocategoria`),
  KEY `insegnante_simulazione_idx` (`id_insegnante`),
  KEY `classe_simulazione_idx` (`id_classe`),
  CONSTRAINT `classe_simulazione` FOREIGN KEY (`id_classe`) REFERENCES `classe` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `insegnante_simulazione` FOREIGN KEY (`id_insegnante`) REFERENCES `insegnante` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `macro_simulazione` FOREIGN KEY (`id_macrocategoria`) REFERENCES `macrocategoria` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `richiesta_simulazione`
--

LOCK TABLES `richiesta_simulazione` WRITE;
/*!40000 ALTER TABLE `richiesta_simulazione` DISABLE KEYS */;
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
  CONSTRAINT `sim` FOREIGN KEY (`id_richiesta_simulazione`) REFERENCES `richiesta_simulazione` (`id`),
  CONSTRAINT `studente` FOREIGN KEY (`id_studente`) REFERENCES `studente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `simulazione_studenti`
--

LOCK TABLES `simulazione_studenti` WRITE;
/*!40000 ALTER TABLE `simulazione_studenti` DISABLE KEYS */;
/*!40000 ALTER TABLE `simulazione_studenti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studenti`
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
-- Dumping data for table `studenti`
--

LOCK TABLES `studente` WRITE;
/*!40000 ALTER TABLE `studente` DISABLE KEYS */;
INSERT INTO `studente` VALUES (1,'Luca','Rossi','lrossi','luca.rossi@example.it',1,'12345678'),(2,'Giulia','Bianchi','gbianchi','giulia.bianchi@example.it',1,'12345678'),(3,'Marco','Verdi','mverdi','marco.verdi@example.it',1,'12345678'),(4,'Elena','Ferrari','eferrari','elena.ferrari@example.it',1,'12345678'),(5,'Alessia','Conti','aconti','alessia.conti@example.it',1,'12345678'),(6,'Paolo','Esposito','pesposito','paolo.esposito@example.it',1,'12345678'),(7,'Federica','Moretti','fmoretti','federica.moretti@example.it',1,'12345678'),(8,'Simone','Rinaldi','srinaldi','simone.rinaldi@example.it',1,'12345678'),(9,'Sofia','Gatti','sgatti','sofia.gatti@example.it',1,'12345678'),(10,'Andrea','Marchetti','amarchetti','andrea.marchetti@example.it',1,'12345678'),(11,'Davide','Gallo','dgallo','davide.gallo@example.it',2,'12345678'),(12,'Sara','Romano','sromano','sara.romano@example.it',2,'12345678'),(13,'Matteo','Greco','mgreco','matteo.greco@example.it',2,'12345678'),(14,'Chiara','Costa','ccosta','chiara.costa@example.it',2,'12345678'),(15,'Francesco','Longo','flongo','francesco.longo@example.it',2,'12345678'),(16,'Martina','Deluca','mdeluca','martina.deluca@example.it',2,'12345678'),(17,'Filippo','Testa','ftesta','filippo.testa@example.it',2,'12345678'),(18,'Laura','Serra','lserra','laura.serra@example.it',2,'12345678'),(19,'Riccardo','Fontana','rfontana','riccardo.fontana@example.it',2,'12345678'),(20,'Valentina','Leone','vleone','valentina.leone@example.it',2,'12345678');
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
  CONSTRAINT `simulazione` FOREIGN KEY (`id_simulazione`) REFERENCES `richiesta_simulazione` (`id`),
  CONSTRAINT `stud` FOREIGN KEY (`id_studente`) REFERENCES `studente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valutazione_simulazione`
--

LOCK TABLES `valutazione_simulazione` WRITE;
/*!40000 ALTER TABLE `valutazione_simulazione` DISABLE KEYS */;
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

-- Dump completed on 2025-07-14 18:19:42
