-- 044 : les fonctionnalités du document, avec leur état réel.
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
-- Institutionnelles (1 à 26)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (1,'DSP','Afficher la dénomination officielle','Service Régional de la Solde et des Pensions','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (2,'DSP','Afficher l’acronyme SRSP',NULL,'Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (3,'DSP','Afficher le siège central','Immeuble Antaninarenina, Antananarivo','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (4,'DSP','Afficher le siège succursale','Ambodiaplay, Manakara','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (5,'DSP','Afficher la forme juridique','Entité gouvernementale relevant de l’administration publique','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (6,'DSP','Afficher les numéros de téléphone','+261 32 11 090 10 / +261 32 25 469 11','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (7,'DSP','Afficher l’email officiel','srsp.fitovinany@dgfag.mg','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (8,'DSP','Afficher le logo DSP','Direction de la Solde et des Pensions','Institutionnelles','INSTITUTIONNEL',NULL,'PARTIELLE','Le sigle DSP est documenté, mais le fichier logo lui-même n’est pas dans le dépôt et ne peut pas être rendu.'),
 (9,'DSP','Enregistrer la date de création','22 septembre 2011','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (10,'DSP','Gérer la région d’origine','Vatovavy Fitovinany','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (11,'DSP','Gérer la province de rattachement','Fianarantsoa','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (12,'DSP','Gérer la scission de 2022','Vatovavy et Fitovinany deviennent deux entités distinctes','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (13,'DSP','Gérer les 6 districts',NULL,'Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (14,'DSP','Gérer la répartition Mananjary / Manakara','Deux antennes depuis 2022','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (15,'DSP','Gérer les 23 régions de Madagascar','Depuis 2022','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (16,'DSP','Assurer le calcul des salaires',NULL,'Institutionnelles','METIER','view_all_dossiers','LIVREE',NULL),
 (17,'DSP','Assurer le paiement des salaires','Le paiement relève de la Trésorerie Générale','Institutionnelles','METIER',NULL,'HORS_PLATEFORME','La plateforme constate le mandatement. L’ordonnancement et le paiement relèvent de la Trésorerie Générale et sont hors de son périmètre.'),
 (18,'DSP','Assurer la gestion des salaires',NULL,'Institutionnelles','METIER','preparer_mandatement','LIVREE',NULL),
 (19,'DSP','Gérer les pensions de retraite',NULL,'Institutionnelles','METIER','liquider_pension','LIVREE',NULL),
 (20,'DSP','Veiller au versement conforme des salaires','Séparation des fonctions','Institutionnelles','METIER','gerer_ordonnancement','LIVREE',NULL),
 (21,'DSP','Veiller au versement conforme des pensions',NULL,'Institutionnelles','METIER','liquider_pension','LIVREE',NULL),
 (22,'DSP','Respecter la réglementation en vigueur','Les 11 statuts portent cette exigence','Institutionnelles','METIER','view_all_dossiers','LIVREE',NULL),
 (23,'DSP','Respecter les conventions collectives applicables','Règles de calcul des pensions et des avances','Institutionnelles','METIER',NULL,'NON_CONSTRUITE','Les taux et barèmes ne figurent pas dans les documents fournis. Les inventer produirait des calculs faux.'),
 (24,'DSP','Gérer les 6 membres initiaux (2011)','Élément historique','Institutionnelles','INSTITUTIONNEL',NULL,'LIVREE',NULL),
 (25,'DSP','Gérer les 21 membres actuels','13 comptes créés sur 21','Institutionnelles','METIER',NULL,'PARTIELLE','Treize comptes sont créés. Les huit autres demandent la liste nominative réelle : créer des agents inventés fausserait les statistiques par agent.'),
 (26,'DSP','Suivre l’évolution des effectifs','Historique des effectifs','Institutionnelles','METIER',NULL,'NON_CONSTRUITE','Les effectifs ne sont pas historisés. Leur évolution ne peut donc pas être reconstituée.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Division Solde (27 à 47)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (27,'CHEF_DIV_SOLDE','Traiter les salaires des fonctionnaires',NULL,'Division Solde','METIER','traiter_dossier','LIVREE',NULL),
 (28,'CHEF_DIV_SOLDE','Traiter les salaires des travailleurs publics',NULL,'Division Solde','METIER','traiter_dossier','LIVREE',NULL),
 (29,'CHEF_DIV_SOLDE','Effectuer les paiements de manière précise','Séparation des fonctions','Division Solde','METIER','gerer_ordonnancement','LIVREE',NULL),
 (30,'CHEF_DIV_SOLDE','Effectuer les paiements en temps voulu','Échéance et tri de la file','Division Solde','METIER','view_all_dossiers','LIVREE',NULL),
 (31,'CHEF_DIV_SOLDE','Gérer le mandatement',NULL,'Division Solde','METIER','preparer_mandatement','LIVREE',NULL),
 (32,'CHEF_DIV_SOLDE','Vérifier les dossiers soumis pour mandatement',NULL,'Division Solde','METIER','verifier_dossier','LIVREE',NULL),
 (33,'CHEF_DIV_SOLDE','Vérifier les Certificats de Cessation de Paiement',NULL,'Division Solde','METIER','verifier_dossier','LIVREE',NULL),
 (34,'CHEF_DIV_SOLDE','Vérifier les décomptes d’avance de Solde','Table decomptes_avance','Division Solde','METIER','controler_decomptes','LIVREE',NULL),
 (35,'CHEF_DIV_SOLDE','Vérifier les états de décompte des Soldes trop perçus',NULL,'Division Solde','METIER','controler_decomptes','LIVREE',NULL),
 (36,'CHEF_DIV_SOLDE','Vérifier les Bons de caisse à retourner à la Trésorerie Générale',NULL,'Division Solde','METIER','verifier_dossier','LIVREE',NULL),
 (37,'CHEF_DIV_SOLDE','Approuver les bons de caisse « Vu Bon à payer »',NULL,'Division Solde','METIER','approuver_bons','INERTE','La permission existe mais aucune route ne s’y réfère : elle ne donne accès à rien.'),
 (38,'CHEF_DIV_SOLDE','Classer les demandes de Domiciliation irrévocable de salaire',NULL,'Division Solde','METIER','view_all_dossiers','LIVREE',NULL),
 (39,'VERIF_SOLDE','Préparer les fiches de contrôle de Solde',NULL,'Division Solde','METIER',NULL,'NON_CONSTRUITE','Aucune table de fiche de contrôle. Le document ne décrit pas les rubriques à saisir.'),
 (40,'VERIF_SOLDE','Préparer les dossiers mères (changement de localité)',NULL,'Division Solde','METIER','gerer_dossiers_meres','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (41,'VERIF_SOLDE','Expédier les dossiers mères aux SRSP concernés',NULL,'Division Solde','METIER','gerer_correspondances','LIVREE',NULL),
 (42,'VERIF_SOLDE','Préparer les dossiers de mandatement pour envoi au niveau central',NULL,'Division Solde','METIER','preparer_mandatement','LIVREE',NULL),
 (43,'VERIF_SOLDE','Mettre à jour les fiches de contrôle de la Solde',NULL,'Division Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 39, non construite.'),
 (44,'VERIF_SOLDE','Réceptionner les fiches de contrôle',NULL,'Division Solde','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 39, non construite.'),
 (45,'VERIF_SOLDE','Créer les dossiers mères des agents affectés dans la Région Fitovinany',NULL,'Division Solde','METIER','gerer_dossiers_meres','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (46,'VERIF_SOLDE','Calculer les décomptes d’avances de Solde',NULL,'Division Solde','METIER','calculer_avances','LIVREE',NULL),
 (47,'VERIF_SOLDE','Présenter les décomptes pour vérification et signature',NULL,'Division Solde','METIER','soumettre_verification','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Division Pension (48 à 63)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (48,'CHEF_DIV_PENSION','Traiter les dossiers de retraite',NULL,'Division Pension','METIER','traiter_dossier','LIVREE',NULL),
 (49,'CHEF_DIV_PENSION','Garantir une transition fluide pour les fonctionnaires quittant le service actif',NULL,'Division Pension','METIER','liquider_pension','LIVREE',NULL),
 (50,'CHEF_DIV_PENSION','Gérer la liquidation des Pensions',NULL,'Division Pension','METIER','liquider_pension','LIVREE',NULL),
 (51,'CHEF_DIV_PENSION','Vérifier les dossiers soumis pour liquidation',NULL,'Division Pension','METIER','verifier_dossier','LIVREE',NULL),
 (52,'CHEF_DIV_PENSION','Rédiger les Lettres de prescription',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL),
 (53,'CHEF_DIV_PENSION','Rédiger les demandes de dossier mère',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL),
 (54,'CHEF_DIV_PENSION','Envoyer au niveau central les demandes d’opposition sur Pension',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (55,'CHEF_DIV_PENSION','Gérer les oppositions : Pension alimentaire',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (56,'CHEF_DIV_PENSION','Gérer les oppositions : cession volontaire',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (57,'CHEF_DIV_PENSION','Gérer les oppositions : saisie arrêt',NULL,'Division Pension','METIER','suivre_oppositions','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (58,'CHEF_DIV_PENSION','Transmettre les Derniers arrérages',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL),
 (59,'LIQUIDATEUR','Archiver le dossier mère de Pensions',NULL,'Division Pension','METIER','gerer_dossiers_meres','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (60,'LIQUIDATEUR','Gérer les bons de caisse en retour',NULL,'Division Pension','METIER','gerer_ordonnancement','LIVREE',NULL),
 (61,'LIQUIDATEUR','Établir les demandes de Certificats de Cessation de Paiement',NULL,'Division Pension','METIER','liquider_pension','PARTIELLE','La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.'),
 (62,'LIQUIDATEUR','Traiter les demandes de secours au décès',NULL,'Division Pension','METIER','liquider_pension','LIVREE',NULL),
 (63,'LIQUIDATEUR','Préparer les envois au SRSP Haute Matsiatra',NULL,'Division Pension','METIER','gerer_correspondances','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Division Visa (64 à 71)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (64,'CHEF_DIV_VISA','Gérer l’intégration des fonctionnaires',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL),
 (65,'CHEF_DIV_VISA','Gérer le renouvellement de contrat',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL),
 (66,'CHEF_DIV_VISA','Gérer l’avancement de classe',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL),
 (67,'CHEF_DIV_VISA','Assurer la conformité des démarches administratives','Les 11 statuts portent cette exigence','Division Visa','METIER','verifier_dossier','LIVREE',NULL),
 (68,'CHEF_DIV_VISA','Assurer la régularité des démarches administratives',NULL,'Division Visa','METIER','verifier_dossier','LIVREE',NULL),
 (69,'CHEF_DIV_VISA','Traiter les dossiers soumis pour visa',NULL,'Division Visa','METIER','traiter_dossier','LIVREE',NULL),
 (70,'CHEF_DIV_VISA','Vérifier les dossiers soumis pour visa','Checklist de vérification','Division Visa','METIER','verifier_dossier','LIVREE',NULL),
 (71,'VERIF_VISA','Archiver les dossiers après signature du Chef de Service',NULL,'Division Visa','METIER','archiver_dossier','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Division Secours (72 à 108)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (72,'CHEF_DIV_SECOURS','Offrir un soutien aux familles des fonctionnaires décédés',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (73,'CHEF_DIV_SECOURS','Traiter les démarches de secours de décès',NULL,'Division Secours','METIER','traiter_dossier','LIVREE',NULL),
 (74,'CHEF_DIV_SECOURS','Fournir une assistance financière aux familles',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (75,'CHEF_DIV_SECOURS','Réceptionner les dossiers venant du contrôle financier',NULL,'Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL),
 (76,'CHEF_DIV_SECOURS','Contrôler les Décisions visées par le CF','N° visa, signature, date','Division Secours','METIER','enregistrer_visa_cf','LIVREE',NULL),
 (77,'CHEF_DIV_SECOURS','Contrôler les États de décompte',NULL,'Division Secours','METIER','verifier_dossier','LIVREE',NULL),
 (78,'CHEF_DIV_SECOURS','Préparer le mandatement',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (79,'CHEF_DIV_SECOURS','Établir l’État de décompte du mandatement',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (80,'CHEF_DIV_SECOURS','Établir les différents états de décompte du secours',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (81,'CHEF_DIV_SECOURS','Insérer les données dans le logiciel secours','Références calculées et report tracé','Division Secours','INTEGRATION','generer_etat_emargement','LIVREE',NULL),
 (82,'CHEF_DIV_SECOURS','Faire sortir le montant à engager pour la dépense','Répartition calculée depuis les quotes-parts','Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (83,'CHEF_DIV_SECOURS','Faire sortir la liste des bénéficiaires (tiers)',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (84,'CHEF_DIV_SECOURS','Gérer l’ordonnancement',NULL,'Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL),
 (85,'CHEF_DIV_SECOURS','Gérer la liquidation',NULL,'Division Secours','METIER','gerer_ordonnancement','LIVREE',NULL),
 (86,'CHEF_DIV_SECOURS','Imprimer le TEF','Titre d’Engagement Financier','Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (87,'CHEF_DIV_SECOURS','Imprimer le Mandat de paiement',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (88,'CHEF_DIV_SECOURS','Imprimer le Bon de caisse',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (89,'CHEF_DIV_SECOURS','Imprimer le Bordereau des pièces',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (90,'CHEF_DIV_SECOURS','Imprimer le Bord d’émissions',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (91,'CHEF_DIV_SECOURS','Imprimer le Bord de mandats',NULL,'Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (92,'CHEF_DIV_SECOURS','Imprimer l’État d’émargement',NULL,'Division Secours','METIER','generer_etat_emargement','LIVREE',NULL),
 (93,'CHEF_DIV_SECOURS','Imprimer les Tickets de mandatement','Guichet unique','Division Secours','METIER','preparer_mandatement','LIVREE',NULL),
 (94,'CHEF_DIV_SECOURS','Insérer dans le logiciel secours les références pour l’état d’émargement',NULL,'Division Secours','INTEGRATION','generer_etat_emargement','LIVREE',NULL),
 (95,'CHEF_DIV_SECOURS','Faire signer les pièces de mandatement par l’ordonnateur','Permission dédiée : le Chef de Division ne signe pas','Division Secours','METIER','signer_pieces_mandatement','LIVREE',NULL),
 (96,'CHARGE_SECOURS','Traiter les dossiers de secours de décès',NULL,'Division Secours','METIER','traiter_dossier','LIVREE',NULL),
 (97,'CHARGE_SECOURS','Apposer le cachet et la date sur les pièces de mandatement',NULL,'Division Secours','METIER','apposer_cachet','LIVREE',NULL),
 (98,'CHARGE_SECOURS','Apposer le cachet rond, titre et nom de l’ordonnateur',NULL,'Division Secours','METIER','apposer_cachet','LIVREE',NULL),
 (99,'CHARGE_SECOURS','Dépouiller les dossiers (Décision)','Pièce PGA visée par le contrôle financier','Division Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (100,'CHARGE_SECOURS','Dépouiller les dossiers (État de décompte)',NULL,'Division Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (101,'CHARGE_SECOURS','Dépouiller les dossiers (CCETPP)','Certificat de Cessation d’Emploi et de Traitement','Division Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (102,'CHARGE_SECOURS','Dépouiller les dossiers (Demande de l’intéressé)',NULL,'Division Secours','METIER','depouiller_pieces','LIVREE',NULL),
 (103,'CHARGE_SECOURS','Archiver les Actes de décès',NULL,'Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (104,'CHARGE_SECOURS','Archiver les Actes de Mariage',NULL,'Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (105,'CHARGE_SECOURS','Archiver les Certificats de NSC','Non-Salarié Civil','Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (106,'CHARGE_SECOURS','Archiver les Certificats de NDiv','Non-Divorcé','Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (107,'CHARGE_SECOURS','Archiver les CIN','Du défunt et du bénéficiaire','Division Secours','METIER','archiver_pieces','INERTE','Permission existante, aucune route ne s’y réfère.'),
 (108,'CHARGE_SECOURS','Faire cacheter et parapher les documents par le CF','Le CF signe la pièce papier','Division Secours','METIER',NULL,'HORS_PLATEFORME','Le cachet du contrôle financier est apposé sur la pièce physique. La plateforme ne peut que tracer la demande de cachet.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chef de Service (109 à 117)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (109,'CHEF_SERVICE','Représenter le SRSP auprès du Ministère','Rapports et statistiques du service','Chef de Service','METIER','consolidate_reports','LIVREE',NULL),
 (110,'CHEF_SERVICE','Valider l’ensemble des dossiers traités',NULL,'Chef de Service','METIER','valider_dossier','LIVREE',NULL),
 (111,'CHEF_SERVICE','Signer l’ensemble des dossiers traités','Référence de signature obligatoire','Chef de Service','METIER','signer_dossier','LIVREE',NULL),
 (112,'CHEF_SERVICE','Superviser les dossiers au niveau de chaque Division',NULL,'Chef de Service','METIER','view_all_dossiers','LIVREE',NULL),
 (113,'CHEF_SERVICE','Garantir la qualité des procédures administratives',NULL,'Chef de Service','METIER','verifier_dossier','LIVREE',NULL),
 (114,'CHEF_SERVICE','Garantir la conformité des procédures administratives',NULL,'Chef de Service','METIER','valider_dossier','LIVREE',NULL),
 (115,'CHEF_SERVICE','Résoudre les problèmes persistants au niveau des Divisions',NULL,'Chef de Service','METIER',NULL,'NON_CONSTRUITE','Aucun circuit d’escalade n’existe : un dossier bloqué ne remonte nulle part.'),
 (116,'CHEF_SERVICE','Intervenir là où les solutions n’ont pas été résolues',NULL,'Chef de Service','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 115, non construite.'),
 (117,'CHEF_DIV_VISA','Assurer l’interlocution avec les Chefs de Division','Besoins matériels','Chef de Service','METIER',NULL,'NON_CONSTRUITE','Aucun circuit de demande de besoin matériel.')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);

-- ------------------------------------------------------------------
-- Chef BAAF (118 à 137)
-- ------------------------------------------------------------------
INSERT INTO referentiel_fonctionnalites
 (numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif) VALUES
 (118,'CHEF_BAAF','Préparer les documents comptables',NULL,'Chef BAAF','METIER','manage_documents','LIVREE',NULL),
 (119,'CHEF_BAAF','Exploiter les documents comptables',NULL,'Chef BAAF','METIER','view_stats','PARTIELLE','Les indicateurs de dossiers existent. L’analyse des pièces comptables elle-même n’existe pas.'),
 (120,'CHEF_BAAF','Archiver les documents comptables',NULL,'Chef BAAF','METIER','view_archives','LIVREE',NULL),
 (121,'CHEF_BAAF','Classer les documents comptables',NULL,'Chef BAAF','METIER','upload_document','LIVREE',NULL),
 (122,'CHEF_BAAF','Effectuer les saisies sur SIIGFP','Système financier de l’État','Chef BAAF','INTEGRATION',NULL,'HORS_PLATEFORME','SIIGFP est un système externe du Ministère. La plateforme prépare les données à y reporter, elle n’y écrit pas.'),
 (123,'CHEF_BAAF','Effectuer les saisies sur SIIGMP','Système de masse salariale','Chef BAAF','INTEGRATION',NULL,'HORS_PLATEFORME','SIIGMP est un système externe. Même limite que pour SIIGFP.'),
 (124,'CHEF_BAAF','Produire les situations trimestrielles (FCC, BCSE)','Fiche de Compte et Budget de Compte Spécial d’Emploi','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','La nomenclature FCC/BCSE n’est décrite nulle part. Un état produit sans elle ne serait conforme à rien.'),
 (125,'CHEF_BAAF','Produire les situations annuelles (FCC, BCSE)',NULL,'Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 124, non construite.'),
 (126,'CHEF_BAAF','Gérer le personnel (avancement)',NULL,'Chef BAAF','METIER','manage_personnel','LIVREE',NULL),
 (127,'CHEF_BAAF','Gérer le personnel (renouvellement)','Contrats','Chef BAAF','METIER','manage_personnel','LIVREE',NULL),
 (128,'CHEF_BAAF','Gérer le personnel (congé)','Droits à congés','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Le droit du travail malgache n’est pas documenté. Les droits ne peuvent pas être inventés.'),
 (129,'CHEF_BAAF','Gérer le personnel (permission)','Absences','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Dépend de la fonction 128, non construite.'),
 (130,'CHEF_BAAF','Consolider le rapport d’activités du service',NULL,'Chef BAAF','METIER','consolidate_reports','LIVREE',NULL),
 (131,'CHEF_BAAF','Superviser l’établissement de la comptabilité-matière','Inventaire du matériel','Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Aucun inventaire de matériel. Entrées, sorties et stock n’existent pas.'),
 (132,'CHEF_BAAF','Superviser les travaux de secrétariat',NULL,'Chef BAAF','METIER','view_all_dossiers','LIVREE',NULL),
 (133,'CHEF_BAAF','Résoudre les difficultés rencontrées au sein du Bureau',NULL,'Chef BAAF','METIER',NULL,'NON_CONSTRUITE','Aucun circuit d’escalade au niveau du bureau.'),
 (134,'CHEF_BAAF','Établir les ordres de route',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL),
 (135,'CHEF_BAAF','Établir les ordres de mission',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL),
 (136,'CHEF_BAAF','Établir les autorisations de retrait de BC',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL),
 (137,'CHEF_BAAF','Établir les Notes d’intérim',NULL,'Chef BAAF','METIER','etablir_pieces_deplacement','LIVREE',NULL)
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle), detail = VALUES(detail),
  poste_code = VALUES(poste_code), nature = VALUES(nature),
  permission_nom = VALUES(permission_nom), etat = VALUES(etat), motif = VALUES(motif);
