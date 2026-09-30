-- 045 : fonctionnalités du document, partie 2 (rôles transversaux et organigramme).
--
-- Suite de la migration 044, qui couvre les lignes 1 à 137. Les deux ensemble
-- donnent les 325 lignes du document, sans doublon et sans trou.
--
-- Cette partie contient les 41 nœuds d'organigramme et les 7 intégrations :
--
-- Une ligne par fonctionnalité du document source. Le numéro d'origine est la
-- référence commune avec le document du service : « fonction 118 » se retrouve
-- sans ambiguïté des deux côtés.
--
-- L'état est MESURÉ, jamais déclaré. Une ligne qui décrit une fonctionnalité
-- non construite ne doit pas se lire comme livrée.
--
-- Répartition des états, et ce qu'ils signifient :
--
--   LIVREE          une permission existe, une route la sert, et c'est testé.
--   PARTIELLE       le chemin existe mais une étape manque.
--   INERTE          la permission existe mais AUCUNE route ne s'y réfère. Elle
--                   ne donne accès à rien : c'est le cas le plus trompeur,
--                   parce qu'elle a l'air d'une fonctionnalité livrée.
--   NON_CONSTRUITE  documentée, permission inexistante.
--   HORS_PLATEFORME systèmes externes, ou acte hors du champ de la
--                   plateforme.
--
-- Fichier généré par script : un point-virgule dans un libellé coupe l'INSERT en
-- son milieu, et l'erreur qui en résulte parle d'une clé en double alors que le
-- vrai problème est plus haut. Aucun littéral de ce fichier n'en contient.
--
-- La clause de rejouabilité est posée une fois par bloc, et le fichier peut
-- être exécuté plusieurs fois sans effet de bord.

SET NAMES utf8mb4;

