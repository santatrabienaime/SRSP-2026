/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-13.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: srsp_db
-- ------------------------------------------------------
-- Server version	13.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `actes`
--

DROP TABLE IF EXISTS `actes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `actes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `type_acte_id` int(11) NOT NULL,
  `annee` smallint(5) NOT NULL,
  `date_acte` date NOT NULL,
  `objet` varchar(255) NOT NULL,
  `destinataire` varchar(150) DEFAULT NULL,
  `expediteur` varchar(150) DEFAULT NULL,
  `dossier_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `statut` varchar(20) NOT NULL DEFAULT 'ENREGISTRE',
  `observations` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_acte_numero` (`numero`),
  KEY `idx_acte_type` (`type_acte_id`),
  KEY `idx_acte_annee` (`annee`),
  KEY `idx_acte_dossier` (`dossier_id`),
  KEY `idx_acte_date` (`date_acte`),
  KEY `idx_acte_statut` (`statut`),
  KEY `fk_acte_division` (`division_id`),
  KEY `fk_acte_auteur` (`created_by`),
  CONSTRAINT `fk_acte_auteur` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_acte_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_acte_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_acte_type` FOREIGN KEY (`type_acte_id`) REFERENCES `types_actes` (`id`),
  CONSTRAINT `ck_acte_statut` CHECK (`statut` in ('ENREGISTRE','ANNULE'))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `actes` WRITE;
/*!40000 ALTER TABLE `actes` DISABLE KEYS */;
/*!40000 ALTER TABLE `actes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `affectations`
--

DROP TABLE IF EXISTS `affectations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `affectations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `division_id` int(11) DEFAULT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `motif` text DEFAULT NULL,
  `date_affectation` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `division_id` (`division_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affectations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `affectations` WRITE;
/*!40000 ALTER TABLE `affectations` DISABLE KEYS */;
INSERT INTO `affectations` VALUES
(55,2,NULL,13,NULL,'2026-10-05 08:14:13'),
(56,54,1,7,'Affectation automatique à la création du dossier.','2026-10-06 11:56:07'),
(57,55,3,11,'Affectation automatique à la création du dossier.','2026-10-06 12:29:41'),
(58,56,2,9,'Affectation automatique à la création du dossier.','2026-10-06 12:31:18'),
(59,57,4,13,'Affectation automatique à la création du dossier.','2026-10-06 12:32:24');
/*!40000 ALTER TABLE `affectations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `matricule` varchar(50) DEFAULT NULL,
  `fonction_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `user_id` (`user_id`),
  KEY `fonction_id` (`fonction_id`),
  KEY `division_id` (`division_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`fonction_id`) REFERENCES `fonctions` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES
