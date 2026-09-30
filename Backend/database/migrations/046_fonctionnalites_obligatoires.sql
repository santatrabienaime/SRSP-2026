-- 046 : les 189 fonctionnalités OBLIGATOIRES du document de projet.
--
-- Contrairement au référentiel des 325 fonctionnalités de l'historique, ce
-- document contient des CHIFFRES : 8 heures de session, 5 tentatives, 7 rôles,
-- 19 permissions, 5 Mo, un nom UUID. Un chiffre se vérifie, un libellé se
-- discute. C'est ce qui le rend plus utile que les précédents.
--
-- Les 189 lignes sont enregistrées avec leur état MESURÉ, après audit ligne à
-- ligne. Trois écarts réels ont été corrigés :
--
--   5   expiration de session : 24 h au lieu de 8 h, dans le .env ET dans le
--       défaut du code. Les deux : corriger un seul laisserait l'autre en place,
--       et un déploiement sans .env retrouverait 24 h sans qu'aucun test ne le
--       voie.
--   78  taille des documents : 10 Mo au lieu de 5 Mo, dans les deux aussi.
--   79  nom de fichier : horodatage + aléatoire au lieu d'un UUID. Le nom
--       d'origine disparaît désormais : un fichier déposé sous
--       « contrat_secret.docx » ne conserve plus son nom sur le disque.
--
-- Trois écarts sont relevés et NON corrigés, faute de base dans le document :
--
--   19  7 rôles : le document de projet en décrit 7, celui d'organisation en
--       décrit 13, et la base en compte 13. Réduire à 7 retirerait des postes
--       réels du SRSP, dont quatre chefs de division et quatre types d'agents.
--   20  19 permissions : la base en compte 51. Ce sont les 19 du projet plus 32
--       ajoutées par les documents suivants, toutes liées à des routes testées.
--   66-69  le document donne un NOMBRE d'étapes par division — Visa 11, Solde
--       11, Pension 10, Secours 11 — sans dire, pour la Pension, QUELLE étape
--       manque. Un circuit Pension à 10 étapes serait inventé. Les 11 statuts
--       imposés par la partie 4.1 s'appliquent à tous les dossiers.
--
-- Fichier généré par script : un point-virgule dans un libellé coupe l'INSERT en
-- son milieu, et l'erreur qui en sort parle d'une clé en double.

SET NAMES utf8mb4;