-- ------------------------------------------------------------------
-- Coordonnatrice (138 à 159)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (138,'COORDONNATRICE','Créer les numéros d’immatriculation',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL),
 (139,'COORDONNATRICE','Attribuer les numéros aux nouveaux fonctionnaires',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL),
 (140,'COORDONNATRICE','Attribuer les numéros aux employés du secteur public',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL),
 (141,'COORDONNATRICE','Vérifier l’enregistrement correct de chaque individu',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL),
 (142,'COORDONNATRICE','Garantir un identifiant unique (salaires)',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL),
 (143,'COORDONNATRICE','Garantir un identifiant unique (pensions)',NULL,'Coordonnatrice','METIER','gerer_immatriculations','LIVREE',NULL),
 (144,'COORDONNATRICE','Gérer les insertions augurales',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL),
 (145,'COORDONNATRICE','Intégrer les nouveaux arrivants dans les systèmes de paie',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL),
 (146,'COORDONNATRICE','Intégrer les nouveaux arrivants dans les systèmes de pensions',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL),
 (147,'COORDONNATRICE','Prendre en compte les données personnelles',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL),
 (148,'COORDONNATRICE','Prendre en compte les informations salariales',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL),
 (149,'COORDONNATRICE','Prendre en compte les informations de pension',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL),
 (150,'COORDONNATRICE','Préparer les rapports d’activité pour le Chef de Service',NULL,'Coordonnatrice','METIER','consolidate_reports','LIVREE',NULL),
 (151,'COORDONNATRICE','Préparer les rapports d’activité pour la direction centrale',NULL,'Coordonnatrice','METIER','consolidate_reports','LIVREE',NULL),
 (152,'COORDONNATRICE','Rapporter le nombre de nouveaux dossiers traités',NULL,'Coordonnatrice','METIER','view_stats','LIVREE',NULL),
 (153,'COORDONNATRICE','Rapporter les changements de statut',NULL,'Coordonnatrice','METIER','view_stats','LIVREE',NULL),
 (154,'COORDONNATRICE','Rapporter les problèmes rencontrés',NULL,'Coordonnatrice','METIER','view_stats','PARTIELLE','Les indicateurs sont calculés, mais aucun dispositif de remontée de problème n’existe. Un agent ne peut pas signaler un blocage autrement que par un commentaire de dossier.'),
 (155,'COORDONNATRICE','Rapporter les mesures prises pour résoudre les problèmes',NULL,'Coordonnatrice','METIER','view_stats','PARTIELLE','Dépend de la fonction 154, elle-même partielle.'),
 (156,'COORDONNATRICE','Traiter les demandes de mode de paiement (fonctionnaires)',NULL,'Coordonnatrice','METIER','gerer_paiements','LIVREE',NULL),
 (157,'COORDONNATRICE','Traiter les demandes de mode de paiement (retraités)',NULL,'Coordonnatrice','METIER','gerer_paiements','LIVREE',NULL),
 (158,'COORDONNATRICE','Coordonner les démarches administratives',NULL,'Coordonnatrice','METIER','gerer_paiements','PARTIELLE','Les démarches de changement de paiement sont traitées. Le suivi de leur avancement auprès des autres services n’existe pas.'),
 (159,'COORDONNATRICE','Veiller à la mise à jour correcte des informations dans les systèmes',NULL,'Coordonnatrice','METIER','gerer_augure','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Secrétaire (160 à 170)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (160,'SECRETARIAT','Effectuer tous les travaux de secrétariat du Service',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL),
 (161,'SECRETARIAT','Réceptionner les dossiers',NULL,'Secrétaire','METIER','create_dossier','LIVREE',NULL),
 (162,'SECRETARIAT','Réceptionner les courriers',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL),
 (163,'SECRETARIAT','Enregistrer les dossiers',NULL,'Secrétaire','METIER','create_dossier','LIVREE',NULL),
 (164,'SECRETARIAT','Enregistrer les courriers',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL),
 (165,'SECRETARIAT','Distribuer les dossiers',NULL,'Secrétaire','METIER','orienter_dossier','LIVREE',NULL),
 (166,'SECRETARIAT','Distribuer les courriers',NULL,'Secrétaire','METIER','manage_courriers','LIVREE',NULL),
 (167,'SECRETARIAT','Gérer la chronologie des actes émis par le service',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Aucune numérotation d’actes. Un numéro d’acte est la référence d’une pièce officielle : sans registre, deux actes peuvent porter le même numéro.'),
 (168,'SECRETARIAT','Gérer les numéros BE (Bons d’Émission)',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 167, non construite.'),
 (169,'SECRETARIAT','Gérer les Notes',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 167, non construite.'),
 (170,'SECRETARIAT','Gérer les Lettres',NULL,'Secrétaire','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 167, non construite.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chef Division Visa (171 à 184)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (171,'CHEF_DIV_VISA','Organiser le traitement des dossiers soumis pour visa',NULL,'Chef Division Visa','METIER','view_all_dossiers','LIVREE',NULL),
 (172,'CHEF_DIV_VISA','Superviser le traitement des dossiers soumis pour visa',NULL,'Chef Division Visa','METIER','view_all_dossiers','LIVREE',NULL),
 (173,'CHEF_DIV_VISA','Vérifier les dossiers soumis pour visa',NULL,'Chef Division Visa','METIER','verifier_dossier','LIVREE',NULL),
 (174,'CHEF_DIV_VISA','Résoudre les difficultés rencontrées au sein de la division',NULL,'Chef Division Visa','METIER','view_all_dossiers','PARTIELLE','Un chef de division voit les indicateurs de sa division, mais aucun dispositif ne permet de signaler un dossier bloqué à la hiérarchie.'),
 (175,'CHEF_DIV_VISA','Produire le rapport d’activités mensuel',NULL,'Chef Division Visa','METIER','view_stats','LIVREE',NULL),
 (176,'CHEF_DIV_VISA','Produire le rapport d’activités trimestriel',NULL,'Chef Division Visa','METIER','view_stats','LIVREE',NULL),
 (177,'CHEF_DIV_VISA','Produire le rapport d’activités annuel',NULL,'Chef Division Visa','METIER','view_stats','LIVREE',NULL),
 (178,'CHEF_DIV_VISA','Assurer l’interlocution avec le Chef de Service (besoins matériels)',NULL,'Chef Division Visa','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.'),
 (179,'CHEF_DIV_VISA','Représenter la Division au sein des réunions',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','La représentation se prépare par les rapports et statistiques, mais la réunion elle-même relève du service, pas de la plateforme.'),
 (180,'CHEF_DIV_VISA','Représenter la Division au sein des conférences',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','Même limite que pour la fonction 179.'),
 (181,'CHEF_DIV_VISA','Représenter la Division au sein des séminaires',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','Même limite que pour la fonction 179.'),
 (182,'CHEF_DIV_VISA','Représenter la Division au sein des ateliers',NULL,'Chef Division Visa','METIER',NULL,'HORS_PLATEFORME','Même limite que pour la fonction 179.'),
 (183,'CHEF_DIV_VISA','Assurer la bonne conduite des agents',NULL,'Chef Division Visa','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire. Le suivi de la tenue des agents se limite aux indicateurs d’activité.'),
 (184,'CHEF_DIV_VISA','Assurer la bonne exécution des tâches des agents',NULL,'Chef Division Visa','METIER','view_stats','PARTIELLE','Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chef Division Solde (185 à 201)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (185,'CHEF_DIV_SOLDE','Organiser le traitement des dossiers pour mandatement',NULL,'Chef Division Solde','METIER','view_all_dossiers','LIVREE',NULL),
 (186,'CHEF_DIV_SOLDE','Superviser le traitement des dossiers pour mandatement',NULL,'Chef Division Solde','METIER','view_all_dossiers','LIVREE',NULL),
 (187,'CHEF_DIV_SOLDE','Vérifier les dossiers soumis pour mandatement',NULL,'Chef Division Solde','METIER','verifier_dossier','LIVREE',NULL),
 (188,'CHEF_DIV_SOLDE','Vérifier les Certificats de Cessation de Paiement',NULL,'Chef Division Solde','METIER','verifier_dossier','LIVREE',NULL),
 (189,'CHEF_DIV_SOLDE','Vérifier les décomptes d’avance de Solde',NULL,'Chef Division Solde','METIER','controler_decomptes','LIVREE',NULL),
 (190,'CHEF_DIV_SOLDE','Vérifier les états de décompte des Soldes trop perçus',NULL,'Chef Division Solde','METIER','controler_decomptes','LIVREE',NULL),
 (191,'CHEF_DIV_SOLDE','Vérifier les Bons de caisse à retourner à la Trésorerie Générale',NULL,'Chef Division Solde','METIER','verifier_dossier','LIVREE',NULL),
 (192,'CHEF_DIV_SOLDE','Assurer l’interlocution avec le Chef de Service',NULL,'Chef Division Solde','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.'),
 (193,'CHEF_DIV_SOLDE','Résoudre les difficultés rencontrées au sein de la division',NULL,'Chef Division Solde','METIER','view_all_dossiers','PARTIELLE','Un chef de division voit les indicateurs de sa division, mais aucun dispositif ne permet de signaler un dossier bloqué.'),
 (194,'CHEF_DIV_SOLDE','Approuver les bons de caisse « Vu Bon à payer »',NULL,'Chef Division Solde','METIER','approuver_bons','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 (195,'CHEF_DIV_SOLDE','Classer les demandes de Domiciliation irrévocable de salaire',NULL,'Chef Division Solde','METIER','view_all_dossiers','LIVREE',NULL),
 (196,'CHEF_DIV_SOLDE','Produire le rapport d’activités mensuel',NULL,'Chef Division Solde','METIER','view_stats','LIVREE',NULL),
 (197,'CHEF_DIV_SOLDE','Produire le rapport d’activités trimestriel',NULL,'Chef Division Solde','METIER','view_stats','LIVREE',NULL),
 (198,'CHEF_DIV_SOLDE','Produire le rapport d’activités annuel',NULL,'Chef Division Solde','METIER','view_stats','LIVREE',NULL),
 (199,'CHEF_DIV_SOLDE','Représenter la Division',NULL,'Chef Division Solde','METIER',NULL,'HORS_PLATEFORME','La représentation se prépare par les rapports, mais la réunion relève du service.'),
 (200,'CHEF_DIV_SOLDE','Assurer la bonne conduite des agents',NULL,'Chef Division Solde','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire.'),
 (201,'CHEF_DIV_SOLDE','Assurer la bonne exécution des tâches des agents',NULL,'Chef Division Solde','METIER','view_stats','PARTIELLE','Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chef Division Pension (202 à 217)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (202,'CHEF_DIV_PENSION','Organiser le traitement des dossiers pour liquidation',NULL,'Chef Division Pension','METIER','view_all_dossiers','LIVREE',NULL),
 (203,'CHEF_DIV_PENSION','Superviser le traitement des dossiers pour liquidation',NULL,'Chef Division Pension','METIER','view_all_dossiers','LIVREE',NULL),
 (204,'CHEF_DIV_PENSION','Vérifier les dossiers soumis pour liquidation de Pensions',NULL,'Chef Division Pension','METIER','verifier_dossier','LIVREE',NULL),
 (205,'CHEF_DIV_PENSION','Résoudre les difficultés rencontrées au sein de la division',NULL,'Chef Division Pension','METIER','view_all_dossiers','PARTIELLE','Aucun dispositif de signalement d’un dossier bloqué à la hiérarchie.'),
 (206,'CHEF_DIV_PENSION','Assurer l’interlocution avec le Chef de Service',NULL,'Chef Division Pension','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.'),
 (207,'CHEF_DIV_PENSION','Produire le rapport d’activités mensuel',NULL,'Chef Division Pension','METIER','view_stats','LIVREE',NULL),
 (208,'CHEF_DIV_PENSION','Produire le rapport d’activités trimestriel',NULL,'Chef Division Pension','METIER','view_stats','LIVREE',NULL),
 (209,'CHEF_DIV_PENSION','Produire le rapport d’activités annuel',NULL,'Chef Division Pension','METIER','view_stats','LIVREE',NULL),
 (210,'CHEF_DIV_PENSION','Rédiger toute correspondance d’usage (Lettre de prescription)',NULL,'Chef Division Pension','METIER','gerer_correspondances','LIVREE',NULL),
 (211,'CHEF_DIV_PENSION','Rédiger toute correspondance d’usage (demande de dossier mère)',NULL,'Chef Division Pension','METIER','gerer_correspondances','LIVREE',NULL),
 (212,'CHEF_DIV_PENSION','Envoyer au niveau central les demandes d’opposition sur Pension',NULL,'Chef Division Pension','METIER','suivre_oppositions','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 (213,'CHEF_DIV_PENSION','Envoyer les Derniers arrérages',NULL,'Chef Division Pension','METIER','gerer_correspondances','LIVREE',NULL),
 (214,'CHEF_DIV_PENSION','Représenter la Division au sein des réunions',NULL,'Chef Division Pension','METIER',NULL,'HORS_PLATEFORME','La représentation se prépare par les rapports, mais la réunion relève du service.'),
 (215,'CHEF_DIV_PENSION','Proposer toutes mesures devant être prises et matérialisées par actes',NULL,'Chef Division Pension','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de proposition d’une mesure administrative à la hiérarchie.'),
 (216,'CHEF_DIV_PENSION','Assurer la bonne conduite des agents',NULL,'Chef Division Pension','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire.'),
 (217,'CHEF_DIV_PENSION','Assurer la bonne exécution des tâches des agents',NULL,'Chef Division Pension','METIER','view_stats','PARTIELLE','Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chef Division Secours (218 à 240)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (218,'CHEF_DIV_SECOURS','Réceptionner les dossiers venant du contrôle financier',NULL,'Chef Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL),
 (219,'CHEF_DIV_SECOURS','Contrôler les Décisions visées par le CF',NULL,'Chef Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL),
 (220,'CHEF_DIV_SECOURS','Contrôler les États de décompte',NULL,'Chef Division Secours','METIER','verifier_dossier','LIVREE',NULL),
 (221,'CHEF_DIV_SECOURS','Préparer le mandatement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (222,'CHEF_DIV_SECOURS','Établir l’État de décompte du mandatement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (223,'CHEF_DIV_SECOURS','Établir les différents états de décompte du secours',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (224,'CHEF_DIV_SECOURS','Insérer les données dans le logiciel secours',NULL,'Chef Division Secours','METIER','generer_etat_emargement','LIVREE',NULL),
 (225,'CHEF_DIV_SECOURS','Faire sortir le montant à engager pour la dépense',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (226,'CHEF_DIV_SECOURS','Faire sortir la liste des bénéficiaires (tiers)',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (227,'CHEF_DIV_SECOURS','Gérer l’ordonnancement',NULL,'Chef Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL),
 (228,'CHEF_DIV_SECOURS','Gérer la liquidation',NULL,'Chef Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL),
 (229,'CHEF_DIV_SECOURS','Imprimer le TEF',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (230,'CHEF_DIV_SECOURS','Imprimer le Mandat de paiement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (231,'CHEF_DIV_SECOURS','Imprimer le Bon de caisse',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (232,'CHEF_DIV_SECOURS','Imprimer le Bordereau des pièces',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (233,'CHEF_DIV_SECOURS','Imprimer le Bord d’émissions',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (234,'CHEF_DIV_SECOURS','Imprimer le Bord de mandats',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (235,'CHEF_DIV_SECOURS','Imprimer l’État d’émargement',NULL,'Chef Division Secours','METIER','generer_etat_emargement','LIVREE',NULL),
 (236,'CHEF_DIV_SECOURS','Imprimer les Tickets de mandatement',NULL,'Chef Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (237,'CHEF_DIV_SECOURS','Insérer dans le logiciel secours les références',NULL,'Chef Division Secours','METIER','generer_etat_emargement','LIVREE',NULL),
 (238,'CHEF_DIV_SECOURS','Faire signer les pièces de mandatement par l’ordonnateur',NULL,'Chef Division Secours','METIER','signer_pieces_mandatement','LIVREE',NULL),
 (239,'CHEF_DIV_SECOURS','Superviser les chargés de secours',NULL,'Chef Division Secours','METIER','view_stats','LIVREE',NULL),
 (240,'CHEF_DIV_SECOURS','Assurer la bonne conduite des agents',NULL,'Chef Division Secours','METIER',NULL,'NON_CONSTRUITE','Aucun registre disciplinaire.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Vérificateurs Visas (241 à 244)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (241,'VERIF_VISA','Exploiter tous les dossiers soumis pour visa',NULL,'Vérificateurs Visas','METIER','traiter_dossier','LIVREE',NULL),
 (242,'VERIF_VISA','Soumettre les dossiers pour vérification du Chef de Division',NULL,'Vérificateurs Visas','METIER','soumettre_verification','LIVREE',NULL),
 (243,'VERIF_VISA','Soumettre les dossiers pour signature du Chef de Service',NULL,'Vérificateurs Visas','METIER','soumettre_verification','LIVREE',NULL),
 (244,'VERIF_VISA','Archiver les dossiers après signature du Chef de Service',NULL,'Vérificateurs Visas','METIER','archiver_dossier','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Vérificateurs Solde (245 à 257)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (245,'VERIF_SOLDE','Exploiter tous les dossiers soumis pour mandatement',NULL,'Vérificateurs Solde','METIER','traiter_dossier','LIVREE',NULL),
 (246,'VERIF_SOLDE','Soumettre les dossiers pour vérification du Chef de Division',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL),
 (247,'VERIF_SOLDE','Soumettre les dossiers pour signature du Chef de Service',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL),
 (248,'VERIF_SOLDE','Préparer les fiches de contrôle de Solde',NULL,'Vérificateurs Solde','METIER',NULL,'NON_CONSTRUITE','Aucune table de fiche de contrôle. Le document ne décrit pas les rubriques à saisir.'),
 (249,'VERIF_SOLDE','Préparer les dossiers mères (changement de localité)',NULL,'Vérificateurs Solde','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 (250,'VERIF_SOLDE','Expédier les dossiers mères aux SRSP concernés',NULL,'Vérificateurs Solde','METIER','gerer_correspondances','LIVREE',NULL),
 (251,'VERIF_SOLDE','Préparer les dossiers de mandatement pour envoi au niveau central',NULL,'Vérificateurs Solde','METIER','preparer_mandatement','LIVREE',NULL),
 (252,'VERIF_SOLDE','Mettre à jour les fiches de contrôle de la Solde',NULL,'Vérificateurs Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 248, non construite.'),
 (253,'VERIF_SOLDE','Réceptionner les fiches de contrôle',NULL,'Vérificateurs Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 248, non construite.'),
 (254,'VERIF_SOLDE','Créer les dossiers mères des agents affectés dans la Région Fitovinany',NULL,'Vérificateurs Solde','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 (255,'VERIF_SOLDE','Calculer les décomptes d’avances de Solde',NULL,'Vérificateurs Solde','METIER','calculer_avances','LIVREE',NULL),
 (256,'VERIF_SOLDE','Présenter les décomptes pour vérification du Chef de Division',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL),
 (257,'VERIF_SOLDE','Présenter les décomptes pour signature du Chef de Service',NULL,'Vérificateurs Solde','METIER','soumettre_verification','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Liquidateurs Pensions (258 à 264)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (258,'LIQUIDATEUR','Exploiter tous les dossiers soumis pour liquidation',NULL,'Liquidateurs Pensions','METIER','traiter_dossier','LIVREE',NULL),
 (259,'LIQUIDATEUR','Soumettre les dossiers pour vérification du Chef de Division',NULL,'Liquidateurs Pensions','METIER','soumettre_verification','LIVREE',NULL),
 (260,'LIQUIDATEUR','Traiter les demandes de secours au décès',NULL,'Liquidateurs Pensions','METIER','liquider_pension','LIVREE',NULL),
 (261,'LIQUIDATEUR','Préparer les demandes de secours pour envoi au SRSP Haute Matsiatra',NULL,'Liquidateurs Pensions','METIER','gerer_correspondances','LIVREE',NULL),
 (262,'LIQUIDATEUR','Archiver le dossier mère de Pensions',NULL,'Liquidateurs Pensions','METIER','gerer_dossiers_meres','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 (263,'LIQUIDATEUR','Gérer les bons de caisse en retour',NULL,'Liquidateurs Pensions','METIER','gerer_ordonnancement','LIVREE',NULL),
 (264,'LIQUIDATEUR','Établir les demandes de Certificats de Cessation de Paiement',NULL,'Liquidateurs Pensions','METIER','liquider_pension','PARTIELLE','La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chargés de Secours (265 à 277)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (265,'CHARGE_SECOURS','Traiter les dossiers de secours de décès',NULL,'Chargés de Secours','METIER','traiter_dossier','LIVREE',NULL),
 (266,'CHARGE_SECOURS','Apposer le cachet et la date des pièces de mandatements',NULL,'Chargés de Secours','METIER','apposer_cachet','LIVREE',NULL),
 (267,'CHARGE_SECOURS','Apposer le cachet rond, titre et nom de l’ordonnateur',NULL,'Chargés de Secours','METIER','apposer_cachet','LIVREE',NULL),
 (268,'CHARGE_SECOURS','Dépouiller les dossiers (Décision)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (269,'CHARGE_SECOURS','Dépouiller les dossiers (État de décompte)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (270,'CHARGE_SECOURS','Dépouiller les dossiers (CCETPP)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (271,'CHARGE_SECOURS','Dépouiller les dossiers (Demande de l’intéressé)',NULL,'Chargés de Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (272,'CHARGE_SECOURS','Archiver les Actes de décès',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 (273,'CHARGE_SECOURS','Archiver les Actes de Mariage',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 (274,'CHARGE_SECOURS','Archiver les Certificats de NSC',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 (275,'CHARGE_SECOURS','Archiver les Certificats de NDiv',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 (276,'CHARGE_SECOURS','Archiver les CIN',NULL,'Chargés de Secours','METIER','archiver_pieces','INERTE','La permission existe mais aucune route ne s’y réfère.'),
 (277,'CHARGE_SECOURS','Faire cacheter et parapher les documents par le CF',NULL,'Chargés de Secours','METIER',NULL,'HORS_PLATEFORME','Le cachet du contrôle financier est apposé sur la pièce physique. La plateforme ne peut que tracer la demande de cachet.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Organigramme (278 à 318)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (278,'MINISTERE','Direction de la Communication','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (279,'MINISTERE','Cabinet du Ministère','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (280,'MINISTERE','Autorité de Régulation des Marchés Publics','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (281,'MINISTERE','Direction Générale du Contrôle Financier','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (282,'MINISTERE','Direction de l’Audit Interne','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (283,'MINISTERE','Commission Nationale des Marchés','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (284,'MINISTERE','Cellule de Coordination des Projets','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (285,'MINISTERE','Direction des Études et de la Programmation','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (286,'MINISTERE','Direction d’Appui, de Suivi et d’Évaluation','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (287,'MINISTERE','Secrétariat Général','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (288,'MINISTERE','Institut National de la Statistique','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (289,'MINISTERE','Conseil Supérieur de la Comptabilité','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (290,'MINISTERE','Direction de l’Imprimerie Nationale','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (291,'MINISTERE','Direction des Affaires Administratives et Financières','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (292,'MINISTERE','Direction des Ressources Humaines','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (293,'MINISTERE','Direction de la Formation et de la Coordination des Réformes','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (294,'MINISTERE','Direction des Systèmes d’Information','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (295,'MINISTERE','Direction de la Promotion du Partenariat Public-Privé','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (296,'MINISTERE','Bureau d’Appui à la Coopération Extérieure','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (297,'MINISTERE','Direction Générale des Douanes','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (298,'MINISTERE','Direction Générale des Impôts','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (299,'MINISTERE','Direction Générale du Budget et des Finances','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (300,'MINISTERE','Direction du Budget','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (301,'MINISTERE','Direction de la Gestion des Effectifs des Agents de l’État','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (302,'MINISTERE','Direction de la Solde et des Pensions','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (303,'MINISTERE','Direction Générale du Trésor','Ligne de l’organigramme du Ministère','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.'),
 (304,'MINISTERE','Direction non précisée dans le document source','Ligne réservée par le document sans intitulé','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Le document attribue la ligne 304 à une direction du Ministère mais n’en énumère que 26 entre les lignes 278 et 303. L’écart est constaté, pas comblé.'),
 (305,'CHEF_SERVICE','Chef de Service du SRSP','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (306,'COORDONNATRICE','Coordonnatrice','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (307,'CHEF_BAAF','Chef BAAF','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (308,'SECRETARIAT','Secrétariat','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (309,'ACCUEIL','Accueil','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (310,'SUIVI_COURRIERS','Suivi des courriers','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (311,'CHEF_DIV_VISA','Chef de Division VISAS','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (312,'CHEF_DIV_SOLDE','Chef de Division SOLDE','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (313,'CHEF_DIV_PENSION','Chef de Division PENSIONS','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (314,'CHEF_DIV_SECOURS','Chef de Division SECOURS','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (315,'VERIF_VISA','Vérificateurs Visas','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (316,'VERIF_SOLDE','Vérificateurs Solde','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (317,'LIQUIDATEUR','Liquidateurs Pensions','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.'),
 (318,'CHARGE_SECOURS','Chargés de Secours','Ligne de l’organigramme du SRSP','Organigramme','STRUCTURE',NULL,'HORS_PLATEFORME','Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Intégration (319 à 325)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (319,'CHEF_BAAF','Intégrer les données avec SIIGFP','Système financier de l’État','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La plateforme prépare les données à reporter, elle n’y écrit pas. Le report est tracé, ce qui permet de contrôler ce qui a été saisi.'),
 (320,'CHEF_BAAF','Intégrer les données avec SIIGMP','Système de masse salariale','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','Même limite que pour SIIGFP.'),
 (321,'COORDONNATRICE','Intégrer les données avec Augure','Système de paie et de pensions','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','Les données d’insertion augurale sont gérées et validées. Le report dans Augure reste une saisie externe, dont la plateforme trace la préparation.'),
 (322,'CHEF_DIV_SECOURS','Intégrer les données avec le logiciel secours','Logiciel de mandatement','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','Les références à reporter sont calculées et le report est tracé. L’écriture dans le logiciel reste externe.'),
 (323,'LIQUIDATEUR','Transférer les dossiers au SRSP Haute Matsiatra','Dossier de secours','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La préparation et la correspondance existent. Le transfert physique relève du service.'),
 (324,'VERIF_SOLDE','Transférer les dossiers aux SRSP concernés','Dossier mère','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La préparation et la correspondance existent. Le transfert physique relève du service.'),
 (325,'CHEF_SERVICE','Envoyer les données au niveau central','Rapport d’activités','Intégration','INTEGRATION',NULL,'HORS_PLATEFORME','La consolidation des rapports existe. L’envoi à la direction centrale se fait hors de la plateforme.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);