(1,1,'SRSP','Admin','SRSP-001',1,NULL,'admin@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(2,2,'SRSP','Chef Service','SRSP-002',1,NULL,'chefservice@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(3,3,'SRSP','Chef Baaf','SRSP-003',2,NULL,'chefbaaf@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(4,4,'SRSP','Coordinatrice','SRSP-004',3,NULL,'coordinatrice@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(5,5,'SRSP','Secretaire','SRSP-005',4,NULL,'secretaire@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(6,6,'Visas','Chef Visa','SRSP-006',5,1,'chef.visa@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(7,7,'Visas','Verif Visa','SRSP-007',6,1,'verif.visa@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(8,8,'Solde','Chef Solde','SRSP-008',5,2,'chef.solde@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(9,9,'Solde','Verif Solde','SRSP-009',6,2,'verif.solde@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(10,10,'Pensions','Chef Pension','SRSP-010',5,3,'chef.pension@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(11,11,'Pensions','Liquidateur','SRSP-011',7,3,'liquidateur@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(12,12,'Secours','Chef Secours','SRSP-012',5,4,'chef.secours@srsp.mg',NULL,1,'2026-10-05 07:24:42'),
(13,13,'Secours','Charge Secours','SRSP-013',8,4,'charge.secours@srsp.mg',NULL,1,'2026-10-05 07:24:42');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `antennes`
--

DROP TABLE IF EXISTS `antennes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `antennes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `libelle` varchar(100) NOT NULL,
  `siege` tinyint(1) NOT NULL DEFAULT 0,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_antenne_code` (`code`),
  UNIQUE KEY `uk_antenne_siege_unique` (`siege`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `antennes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `antennes` WRITE;
/*!40000 ALTER TABLE `antennes` DISABLE KEYS */;
INSERT INTO `antennes` VALUES
(1,'MANANJARY','Antenne Mananjary',0,1,'2026-10-05 07:24:41'),
(2,'MANAKARA','Antenne Manakara',1,1,'2026-10-05 07:24:41');
/*!40000 ALTER TABLE `antennes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `archives`
--

DROP TABLE IF EXISTS `archives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `archives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `date_archivage` timestamp NULL DEFAULT current_timestamp(),
  `archive_par` int(11) DEFAULT NULL,
  `motif` text DEFAULT NULL,
  `restaure` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_archives_dossier` (`dossier_id`),
  KEY `archive_par` (`archive_par`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`archive_par`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archives`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `archives` WRITE;
/*!40000 ALTER TABLE `archives` DISABLE KEYS */;
INSERT INTO `archives` VALUES
(1,2,'2026-10-05 08:14:45',1,'Archivage automatique',1),
(2,1,'2026-10-06 06:16:45',1,'Archivage automatique',0);
/*!40000 ALTER TABLE `archives` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cachets_mandatement`
--

DROP TABLE IF EXISTS `cachets_mandatement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cachets_mandatement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mandatement_id` int(11) NOT NULL,
  `cache_par` int(11) NOT NULL,
  `date_cachet` date NOT NULL,
  `titre_ordonnateur` varchar(200) NOT NULL,
  `nom_ordonnateur` varchar(150) NOT NULL,
  `observations` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cachet_mandatement` (`mandatement_id`),
  KEY `fk_cachet_user` (`cache_par`),
  CONSTRAINT `fk_cachet_mandatement` FOREIGN KEY (`mandatement_id`) REFERENCES `mandatements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cachet_user` FOREIGN KEY (`cache_par`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cachets_mandatement`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cachets_mandatement` WRITE;
/*!40000 ALTER TABLE `cachets_mandatement` DISABLE KEYS */;
/*!40000 ALTER TABLE `cachets_mandatement` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `commentaire_mentions`
--

DROP TABLE IF EXISTS `commentaire_mentions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commentaire_mentions` (
  `commentaire_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`commentaire_id`,`user_id`),
  KEY `idx_mention_user` (`user_id`),
  CONSTRAINT `fk_mention_commentaire` FOREIGN KEY (`commentaire_id`) REFERENCES `dossier_commentaires` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mention_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentaire_mentions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `commentaire_mentions` WRITE;
/*!40000 ALTER TABLE `commentaire_mentions` DISABLE KEYS */;
/*!40000 ALTER TABLE `commentaire_mentions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `compteurs_numerotation`
--

DROP TABLE IF EXISTS `compteurs_numerotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `compteurs_numerotation` (
  `cle` varchar(60) NOT NULL,
  `valeur` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compteurs_numerotation`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `compteurs_numerotation` WRITE;
/*!40000 ALTER TABLE `compteurs_numerotation` DISABLE KEYS */;
INSERT INTO `compteurs_numerotation` VALUES
('DOSSIER-1-2026',2,'2026-10-06 11:56:07'),
('DOSSIER-2-2026',1,'2026-10-06 12:31:18'),
('DOSSIER-3-2026',1,'2026-10-06 12:29:40'),
('DOSSIER-4-2026',12,'2026-10-06 12:32:24'),
('IMMATRICULATION',0,'2026-10-05 07:24:41');
/*!40000 ALTER TABLE `compteurs_numerotation` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `controles_decompte`
--

DROP TABLE IF EXISTS `controles_decompte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `controles_decompte` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `controleur_id` int(11) DEFAULT NULL,
  `decision` enum('APPROUVE','RETOURNE') NOT NULL,
  `calculs_verifies` tinyint(1) NOT NULL DEFAULT 0,
  `pieces_justificatives` tinyint(1) NOT NULL DEFAULT 0,
  `certificat_cessation` tinyint(1) NOT NULL DEFAULT 0,
  `observation` text DEFAULT NULL,
  `date_controle` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_controle_dossier` (`dossier_id`),
  KEY `fk_controle_agent` (`controleur_id`),
  CONSTRAINT `fk_controle_agent` FOREIGN KEY (`controleur_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_controle_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `controles_decompte`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `controles_decompte` WRITE;
/*!40000 ALTER TABLE `controles_decompte` DISABLE KEYS */;
/*!40000 ALTER TABLE `controles_decompte` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `correspondances`
--

DROP TABLE IF EXISTS `correspondances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `correspondances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) DEFAULT NULL,
  `type` enum('LETTRE_PRESCRIPTION','DEMANDE_DOSSIERE_MERE','OPPOSITION_PENSION_ALIMENTAIRE','OPPOSITION_CESSION_VOLONTAIRE','OPPOSITION_SAISIE_ARRET') NOT NULL,
  `destinataire` varchar(150) NOT NULL,
  `objet` varchar(200) NOT NULL,
  `contenu` text DEFAULT NULL,
  `etat` enum('BROUILLON','ENVOYEE') NOT NULL DEFAULT 'BROUILLON',
  `date_envoi` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_correspondance_dossier` (`dossier_id`),
  KEY `idx_correspondance_type` (`type`),
  KEY `fk_correspondance_auteur` (`created_by`),
  CONSTRAINT `fk_correspondance_auteur` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_correspondance_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `correspondances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `correspondances` WRITE;
/*!40000 ALTER TABLE `correspondances` DISABLE KEYS */;
/*!40000 ALTER TABLE `correspondances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `courriers`
--

DROP TABLE IF EXISTS `courriers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `courriers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `sens` enum('ENTRANT','SORTANT') NOT NULL,
  `expediteur` varchar(150) DEFAULT NULL,
  `destinataire` varchar(150) DEFAULT NULL,
  `objet` text NOT NULL,
  `division_id` int(11) DEFAULT NULL,
  `statut` varchar(50) DEFAULT 'RECU',
  `document_id` int(11) DEFAULT NULL,
  `dossier_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `type_id` (`type_id`),
  KEY `division_id` (`division_id`),
  KEY `document_id` (`document_id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`type_id`) REFERENCES `types_courriers` (`id`),
  CONSTRAINT `2` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `4` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courriers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `courriers` WRITE;
/*!40000 ALTER TABLE `courriers` DISABLE KEYS */;
/*!40000 ALTER TABLE `courriers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `decomptes_avance`
--

DROP TABLE IF EXISTS `decomptes_avance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `decomptes_avance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `salaire_mensuel` bigint(20) unsigned NOT NULL DEFAULT 0,
  `indice` int(10) unsigned DEFAULT NULL,
  `echelon` smallint(5) unsigned DEFAULT NULL,
  `avance_demandee` bigint(20) unsigned NOT NULL DEFAULT 0,
  `retenue_mensuelle` bigint(20) unsigned NOT NULL DEFAULT 0,
  `duree_mois` smallint(5) unsigned NOT NULL DEFAULT 0,
  `mois_rembourses` smallint(5) unsigned NOT NULL DEFAULT 0,
  `net_a_payer` bigint(20) unsigned NOT NULL DEFAULT 0,
  `reste_a_rembourser` bigint(20) unsigned NOT NULL DEFAULT 0,
  `observation` text DEFAULT NULL,
  `date_calcul` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_decompte_dossier` (`dossier_id`),
  KEY `fk_decompte_agent` (`agent_id`),
  CONSTRAINT `fk_decompte_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_decompte_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `decomptes_avance`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `decomptes_avance` WRITE;
/*!40000 ALTER TABLE `decomptes_avance` DISABLE KEYS */;
/*!40000 ALTER TABLE `decomptes_avance` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `delegations`
--

DROP TABLE IF EXISTS `delegations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `delegations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent_id` int(11) NOT NULL,
  `remplacant_id` int(11) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `motif` varchar(200) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_delegation_agent` (`agent_id`),
  KEY `idx_delegation_remplacant` (`remplacant_id`),
  KEY `fk_delegation_auteur` (`created_by`),
  CONSTRAINT `fk_delegation_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delegation_auteur` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_delegation_remplacant` FOREIGN KEY (`remplacant_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delegations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `delegations` WRITE;
/*!40000 ALTER TABLE `delegations` DISABLE KEYS */;
/*!40000 ALTER TABLE `delegations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `depouillements`
--

DROP TABLE IF EXISTS `depouillements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `depouillements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `piece` varchar(80) NOT NULL,
  `presente` tinyint(1) NOT NULL DEFAULT 0,
  `observation` text DEFAULT NULL,
  `date_controle` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_depouillement_dossier_piece` (`dossier_id`,`piece`),
  KEY `idx_depouillements_piece` (`piece`),
  KEY `fk_depouillements_agent` (`agent_id`),
  CONSTRAINT `fk_depouillements_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_depouillements_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depouillements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `depouillements` WRITE;
/*!40000 ALTER TABLE `depouillements` DISABLE KEYS */;
INSERT INTO `depouillements` VALUES
(1,2,1,'DECISION',1,NULL,'2026-10-05 11:15:51');
/*!40000 ALTER TABLE `depouillements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `antenne_id` int(11) NOT NULL,
  `code` varchar(30) NOT NULL,
  `libelle` varchar(100) NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_district_code` (`code`),
  KEY `idx_district_antenne` (`antenne_id`),
  CONSTRAINT `fk_district_antenne` FOREIGN KEY (`antenne_id`) REFERENCES `antennes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES
(1,1,'IFANADIANA','Ifanadiana',1,'2026-10-05 07:24:41'),
(2,1,'NOSY_VARIKA','Nosy Varika',1,'2026-10-05 07:24:41'),
(3,1,'MANANJARY','Mananjary',1,'2026-10-05 07:24:41'),
(4,2,'IKONGO','Ikongo',1,'2026-10-05 07:24:41'),
(5,2,'VOHIPENO','Vohipeno',1,'2026-10-05 07:24:41'),
(6,2,'MANAKARA','Manakara',1,'2026-10-05 07:24:41');
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type_dossier_id` int(11) NOT NULL,
  `responsable_id` int(11) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_division_responsable` (`responsable_id`),
  KEY `idx_division_type` (`type_dossier_id`),
  CONSTRAINT `fk_division_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_division_type_dossier` FOREIGN KEY (`type_dossier_id`) REFERENCES `types_dossiers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `divisions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `divisions` WRITE;
/*!40000 ALTER TABLE `divisions` DISABLE KEYS */;
INSERT INTO `divisions` VALUES
(1,'VISAS','Division Visas',1,6,1,'2026-10-05 07:24:40'),
(2,'SOLDE','Division Solde',2,8,1,'2026-10-05 07:24:40'),
(3,'PENSIONS','Division Pensions',3,10,1,'2026-10-05 07:24:40'),
(4,'SECOURS','Division Secours',4,12,1,'2026-10-05 07:24:40');
/*!40000 ALTER TABLE `divisions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) DEFAULT NULL,
  `courrier_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `chemin_stockage` varchar(500) NOT NULL,
  `taille` int(11) DEFAULT NULL,
  `valide` tinyint(1) DEFAULT 0,
  `upload_par` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `type_id` (`type_id`),
  KEY `upload_par` (`upload_par`),
  KEY `fk_document_courrier` (`courrier_id`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`type_id`) REFERENCES `types_documents` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`upload_par`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_document_courrier` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dossier_commentaires`
--

DROP TABLE IF EXISTS `dossier_commentaires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dossier_commentaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `auteur_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `modifie_le` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_commentaire_dossier` (`dossier_id`),
  KEY `fk_commentaire_auteur` (`auteur_id`),
  CONSTRAINT `fk_commentaire_auteur` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commentaire_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dossier_commentaires`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dossier_commentaires` WRITE;
/*!40000 ALTER TABLE `dossier_commentaires` DISABLE KEYS */;
/*!40000 ALTER TABLE `dossier_commentaires` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dossiers`
--

DROP TABLE IF EXISTS `dossiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dossiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `objet` text NOT NULL,
  `demandeur` varchar(150) NOT NULL,
  `matricule` varchar(50) DEFAULT NULL,
  `date_reception` date NOT NULL,
  `date_limite` date DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `priorite_id` int(11) DEFAULT NULL,
  `statut_id` int(11) DEFAULT NULL,
  `agent_responsable_id` int(11) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `date_cloture` date DEFAULT NULL,
  `date_archivage` date DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `demandeur_nom` varchar(100) DEFAULT NULL,
  `demandeur_prenom` varchar(100) DEFAULT NULL,
  `demandeur_tel` varchar(30) DEFAULT NULL,
  `demandeur_email` varchar(150) DEFAULT NULL,
  `demandeur_adresse` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `type_id` (`type_id`),
  KEY `division_id` (`division_id`),
  KEY `priorite_id` (`priorite_id`),
  KEY `statut_id` (`statut_id`),
  KEY `agent_responsable_id` (`agent_responsable_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_dossier_echeance` (`date_limite`),
  KEY `idx_dossiers_demandeur_nom` (`demandeur_nom`),
  KEY `idx_dossiers_demandeur_prenom` (`demandeur_prenom`),
  CONSTRAINT `1` FOREIGN KEY (`type_id`) REFERENCES `types_dossiers` (`id`),
  CONSTRAINT `2` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`priorite_id`) REFERENCES `priorites` (`id`),
  CONSTRAINT `4` FOREIGN KEY (`statut_id`) REFERENCES `statuts_dossiers` (`id`),
  CONSTRAINT `5` FOREIGN KEY (`agent_responsable_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dossiers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dossiers` WRITE;
/*!40000 ALTER TABLE `dossiers` DISABLE KEYS */;
INSERT INTO `dossiers` VALUES
(1,'VISA-2026-000001',1,'Demande d\'integration','RAKOTO Jean','201 036 156 000','2026-10-05',NULL,1,1,11,7,NULL,'2026-10-06','2026-10-06',5,'2026-10-05 07:33:26','2026-10-06 06:16:45','RAKOTO','Jean','034 40 433 45','rakoto@gmail.com','Manakara'),
(2,'SECOURS-2026-000001',4,'Secours de deces a titre de conjoint survivant','RAKOTOARISOA Jean Pierre',NULL,'2026-10-05',NULL,4,3,10,13,NULL,'2026-10-05',NULL,5,'2026-10-05 07:36:46','2026-10-05 08:15:14',NULL,NULL,NULL,NULL,NULL),
(54,'VISA-2026-000002',1,'nbjhj','rrreeeeee fdfdfdf','222222222','2026-10-06',NULL,1,1,4,7,NULL,NULL,NULL,1,'2026-10-06 11:56:07','2026-10-06 11:56:40','rrreeeeee','fdfdfdf','212121212121','rrrrrr@gmail.com',NULL),
(55,'PENSION-2026-000001',3,'Retraite','RANDRIANIRINA KOTO','101 020 031 012','2026-10-06',NULL,3,1,4,11,'Dossier complets',NULL,NULL,5,'2026-10-06 12:29:40','2026-10-06 12:29:40','RANDRIANIRINA','KOTO','033 35 123 22','koto@gmail.com','Manakara'),
(56,'SOLDE-2026-000001',2,'Mandatements','Hello Kity','120 202 222 012','2026-10-06',NULL,2,3,4,9,NULL,NULL,NULL,5,'2026-10-06 12:31:18','2026-10-06 12:31:18','Hello','Kity','032 21 222 22','Kity@gmail.com','Manakara'),
(57,'SECOURS-2026-000012',4,'Deces','randria luc','023020202020','2026-10-06',NULL,4,1,4,13,NULL,NULL,NULL,5,'2026-10-06 12:32:24','2026-10-06 12:32:24','randria','luc','03212210122','luc@gmail.com','Manakara');
/*!40000 ALTER TABLE `dossiers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `dossiers_districts`
--

DROP TABLE IF EXISTS `dossiers_districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dossiers_districts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `date_rattachement` date NOT NULL,
  `courante` tinyint(1) NOT NULL DEFAULT 1,
  `origine` varchar(40) NOT NULL DEFAULT 'SAISIE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dossier_district_courante` (`dossier_id`,`courante`),
  KEY `idx_dossier_district_dossier` (`dossier_id`),
  KEY `idx_dossier_district_district` (`district_id`),
  KEY `idx_dossier_district_courante` (`dossier_id`,`courante`),
  CONSTRAINT `fk_dossier_district_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`),
  CONSTRAINT `fk_dossier_district_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dossiers_districts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `dossiers_districts` WRITE;
/*!40000 ALTER TABLE `dossiers_districts` DISABLE KEYS */;
/*!40000 ALTER TABLE `dossiers_districts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `emargements`
--

DROP TABLE IF EXISTS `emargements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `emargements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `etat_emargement_id` int(11) NOT NULL,
  `beneficiaire_id` int(11) NOT NULL,
  `signataire` varchar(200) DEFAULT NULL,
  `signe_le` date DEFAULT NULL,
  `observation` varchar(500) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emargement_beneficiaire` (`etat_emargement_id`,`beneficiaire_id`),
  KEY `fk_emargement_beneficiaire` (`beneficiaire_id`),
  CONSTRAINT `fk_emargement_beneficiaire` FOREIGN KEY (`beneficiaire_id`) REFERENCES `mandatement_beneficiaires` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_emargement_etat` FOREIGN KEY (`etat_emargement_id`) REFERENCES `etats_emargement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emargements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `emargements` WRITE;
/*!40000 ALTER TABLE `emargements` DISABLE KEYS */;
/*!40000 ALTER TABLE `emargements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `etats_emargement`
--

DROP TABLE IF EXISTS `etats_emargement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `etats_emargement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mandatement_id` int(11) NOT NULL,
  `genere_par` int(11) DEFAULT NULL,
  `genere_le` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emargement_mandatement` (`mandatement_id`),
  KEY `fk_emargement_genere_par` (`genere_par`),
  CONSTRAINT `fk_emargement_genere_par` FOREIGN KEY (`genere_par`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emargement_mandatement` FOREIGN KEY (`mandatement_id`) REFERENCES `mandatements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etats_emargement`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `etats_emargement` WRITE;
/*!40000 ALTER TABLE `etats_emargement` DISABLE KEYS */;
/*!40000 ALTER TABLE `etats_emargement` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `fonctions`
--

DROP TABLE IF EXISTS `fonctions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fonctions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fonctions_libelle` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fonctions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `fonctions` WRITE;
/*!40000 ALTER TABLE `fonctions` DISABLE KEYS */;
INSERT INTO `fonctions` VALUES
(1,'Chef de Service','Supervision générale du SRSP'),
(2,'Chef BAAF','Gestion comptable et administrative'),
(3,'Coordonnatrice','Immatriculation et suivi des insertions'),
(4,'Secrétaire','Réception, enregistrement et distribution'),
(5,'Chef de Division','Supervision d\'une division'),
(6,'Vérificateur','Exploitation et vérification des dossiers'),
(7,'Liquidateur','Liquidation des pensions'),
(8,'Chargé de Secours','Traitement des dossiers de secours');
/*!40000 ALTER TABLE `fonctions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `historique_actions`
--

DROP TABLE IF EXISTS `historique_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `historique_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `dossier_id` int(11) DEFAULT NULL,
  `ancienne_valeur` text DEFAULT NULL,
  `nouvelle_valeur` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `date_action` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `dossier_id` (`dossier_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=762 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historique_actions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `historique_actions` WRITE;
/*!40000 ALTER TABLE `historique_actions` DISABLE KEYS */;
INSERT INTO `historique_actions` VALUES
(1,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:28:34'),
(2,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:28:48'),
(3,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:29:03'),
(4,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:29:04'),
(5,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:29:04'),
(6,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:29:04'),
(7,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:29:10'),
(8,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:29:39'),
(9,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:29:40'),
(10,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:29:40'),
(11,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:29:45'),
(12,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:30:16'),
(13,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:30:26'),
(14,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:30:35'),
(15,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:30:49'),
(16,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:30:55'),
(17,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:31:02'),
(18,NULL,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects.).','::1','2026-10-05 07:31:06'),
(19,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:31:52'),
(20,5,'CREATION_DOSSIER',1,NULL,NULL,'Création du dossier VISA-2026-000001',NULL,'2026-10-05 07:33:26'),
(21,5,'CHANGEMENT_STATUT',1,'RECU','ENREGISTRE','Enregistrement lors de la réception.',NULL,'2026-10-05 07:33:26'),
(22,5,'ENREGISTREMENT',1,NULL,NULL,'Dossier VISA-2026-000001 enregistré.',NULL,'2026-10-05 07:33:26'),
(23,5,'CHANGEMENT_STATUT',1,'ENREGISTRE','ORIENTE','Orientation automatique vers Division Visas (routage par type).',NULL,'2026-10-05 07:33:26'),
(24,5,'ORIENTATION',1,NULL,'Division Visas','Routage automatique : la division découle du type de dossier.',NULL,'2026-10-05 07:33:26'),
(25,5,'CHANGEMENT_STATUT',1,'ORIENTE','AFFECTE','Affectation automatique à Visas Verif Visa (VERIFICATEUR_VISA).',NULL,'2026-10-05 07:33:26'),
(26,5,'AFFECTATION',1,NULL,'Visas Verif Visa (VERIFICATEUR_VISA)','Affectation automatique à Visas Verif Visa — agent de traitement de la division, le moins chargé.',NULL,'2026-10-05 07:33:26'),
(27,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:33:51'),
(28,6,'AFFECTATION',1,NULL,'Agent ID 7',NULL,NULL,'2026-10-05 07:34:03'),
(29,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:34:29'),
(30,7,'CHANGEMENT_STATUT',1,'AFFECTE','EN_TRAITEMENT',NULL,NULL,'2026-10-05 07:34:43'),
(31,7,'CHANGEMENT_STATUT',1,'EN_TRAITEMENT','SOUMIS_A_VERIFICATION','Soumis à vérification.',NULL,'2026-10-05 07:34:48'),
(32,7,'VERIFICATION',1,NULL,NULL,NULL,NULL,'2026-10-05 07:34:48'),
(33,8,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.solde@srsp.mg).','::1','2026-10-05 07:35:29'),
(34,9,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.solde@srsp.mg).','::1','2026-10-05 07:35:52'),
(35,10,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.pension@srsp.mg).','::1','2026-10-05 07:36:13'),
(36,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:34'),
(37,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:36:35'),
(38,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:36:35'),
(39,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:36:35'),
(46,11,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (liquidateur@srsp.mg).','::1','2026-10-05 07:36:36'),
(47,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:36:44'),
(48,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:36:44'),
(49,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:36:44'),
(50,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:46'),
(51,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:36:46'),
(52,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:36:46'),
(53,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:36:46'),
(54,5,'CREATION_DOSSIER',2,NULL,NULL,'Création du dossier SECOURS-2026-000001',NULL,'2026-10-05 07:36:46'),
(55,5,'CHANGEMENT_STATUT',2,'RECU','ENREGISTRE','Enregistrement lors de la réception.',NULL,'2026-10-05 07:36:46'),
(56,5,'ENREGISTREMENT',2,NULL,NULL,'Dossier SECOURS-2026-000001 enregistré.',NULL,'2026-10-05 07:36:46'),
(57,5,'CHANGEMENT_STATUT',2,'ENREGISTRE','ORIENTE','Orientation automatique vers Division Secours (routage par type).',NULL,'2026-10-05 07:36:46'),
(58,5,'ORIENTATION',2,NULL,'Division Secours','Routage automatique : la division découle du type de dossier.',NULL,'2026-10-05 07:36:46'),
(59,5,'CHANGEMENT_STATUT',2,'ORIENTE','AFFECTE','Affectation automatique à Secours Charge Secours (CHARGE_SECOURS).',NULL,'2026-10-05 07:36:46'),
(60,5,'AFFECTATION',2,NULL,'Secours Charge Secours (CHARGE_SECOURS)','Affectation automatique à Secours Charge Secours — agent de traitement de la division, le moins chargé.',NULL,'2026-10-05 07:36:46'),
(61,12,'MANDATEMENT',2,NULL,'5000000 Ar / 3 bénéficiaire(s)',NULL,NULL,'2026-10-05 07:36:46'),
(62,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:47'),
(63,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:36:47'),
(64,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:36:47'),
(72,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:47'),
(85,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:36:48'),
(86,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:48'),
(157,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:36:49'),
(158,1,'SAUVEGARDE_DB',NULL,NULL,NULL,'Sauvegarde créée : srsp-2026-10-05T07-36-49-533Z.sql (232077 octets), AUCUNE pièce jointe incluse.',NULL,'2026-10-05 07:36:49'),
(159,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:55'),
(160,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:36:55'),
(161,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:36:55'),
(162,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:36:55'),
(171,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:36:56'),
(172,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:36:56'),
(173,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:36:56'),
(181,12,'CONNEXION_ECHOUEE',NULL,NULL,NULL,'Échec de connexion (Identifiants incorrects. 4 tentative(s) restante(s).).','::1','2026-10-05 07:37:00'),
(182,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:37:07'),
(183,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:37:13'),
(184,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:37:34'),
(185,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:37:45'),
(186,4,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (coordinatrice@srsp.mg).','::1','2026-10-05 07:38:00'),
(187,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:38:23'),
(188,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:38:54'),
(189,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:38:54'),
(190,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:38:54'),
(191,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:38:54'),
(200,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:39:20'),
(201,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:39:20'),
(202,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:39:20'),
(203,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:39:20'),
(212,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:39:55'),
(213,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:39:56'),
(214,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:39:56'),
(215,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:39:56'),
(224,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:40:12'),
(225,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:40:12'),
(226,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:40:12'),
(227,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:40:13'),
(236,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:40:55'),
(237,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:40:55'),
(238,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:40:55'),
(239,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:40:55'),
(248,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:41:33'),
(249,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:41:33'),
(250,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:41:34'),
(251,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:41:34'),
(260,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:41:54'),
(261,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:41:54'),
(262,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:41:54'),
(263,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:41:54'),
(272,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:41:59'),
(273,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:41:59'),
(274,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:41:59'),
(275,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:42:00'),
(276,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:42:00'),
(277,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:42:00'),
(285,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:42:01'),
(286,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:42:01'),
(287,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:42:01'),
(288,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:42:01'),
(289,4,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (coordinatrice@srsp.mg).','::1','2026-10-05 07:42:01'),
(290,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:42:01'),
(291,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:42:01'),
(292,8,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.solde@srsp.mg).','::1','2026-10-05 07:42:01'),
(293,9,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.solde@srsp.mg).','::1','2026-10-05 07:42:01'),
(294,10,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.pension@srsp.mg).','::1','2026-10-05 07:42:02'),
(295,11,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (liquidateur@srsp.mg).','::1','2026-10-05 07:42:02'),
(296,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:42:02'),
(297,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:42:02'),
(298,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:42:17'),
(299,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:42:17'),
(300,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:42:17'),
(301,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:42:17'),
(302,4,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (coordinatrice@srsp.mg).','::1','2026-10-05 07:42:17'),
(303,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:42:17'),
(304,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:42:17'),
(305,8,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.solde@srsp.mg).','::1','2026-10-05 07:42:18'),
(306,9,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.solde@srsp.mg).','::1','2026-10-05 07:42:18'),
(307,10,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.pension@srsp.mg).','::1','2026-10-05 07:42:18'),
(308,11,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (liquidateur@srsp.mg).','::1','2026-10-05 07:42:18'),
(309,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:42:18'),
(310,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:42:18'),
(311,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:42:27'),
(312,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:42:27'),
(313,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:42:27'),
(321,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 07:42:28'),
(322,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:42:28'),
(323,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:42:28'),
(324,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:42:28'),
(325,4,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (coordinatrice@srsp.mg).','::1','2026-10-05 07:42:28'),
(326,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 07:42:28'),
(327,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:42:28'),
(328,8,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.solde@srsp.mg).','::1','2026-10-05 07:42:28'),
(329,9,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.solde@srsp.mg).','::1','2026-10-05 07:42:29'),
(330,10,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.pension@srsp.mg).','::1','2026-10-05 07:42:29'),
(331,11,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (liquidateur@srsp.mg).','::1','2026-10-05 07:42:29'),
(332,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 07:42:29'),
(333,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 07:42:29'),
(334,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 07:42:33'),
(335,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 07:42:33'),
(336,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 07:42:34'),
(337,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 07:42:44'),
(593,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 08:13:47'),
(594,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 08:13:48'),
(595,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:13:48'),
(603,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 08:13:48'),
(604,1,'SAUVEGARDE_DB',NULL,NULL,NULL,'Sauvegarde créée : srsp-2026-10-05T08-13-48-971Z.sql (241871 octets), AUCUNE pièce jointe incluse.',NULL,'2026-10-05 08:13:49'),
(605,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-05 08:13:53'),
(606,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-05 08:13:54'),
(607,12,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.secours@srsp.mg).','::1','2026-10-05 08:13:54'),
(608,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-05 08:13:55'),
(609,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:13:55'),
(618,6,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chef.visa@srsp.mg).','::1','2026-10-05 08:13:56'),
(619,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:13:57'),
(620,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:13:57'),
(621,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:13:57'),
(622,1,'AFFECTATION',2,NULL,'Agent ID 13',NULL,NULL,'2026-10-05 08:14:13'),
(623,1,'CHANGEMENT_STATUT',2,'AFFECTE','EN_TRAITEMENT',NULL,NULL,'2026-10-05 08:14:19'),
(624,1,'CHANGEMENT_STATUT',2,'EN_TRAITEMENT','SOUMIS_A_VERIFICATION','Soumis à vérification.',NULL,'2026-10-05 08:14:24'),
(625,1,'VERIFICATION',2,NULL,NULL,NULL,NULL,'2026-10-05 08:14:24'),
(626,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:14:26'),
(627,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:14:27'),
(628,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:14:27'),
(629,1,'CHANGEMENT_STATUT',2,'SOUMIS_A_VERIFICATION','VALIDE',NULL,NULL,'2026-10-05 08:14:30'),
(630,1,'VALIDATION',2,NULL,'VALIDE',NULL,NULL,'2026-10-05 08:14:30'),
(631,1,'CHANGEMENT_STATUT',2,'VALIDE','SIGNE',NULL,NULL,'2026-10-05 08:14:38'),
(632,1,'SIGNATURE',2,NULL,NULL,'Référence de signature : SRSP',NULL,'2026-10-05 08:14:38'),
(633,1,'CHANGEMENT_STATUT',2,'SIGNE','CLOTURE','Clôture du dossier.',NULL,'2026-10-05 08:14:41'),
(634,1,'CLOTURE',2,NULL,NULL,NULL,NULL,'2026-10-05 08:14:42'),
(635,1,'CHANGEMENT_STATUT',2,'CLOTURE','ARCHIVE','Archivage du dossier.',NULL,'2026-10-05 08:14:45'),
(636,1,'ARCHIVAGE',2,NULL,NULL,NULL,NULL,'2026-10-05 08:14:45'),
(637,1,'RESTAURATION_ARCHIVE',2,NULL,NULL,'Dossier restauré depuis les archives — motif : Erreur',NULL,'2026-10-05 08:15:14'),
(638,1,'DEPOUILLEMENT',2,NULL,'DECISION : présente',NULL,NULL,'2026-10-05 08:15:31'),
(639,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:15:42'),
(640,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:15:42'),
(641,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:15:42'),
(652,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:15:48'),
(653,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:15:48'),
(654,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:15:48'),
(665,1,'DEPOUILLEMENT',2,NULL,'DECISION : présente',NULL,NULL,'2026-10-05 08:15:51'),
(666,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:16:02'),
(667,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:16:02'),
(668,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:16:02'),
(679,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:16:10'),
(680,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:16:10'),
(681,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:16:11'),
(692,3,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefbaaf@srsp.mg).','::1','2026-10-05 08:16:17'),
(693,2,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (chefservice@srsp.mg).','::1','2026-10-05 08:16:17'),
(694,7,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (verif.visa@srsp.mg).','::1','2026-10-05 08:16:17'),
(705,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-06 06:16:19'),
(706,1,'CHANGEMENT_STATUT',1,'SOUMIS_A_VERIFICATION','VALIDE',NULL,NULL,'2026-10-06 06:16:32'),
(707,1,'VALIDATION',1,NULL,'VALIDE',NULL,NULL,'2026-10-06 06:16:32'),
(708,1,'CHANGEMENT_STATUT',1,'VALIDE','SIGNE',NULL,NULL,'2026-10-06 06:16:38'),
(709,1,'SIGNATURE',1,NULL,NULL,'Référence de signature : SRSP',NULL,'2026-10-06 06:16:38'),
(710,1,'CHANGEMENT_STATUT',1,'SIGNE','CLOTURE','Clôture du dossier.',NULL,'2026-10-06 06:16:42'),
(711,1,'CLOTURE',1,NULL,NULL,NULL,NULL,'2026-10-06 06:16:42'),
(712,1,'CHANGEMENT_STATUT',1,'CLOTURE','ARCHIVE','Archivage du dossier.',NULL,'2026-10-06 06:16:45'),
(713,1,'ARCHIVAGE',1,NULL,NULL,NULL,NULL,'2026-10-06 06:16:45'),
(714,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-06 06:26:38'),
(715,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 06:26:48'),
(716,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-06 06:29:15'),
(717,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-06 06:29:22'),
(718,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 11:22:43'),
(719,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-06 11:29:39'),
(720,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-06 11:55:33'),
(721,1,'CREATION_DOSSIER',54,NULL,NULL,'Création du dossier VISA-2026-000002',NULL,'2026-10-06 11:56:07'),
(722,1,'CHANGEMENT_STATUT',54,'RECU','ENREGISTRE','Enregistrement lors de la réception.',NULL,'2026-10-06 11:56:07'),
(723,1,'ENREGISTREMENT',54,NULL,NULL,'Dossier VISA-2026-000002 enregistré.',NULL,'2026-10-06 11:56:07'),
(724,1,'CHANGEMENT_STATUT',54,'ENREGISTRE','ORIENTE','Orientation automatique vers Division Visas (routage par type).',NULL,'2026-10-06 11:56:07'),
(725,1,'ORIENTATION',54,NULL,'Division Visas','Routage automatique : la division découle du type de dossier.',NULL,'2026-10-06 11:56:07'),
(726,1,'CHANGEMENT_STATUT',54,'ORIENTE','AFFECTE','Affectation automatique à Visas Verif Visa (VERIFICATEUR_VISA).',NULL,'2026-10-06 11:56:07'),
(727,1,'AFFECTATION',54,NULL,'Visas Verif Visa (VERIFICATEUR_VISA)','Affectation automatique à Visas Verif Visa — agent de traitement de la division, le moins chargé.',NULL,'2026-10-06 11:56:07'),
(728,1,'MODIFICATION_DOSSIER',54,NULL,NULL,'Modification du dossier VISA-2026-000002',NULL,'2026-10-06 11:56:40'),
(729,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 12:01:19'),
(730,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 12:28:11'),
(731,5,'CREATION_DOSSIER',55,NULL,NULL,'Création du dossier PENSION-2026-000001',NULL,'2026-10-06 12:29:40'),
(732,5,'CHANGEMENT_STATUT',55,'RECU','ENREGISTRE','Enregistrement lors de la réception.',NULL,'2026-10-06 12:29:40'),
(733,5,'ENREGISTREMENT',55,NULL,NULL,'Dossier PENSION-2026-000001 enregistré.',NULL,'2026-10-06 12:29:40'),
(734,5,'CHANGEMENT_STATUT',55,'ENREGISTRE','ORIENTE','Orientation automatique vers Division Pensions (routage par type).',NULL,'2026-10-06 12:29:40'),
(735,5,'ORIENTATION',55,NULL,'Division Pensions','Routage automatique : la division découle du type de dossier.',NULL,'2026-10-06 12:29:40'),
(736,5,'CHANGEMENT_STATUT',55,'ORIENTE','AFFECTE','Affectation automatique à Pensions Liquidateur (LIQUIDATEUR_PENSION).',NULL,'2026-10-06 12:29:40'),
(737,5,'AFFECTATION',55,NULL,'Pensions Liquidateur (LIQUIDATEUR_PENSION)','Affectation automatique à Pensions Liquidateur — agent de traitement de la division, le moins chargé.',NULL,'2026-10-06 12:29:41'),
(738,5,'CREATION_DOSSIER',56,NULL,NULL,'Création du dossier SOLDE-2026-000001',NULL,'2026-10-06 12:31:18'),
(739,5,'CHANGEMENT_STATUT',56,'RECU','ENREGISTRE','Enregistrement lors de la réception.',NULL,'2026-10-06 12:31:18'),
(740,5,'ENREGISTREMENT',56,NULL,NULL,'Dossier SOLDE-2026-000001 enregistré.',NULL,'2026-10-06 12:31:18'),
(741,5,'CHANGEMENT_STATUT',56,'ENREGISTRE','ORIENTE','Orientation automatique vers Division Solde (routage par type).',NULL,'2026-10-06 12:31:18'),
(742,5,'ORIENTATION',56,NULL,'Division Solde','Routage automatique : la division découle du type de dossier.',NULL,'2026-10-06 12:31:18'),
(743,5,'CHANGEMENT_STATUT',56,'ORIENTE','AFFECTE','Affectation automatique à Solde Verif Solde (VERIFICATEUR_SOLDE).',NULL,'2026-10-06 12:31:18'),
(744,5,'AFFECTATION',56,NULL,'Solde Verif Solde (VERIFICATEUR_SOLDE)','Affectation automatique à Solde Verif Solde — agent de traitement de la division, le moins chargé.',NULL,'2026-10-06 12:31:18'),
(745,5,'CREATION_DOSSIER',57,NULL,NULL,'Création du dossier SECOURS-2026-000012',NULL,'2026-10-06 12:32:24'),
(746,5,'CHANGEMENT_STATUT',57,'RECU','ENREGISTRE','Enregistrement lors de la réception.',NULL,'2026-10-06 12:32:24'),
(747,5,'ENREGISTREMENT',57,NULL,NULL,'Dossier SECOURS-2026-000012 enregistré.',NULL,'2026-10-06 12:32:24'),
(748,5,'CHANGEMENT_STATUT',57,'ENREGISTRE','ORIENTE','Orientation automatique vers Division Secours (routage par type).',NULL,'2026-10-06 12:32:24'),
(749,5,'ORIENTATION',57,NULL,'Division Secours','Routage automatique : la division découle du type de dossier.',NULL,'2026-10-06 12:32:24'),
(750,5,'CHANGEMENT_STATUT',57,'ORIENTE','AFFECTE','Affectation automatique à Secours Charge Secours (CHARGE_SECOURS).',NULL,'2026-10-06 12:32:24'),
(751,5,'AFFECTATION',57,NULL,'Secours Charge Secours (CHARGE_SECOURS)','Affectation automatique à Secours Charge Secours — agent de traitement de la division, le moins chargé.',NULL,'2026-10-06 12:32:24'),
(752,13,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (charge.secours@srsp.mg).','::1','2026-10-06 12:32:58'),
(753,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 12:34:42'),
(754,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 12:52:40'),
(755,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 13:01:15'),
(756,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 13:01:24'),
(757,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 13:02:27'),
(758,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 13:08:50'),
(759,5,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (secretaire@srsp.mg).','::1','2026-10-06 13:09:00'),
(760,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-07 08:33:23'),
(761,1,'CONNEXION',NULL,NULL,NULL,'Connexion réussie (admin@srsp.mg).','::1','2026-10-07 08:36:30');
/*!40000 ALTER TABLE `historique_actions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `immatriculations`
--

DROP TABLE IF EXISTS `immatriculations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `immatriculations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `cin` varchar(50) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `corps` varchar(100) DEFAULT NULL,
  `grade` varchar(100) DEFAULT NULL,
  `indice` int(11) DEFAULT NULL,
  `date_entree` date DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `statut` enum('EN_ATTENTE','ACTIVE','REJETEE') NOT NULL DEFAULT 'EN_ATTENTE',
  `observations` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_immatriculation_numero` (`numero`),
  KEY `idx_immatriculation_cin` (`cin`),
  KEY `idx_immatriculation_statut` (`statut`),
  KEY `fk_imm_division` (`division_id`),
  KEY `fk_imm_user` (`created_by`),
  CONSTRAINT `fk_imm_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_imm_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immatriculations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `immatriculations` WRITE;
/*!40000 ALTER TABLE `immatriculations` DISABLE KEYS */;
/*!40000 ALTER TABLE `immatriculations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `insertions_augure`
--

DROP TABLE IF EXISTS `insertions_augure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `insertions_augure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `immatriculation_id` int(11) NOT NULL,
  `matricule_augure` varchar(50) DEFAULT NULL,
  `situation_familiale` varchar(100) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `indice_base` int(11) DEFAULT NULL,
  `salaire_base` decimal(14,2) DEFAULT NULL,
  `statut` enum('A_INSERER','INSERE','REJETE') NOT NULL DEFAULT 'A_INSERER',
  `observations` text DEFAULT NULL,
  `insere_par` int(11) DEFAULT NULL,
  `insere_le` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_augure_immatriculation` (`immatriculation_id`),
  KEY `idx_augure_statut` (`statut`),
  KEY `fk_augure_user` (`insere_par`),
  CONSTRAINT `fk_augure_imm` FOREIGN KEY (`immatriculation_id`) REFERENCES `immatriculations` (`id`),
  CONSTRAINT `fk_augure_user` FOREIGN KEY (`insere_par`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insertions_augure`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `insertions_augure` WRITE;
/*!40000 ALTER TABLE `insertions_augure` DISABLE KEYS */;
/*!40000 ALTER TABLE `insertions_augure` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `liquidations_pension`
--

DROP TABLE IF EXISTS `liquidations_pension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `liquidations_pension` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `annees_service` smallint(5) unsigned NOT NULL DEFAULT 0,
  `indice_final` int(10) unsigned DEFAULT NULL,
  `pension_brute` bigint(20) unsigned NOT NULL DEFAULT 0,
  `retenues` bigint(20) unsigned NOT NULL DEFAULT 0,
  `observation` text DEFAULT NULL,
  `date_calcul` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_liquidation_dossier` (`dossier_id`),
  KEY `fk_liquidation_agent` (`agent_id`),
  CONSTRAINT `fk_liquidation_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_liquidation_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liquidations_pension`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `liquidations_pension` WRITE;
/*!40000 ALTER TABLE `liquidations_pension` DISABLE KEYS */;
/*!40000 ALTER TABLE `liquidations_pension` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mandatement_beneficiaires`
--

DROP TABLE IF EXISTS `mandatement_beneficiaires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mandatement_beneficiaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mandatement_id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `lien` varchar(60) DEFAULT NULL,
  `quote_part` decimal(5,2) NOT NULL DEFAULT 0.00,
  `montant` decimal(15,2) NOT NULL DEFAULT 0.00,
  `matricule` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_beneficiaire_mandatement` (`mandatement_id`),
  CONSTRAINT `fk_beneficiaire_mandatement` FOREIGN KEY (`mandatement_id`) REFERENCES `mandatements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mandatement_beneficiaires`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mandatement_beneficiaires` WRITE;
/*!40000 ALTER TABLE `mandatement_beneficiaires` DISABLE KEYS */;
/*!40000 ALTER TABLE `mandatement_beneficiaires` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mandatement_pieces`
--

DROP TABLE IF EXISTS `mandatement_pieces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mandatement_pieces` (
  `code` varchar(50) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `ordre` smallint(5) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mandatement_pieces`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mandatement_pieces` WRITE;
/*!40000 ALTER TABLE `mandatement_pieces` DISABLE KEYS */;
/*!40000 ALTER TABLE `mandatement_pieces` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mandatement_pieces_etat`
--

DROP TABLE IF EXISTS `mandatement_pieces_etat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mandatement_pieces_etat` (
  `mandatement_id` int(11) NOT NULL,
  `piece_code` varchar(50) NOT NULL,
  `imprimee` tinyint(1) NOT NULL DEFAULT 0,
  `date_impression` datetime DEFAULT NULL,
  PRIMARY KEY (`mandatement_id`,`piece_code`),
  CONSTRAINT `fk_piece_etat_mandatement` FOREIGN KEY (`mandatement_id`) REFERENCES `mandatements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mandatement_pieces_etat`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mandatement_pieces_etat` WRITE;
/*!40000 ALTER TABLE `mandatement_pieces_etat` DISABLE KEYS */;
/*!40000 ALTER TABLE `mandatement_pieces_etat` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `mandatements`
--

DROP TABLE IF EXISTS `mandatements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mandatements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `montant_total` bigint(20) unsigned NOT NULL DEFAULT 0,
  `etat` enum('BROUILLON','A_ORDONNANCER','ORDONNANCE','LIQUIDE') NOT NULL DEFAULT 'BROUILLON',
  `ordonnancement_date` datetime DEFAULT NULL,
  `ordonnateur_id` int(11) DEFAULT NULL,
  `liquidation_date` datetime DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mandatement_dossier` (`dossier_id`),
  KEY `fk_mandatement_ordonnateur` (`ordonnateur_id`),
  CONSTRAINT `fk_mandatement_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mandatement_ordonnateur` FOREIGN KEY (`ordonnateur_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mandatements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `mandatements` WRITE;
/*!40000 ALTER TABLE `mandatements` DISABLE KEYS */;
/*!40000 ALTER TABLE `mandatements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `modes_paiement`
--

DROP TABLE IF EXISTS `modes_paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `modes_paiement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `immatriculation_id` int(11) NOT NULL,
  `mode` enum('VIREMENT','CHEQUE','ESPECES','MANDAT') NOT NULL,
  `banque` varchar(100) DEFAULT NULL,
  `compte_bancaire` varchar(50) DEFAULT NULL,
  `motif` text NOT NULL,
  `pieces_verifiees` tinyint(1) NOT NULL DEFAULT 0,
  `statut` enum('EN_ATTENTE','APPROUVE','REJETE') NOT NULL DEFAULT 'EN_ATTENTE',
  `observations` text DEFAULT NULL,
  `traite_par` int(11) DEFAULT NULL,
  `traite_le` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_paiement_immatriculation` (`immatriculation_id`),
  KEY `idx_paiement_statut` (`statut`),
  KEY `fk_paiement_user` (`traite_par`),
  CONSTRAINT `fk_paiement_imm` FOREIGN KEY (`immatriculation_id`) REFERENCES `immatriculations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_paiement_user` FOREIGN KEY (`traite_par`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modes_paiement`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `modes_paiement` WRITE;
/*!40000 ALTER TABLE `modes_paiement` DISABLE KEYS */;
/*!40000 ALTER TABLE `modes_paiement` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `dossier_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `lien` varchar(255) DEFAULT NULL,
  `lu` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notif_user_action` (`user_id`,`dossier_id`,`action`),
  KEY `idx_notif_user_lu` (`user_id`,`lu`),
  KEY `idx_notif_dossier` (`dossier_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES
(1,6,1,'WORKFLOW','ORIENTE','Dossier VISA-2026-000001 orienté vers votre division.','/dossiers/1',1,'2026-10-05 07:33:26'),
(2,7,1,'AFFECTATION','AFFECTE','Le dossier VISA-2026-000001 vous a été affecté pour traitement.','/dossiers/1',1,'2026-10-05 07:33:26'),
(3,7,1,'INFO','DOSSIER_AFFECTE','Le dossier VISA-2026-000001 vous a été affecté automatiquement.','/dossiers/1',1,'2026-10-05 07:33:26'),
(4,5,1,'INFO','DOSSIER_ENREGISTRE','Nouveau dossier VISA-2026-000001 enregistré, orienté vers Division Visas et affecté à Visas Verif Visa.','/dossiers/1',0,'2026-10-05 07:33:26'),
(5,6,1,'VERIFICATION','SOUMIS_A_VERIFICATION','Le dossier VISA-2026-000001 est soumis à votre vérification.','/dossiers/1',0,'2026-10-05 07:34:48'),
(6,12,2,'WORKFLOW','ORIENTE','Dossier SECOURS-2026-000001 orienté vers votre division.','/dossiers/2',0,'2026-10-05 07:36:46'),
(7,13,2,'AFFECTATION','AFFECTE','Le dossier SECOURS-2026-000001 vous a été affecté pour traitement.','/dossiers/2',0,'2026-10-05 07:36:46'),
(8,13,2,'INFO','DOSSIER_AFFECTE','Le dossier SECOURS-2026-000001 vous a été affecté automatiquement.','/dossiers/2',0,'2026-10-05 07:36:46'),
(9,5,2,'INFO','DOSSIER_ENREGISTRE','Nouveau dossier SECOURS-2026-000001 enregistré, orienté vers Division Secours et affecté à Secours Charge Secours.','/dossiers/2',1,'2026-10-05 07:36:46'),
(214,12,2,'VERIFICATION','SOUMIS_A_VERIFICATION','Le dossier SECOURS-2026-000001 est soumis à votre vérification.','/dossiers/2',0,'2026-10-05 08:14:24'),
(215,2,2,'VALIDATION','VALIDE','Le dossier SECOURS-2026-000001 est validé et attend votre signature.','/dossiers/2',0,'2026-10-05 08:14:30'),
(216,2,2,'SIGNATURE','SIGNE','Le dossier SECOURS-2026-000001 a été signé : il peut être clôturé.','/dossiers/2',0,'2026-10-05 08:14:38'),
(217,2,2,'CLOTURE','CLOTURE','Le dossier SECOURS-2026-000001 est clôturé et peut être archivé.','/dossiers/2',0,'2026-10-05 08:14:41'),
(218,2,1,'VALIDATION','VALIDE','Le dossier VISA-2026-000001 est validé et attend votre signature.','/dossiers/1',0,'2026-10-06 06:16:32'),
(219,2,1,'SIGNATURE','SIGNE','Le dossier VISA-2026-000001 a été signé : il peut être clôturé.','/dossiers/1',0,'2026-10-06 06:16:38'),
(220,2,1,'CLOTURE','CLOTURE','Le dossier VISA-2026-000001 est clôturé et peut être archivé.','/dossiers/1',0,'2026-10-06 06:16:42'),
(221,6,54,'WORKFLOW','ORIENTE','Dossier VISA-2026-000002 orienté vers votre division.','/dossiers/54',0,'2026-10-06 11:56:07'),
(222,7,54,'AFFECTATION','AFFECTE','Le dossier VISA-2026-000002 vous a été affecté pour traitement.','/dossiers/54',0,'2026-10-06 11:56:07'),
(223,7,54,'INFO','DOSSIER_AFFECTE','Le dossier VISA-2026-000002 vous a été affecté automatiquement.','/dossiers/54',0,'2026-10-06 11:56:07'),
(224,1,54,'INFO','DOSSIER_ENREGISTRE','Nouveau dossier VISA-2026-000002 enregistré, orienté vers Division Visas et affecté à Visas Verif Visa.','/dossiers/54',1,'2026-10-06 11:56:07'),
(225,10,55,'WORKFLOW','ORIENTE','Dossier PENSION-2026-000001 orienté vers votre division.','/dossiers/55',0,'2026-10-06 12:29:40'),
(226,11,55,'AFFECTATION','AFFECTE','Le dossier PENSION-2026-000001 vous a été affecté pour traitement.','/dossiers/55',0,'2026-10-06 12:29:40'),
(227,11,55,'INFO','DOSSIER_AFFECTE','Le dossier PENSION-2026-000001 vous a été affecté automatiquement.','/dossiers/55',0,'2026-10-06 12:29:41'),
(228,5,55,'INFO','DOSSIER_ENREGISTRE','Nouveau dossier PENSION-2026-000001 enregistré, orienté vers Division Pensions et affecté à Pensions Liquidateur.','/dossiers/55',0,'2026-10-06 12:29:41'),
(229,8,56,'WORKFLOW','ORIENTE','Dossier SOLDE-2026-000001 orienté vers votre division.','/dossiers/56',0,'2026-10-06 12:31:18'),
(230,9,56,'AFFECTATION','AFFECTE','Le dossier SOLDE-2026-000001 vous a été affecté pour traitement.','/dossiers/56',0,'2026-10-06 12:31:18'),
(231,9,56,'INFO','DOSSIER_AFFECTE','Le dossier SOLDE-2026-000001 vous a été affecté automatiquement.','/dossiers/56',0,'2026-10-06 12:31:18'),
(232,5,56,'INFO','DOSSIER_ENREGISTRE','Nouveau dossier SOLDE-2026-000001 enregistré, orienté vers Division Solde et affecté à Solde Verif Solde.','/dossiers/56',0,'2026-10-06 12:31:18'),
(233,12,57,'WORKFLOW','ORIENTE','Dossier SECOURS-2026-000012 orienté vers votre division.','/dossiers/57',0,'2026-10-06 12:32:24'),
(234,13,57,'AFFECTATION','AFFECTE','Le dossier SECOURS-2026-000012 vous a été affecté pour traitement.','/dossiers/57',0,'2026-10-06 12:32:24'),
(235,13,57,'INFO','DOSSIER_AFFECTE','Le dossier SECOURS-2026-000012 vous a été affecté automatiquement.','/dossiers/57',0,'2026-10-06 12:32:24'),
(236,5,57,'INFO','DOSSIER_ENREGISTRE','Nouveau dossier SECOURS-2026-000012 enregistré, orienté vers Division Secours et affecté à Secours Charge Secours.','/dossiers/57',0,'2026-10-06 12:32:24');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ordres_deplacement`
--

DROP TABLE IF EXISTS `ordres_deplacement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordres_deplacement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `type_id` int(11) NOT NULL,
  `dossier_id` int(11) NOT NULL,
  `agent_id` int(11) NOT NULL,
  `cin_agent` varchar(20) DEFAULT NULL,
  `lieu_depart` varchar(200) NOT NULL,
  `lieu_destination` varchar(200) NOT NULL,
  `date_depart` date NOT NULL,
  `date_retour` date NOT NULL,
  `objet` varchar(500) NOT NULL,
  `observations` text DEFAULT NULL,
  `montant_avance` decimal(15,2) DEFAULT NULL,
  `statut` enum('REDIGE','SOUMIS','SIGNE','EXECUTEE','CLOTUREE','REJETEE') NOT NULL DEFAULT 'REDIGE',
  `reference_signature` varchar(100) DEFAULT NULL,
  `signe_par` int(11) DEFAULT NULL,
  `signe_le` datetime DEFAULT NULL,
  `executee_le` date DEFAULT NULL,
  `montant_reel` decimal(15,2) DEFAULT NULL,
  `motif_cloture` varchar(500) DEFAULT NULL,
  `cree_par` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ordre_dep_numero` (`numero`),
  KEY `idx_ordre_dep_type` (`type_id`),
  KEY `idx_ordre_dep_dossier` (`dossier_id`),
  KEY `idx_ordre_dep_agent` (`agent_id`),
  KEY `idx_ordre_dep_statut` (`statut`),
  KEY `idx_ordre_dep_dates` (`date_depart`,`date_retour`),
  KEY `fk_ordre_dep_signe_par` (`signe_par`),
  KEY `fk_ordre_dep_cree_par` (`cree_par`),
  CONSTRAINT `fk_ordre_dep_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`),
  CONSTRAINT `fk_ordre_dep_cree_par` FOREIGN KEY (`cree_par`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_ordre_dep_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ordre_dep_signe_par` FOREIGN KEY (`signe_par`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ordre_dep_type` FOREIGN KEY (`type_id`) REFERENCES `types_pieces_deplacement` (`id`),
  CONSTRAINT `ck_ordre_dep_dates` CHECK (`date_retour` >= `date_depart`),
  CONSTRAINT `ck_ordre_dep_montants` CHECK (`montant_avance` is null or `montant_avance` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordres_deplacement`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ordres_deplacement` WRITE;
/*!40000 ALTER TABLE `ordres_deplacement` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordres_deplacement` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES
(1,'create_dossier','Créer un dossier','2026-10-05 07:24:40'),
(2,'edit_dossier','Modifier un dossier','2026-10-05 07:24:40'),
(3,'delete_dossier','Supprimer un dossier','2026-10-05 07:24:40'),
(4,'orienter_dossier','Orienter un dossier vers une division','2026-10-05 07:24:40'),
(5,'affecter_dossier','Affecter un dossier à un agent','2026-10-05 07:24:40'),
(6,'traiter_dossier','Traiter un dossier','2026-10-05 07:24:40'),
(7,'soumettre_verification','Soumettre un dossier à vérification (agent)','2026-10-05 07:24:40'),
(8,'verifier_dossier','Vérifier / décider d\'un dossier soumis','2026-10-05 07:24:40'),
(9,'valider_dossier','Valider un dossier','2026-10-05 07:24:40'),
(10,'signer_dossier','Signer un dossier validé','2026-10-05 07:24:40'),
(11,'cloturer_dossier','Clôturer un dossier signé','2026-10-05 07:24:40'),
(12,'archiver_dossier','Archiver un dossier clôturé','2026-10-05 07:24:40'),
(13,'view_all_dossiers','Consulter tous les dossiers','2026-10-05 07:24:40'),
(14,'view_assigned_dossiers','Consulter ses dossiers affectés','2026-10-05 07:24:40'),
(15,'manage_users','Gérer les utilisateurs','2026-10-05 07:24:40'),
(16,'manage_roles','Gérer les rôles et permissions','2026-10-05 07:24:40'),
(17,'manage_divisions','Gérer les divisions','2026-10-05 07:24:40'),
(18,'manage_personnel','Gérer les agents et le personnel','2026-10-05 07:24:40'),
(19,'view_audit','Consulter le journal d\'audit','2026-10-05 07:24:40'),
(20,'system_config','Configurer le système','2026-10-05 07:24:40'),
(21,'manage_courriers','Gérer les courriers','2026-10-05 07:24:40'),
(22,'manage_documents','Gérer les documents comptables','2026-10-05 07:24:40'),
(23,'upload_document','Téléverser des documents','2026-10-05 07:24:40'),
(24,'view_stats','Consulter les statistiques','2026-10-05 07:24:40'),
(25,'export_data','Exporter les données (PDF/Excel)','2026-10-05 07:24:40'),
(26,'consolidate_reports','Consolider les rapports d\'activité','2026-10-05 07:24:40'),
(27,'controler_decomptes','Contrôler les décomptes','2026-10-05 07:24:40'),
(28,'approuver_bons','Approuver les bons de caisse','2026-10-05 07:24:40'),
(29,'calculer_avances','Calculer les décomptes d\'avance','2026-10-05 07:24:40'),
(30,'gerer_correspondances','Gérer les correspondances de la division','2026-10-05 07:24:40'),
(31,'suivre_oppositions','Suivre les oppositions','2026-10-05 07:24:40'),
(32,'liquider_pension','Liquider les pensions','2026-10-05 07:24:40'),
(33,'gerer_dossiers_meres','Gérer les dossiers mères','2026-10-05 07:24:40'),
(34,'preparer_mandatement','Préparer le mandatement','2026-10-05 07:24:40'),
(35,'gerer_ordonnancement','Gérer l\'ordonnancement','2026-10-05 07:24:40'),
(36,'suivre_signature','Suivre la signature des pièces','2026-10-05 07:24:40'),
(37,'depouiller_pieces','Dépouiller les pièces','2026-10-05 07:24:40'),
(38,'archiver_pieces','Archiver les pièces justificatives','2026-10-05 07:24:40'),
(83,'view_archives','Consulter les archives','2026-10-05 07:24:41'),
(84,'view_journal','Consulter le journal global des actions','2026-10-05 07:24:41'),
(85,'etablir_pieces_deplacement','Etablir les ordres de route, ordres de mission, autorisations de retrait de bon de caisse et notes d interim.','2026-10-05 07:24:41'),
(86,'signer_pieces_deplacement','Signer une piece de deplacement et y apposer la reference de signature.','2026-10-05 07:24:41'),
(87,'executer_pieces_deplacement','Declarer une piece de deplacement executee et la cloturer au retour.','2026-10-05 07:24:41'),
(88,'enregistrer_visa_cf','Enregistrer et contrôler le visa du contrôle financier : numéro, signature et date.','2026-10-05 07:24:41'),
(89,'generer_etat_emargement','Préparer les références du logiciel secours et générer l\'état d\'émargement des bénéficiaires.','2026-10-05 07:24:41'),
(90,'apposer_cachet','Apposer le cachet, le titre et la date de l\'ordonnateur sur les pièces de mandatement.','2026-10-05 07:24:41'),
(91,'signer_pieces_mandatement','Apposer la signature de l\'ordonnateur sur les pièces de mandatement d\'un secours de décès.','2026-10-05 07:24:41'),
(92,'archiver_copie_mandatement','Archiver la copie signée des pièces de mandatement une fois la signature apposée.','2026-10-05 07:24:41');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `priorites`
--

DROP TABLE IF EXISTS `priorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `priorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) NOT NULL,
  `niveau` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_priorites_libelle` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priorites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `priorites` WRITE;
/*!40000 ALTER TABLE `priorites` DISABLE KEYS */;
INSERT INTO `priorites` VALUES
(1,'URGENTE',4),
(2,'HAUTE',3),
(3,'NORMALE',2),
(4,'BASSE',1);
/*!40000 ALTER TABLE `priorites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `references_logiciel_secours`
--

DROP TABLE IF EXISTS `references_logiciel_secours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `references_logiciel_secours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mandatement_id` int(11) NOT NULL,
  `code` varchar(30) NOT NULL,
  `libelle` varchar(200) NOT NULL,
  `valeur` varchar(200) NOT NULL,
  `reporte_par` int(11) DEFAULT NULL,
  `reporte_le` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reference_logiciel` (`mandatement_id`,`code`),
  KEY `fk_ref_logiciel_user` (`reporte_par`),
  CONSTRAINT `fk_ref_logiciel_mandatement` FOREIGN KEY (`mandatement_id`) REFERENCES `mandatements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ref_logiciel_user` FOREIGN KEY (`reporte_par`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `references_logiciel_secours`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `references_logiciel_secours` WRITE;
/*!40000 ALTER TABLE `references_logiciel_secours` DISABLE KEYS */;
/*!40000 ALTER TABLE `references_logiciel_secours` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `referentiel_fonctionnalites`
--

DROP TABLE IF EXISTS `referentiel_fonctionnalites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `referentiel_fonctionnalites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `document` varchar(60) NOT NULL DEFAULT 'HISTORIQUE',
  `numero_source` int(11) NOT NULL,
  `poste_code` varchar(60) NOT NULL,
  `libelle` varchar(255) NOT NULL,
  `detail` varchar(500) DEFAULT NULL,
  `section_source` varchar(80) NOT NULL,
  `nature` enum('METIER','INSTITUTIONNEL','STRUCTURE','INTEGRATION') NOT NULL DEFAULT 'METIER',
  `permission_nom` varchar(80) DEFAULT NULL,
  `etat` enum('LIVREE','PARTIELLE','INERTE','NON_CONSTRUITE','HORS_PLATEFORME') NOT NULL DEFAULT 'NON_CONSTRUITE',
  `motif` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fonctionnalite_document_numero` (`document`,`numero_source`),
  KEY `idx_fonctionnalite_poste` (`poste_code`),
  KEY `idx_fonctionnalite_document` (`document`),
  KEY `idx_fonctionnalite_nature` (`nature`),
  KEY `idx_fonctionnalite_etat` (`etat`),
  KEY `idx_fonctionnalite_permission` (`permission_nom`)
) ENGINE=InnoDB AUTO_INCREMENT=515 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referentiel_fonctionnalites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `referentiel_fonctionnalites` WRITE;
/*!40000 ALTER TABLE `referentiel_fonctionnalites` DISABLE KEYS */;
INSERT INTO `referentiel_fonctionnalites` VALUES
(1,'HISTORIQUE',1,'DSP','Afficher la dénomination officielle','Service Régional de la Solde et des Pensions','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(2,'HISTORIQUE',2,'DSP','Afficher l’acronyme SRSP',NULL,'Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(3,'HISTORIQUE',3,'DSP','Afficher le siège central','Immeuble Antaninarenina, Antananarivo','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(4,'HISTORIQUE',4,'DSP','Afficher le siège succursale','Ambodiaplay, Manakara','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(5,'HISTORIQUE',5,'DSP','Afficher la forme juridique','Entité gouvernementale relevant de l’administration publique','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(6,'HISTORIQUE',6,'DSP','Afficher les numéros de téléphone','+261 32 11 090 10 / +261 32 25 469 11','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(7,'HISTORIQUE',7,'DSP','Afficher l’email officiel','srsp.fitovinany@dgfag.mg','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(8,'HISTORIQUE',8,'DSP','Afficher le logo DSP','Direction de la Solde et des Pensions','Institutionnelles','INSTITUTIONNEL',NULL,'PARTIELLE','Le sigle DSP est documenté, mais le fichier logo lui-même n’est pas dans le dépôt et ne peut pas être rendu.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(9,'HISTORIQUE',9,'DSP','Enregistrer la date de création','22 septembre 2011','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(10,'HISTORIQUE',10,'DSP','Gérer la région d’origine','Vatovavy Fitovinany','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(11,'HISTORIQUE',11,'DSP','Gérer la province de rattachement','Fianarantsoa','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(12,'HISTORIQUE',12,'DSP','Gérer la scission de 2022','Vatovavy et Fitovinany deviennent deux entités distinctes','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(13,'HISTORIQUE',13,'DSP','Gérer les 6 districts',NULL,'Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(14,'HISTORIQUE',14,'DSP','Gérer la répartition Mananjary / Manakara','Deux antennes depuis 2022','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(15,'HISTORIQUE',15,'DSP','Gérer les 23 régions de Madagascar','Depuis 2022','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(16,'HISTORIQUE',16,'DSP','Assurer le calcul des salaires',NULL,'Institutionnelles','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(17,'HISTORIQUE',17,'DSP','Assurer le paiement des salaires','Le paiement relève de la Trésorerie Générale','Institutionnelles','METIER',NULL,'HORS_PLATEFORME','La plateforme constate le mandatement. L’ordonnancement et le paiement relèvent de la Trésorerie Générale et sont hors de son périmètre.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(18,'HISTORIQUE',18,'DSP','Assurer la gestion des salaires',NULL,'Institutionnelles','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(19,'HISTORIQUE',19,'DSP','Gérer les pensions de retraite',NULL,'Institutionnelles','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(20,'HISTORIQUE',20,'DSP','Veiller au versement conforme des salaires','Séparation des fonctions','Institutionnelles','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(21,'HISTORIQUE',21,'DSP','Veiller au versement conforme des pensions',NULL,'Institutionnelles','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(22,'HISTORIQUE',22,'DSP','Respecter la réglementation en vigueur','Les 11 statuts portent cette exigence','Institutionnelles','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(23,'HISTORIQUE',23,'DSP','Respecter les conventions collectives applicables','Règles de calcul des pensions et des avances','Institutionnelles','METIER',NULL,'NON_CONSTRUITE','Les taux et barèmes ne figurent pas dans les documents fournis. Les inventer produirait des calculs faux.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(24,'HISTORIQUE',24,'DSP','Gérer les 6 membres initiaux (2011)','Élément historique','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(25,'HISTORIQUE',25,'DSP','Gérer les 21 membres actuels','13 comptes créés sur 21','Institutionnelles','METIER',NULL,'PARTIELLE','Treize comptes sont créés. Les huit autres demandent la liste nominative réelle : créer des agents inventés fausserait les statistiques par agent.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(26,'HISTORIQUE',26,'DSP','Suivre l’évolution des effectifs','Historique des effectifs','Institutionnelles','METIER',NULL,'NON_CONSTRUITE','Les effectifs ne sont pas historisés. Leur évolution ne peut donc pas être reconstituée.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(27,'HISTORIQUE',27,'CHEF_DIV_SOLDE','Traiter les salaires des fonctionnaires',NULL,'Division Solde','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(28,'HISTORIQUE',28,'CHEF_DIV_SOLDE','Traiter les salaires des travailleurs publics',NULL,'Division Solde','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(29,'HISTORIQUE',29,'CHEF_DIV_SOLDE','Effectuer les paiements de manière précise','Séparation des fonctions','Division Solde','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(30,'HISTORIQUE',30,'CHEF_DIV_SOLDE','Effectuer les paiements en temps voulu','Échéance et tri de la file','Division Solde','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(31,'HISTORIQUE',31,'CHEF_DIV_SOLDE','Gérer le mandatement',NULL,'Division Solde','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(32,'HISTORIQUE',32,'CHEF_DIV_SOLDE','Vérifier les dossiers soumis pour mandatement',NULL,'Division Solde','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(33,'HISTORIQUE',33,'CHEF_DIV_SOLDE','Vérifier les Certificats de Cessation de Paiement',NULL,'Division Solde','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(34,'HISTORIQUE',34,'CHEF_DIV_SOLDE','Vérifier les décomptes d’avance de Solde','Table decomptes_avance','Division Solde','METIER','controler_decomptes','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(35,'HISTORIQUE',35,'CHEF_DIV_SOLDE','Vérifier les états de décompte des Soldes trop perçus',NULL,'Division Solde','METIER','controler_decomptes','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(36,'HISTORIQUE',36,'CHEF_DIV_SOLDE','Vérifier les Bons de caisse à retourner à la Trésorerie Générale',NULL,'Division Solde','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(37,'HISTORIQUE',37,'CHEF_DIV_SOLDE','Approuver les bons de caisse « Vu Bon à payer »',NULL,'Division Solde','METIER','approuver_bons','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(38,'HISTORIQUE',38,'CHEF_DIV_SOLDE','Classer les demandes de Domiciliation irrévocable de salaire',NULL,'Division Solde','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(39,'HISTORIQUE',39,'VERIF_SOLDE','Préparer les fiches de contrôle de Solde',NULL,'Division Solde','METIER',NULL,'NON_CONSTRUITE','Aucune table de fiche de contrôle. Le document ne décrit pas les rubriques à saisir.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(40,'HISTORIQUE',40,'VERIF_SOLDE','Préparer les dossiers mères (changement de localité)',NULL,'Division Solde','METIER','gerer_dossiers_meres','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(41,'HISTORIQUE',41,'VERIF_SOLDE','Expédier les dossiers mères aux SRSP concernés',NULL,'Division Solde','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(42,'HISTORIQUE',42,'VERIF_SOLDE','Préparer les dossiers de mandatement pour envoi au niveau central',NULL,'Division Solde','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(43,'HISTORIQUE',43,'VERIF_SOLDE','Mettre à jour les fiches de contrôle de la Solde',NULL,'Division Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 39, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(44,'HISTORIQUE',44,'VERIF_SOLDE','Réceptionner les fiches de contrôle',NULL,'Division Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 39, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(45,'HISTORIQUE',45,'VERIF_SOLDE','Créer les dossiers mères des agents affectés dans la Région Fitovinany',NULL,'Division Solde','METIER','gerer_dossiers_meres','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(46,'HISTORIQUE',46,'VERIF_SOLDE','Calculer les décomptes d’avances de Solde',NULL,'Division Solde','METIER','calculer_avances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(47,'HISTORIQUE',47,'VERIF_SOLDE','Présenter les décomptes pour vérification et signature',NULL,'Division Solde','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(48,'HISTORIQUE',48,'CHEF_DIV_PENSION','Traiter les dossiers de retraite',NULL,'Division Pension','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(49,'HISTORIQUE',49,'CHEF_DIV_PENSION','Garantir une transition fluide pour les fonctionnaires quittant le service actif',NULL,'Division Pension','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(50,'HISTORIQUE',50,'CHEF_DIV_PENSION','Gérer la liquidation des Pensions',NULL,'Division Pension','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(51,'HISTORIQUE',51,'CHEF_DIV_PENSION','Vérifier les dossiers soumis pour liquidation',NULL,'Division Pension','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(52,'HISTORIQUE',52,'CHEF_DIV_PENSION','Rédiger les Lettres de prescription',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(53,'HISTORIQUE',53,'CHEF_DIV_PENSION','Rédiger les demandes de dossier mère',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(54,'HISTORIQUE',54,'CHEF_DIV_PENSION','Envoyer au niveau central les demandes d’opposition sur Pension',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(55,'HISTORIQUE',55,'CHEF_DIV_PENSION','Gérer les oppositions : Pension alimentaire',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(56,'HISTORIQUE',56,'CHEF_DIV_PENSION','Gérer les oppositions : cession volontaire',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(57,'HISTORIQUE',57,'CHEF_DIV_PENSION','Gérer les oppositions : saisie arrêt',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(58,'HISTORIQUE',58,'CHEF_DIV_PENSION','Transmettre les Derniers arrérages',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(59,'HISTORIQUE',59,'LIQUIDATEUR','Archiver le dossier mère de Pensions',NULL,'Division Pension','METIER','gerer_dossiers_meres','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(60,'HISTORIQUE',60,'LIQUIDATEUR','Gérer les bons de caisse en retour',NULL,'Division Pension','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(61,'HISTORIQUE',61,'LIQUIDATEUR','Établir les demandes de Certificats de Cessation de Paiement',NULL,'Division Pension','METIER','liquider_pension','PARTIELLE','La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(62,'HISTORIQUE',62,'LIQUIDATEUR','Traiter les demandes de secours au décès',NULL,'Division Pension','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(63,'HISTORIQUE',63,'LIQUIDATEUR','Préparer les envois au SRSP Haute Matsiatra',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(64,'HISTORIQUE',64,'CHEF_DIV_VISA','Gérer l’intégration des fonctionnaires',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(65,'HISTORIQUE',65,'CHEF_DIV_VISA','Gérer le renouvellement de contrat',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(66,'HISTORIQUE',66,'CHEF_DIV_VISA','Gérer l’avancement de classe',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(67,'HISTORIQUE',67,'CHEF_DIV_VISA','Assurer la conformité des démarches administratives','Les 11 statuts portent cette exigence','Division Visa','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(68,'HISTORIQUE',68,'CHEF_DIV_VISA','Assurer la régularité des démarches administratives',NULL,'Division Visa','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(69,'HISTORIQUE',69,'CHEF_DIV_VISA','Traiter les dossiers soumis pour visa',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(70,'HISTORIQUE',70,'CHEF_DIV_VISA','Vérifier les dossiers soumis pour visa','Checklist de vérification','Division Visa','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(71,'HISTORIQUE',71,'VERIF_VISA','Archiver les dossiers après signature du Chef de Service',NULL,'Division Visa','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(72,'HISTORIQUE',72,'CHEF_DIV_SECOURS','Offrir un soutien aux familles des fonctionnaires décédés',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(73,'HISTORIQUE',73,'CHEF_DIV_SECOURS','Traiter les démarches de secours de décès',NULL,'Division Secours','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(74,'HISTORIQUE',74,'CHEF_DIV_SECOURS','Fournir une assistance financière aux familles',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(75,'HISTORIQUE',75,'CHEF_DIV_SECOURS','Réceptionner les dossiers venant du contrôle financier',NULL,'Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(76,'HISTORIQUE',76,'CHEF_DIV_SECOURS','Contrôler les Décisions visées par le CF','N° visa, signature, date','Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(77,'HISTORIQUE',77,'CHEF_DIV_SECOURS','Contrôler les États de décompte',NULL,'Division Secours','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(78,'HISTORIQUE',78,'CHEF_DIV_SECOURS','Préparer le mandatement',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(79,'HISTORIQUE',79,'CHEF_DIV_SECOURS','Établir l’État de décompte du mandatement',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(80,'HISTORIQUE',80,'CHEF_DIV_SECOURS','Établir les différents états de décompte du secours',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(81,'HISTORIQUE',81,'CHEF_DIV_SECOURS','Insérer les données dans le logiciel secours','Références calculées et report tracé','Division Secours','INTEGRATION','generer_etat_emargement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(82,'HISTORIQUE',82,'CHEF_DIV_SECOURS','Faire sortir le montant à engager pour la dépense','Répartition calculée depuis les quotes-parts','Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(83,'HISTORIQUE',83,'CHEF_DIV_SECOURS','Faire sortir la liste des bénéficiaires (tiers)',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(84,'HISTORIQUE',84,'CHEF_DIV_SECOURS','Gérer l’ordonnancement',NULL,'Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(85,'HISTORIQUE',85,'CHEF_DIV_SECOURS','Gérer la liquidation',NULL,'Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(86,'HISTORIQUE',86,'CHEF_DIV_SECOURS','Imprimer le TEF','Titre d’Engagement Financier','Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(87,'HISTORIQUE',87,'CHEF_DIV_SECOURS','Imprimer le Mandat de paiement',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(88,'HISTORIQUE',88,'CHEF_DIV_SECOURS','Imprimer le Bon de caisse',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(89,'HISTORIQUE',89,'CHEF_DIV_SECOURS','Imprimer le Bordereau des pièces',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(90,'HISTORIQUE',90,'CHEF_DIV_SECOURS','Imprimer le Bord d’émissions',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(91,'HISTORIQUE',91,'CHEF_DIV_SECOURS','Imprimer le Bord de mandats',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(92,'HISTORIQUE',92,'CHEF_DIV_SECOURS','Imprimer l’État d’émargement',NULL,'Division Secours','METIER','generer_etat_emargement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(93,'HISTORIQUE',93,'CHEF_DIV_SECOURS','Imprimer les Tickets de mandatement','Guichet unique','Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(94,'HISTORIQUE',94,'CHEF_DIV_SECOURS','Insérer dans le logiciel secours les références pour l’état d’émargement',NULL,'Division Secours','INTEGRATION','generer_etat_emargement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(95,'HISTORIQUE',95,'CHEF_DIV_SECOURS','Faire signer les pièces de mandatement par l’ordonnateur','Permission dédiée : le Chef de Division ne signe pas','Division Secours','METIER','signer_pieces_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(96,'HISTORIQUE',96,'CHARGE_SECOURS','Traiter les dossiers de secours de décès',NULL,'Division Secours','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(97,'HISTORIQUE',97,'CHARGE_SECOURS','Apposer le cachet et la date sur les pièces de mandatement',NULL,'Division Secours','METIER','apposer_cachet','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(98,'HISTORIQUE',98,'CHARGE_SECOURS','Apposer le cachet rond, titre et nom de l’ordonnateur',NULL,'Division Secours','METIER','apposer_cachet','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(99,'HISTORIQUE',99,'CHARGE_SECOURS','Dépouiller les dossiers (Décision)','Pièce PGA visée par le contrôle financier','Division Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(100,'HISTORIQUE',100,'CHARGE_SECOURS','Dépouiller les dossiers (État de décompte)',NULL,'Division Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(101,'HISTORIQUE',101,'CHARGE_SECOURS','Dépouiller les dossiers (CCETPP)','Certificat de Cessation d’Emploi et de Traitement','Division Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(102,'HISTORIQUE',102,'CHARGE_SECOURS','Dépouiller les dossiers (Demande de l’intéressé)',NULL,'Division Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(103,'HISTORIQUE',103,'CHARGE_SECOURS','Archiver les Actes de décès',NULL,'Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(104,'HISTORIQUE',104,'CHARGE_SECOURS','Archiver les Actes de Mariage',NULL,'Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(105,'HISTORIQUE',105,'CHARGE_SECOURS','Archiver les Certificats de NSC','Non-Salarié Civil','Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(106,'HISTORIQUE',106,'CHARGE_SECOURS','Archiver les Certificats de NDiv','Non-Divorcé','Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(107,'HISTORIQUE',107,'CHARGE_SECOURS','Archiver les CIN','Du défunt et du bénéficiaire','Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(108,'HISTORIQUE',108,'CHARGE_SECOURS','Faire cacheter et parapher les documents par le CF','Le CF signe la pièce papier','Division Secours','METIER',NULL,'HORS_PLATEFORME','Le cachet du contrôle financier est apposé sur la pièce physique. La plateforme ne peut que tracer la demande de cachet.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(109,'HISTORIQUE',109,'CHEF_SERVICE','Représenter le SRSP auprès du Ministère','Rapports et statistiques du service','Chef de Service','METIER','consolidate_reports','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(110,'HISTORIQUE',110,'CHEF_SERVICE','Valider l’ensemble des dossiers traités',NULL,'Chef de Service','METIER','valider_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(111,'HISTORIQUE',111,'CHEF_SERVICE','Signer l’ensemble des dossiers traités','Référence de signature obligatoire','Chef de Service','METIER','signer_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(112,'HISTORIQUE',112,'CHEF_SERVICE','Superviser les dossiers au niveau de chaque Division',NULL,'Chef de Service','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(113,'HISTORIQUE',113,'CHEF_SERVICE','Garantir la qualité des procédures administratives',NULL,'Chef de Service','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(114,'HISTORIQUE',114,'CHEF_SERVICE','Garantir la conformité des procédures administratives',NULL,'Chef de Service','METIER','valider_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(115,'HISTORIQUE',115,'CHEF_SERVICE','Résoudre les problèmes persistants au niveau des Divisions',NULL,'Chef de Service','METIER',NULL,'NON_CONSTRUITE','Aucun circuit d’escalade n’existe : un dossier bloqué ne remonte nulle part.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(116,'HISTORIQUE',116,'CHEF_SERVICE','Intervenir là où les solutions n’ont pas été résolues',NULL,'Chef de Service','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 115, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(117,'HISTORIQUE',117,'CHEF_DIV_VISA','Assurer l’interlocution avec les Chefs de Division','Besoins matériels','Chef de Service','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(118,'HISTORIQUE',118,'CHEF_BAAF','Préparer les documents comptables',NULL,'Chef BAAF','METIER','manage_documents','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(119,'HISTORIQUE',119,'CHEF_BAAF','Exploiter les documents comptables',NULL,'Chef BAAF','METIER','view_stats','PARTIELLE','Les indicateurs de dossiers existent. L’analyse des pièces comptables elle-même n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(120,'HISTORIQUE',120,'CHEF_BAAF','Archiver les documents comptables',NULL,'Chef BAAF','METIER','view_archives','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(121,'HISTORIQUE',121,'CHEF_BAAF','Classer les documents comptables',NULL,'Chef BAAF','METIER','upload_document','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(122,'HISTORIQUE',122,'CHEF_BAAF','Effectuer les saisies sur SIIGFP','Système financier de l’État','Chef BAAF','INTEGRATION',NULL,'HORS_PLATEFORME','SIIGFP est un système externe du Ministère. La plateforme prépare les données à y reporter, elle n’y écrit pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(123,'HISTORIQUE',123,'CHEF_BAAF','Effectuer les saisies sur SIIGMP','Système de masse salariale','Chef BAAF','INTEGRATION',NULL,'HORS_PLATEFORME','SIIGMP est un système externe. Même limite que pour SIIGFP.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(124,'HISTORIQUE',124,'CHEF_BAAF','Produire les situations trimestrielles (FCC, BCSE)','Fiche de Compte et Budget de Compte Spécial d’Emploi','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','La nomenclature FCC/BCSE n’est décrite nulle part. Un état produit sans elle ne serait conforme à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(125,'HISTORIQUE',125,'CHEF_BAAF','Produire les situations annuelles (FCC, BCSE)',NULL,'Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 124, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(126,'HISTORIQUE',126,'CHEF_BAAF','Gérer le personnel (avancement)',NULL,'Chef BAAF','METIER','manage_personnel','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(127,'HISTORIQUE',127,'CHEF_BAAF','Gérer le personnel (renouvellement)','Contrats','Chef BAAF','METIER','manage_personnel','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(128,'HISTORIQUE',128,'CHEF_BAAF','Gérer le personnel (congé)','Droits à congés','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Le droit du travail malgache n’est pas documenté. Les droits ne peuvent pas être inventés.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(129,'HISTORIQUE',129,'CHEF_BAAF','Gérer le personnel (permission)','Absences','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 128, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(130,'HISTORIQUE',130,'CHEF_BAAF','Consolider le rapport d’activités du service',NULL,'Chef BAAF','METIER','consolidate_reports','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(131,'HISTORIQUE',131,'CHEF_BAAF','Superviser l’établissement de la comptabilité-matière','Inventaire du matériel','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Aucun inventaire de matériel. Entrées, sorties et stock n’existent pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(132,'HISTORIQUE',132,'CHEF_BAAF','Superviser les travaux de secrétariat',NULL,'Chef BAAF','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(133,'HISTORIQUE',133,'CHEF_BAAF','Résoudre les difficultés rencontrées au sein du Bureau',NULL,'Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Aucun circuit d’escalade au niveau du bureau.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(134,'HISTORIQUE',134,'CHEF_BAAF','Établir les ordres de route',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(135,'HISTORIQUE',135,'CHEF_BAAF','Établir les ordres de mission',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(136,'HISTORIQUE',136,'CHEF_BAAF','Établir les autorisations de retrait de BC',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(137,'HISTORIQUE',137,'CHEF_BAAF','Établir les Notes d’intérim',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(138,'HISTORIQUE',138,'COORDONNATRICE','Créer les numéros d’immatriculation',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(139,'HISTORIQUE',139,'COORDONNATRICE','Attribuer les numéros aux nouveaux fonctionnaires',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(140,'HISTORIQUE',140,'COORDONNATRICE','Attribuer les numéros aux employés du secteur public',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(141,'HISTORIQUE',141,'COORDONNATRICE','Vérifier l’enregistrement correct de chaque individu',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(142,'HISTORIQUE',142,'COORDONNATRICE','Garantir un identifiant unique (salaires)',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(143,'HISTORIQUE',143,'COORDONNATRICE','Garantir un identifiant unique (pensions)',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(144,'HISTORIQUE',144,'COORDONNATRICE','Gérer les insertions augurales',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(145,'HISTORIQUE',145,'COORDONNATRICE','Intégrer les nouveaux arrivants dans les systèmes de paie',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(146,'HISTORIQUE',146,'COORDONNATRICE','Intégrer les nouveaux arrivants dans les systèmes de pensions',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(147,'HISTORIQUE',147,'COORDONNATRICE','Prendre en compte les données personnelles',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(148,'HISTORIQUE',148,'COORDONNATRICE','Prendre en compte les informations salariales',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(149,'HISTORIQUE',149,'COORDONNATRICE','Prendre en compte les informations de pension',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(150,'HISTORIQUE',150,'COORDONNATRICE','Préparer les rapports d’activité pour le Chef de Service',NULL,'Coordonnatrice','METIER','consolidate_reports','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(151,'HISTORIQUE',151,'COORDONNATRICE','Préparer les rapports d’activité pour la direction centrale',NULL,'Coordonnatrice','METIER','consolidate_reports','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(152,'HISTORIQUE',152,'COORDONNATRICE','Rapporter le nombre de nouveaux dossiers traités',NULL,'Coordonnatrice','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(153,'HISTORIQUE',153,'COORDONNATRICE','Rapporter les changements de statut',NULL,'Coordonnatrice','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(154,'HISTORIQUE',154,'COORDONNATRICE','Rapporter les problèmes rencontrés',NULL,'Coordonnatrice','METIER','view_stats','PARTIELLE','Les indicateurs sont calculés, mais aucun dispositif de remontée de problème n’existe. Un agent ne peut pas signaler un blocage autrement que par un commentaire de dossier.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(155,'HISTORIQUE',155,'COORDONNATRICE','Rapporter les mesures prises pour résoudre les problèmes',NULL,'Coordonnatrice','METIER','view_stats','PARTIELLE','Dépend de la fonction 154, elle-même partielle.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(156,'HISTORIQUE',156,'COORDONNATRICE','Traiter les demandes de mode de paiement (fonctionnaires)',NULL,'Coordonnatrice','METIER','gerer_paiements','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(157,'HISTORIQUE',157,'COORDONNATRICE','Traiter les demandes de mode de paiement (retraités)',NULL,'Coordonnatrice','METIER','gerer_paiements','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(158,'HISTORIQUE',158,'COORDONNATRICE','Coordonner les démarches administratives',NULL,'Coordonnatrice','METIER','gerer_paiements','PARTIELLE','Les démarches de changement de paiement sont traitées. Le suivi de leur avancement auprès des autres services n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(159,'HISTORIQUE',159,'COORDONNATRICE','Veiller à la mise à jour correcte des informations dans les systèmes',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(160,'HISTORIQUE',160,'SECRETARIAT','Effectuer tous les travaux de secrétariat du Service',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(161,'HISTORIQUE',161,'SECRETARIAT','Réceptionner les dossiers',NULL,'Secrétaire','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(162,'HISTORIQUE',162,'SECRETARIAT','Réceptionner les courriers',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(163,'HISTORIQUE',163,'SECRETARIAT','Enregistrer les dossiers',NULL,'Secrétaire','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(164,'HISTORIQUE',164,'SECRETARIAT','Enregistrer les courriers',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(165,'HISTORIQUE',165,'SECRETARIAT','Distribuer les dossiers',NULL,'Secrétaire','METIER','orienter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(166,'HISTORIQUE',166,'SECRETARIAT','Distribuer les courriers',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(167,'HISTORIQUE',167,'SECRETARIAT','Gérer la chronologie des actes émis par le service',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Aucune numérotation d’actes. Un numéro d’acte est la référence d’une pièce officielle : sans registre, deux actes peuvent porter le même numéro.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(168,'HISTORIQUE',168,'SECRETARIAT','Gérer les numéros BE (Bons d’Émission)',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 167, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(169,'HISTORIQUE',169,'SECRETARIAT','Gérer les Notes',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 167, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(170,'HISTORIQUE',170,'SECRETARIAT','Gérer les Lettres',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 167, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(171,'HISTORIQUE',171,'CHEF_DIV_VISA','Organiser le traitement des dossiers soumis pour visa',NULL,'Chef Division Visa','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(172,'HISTORIQUE',172,'CHEF_DIV_VISA','Superviser le traitement des dossiers soumis pour visa',NULL,'Chef Division Visa','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(173,'HISTORIQUE',173,'CHEF_DIV_VISA','Vérifier les dossiers soumis pour visa',NULL,'Chef Division Visa','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(174,'HISTORIQUE',174,'CHEF_DIV_VISA','Résoudre les difficultés rencontrées au sein de la division',NULL,'Chef Division Visa','METIER','view_all_dossiers','PARTIELLE','Un chef de division voit les indicateurs de sa division, mais aucun dispositif ne permet de signaler un dossier bloqué à la hiérarchie.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(175,'HISTORIQUE',175,'CHEF_DIV_VISA','Produire le rapport d’activités mensuel',NULL,'Chef Division Visa','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(176,'HISTORIQUE',176,'CHEF_DIV_VISA','Produire le rapport d’activités trimestriel',NULL,'Chef Division Visa','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(177,'HISTORIQUE',177,'CHEF_DIV_VISA','Produire le rapport d’activités annuel',NULL,'Chef Division Visa','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(178,'HISTORIQUE',178,'CHEF_DIV_VISA','Assurer l’interlocution avec le Chef de Service (besoins matériels)',NULL,'Chef Division Visa','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(179,'HISTORIQUE',179,'CHEF_DIV_VISA','Représenter la Division au sein des réunions',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','La représentation se prépare par les rapports et statistiques, mais la réunion elle-même relève du service, pas de la plateforme.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(180,'HISTORIQUE',180,'CHEF_DIV_VISA','Représenter la Division au sein des conférences',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','Même limite que pour la fonction 179.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(181,'HISTORIQUE',181,'CHEF_DIV_VISA','Représenter la Division au sein des séminaires',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','Même limite que pour la fonction 179.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(182,'HISTORIQUE',182,'CHEF_DIV_VISA','Représenter la Division au sein des ateliers',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','Même limite que pour la fonction 179.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(183,'HISTORIQUE',183,'CHEF_DIV_VISA','Assurer la bonne conduite des agents',NULL,'Chef Division Visa','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire. Le suivi de la tenue des agents se limite aux indicateurs d’activité.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(184,'HISTORIQUE',184,'CHEF_DIV_VISA','Assurer la bonne exécution des tâches des agents',NULL,'Chef Division Visa','METIER','view_stats','PARTIELLE','Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(185,'HISTORIQUE',185,'CHEF_DIV_SOLDE','Organiser le traitement des dossiers pour mandatement',NULL,'Chef Division Solde','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(186,'HISTORIQUE',186,'CHEF_DIV_SOLDE','Superviser le traitement des dossiers pour mandatement',NULL,'Chef Division Solde','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(187,'HISTORIQUE',187,'CHEF_DIV_SOLDE','Vérifier les dossiers soumis pour mandatement',NULL,'Chef Division Solde','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(188,'HISTORIQUE',188,'CHEF_DIV_SOLDE','Vérifier les Certificats de Cessation de Paiement',NULL,'Chef Division Solde','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(189,'HISTORIQUE',189,'CHEF_DIV_SOLDE','Vérifier les décomptes d’avance de Solde',NULL,'Chef Division Solde','METIER','controler_decomptes','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(190,'HISTORIQUE',190,'CHEF_DIV_SOLDE','Vérifier les états de décompte des Soldes trop perçus',NULL,'Chef Division Solde','METIER','controler_decomptes','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(191,'HISTORIQUE',191,'CHEF_DIV_SOLDE','Vérifier les Bons de caisse à retourner à la Trésorerie Générale',NULL,'Chef Division Solde','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(192,'HISTORIQUE',192,'CHEF_DIV_SOLDE','Assurer l’interlocution avec le Chef de Service',NULL,'Chef Division Solde','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(193,'HISTORIQUE',193,'CHEF_DIV_SOLDE','Résoudre les difficultés rencontrées au sein de la division',NULL,'Chef Division Solde','METIER','view_all_dossiers','PARTIELLE','Un chef de division voit les indicateurs de sa division, mais aucun dispositif ne permet de signaler un dossier bloqué.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(194,'HISTORIQUE',194,'CHEF_DIV_SOLDE','Approuver les bons de caisse « Vu Bon à payer »',NULL,'Chef Division Solde','METIER','approuver_bons','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(195,'HISTORIQUE',195,'CHEF_DIV_SOLDE','Classer les demandes de Domiciliation irrévocable de salaire',NULL,'Chef Division Solde','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(196,'HISTORIQUE',196,'CHEF_DIV_SOLDE','Produire le rapport d’activités mensuel',NULL,'Chef Division Solde','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(197,'HISTORIQUE',197,'CHEF_DIV_SOLDE','Produire le rapport d’activités trimestriel',NULL,'Chef Division Solde','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(198,'HISTORIQUE',198,'CHEF_DIV_SOLDE','Produire le rapport d’activités annuel',NULL,'Chef Division Solde','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(199,'HISTORIQUE',199,'CHEF_DIV_SOLDE','Représenter la Division',NULL,'Chef Division Solde','METIER',NULL,'HORS_PLATEFORME','La représentation se prépare par les rapports, mais la réunion relève du service.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(200,'HISTORIQUE',200,'CHEF_DIV_SOLDE','Assurer la bonne conduite des agents',NULL,'Chef Division Solde','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(201,'HISTORIQUE',201,'CHEF_DIV_SOLDE','Assurer la bonne exécution des tâches des agents',NULL,'Chef Division Solde','METIER','view_stats','PARTIELLE','Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(202,'HISTORIQUE',202,'CHEF_DIV_PENSION','Organiser le traitement des dossiers pour liquidation',NULL,'Chef Division Pension','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(203,'HISTORIQUE',203,'CHEF_DIV_PENSION','Superviser le traitement des dossiers pour liquidation',NULL,'Chef Division Pension','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(204,'HISTORIQUE',204,'CHEF_DIV_PENSION','Vérifier les dossiers soumis pour liquidation de Pensions',NULL,'Chef Division Pension','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(205,'HISTORIQUE',205,'CHEF_DIV_PENSION','Résoudre les difficultés rencontrées au sein de la division',NULL,'Chef Division Pension','METIER','view_all_dossiers','PARTIELLE','Aucun dispositif de signalement d’un dossier bloqué à la hiérarchie.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(206,'HISTORIQUE',206,'CHEF_DIV_PENSION','Assurer l’interlocution avec le Chef de Service',NULL,'Chef Division Pension','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(207,'HISTORIQUE',207,'CHEF_DIV_PENSION','Produire le rapport d’activités mensuel',NULL,'Chef Division Pension','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(208,'HISTORIQUE',208,'CHEF_DIV_PENSION','Produire le rapport d’activités trimestriel',NULL,'Chef Division Pension','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(209,'HISTORIQUE',209,'CHEF_DIV_PENSION','Produire le rapport d’activités annuel',NULL,'Chef Division Pension','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(210,'HISTORIQUE',210,'CHEF_DIV_PENSION','Rédiger toute correspondance d’usage (Lettre de prescription)',NULL,'Chef Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(211,'HISTORIQUE',211,'CHEF_DIV_PENSION','Rédiger toute correspondance d’usage (demande de dossier mère)',NULL,'Chef Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(212,'HISTORIQUE',212,'CHEF_DIV_PENSION','Envoyer au niveau central les demandes d’opposition sur Pension',NULL,'Chef Division Pension','METIER','suivre_oppositions','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(213,'HISTORIQUE',213,'CHEF_DIV_PENSION','Envoyer les Derniers arrérages',NULL,'Chef Division Pension','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(214,'HISTORIQUE',214,'CHEF_DIV_PENSION','Représenter la Division au sein des réunions',NULL,'Chef Division Pension','METIER',NULL,'HORS_PLATEFORME','La représentation se prépare par les rapports, mais la réunion relève du service.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(215,'HISTORIQUE',215,'CHEF_DIV_PENSION','Proposer toutes mesures devant être prises et matérialisées par actes',NULL,'Chef Division Pension','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de proposition d’une mesure administrative à la hiérarchie.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(216,'HISTORIQUE',216,'CHEF_DIV_PENSION','Assurer la bonne conduite des agents',NULL,'Chef Division Pension','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(217,'HISTORIQUE',217,'CHEF_DIV_PENSION','Assurer la bonne exécution des tâches des agents',NULL,'Chef Division Pension','METIER','view_stats','PARTIELLE','Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(218,'HISTORIQUE',218,'CHEF_DIV_SECOURS','Réceptionner les dossiers venant du contrôle financier',NULL,'Chef Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(219,'HISTORIQUE',219,'CHEF_DIV_SECOURS','Contrôler les Décisions visées par le CF',NULL,'Chef Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(220,'HISTORIQUE',220,'CHEF_DIV_SECOURS','Contrôler les États de décompte',NULL,'Chef Division Secours','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(221,'HISTORIQUE',221,'CHEF_DIV_SECOURS','Préparer le mandatement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(222,'HISTORIQUE',222,'CHEF_DIV_SECOURS','Établir l’État de décompte du mandatement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(223,'HISTORIQUE',223,'CHEF_DIV_SECOURS','Établir les différents états de décompte du secours',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(224,'HISTORIQUE',224,'CHEF_DIV_SECOURS','Insérer les données dans le logiciel secours',NULL,'Chef Division Secours','METIER','generer_etat_emargement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(225,'HISTORIQUE',225,'CHEF_DIV_SECOURS','Faire sortir le montant à engager pour la dépense',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(226,'HISTORIQUE',226,'CHEF_DIV_SECOURS','Faire sortir la liste des bénéficiaires (tiers)',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(227,'HISTORIQUE',227,'CHEF_DIV_SECOURS','Gérer l’ordonnancement',NULL,'Chef Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(228,'HISTORIQUE',228,'CHEF_DIV_SECOURS','Gérer la liquidation',NULL,'Chef Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(229,'HISTORIQUE',229,'CHEF_DIV_SECOURS','Imprimer le TEF',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(230,'HISTORIQUE',230,'CHEF_DIV_SECOURS','Imprimer le Mandat de paiement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(231,'HISTORIQUE',231,'CHEF_DIV_SECOURS','Imprimer le Bon de caisse',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(232,'HISTORIQUE',232,'CHEF_DIV_SECOURS','Imprimer le Bordereau des pièces',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(233,'HISTORIQUE',233,'CHEF_DIV_SECOURS','Imprimer le Bord d’émissions',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(234,'HISTORIQUE',234,'CHEF_DIV_SECOURS','Imprimer le Bord de mandats',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(235,'HISTORIQUE',235,'CHEF_DIV_SECOURS','Imprimer l’État d’émargement',NULL,'Chef Division Secours','METIER','generer_etat_emargement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(236,'HISTORIQUE',236,'CHEF_DIV_SECOURS','Imprimer les Tickets de mandatement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(237,'HISTORIQUE',237,'CHEF_DIV_SECOURS','Insérer dans le logiciel secours les références',NULL,'Chef Division Secours','METIER','generer_etat_emargement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(238,'HISTORIQUE',238,'CHEF_DIV_SECOURS','Faire signer les pièces de mandatement par l’ordonnateur',NULL,'Chef Division Secours','METIER','signer_pieces_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(239,'HISTORIQUE',239,'CHEF_DIV_SECOURS','Superviser les chargés de secours',NULL,'Chef Division Secours','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(240,'HISTORIQUE',240,'CHEF_DIV_SECOURS','Assurer la bonne conduite des agents',NULL,'Chef Division Secours','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(241,'HISTORIQUE',241,'VERIF_VISA','Exploiter tous les dossiers soumis pour visa',NULL,'Vérificateurs Visas','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(242,'HISTORIQUE',242,'VERIF_VISA','Soumettre les dossiers pour vérification du Chef de Division',NULL,'Vérificateurs Visas','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(243,'HISTORIQUE',243,'VERIF_VISA','Soumettre les dossiers pour signature du Chef de Service',NULL,'Vérificateurs Visas','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(244,'HISTORIQUE',244,'VERIF_VISA','Archiver les dossiers après signature du Chef de Service',NULL,'Vérificateurs Visas','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(245,'HISTORIQUE',245,'VERIF_SOLDE','Exploiter tous les dossiers soumis pour mandatement',NULL,'Vérificateurs Solde','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(246,'HISTORIQUE',246,'VERIF_SOLDE','Soumettre les dossiers pour vérification du Chef de Division',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(247,'HISTORIQUE',247,'VERIF_SOLDE','Soumettre les dossiers pour signature du Chef de Service',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(248,'HISTORIQUE',248,'VERIF_SOLDE','Préparer les fiches de contrôle de Solde',NULL,'Vérificateurs Solde','METIER',NULL,'NON_CONSTRUITE','Aucune table de fiche de contrôle. Le document ne décrit pas les rubriques à saisir.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(249,'HISTORIQUE',249,'VERIF_SOLDE','Préparer les dossiers mères (changement de localité)',NULL,'Vérificateurs Solde','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(250,'HISTORIQUE',250,'VERIF_SOLDE','Expédier les dossiers mères aux SRSP concernés',NULL,'Vérificateurs Solde','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(251,'HISTORIQUE',251,'VERIF_SOLDE','Préparer les dossiers de mandatement pour envoi au niveau central',NULL,'Vérificateurs Solde','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(252,'HISTORIQUE',252,'VERIF_SOLDE','Mettre à jour les fiches de contrôle de la Solde',NULL,'Vérificateurs Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 248, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(253,'HISTORIQUE',253,'VERIF_SOLDE','Réceptionner les fiches de contrôle',NULL,'Vérificateurs Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 248, non construite.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(254,'HISTORIQUE',254,'VERIF_SOLDE','Créer les dossiers mères des agents affectés dans la Région Fitovinany',NULL,'Vérificateurs Solde','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(255,'HISTORIQUE',255,'VERIF_SOLDE','Calculer les décomptes d’avances de Solde',NULL,'Vérificateurs Solde','METIER','calculer_avances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(256,'HISTORIQUE',256,'VERIF_SOLDE','Présenter les décomptes pour vérification du Chef de Division',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(257,'HISTORIQUE',257,'VERIF_SOLDE','Présenter les décomptes pour signature du Chef de Service',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(258,'HISTORIQUE',258,'LIQUIDATEUR','Exploiter tous les dossiers soumis pour liquidation',NULL,'Liquidateurs Pensions','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(259,'HISTORIQUE',259,'LIQUIDATEUR','Soumettre les dossiers pour vérification du Chef de Division',NULL,'Liquidateurs Pensions','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(260,'HISTORIQUE',260,'LIQUIDATEUR','Traiter les demandes de secours au décès',NULL,'Liquidateurs Pensions','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(261,'HISTORIQUE',261,'LIQUIDATEUR','Préparer les demandes de secours pour envoi au SRSP Haute Matsiatra',NULL,'Liquidateurs Pensions','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(262,'HISTORIQUE',262,'LIQUIDATEUR','Archiver le dossier mère de Pensions',NULL,'Liquidateurs Pensions','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(263,'HISTORIQUE',263,'LIQUIDATEUR','Gérer les bons de caisse en retour',NULL,'Liquidateurs Pensions','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(264,'HISTORIQUE',264,'LIQUIDATEUR','Établir les demandes de Certificats de Cessation de Paiement',NULL,'Liquidateurs Pensions','METIER','liquider_pension','PARTIELLE','La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(265,'HISTORIQUE',265,'CHARGE_SECOURS','Traiter les dossiers de secours de décès',NULL,'Chargés de Secours','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(266,'HISTORIQUE',266,'CHARGE_SECOURS','Apposer le cachet et la date des pièces de mandatements',NULL,'Chargés de Secours','METIER','apposer_cachet','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(267,'HISTORIQUE',267,'CHARGE_SECOURS','Apposer le cachet rond, titre et nom de l’ordonnateur',NULL,'Chargés de Secours','METIER','apposer_cachet','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(268,'HISTORIQUE',268,'CHARGE_SECOURS','Dépouiller les dossiers (Décision)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(269,'HISTORIQUE',269,'CHARGE_SECOURS','Dépouiller les dossiers (État de décompte)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(270,'HISTORIQUE',270,'CHARGE_SECOURS','Dépouiller les dossiers (CCETPP)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(271,'HISTORIQUE',271,'CHARGE_SECOURS','Dépouiller les dossiers (Demande de l’intéressé)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(272,'HISTORIQUE',272,'CHARGE_SECOURS','Archiver les Actes de décès',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(273,'HISTORIQUE',273,'CHARGE_SECOURS','Archiver les Actes de Mariage',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(274,'HISTORIQUE',274,'CHARGE_SECOURS','Archiver les Certificats de NSC',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(275,'HISTORIQUE',275,'CHARGE_SECOURS','Archiver les Certificats de NDiv',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(276,'HISTORIQUE',276,'CHARGE_SECOURS','Archiver les CIN',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(277,'HISTORIQUE',277,'CHARGE_SECOURS','Faire cacheter et parapher les documents par le CF',NULL,'Chargés de Secours','METIER',NULL,'HORS_PLATEFORME','Le cachet du contrôle financier est apposé sur la pièce physique. La plateforme ne peut que tracer la demande de cachet.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(278,'HISTORIQUE',278,'MINISTERE','Direction de la Communication','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(279,'HISTORIQUE',279,'MINISTERE','Cabinet du Ministère','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(280,'HISTORIQUE',280,'MINISTERE','Autorité de Régulation des Marchés Publics','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(281,'HISTORIQUE',281,'MINISTERE','Direction Générale du Contrôle Financier','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(282,'HISTORIQUE',282,'MINISTERE','Direction de l’Audit Interne','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(283,'HISTORIQUE',283,'MINISTERE','Commission Nationale des Marchés','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(284,'HISTORIQUE',284,'MINISTERE','Cellule de Coordination des Projets','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(285,'HISTORIQUE',285,'MINISTERE','Direction des Études et de la Programmation','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(286,'HISTORIQUE',286,'MINISTERE','Direction d’Appui, de Suivi et d’Évaluation','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(287,'HISTORIQUE',287,'MINISTERE','Secrétariat Général','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(288,'HISTORIQUE',288,'MINISTERE','Institut National de la Statistique','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(289,'HISTORIQUE',289,'MINISTERE','Conseil Supérieur de la Comptabilité','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(290,'HISTORIQUE',290,'MINISTERE','Direction de l’Imprimerie Nationale','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(291,'HISTORIQUE',291,'MINISTERE','Direction des Affaires Administratives et Financières','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(292,'HISTORIQUE',292,'MINISTERE','Direction des Ressources Humaines','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(293,'HISTORIQUE',293,'MINISTERE','Direction de la Formation et de la Coordination des Réformes','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(294,'HISTORIQUE',294,'MINISTERE','Direction des Systèmes d’Information','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(295,'HISTORIQUE',295,'MINISTERE','Direction de la Promotion du Partenariat Public-Privé','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(296,'HISTORIQUE',296,'MINISTERE','Bureau d’Appui à la Coopération Extérieure','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(297,'HISTORIQUE',297,'MINISTERE','Direction Générale des Douanes','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(298,'HISTORIQUE',298,'MINISTERE','Direction Générale des Impôts','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(299,'HISTORIQUE',299,'MINISTERE','Direction Générale du Budget et des Finances','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(300,'HISTORIQUE',300,'MINISTERE','Direction du Budget','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(301,'HISTORIQUE',301,'MINISTERE','Direction de la Gestion des Effectifs des Agents de l’État','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(302,'HISTORIQUE',302,'MINISTERE','Direction de la Solde et des Pensions','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(303,'HISTORIQUE',303,'MINISTERE','Direction Générale du Trésor','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(304,'HISTORIQUE',304,'MINISTERE','Direction non précisée dans le document source','Ligne réservée par le document sans intitulé','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Le document attribue la ligne 304 à une direction du Ministère mais n’en énumère que 26 entre les lignes 278 et 303. L’écart est constaté, pas comblé.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(305,'HISTORIQUE',305,'CHEF_SERVICE','Chef de Service du SRSP','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(306,'HISTORIQUE',306,'COORDONNATRICE','Coordonnatrice','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(307,'HISTORIQUE',307,'CHEF_BAAF','Chef BAAF','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(308,'HISTORIQUE',308,'SECRETARIAT','Secrétariat','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(309,'HISTORIQUE',309,'ACCUEIL','Accueil','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(310,'HISTORIQUE',310,'SUIVI_COURRIERS','Suivi des courriers','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(311,'HISTORIQUE',311,'CHEF_DIV_VISA','Chef de Division VISAS','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(312,'HISTORIQUE',312,'CHEF_DIV_SOLDE','Chef de Division SOLDE','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(313,'HISTORIQUE',313,'CHEF_DIV_PENSION','Chef de Division PENSIONS','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(314,'HISTORIQUE',314,'CHEF_DIV_SECOURS','Chef de Division SECOURS','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(315,'HISTORIQUE',315,'VERIF_VISA','Vérificateurs Visas','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(316,'HISTORIQUE',316,'VERIF_SOLDE','Vérificateurs Solde','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(317,'HISTORIQUE',317,'LIQUIDATEUR','Liquidateurs Pensions','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(318,'HISTORIQUE',318,'CHARGE_SECOURS','Chargés de Secours','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(319,'HISTORIQUE',319,'CHEF_BAAF','Intégrer les données avec SIIGFP','Système financier de l’État','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La plateforme prépare les données à reporter, elle n’y écrit pas. Le report est tracé, ce qui permet de contrôler ce qui a été saisi.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(320,'HISTORIQUE',320,'CHEF_BAAF','Intégrer les données avec SIIGMP','Système de masse salariale','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','Même limite que pour SIIGFP.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(321,'HISTORIQUE',321,'COORDONNATRICE','Intégrer les données avec Augure','Système de paie et de pensions','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','Les données d’insertion augurale sont gérées et validées. Le report dans Augure reste une saisie externe, dont la plateforme trace la préparation.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(322,'HISTORIQUE',322,'CHEF_DIV_SECOURS','Intégrer les données avec le logiciel secours','Logiciel de mandatement','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','Les références à reporter sont calculées et le report est tracé. L’écriture dans le logiciel reste externe.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(323,'HISTORIQUE',323,'LIQUIDATEUR','Transférer les dossiers au SRSP Haute Matsiatra','Dossier de secours','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La préparation et la correspondance existent. Le transfert physique relève du service.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(324,'HISTORIQUE',324,'VERIF_SOLDE','Transférer les dossiers aux SRSP concernés','Dossier mère','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La préparation et la correspondance existent. Le transfert physique relève du service.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(325,'HISTORIQUE',325,'CHEF_SERVICE','Envoyer les données au niveau central','Rapport d’activités','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La consolidation des rapports existe. L’envoi à la direction centrale se fait hors de la plateforme.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(326,'OBLIGATOIRE',1,'OBLIGATOIRE','Connexion par email + mot de passe','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(327,'OBLIGATOIRE',2,'OBLIGATOIRE','Hachage des mots de passe (bcrypt)','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(328,'OBLIGATOIRE',3,'OBLIGATOIRE','Génération de token JWT','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(329,'OBLIGATOIRE',4,'OBLIGATOIRE','Déconnexion','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(330,'OBLIGATOIRE',5,'OBLIGATOIRE','Expiration de session (8 heures)','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE','Le document fixe 8 h. La valeur était 24 h dans le .env comme dans le défaut du code : les deux ont été corrigées, sans quoi un déploiement sans .env retrouvait 24 h.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(331,'OBLIGATOIRE',6,'OBLIGATOIRE','Changement de mot de passe','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(332,'OBLIGATOIRE',7,'OBLIGATOIRE','Verrouillage après 5 tentatives échouées','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(333,'OBLIGATOIRE',8,'OBLIGATOIRE','Politique de mot de passe fort','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(334,'OBLIGATOIRE',9,'OBLIGATOIRE','Contrôle d’accès par rôle (RBAC)','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(335,'OBLIGATOIRE',10,'OBLIGATOIRE','Vérification côté serveur','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(336,'OBLIGATOIRE',11,'OBLIGATOIRE','Protection CORS','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(337,'OBLIGATOIRE',12,'OBLIGATOIRE','Validation des données','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(338,'OBLIGATOIRE',13,'OBLIGATOIRE','Créer un utilisateur','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(339,'OBLIGATOIRE',14,'OBLIGATOIRE','Lister les utilisateurs','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(340,'OBLIGATOIRE',15,'OBLIGATOIRE','Modifier un utilisateur','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(341,'OBLIGATOIRE',16,'OBLIGATOIRE','Activer / désactiver un compte','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(342,'OBLIGATOIRE',17,'OBLIGATOIRE','Supprimer un utilisateur','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(343,'OBLIGATOIRE',18,'OBLIGATOIRE','Réinitialiser un mot de passe','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(344,'OBLIGATOIRE',19,'OBLIGATOIRE','Rôles prédéfinis','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER',NULL,'LIVREE','Le document de projet en décrit 7. Le document d organisation officiel en décrit 13, et la base en compte 13 : quatre chefs de division, quatre postes transversaux, l administrateur, quatre types d agents. Réduire à 7 retirerait des postes réels du SRSP.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(345,'OBLIGATOIRE',20,'OBLIGATOIRE','Permissions','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER',NULL,'LIVREE','Le document de projet en compte 19. La base en compte 51 : les 19 du projet plus 32 ajoutées par les documents suivants, toutes liées à des routes testées. Réduire supprimerait des accès utilisés.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(346,'OBLIGATOIRE',21,'OBLIGATOIRE','Matrice RBAC','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_roles','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(347,'OBLIGATOIRE',22,'OBLIGATOIRE','Attribution de rôle','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(348,'OBLIGATOIRE',23,'OBLIGATOIRE','Quatre divisions (Visa, Solde, Pension, Secours)','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(349,'OBLIGATOIRE',24,'OBLIGATOIRE','Affectation d’un utilisateur à une division','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(350,'OBLIGATOIRE',25,'OBLIGATOIRE','Créer un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(351,'OBLIGATOIRE',26,'OBLIGATOIRE','Génération automatique du numéro unique','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(352,'OBLIGATOIRE',27,'OBLIGATOIRE','Format {TYPE}-{ANNEE}-{6CAR}','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(353,'OBLIGATOIRE',28,'OBLIGATOIRE','Quatre types de dossiers','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(354,'OBLIGATOIRE',29,'OBLIGATOIRE','Quatre niveaux de priorité','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(355,'OBLIGATOIRE',30,'OBLIGATOIRE','Gestion du demandeur (CIN unique)','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(356,'OBLIGATOIRE',31,'OBLIGATOIRE','Statut initial RECU','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(357,'OBLIGATOIRE',32,'OBLIGATOIRE','Date de réception automatique','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(358,'OBLIGATOIRE',33,'OBLIGATOIRE','Date limite','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(359,'OBLIGATOIRE',34,'OBLIGATOIRE','Lister tous les dossiers','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(360,'OBLIGATOIRE',35,'OBLIGATOIRE','Filtrer les dossiers','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(361,'OBLIGATOIRE',36,'OBLIGATOIRE','Consulter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(362,'OBLIGATOIRE',37,'OBLIGATOIRE','Modifier un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','edit_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(363,'OBLIGATOIRE',38,'OBLIGATOIRE','Voir l’historique','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(364,'OBLIGATOIRE',39,'OBLIGATOIRE','Voir les documents','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(365,'OBLIGATOIRE',40,'OBLIGATOIRE','Voir les notifications','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(366,'OBLIGATOIRE',41,'OBLIGATOIRE','Orienter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','orienter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(367,'OBLIGATOIRE',42,'OBLIGATOIRE','Affecter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','affecter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(368,'OBLIGATOIRE',43,'OBLIGATOIRE','Traiter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(369,'OBLIGATOIRE',44,'OBLIGATOIRE','Soumettre à vérification','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(370,'OBLIGATOIRE',45,'OBLIGATOIRE','Vérifier un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(371,'OBLIGATOIRE',46,'OBLIGATOIRE','Corriger un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(372,'OBLIGATOIRE',47,'OBLIGATOIRE','Valider un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','valider_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(373,'OBLIGATOIRE',48,'OBLIGATOIRE','Signer un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','signer_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(374,'OBLIGATOIRE',49,'OBLIGATOIRE','Clôturer un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','cloturer_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(375,'OBLIGATOIRE',50,'OBLIGATOIRE','Archiver un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(376,'OBLIGATOIRE',51,'OBLIGATOIRE','Créer un demandeur','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(377,'OBLIGATOIRE',52,'OBLIGATOIRE','Rechercher par CIN','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(378,'OBLIGATOIRE',53,'OBLIGATOIRE','Consulter l’historique du demandeur','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(379,'OBLIGATOIRE',54,'OBLIGATOIRE','Modifier les informations du demandeur','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','edit_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(380,'OBLIGATOIRE',55,'OBLIGATOIRE','Statut RECU','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(381,'OBLIGATOIRE',56,'OBLIGATOIRE','Statut ENREGISTRE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(382,'OBLIGATOIRE',57,'OBLIGATOIRE','Statut ORIENTE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(383,'OBLIGATOIRE',58,'OBLIGATOIRE','Statut AFFECTE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(384,'OBLIGATOIRE',59,'OBLIGATOIRE','Statut EN_TRAITEMENT','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(385,'OBLIGATOIRE',60,'OBLIGATOIRE','Statut SOUMIS_A_VERIFICATION','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(386,'OBLIGATOIRE',61,'OBLIGATOIRE','Statut CORRECTION_DEMANDEE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(387,'OBLIGATOIRE',62,'OBLIGATOIRE','Statut VALIDE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(388,'OBLIGATOIRE',63,'OBLIGATOIRE','Statut SIGNE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(389,'OBLIGATOIRE',64,'OBLIGATOIRE','Statut CLOTURE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(390,'OBLIGATOIRE',65,'OBLIGATOIRE','Statut ARCHIVE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(391,'OBLIGATOIRE',66,'OBLIGATOIRE','Workflow Visa','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(392,'OBLIGATOIRE',67,'OBLIGATOIRE','Workflow Solde','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(393,'OBLIGATOIRE',68,'OBLIGATOIRE','Workflow Pension','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'PARTIELLE','Le document annonce 10 étapes pour la Pension contre 11 pour les autres, sans indiquer QUELLE étape manque. Un circuit Pension à 10 étapes serait inventé. Le circuit général des 11 statuts s’applique.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(394,'OBLIGATOIRE',69,'OBLIGATOIRE','Workflow Secours','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(395,'OBLIGATOIRE',70,'OBLIGATOIRE','Validation des transitions','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(396,'OBLIGATOIRE',71,'OBLIGATOIRE','Interdiction des transitions invalides','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','CORRECTION_DEMANDEE ne peut pas mener directement à VALIDE : le dossier repasse en traitement.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(397,'OBLIGATOIRE',72,'OBLIGATOIRE','Routage Visa vers Division Visa','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(398,'OBLIGATOIRE',73,'OBLIGATOIRE','Routage Solde vers Division Solde','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(399,'OBLIGATOIRE',74,'OBLIGATOIRE','Routage Pension vers Division Pension','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(400,'OBLIGATOIRE',75,'OBLIGATOIRE','Routage Secours vers Division Secours','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(401,'OBLIGATOIRE',76,'OBLIGATOIRE','Téléverser des documents','Fonctionnalité obligatoire : Documents','Documents','METIER','upload_document','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(402,'OBLIGATOIRE',77,'OBLIGATOIRE','Formats PDF, DOCX, XLSX, JPG, PNG','Fonctionnalité obligatoire : Documents','Documents','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(403,'OBLIGATOIRE',78,'OBLIGATOIRE','Taille maximale 5 Mo','Fonctionnalité obligatoire : Documents','Documents','METIER',NULL,'LIVREE','Le document fixe 5 Mo. La valeur était 10 Mo dans le .env comme dans le défaut du code : les deux ont été corrigées, et alignées sur le référentiel des types de documents.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(404,'OBLIGATOIRE',79,'OBLIGATOIRE','Nom de fichier sécurisé (UUID)','Fonctionnalité obligatoire : Documents','Documents','METIER',NULL,'LIVREE','Le nom était horodatage + aléatoire. Le nom d’origine disparaît désormais : un fichier déposé sous « contrat_secret.docx » ne conserve plus son nom sur le disque du serveur.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(405,'OBLIGATOIRE',80,'OBLIGATOIRE','Lien avec le dossier','Fonctionnalité obligatoire : Documents','Documents','METIER','upload_document','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(406,'OBLIGATOIRE',81,'OBLIGATOIRE','Téléchargement contrôlé','Fonctionnalité obligatoire : Documents','Documents','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(407,'OBLIGATOIRE',82,'OBLIGATOIRE','Archivage des pièces','Fonctionnalité obligatoire : Documents','Documents','METIER','view_archives','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(408,'OBLIGATOIRE',83,'OBLIGATOIRE','Créer un courrier entrant','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(409,'OBLIGATOIRE',84,'OBLIGATOIRE','Créer un courrier sortant','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(410,'OBLIGATOIRE',85,'OBLIGATOIRE','Lier à un dossier','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(411,'OBLIGATOIRE',86,'OBLIGATOIRE','Numérotation automatique','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(412,'OBLIGATOIRE',87,'OBLIGATOIRE','Recherche par référence','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(413,'OBLIGATOIRE',88,'OBLIGATOIRE','Notifications personnelles','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(414,'OBLIGATOIRE',89,'OBLIGATOIRE','Notifications cliquables','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(415,'OBLIGATOIRE',90,'OBLIGATOIRE','Redirection automatique','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(416,'OBLIGATOIRE',91,'OBLIGATOIRE','Badge de compteur','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(417,'OBLIGATOIRE',92,'OBLIGATOIRE','Marquer comme lue','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(418,'OBLIGATOIRE',93,'OBLIGATOIRE','Tout marquer comme lu','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE','Le contrôleur appelait markAllAsRead, le service exporte markAllRead. Une lettre de différence, invisible à la lecture et qui renvoyait 500 à chaque clic.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(419,'OBLIGATOIRE',94,'OBLIGATOIRE','Types de notifications','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE','Neuf types sont en usage : AFFECTATION, VERIFICATION, VALIDATION, CLOTURE, SIGNATURE, INFO, CORRECTION, WORKFLOW, MENTION. Le document en annonce six ; le nombre est une question libre, pas une règle : ce qui compte est la classification, elle existe.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(420,'OBLIGATOIRE',95,'OBLIGATOIRE','Recherche par numéro','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(421,'OBLIGATOIRE',96,'OBLIGATOIRE','Recherche par nom','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(422,'OBLIGATOIRE',97,'OBLIGATOIRE','Recherche par CIN','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(423,'OBLIGATOIRE',98,'OBLIGATOIRE','Filtres par type','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(424,'OBLIGATOIRE',99,'OBLIGATOIRE','Filtres par statut','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(425,'OBLIGATOIRE',100,'OBLIGATOIRE','Filtres par division','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(426,'OBLIGATOIRE',101,'OBLIGATOIRE','Filtres par période','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(427,'OBLIGATOIRE',102,'OBLIGATOIRE','Dashboard Chef de Service','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(428,'OBLIGATOIRE',103,'OBLIGATOIRE','Dashboard Chef de Division','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(429,'OBLIGATOIRE',104,'OBLIGATOIRE','Dashboard Agent','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER',NULL,'LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(430,'OBLIGATOIRE',105,'OBLIGATOIRE','Dashboard Administrateur','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(431,'OBLIGATOIRE',106,'OBLIGATOIRE','KPI par rôle','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(432,'OBLIGATOIRE',107,'OBLIGATOIRE','Graphiques','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(433,'OBLIGATOIRE',108,'OBLIGATOIRE','Rapport d’activité','Fonctionnalité obligatoire : Rapports','Rapports','METIER','consolidate_reports','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(434,'OBLIGATOIRE',109,'OBLIGATOIRE','Dossiers reçus','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(435,'OBLIGATOIRE',110,'OBLIGATOIRE','Dossiers traités','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(436,'OBLIGATOIRE',111,'OBLIGATOIRE','Dossiers en retard','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(437,'OBLIGATOIRE',112,'OBLIGATOIRE','Activité par division','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(438,'OBLIGATOIRE',113,'OBLIGATOIRE','Activité par agent','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(439,'OBLIGATOIRE',114,'OBLIGATOIRE','Export PDF','Fonctionnalité obligatoire : Rapports','Rapports','METIER','export_data','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(440,'OBLIGATOIRE',115,'OBLIGATOIRE','Export Excel','Fonctionnalité obligatoire : Rapports','Rapports','METIER','export_data','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(441,'OBLIGATOIRE',116,'OBLIGATOIRE','Archiver un dossier','Fonctionnalité obligatoire : Archivage','Archivage','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(442,'OBLIGATOIRE',117,'OBLIGATOIRE','Consulter les archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(443,'OBLIGATOIRE',118,'OBLIGATOIRE','Rechercher dans les archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(444,'OBLIGATOIRE',119,'OBLIGATOIRE','Trier les archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(445,'OBLIGATOIRE',120,'OBLIGATOIRE','Protection des archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE','Un dossier ne peut être restauré qu’une fois, et la restauration est tracée.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(446,'OBLIGATOIRE',121,'OBLIGATOIRE','Journal des actions','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(447,'OBLIGATOIRE',122,'OBLIGATOIRE','Date et heure exactes','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(448,'OBLIGATOIRE',123,'OBLIGATOIRE','Agent responsable','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(449,'OBLIGATOIRE',124,'OBLIGATOIRE','Historique par dossier','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(450,'OBLIGATOIRE',125,'OBLIGATOIRE','Ancienne et nouvelle valeur','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(451,'OBLIGATOIRE',126,'OBLIGATOIRE','Gestion des utilisateurs','Fonctionnalité obligatoire : Administration','Administration','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(452,'OBLIGATOIRE',127,'OBLIGATOIRE','Gestion des rôles','Fonctionnalité obligatoire : Administration','Administration','METIER','manage_roles','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(453,'OBLIGATOIRE',128,'OBLIGATOIRE','Gestion des permissions','Fonctionnalité obligatoire : Administration','Administration','METIER','manage_roles','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(454,'OBLIGATOIRE',129,'OBLIGATOIRE','Consultation des logs','Fonctionnalité obligatoire : Administration','Administration','METIER','view_audit','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(455,'OBLIGATOIRE',130,'OBLIGATOIRE','Consultation de l’audit','Fonctionnalité obligatoire : Administration','Administration','METIER','view_audit','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(456,'OBLIGATOIRE',131,'OBLIGATOIRE','Sauvegardes','Fonctionnalité obligatoire : Administration','Administration','METIER','system_config','LIVREE','L’API est complète et testée : 47 tables sur 47, pièces jointes comprises. L’écran n’existe pas encore.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(457,'OBLIGATOIRE',132,'OBLIGATOIRE','Monitoring','Fonctionnalité obligatoire : Administration','Administration','METIER',NULL,'NON_CONSTRUITE','Aucune mesure des performances du serveur ou de l’application n’est relevée.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(458,'OBLIGATOIRE',133,'OBLIGATOIRE','Division Visa — gérer l’intégration','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(459,'OBLIGATOIRE',134,'OBLIGATOIRE','Division Visa — renouvellement de contrat','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(460,'OBLIGATOIRE',135,'OBLIGATOIRE','Division Visa — avancement de classe','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(461,'OBLIGATOIRE',136,'OBLIGATOIRE','Division Visa — vérifier les dossiers','Fonctionnalité obligatoire : Divisions','Divisions','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(462,'OBLIGATOIRE',137,'OBLIGATOIRE','Division Visa — archiver après signature','Fonctionnalité obligatoire : Divisions','Divisions','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(463,'OBLIGATOIRE',138,'OBLIGATOIRE','Division Solde — traiter les salaires','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(464,'OBLIGATOIRE',139,'OBLIGATOIRE','Division Solde — gérer le mandatement','Fonctionnalité obligatoire : Divisions','Divisions','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(465,'OBLIGATOIRE',140,'OBLIGATOIRE','Division Solde — vérifier les certificats de cessation','Fonctionnalité obligatoire : Divisions','Divisions','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(466,'OBLIGATOIRE',141,'OBLIGATOIRE','Division Solde — vérifier les décomptes d’avance','Fonctionnalité obligatoire : Divisions','Divisions','METIER','controler_decomptes','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(467,'OBLIGATOIRE',142,'OBLIGATOIRE','Division Solde — approuver les bons de caisse','Fonctionnalité obligatoire : Divisions','Divisions','METIER','approuver_bons','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(468,'OBLIGATOIRE',143,'OBLIGATOIRE','Division Solde — gérer les dossiers mères','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(469,'OBLIGATOIRE',144,'OBLIGATOIRE','Division Pension — gérer la liquidation','Fonctionnalité obligatoire : Divisions','Divisions','METIER','liquider_pension','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(470,'OBLIGATOIRE',145,'OBLIGATOIRE','Division Pension — lettres de prescription','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(471,'OBLIGATOIRE',146,'OBLIGATOIRE','Division Pension — gérer les oppositions','Fonctionnalité obligatoire : Divisions','Divisions','METIER','suivre_oppositions','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(472,'OBLIGATOIRE',147,'OBLIGATOIRE','Division Pension — transmettre les derniers arrérages','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_correspondances','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(473,'OBLIGATOIRE',148,'OBLIGATOIRE','Division Pension — certificats de cessation','Fonctionnalité obligatoire : Divisions','Divisions','METIER','liquider_pension','PARTIELLE','La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(474,'OBLIGATOIRE',149,'OBLIGATOIRE','Division Secours — réceptionner les dossiers du CF','Fonctionnalité obligatoire : Divisions','Divisions','METIER','enregistrer_visa_cf','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(475,'OBLIGATOIRE',150,'OBLIGATOIRE','Division Secours — préparer le mandatement','Fonctionnalité obligatoire : Divisions','Divisions','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(476,'OBLIGATOIRE',151,'OBLIGATOIRE','Division Secours — gérer l’ordonnancement','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_ordonnancement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(477,'OBLIGATOIRE',152,'OBLIGATOIRE','Division Secours — imprimer les huit pièces','Fonctionnalité obligatoire : Divisions','Divisions','METIER','preparer_mandatement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(478,'OBLIGATOIRE',153,'OBLIGATOIRE','Division Secours — dépouiller les dossiers','Fonctionnalité obligatoire : Divisions','Divisions','METIER','depouiller_pieces','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(479,'OBLIGATOIRE',154,'OBLIGATOIRE','Division Secours — archiver les pièces','Fonctionnalité obligatoire : Divisions','Divisions','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(480,'OBLIGATOIRE',155,'OBLIGATOIRE','Chef de Service — valider les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','valider_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(481,'OBLIGATOIRE',156,'OBLIGATOIRE','Chef de Service — signer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','signer_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(482,'OBLIGATOIRE',157,'OBLIGATOIRE','Chef de Service — clôturer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','cloturer_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(483,'OBLIGATOIRE',158,'OBLIGATOIRE','Chef de Service — archiver les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(484,'OBLIGATOIRE',159,'OBLIGATOIRE','Chef de Service — superviser les divisions','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_all_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(485,'OBLIGATOIRE',160,'OBLIGATOIRE','Secrétaire — réceptionner les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(486,'OBLIGATOIRE',161,'OBLIGATOIRE','Secrétaire — créer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(487,'OBLIGATOIRE',162,'OBLIGATOIRE','Secrétaire — enregistrer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','create_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(488,'OBLIGATOIRE',163,'OBLIGATOIRE','Secrétaire — orienter les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','orienter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(489,'OBLIGATOIRE',164,'OBLIGATOIRE','Secrétaire — gérer la chronologie des actes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_chronologie_actes','LIVREE','Registre des actes construit : numérotation atomique par famille et par année au format {PRÉFIXE}-{ANNEE}-{6CAR}, recherche, annulation motivée qui ne libère pas le numéro, et détection des numéros manquants. Les types d’actes sont dans une table, trois types sont amorcés : le document ne décrit pas la nomenclature complète, et le reste s’ajoute sans migration.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(490,'OBLIGATOIRE',165,'OBLIGATOIRE','Chef BAAF — gérer les documents comptables','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_documents','PARTIELLE','Le dépôt et l’archivage des documents fonctionnent. L’analyse des pièces comptables elle-même n’existe pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(491,'OBLIGATOIRE',166,'OBLIGATOIRE','Chef BAAF — saisir sur SIIGFP','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'HORS_PLATEFORME','SIIGFP est un système financier externe du Ministère. La plateforme prépare les données, elle n’y écrit pas.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(492,'OBLIGATOIRE',167,'OBLIGATOIRE','Chef BAAF — saisir sur SIIGMP','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'HORS_PLATEFORME','SIIGMP est un système externe. Même limite que pour SIIGFP.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(493,'OBLIGATOIRE',168,'OBLIGATOIRE','Chef BAAF — produire les situations FCC/BCSE','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'NON_CONSTRUITE','La nomenclature FCC/BCSE n’est décrite nulle part. Un état produit sans elle ne serait conforme à rien.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(494,'OBLIGATOIRE',169,'OBLIGATOIRE','Chef BAAF — gérer le personnel','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_personnel','PARTIELLE','La gestion des agents existe. Congés et permissions non : le droit du travail malgache n’est pas documenté et les droits ne peuvent pas être inventés.','2026-10-05 07:24:41','2026-10-05 07:24:41'),
(495,'OBLIGATOIRE',170,'OBLIGATOIRE','Chef BAAF — établir les pièces de déplacement','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','etablir_pieces_deplacement','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(496,'OBLIGATOIRE',171,'OBLIGATOIRE','Coordonnatrice — créer les immatriculations','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_immatriculations','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(497,'OBLIGATOIRE',172,'OBLIGATOIRE','Coordonnatrice — gérer les insertions Augure','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_augure','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(498,'OBLIGATOIRE',173,'OBLIGATOIRE','Coordonnatrice — traiter les changements de paiement','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_paiements','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(499,'OBLIGATOIRE',174,'OBLIGATOIRE','Coordonnatrice — préparer les rapports','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','consolidate_reports','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(500,'OBLIGATOIRE',175,'OBLIGATOIRE','Chefs de Division — affecter les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','affecter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(501,'OBLIGATOIRE',176,'OBLIGATOIRE','Chefs de Division — vérifier les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(502,'OBLIGATOIRE',177,'OBLIGATOIRE','Chefs de Division — valider les conformes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','valider_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(503,'OBLIGATOIRE',178,'OBLIGATOIRE','Chefs de Division — retourner pour correction','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','verifier_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(504,'OBLIGATOIRE',179,'OBLIGATOIRE','Chefs de Division — produire les rapports','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_stats','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(505,'OBLIGATOIRE',180,'OBLIGATOIRE','Agents — consulter mes dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_assigned_dossiers','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(506,'OBLIGATOIRE',181,'OBLIGATOIRE','Agents — traiter les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(507,'OBLIGATOIRE',182,'OBLIGATOIRE','Agents — soumettre à vérification','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','soumettre_verification','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(508,'OBLIGATOIRE',183,'OBLIGATOIRE','Agents — corriger les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','traiter_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(509,'OBLIGATOIRE',184,'OBLIGATOIRE','Agents — archiver les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','archiver_dossier','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(510,'OBLIGATOIRE',185,'OBLIGATOIRE','Administrateur — gérer les comptes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_users','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(511,'OBLIGATOIRE',186,'OBLIGATOIRE','Administrateur — gérer les rôles','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_roles','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(512,'OBLIGATOIRE',187,'OBLIGATOIRE','Administrateur — consulter les logs','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_audit','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(513,'OBLIGATOIRE',188,'OBLIGATOIRE','Administrateur — lancer les sauvegardes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','system_config','LIVREE',NULL,'2026-10-05 07:24:41','2026-10-05 07:24:41'),
(514,'OBLIGATOIRE',189,'OBLIGATOIRE','Administrateur — surveiller les performances','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'NON_CONSTRUITE','Aucune mesure des performances n’est relevée : ni serveur, ni application.','2026-10-05 07:24:41','2026-10-05 07:24:41');
/*!40000 ALTER TABLE `referentiel_fonctionnalites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `referentiel_postes`
--

DROP TABLE IF EXISTS `referentiel_postes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `referentiel_postes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(60) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `role_nom` varchar(60) DEFAULT NULL,
  `niveau` tinyint(1) NOT NULL DEFAULT 3,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_poste_code` (`code`),
  KEY `idx_poste_role` (`role_nom`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referentiel_postes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `referentiel_postes` WRITE;
/*!40000 ALTER TABLE `referentiel_postes` DISABLE KEYS */;
INSERT INTO `referentiel_postes` VALUES
(1,'MINISTERE','Ministère de l’Économie et des Finances',NULL,0,1,'2026-10-05 07:24:41'),
(2,'DGB','Direction Générale du Budget et des Finances',NULL,1,1,'2026-10-05 07:24:41'),
(3,'DSP','Direction de la Solde et des Pensions',NULL,2,1,'2026-10-05 07:24:41'),
(4,'CHEF_SERVICE','Chef de Service','CHEF_SERVICE',1,1,'2026-10-05 07:24:41'),
(5,'CHEF_BAAF','Chef BAAF','CHEF_BAAF',2,1,'2026-10-05 07:24:41'),
(6,'COORDONNATRICE','Coordonnatrice','COORDINATRICE',2,1,'2026-10-05 07:24:41'),
(7,'SECRETARIAT','Secrétariat','SECRETAIRE',3,1,'2026-10-05 07:24:41'),
(8,'CHEF_DIV_VISA','Chef de Division Visas','CHEF_DIVISION_VISA',2,1,'2026-10-05 07:24:41'),
(9,'CHEF_DIV_SOLDE','Chef de Division Solde','CHEF_DIVISION_SOLDE',2,1,'2026-10-05 07:24:41'),
(10,'CHEF_DIV_PENSION','Chef de Division Pensions','CHEF_DIVISION_PENSION',2,1,'2026-10-05 07:24:41'),
(11,'CHEF_DIV_SECOURS','Chef de Division Secours','CHEF_DIVISION_SECOURS',2,1,'2026-10-05 07:24:41'),
(12,'VERIF_VISA','Vérificateurs Visas','VERIFICATEUR_VISA',3,1,'2026-10-05 07:24:41'),
(13,'VERIF_SOLDE','Vérificateurs Solde','VERIFICATEUR_SOLDE',3,1,'2026-10-05 07:24:41'),
(14,'LIQUIDATEUR','Liquidateurs Pensions','LIQUIDATEUR_PENSION',3,1,'2026-10-05 07:24:41'),
(15,'CHARGE_SECOURS','Chargés de Secours','CHARGE_SECOURS',3,1,'2026-10-05 07:24:41'),
(16,'ACCUEIL','Accueil',NULL,3,1,'2026-10-05 07:24:41'),
(17,'SUIVI_COURRIERS','Suivi des courriers',NULL,3,1,'2026-10-05 07:24:41'),
(18,'OBLIGATOIRE','Fonctionnalités obligatoires du projet',NULL,9,1,'2026-10-05 07:24:41');
/*!40000 ALTER TABLE `referentiel_postes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `referentiel_service`
--

DROP TABLE IF EXISTS `referentiel_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `referentiel_service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cle` varchar(60) NOT NULL,
  `libelle` varchar(200) NOT NULL,
  `valeur` varchar(500) DEFAULT NULL,
  `categorie` varchar(60) NOT NULL,
  `ordre` smallint(5) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_cle` (`cle`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referentiel_service`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `referentiel_service` WRITE;
/*!40000 ALTER TABLE `referentiel_service` DISABLE KEYS */;
INSERT INTO `referentiel_service` VALUES
(1,'DENOMINATION','Dénomination','Service Régional de la Solde et des Pensions','IDENTITE',10),
(2,'ACRONYME','Acronyme','SRSP','IDENTITE',20),
(3,'SIGLE_LOGO','Logo','DSP — Direction de la Solde et des Pensions','IDENTITE',30),
(4,'FORME_JURIDIQUE','Forme juridique','Entité gouvernementale relevant de l’administration publique','IDENTITE',40),
(5,'SIEGE_CENTRAL','Siège central','Immeuble Antaninarenina, Antananarivo','COORDONNEES',50),
(6,'SIEGE_SUCCURSALE','Siège succursale','Ambodiaplay, Manakara','COORDONNEES',60),
(7,'TELEPHONES','Téléphones','+261 32 11 090 10 / +261 32 25 469 11','COORDONNEES',70),
(8,'EMAIL','Email','srsp.fitovinany@dgfag.mg','COORDONNEES',80),
(9,'RATTACHEMENT','Rattachement','Ministère de l’Économie et des Finances → Direction Générale du Trésor → Direction de la Solde et des Pensions','IDENTITE',90),
(10,'DATE_CREATION','Établissement','22 septembre 2011','HISTORIQUE',100),
(11,'REGION_ORIGINE','Région d’origine','Vatovavy Fitovinany','HISTORIQUE',110),
(12,'PROVINCE','Province de rattachement','Fianarantsoa','HISTORIQUE',120),
(13,'SCISSION_2022','Scission de 2022','La région Vatovavy et Fitovinany devient deux entités distinctes ; le SRSP est divisé en antennes Mananjary et Manakara','HISTORIQUE',130),
(14,'REGIONS_MALGACHES','Régions de Madagascar','23 depuis 2022','HISTORIQUE',140),
(15,'OBJECTIF_SOLDE','Objectif 1','Calculer et payer les salaires des fonctionnaires et employés du secteur public relevant de sa compétence territoriale','OBJECTIFS',150),
(16,'OBJECTIF_PENSION','Objectif 2','Gérer les pensions de retraite des fonctionnaires','OBJECTIFS',160),
(17,'OBJECTIF_CONFORMITE','Objectif 3','Veiller à la conformité des versements au regard de la réglementation en vigueur et des conventions collectives applicables','OBJECTIFS',170),
(18,'EFFECTIF_2011','Effectif à la création','6 membres','EFFECTIFS',180),
(19,'EFFECTIF_ACTUEL','Effectif actuel','21 membres','EFFECTIFS',190);
/*!40000 ALTER TABLE `referentiel_service` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES
(1,1),
(5,1),
(1,2),
(4,2),
(5,2),
(1,3),
(1,4),
(5,4),
(1,5),
(2,5),
(6,5),
(8,5),
(10,5),
(12,5),
(1,6),
(2,6),
(7,6),
(9,6),
(11,6),
(13,6),
(1,7),
(7,7),
(9,7),
(11,7),
(13,7),
(1,8),
(2,8),
(6,8),
(8,8),
(10,8),
(12,8),
(1,9),
(2,9),
(6,9),
(8,9),
(1,10),
(2,10),
(1,11),
(2,11),
(1,12),
(2,12),
(1,13),
(2,13),
(3,13),
(4,13),
(5,13),
(6,13),
(8,13),
(10,13),
(12,13),
(1,14),
(7,14),
(9,14),
(11,14),
(13,14),
(1,15),
(1,16),
(1,17),
(1,18),
(1,19),
(1,20),
(1,21),
(2,21),
(3,21),
(5,21),
(1,22),
(3,22),
(1,23),
(2,23),
(3,23),
(4,23),
(5,23),
(6,23),
(7,23),
(8,23),
(9,23),
(10,23),
(11,23),
(12,23),
(13,23),
(1,24),
(2,24),
(3,24),
(4,24),
(6,24),
(8,24),
(10,24),
(12,24),
(1,25),
(2,25),
(1,26),
(3,26),
(1,27),
(8,27),
(1,28),
(8,28),
(1,29),
(9,29),
(1,30),
(10,30),
(1,31),
(10,31),
(1,32),
(11,32),
(1,33),
(11,33),
(1,34),
(12,34),
(1,35),
(12,35),
(1,36),
(12,36),
(1,37),
(13,37),
(1,38),
(13,38),
(1,83),
(3,83),
(1,84),
(1,85),
(3,85),
(1,86),
(2,86),
(1,87),
(3,87),
(1,88),
(1,89),
(1,90),
(1,91),
(1,92);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'ADMIN','Administrateur système du SRSP','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(2,'CHEF_SERVICE','Chef de Service SRSP – supervision, validation et signature finale','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(3,'CHEF_BAAF','Chef BAAF – documents comptables, rapports, secrétariat','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(4,'COORDINATRICE','Coordonnatrice – immatriculation, insertions Augure, changements de paiement','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(5,'SECRETAIRE','Secrétaire – réception, enregistrement, distribution et chronologie','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(6,'CHEF_DIVISION_VISA','Chef Division Visa – supervision, vérification et rapports Visa','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(7,'VERIFICATEUR_VISA','Vérificateur de la Division Visa – exploitation, vérification, archivage','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(8,'CHEF_DIVISION_SOLDE','Chef Division Solde – supervision du mandatement, contrôles, bons de caisse','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(9,'VERIFICATEUR_SOLDE','Vérificateur de la Division Solde – exploitation, fiches de contrôle, mandatement','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(10,'CHEF_DIVISION_PENSION','Chef Division Pension – supervision de la liquidation, vérification','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(11,'LIQUIDATEUR_PENSION','Liquidateur de la Division Pension – liquidation, secours, dossiers mères, certificats','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(12,'CHEF_DIVISION_SECOURS','Chef Division Secours – réception, préparation, mandatement, ordonnancement','2026-10-05 07:24:40','2026-10-05 07:24:40'),
(13,'CHARGE_SECOURS','Chargé de la Division Secours – traitement, dépouillement, archivage des pièces','2026-10-05 07:24:40','2026-10-05 07:24:40');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` int(11) NOT NULL,
  `fichier` varchar(255) NOT NULL,
  `sha256` char(64) NOT NULL,
  `lignes` int(11) NOT NULL DEFAULT 0,
  `applique_le` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_schema_migrations_fichier` (`fichier`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `schema_migrations` WRITE;
/*!40000 ALTER TABLE `schema_migrations` DISABLE KEYS */;
INSERT INTO `schema_migrations` VALUES
(1,1,'001_create_roles.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(2,2,'002_create_users.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(3,3,'003_create_permissions.sql','5206c54c607f5be0d234d83791175844f9f81e790003531e0769872a1f348251',8,'2026-10-05 10:24:40'),
(4,4,'004_create_role_permissions.sql','748e49a58ee5c632fb1c19c758a6d1a90d9553ff52d95a2f11e6d822f06a004a',9,'2026-10-05 10:24:40'),
(5,5,'005_create_divisions.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(6,6,'006_create_fonctions.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(7,7,'007_create_agents.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(8,8,'008_create_types_dossiers.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(9,9,'009_create_statuts_dossiers.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(10,10,'010_create_priorites.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(11,11,'011_create_dossiers.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(12,12,'012_create_documents.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(13,13,'013_create_courriers.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(14,14,'014_create_notifications.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(15,15,'015_create_historique.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(16,16,'016_create_archives.sql','e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',1,'2026-10-05 10:24:40'),
(17,17,'017_rbac_cahier_v2.sql','2dfeb888875bc6ebfaba614f960e0c596ee62985f8f7abebd422f8c0874b7438',167,'2026-10-05 10:24:40'),
(18,18,'018_securite_audit_ip.sql','e97245c56de6817762a0053143a081adc1860698bf4754ae14a42a838c972fc7',16,'2026-10-05 10:24:40'),
(19,19,'019_perimetre_agents.sql','4975ce7ff33c7501e49c344ca4e5aa8a2b37825cf90492898dfde268f79c352e',18,'2026-10-05 10:24:40'),
(20,20,'020_depouillement.sql','172e083e060b5fe168039b7439adaee99ed79bdd7549b5fbe95e73d6ad7b0fc1',43,'2026-10-05 10:24:40'),
(21,21,'021_calculs_financiers.sql','d381fdc9c308c21dd6deeb7274312d33ab39a38e9b0a782ff8010be8131c8cdd',75,'2026-10-05 10:24:40'),
(22,22,'022_officiel_mandatement_correspondances.sql','3665fca76e8628bee9bb0b11e99b7b2013e9ab37739c5b8360a55665cb35d3f2',127,'2026-10-05 10:24:40'),
(23,23,'023_division_type_dossier.sql','f3fee98ae8abff7afa09045b2aecee235f06145b2c9a7fb177722aba5b788f7c',42,'2026-10-05 10:24:40'),
(24,24,'024_notifications_personnelles.sql','e2dcfeaf34592468eb4ec5579fef3cb329fcc6a5bdecdc632df7ab20ff712480',54,'2026-10-05 10:24:40'),
(25,25,'025_notifications_backfill.sql','8a14b2d15e7a100742042db76cf37f8e417ac5e234edfdac3f17d61d5fb764de',43,'2026-10-05 10:24:40'),
(26,26,'026_securite_urgences_commentaires.sql','f65d8cb2cd32cafb8860fdd61dbc2f83e5f03bdfd7a5c1dc4965dccb41cab2e6',62,'2026-10-05 10:24:41'),
(27,27,'027_libelles_types_dossiers.sql','9fe24f7291df90d2a8759046ba3ffbc239714be97141fbf162000af3449cd5b0',20,'2026-10-05 10:24:41'),
(28,28,'028_controle_decompte_chef_service.sql','d52e7e55a208a31e60f908ea77ef950219d9c2ec99d18a918addd1a021aebbaf',28,'2026-10-05 10:24:41'),
(29,29,'029_responsabilites_par_role.sql','b60a35e2f67c839061f1cfbbc5531ba6af1e5f7f43f2de9c1190e5e29b3b1195',56,'2026-10-05 10:24:41'),
(30,30,'030_notifications_dossier_integrite.sql','7b37510416f9fd24ddb99e120b82755b1a38a7f860f4f0468c4aa93622335444',28,'2026-10-05 10:24:41'),
(31,31,'031_consultation_archives.sql','6be0cdd292fe54ae570618685a96bf818a41b4f123d66e57f0c2f4ded6bc929a',32,'2026-10-05 10:24:41'),
(32,32,'032_unicite_archive_par_dossier.sql','cb7adffd452a5c110723a195e45ff44c053e0147603077669c6f5dc2a0d41944',50,'2026-10-05 10:24:41'),
(33,33,'033_consultation_journal.sql','04bbc89b16518890a10db64e674b4e348a6beb606b41812df363c43538720f6b',43,'2026-10-05 10:24:41'),
(34,34,'034_gestion_administrative.sql','d3bb2013e0e5f3f4d991aa55c15ce85c6c914b6728df7afa607583e3b1fceeaa',153,'2026-10-05 10:24:41'),
(35,34,'034_identification_demandeur.sql','0b59da7bf27797d3f21e36dfa8072b153df408120f6b99ca94b926829e861d18',79,'2026-10-05 10:24:41'),
(36,35,'035_pieces_deplacement.sql','e1dd92044cc1e3331a1339fe793dd338db509c8db4b7ae36a058a3fa83b652a0',116,'2026-10-05 10:24:41'),
(37,36,'036_permissions_baaf.sql','ed3831cd1823e90bb9e96a5b98c1c57e9f9921eeaeaeddc5f30378c67784188b',47,'2026-10-05 10:24:41'),
(38,37,'037_secours_cf_emargement.sql','f25892ecf8efc7d92597ef702a52bcc4c0488eae9f9f7e298b494cdd8d044838',157,'2026-10-05 10:24:41'),
(39,38,'038_permissions_secours.sql','469ae32080745c37443befd452f8c56f4c19aa37c315061567724ee4eef222aa',46,'2026-10-05 10:24:41'),
(40,39,'039_signature_mandatement.sql','e22ef1d381ae8b1e65634c60f15ee60f52492cceed5f30766a797764bc9a6213',45,'2026-10-05 10:24:41'),
(41,40,'040_compteurs_numerotation.sql','5610b266b735f75da743bbc0589407302e28f5559c8e91e173ddde2a10103f11',65,'2026-10-05 10:24:41'),
(42,41,'041_cles_etrangeres_manquantes.sql','730b1cbb99518101fcaff4f99af417f946ac34c70c7632316d404350cd477fb1',48,'2026-10-05 10:24:41'),
(43,42,'042_perimetre_geographique.sql','59bb09113eff716b3dda5f76c01b78bd3371c17353e619ab103cccd14509e55d',120,'2026-10-05 10:24:41'),
(44,43,'043_referentiel_fonctionnalites.sql','392f114628b7a2d08b8e38b6df2a7665cd58c8aa77798846a6429463e1b88988',208,'2026-10-05 10:24:41'),
(45,44,'044_referentiel_contenu.sql','b3a8e96511ced1fb59219f19e2440a1a4e00f604c53775c62216228ac00153d8',236,'2026-10-05 10:24:41'),
(46,45,'045_referentiel_contenu_2.sql','dcee9329a92f763268fe7f20fb41127de5f14c09a44475298773002d8ef0673b',342,'2026-10-05 10:24:41'),
(47,46,'046_fonctionnalites_obligatoires.sql','00a7d894a6f3f58d9e361785e73cd5e0339c11fd8063f6c95f6ce2622ac12cbc',375,'2026-10-05 10:24:41'),
(48,47,'047_chronologie_actes.sql','b4893dc9d7c8f513d3db722cc29c44a19578c51628e47c39725b7939879f8eeb',118,'2026-10-05 10:24:42');
/*!40000 ALTER TABLE `schema_migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `signatures_ordonnateur`
--

DROP TABLE IF EXISTS `signatures_ordonnateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `signatures_ordonnateur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mandatement_id` int(11) NOT NULL,
  `reference_signature` varchar(100) NOT NULL,
  `signe_par` int(11) DEFAULT NULL,
  `signe_le` datetime DEFAULT NULL,
  `archive_le` datetime DEFAULT NULL,
  `observations` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_signature_ord_mandatement` (`mandatement_id`),
  UNIQUE KEY `uk_signature_ord_reference` (`reference_signature`),
  KEY `idx_signature_ord_date` (`signe_le`),
  KEY `fk_signature_ord_user` (`signe_par`),
  CONSTRAINT `fk_signature_ord_mandatement` FOREIGN KEY (`mandatement_id`) REFERENCES `mandatements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_signature_ord_user` FOREIGN KEY (`signe_par`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signatures_ordonnateur`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `signatures_ordonnateur` WRITE;
/*!40000 ALTER TABLE `signatures_ordonnateur` DISABLE KEYS */;
/*!40000 ALTER TABLE `signatures_ordonnateur` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `statuts_dossiers`
--

DROP TABLE IF EXISTS `statuts_dossiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `statuts_dossiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `libelle` varchar(100) NOT NULL,
  `ordre` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statuts_dossiers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `statuts_dossiers` WRITE;
/*!40000 ALTER TABLE `statuts_dossiers` DISABLE KEYS */;
INSERT INTO `statuts_dossiers` VALUES
(1,'RECU','Reçu',1),
(2,'ENREGISTRE','Enregistré',2),
(3,'ORIENTE','Orienté',3),
(4,'AFFECTE','Affecté',4),
(5,'EN_TRAITEMENT','En traitement',5),
(6,'SOUMIS_A_VERIFICATION','Soumis à vérification',6),
(7,'CORRECTION_DEMANDEE','Correction demandée',7),
(8,'VALIDE','Validé',8),
(9,'SIGNE','Signé',9),
(10,'CLOTURE','Clôturé',10),
(11,'ARCHIVE','Archivé',11);
/*!40000 ALTER TABLE `statuts_dossiers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `traitements`
--

DROP TABLE IF EXISTS `traitements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `traitements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `date_debut` timestamp NULL DEFAULT current_timestamp(),
  `date_fin` timestamp NULL DEFAULT NULL,
  `observation` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traitements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `traitements` WRITE;
/*!40000 ALTER TABLE `traitements` DISABLE KEYS */;
INSERT INTO `traitements` VALUES
(2,2,1,'2026-10-05 08:14:19','2026-10-05 08:14:24',NULL);
/*!40000 ALTER TABLE `traitements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `transferts`
--

DROP TABLE IF EXISTS `transferts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `ancien_agent_id` int(11) DEFAULT NULL,
  `nouveau_agent_id` int(11) DEFAULT NULL,
  `motif` text DEFAULT NULL,
  `date_transfert` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `ancien_agent_id` (`ancien_agent_id`),
  KEY `nouveau_agent_id` (`nouveau_agent_id`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`ancien_agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`nouveau_agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transferts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `transferts` WRITE;
/*!40000 ALTER TABLE `transferts` DISABLE KEYS */;
/*!40000 ALTER TABLE `transferts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `types_actes`
--

DROP TABLE IF EXISTS `types_actes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_actes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `libelle` varchar(120) NOT NULL,
  `prefixe` varchar(10) NOT NULL,
  `description` text DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_acte_code` (`code`),
  UNIQUE KEY `uk_type_acte_prefixe` (`prefixe`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_actes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `types_actes` WRITE;
/*!40000 ALTER TABLE `types_actes` DISABLE KEYS */;
INSERT INTO `types_actes` VALUES
(1,'BON_ENTREE','Bon d’entrée','BE','Enregistrement d’une pièce ou d’un courrier reçu.',1,'2026-10-05 07:24:42'),
(2,'NOTE','Note de service','NOT','Note adressée à un agent, une division ou l’administration.',1,'2026-10-05 07:24:42'),
(3,'LETTRE','Lettre','LET','Correspondance formelle sortante.',1,'2026-10-05 07:24:42');
/*!40000 ALTER TABLE `types_actes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `types_courriers`
--

DROP TABLE IF EXISTS `types_courriers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_courriers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_types_courriers_libelle` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_courriers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `types_courriers` WRITE;
/*!40000 ALTER TABLE `types_courriers` DISABLE KEYS */;
INSERT INTO `types_courriers` VALUES
(5,'CIRCULAIRE'),
(6,'DECISION'),
(1,'DEMANDE'),
(2,'INFORMATION'),
(3,'NOTIFICATION'),
(4,'RAPPORT');
/*!40000 ALTER TABLE `types_courriers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `types_documents`
--

DROP TABLE IF EXISTS `types_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  `extensions_autorisees` varchar(255) DEFAULT 'pdf,jpg,jpeg,png,docx,xlsx',
  `taille_max` int(11) DEFAULT 10485760,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_types_documents_libelle` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `types_documents` WRITE;
/*!40000 ALTER TABLE `types_documents` DISABLE KEYS */;
INSERT INTO `types_documents` VALUES
(1,'PIECE_IDENTITE','pdf,jpg,jpeg,png',5242880),
(2,'ACTE_DECES','pdf,jpg,jpeg,png',5242880),
(3,'CERTIFICAT','pdf,jpg,jpeg,png',5242880),
(4,'RAPPORT','pdf,docx,doc',5242880),
(5,'DECOMPTE','xlsx,xls,pdf',5242880),
(6,'BON_CAISSE','pdf,xlsx',5242880),
(7,'AUTRE','pdf,docx,xlsx,jpg,jpeg,png',5242880);
/*!40000 ALTER TABLE `types_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `types_dossiers`
--

DROP TABLE IF EXISTS `types_dossiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_dossiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) DEFAULT NULL,
  `libelle` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_dossiers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `types_dossiers` WRITE;
/*!40000 ALTER TABLE `types_dossiers` DISABLE KEYS */;
INSERT INTO `types_dossiers` VALUES
(1,'VISA','Division Visa','Dossiers soumis pour visa et exploitation',1),
(2,'SOLDE','Division Solde','Dossiers de mandatement et avance de solde',1),
(3,'PENSION','Division Pension','Dossiers de liquidation de pension et secours au décès',1),
(4,'SECOURS','Division Secours','Dossiers de secours de décès',1);
/*!40000 ALTER TABLE `types_dossiers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `types_pieces`
--

DROP TABLE IF EXISTS `types_pieces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_pieces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `obligatoire` tinyint(1) NOT NULL DEFAULT 1,
  `phase` enum('DEPOUILLEMENT','ARCHIVAGE') NOT NULL DEFAULT 'ARCHIVAGE',
  `ordre` smallint(5) unsigned NOT NULL DEFAULT 0,
  `division_code` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_piece_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_pieces`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `types_pieces` WRITE;
/*!40000 ALTER TABLE `types_pieces` DISABLE KEYS */;
INSERT INTO `types_pieces` VALUES
(1,'ACTE_DECES','Acte de décès',1,'ARCHIVAGE',10,'SECOURS'),
(2,'ACTE_MARIAGE','Acte de mariage',1,'ARCHIVAGE',20,'SECOURS'),
(3,'CERT_NSC','Certificat de NSC',1,'ARCHIVAGE',30,'SECOURS'),
(4,'CERT_NDIV','Certificat de non-divorce',1,'ARCHIVAGE',40,'SECOURS'),
(5,'CIN_DEFUNT','CIN du défunt',1,'ARCHIVAGE',50,'SECOURS'),
(6,'CIN_BENEF','CIN du bénéficiaire',1,'ARCHIVAGE',60,'SECOURS'),
(7,'DECISION','Décision visée par le contrôle financier',1,'DEPOUILLEMENT',10,'SECOURS'),
(8,'ETAT_DECOMPTE','État de décompte',1,'DEPOUILLEMENT',20,'SECOURS'),
(9,'CCETPP','CCETPP',1,'DEPOUILLEMENT',30,'SECOURS'),
(10,'DEMANDE_INTERESSE','Demande de l\'intéressé(e)',1,'DEPOUILLEMENT',40,'SECOURS');
/*!40000 ALTER TABLE `types_pieces` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `types_pieces_deplacement`
--

DROP TABLE IF EXISTS `types_pieces_deplacement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_pieces_deplacement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_piece_dep_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_pieces_deplacement`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `types_pieces_deplacement` WRITE;
/*!40000 ALTER TABLE `types_pieces_deplacement` DISABLE KEYS */;
INSERT INTO `types_pieces_deplacement` VALUES
(1,'ORDRE_ROUTE','Ordre de route','Autorisation de ciruler pour une mission hors du ressort.','2026-10-05 07:24:41'),
(2,'ORDRE_MISSION','Ordre de mission','Instruction de se rendre sur un lieu et d y accomplir une tache.','2026-10-05 07:24:41'),
(3,'AUTORISATION_BC','Autorisation de retrait de bon de caisse','Retrait d un bon de caisse pour une depense de mission.','2026-10-05 07:24:41'),
(4,'NOTE_INTERIM','Note d interim','Assurance temporaire d un agent absent.','2026-10-05 07:24:41');
/*!40000 ALTER TABLE `types_pieces_deplacement` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `derniere_connexion` datetime DEFAULT NULL,
  `mot_de_passe_change_le` datetime DEFAULT NULL,
  `tentatives_echouees` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `verrouille_jusqua` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `idx_users_verrouille` (`verrouille_jusqua`),
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','admin@srsp.mg','$2b$10$Gz92O9veiYvVGNzC311z2.oZa3RQKxr7OuvJMdBFtqI497eFpub7m',1,1,'2026-10-07 11:36:30',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-07 08:36:30'),
(2,'chef.service','chefservice@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',2,1,'2026-10-05 11:16:17',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(3,'chef.baaf','chefbaaf@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',3,1,'2026-10-05 11:16:17',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(4,'coordinatrice','coordinatrice@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',4,1,'2026-10-05 10:54:05',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(5,'secretaire','secretaire@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',5,1,'2026-10-06 16:09:00',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-06 13:09:00'),
(6,'chef.visa','chef.visa@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',6,1,'2026-10-05 11:13:56',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(7,'verif.visa','verif.visa@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',7,1,'2026-10-05 11:16:17',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(8,'chef.solde','chef.solde@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',8,1,'2026-10-05 10:54:05',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(9,'verif.solde','verif.solde@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',9,1,'2026-10-05 10:54:05',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(10,'chef.pension','chef.pension@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',10,1,'2026-10-05 10:54:05',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(11,'liquidateur','liquidateur@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',11,1,'2026-10-05 10:54:05',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(12,'chef.secours','chef.secours@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',12,1,'2026-10-05 11:13:54',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-05 08:36:40'),
(13,'charge.secours','charge.secours@srsp.mg','$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu',13,1,'2026-10-06 15:32:58',NULL,0,NULL,'2026-10-05 07:24:42','2026-10-06 12:32:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `validations`
--

DROP TABLE IF EXISTS `validations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `validations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `valide_par` int(11) DEFAULT NULL,
  `decision` varchar(50) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `date_validation` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `valide_par` (`valide_par`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`valide_par`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `validations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `validations` WRITE;
/*!40000 ALTER TABLE `validations` DISABLE KEYS */;
INSERT INTO `validations` VALUES
(1,2,1,'VALIDE',NULL,'2026-10-05 08:14:30'),
(2,2,1,'SIGNE','SRSP','2026-10-05 08:14:38'),
(3,1,1,'VALIDE',NULL,'2026-10-06 06:16:32'),
(4,1,1,'SIGNE','SRSP','2026-10-06 06:16:38');
/*!40000 ALTER TABLE `validations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `verifications`
--

DROP TABLE IF EXISTS `verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `resultat` varchar(50) DEFAULT NULL,
  `observation` text DEFAULT NULL,
  `date_verification` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `agent_id` (`agent_id`),
  CONSTRAINT `1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `verifications` WRITE;
/*!40000 ALTER TABLE `verifications` DISABLE KEYS */;
INSERT INTO `verifications` VALUES
(2,2,1,'OK',NULL,'2026-10-05 08:14:24');
/*!40000 ALTER TABLE `verifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `visas_controle_financier`
--

DROP TABLE IF EXISTS `visas_controle_financier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `visas_controle_financier` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) NOT NULL,
  `numero_visa` varchar(100) NOT NULL,
  `signe_par` varchar(150) DEFAULT NULL,
  `date_visa` date NOT NULL,
  `commentaire` text DEFAULT NULL,
  `enregistre_par` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visa_cf_dossier` (`dossier_id`),
  UNIQUE KEY `uk_visa_cf_numero_unique` (`numero_visa`),
  KEY `idx_visa_cf_numero` (`numero_visa`),
  KEY `fk_visa_cf_user` (`enregistre_par`),
  CONSTRAINT `fk_visa_cf_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visa_cf_user` FOREIGN KEY (`enregistre_par`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visas_controle_financier`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `visas_controle_financier` WRITE;
/*!40000 ALTER TABLE `visas_controle_financier` DISABLE KEYS */;
/*!40000 ALTER TABLE `visas_controle_financier` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-07 11:40:32