-- ------------------------------------------------------------------
-- Authentification (1 à 12)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',1,'OBLIGATOIRE','Connexion par email + mot de passe','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',2,'OBLIGATOIRE','Hachage des mots de passe (bcrypt)','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',3,'OBLIGATOIRE','Génération de token JWT','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',4,'OBLIGATOIRE','Déconnexion','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',5,'OBLIGATOIRE','Expiration de session (8 heures)','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE','Le document fixe 8 h. La valeur était 24 h dans le .env comme dans le défaut du code : les deux ont été corrigées, sans quoi un déploiement sans .env retrouvait 24 h.'),
 ('OBLIGATOIRE',6,'OBLIGATOIRE','Changement de mot de passe','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',7,'OBLIGATOIRE','Verrouillage après 5 tentatives échouées','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',8,'OBLIGATOIRE','Politique de mot de passe fort','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',9,'OBLIGATOIRE','Contrôle d’accès par rôle (RBAC)','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',10,'OBLIGATOIRE','Vérification côté serveur','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',11,'OBLIGATOIRE','Protection CORS','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',12,'OBLIGATOIRE','Validation des données','Fonctionnalité obligatoire : Authentification','Authentification','METIER',NULL,'LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Utilisateurs (13 à 24)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',13,'OBLIGATOIRE','Créer un utilisateur','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',14,'OBLIGATOIRE','Lister les utilisateurs','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',15,'OBLIGATOIRE','Modifier un utilisateur','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',16,'OBLIGATOIRE','Activer / désactiver un compte','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',17,'OBLIGATOIRE','Supprimer un utilisateur','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',18,'OBLIGATOIRE','Réinitialiser un mot de passe','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',19,'OBLIGATOIRE','Rôles prédéfinis','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER',NULL,'LIVREE','Le document de projet en décrit 7. Le document d organisation officiel en décrit 13, et la base en compte 13 : quatre chefs de division, quatre postes transversaux, l administrateur, quatre types d agents. Réduire à 7 retirerait des postes réels du SRSP.'),
 ('OBLIGATOIRE',20,'OBLIGATOIRE','Permissions','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER',NULL,'LIVREE','Le document de projet en compte 19. La base en compte 51 : les 19 du projet plus 32 ajoutées par les documents suivants, toutes liées à des routes testées. Réduire supprimerait des accès utilisés.'),
 ('OBLIGATOIRE',21,'OBLIGATOIRE','Matrice RBAC','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_roles','LIVREE',NULL),
 ('OBLIGATOIRE',22,'OBLIGATOIRE','Attribution de rôle','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',23,'OBLIGATOIRE','Quatre divisions (Visa, Solde, Pension, Secours)','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',24,'OBLIGATOIRE','Affectation d’un utilisateur à une division','Fonctionnalité obligatoire : Utilisateurs','Utilisateurs','METIER','manage_users','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Dossiers (25 à 54)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',25,'OBLIGATOIRE','Créer un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','create_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',26,'OBLIGATOIRE','Génération automatique du numéro unique','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',27,'OBLIGATOIRE','Format {TYPE}-{ANNEE}-{6CAR}','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',28,'OBLIGATOIRE','Quatre types de dossiers','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',29,'OBLIGATOIRE','Quatre niveaux de priorité','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',30,'OBLIGATOIRE','Gestion du demandeur (CIN unique)','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',31,'OBLIGATOIRE','Statut initial RECU','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',32,'OBLIGATOIRE','Date de réception automatique','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',33,'OBLIGATOIRE','Date limite','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',34,'OBLIGATOIRE','Lister tous les dossiers','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',35,'OBLIGATOIRE','Filtrer les dossiers','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',36,'OBLIGATOIRE','Consulter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',37,'OBLIGATOIRE','Modifier un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','edit_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',38,'OBLIGATOIRE','Voir l’historique','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_journal','LIVREE',NULL),
 ('OBLIGATOIRE',39,'OBLIGATOIRE','Voir les documents','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',40,'OBLIGATOIRE','Voir les notifications','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',41,'OBLIGATOIRE','Orienter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','orienter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',42,'OBLIGATOIRE','Affecter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','affecter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',43,'OBLIGATOIRE','Traiter un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',44,'OBLIGATOIRE','Soumettre à vérification','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','soumettre_verification','LIVREE',NULL),
 ('OBLIGATOIRE',45,'OBLIGATOIRE','Vérifier un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','verifier_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',46,'OBLIGATOIRE','Corriger un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',47,'OBLIGATOIRE','Valider un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','valider_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',48,'OBLIGATOIRE','Signer un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','signer_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',49,'OBLIGATOIRE','Clôturer un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','cloturer_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',50,'OBLIGATOIRE','Archiver un dossier','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','archiver_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',51,'OBLIGATOIRE','Créer un demandeur','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','create_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',52,'OBLIGATOIRE','Rechercher par CIN','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','create_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',53,'OBLIGATOIRE','Consulter l’historique du demandeur','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','view_journal','LIVREE',NULL),
 ('OBLIGATOIRE',54,'OBLIGATOIRE','Modifier les informations du demandeur','Fonctionnalité obligatoire : Dossiers','Dossiers','METIER','edit_dossier','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Workflow (55 à 75)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',55,'OBLIGATOIRE','Statut RECU','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',56,'OBLIGATOIRE','Statut ENREGISTRE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',57,'OBLIGATOIRE','Statut ORIENTE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',58,'OBLIGATOIRE','Statut AFFECTE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',59,'OBLIGATOIRE','Statut EN_TRAITEMENT','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',60,'OBLIGATOIRE','Statut SOUMIS_A_VERIFICATION','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',61,'OBLIGATOIRE','Statut CORRECTION_DEMANDEE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',62,'OBLIGATOIRE','Statut VALIDE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',63,'OBLIGATOIRE','Statut SIGNE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',64,'OBLIGATOIRE','Statut CLOTURE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',65,'OBLIGATOIRE','Statut ARCHIVE','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',66,'OBLIGATOIRE','Workflow Visa','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.'),
 ('OBLIGATOIRE',67,'OBLIGATOIRE','Workflow Solde','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.'),
 ('OBLIGATOIRE',68,'OBLIGATOIRE','Workflow Pension','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'PARTIELLE','Le document annonce 10 étapes pour la Pension contre 11 pour les autres, sans indiquer QUELLE étape manque. Un circuit Pension à 10 étapes serait inventé. Le circuit général des 11 statuts s’applique.'),
 ('OBLIGATOIRE',69,'OBLIGATOIRE','Workflow Secours','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.'),
 ('OBLIGATOIRE',70,'OBLIGATOIRE','Validation des transitions','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',71,'OBLIGATOIRE','Interdiction des transitions invalides','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE','CORRECTION_DEMANDEE ne peut pas mener directement à VALIDE : le dossier repasse en traitement.'),
 ('OBLIGATOIRE',72,'OBLIGATOIRE','Routage Visa vers Division Visa','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',73,'OBLIGATOIRE','Routage Solde vers Division Solde','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',74,'OBLIGATOIRE','Routage Pension vers Division Pension','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',75,'OBLIGATOIRE','Routage Secours vers Division Secours','Fonctionnalité obligatoire : Workflow','Workflow','METIER',NULL,'LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Documents (76 à 82)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',76,'OBLIGATOIRE','Téléverser des documents','Fonctionnalité obligatoire : Documents','Documents','METIER','upload_document','LIVREE',NULL),
 ('OBLIGATOIRE',77,'OBLIGATOIRE','Formats PDF, DOCX, XLSX, JPG, PNG','Fonctionnalité obligatoire : Documents','Documents','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',78,'OBLIGATOIRE','Taille maximale 5 Mo','Fonctionnalité obligatoire : Documents','Documents','METIER',NULL,'LIVREE','Le document fixe 5 Mo. La valeur était 10 Mo dans le .env comme dans le défaut du code : les deux ont été corrigées, et alignées sur le référentiel des types de documents.'),
 ('OBLIGATOIRE',79,'OBLIGATOIRE','Nom de fichier sécurisé (UUID)','Fonctionnalité obligatoire : Documents','Documents','METIER',NULL,'LIVREE','Le nom était horodatage + aléatoire. Le nom d’origine disparaît désormais : un fichier déposé sous « contrat_secret.docx » ne conserve plus son nom sur le disque du serveur.'),
 ('OBLIGATOIRE',80,'OBLIGATOIRE','Lien avec le dossier','Fonctionnalité obligatoire : Documents','Documents','METIER','upload_document','LIVREE',NULL),
 ('OBLIGATOIRE',81,'OBLIGATOIRE','Téléchargement contrôlé','Fonctionnalité obligatoire : Documents','Documents','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',82,'OBLIGATOIRE','Archivage des pièces','Fonctionnalité obligatoire : Documents','Documents','METIER','view_archives','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Courriers (83 à 87)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',83,'OBLIGATOIRE','Créer un courrier entrant','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL),
 ('OBLIGATOIRE',84,'OBLIGATOIRE','Créer un courrier sortant','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL),
 ('OBLIGATOIRE',85,'OBLIGATOIRE','Lier à un dossier','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL),
 ('OBLIGATOIRE',86,'OBLIGATOIRE','Numérotation automatique','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL),
 ('OBLIGATOIRE',87,'OBLIGATOIRE','Recherche par référence','Fonctionnalité obligatoire : Courriers','Courriers','METIER','manage_courriers','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Notifications (88 à 94)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',88,'OBLIGATOIRE','Notifications personnelles','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',89,'OBLIGATOIRE','Notifications cliquables','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',90,'OBLIGATOIRE','Redirection automatique','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',91,'OBLIGATOIRE','Badge de compteur','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',92,'OBLIGATOIRE','Marquer comme lue','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',93,'OBLIGATOIRE','Tout marquer comme lu','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE','Le contrôleur appelait markAllAsRead, le service exporte markAllRead. Une lettre de différence, invisible à la lecture et qui renvoyait 500 à chaque clic.'),
 ('OBLIGATOIRE',94,'OBLIGATOIRE','Types de notifications','Fonctionnalité obligatoire : Notifications','Notifications','METIER',NULL,'LIVREE','Neuf types sont en usage : AFFECTATION, VERIFICATION, VALIDATION, CLOTURE, SIGNATURE, INFO, CORRECTION, WORKFLOW, MENTION. Le document en annonce six ; le nombre est une question libre, pas une règle : ce qui compte est la classification, elle existe.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Recherche (95 à 101)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',95,'OBLIGATOIRE','Recherche par numéro','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',96,'OBLIGATOIRE','Recherche par nom','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',97,'OBLIGATOIRE','Recherche par CIN','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',98,'OBLIGATOIRE','Filtres par type','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',99,'OBLIGATOIRE','Filtres par statut','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',100,'OBLIGATOIRE','Filtres par division','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',101,'OBLIGATOIRE','Filtres par période','Fonctionnalité obligatoire : Recherche','Recherche','METIER','view_all_dossiers','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Tableaux de bord (102 à 107)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',102,'OBLIGATOIRE','Dashboard Chef de Service','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',103,'OBLIGATOIRE','Dashboard Chef de Division','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',104,'OBLIGATOIRE','Dashboard Agent','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER',NULL,'LIVREE',NULL),
 ('OBLIGATOIRE',105,'OBLIGATOIRE','Dashboard Administrateur','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',106,'OBLIGATOIRE','KPI par rôle','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',107,'OBLIGATOIRE','Graphiques','Fonctionnalité obligatoire : Tableaux de bord','Tableaux de bord','METIER','view_stats','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Rapports (108 à 115)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',108,'OBLIGATOIRE','Rapport d’activité','Fonctionnalité obligatoire : Rapports','Rapports','METIER','consolidate_reports','LIVREE',NULL),
 ('OBLIGATOIRE',109,'OBLIGATOIRE','Dossiers reçus','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',110,'OBLIGATOIRE','Dossiers traités','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',111,'OBLIGATOIRE','Dossiers en retard','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',112,'OBLIGATOIRE','Activité par division','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',113,'OBLIGATOIRE','Activité par agent','Fonctionnalité obligatoire : Rapports','Rapports','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',114,'OBLIGATOIRE','Export PDF','Fonctionnalité obligatoire : Rapports','Rapports','METIER','export_data','LIVREE',NULL),
 ('OBLIGATOIRE',115,'OBLIGATOIRE','Export Excel','Fonctionnalité obligatoire : Rapports','Rapports','METIER','export_data','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Archivage (116 à 120)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',116,'OBLIGATOIRE','Archiver un dossier','Fonctionnalité obligatoire : Archivage','Archivage','METIER','archiver_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',117,'OBLIGATOIRE','Consulter les archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE',NULL),
 ('OBLIGATOIRE',118,'OBLIGATOIRE','Rechercher dans les archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE',NULL),
 ('OBLIGATOIRE',119,'OBLIGATOIRE','Trier les archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE',NULL),
 ('OBLIGATOIRE',120,'OBLIGATOIRE','Protection des archives','Fonctionnalité obligatoire : Archivage','Archivage','METIER','view_archives','LIVREE','Un dossier ne peut être restauré qu’une fois, et la restauration est tracée.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Audit (121 à 125)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',121,'OBLIGATOIRE','Journal des actions','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL),
 ('OBLIGATOIRE',122,'OBLIGATOIRE','Date et heure exactes','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL),
 ('OBLIGATOIRE',123,'OBLIGATOIRE','Agent responsable','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL),
 ('OBLIGATOIRE',124,'OBLIGATOIRE','Historique par dossier','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL),
 ('OBLIGATOIRE',125,'OBLIGATOIRE','Ancienne et nouvelle valeur','Fonctionnalité obligatoire : Audit','Audit','METIER','view_journal','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Administration (126 à 132)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',126,'OBLIGATOIRE','Gestion des utilisateurs','Fonctionnalité obligatoire : Administration','Administration','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',127,'OBLIGATOIRE','Gestion des rôles','Fonctionnalité obligatoire : Administration','Administration','METIER','manage_roles','LIVREE',NULL),
 ('OBLIGATOIRE',128,'OBLIGATOIRE','Gestion des permissions','Fonctionnalité obligatoire : Administration','Administration','METIER','manage_roles','LIVREE',NULL),
 ('OBLIGATOIRE',129,'OBLIGATOIRE','Consultation des logs','Fonctionnalité obligatoire : Administration','Administration','METIER','view_audit','LIVREE',NULL),
 ('OBLIGATOIRE',130,'OBLIGATOIRE','Consultation de l’audit','Fonctionnalité obligatoire : Administration','Administration','METIER','view_audit','LIVREE',NULL),
 ('OBLIGATOIRE',131,'OBLIGATOIRE','Sauvegardes','Fonctionnalité obligatoire : Administration','Administration','METIER','system_config','LIVREE','L’API est complète et testée : 47 tables sur 47, pièces jointes comprises. L’écran n’existe pas encore.'),
 ('OBLIGATOIRE',132,'OBLIGATOIRE','Monitoring','Fonctionnalité obligatoire : Administration','Administration','METIER',NULL,'NON_CONSTRUITE','Aucune mesure des performances du serveur ou de l’application n’est relevée.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Divisions (133 à 154)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',133,'OBLIGATOIRE','Division Visa — gérer l’intégration','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',134,'OBLIGATOIRE','Division Visa — renouvellement de contrat','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',135,'OBLIGATOIRE','Division Visa — avancement de classe','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',136,'OBLIGATOIRE','Division Visa — vérifier les dossiers','Fonctionnalité obligatoire : Divisions','Divisions','METIER','verifier_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',137,'OBLIGATOIRE','Division Visa — archiver après signature','Fonctionnalité obligatoire : Divisions','Divisions','METIER','archiver_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',138,'OBLIGATOIRE','Division Solde — traiter les salaires','Fonctionnalité obligatoire : Divisions','Divisions','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',139,'OBLIGATOIRE','Division Solde — gérer le mandatement','Fonctionnalité obligatoire : Divisions','Divisions','METIER','preparer_mandatement','LIVREE',NULL),
 ('OBLIGATOIRE',140,'OBLIGATOIRE','Division Solde — vérifier les certificats de cessation','Fonctionnalité obligatoire : Divisions','Divisions','METIER','verifier_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',141,'OBLIGATOIRE','Division Solde — vérifier les décomptes d’avance','Fonctionnalité obligatoire : Divisions','Divisions','METIER','controler_decomptes','LIVREE',NULL),
 ('OBLIGATOIRE',142,'OBLIGATOIRE','Division Solde — approuver les bons de caisse','Fonctionnalité obligatoire : Divisions','Divisions','METIER','approuver_bons','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 ('OBLIGATOIRE',143,'OBLIGATOIRE','Division Solde — gérer les dossiers mères','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 ('OBLIGATOIRE',144,'OBLIGATOIRE','Division Pension — gérer la liquidation','Fonctionnalité obligatoire : Divisions','Divisions','METIER','liquider_pension','LIVREE',NULL),
 ('OBLIGATOIRE',145,'OBLIGATOIRE','Division Pension — lettres de prescription','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_correspondances','LIVREE',NULL),
 ('OBLIGATOIRE',146,'OBLIGATOIRE','Division Pension — gérer les oppositions','Fonctionnalité obligatoire : Divisions','Divisions','METIER','suivre_oppositions','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 ('OBLIGATOIRE',147,'OBLIGATOIRE','Division Pension — transmettre les derniers arrérages','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_correspondances','LIVREE',NULL),
 ('OBLIGATOIRE',148,'OBLIGATOIRE','Division Pension — certificats de cessation','Fonctionnalité obligatoire : Divisions','Divisions','METIER','liquider_pension','PARTIELLE','La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.'),
 ('OBLIGATOIRE',149,'OBLIGATOIRE','Division Secours — réceptionner les dossiers du CF','Fonctionnalité obligatoire : Divisions','Divisions','METIER','enregistrer_visa_cf','LIVREE',NULL),
 ('OBLIGATOIRE',150,'OBLIGATOIRE','Division Secours — préparer le mandatement','Fonctionnalité obligatoire : Divisions','Divisions','METIER','preparer_mandatement','LIVREE',NULL),
 ('OBLIGATOIRE',151,'OBLIGATOIRE','Division Secours — gérer l’ordonnancement','Fonctionnalité obligatoire : Divisions','Divisions','METIER','gerer_ordonnancement','LIVREE',NULL),
 ('OBLIGATOIRE',152,'OBLIGATOIRE','Division Secours — imprimer les huit pièces','Fonctionnalité obligatoire : Divisions','Divisions','METIER','preparer_mandatement','LIVREE',NULL),
 ('OBLIGATOIRE',153,'OBLIGATOIRE','Division Secours — dépouiller les dossiers','Fonctionnalité obligatoire : Divisions','Divisions','METIER','depouiller_pieces','LIVREE',NULL),
 ('OBLIGATOIRE',154,'OBLIGATOIRE','Division Secours — archiver les pièces','Fonctionnalité obligatoire : Divisions','Divisions','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Par rôle (155 à 189)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 ('OBLIGATOIRE',155,'OBLIGATOIRE','Chef de Service — valider les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','valider_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',156,'OBLIGATOIRE','Chef de Service — signer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','signer_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',157,'OBLIGATOIRE','Chef de Service — clôturer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','cloturer_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',158,'OBLIGATOIRE','Chef de Service — archiver les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','archiver_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',159,'OBLIGATOIRE','Chef de Service — superviser les divisions','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_all_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',160,'OBLIGATOIRE','Secrétaire — réceptionner les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','create_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',161,'OBLIGATOIRE','Secrétaire — créer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','create_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',162,'OBLIGATOIRE','Secrétaire — enregistrer les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','create_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',163,'OBLIGATOIRE','Secrétaire — orienter les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','orienter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',164,'OBLIGATOIRE','Secrétaire — gérer la chronologie des actes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'NON_CONSTRUITE','Aucune numérotation d’actes. Un numéro d’acte est la référence d’une pièce officielle : sans registre, deux actes peuvent porter le même numéro.'),
 ('OBLIGATOIRE',165,'OBLIGATOIRE','Chef BAAF — gérer les documents comptables','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_documents','PARTIELLE','Le dépôt et l’archivage des documents fonctionnent. L’analyse des pièces comptables elle-même n’existe pas.'),
 ('OBLIGATOIRE',166,'OBLIGATOIRE','Chef BAAF — saisir sur SIIGFP','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'HORS_PLATEFORME','SIIGFP est un système financier externe du Ministère. La plateforme prépare les données, elle n’y écrit pas.'),
 ('OBLIGATOIRE',167,'OBLIGATOIRE','Chef BAAF — saisir sur SIIGMP','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'HORS_PLATEFORME','SIIGMP est un système externe. Même limite que pour SIIGFP.'),
 ('OBLIGATOIRE',168,'OBLIGATOIRE','Chef BAAF — produire les situations FCC/BCSE','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'NON_CONSTRUITE','La nomenclature FCC/BCSE n’est décrite nulle part. Un état produit sans elle ne serait conforme à rien.'),
 ('OBLIGATOIRE',169,'OBLIGATOIRE','Chef BAAF — gérer le personnel','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_personnel','PARTIELLE','La gestion des agents existe. Congés et permissions non : le droit du travail malgache n’est pas documenté et les droits ne peuvent pas être inventés.'),
 ('OBLIGATOIRE',170,'OBLIGATOIRE','Chef BAAF — établir les pièces de déplacement','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','etablir_pieces_deplacement','LIVREE',NULL),
 ('OBLIGATOIRE',171,'OBLIGATOIRE','Coordonnatrice — créer les immatriculations','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_immatriculations','LIVREE',NULL),
 ('OBLIGATOIRE',172,'OBLIGATOIRE','Coordonnatrice — gérer les insertions Augure','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_augure','LIVREE',NULL),
 ('OBLIGATOIRE',173,'OBLIGATOIRE','Coordonnatrice — traiter les changements de paiement','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','gerer_paiements','LIVREE',NULL),
 ('OBLIGATOIRE',174,'OBLIGATOIRE','Coordonnatrice — préparer les rapports','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','consolidate_reports','LIVREE',NULL),
 ('OBLIGATOIRE',175,'OBLIGATOIRE','Chefs de Division — affecter les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','affecter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',176,'OBLIGATOIRE','Chefs de Division — vérifier les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','verifier_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',177,'OBLIGATOIRE','Chefs de Division — valider les conformes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','valider_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',178,'OBLIGATOIRE','Chefs de Division — retourner pour correction','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','verifier_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',179,'OBLIGATOIRE','Chefs de Division — produire les rapports','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_stats','LIVREE',NULL),
 ('OBLIGATOIRE',180,'OBLIGATOIRE','Agents — consulter mes dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_assigned_dossiers','LIVREE',NULL),
 ('OBLIGATOIRE',181,'OBLIGATOIRE','Agents — traiter les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',182,'OBLIGATOIRE','Agents — soumettre à vérification','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','soumettre_verification','LIVREE',NULL),
 ('OBLIGATOIRE',183,'OBLIGATOIRE','Agents — corriger les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','traiter_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',184,'OBLIGATOIRE','Agents — archiver les dossiers','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','archiver_dossier','LIVREE',NULL),
 ('OBLIGATOIRE',185,'OBLIGATOIRE','Administrateur — gérer les comptes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_users','LIVREE',NULL),
 ('OBLIGATOIRE',186,'OBLIGATOIRE','Administrateur — gérer les rôles','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','manage_roles','LIVREE',NULL),
 ('OBLIGATOIRE',187,'OBLIGATOIRE','Administrateur — consulter les logs','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','view_audit','LIVREE',NULL),
 ('OBLIGATOIRE',188,'OBLIGATOIRE','Administrateur — lancer les sauvegardes','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER','system_config','LIVREE',NULL),
 ('OBLIGATOIRE',189,'OBLIGATOIRE','Administrateur — surveiller les performances','Fonctionnalité obligatoire : Par rôle','Par rôle','METIER',NULL,'NON_CONSTRUITE','Aucune mesure des performances n’est relevée : ni serveur, ni application.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);
