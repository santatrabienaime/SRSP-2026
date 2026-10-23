--
-- PostgreSQL database dump
--

\restrict 2CUkkD5f1KKvDsNDUX6IJyUSsuCV37yFG9cNJFlkdX8BgHQRueh4pXPYIvzG90G

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.visas_controle_financier DROP CONSTRAINT IF EXISTS fk_visas_controle_financier_102;
ALTER TABLE IF EXISTS ONLY public.visas_controle_financier DROP CONSTRAINT IF EXISTS fk_visas_controle_financier_101;
ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS fk_verifications_99;
ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS fk_verifications_100;
ALTER TABLE IF EXISTS ONLY public.validations DROP CONSTRAINT IF EXISTS fk_validations_98;
ALTER TABLE IF EXISTS ONLY public.validations DROP CONSTRAINT IF EXISTS fk_validations_97;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS fk_users_96;
ALTER TABLE IF EXISTS ONLY public.transferts DROP CONSTRAINT IF EXISTS fk_transferts_95;
ALTER TABLE IF EXISTS ONLY public.transferts DROP CONSTRAINT IF EXISTS fk_transferts_94;
ALTER TABLE IF EXISTS ONLY public.transferts DROP CONSTRAINT IF EXISTS fk_transferts_93;
ALTER TABLE IF EXISTS ONLY public.traitements DROP CONSTRAINT IF EXISTS fk_traitements_92;
ALTER TABLE IF EXISTS ONLY public.traitements DROP CONSTRAINT IF EXISTS fk_traitements_91;
ALTER TABLE IF EXISTS ONLY public.suppressions_dossiers DROP CONSTRAINT IF EXISTS fk_suppressions_dossiers_90;
ALTER TABLE IF EXISTS ONLY public.sous_types_dossiers DROP CONSTRAINT IF EXISTS fk_sous_types_dossiers_89;
ALTER TABLE IF EXISTS ONLY public.signatures_ordonnateur DROP CONSTRAINT IF EXISTS fk_signatures_ordonnateur_88;
ALTER TABLE IF EXISTS ONLY public.signatures_ordonnateur DROP CONSTRAINT IF EXISTS fk_signatures_ordonnateur_87;
ALTER TABLE IF EXISTS ONLY public.signalements_dossier DROP CONSTRAINT IF EXISTS fk_signalements_dossier_86;
ALTER TABLE IF EXISTS ONLY public.signalements_dossier DROP CONSTRAINT IF EXISTS fk_signalements_dossier_85;
ALTER TABLE IF EXISTS ONLY public.signalements_dossier DROP CONSTRAINT IF EXISTS fk_signalements_dossier_84;
ALTER TABLE IF EXISTS ONLY public.signalements_dossier DROP CONSTRAINT IF EXISTS fk_signalements_dossier_83;
ALTER TABLE IF EXISTS ONLY public.schemas_operations DROP CONSTRAINT IF EXISTS fk_schemas_operations_82;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS fk_role_permissions_81;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS fk_role_permissions_80;
ALTER TABLE IF EXISTS ONLY public.reinitialisations_mot_de_passe DROP CONSTRAINT IF EXISTS fk_reinitialisations_mot_de_passe_79;
ALTER TABLE IF EXISTS ONLY public.reinitialisations_mot_de_passe DROP CONSTRAINT IF EXISTS fk_reinitialisations_mot_de_passe_78;
ALTER TABLE IF EXISTS ONLY public.references_logiciel_secours DROP CONSTRAINT IF EXISTS fk_references_logiciel_secours_77;
ALTER TABLE IF EXISTS ONLY public.references_logiciel_secours DROP CONSTRAINT IF EXISTS fk_references_logiciel_secours_76;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_notifications_75;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_notifications_74;
ALTER TABLE IF EXISTS ONLY public.modes_paiement DROP CONSTRAINT IF EXISTS fk_modes_paiement_73;
ALTER TABLE IF EXISTS ONLY public.modes_paiement DROP CONSTRAINT IF EXISTS fk_modes_paiement_72;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS fk_messages_71;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS fk_messages_70;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS fk_messages_69;
ALTER TABLE IF EXISTS ONLY public.mandatements DROP CONSTRAINT IF EXISTS fk_mandatements_66;
ALTER TABLE IF EXISTS ONLY public.mandatements DROP CONSTRAINT IF EXISTS fk_mandatements_65;
ALTER TABLE IF EXISTS ONLY public.mandatement_pieces_etat DROP CONSTRAINT IF EXISTS fk_mandatement_pieces_etat_68;
ALTER TABLE IF EXISTS ONLY public.mandatement_beneficiaires DROP CONSTRAINT IF EXISTS fk_mandatement_beneficiaires_67;
ALTER TABLE IF EXISTS ONLY public.liquidations_pension DROP CONSTRAINT IF EXISTS fk_liquidations_pension_64;
ALTER TABLE IF EXISTS ONLY public.liquidations_pension DROP CONSTRAINT IF EXISTS fk_liquidations_pension_63;
ALTER TABLE IF EXISTS ONLY public.insertions_paiement DROP CONSTRAINT IF EXISTS fk_insertions_paiement_62;
ALTER TABLE IF EXISTS ONLY public.insertions_paiement DROP CONSTRAINT IF EXISTS fk_insertions_paiement_61;
ALTER TABLE IF EXISTS ONLY public.immatriculations DROP CONSTRAINT IF EXISTS fk_immatriculations_60;
ALTER TABLE IF EXISTS ONLY public.immatriculations DROP CONSTRAINT IF EXISTS fk_immatriculations_59;
ALTER TABLE IF EXISTS ONLY public.historique_actions DROP CONSTRAINT IF EXISTS fk_historique_actions_58;
ALTER TABLE IF EXISTS ONLY public.historique_actions DROP CONSTRAINT IF EXISTS fk_historique_actions_57;
ALTER TABLE IF EXISTS ONLY public.etats_emargement DROP CONSTRAINT IF EXISTS fk_etats_emargement_56;
ALTER TABLE IF EXISTS ONLY public.etats_emargement DROP CONSTRAINT IF EXISTS fk_etats_emargement_55;
ALTER TABLE IF EXISTS ONLY public.emargements DROP CONSTRAINT IF EXISTS fk_emargements_54;
ALTER TABLE IF EXISTS ONLY public.emargements DROP CONSTRAINT IF EXISTS fk_emargements_53;
ALTER TABLE IF EXISTS ONLY public.dossiers_districts DROP CONSTRAINT IF EXISTS fk_dossiers_districts_50;
ALTER TABLE IF EXISTS ONLY public.dossiers_districts DROP CONSTRAINT IF EXISTS fk_dossiers_districts_49;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS fk_dossiers_48;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS fk_dossiers_47;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS fk_dossiers_46;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS fk_dossiers_45;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS fk_dossiers_44;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS fk_dossiers_43;
ALTER TABLE IF EXISTS ONLY public.dossier_commentaires DROP CONSTRAINT IF EXISTS fk_dossier_commentaires_52;
ALTER TABLE IF EXISTS ONLY public.dossier_commentaires DROP CONSTRAINT IF EXISTS fk_dossier_commentaires_51;
ALTER TABLE IF EXISTS ONLY public.donnees_operation DROP CONSTRAINT IF EXISTS fk_donnees_operation_42;
ALTER TABLE IF EXISTS ONLY public.donnees_operation DROP CONSTRAINT IF EXISTS fk_donnees_operation_41;
ALTER TABLE IF EXISTS ONLY public.donnees_operation DROP CONSTRAINT IF EXISTS fk_donnees_operation_40;
ALTER TABLE IF EXISTS ONLY public.donnees_operation DROP CONSTRAINT IF EXISTS fk_donnees_operation_39;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS fk_documents_38;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS fk_documents_37;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS fk_documents_36;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS fk_documents_35;
ALTER TABLE IF EXISTS ONLY public.divisions DROP CONSTRAINT IF EXISTS fk_divisions_34;
ALTER TABLE IF EXISTS ONLY public.divisions DROP CONSTRAINT IF EXISTS fk_divisions_33;
ALTER TABLE IF EXISTS ONLY public.districts DROP CONSTRAINT IF EXISTS fk_districts_32;
ALTER TABLE IF EXISTS ONLY public.depouillements DROP CONSTRAINT IF EXISTS fk_depouillements_31;
ALTER TABLE IF EXISTS ONLY public.depouillements DROP CONSTRAINT IF EXISTS fk_depouillements_30;
ALTER TABLE IF EXISTS ONLY public.delegations DROP CONSTRAINT IF EXISTS fk_delegations_29;
ALTER TABLE IF EXISTS ONLY public.delegations DROP CONSTRAINT IF EXISTS fk_delegations_28;
ALTER TABLE IF EXISTS ONLY public.delegations DROP CONSTRAINT IF EXISTS fk_delegations_27;
ALTER TABLE IF EXISTS ONLY public.decomptes_avance DROP CONSTRAINT IF EXISTS fk_decomptes_avance_26;
ALTER TABLE IF EXISTS ONLY public.decomptes_avance DROP CONSTRAINT IF EXISTS fk_decomptes_avance_25;
ALTER TABLE IF EXISTS ONLY public.courriers DROP CONSTRAINT IF EXISTS fk_courriers_24;
ALTER TABLE IF EXISTS ONLY public.courriers DROP CONSTRAINT IF EXISTS fk_courriers_23;
ALTER TABLE IF EXISTS ONLY public.courriers DROP CONSTRAINT IF EXISTS fk_courriers_22;
ALTER TABLE IF EXISTS ONLY public.courriers DROP CONSTRAINT IF EXISTS fk_courriers_21;
ALTER TABLE IF EXISTS ONLY public.courriers DROP CONSTRAINT IF EXISTS fk_courriers_20;
ALTER TABLE IF EXISTS ONLY public.correspondances DROP CONSTRAINT IF EXISTS fk_correspondances_19;
ALTER TABLE IF EXISTS ONLY public.correspondances DROP CONSTRAINT IF EXISTS fk_correspondances_18;
ALTER TABLE IF EXISTS ONLY public.controles_decompte DROP CONSTRAINT IF EXISTS fk_controles_decompte_17;
ALTER TABLE IF EXISTS ONLY public.controles_decompte DROP CONSTRAINT IF EXISTS fk_controles_decompte_16;
ALTER TABLE IF EXISTS ONLY public.cachets_mandatement DROP CONSTRAINT IF EXISTS fk_cachets_mandatement_15;
ALTER TABLE IF EXISTS ONLY public.cachets_mandatement DROP CONSTRAINT IF EXISTS fk_cachets_mandatement_14;
ALTER TABLE IF EXISTS ONLY public.bordereaux_dossiers DROP CONSTRAINT IF EXISTS fk_bordereaux_dossiers_13;
ALTER TABLE IF EXISTS ONLY public.bordereaux_dossiers DROP CONSTRAINT IF EXISTS fk_bordereaux_dossiers_12;
ALTER TABLE IF EXISTS ONLY public.bordereaux DROP CONSTRAINT IF EXISTS fk_bordereaux_9;
ALTER TABLE IF EXISTS ONLY public.bordereaux DROP CONSTRAINT IF EXISTS fk_bordereaux_11;
ALTER TABLE IF EXISTS ONLY public.bordereaux DROP CONSTRAINT IF EXISTS fk_bordereaux_10;
ALTER TABLE IF EXISTS ONLY public.archives DROP CONSTRAINT IF EXISTS fk_archives_8;
ALTER TABLE IF EXISTS ONLY public.archives DROP CONSTRAINT IF EXISTS fk_archives_7;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS fk_agents_6;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS fk_agents_5;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS fk_agents_4;
ALTER TABLE IF EXISTS ONLY public.affectations DROP CONSTRAINT IF EXISTS fk_affectations_3;
ALTER TABLE IF EXISTS ONLY public.affectations DROP CONSTRAINT IF EXISTS fk_affectations_2;
ALTER TABLE IF EXISTS ONLY public.affectations DROP CONSTRAINT IF EXISTS fk_affectations_1;
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trg_signatures_ordonnateur_updated_at ON public.signatures_ordonnateur;
DROP TRIGGER IF EXISTS trg_signalements_dossier_updated_at ON public.signalements_dossier;
DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
DROP TRIGGER IF EXISTS trg_reinitialisations_mot_de_passe_updated_at ON public.reinitialisations_mot_de_passe;
DROP TRIGGER IF EXISTS trg_referentiel_fonctionnalites_updated_at ON public.referentiel_fonctionnalites;
DROP TRIGGER IF EXISTS trg_modes_paiement_updated_at ON public.modes_paiement;
DROP TRIGGER IF EXISTS trg_mandatements_updated_at ON public.mandatements;
DROP TRIGGER IF EXISTS trg_liquidations_pension_updated_at ON public.liquidations_pension;
DROP TRIGGER IF EXISTS trg_insertions_paiement_updated_at ON public.insertions_paiement;
DROP TRIGGER IF EXISTS trg_immatriculations_updated_at ON public.immatriculations;
DROP TRIGGER IF EXISTS trg_etats_emargement_updated_at ON public.etats_emargement;
DROP TRIGGER IF EXISTS trg_emargements_updated_at ON public.emargements;
DROP TRIGGER IF EXISTS trg_dossiers_updated_at ON public.dossiers;
DROP TRIGGER IF EXISTS trg_donnees_operation_updated_at ON public.donnees_operation;
DROP TRIGGER IF EXISTS trg_decomptes_avance_updated_at ON public.decomptes_avance;
DROP TRIGGER IF EXISTS trg_compteurs_numerotation_updated_at ON public.compteurs_numerotation;
DROP TRIGGER IF EXISTS trg_cachets_mandatement_updated_at ON public.cachets_mandatement;
DROP TRIGGER IF EXISTS trg_bordereaux_updated_at ON public.bordereaux;
DROP INDEX IF EXISTS public.idx_visas_controle_financier_4;
DROP INDEX IF EXISTS public.idx_visas_controle_financier_3;
DROP INDEX IF EXISTS public.idx_visas_controle_financier_2;
DROP INDEX IF EXISTS public.idx_visas_controle_financier_1;
DROP INDEX IF EXISTS public.idx_verifications_2;
DROP INDEX IF EXISTS public.idx_verifications_1;
DROP INDEX IF EXISTS public.idx_validations_2;
DROP INDEX IF EXISTS public.idx_validations_1;
DROP INDEX IF EXISTS public.idx_users_4;
DROP INDEX IF EXISTS public.idx_users_3;
DROP INDEX IF EXISTS public.idx_users_2;
DROP INDEX IF EXISTS public.idx_users_1;
DROP INDEX IF EXISTS public.idx_types_pieces_3;
DROP INDEX IF EXISTS public.idx_types_pieces_2;
DROP INDEX IF EXISTS public.idx_types_pieces_1;
DROP INDEX IF EXISTS public.idx_types_dossiers_1;
DROP INDEX IF EXISTS public.idx_types_documents_1;
DROP INDEX IF EXISTS public.idx_types_courriers_1;
DROP INDEX IF EXISTS public.idx_transferts_3;
DROP INDEX IF EXISTS public.idx_transferts_2;
DROP INDEX IF EXISTS public.idx_transferts_1;
DROP INDEX IF EXISTS public.idx_traitements_2;
DROP INDEX IF EXISTS public.idx_traitements_1;
DROP INDEX IF EXISTS public.idx_suppressions_dossiers_3;
DROP INDEX IF EXISTS public.idx_suppressions_dossiers_2;
DROP INDEX IF EXISTS public.idx_suppressions_dossiers_1;
DROP INDEX IF EXISTS public.idx_statuts_dossiers_1;
DROP INDEX IF EXISTS public.idx_sous_types_dossiers_2;
DROP INDEX IF EXISTS public.idx_sous_types_dossiers_1;
DROP INDEX IF EXISTS public.idx_signatures_ordonnateur_4;
DROP INDEX IF EXISTS public.idx_signatures_ordonnateur_3;
DROP INDEX IF EXISTS public.idx_signatures_ordonnateur_2;
DROP INDEX IF EXISTS public.idx_signatures_ordonnateur_1;
DROP INDEX IF EXISTS public.idx_signalements_dossier_5;
DROP INDEX IF EXISTS public.idx_signalements_dossier_4;
DROP INDEX IF EXISTS public.idx_signalements_dossier_3;
DROP INDEX IF EXISTS public.idx_signalements_dossier_2;
DROP INDEX IF EXISTS public.idx_signalements_dossier_1;
DROP INDEX IF EXISTS public.idx_schemas_operations_2;
DROP INDEX IF EXISTS public.idx_schemas_operations_1;
DROP INDEX IF EXISTS public.idx_schema_migrations_1;
DROP INDEX IF EXISTS public.idx_roles_1;
DROP INDEX IF EXISTS public.idx_role_permissions_1;
DROP INDEX IF EXISTS public.idx_reinitialisations_mot_de_passe_4;
DROP INDEX IF EXISTS public.idx_reinitialisations_mot_de_passe_3;
DROP INDEX IF EXISTS public.idx_reinitialisations_mot_de_passe_2;
DROP INDEX IF EXISTS public.idx_reinitialisations_mot_de_passe_1;
DROP INDEX IF EXISTS public.idx_referentiel_service_1;
DROP INDEX IF EXISTS public.idx_referentiel_postes_2;
DROP INDEX IF EXISTS public.idx_referentiel_postes_1;
DROP INDEX IF EXISTS public.idx_referentiel_fonctionnalites_6;
DROP INDEX IF EXISTS public.idx_referentiel_fonctionnalites_5;
DROP INDEX IF EXISTS public.idx_referentiel_fonctionnalites_4;
DROP INDEX IF EXISTS public.idx_referentiel_fonctionnalites_3;
DROP INDEX IF EXISTS public.idx_referentiel_fonctionnalites_2;
DROP INDEX IF EXISTS public.idx_referentiel_fonctionnalites_1;
DROP INDEX IF EXISTS public.idx_references_logiciel_secours_2;
DROP INDEX IF EXISTS public.idx_references_logiciel_secours_1;
DROP INDEX IF EXISTS public.idx_priorites_1;
DROP INDEX IF EXISTS public.idx_permissions_1;
DROP INDEX IF EXISTS public.idx_notifications_3;
DROP INDEX IF EXISTS public.idx_notifications_2;
DROP INDEX IF EXISTS public.idx_notifications_1;
DROP INDEX IF EXISTS public.idx_modes_paiement_2;
DROP INDEX IF EXISTS public.idx_modes_paiement_1;
DROP INDEX IF EXISTS public.idx_messages_3;
DROP INDEX IF EXISTS public.idx_messages_2;
DROP INDEX IF EXISTS public.idx_messages_1;
DROP INDEX IF EXISTS public.idx_mandatements_2;
DROP INDEX IF EXISTS public.idx_mandatements_1;
DROP INDEX IF EXISTS public.idx_mandatement_beneficiaires_1;
DROP INDEX IF EXISTS public.idx_liquidations_pension_2;
DROP INDEX IF EXISTS public.idx_liquidations_pension_1;
DROP INDEX IF EXISTS public.idx_insertions_paiement_2;
DROP INDEX IF EXISTS public.idx_insertions_paiement_1;
DROP INDEX IF EXISTS public.idx_immatriculations_5;
DROP INDEX IF EXISTS public.idx_immatriculations_4;
DROP INDEX IF EXISTS public.idx_immatriculations_3;
DROP INDEX IF EXISTS public.idx_immatriculations_2;
DROP INDEX IF EXISTS public.idx_immatriculations_1;
DROP INDEX IF EXISTS public.idx_historique_actions_2;
DROP INDEX IF EXISTS public.idx_historique_actions_1;
DROP INDEX IF EXISTS public.idx_fonctions_1;
DROP INDEX IF EXISTS public.idx_etats_emargement_2;
DROP INDEX IF EXISTS public.idx_etats_emargement_1;
DROP INDEX IF EXISTS public.idx_emargements_2;
DROP INDEX IF EXISTS public.idx_emargements_1;
DROP INDEX IF EXISTS public.idx_dossiers_districts_4;
DROP INDEX IF EXISTS public.idx_dossiers_districts_3;
DROP INDEX IF EXISTS public.idx_dossiers_districts_2;
DROP INDEX IF EXISTS public.idx_dossiers_districts_1;
DROP INDEX IF EXISTS public.idx_dossiers_9;
DROP INDEX IF EXISTS public.idx_dossiers_8;
DROP INDEX IF EXISTS public.idx_dossiers_7;
DROP INDEX IF EXISTS public.idx_dossiers_6;
DROP INDEX IF EXISTS public.idx_dossiers_5;
DROP INDEX IF EXISTS public.idx_dossiers_4;
DROP INDEX IF EXISTS public.idx_dossiers_3;
DROP INDEX IF EXISTS public.idx_dossiers_2;
DROP INDEX IF EXISTS public.idx_dossiers_14;
DROP INDEX IF EXISTS public.idx_dossiers_13;
DROP INDEX IF EXISTS public.idx_dossiers_12;
DROP INDEX IF EXISTS public.idx_dossiers_11;
DROP INDEX IF EXISTS public.idx_dossiers_10;
DROP INDEX IF EXISTS public.idx_dossiers_1;
DROP INDEX IF EXISTS public.idx_dossier_commentaires_2;
DROP INDEX IF EXISTS public.idx_dossier_commentaires_1;
DROP INDEX IF EXISTS public.idx_donnees_operation_4;
DROP INDEX IF EXISTS public.idx_donnees_operation_3;
DROP INDEX IF EXISTS public.idx_donnees_operation_2;
DROP INDEX IF EXISTS public.idx_donnees_operation_1;
DROP INDEX IF EXISTS public.idx_documents_6;
DROP INDEX IF EXISTS public.idx_documents_5;
DROP INDEX IF EXISTS public.idx_documents_4;
DROP INDEX IF EXISTS public.idx_documents_3;
DROP INDEX IF EXISTS public.idx_documents_2;
DROP INDEX IF EXISTS public.idx_documents_1;
DROP INDEX IF EXISTS public.idx_divisions_3;
DROP INDEX IF EXISTS public.idx_divisions_2;
DROP INDEX IF EXISTS public.idx_divisions_1;
DROP INDEX IF EXISTS public.idx_districts_2;
DROP INDEX IF EXISTS public.idx_districts_1;
DROP INDEX IF EXISTS public.idx_depouillements_3;
DROP INDEX IF EXISTS public.idx_depouillements_2;
DROP INDEX IF EXISTS public.idx_depouillements_1;
DROP INDEX IF EXISTS public.idx_delegations_3;
DROP INDEX IF EXISTS public.idx_delegations_2;
DROP INDEX IF EXISTS public.idx_delegations_1;
DROP INDEX IF EXISTS public.idx_decomptes_avance_2;
DROP INDEX IF EXISTS public.idx_decomptes_avance_1;
DROP INDEX IF EXISTS public.idx_courriers_6;
DROP INDEX IF EXISTS public.idx_courriers_5;
DROP INDEX IF EXISTS public.idx_courriers_4;
DROP INDEX IF EXISTS public.idx_courriers_3;
DROP INDEX IF EXISTS public.idx_courriers_2;
DROP INDEX IF EXISTS public.idx_courriers_1;
DROP INDEX IF EXISTS public.idx_correspondances_3;
DROP INDEX IF EXISTS public.idx_correspondances_2;
DROP INDEX IF EXISTS public.idx_correspondances_1;
DROP INDEX IF EXISTS public.idx_controles_decompte_2;
DROP INDEX IF EXISTS public.idx_controles_decompte_1;
DROP INDEX IF EXISTS public.idx_cachets_mandatement_2;
DROP INDEX IF EXISTS public.idx_cachets_mandatement_1;
DROP INDEX IF EXISTS public.idx_bordereaux_dossiers_1;
DROP INDEX IF EXISTS public.idx_bordereaux_6;
DROP INDEX IF EXISTS public.idx_bordereaux_5;
DROP INDEX IF EXISTS public.idx_bordereaux_4;
DROP INDEX IF EXISTS public.idx_bordereaux_3;
DROP INDEX IF EXISTS public.idx_bordereaux_2;
DROP INDEX IF EXISTS public.idx_bordereaux_1;
DROP INDEX IF EXISTS public.idx_archives_5;
DROP INDEX IF EXISTS public.idx_archives_4;
DROP INDEX IF EXISTS public.idx_archives_3;
DROP INDEX IF EXISTS public.idx_archives_2;
DROP INDEX IF EXISTS public.idx_archives_1;
DROP INDEX IF EXISTS public.idx_antennes_2;
DROP INDEX IF EXISTS public.idx_antennes_1;
DROP INDEX IF EXISTS public.idx_agents_4;
DROP INDEX IF EXISTS public.idx_agents_3;
DROP INDEX IF EXISTS public.idx_agents_2;
DROP INDEX IF EXISTS public.idx_agents_1;
DROP INDEX IF EXISTS public.idx_affectations_4;
DROP INDEX IF EXISTS public.idx_affectations_3;
DROP INDEX IF EXISTS public.idx_affectations_2;
DROP INDEX IF EXISTS public.idx_affectations_1;
ALTER TABLE IF EXISTS ONLY public.visas_controle_financier DROP CONSTRAINT IF EXISTS pk_visas_controle_financier;
ALTER TABLE IF EXISTS ONLY public.verifications DROP CONSTRAINT IF EXISTS pk_verifications;
ALTER TABLE IF EXISTS ONLY public.validations DROP CONSTRAINT IF EXISTS pk_validations;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS pk_users;
ALTER TABLE IF EXISTS ONLY public.types_pieces DROP CONSTRAINT IF EXISTS pk_types_pieces;
ALTER TABLE IF EXISTS ONLY public.types_dossiers DROP CONSTRAINT IF EXISTS pk_types_dossiers;
ALTER TABLE IF EXISTS ONLY public.types_documents DROP CONSTRAINT IF EXISTS pk_types_documents;
ALTER TABLE IF EXISTS ONLY public.types_courriers DROP CONSTRAINT IF EXISTS pk_types_courriers;
ALTER TABLE IF EXISTS ONLY public.transferts DROP CONSTRAINT IF EXISTS pk_transferts;
ALTER TABLE IF EXISTS ONLY public.traitements DROP CONSTRAINT IF EXISTS pk_traitements;
ALTER TABLE IF EXISTS ONLY public.suppressions_dossiers DROP CONSTRAINT IF EXISTS pk_suppressions_dossiers;
ALTER TABLE IF EXISTS ONLY public.statuts_dossiers DROP CONSTRAINT IF EXISTS pk_statuts_dossiers;
ALTER TABLE IF EXISTS ONLY public.sous_types_dossiers DROP CONSTRAINT IF EXISTS pk_sous_types_dossiers;
ALTER TABLE IF EXISTS ONLY public.signatures_ordonnateur DROP CONSTRAINT IF EXISTS pk_signatures_ordonnateur;
ALTER TABLE IF EXISTS ONLY public.signalements_dossier DROP CONSTRAINT IF EXISTS pk_signalements_dossier;
ALTER TABLE IF EXISTS ONLY public.schemas_operations DROP CONSTRAINT IF EXISTS pk_schemas_operations;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS pk_schema_migrations;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS pk_roles;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS pk_role_permissions;
ALTER TABLE IF EXISTS ONLY public.reinitialisations_mot_de_passe DROP CONSTRAINT IF EXISTS pk_reinitialisations_mot_de_passe;
ALTER TABLE IF EXISTS ONLY public.referentiel_service DROP CONSTRAINT IF EXISTS pk_referentiel_service;
ALTER TABLE IF EXISTS ONLY public.referentiel_postes DROP CONSTRAINT IF EXISTS pk_referentiel_postes;
ALTER TABLE IF EXISTS ONLY public.referentiel_fonctionnalites DROP CONSTRAINT IF EXISTS pk_referentiel_fonctionnalites;
ALTER TABLE IF EXISTS ONLY public.references_logiciel_secours DROP CONSTRAINT IF EXISTS pk_references_logiciel_secours;
ALTER TABLE IF EXISTS ONLY public.priorites DROP CONSTRAINT IF EXISTS pk_priorites;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS pk_permissions;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS pk_notifications;
ALTER TABLE IF EXISTS ONLY public.modes_paiement DROP CONSTRAINT IF EXISTS pk_modes_paiement;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS pk_messages;
ALTER TABLE IF EXISTS ONLY public.mandatements DROP CONSTRAINT IF EXISTS pk_mandatements;
ALTER TABLE IF EXISTS ONLY public.mandatement_pieces_etat DROP CONSTRAINT IF EXISTS pk_mandatement_pieces_etat;
ALTER TABLE IF EXISTS ONLY public.mandatement_pieces DROP CONSTRAINT IF EXISTS pk_mandatement_pieces;
ALTER TABLE IF EXISTS ONLY public.mandatement_beneficiaires DROP CONSTRAINT IF EXISTS pk_mandatement_beneficiaires;
ALTER TABLE IF EXISTS ONLY public.liquidations_pension DROP CONSTRAINT IF EXISTS pk_liquidations_pension;
ALTER TABLE IF EXISTS ONLY public.insertions_paiement DROP CONSTRAINT IF EXISTS pk_insertions_paiement;
ALTER TABLE IF EXISTS ONLY public.immatriculations DROP CONSTRAINT IF EXISTS pk_immatriculations;
ALTER TABLE IF EXISTS ONLY public.historique_actions DROP CONSTRAINT IF EXISTS pk_historique_actions;
ALTER TABLE IF EXISTS ONLY public.fonctions DROP CONSTRAINT IF EXISTS pk_fonctions;
ALTER TABLE IF EXISTS ONLY public.etats_emargement DROP CONSTRAINT IF EXISTS pk_etats_emargement;
ALTER TABLE IF EXISTS ONLY public.emargements DROP CONSTRAINT IF EXISTS pk_emargements;
ALTER TABLE IF EXISTS ONLY public.dossiers_districts DROP CONSTRAINT IF EXISTS pk_dossiers_districts;
ALTER TABLE IF EXISTS ONLY public.dossiers DROP CONSTRAINT IF EXISTS pk_dossiers;
ALTER TABLE IF EXISTS ONLY public.dossier_commentaires DROP CONSTRAINT IF EXISTS pk_dossier_commentaires;
ALTER TABLE IF EXISTS ONLY public.donnees_operation DROP CONSTRAINT IF EXISTS pk_donnees_operation;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS pk_documents;
ALTER TABLE IF EXISTS ONLY public.divisions DROP CONSTRAINT IF EXISTS pk_divisions;
ALTER TABLE IF EXISTS ONLY public.districts DROP CONSTRAINT IF EXISTS pk_districts;
ALTER TABLE IF EXISTS ONLY public.depouillements DROP CONSTRAINT IF EXISTS pk_depouillements;
ALTER TABLE IF EXISTS ONLY public.delegations DROP CONSTRAINT IF EXISTS pk_delegations;
ALTER TABLE IF EXISTS ONLY public.decomptes_avance DROP CONSTRAINT IF EXISTS pk_decomptes_avance;
ALTER TABLE IF EXISTS ONLY public.courriers DROP CONSTRAINT IF EXISTS pk_courriers;
ALTER TABLE IF EXISTS ONLY public.correspondances DROP CONSTRAINT IF EXISTS pk_correspondances;
ALTER TABLE IF EXISTS ONLY public.controles_decompte DROP CONSTRAINT IF EXISTS pk_controles_decompte;
ALTER TABLE IF EXISTS ONLY public.compteurs_numerotation DROP CONSTRAINT IF EXISTS pk_compteurs_numerotation;
ALTER TABLE IF EXISTS ONLY public.cachets_mandatement DROP CONSTRAINT IF EXISTS pk_cachets_mandatement;
ALTER TABLE IF EXISTS ONLY public.bordereaux_dossiers DROP CONSTRAINT IF EXISTS pk_bordereaux_dossiers;
ALTER TABLE IF EXISTS ONLY public.bordereaux DROP CONSTRAINT IF EXISTS pk_bordereaux;
ALTER TABLE IF EXISTS ONLY public.archives DROP CONSTRAINT IF EXISTS pk_archives;
ALTER TABLE IF EXISTS ONLY public.antennes DROP CONSTRAINT IF EXISTS pk_antennes;
ALTER TABLE IF EXISTS ONLY public.agents DROP CONSTRAINT IF EXISTS pk_agents;
ALTER TABLE IF EXISTS ONLY public.affectations DROP CONSTRAINT IF EXISTS pk_affectations;
DROP TABLE IF EXISTS public.visas_controle_financier;
DROP TABLE IF EXISTS public.verifications;
DROP TABLE IF EXISTS public.validations;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.types_pieces;
DROP TABLE IF EXISTS public.types_dossiers;
DROP TABLE IF EXISTS public.types_documents;
DROP TABLE IF EXISTS public.types_courriers;
DROP TABLE IF EXISTS public.transferts;
DROP TABLE IF EXISTS public.traitements;
DROP TABLE IF EXISTS public.suppressions_dossiers;
DROP TABLE IF EXISTS public.statuts_dossiers;
DROP TABLE IF EXISTS public.sous_types_dossiers;
DROP TABLE IF EXISTS public.signatures_ordonnateur;
DROP TABLE IF EXISTS public.signalements_dossier;
DROP TABLE IF EXISTS public.schemas_operations;
DROP TABLE IF EXISTS public.schema_migrations;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.reinitialisations_mot_de_passe;
DROP TABLE IF EXISTS public.referentiel_service;
DROP TABLE IF EXISTS public.referentiel_postes;
DROP TABLE IF EXISTS public.referentiel_fonctionnalites;
DROP TABLE IF EXISTS public.references_logiciel_secours;
DROP TABLE IF EXISTS public.priorites;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.modes_paiement;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.mandatements;
DROP TABLE IF EXISTS public.mandatement_pieces_etat;
DROP TABLE IF EXISTS public.mandatement_pieces;
DROP TABLE IF EXISTS public.mandatement_beneficiaires;
DROP TABLE IF EXISTS public.liquidations_pension;
DROP TABLE IF EXISTS public.insertions_paiement;
DROP TABLE IF EXISTS public.immatriculations;
DROP TABLE IF EXISTS public.historique_actions;
DROP TABLE IF EXISTS public.fonctions;
DROP TABLE IF EXISTS public.etats_emargement;
DROP TABLE IF EXISTS public.emargements;
DROP TABLE IF EXISTS public.dossiers_districts;
DROP TABLE IF EXISTS public.dossiers;
DROP TABLE IF EXISTS public.dossier_commentaires;
DROP TABLE IF EXISTS public.donnees_operation;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.divisions;
DROP TABLE IF EXISTS public.districts;
DROP TABLE IF EXISTS public.depouillements;
DROP TABLE IF EXISTS public.delegations;
DROP TABLE IF EXISTS public.decomptes_avance;
DROP TABLE IF EXISTS public.courriers;
DROP TABLE IF EXISTS public.correspondances;
DROP TABLE IF EXISTS public.controles_decompte;
DROP TABLE IF EXISTS public.compteurs_numerotation;
DROP TABLE IF EXISTS public.cachets_mandatement;
DROP TABLE IF EXISTS public.bordereaux_dossiers;
DROP TABLE IF EXISTS public.bordereaux;
DROP TABLE IF EXISTS public.archives;
DROP TABLE IF EXISTS public.antennes;
DROP TABLE IF EXISTS public.agents;
DROP TABLE IF EXISTS public.affectations;
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.datediff(a timestamp without time zone, b timestamp without time zone);
DROP COLLATION IF EXISTS public.ci;
--
-- Name: ci; Type: COLLATION; Schema: public; Owner: -
--

CREATE COLLATION public.ci (provider = icu, deterministic = false, locale = 'und-u-ks-level1');


--
-- Name: datediff(timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.datediff(a timestamp without time zone, b timestamp without time zone) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT (a::date - b::date)::integer;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
    NEW.updated_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: affectations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affectations (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    division_id integer,
    agent_id integer,
    ancien_agent_id integer,
    motif text COLLATE public.ci,
    auteur_id integer,
    date_affectation timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: affectations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.affectations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.affectations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agents (
    id integer NOT NULL,
    user_id integer,
    nom character varying(100) NOT NULL COLLATE public.ci,
    prenom character varying(100) NOT NULL COLLATE public.ci,
    matricule character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    fonction_id integer,
    division_id integer,
    email character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    telephone character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    actif smallint DEFAULT 1,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: agents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.agents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.agents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: antennes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.antennes (
    id integer NOT NULL,
    code character varying(30) NOT NULL COLLATE public.ci,
    libelle character varying(100) NOT NULL COLLATE public.ci,
    siege smallint DEFAULT 0 NOT NULL,
    actif smallint DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: antennes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.antennes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.antennes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: archives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.archives (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    date_archivage timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    reference_archivage character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    emplacement_physique character varying(255) DEFAULT NULL::character varying COLLATE public.ci,
    localisation_numerique character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    archive_par integer,
    motif text COLLATE public.ci,
    restaure smallint DEFAULT 0
);


--
-- Name: archives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.archives ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.archives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bordereaux; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bordereaux (
    id integer NOT NULL,
    reference character varying(50) NOT NULL COLLATE public.ci,
    division_id integer NOT NULL,
    agent_id integer,
    date_transmission timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    observation text COLLATE public.ci,
    statut character varying(17) DEFAULT 'BROUILLON'::character varying COLLATE public.ci,
    date_reception_division timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    recu_par integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_bordereaux_statut CHECK (((statut)::text = ANY (ARRAY[('BROUILLON'::character varying)::text, ('EMIS'::character varying)::text, ('RECU_PAR_DIVISION'::character varying)::text, ('ARCHIVE'::character varying)::text])))
);


--
-- Name: bordereaux_dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bordereaux_dossiers (
    bordereau_id integer NOT NULL,
    dossier_id integer NOT NULL,
    ordre integer DEFAULT 0
);


--
-- Name: bordereaux_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.bordereaux ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.bordereaux_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cachets_mandatement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cachets_mandatement (
    id integer NOT NULL,
    mandatement_id integer NOT NULL,
    cache_par integer NOT NULL,
    date_cachet date NOT NULL,
    titre_ordonnateur character varying(200) NOT NULL COLLATE public.ci,
    nom_ordonnateur character varying(150) NOT NULL COLLATE public.ci,
    observations character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cachets_mandatement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cachets_mandatement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.cachets_mandatement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: compteurs_numerotation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compteurs_numerotation (
    cle character varying(60) NOT NULL COLLATE public.ci,
    valeur integer DEFAULT 0 NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: controles_decompte; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.controles_decompte (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    controleur_id integer,
    decision character varying(8) NOT NULL COLLATE public.ci,
    calculs_verifies smallint DEFAULT 0 NOT NULL,
    pieces_justificatives smallint DEFAULT 0 NOT NULL,
    certificat_cessation smallint DEFAULT 0 NOT NULL,
    observation text COLLATE public.ci,
    date_controle timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_controles_decompte_decision CHECK (((decision)::text = ANY (ARRAY[('APPROUVE'::character varying)::text, ('RETOURNE'::character varying)::text])))
);


--
-- Name: controles_decompte_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.controles_decompte ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.controles_decompte_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: correspondances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.correspondances (
    id integer NOT NULL,
    dossier_id integer,
    type character varying(30) NOT NULL COLLATE public.ci,
    reference character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    document_id integer,
    destinataire character varying(150) NOT NULL COLLATE public.ci,
    objet character varying(200) NOT NULL COLLATE public.ci,
    contenu text COLLATE public.ci,
    etat character varying(9) DEFAULT 'BROUILLON'::character varying NOT NULL COLLATE public.ci,
    date_envoi timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    etat_reponse character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    date_reponse timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    reponse text COLLATE public.ci,
    date_transmission_central timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    destinataire_central character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    reference_bordereau character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    etat_reception_central character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    CONSTRAINT chk_correspondances_etat CHECK (((etat)::text = ANY (ARRAY[('BROUILLON'::character varying)::text, ('ENVOYEE'::character varying)::text]))),
    CONSTRAINT chk_correspondances_type CHECK (((type)::text = ANY (ARRAY[('LETTRE_PRESCRIPTION'::character varying)::text, ('DEMANDE_DOSSIERE_MERE'::character varying)::text, ('OPPOSITION_PENSION_ALIMENTAIRE'::character varying)::text, ('OPPOSITION_CESSION_VOLONTAIRE'::character varying)::text, ('OPPOSITION_SAISIE_ARRET'::character varying)::text])))
);


--
-- Name: correspondances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.correspondances ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.correspondances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: courriers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courriers (
    id integer NOT NULL,
    numero character varying(50) NOT NULL COLLATE public.ci,
    type_id integer,
    sens character varying(7) NOT NULL COLLATE public.ci,
    expediteur character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    destinataire character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    objet text NOT NULL COLLATE public.ci,
    division_id integer,
    statut character varying(50) DEFAULT 'RECU'::character varying COLLATE public.ci,
    document_id integer,
    dossier_id integer,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_courriers_sens CHECK (((sens)::text = ANY (ARRAY[('ENTRANT'::character varying)::text, ('SORTANT'::character varying)::text])))
);


--
-- Name: courriers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.courriers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.courriers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: decomptes_avance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decomptes_avance (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    agent_id integer,
    salaire_mensuel bigint DEFAULT 0 NOT NULL,
    indice integer,
    echelon smallint,
    avance_demandee bigint DEFAULT 0 NOT NULL,
    retenue_mensuelle bigint DEFAULT 0 NOT NULL,
    duree_mois smallint DEFAULT 0 NOT NULL,
    mois_rembourses smallint DEFAULT 0 NOT NULL,
    net_a_payer bigint DEFAULT 0 NOT NULL,
    reste_a_rembourser bigint DEFAULT 0 NOT NULL,
    observation text COLLATE public.ci,
    date_calcul timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: decomptes_avance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.decomptes_avance ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.decomptes_avance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: delegations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delegations (
    id integer NOT NULL,
    agent_id integer NOT NULL,
    remplacant_id integer NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    motif character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: delegations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.delegations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.delegations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: depouillements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.depouillements (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    agent_id integer,
    piece character varying(80) NOT NULL COLLATE public.ci,
    presente smallint DEFAULT 0 NOT NULL,
    etat character varying(14) DEFAULT 'MANQUANTE'::character varying NOT NULL COLLATE public.ci,
    observation text COLLATE public.ci,
    motif character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    date_controle timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_depouillements_etat CHECK (((etat)::text = ANY (ARRAY[('PRESENTE'::character varying)::text, ('MANQUANTE'::character varying)::text, ('ILLISIBLE'::character varying)::text, ('A_CORRIGER'::character varying)::text, ('NON_APPLICABLE'::character varying)::text])))
);


--
-- Name: depouillements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.depouillements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.depouillements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id integer NOT NULL,
    antenne_id integer NOT NULL,
    code character varying(30) NOT NULL COLLATE public.ci,
    libelle character varying(100) NOT NULL COLLATE public.ci,
    actif smallint DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.districts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: divisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.divisions (
    id integer NOT NULL,
    code character varying(20) NOT NULL COLLATE public.ci,
    nom character varying(100) NOT NULL COLLATE public.ci,
    type_dossier_id integer NOT NULL,
    responsable_id integer,
    actif smallint DEFAULT 1,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: divisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.divisions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.divisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    dossier_id integer,
    courrier_id integer,
    type_id integer,
    piece_code character varying(80) DEFAULT NULL::character varying COLLATE public.ci,
    version integer DEFAULT 1 NOT NULL,
    remplace integer,
    motif_remplacement character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    nom_fichier character varying(255) NOT NULL COLLATE public.ci,
    chemin_stockage character varying(500) NOT NULL COLLATE public.ci,
    taille integer,
    description character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    valide smallint DEFAULT 0,
    upload_par integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: donnees_operation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donnees_operation (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    sous_type_id integer,
    reference_externe character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    reference_dossier_mere character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    matricule character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    periode character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    montant numeric(15,2) DEFAULT NULL::numeric,
    source_montant character varying(255) DEFAULT NULL::character varying COLLATE public.ci,
    date_reference date,
    destinataire character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    date_transmission timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    reference_transmission character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    etat_transmission character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    localisation character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    observation text COLLATE public.ci,
    controleur_id integer,
    date_controle timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    observations_controle text COLLATE public.ci,
    decision_controle character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    valide_par integer,
    date_validation timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    donnees text COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: donnees_operation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.donnees_operation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.donnees_operation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: dossier_commentaires; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dossier_commentaires (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    auteur_id integer NOT NULL,
    contenu text NOT NULL COLLATE public.ci,
    date_creation timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modifie_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


--
-- Name: dossier_commentaires_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.dossier_commentaires ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dossier_commentaires_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dossiers (
    id integer NOT NULL,
    numero character varying(50) NOT NULL COLLATE public.ci,
    reference_visa character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    type_id integer,
    sous_type_id integer,
    objet text NOT NULL COLLATE public.ci,
    demandeur character varying(150) NOT NULL COLLATE public.ci,
    matricule character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    date_reception date NOT NULL,
    date_heure_reception timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    date_limite date,
    division_id integer,
    priorite_id integer,
    statut_id integer,
    agent_responsable_id integer,
    observation text COLLATE public.ci,
    date_cloture date,
    date_archivage date,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    demandeur_nom character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    demandeur_prenom character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    demandeur_tel character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    demandeur_email character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    demandeur_adresse character varying(255) DEFAULT NULL::character varying COLLATE public.ci,
    origine_presentateur character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    comptable_presentateur character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    type_acte character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    annee_reference smallint,
    verificateur_id integer,
    date_signature timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    signataire_id integer,
    reference_signature character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    exception_validation text COLLATE public.ci,
    exception_autorisee_par integer,
    date_exception timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    motif_complement text COLLATE public.ci,
    beneficiaire character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    organisme character varying(200) DEFAULT NULL::character varying COLLATE public.ci
);


--
-- Name: dossiers_districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dossiers_districts (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    district_id integer NOT NULL,
    date_rattachement date NOT NULL,
    courante smallint DEFAULT 1 NOT NULL,
    origine character varying(40) DEFAULT 'SAISIE'::character varying NOT NULL COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: dossiers_districts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.dossiers_districts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dossiers_districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.dossiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dossiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: emargements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emargements (
    id integer NOT NULL,
    etat_emargement_id integer NOT NULL,
    beneficiaire_id integer NOT NULL,
    signataire character varying(200) DEFAULT NULL::character varying COLLATE public.ci,
    signe_le date,
    observation character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: emargements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.emargements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.emargements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: etats_emargement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.etats_emargement (
    id integer NOT NULL,
    mandatement_id integer NOT NULL,
    genere_par integer,
    genere_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: etats_emargement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.etats_emargement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.etats_emargement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: fonctions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fonctions (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL COLLATE public.ci,
    description text COLLATE public.ci
);


--
-- Name: fonctions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.fonctions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.fonctions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: historique_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historique_actions (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL COLLATE public.ci,
    dossier_id integer,
    ancienne_valeur text COLLATE public.ci,
    nouvelle_valeur text COLLATE public.ci,
    details text COLLATE public.ci,
    ip_address character varying(45) DEFAULT NULL::character varying COLLATE public.ci,
    date_action timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: historique_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.historique_actions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.historique_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: immatriculations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.immatriculations (
    id integer NOT NULL,
    nom character varying(100) NOT NULL COLLATE public.ci,
    prenom character varying(100) NOT NULL COLLATE public.ci,
    cin character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    date_naissance date,
    corps character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    grade character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    indice integer,
    date_entree date,
    division_id integer,
    matricule character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    statut character varying(10) DEFAULT 'EN_ATTENTE'::character varying NOT NULL COLLATE public.ci,
    observations text COLLATE public.ci,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_immatriculations_statut CHECK (((statut)::text = ANY (ARRAY[('EN_ATTENTE'::character varying)::text, ('ACTIVE'::character varying)::text, ('REJETEE'::character varying)::text])))
);


--
-- Name: immatriculations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.immatriculations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.immatriculations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: insertions_paiement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insertions_paiement (
    id integer NOT NULL,
    immatriculation_id integer NOT NULL,
    matricule_augure character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    situation_familiale character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    adresse character varying(255) DEFAULT NULL::character varying COLLATE public.ci,
    telephone character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    date_naissance date,
    indice_base integer,
    salaire_base numeric(15,2) DEFAULT NULL::numeric,
    statut character varying(9) DEFAULT 'A_INSERER'::character varying NOT NULL COLLATE public.ci,
    observations text COLLATE public.ci,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_insertions_paiement_statut CHECK (((statut)::text = ANY (ARRAY[('A_INSERER'::character varying)::text, ('INSERE'::character varying)::text, ('REJETE'::character varying)::text])))
);


--
-- Name: insertions_paiement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.insertions_paiement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.insertions_paiement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: liquidations_pension; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.liquidations_pension (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    agent_id integer,
    annees_service smallint DEFAULT 0 NOT NULL,
    indice_final integer,
    pension_brute bigint DEFAULT 0 NOT NULL,
    retenues bigint DEFAULT 0 NOT NULL,
    observation text COLLATE public.ci,
    date_calcul timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: liquidations_pension_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.liquidations_pension ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.liquidations_pension_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mandatement_beneficiaires; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mandatement_beneficiaires (
    id integer NOT NULL,
    mandatement_id integer NOT NULL,
    nom character varying(100) NOT NULL COLLATE public.ci,
    prenom character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    lien character varying(60) DEFAULT NULL::character varying COLLATE public.ci,
    quote_part numeric(5,2) DEFAULT 0.00 NOT NULL,
    montant numeric(15,2) DEFAULT 0.00 NOT NULL,
    matricule character varying(50) DEFAULT NULL::character varying COLLATE public.ci
);


--
-- Name: mandatement_beneficiaires_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mandatement_beneficiaires ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mandatement_beneficiaires_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mandatement_pieces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mandatement_pieces (
    code character varying(50) NOT NULL COLLATE public.ci,
    libelle character varying(150) NOT NULL COLLATE public.ci,
    ordre smallint DEFAULT 0 NOT NULL
);


--
-- Name: mandatement_pieces_etat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mandatement_pieces_etat (
    mandatement_id integer NOT NULL,
    piece_code character varying(50) NOT NULL COLLATE public.ci,
    imprimee smallint DEFAULT 0 NOT NULL,
    date_impression timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


--
-- Name: mandatements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mandatements (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    montant_total bigint DEFAULT 0 NOT NULL,
    etat character varying(13) DEFAULT 'BROUILLON'::character varying NOT NULL COLLATE public.ci,
    ordonnancement_date timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    ordonnateur_id integer,
    liquidation_date timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    observation text COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_mandatements_etat CHECK (((etat)::text = ANY (ARRAY[('BROUILLON'::character varying)::text, ('A_ORDONNANCER'::character varying)::text, ('ORDONNANCE'::character varying)::text, ('LIQUIDE'::character varying)::text])))
);


--
-- Name: mandatements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mandatements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mandatements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    dossier_id integer,
    expediteur_id integer NOT NULL,
    destinataire_id integer NOT NULL,
    action character varying(50) NOT NULL COLLATE public.ci,
    message text NOT NULL COLLATE public.ci,
    type character varying(20) DEFAULT 'INFO'::character varying COLLATE public.ci,
    lu smallint DEFAULT 0,
    date_creation timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modes_paiement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modes_paiement (
    id integer NOT NULL,
    immatriculation_id integer NOT NULL,
    mode character varying(8) NOT NULL COLLATE public.ci,
    banque character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    compte_bancaire character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    motif character varying(1000) NOT NULL COLLATE public.ci,
    pieces_verifiees smallint DEFAULT 0 NOT NULL,
    statut character varying(10) DEFAULT 'EN_ATTENTE'::character varying NOT NULL COLLATE public.ci,
    observations text COLLATE public.ci,
    created_by integer,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_modes_paiement_mode CHECK (((mode)::text = ANY (ARRAY[('VIREMENT'::character varying)::text, ('CHEQUE'::character varying)::text, ('ESPECES'::character varying)::text, ('MANDAT'::character varying)::text]))),
    CONSTRAINT chk_modes_paiement_statut CHECK (((statut)::text = ANY (ARRAY[('EN_ATTENTE'::character varying)::text, ('APPROUVE'::character varying)::text, ('REJETE'::character varying)::text])))
);


--
-- Name: modes_paiement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.modes_paiement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.modes_paiement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    dossier_id integer,
    type character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    action character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    message text NOT NULL COLLATE public.ci,
    lien character varying(255) DEFAULT NULL::character varying COLLATE public.ci,
    lu smallint DEFAULT 0,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    nom character varying(100) NOT NULL COLLATE public.ci,
    description text COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: priorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.priorites (
    id integer NOT NULL,
    libelle character varying(50) NOT NULL COLLATE public.ci,
    niveau integer DEFAULT 1
);


--
-- Name: priorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.priorites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.priorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: references_logiciel_secours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.references_logiciel_secours (
    id integer NOT NULL,
    mandatement_id integer NOT NULL,
    code character varying(30) NOT NULL COLLATE public.ci,
    libelle character varying(200) NOT NULL COLLATE public.ci,
    valeur character varying(200) NOT NULL COLLATE public.ci,
    reporte_par integer,
    reporte_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


--
-- Name: references_logiciel_secours_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.references_logiciel_secours ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.references_logiciel_secours_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: referentiel_fonctionnalites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referentiel_fonctionnalites (
    id integer NOT NULL,
    document character varying(60) DEFAULT 'HISTORIQUE'::character varying NOT NULL COLLATE public.ci,
    numero_source integer NOT NULL,
    poste_code character varying(60) NOT NULL COLLATE public.ci,
    libelle character varying(255) NOT NULL COLLATE public.ci,
    detail character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    section_source character varying(80) NOT NULL COLLATE public.ci,
    nature character varying(14) DEFAULT 'METIER'::character varying NOT NULL COLLATE public.ci,
    permission_nom character varying(80) DEFAULT NULL::character varying COLLATE public.ci,
    etat character varying(15) DEFAULT 'NON_CONSTRUITE'::character varying NOT NULL COLLATE public.ci,
    motif character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_referentiel_fonctionnalites_etat CHECK (((etat)::text = ANY (ARRAY[('LIVREE'::character varying)::text, ('PARTIELLE'::character varying)::text, ('INERTE'::character varying)::text, ('NON_CONSTRUITE'::character varying)::text, ('HORS_PLATEFORME'::character varying)::text]))),
    CONSTRAINT chk_referentiel_fonctionnalites_nature CHECK (((nature)::text = ANY (ARRAY[('METIER'::character varying)::text, ('INSTITUTIONNEL'::character varying)::text, ('STRUCTURE'::character varying)::text, ('INTEGRATION'::character varying)::text])))
);


--
-- Name: referentiel_fonctionnalites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.referentiel_fonctionnalites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.referentiel_fonctionnalites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: referentiel_postes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referentiel_postes (
    id integer NOT NULL,
    code character varying(60) NOT NULL COLLATE public.ci,
    libelle character varying(150) NOT NULL COLLATE public.ci,
    role_nom character varying(60) DEFAULT NULL::character varying COLLATE public.ci,
    niveau smallint DEFAULT 3 NOT NULL,
    actif smallint DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: referentiel_postes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.referentiel_postes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.referentiel_postes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: referentiel_service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referentiel_service (
    id integer NOT NULL,
    cle character varying(60) NOT NULL COLLATE public.ci,
    libelle character varying(200) NOT NULL COLLATE public.ci,
    valeur character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    categorie character varying(60) NOT NULL COLLATE public.ci,
    ordre smallint DEFAULT 0 NOT NULL
);


--
-- Name: referentiel_service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.referentiel_service ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.referentiel_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reinitialisations_mot_de_passe; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reinitialisations_mot_de_passe (
    id integer NOT NULL,
    user_id integer NOT NULL,
    identifiant_saisi character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    statut character varying(11) DEFAULT 'EN_ATTENTE'::character varying NOT NULL COLLATE public.ci,
    empreinte character(64) DEFAULT NULL::bpchar COLLATE public.ci,
    code_genere_par integer,
    code_genere_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    expire_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    tentatives integer DEFAULT 0 NOT NULL,
    utilise_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    motif character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    ip_address character varying(45) DEFAULT NULL::character varying COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_reinitialisations_mot_de_passe_statut CHECK (((statut)::text = ANY (ARRAY[('EN_ATTENTE'::character varying)::text, ('CODE_GENERE'::character varying)::text, ('UTILISE'::character varying)::text, ('ANNULE'::character varying)::text, ('EXPIRE'::character varying)::text])))
);


--
-- Name: reinitialisations_mot_de_passe_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reinitialisations_mot_de_passe ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reinitialisations_mot_de_passe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nom character varying(100) NOT NULL COLLATE public.ci,
    description text COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    id integer NOT NULL,
    version integer NOT NULL,
    fichier character varying(255) NOT NULL COLLATE public.ci,
    sha256 character(64) NOT NULL COLLATE public.ci,
    lignes integer DEFAULT 0 NOT NULL,
    applique_le timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schema_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.schema_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schemas_operations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schemas_operations (
    id integer NOT NULL,
    sous_type_id integer NOT NULL,
    cle character varying(60) NOT NULL COLLATE public.ci,
    libelle character varying(150) NOT NULL COLLATE public.ci,
    type_champ character varying(20) DEFAULT 'texte'::character varying NOT NULL COLLATE public.ci,
    requis smallint DEFAULT 0 NOT NULL,
    options character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    aide character varying(255) DEFAULT NULL::character varying COLLATE public.ci,
    ordre smallint DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: schemas_operations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.schemas_operations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.schemas_operations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: signalements_dossier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signalements_dossier (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    division_id integer,
    signale_par integer NOT NULL,
    type character varying(13) DEFAULT 'BLOCAGE'::character varying NOT NULL COLLATE public.ci,
    priorite character varying(8) DEFAULT 'NORMALE'::character varying NOT NULL COLLATE public.ci,
    motif text NOT NULL COLLATE public.ci,
    statut character varying(8) DEFAULT 'OUVERT'::character varying NOT NULL COLLATE public.ci,
    traite_par integer,
    resolution text COLLATE public.ci,
    date_prise_en_charge timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    date_resolution timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_signalements_dossier_priorite CHECK (((priorite)::text = ANY (ARRAY[('NORMALE'::character varying)::text, ('HAUTE'::character varying)::text, ('CRITIQUE'::character varying)::text]))),
    CONSTRAINT chk_signalements_dossier_statut CHECK (((statut)::text = ANY (ARRAY[('OUVERT'::character varying)::text, ('EN_COURS'::character varying)::text, ('RESOLU'::character varying)::text, ('REJETE'::character varying)::text]))),
    CONSTRAINT chk_signalements_dossier_type CHECK (((type)::text = ANY (ARRAY[('BLOCAGE'::character varying)::text, ('INTERLOCUTION'::character varying)::text, ('ARBITRAGE'::character varying)::text])))
);


--
-- Name: signalements_dossier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.signalements_dossier ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.signalements_dossier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: signatures_ordonnateur; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatures_ordonnateur (
    id integer NOT NULL,
    mandatement_id integer NOT NULL,
    reference_signature character varying(100) NOT NULL COLLATE public.ci,
    signe_par integer,
    signe_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    archive_le timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    observations character varying(1000) DEFAULT NULL::character varying COLLATE public.ci,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: signatures_ordonnateur_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.signatures_ordonnateur ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.signatures_ordonnateur_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sous_types_dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sous_types_dossiers (
    id integer NOT NULL,
    type_dossier_id integer NOT NULL,
    code character varying(50) NOT NULL COLLATE public.ci,
    libelle character varying(150) NOT NULL COLLATE public.ci,
    actif smallint DEFAULT 1 NOT NULL,
    ordre smallint DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sous_types_dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sous_types_dossiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.sous_types_dossiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: statuts_dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.statuts_dossiers (
    id integer NOT NULL,
    code character varying(50) NOT NULL COLLATE public.ci,
    libelle character varying(100) NOT NULL COLLATE public.ci,
    ordre integer DEFAULT 0
);


--
-- Name: statuts_dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.statuts_dossiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.statuts_dossiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suppressions_dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppressions_dossiers (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    numero character varying(50) NOT NULL COLLATE public.ci,
    reference_visa character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    type_code character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    objet character varying(500) DEFAULT NULL::character varying COLLATE public.ci,
    demandeur character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    matricule character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    division_nom character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    statut_code character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    agent_nom character varying(100) DEFAULT NULL::character varying COLLATE public.ci,
    date_reception date,
    motif character varying(500) NOT NULL COLLATE public.ci,
    supprime_par integer,
    supprime_par_nom character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    date_suppression timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    historique_json text COLLATE public.ci,
    nb_actions_historique integer DEFAULT 0 NOT NULL
);


--
-- Name: suppressions_dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.suppressions_dossiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.suppressions_dossiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: traitements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.traitements (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    agent_id integer,
    date_debut timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    date_fin timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    observation text COLLATE public.ci
);


--
-- Name: traitements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.traitements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.traitements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: transferts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transferts (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    ancien_agent_id integer,
    nouveau_agent_id integer,
    motif text COLLATE public.ci,
    date_transfert timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: transferts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.transferts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.transferts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: types_courriers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.types_courriers (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL COLLATE public.ci
);


--
-- Name: types_courriers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.types_courriers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.types_courriers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: types_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.types_documents (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL COLLATE public.ci,
    extensions_autorisees character varying(255) DEFAULT 'pdf,jpg,jpeg,png,docx,xlsx'::character varying COLLATE public.ci,
    taille_max integer DEFAULT 10485760
);


--
-- Name: types_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.types_documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.types_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: types_dossiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.types_dossiers (
    id integer NOT NULL,
    code character varying(20) DEFAULT NULL::character varying COLLATE public.ci,
    libelle character varying(100) NOT NULL COLLATE public.ci,
    description text COLLATE public.ci,
    actif smallint DEFAULT 1
);


--
-- Name: types_dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.types_dossiers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.types_dossiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: types_pieces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.types_pieces (
    id integer NOT NULL,
    code character varying(50) NOT NULL COLLATE public.ci,
    libelle character varying(150) NOT NULL COLLATE public.ci,
    obligatoire smallint DEFAULT 1 NOT NULL,
    actif smallint DEFAULT 1 NOT NULL,
    phase character varying(13) DEFAULT 'ARCHIVAGE'::character varying NOT NULL COLLATE public.ci,
    ordre smallint DEFAULT 0 NOT NULL,
    division_code character varying(30) DEFAULT NULL::character varying COLLATE public.ci,
    type_dossier_id integer,
    sous_type_id integer,
    CONSTRAINT chk_types_pieces_phase CHECK (((phase)::text = ANY (ARRAY[('DEPOUILLEMENT'::character varying)::text, ('ARCHIVAGE'::character varying)::text])))
);


--
-- Name: types_pieces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.types_pieces ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.types_pieces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL COLLATE public.ci,
    email character varying(100) NOT NULL COLLATE public.ci,
    password_hash character varying(255) NOT NULL COLLATE public.ci,
    role_id integer,
    actif smallint DEFAULT 1,
    derniere_connexion timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    mot_de_passe_change_le timestamp(3) without time zone DEFAULT NULL::timestamp without time zone,
    tentatives_echouees smallint DEFAULT 0 NOT NULL,
    verrouille_jusqua timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: validations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.validations (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    valide_par integer,
    decision character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    commentaire text COLLATE public.ci,
    date_validation timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: validations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.validations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.validations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verifications (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    agent_id integer,
    resultat character varying(50) DEFAULT NULL::character varying COLLATE public.ci,
    observation text COLLATE public.ci,
    date_verification timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.verifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: visas_controle_financier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visas_controle_financier (
    id integer NOT NULL,
    dossier_id integer NOT NULL,
    numero_visa character varying(100) NOT NULL COLLATE public.ci,
    signe_par character varying(150) DEFAULT NULL::character varying COLLATE public.ci,
    date_visa date NOT NULL,
    commentaire text COLLATE public.ci,
    enregistre_par integer NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: visas_controle_financier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.visas_controle_financier ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.visas_controle_financier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: affectations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.affectations (id, dossier_id, division_id, agent_id, ancien_agent_id, motif, auteur_id, date_affectation) FROM stdin;
55	2	\N	13	\N	\N	\N	2026-10-05 08:14:13
56	54	1	7	\N	Affectation automatique à la création du dossier.	\N	2026-10-06 11:56:07
57	55	3	11	\N	Affectation automatique à la création du dossier.	\N	2026-10-06 12:29:41
58	56	2	9	\N	Affectation automatique à la création du dossier.	\N	2026-10-06 12:31:18
59	57	4	13	\N	Affectation automatique à la création du dossier.	\N	2026-10-06 12:32:24
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agents (id, user_id, nom, prenom, matricule, fonction_id, division_id, email, telephone, actif, created_at) FROM stdin;
1	1	SRSP	Admin	SRSP-001	1	\N	admin@srsp.mg	\N	1	2026-10-05 10:24:42
2	2	SRSP	Chef Service	SRSP-002	1	\N	chefservice@srsp.mg	\N	1	2026-10-05 10:24:42
3	3	SRSP	Chef Baaf	SRSP-003	2	\N	chefbaaf@srsp.mg	\N	1	2026-10-05 10:24:42
4	4	SRSP	Coordinatrice	SRSP-004	3	\N	coordinatrice@srsp.mg	\N	1	2026-10-05 10:24:42
5	5	SRSP	Secretaire	SRSP-005	4	\N	secretaire@srsp.mg	\N	1	2026-10-05 10:24:42
6	6	Visas	Chef Visa	SRSP-006	5	1	chef.visa@srsp.mg	\N	1	2026-10-05 10:24:42
7	7	Visas	Verif Visa	SRSP-007	6	1	verif.visa@srsp.mg	\N	1	2026-10-05 10:24:42
8	8	Solde	Chef Solde	SRSP-008	5	2	chef.solde@srsp.mg	\N	1	2026-10-05 10:24:42
9	9	Solde	Verif Solde	SRSP-009	6	2	verif.solde@srsp.mg	\N	1	2026-10-05 10:24:42
10	10	Pensions	Chef Pension	SRSP-010	5	3	chef.pension@srsp.mg	\N	1	2026-10-05 10:24:42
11	11	Pensions	Liquidateur	SRSP-011	7	3	liquidateur@srsp.mg	\N	1	2026-10-05 10:24:42
12	12	Secours	Chef Secours	SRSP-012	5	4	chef.secours@srsp.mg	\N	1	2026-10-05 10:24:42
13	13	Secours	Charge Secours	SRSP-013	8	4	charge.secours@srsp.mg	\N	1	2026-10-05 10:24:42
\.


--
-- Data for Name: antennes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.antennes (id, code, libelle, siege, actif, created_at) FROM stdin;
1	MANANJARY	Antenne Mananjary	0	1	2026-10-05 10:24:41
2	MANAKARA	Antenne Manakara	1	1	2026-10-05 10:24:41
\.


--
-- Data for Name: archives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.archives (id, dossier_id, date_archivage, reference_archivage, emplacement_physique, localisation_numerique, archive_par, motif, restaure) FROM stdin;
1	2	2026-10-05 08:14:45	\N	\N	\N	1	Archivage automatique	1
2	1	2026-10-06 06:16:45	\N	\N	\N	1	Archivage automatique	0
\.


--
-- Data for Name: bordereaux; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bordereaux (id, reference, division_id, agent_id, date_transmission, observation, statut, date_reception_division, recu_par, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bordereaux_dossiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bordereaux_dossiers (bordereau_id, dossier_id, ordre) FROM stdin;
\.


--
-- Data for Name: cachets_mandatement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cachets_mandatement (id, mandatement_id, cache_par, date_cachet, titre_ordonnateur, nom_ordonnateur, observations, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: compteurs_numerotation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.compteurs_numerotation (cle, valeur, updated_at) FROM stdin;
DOSSIER-1-2026	2	2026-10-06 11:56:07
DOSSIER-2-2026	1	2026-10-06 12:31:18
DOSSIER-3-2026	1	2026-10-06 12:29:40
DOSSIER-4-2026	12	2026-10-06 12:32:24
IMMATRICULATION	0	2026-10-05 07:24:41
\.


--
-- Data for Name: controles_decompte; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.controles_decompte (id, dossier_id, controleur_id, decision, calculs_verifies, pieces_justificatives, certificat_cessation, observation, date_controle) FROM stdin;
\.


--
-- Data for Name: correspondances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.correspondances (id, dossier_id, type, reference, document_id, destinataire, objet, contenu, etat, date_envoi, created_by, created_at, etat_reponse, date_reponse, reponse, date_transmission_central, destinataire_central, reference_bordereau, etat_reception_central) FROM stdin;
\.


--
-- Data for Name: courriers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courriers (id, numero, type_id, sens, expediteur, destinataire, objet, division_id, statut, document_id, dossier_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: decomptes_avance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.decomptes_avance (id, dossier_id, agent_id, salaire_mensuel, indice, echelon, avance_demandee, retenue_mensuelle, duree_mois, mois_rembourses, net_a_payer, reste_a_rembourser, observation, date_calcul, updated_at) FROM stdin;
\.


--
-- Data for Name: delegations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delegations (id, agent_id, remplacant_id, date_debut, date_fin, motif, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: depouillements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.depouillements (id, dossier_id, agent_id, piece, presente, etat, observation, motif, date_controle) FROM stdin;
1	2	1	DECISION	1	MANQUANTE	\N	\N	2026-10-05 11:15:51
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, antenne_id, code, libelle, actif, created_at) FROM stdin;
1	1	IFANADIANA	Ifanadiana	1	2026-10-05 10:24:41
2	1	NOSY_VARIKA	Nosy Varika	1	2026-10-05 10:24:41
3	1	MANANJARY	Mananjary	1	2026-10-05 10:24:41
4	2	IKONGO	Ikongo	1	2026-10-05 10:24:41
5	2	VOHIPENO	Vohipeno	1	2026-10-05 10:24:41
6	2	MANAKARA	Manakara	1	2026-10-05 10:24:41
\.


--
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.divisions (id, code, nom, type_dossier_id, responsable_id, actif, created_at) FROM stdin;
1	VISAS	Division Visas	1	6	1	2026-10-05 10:24:40
2	SOLDE	Division Solde	2	8	1	2026-10-05 10:24:40
3	PENSIONS	Division Pensions	3	10	1	2026-10-05 10:24:40
4	SECOURS	Division Secours	4	12	1	2026-10-05 10:24:40
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, dossier_id, courrier_id, type_id, piece_code, version, remplace, motif_remplacement, nom_fichier, chemin_stockage, taille, description, valide, upload_par, created_at) FROM stdin;
\.


--
-- Data for Name: donnees_operation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.donnees_operation (id, dossier_id, sous_type_id, reference_externe, reference_dossier_mere, matricule, periode, montant, source_montant, date_reference, destinataire, date_transmission, reference_transmission, etat_transmission, localisation, observation, controleur_id, date_controle, observations_controle, decision_controle, valide_par, date_validation, donnees, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dossier_commentaires; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dossier_commentaires (id, dossier_id, auteur_id, contenu, date_creation, modifie_le) FROM stdin;
\.


--
-- Data for Name: dossiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dossiers (id, numero, reference_visa, type_id, sous_type_id, objet, demandeur, matricule, date_reception, date_heure_reception, date_limite, division_id, priorite_id, statut_id, agent_responsable_id, observation, date_cloture, date_archivage, created_by, created_at, updated_at, demandeur_nom, demandeur_prenom, demandeur_tel, demandeur_email, demandeur_adresse, origine_presentateur, comptable_presentateur, type_acte, annee_reference, verificateur_id, date_signature, signataire_id, reference_signature, exception_validation, exception_autorisee_par, date_exception, motif_complement, beneficiaire, organisme) FROM stdin;
1	VISA-2026-000001	\N	1	\N	Demande d'integration	RAKOTO Jean	201 036 156 000	2026-10-05	\N	\N	1	1	11	7	\N	2026-10-06	2026-10-06	5	2026-10-05 07:33:26	2026-10-06 06:16:45	RAKOTO	Jean	034 40 433 45	rakoto@gmail.com	Manakara	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	SECOURS-2026-000001	\N	4	\N	Secours de deces a titre de conjoint survivant	RAKOTOARISOA Jean Pierre	\N	2026-10-05	\N	\N	4	3	10	13	\N	2026-10-05	\N	5	2026-10-05 07:36:46	2026-10-05 08:15:14	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
54	VISA-2026-000002	\N	1	\N	nbjhj	rrreeeeee fdfdfdf	222222222	2026-10-06	\N	\N	1	1	4	7	\N	\N	\N	1	2026-10-06 11:56:07	2026-10-06 11:56:40	rrreeeeee	fdfdfdf	212121212121	rrrrrr@gmail.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
55	PENSION-2026-000001	\N	3	\N	Retraite	RANDRIANIRINA KOTO	101 020 031 012	2026-10-06	\N	\N	3	1	4	11	Dossier complets	\N	\N	5	2026-10-06 12:29:40	2026-10-06 12:29:40	RANDRIANIRINA	KOTO	033 35 123 22	koto@gmail.com	Manakara	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
56	SOLDE-2026-000001	\N	2	\N	Mandatements	Hello Kity	120 202 222 012	2026-10-06	\N	\N	2	3	4	9	\N	\N	\N	5	2026-10-06 12:31:18	2026-10-06 12:31:18	Hello	Kity	032 21 222 22	Kity@gmail.com	Manakara	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
57	SECOURS-2026-000012	\N	4	\N	Deces	randria luc	023020202020	2026-10-06	\N	\N	4	1	4	13	\N	\N	\N	5	2026-10-06 12:32:24	2026-10-06 12:32:24	randria	luc	03212210122	luc@gmail.com	Manakara	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: dossiers_districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dossiers_districts (id, dossier_id, district_id, date_rattachement, courante, origine, created_at) FROM stdin;
\.


--
-- Data for Name: emargements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.emargements (id, etat_emargement_id, beneficiaire_id, signataire, signe_le, observation, updated_at) FROM stdin;
\.


--
-- Data for Name: etats_emargement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.etats_emargement (id, mandatement_id, genere_par, genere_le, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fonctions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fonctions (id, libelle, description) FROM stdin;
1	Chef de Service	Supervision générale du SRSP
2	Chef BAAF	Gestion comptable et administrative
3	Coordinatrice	Immatriculation et suivi des insertions
4	Secrétaire	Réception, enregistrement et distribution
5	Chef de Division	Supervision d'une division
6	Vérificateur	Exploitation et vérification des dossiers
7	Liquidateur	Liquidation des pensions
8	Chargé de Secours	Traitement des dossiers de secours
\.


--
-- Data for Name: historique_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historique_actions (id, user_id, action, dossier_id, ancienne_valeur, nouvelle_valeur, details, ip_address, date_action) FROM stdin;
1	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:28:34
2	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:28:48
3	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:29:03
4	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:29:04
5	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:29:04
6	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:29:04
7	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:29:10
8	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:29:39
9	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:29:40
10	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:29:40
11	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:29:45
12	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:30:16
13	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:30:26
14	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:30:35
15	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:30:49
16	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:30:55
17	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:31:02
18	\N	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects.).	::1	2026-10-05 07:31:06
19	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:31:52
20	5	CREATION_DOSSIER	1	\N	\N	Création du dossier VISA-2026-000001	\N	2026-10-05 07:33:26
21	5	CHANGEMENT_STATUT	1	RECU	ENREGISTRE	Enregistrement lors de la réception.	\N	2026-10-05 07:33:26
22	5	ENREGISTREMENT	1	\N	\N	Dossier VISA-2026-000001 enregistré.	\N	2026-10-05 07:33:26
23	5	CHANGEMENT_STATUT	1	ENREGISTRE	ORIENTE	Orientation automatique vers Division Visas (routage par type).	\N	2026-10-05 07:33:26
24	5	ORIENTATION	1	\N	Division Visas	Routage automatique : la division découle du type de dossier.	\N	2026-10-05 07:33:26
25	5	CHANGEMENT_STATUT	1	ORIENTE	AFFECTE	Affectation automatique à Visas Verif Visa (VERIFICATEUR_VISA).	\N	2026-10-05 07:33:26
26	5	AFFECTATION	1	\N	Visas Verif Visa (VERIFICATEUR_VISA)	Affectation automatique à Visas Verif Visa — agent de traitement de la division, le moins chargé.	\N	2026-10-05 07:33:26
27	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:33:51
28	6	AFFECTATION	1	\N	Agent ID 7	\N	\N	2026-10-05 07:34:03
29	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:34:29
30	7	CHANGEMENT_STATUT	1	AFFECTE	EN_TRAITEMENT	\N	\N	2026-10-05 07:34:43
31	7	CHANGEMENT_STATUT	1	EN_TRAITEMENT	SOUMIS_A_VERIFICATION	Soumis à vérification.	\N	2026-10-05 07:34:48
32	7	VERIFICATION	1	\N	\N	\N	\N	2026-10-05 07:34:48
33	8	CONNEXION	\N	\N	\N	Connexion réussie (chef.solde@srsp.mg).	::1	2026-10-05 07:35:29
34	9	CONNEXION	\N	\N	\N	Connexion réussie (verif.solde@srsp.mg).	::1	2026-10-05 07:35:52
35	10	CONNEXION	\N	\N	\N	Connexion réussie (chef.pension@srsp.mg).	::1	2026-10-05 07:36:13
36	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:34
37	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:36:35
38	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:36:35
39	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:36:35
46	11	CONNEXION	\N	\N	\N	Connexion réussie (liquidateur@srsp.mg).	::1	2026-10-05 07:36:36
47	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:36:44
48	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:36:44
49	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:36:44
50	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:46
51	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:36:46
52	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:36:46
53	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:36:46
54	5	CREATION_DOSSIER	2	\N	\N	Création du dossier SECOURS-2026-000001	\N	2026-10-05 07:36:46
55	5	CHANGEMENT_STATUT	2	RECU	ENREGISTRE	Enregistrement lors de la réception.	\N	2026-10-05 07:36:46
56	5	ENREGISTREMENT	2	\N	\N	Dossier SECOURS-2026-000001 enregistré.	\N	2026-10-05 07:36:46
57	5	CHANGEMENT_STATUT	2	ENREGISTRE	ORIENTE	Orientation automatique vers Division Secours (routage par type).	\N	2026-10-05 07:36:46
58	5	ORIENTATION	2	\N	Division Secours	Routage automatique : la division découle du type de dossier.	\N	2026-10-05 07:36:46
59	5	CHANGEMENT_STATUT	2	ORIENTE	AFFECTE	Affectation automatique à Secours Charge Secours (CHARGE_SECOURS).	\N	2026-10-05 07:36:46
60	5	AFFECTATION	2	\N	Secours Charge Secours (CHARGE_SECOURS)	Affectation automatique à Secours Charge Secours — agent de traitement de la division, le moins chargé.	\N	2026-10-05 07:36:46
61	12	MANDATEMENT	2	\N	5000000 Ar / 3 bénéficiaire(s)	\N	\N	2026-10-05 07:36:46
62	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:47
63	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:36:47
64	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:36:47
72	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:47
85	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:36:48
86	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:48
157	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:36:49
158	1	SAUVEGARDE_DB	\N	\N	\N	Sauvegarde créée : srsp-2026-10-05T07-36-49-533Z.sql (232077 octets), AUCUNE pièce jointe incluse.	\N	2026-10-05 07:36:49
159	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:55
160	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:36:55
161	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:36:55
162	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:36:55
171	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:36:56
172	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:36:56
173	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:36:56
181	12	CONNEXION_ECHOUEE	\N	\N	\N	Échec de connexion (Identifiants incorrects. 4 tentative(s) restante(s).).	::1	2026-10-05 07:37:00
182	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:37:07
183	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:37:13
184	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:37:34
185	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:37:45
186	4	CONNEXION	\N	\N	\N	Connexion réussie (coordinatrice@srsp.mg).	::1	2026-10-05 07:38:00
187	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:38:23
188	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:38:54
189	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:38:54
190	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:38:54
191	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:38:54
200	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:39:20
201	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:39:20
202	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:39:20
203	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:39:20
212	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:39:55
213	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:39:56
214	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:39:56
215	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:39:56
224	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:40:12
225	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:40:12
226	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:40:12
227	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:40:13
236	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:40:55
237	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:40:55
238	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:40:55
239	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:40:55
248	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:41:33
249	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:41:33
250	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:41:34
251	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:41:34
260	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:41:54
261	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:41:54
262	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:41:54
263	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:41:54
272	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:41:59
273	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:41:59
274	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:41:59
275	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:42:00
276	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:42:00
277	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:42:00
285	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:42:01
286	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:42:01
287	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:42:01
288	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:42:01
289	4	CONNEXION	\N	\N	\N	Connexion réussie (coordinatrice@srsp.mg).	::1	2026-10-05 07:42:01
290	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:42:01
291	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:42:01
292	8	CONNEXION	\N	\N	\N	Connexion réussie (chef.solde@srsp.mg).	::1	2026-10-05 07:42:01
293	9	CONNEXION	\N	\N	\N	Connexion réussie (verif.solde@srsp.mg).	::1	2026-10-05 07:42:01
294	10	CONNEXION	\N	\N	\N	Connexion réussie (chef.pension@srsp.mg).	::1	2026-10-05 07:42:02
295	11	CONNEXION	\N	\N	\N	Connexion réussie (liquidateur@srsp.mg).	::1	2026-10-05 07:42:02
296	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:42:02
297	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:42:02
298	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:42:17
299	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:42:17
300	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:42:17
301	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:42:17
302	4	CONNEXION	\N	\N	\N	Connexion réussie (coordinatrice@srsp.mg).	::1	2026-10-05 07:42:17
303	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:42:17
304	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:42:17
305	8	CONNEXION	\N	\N	\N	Connexion réussie (chef.solde@srsp.mg).	::1	2026-10-05 07:42:18
306	9	CONNEXION	\N	\N	\N	Connexion réussie (verif.solde@srsp.mg).	::1	2026-10-05 07:42:18
307	10	CONNEXION	\N	\N	\N	Connexion réussie (chef.pension@srsp.mg).	::1	2026-10-05 07:42:18
308	11	CONNEXION	\N	\N	\N	Connexion réussie (liquidateur@srsp.mg).	::1	2026-10-05 07:42:18
309	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:42:18
310	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:42:18
311	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:42:27
312	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:42:27
313	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:42:27
321	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 07:42:28
322	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:42:28
323	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:42:28
324	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:42:28
325	4	CONNEXION	\N	\N	\N	Connexion réussie (coordinatrice@srsp.mg).	::1	2026-10-05 07:42:28
326	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 07:42:28
327	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:42:28
328	8	CONNEXION	\N	\N	\N	Connexion réussie (chef.solde@srsp.mg).	::1	2026-10-05 07:42:28
329	9	CONNEXION	\N	\N	\N	Connexion réussie (verif.solde@srsp.mg).	::1	2026-10-05 07:42:29
330	10	CONNEXION	\N	\N	\N	Connexion réussie (chef.pension@srsp.mg).	::1	2026-10-05 07:42:29
331	11	CONNEXION	\N	\N	\N	Connexion réussie (liquidateur@srsp.mg).	::1	2026-10-05 07:42:29
332	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 07:42:29
333	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 07:42:29
334	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 07:42:33
335	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 07:42:33
336	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 07:42:34
337	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 07:42:44
593	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 08:13:47
594	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 08:13:48
595	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:13:48
603	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 08:13:48
604	1	SAUVEGARDE_DB	\N	\N	\N	Sauvegarde créée : srsp-2026-10-05T08-13-48-971Z.sql (241871 octets), AUCUNE pièce jointe incluse.	\N	2026-10-05 08:13:49
605	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-05 08:13:53
606	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-05 08:13:54
607	12	CONNEXION	\N	\N	\N	Connexion réussie (chef.secours@srsp.mg).	::1	2026-10-05 08:13:54
608	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-05 08:13:55
609	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:13:55
618	6	CONNEXION	\N	\N	\N	Connexion réussie (chef.visa@srsp.mg).	::1	2026-10-05 08:13:56
619	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:13:57
620	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:13:57
621	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:13:57
622	1	AFFECTATION	2	\N	Agent ID 13	\N	\N	2026-10-05 08:14:13
623	1	CHANGEMENT_STATUT	2	AFFECTE	EN_TRAITEMENT	\N	\N	2026-10-05 08:14:19
624	1	CHANGEMENT_STATUT	2	EN_TRAITEMENT	SOUMIS_A_VERIFICATION	Soumis à vérification.	\N	2026-10-05 08:14:24
625	1	VERIFICATION	2	\N	\N	\N	\N	2026-10-05 08:14:24
626	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:14:26
627	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:14:27
628	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:14:27
629	1	CHANGEMENT_STATUT	2	SOUMIS_A_VERIFICATION	VALIDE	\N	\N	2026-10-05 08:14:30
630	1	VALIDATION	2	\N	VALIDE	\N	\N	2026-10-05 08:14:30
631	1	CHANGEMENT_STATUT	2	VALIDE	SIGNE	\N	\N	2026-10-05 08:14:38
632	1	SIGNATURE	2	\N	\N	Référence de signature : SRSP	\N	2026-10-05 08:14:38
633	1	CHANGEMENT_STATUT	2	SIGNE	CLOTURE	Clôture du dossier.	\N	2026-10-05 08:14:41
634	1	CLOTURE	2	\N	\N	\N	\N	2026-10-05 08:14:42
635	1	CHANGEMENT_STATUT	2	CLOTURE	ARCHIVE	Archivage du dossier.	\N	2026-10-05 08:14:45
636	1	ARCHIVAGE	2	\N	\N	\N	\N	2026-10-05 08:14:45
637	1	RESTAURATION_ARCHIVE	2	\N	\N	Dossier restauré depuis les archives — motif : Erreur	\N	2026-10-05 08:15:14
638	1	DEPOUILLEMENT	2	\N	DECISION : présente	\N	\N	2026-10-05 08:15:31
639	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:15:42
640	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:15:42
641	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:15:42
652	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:15:48
653	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:15:48
654	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:15:48
665	1	DEPOUILLEMENT	2	\N	DECISION : présente	\N	\N	2026-10-05 08:15:51
666	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:16:02
667	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:16:02
668	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:16:02
679	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:16:10
680	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:16:10
681	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:16:11
692	3	CONNEXION	\N	\N	\N	Connexion réussie (chefbaaf@srsp.mg).	::1	2026-10-05 08:16:17
693	2	CONNEXION	\N	\N	\N	Connexion réussie (chefservice@srsp.mg).	::1	2026-10-05 08:16:17
694	7	CONNEXION	\N	\N	\N	Connexion réussie (verif.visa@srsp.mg).	::1	2026-10-05 08:16:17
705	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-06 06:16:19
706	1	CHANGEMENT_STATUT	1	SOUMIS_A_VERIFICATION	VALIDE	\N	\N	2026-10-06 06:16:32
707	1	VALIDATION	1	\N	VALIDE	\N	\N	2026-10-06 06:16:32
708	1	CHANGEMENT_STATUT	1	VALIDE	SIGNE	\N	\N	2026-10-06 06:16:38
709	1	SIGNATURE	1	\N	\N	Référence de signature : SRSP	\N	2026-10-06 06:16:38
710	1	CHANGEMENT_STATUT	1	SIGNE	CLOTURE	Clôture du dossier.	\N	2026-10-06 06:16:42
711	1	CLOTURE	1	\N	\N	\N	\N	2026-10-06 06:16:42
712	1	CHANGEMENT_STATUT	1	CLOTURE	ARCHIVE	Archivage du dossier.	\N	2026-10-06 06:16:45
713	1	ARCHIVAGE	1	\N	\N	\N	\N	2026-10-06 06:16:45
714	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-06 06:26:38
715	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 06:26:48
716	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-06 06:29:15
717	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-06 06:29:22
718	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 11:22:43
719	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-06 11:29:39
720	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-06 11:55:33
721	1	CREATION_DOSSIER	54	\N	\N	Création du dossier VISA-2026-000002	\N	2026-10-06 11:56:07
722	1	CHANGEMENT_STATUT	54	RECU	ENREGISTRE	Enregistrement lors de la réception.	\N	2026-10-06 11:56:07
723	1	ENREGISTREMENT	54	\N	\N	Dossier VISA-2026-000002 enregistré.	\N	2026-10-06 11:56:07
724	1	CHANGEMENT_STATUT	54	ENREGISTRE	ORIENTE	Orientation automatique vers Division Visas (routage par type).	\N	2026-10-06 11:56:07
725	1	ORIENTATION	54	\N	Division Visas	Routage automatique : la division découle du type de dossier.	\N	2026-10-06 11:56:07
726	1	CHANGEMENT_STATUT	54	ORIENTE	AFFECTE	Affectation automatique à Visas Verif Visa (VERIFICATEUR_VISA).	\N	2026-10-06 11:56:07
727	1	AFFECTATION	54	\N	Visas Verif Visa (VERIFICATEUR_VISA)	Affectation automatique à Visas Verif Visa — agent de traitement de la division, le moins chargé.	\N	2026-10-06 11:56:07
728	1	MODIFICATION_DOSSIER	54	\N	\N	Modification du dossier VISA-2026-000002	\N	2026-10-06 11:56:40
729	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 12:01:19
730	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 12:28:11
731	5	CREATION_DOSSIER	55	\N	\N	Création du dossier PENSION-2026-000001	\N	2026-10-06 12:29:40
732	5	CHANGEMENT_STATUT	55	RECU	ENREGISTRE	Enregistrement lors de la réception.	\N	2026-10-06 12:29:40
733	5	ENREGISTREMENT	55	\N	\N	Dossier PENSION-2026-000001 enregistré.	\N	2026-10-06 12:29:40
734	5	CHANGEMENT_STATUT	55	ENREGISTRE	ORIENTE	Orientation automatique vers Division Pensions (routage par type).	\N	2026-10-06 12:29:40
735	5	ORIENTATION	55	\N	Division Pensions	Routage automatique : la division découle du type de dossier.	\N	2026-10-06 12:29:40
736	5	CHANGEMENT_STATUT	55	ORIENTE	AFFECTE	Affectation automatique à Pensions Liquidateur (LIQUIDATEUR_PENSION).	\N	2026-10-06 12:29:40
737	5	AFFECTATION	55	\N	Pensions Liquidateur (LIQUIDATEUR_PENSION)	Affectation automatique à Pensions Liquidateur — agent de traitement de la division, le moins chargé.	\N	2026-10-06 12:29:41
738	5	CREATION_DOSSIER	56	\N	\N	Création du dossier SOLDE-2026-000001	\N	2026-10-06 12:31:18
739	5	CHANGEMENT_STATUT	56	RECU	ENREGISTRE	Enregistrement lors de la réception.	\N	2026-10-06 12:31:18
740	5	ENREGISTREMENT	56	\N	\N	Dossier SOLDE-2026-000001 enregistré.	\N	2026-10-06 12:31:18
741	5	CHANGEMENT_STATUT	56	ENREGISTRE	ORIENTE	Orientation automatique vers Division Solde (routage par type).	\N	2026-10-06 12:31:18
742	5	ORIENTATION	56	\N	Division Solde	Routage automatique : la division découle du type de dossier.	\N	2026-10-06 12:31:18
743	5	CHANGEMENT_STATUT	56	ORIENTE	AFFECTE	Affectation automatique à Solde Verif Solde (VERIFICATEUR_SOLDE).	\N	2026-10-06 12:31:18
744	5	AFFECTATION	56	\N	Solde Verif Solde (VERIFICATEUR_SOLDE)	Affectation automatique à Solde Verif Solde — agent de traitement de la division, le moins chargé.	\N	2026-10-06 12:31:18
745	5	CREATION_DOSSIER	57	\N	\N	Création du dossier SECOURS-2026-000012	\N	2026-10-06 12:32:24
746	5	CHANGEMENT_STATUT	57	RECU	ENREGISTRE	Enregistrement lors de la réception.	\N	2026-10-06 12:32:24
747	5	ENREGISTREMENT	57	\N	\N	Dossier SECOURS-2026-000012 enregistré.	\N	2026-10-06 12:32:24
748	5	CHANGEMENT_STATUT	57	ENREGISTRE	ORIENTE	Orientation automatique vers Division Secours (routage par type).	\N	2026-10-06 12:32:24
749	5	ORIENTATION	57	\N	Division Secours	Routage automatique : la division découle du type de dossier.	\N	2026-10-06 12:32:24
750	5	CHANGEMENT_STATUT	57	ORIENTE	AFFECTE	Affectation automatique à Secours Charge Secours (CHARGE_SECOURS).	\N	2026-10-06 12:32:24
751	5	AFFECTATION	57	\N	Secours Charge Secours (CHARGE_SECOURS)	Affectation automatique à Secours Charge Secours — agent de traitement de la division, le moins chargé.	\N	2026-10-06 12:32:24
752	13	CONNEXION	\N	\N	\N	Connexion réussie (charge.secours@srsp.mg).	::1	2026-10-06 12:32:58
753	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 12:34:42
754	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 12:52:40
755	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 13:01:15
756	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 13:01:24
757	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 13:02:27
758	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 13:08:50
759	5	CONNEXION	\N	\N	\N	Connexion réussie (secretaire@srsp.mg).	::1	2026-10-06 13:09:00
760	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-07 08:33:23
761	1	CONNEXION	\N	\N	\N	Connexion réussie (admin@srsp.mg).	::1	2026-10-07 08:36:30
\.


--
-- Data for Name: immatriculations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.immatriculations (id, nom, prenom, cin, date_naissance, corps, grade, indice, date_entree, division_id, matricule, statut, observations, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: insertions_paiement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.insertions_paiement (id, immatriculation_id, matricule_augure, situation_familiale, adresse, telephone, date_naissance, indice_base, salaire_base, statut, observations, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: liquidations_pension; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.liquidations_pension (id, dossier_id, agent_id, annees_service, indice_final, pension_brute, retenues, observation, date_calcul, updated_at) FROM stdin;
\.


--
-- Data for Name: mandatement_beneficiaires; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mandatement_beneficiaires (id, mandatement_id, nom, prenom, lien, quote_part, montant, matricule) FROM stdin;
\.


--
-- Data for Name: mandatement_pieces; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mandatement_pieces (code, libelle, ordre) FROM stdin;
\.


--
-- Data for Name: mandatement_pieces_etat; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mandatement_pieces_etat (mandatement_id, piece_code, imprimee, date_impression) FROM stdin;
\.


--
-- Data for Name: mandatements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mandatements (id, dossier_id, montant_total, etat, ordonnancement_date, ordonnateur_id, liquidation_date, observation, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, dossier_id, expediteur_id, destinataire_id, action, message, type, lu, date_creation) FROM stdin;
\.


--
-- Data for Name: modes_paiement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modes_paiement (id, immatriculation_id, mode, banque, compte_bancaire, motif, pieces_verifiees, statut, observations, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, dossier_id, type, action, message, lien, lu, created_at) FROM stdin;
1	6	1	WORKFLOW	ORIENTE	Dossier VISA-2026-000001 orienté vers votre division.	/dossiers/1	1	2026-10-05 07:33:26
2	7	1	AFFECTATION	AFFECTE	Le dossier VISA-2026-000001 vous a été affecté pour traitement.	/dossiers/1	1	2026-10-05 07:33:26
3	7	1	INFO	DOSSIER_AFFECTE	Le dossier VISA-2026-000001 vous a été affecté automatiquement.	/dossiers/1	1	2026-10-05 07:33:26
4	5	1	INFO	DOSSIER_ENREGISTRE	Nouveau dossier VISA-2026-000001 enregistré, orienté vers Division Visas et affecté à Visas Verif Visa.	/dossiers/1	0	2026-10-05 07:33:26
5	6	1	VERIFICATION	SOUMIS_A_VERIFICATION	Le dossier VISA-2026-000001 est soumis à votre vérification.	/dossiers/1	0	2026-10-05 07:34:48
6	12	2	WORKFLOW	ORIENTE	Dossier SECOURS-2026-000001 orienté vers votre division.	/dossiers/2	0	2026-10-05 07:36:46
7	13	2	AFFECTATION	AFFECTE	Le dossier SECOURS-2026-000001 vous a été affecté pour traitement.	/dossiers/2	0	2026-10-05 07:36:46
8	13	2	INFO	DOSSIER_AFFECTE	Le dossier SECOURS-2026-000001 vous a été affecté automatiquement.	/dossiers/2	0	2026-10-05 07:36:46
9	5	2	INFO	DOSSIER_ENREGISTRE	Nouveau dossier SECOURS-2026-000001 enregistré, orienté vers Division Secours et affecté à Secours Charge Secours.	/dossiers/2	1	2026-10-05 07:36:46
214	12	2	VERIFICATION	SOUMIS_A_VERIFICATION	Le dossier SECOURS-2026-000001 est soumis à votre vérification.	/dossiers/2	0	2026-10-05 08:14:24
215	2	2	VALIDATION	VALIDE	Le dossier SECOURS-2026-000001 est validé et attend votre signature.	/dossiers/2	0	2026-10-05 08:14:30
216	2	2	SIGNATURE	SIGNE	Le dossier SECOURS-2026-000001 a été signé : il peut être clôturé.	/dossiers/2	0	2026-10-05 08:14:38
217	2	2	CLOTURE	CLOTURE	Le dossier SECOURS-2026-000001 est clôturé et peut être archivé.	/dossiers/2	0	2026-10-05 08:14:41
218	2	1	VALIDATION	VALIDE	Le dossier VISA-2026-000001 est validé et attend votre signature.	/dossiers/1	0	2026-10-06 06:16:32
219	2	1	SIGNATURE	SIGNE	Le dossier VISA-2026-000001 a été signé : il peut être clôturé.	/dossiers/1	0	2026-10-06 06:16:38
220	2	1	CLOTURE	CLOTURE	Le dossier VISA-2026-000001 est clôturé et peut être archivé.	/dossiers/1	0	2026-10-06 06:16:42
221	6	54	WORKFLOW	ORIENTE	Dossier VISA-2026-000002 orienté vers votre division.	/dossiers/54	0	2026-10-06 11:56:07
222	7	54	AFFECTATION	AFFECTE	Le dossier VISA-2026-000002 vous a été affecté pour traitement.	/dossiers/54	0	2026-10-06 11:56:07
223	7	54	INFO	DOSSIER_AFFECTE	Le dossier VISA-2026-000002 vous a été affecté automatiquement.	/dossiers/54	0	2026-10-06 11:56:07
224	1	54	INFO	DOSSIER_ENREGISTRE	Nouveau dossier VISA-2026-000002 enregistré, orienté vers Division Visas et affecté à Visas Verif Visa.	/dossiers/54	1	2026-10-06 11:56:07
225	10	55	WORKFLOW	ORIENTE	Dossier PENSION-2026-000001 orienté vers votre division.	/dossiers/55	0	2026-10-06 12:29:40
226	11	55	AFFECTATION	AFFECTE	Le dossier PENSION-2026-000001 vous a été affecté pour traitement.	/dossiers/55	0	2026-10-06 12:29:40
227	11	55	INFO	DOSSIER_AFFECTE	Le dossier PENSION-2026-000001 vous a été affecté automatiquement.	/dossiers/55	0	2026-10-06 12:29:41
228	5	55	INFO	DOSSIER_ENREGISTRE	Nouveau dossier PENSION-2026-000001 enregistré, orienté vers Division Pensions et affecté à Pensions Liquidateur.	/dossiers/55	0	2026-10-06 12:29:41
229	8	56	WORKFLOW	ORIENTE	Dossier SOLDE-2026-000001 orienté vers votre division.	/dossiers/56	0	2026-10-06 12:31:18
230	9	56	AFFECTATION	AFFECTE	Le dossier SOLDE-2026-000001 vous a été affecté pour traitement.	/dossiers/56	0	2026-10-06 12:31:18
231	9	56	INFO	DOSSIER_AFFECTE	Le dossier SOLDE-2026-000001 vous a été affecté automatiquement.	/dossiers/56	0	2026-10-06 12:31:18
232	5	56	INFO	DOSSIER_ENREGISTRE	Nouveau dossier SOLDE-2026-000001 enregistré, orienté vers Division Solde et affecté à Solde Verif Solde.	/dossiers/56	0	2026-10-06 12:31:18
233	12	57	WORKFLOW	ORIENTE	Dossier SECOURS-2026-000012 orienté vers votre division.	/dossiers/57	0	2026-10-06 12:32:24
234	13	57	AFFECTATION	AFFECTE	Le dossier SECOURS-2026-000012 vous a été affecté pour traitement.	/dossiers/57	0	2026-10-06 12:32:24
235	13	57	INFO	DOSSIER_AFFECTE	Le dossier SECOURS-2026-000012 vous a été affecté automatiquement.	/dossiers/57	0	2026-10-06 12:32:24
236	5	57	INFO	DOSSIER_ENREGISTRE	Nouveau dossier SECOURS-2026-000012 enregistré, orienté vers Division Secours et affecté à Secours Charge Secours.	/dossiers/57	0	2026-10-06 12:32:24
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, nom, description, created_at) FROM stdin;
1	create_dossier	Créer un dossier	2026-10-05 10:24:40
2	edit_dossier	Modifier un dossier	2026-10-05 10:24:40
3	delete_dossier	Supprimer un dossier	2026-10-05 10:24:40
4	orienter_dossier	Orienter un dossier vers une division	2026-10-05 10:24:40
5	affecter_dossier	Affecter un dossier à un agent	2026-10-05 10:24:40
6	traiter_dossier	Traiter un dossier	2026-10-05 10:24:40
7	soumettre_verification	Soumettre un dossier à vérification (agent)	2026-10-05 10:24:40
8	verifier_dossier	Vérifier / décider d'un dossier soumis	2026-10-05 10:24:40
9	valider_dossier	Valider un dossier	2026-10-05 10:24:40
10	signer_dossier	Signer un dossier validé	2026-10-05 10:24:40
11	cloturer_dossier	Clôturer un dossier signé	2026-10-05 10:24:40
12	archiver_dossier	Archiver un dossier clôturé	2026-10-05 10:24:40
13	view_all_dossiers	Consulter tous les dossiers	2026-10-05 10:24:40
14	view_assigned_dossiers	Consulter ses dossiers affectés	2026-10-05 10:24:40
15	manage_users	Gérer les utilisateurs	2026-10-05 10:24:40
16	manage_roles	Gérer les rôles et permissions	2026-10-05 10:24:40
17	manage_divisions	Gérer les divisions	2026-10-05 10:24:40
18	manage_personnel	Le Chef BAAF gère le personnel : avancement, renouvellement des contrats (registre 126, 127).	2026-10-05 10:24:40
19	view_audit	Consulter le journal d'audit	2026-10-05 10:24:40
20	system_config	Configurer le système	2026-10-05 10:24:40
21	manage_courriers	Gérer les courriers	2026-10-05 10:24:40
22	manage_documents	Gérer les documents comptables	2026-10-05 10:24:40
23	upload_document	Téléverser des documents	2026-10-05 10:24:40
24	view_stats	Consulter les statistiques	2026-10-05 10:24:40
25	export_data	Exporter les données (PDF/Excel)	2026-10-05 10:24:40
26	consolidate_reports	Le Chef de Service représente le SRSP et dispose des rapports consolidés ; la Coordination prépare les rapports d’activité qui lui sont destinés (registre 109, 150, 151).	2026-10-05 10:24:40
27	controler_decomptes	Contrôler les décomptes	2026-10-05 10:24:40
30	gerer_correspondances	Le vérificateur Solde expédie les dossiers mères aux SRSP concernés (registre 41).	2026-10-05 10:24:40
32	liquider_pension	Le Chef de Division Pensions gère la liquidation des pensions (registre 50).	2026-10-05 10:24:40
34	preparer_mandatement	Les dossiers de mandatement destinés au niveau central sont préparés par la Division Solde : le chef de division et le vérificateur (registre 31, 42).	2026-10-05 10:24:40
35	gerer_ordonnancement	Le Chef de Division Solde gère le montant à engager ; le liquidateur gère les bons de caisse en retour (registre 29, 60).	2026-10-05 10:24:40
36	suivre_signature	Suivre la signature des pièces	2026-10-05 10:24:40
37	depouiller_pieces	Dépouiller les pièces	2026-10-05 10:24:40
83	view_archives	Consulter les archives	2026-10-05 10:24:41
84	view_journal	Consulter le journal global des actions	2026-10-05 10:24:41
88	enregistrer_visa_cf	Visa du contrôle financier et contrôle des décisions visées par le CF (registre 75, 76).	2026-10-05 10:24:41
89	generer_etat_emargement	État d’émargement, références du logiciel Secours et report des signatures (registre 81, 92, 94).	2026-10-05 10:24:41
90	apposer_cachet	Cachet, titre et nom de l’ordonnateur apposés sur les pièces du mandatement (registre 97, 98).	2026-10-05 10:24:41
91	signer_pieces_mandatement	Droit dédié : le Chef de Division fait signer les pièces par l’ordonnateur, il ne signe pas le dossier lui-même (registre 95).	2026-10-05 10:24:41
92	archiver_copie_mandatement	Dernier acte du mandat : l’archivage de la copie signée. Il referme le cycle du chargé et du chef de division.	2026-10-05 10:24:41
177	deroger_validation	Autoriser, à titre exceptionnel et tracé, la validation malgré des pièces manquantes	2026-10-20 15:35:07
178	configurer_pieces	Configurer les types de pièces requis par type et sous-type de dossier	2026-10-20 15:35:07
179	gerer_sous_types	Gérer les sous-types de dossiers (types d’acte)	2026-10-20 15:35:07
180	saisir_donnees_operation	Saisir les données propres à l'opération d'un dossier (référence, période, montant, pièces)	2026-10-21 10:29:52
181	controler_donnees_operation	Contrôler et valider les données d'opération d'un dossier	2026-10-21 10:29:52
182	configurer_operations	Configurer les champs de saisie des opérations, par type d'opération	2026-10-21 11:24:36
183	gerer_immatriculations	Enregistrer et suivre les immatriculations, insertions et changements de mode de paiement	2026-10-21 11:32:14
184	signaler_dossier	Remonter à la hiérarchie un dossier bloqué, avec son motif (registre 115, 116, 154, 174, 193, 205).	2026-10-22 10:26:56
185	traiter_signalement	Prendre en charge et refermer un signalement : décision et mesures prises (registre 115, 116, 155).	2026-10-22 10:26:56
186	consulter_signalements	Consulter les signalements de son périmètre et leur état.	2026-10-22 10:26:56
\.


--
-- Data for Name: priorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.priorites (id, libelle, niveau) FROM stdin;
1	URGENTE	4
2	HAUTE	3
3	NORMALE	2
4	BASSE	1
\.


--
-- Data for Name: references_logiciel_secours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.references_logiciel_secours (id, mandatement_id, code, libelle, valeur, reporte_par, reporte_le) FROM stdin;
\.


--
-- Data for Name: referentiel_fonctionnalites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referentiel_fonctionnalites (id, document, numero_source, poste_code, libelle, detail, section_source, nature, permission_nom, etat, motif, created_at, updated_at) FROM stdin;
1	HISTORIQUE	1	DSP	Afficher la dénomination officielle	Service Régional de la Solde et des Pensions	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
2	HISTORIQUE	2	DSP	Afficher l’acronyme SRSP	\N	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
3	HISTORIQUE	3	DSP	Afficher le siège central	Immeuble Antaninarenina, Antananarivo	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
4	HISTORIQUE	4	DSP	Afficher le siège succursale	Ambodiaplay, Manakara	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
5	HISTORIQUE	5	DSP	Afficher la forme juridique	Entité gouvernementale relevant de l’administration publique	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
6	HISTORIQUE	6	DSP	Afficher les numéros de téléphone	+261 32 11 090 10 / +261 32 25 469 11	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
7	HISTORIQUE	7	DSP	Afficher l’email officiel	srsp.fitovinany@dgfag.mg	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
8	HISTORIQUE	8	DSP	Afficher le logo DSP	Direction de la Solde et des Pensions	Institutionnelles	INSTITUTIONNEL	\N	PARTIELLE	Le sigle DSP est documenté, mais le fichier logo lui-même n’est pas dans le dépôt et ne peut pas être rendu.	2026-10-05 10:24:41	2026-10-05 10:24:41
9	HISTORIQUE	9	DSP	Enregistrer la date de création	22 septembre 2011	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
10	HISTORIQUE	10	DSP	Gérer la région d’origine	Vatovavy Fitovinany	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
11	HISTORIQUE	11	DSP	Gérer la province de rattachement	Fianarantsoa	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
12	HISTORIQUE	12	DSP	Gérer la scission de 2022	Vatovavy et Fitovinany deviennent deux entités distinctes	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
13	HISTORIQUE	13	DSP	Gérer les 6 districts	\N	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
14	HISTORIQUE	14	DSP	Gérer la répartition Mananjary / Manakara	Deux antennes depuis 2022	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
15	HISTORIQUE	15	DSP	Gérer les 23 régions de Madagascar	Depuis 2022	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
16	HISTORIQUE	16	DSP	Assurer le calcul des salaires	\N	Institutionnelles	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
17	HISTORIQUE	17	DSP	Assurer le paiement des salaires	Le paiement relève de la Trésorerie Générale	Institutionnelles	METIER	\N	HORS_PLATEFORME	La plateforme constate le mandatement. L’ordonnancement et le paiement relèvent de la Trésorerie Générale et sont hors de son périmètre.	2026-10-05 10:24:41	2026-10-05 10:24:41
18	HISTORIQUE	18	DSP	Assurer la gestion des salaires	\N	Institutionnelles	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
19	HISTORIQUE	19	DSP	Gérer les pensions de retraite	\N	Institutionnelles	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
20	HISTORIQUE	20	DSP	Veiller au versement conforme des salaires	Séparation des fonctions	Institutionnelles	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
21	HISTORIQUE	21	DSP	Veiller au versement conforme des pensions	\N	Institutionnelles	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
22	HISTORIQUE	22	DSP	Respecter la réglementation en vigueur	Les 11 statuts portent cette exigence	Institutionnelles	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
23	HISTORIQUE	23	DSP	Respecter les conventions collectives applicables	Règles de calcul des pensions et des avances	Institutionnelles	METIER	\N	NON_CONSTRUITE	Les taux et barèmes ne figurent pas dans les documents fournis. Les inventer produirait des calculs faux.	2026-10-05 10:24:41	2026-10-05 10:24:41
24	HISTORIQUE	24	DSP	Gérer les 6 membres initiaux (2011)	Élément historique	Institutionnelles	INSTITUTIONNEL	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
25	HISTORIQUE	25	DSP	Gérer les 21 membres actuels	13 comptes créés sur 21	Institutionnelles	METIER	\N	PARTIELLE	Treize comptes sont créés. Les huit autres demandent la liste nominative réelle : créer des agents inventés fausserait les statistiques par agent.	2026-10-05 10:24:41	2026-10-05 10:24:41
26	HISTORIQUE	26	DSP	Suivre l’évolution des effectifs	Historique des effectifs	Institutionnelles	METIER	\N	NON_CONSTRUITE	Les effectifs ne sont pas historisés. Leur évolution ne peut donc pas être reconstituée.	2026-10-05 10:24:41	2026-10-05 10:24:41
27	HISTORIQUE	27	CHEF_DIV_SOLDE	Traiter les salaires des fonctionnaires	\N	Division Solde	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
28	HISTORIQUE	28	CHEF_DIV_SOLDE	Traiter les salaires des travailleurs publics	\N	Division Solde	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
29	HISTORIQUE	29	CHEF_DIV_SOLDE	Effectuer les paiements de manière précise	Séparation des fonctions	Division Solde	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
30	HISTORIQUE	30	CHEF_DIV_SOLDE	Effectuer les paiements en temps voulu	Échéance et tri de la file	Division Solde	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
31	HISTORIQUE	31	CHEF_DIV_SOLDE	Gérer le mandatement	\N	Division Solde	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
32	HISTORIQUE	32	CHEF_DIV_SOLDE	Vérifier les dossiers soumis pour mandatement	\N	Division Solde	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
33	HISTORIQUE	33	CHEF_DIV_SOLDE	Vérifier les Certificats de Cessation de Paiement	\N	Division Solde	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
34	HISTORIQUE	34	CHEF_DIV_SOLDE	Vérifier les décomptes d’avance de Solde	Table decomptes_avance	Division Solde	METIER	controler_decomptes	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
35	HISTORIQUE	35	CHEF_DIV_SOLDE	Vérifier les états de décompte des Soldes trop perçus	\N	Division Solde	METIER	controler_decomptes	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
36	HISTORIQUE	36	CHEF_DIV_SOLDE	Vérifier les Bons de caisse à retourner à la Trésorerie Générale	\N	Division Solde	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
38	HISTORIQUE	38	CHEF_DIV_SOLDE	Classer les demandes de Domiciliation irrévocable de salaire	\N	Division Solde	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
39	HISTORIQUE	39	VERIF_SOLDE	Préparer les fiches de contrôle de Solde	\N	Division Solde	METIER	\N	LIVREE	La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : elle porte ses trois champs propres — date de contrôle, résultat, version produite — et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent depuis Référentiel › Schémas d’opérations, sans développement.	2026-10-05 10:24:41	2026-10-22 10:05:08
41	HISTORIQUE	41	VERIF_SOLDE	Expédier les dossiers mères aux SRSP concernés	\N	Division Solde	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
42	HISTORIQUE	42	VERIF_SOLDE	Préparer les dossiers de mandatement pour envoi au niveau central	\N	Division Solde	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
43	HISTORIQUE	43	VERIF_SOLDE	Mettre à jour les fiches de contrôle de la Solde	\N	Division Solde	METIER	\N	LIVREE	La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : elle porte ses trois champs propres — date de contrôle, résultat, version produite — et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent depuis Référentiel › Schémas d’opérations, sans développement.	2026-10-05 10:24:41	2026-10-22 10:05:08
44	HISTORIQUE	44	VERIF_SOLDE	Réceptionner les fiches de contrôle	\N	Division Solde	METIER	\N	LIVREE	La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : elle porte ses trois champs propres — date de contrôle, résultat, version produite — et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent depuis Référentiel › Schémas d’opérations, sans développement.	2026-10-05 10:24:41	2026-10-22 10:05:08
47	HISTORIQUE	47	VERIF_SOLDE	Présenter les décomptes pour vérification et signature	\N	Division Solde	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
48	HISTORIQUE	48	CHEF_DIV_PENSION	Traiter les dossiers de retraite	\N	Division Pension	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
49	HISTORIQUE	49	CHEF_DIV_PENSION	Garantir une transition fluide pour les fonctionnaires quittant le service actif	\N	Division Pension	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
50	HISTORIQUE	50	CHEF_DIV_PENSION	Gérer la liquidation des Pensions	\N	Division Pension	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
51	HISTORIQUE	51	CHEF_DIV_PENSION	Vérifier les dossiers soumis pour liquidation	\N	Division Pension	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
52	HISTORIQUE	52	CHEF_DIV_PENSION	Rédiger les Lettres de prescription	\N	Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
53	HISTORIQUE	53	CHEF_DIV_PENSION	Rédiger les demandes de dossier mère	\N	Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
58	HISTORIQUE	58	CHEF_DIV_PENSION	Transmettre les Derniers arrérages	\N	Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
60	HISTORIQUE	60	LIQUIDATEUR	Gérer les bons de caisse en retour	\N	Division Pension	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
61	HISTORIQUE	61	LIQUIDATEUR	Établir les demandes de Certificats de Cessation de Paiement	\N	Division Pension	METIER	liquider_pension	PARTIELLE	La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
62	HISTORIQUE	62	LIQUIDATEUR	Traiter les demandes de secours au décès	\N	Division Pension	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
63	HISTORIQUE	63	LIQUIDATEUR	Préparer les envois au SRSP Haute Matsiatra	\N	Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
64	HISTORIQUE	64	CHEF_DIV_VISA	Gérer l’intégration des fonctionnaires	\N	Division Visa	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
65	HISTORIQUE	65	CHEF_DIV_VISA	Gérer le renouvellement de contrat	\N	Division Visa	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
66	HISTORIQUE	66	CHEF_DIV_VISA	Gérer l’avancement de classe	\N	Division Visa	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
67	HISTORIQUE	67	CHEF_DIV_VISA	Assurer la conformité des démarches administratives	Les 11 statuts portent cette exigence	Division Visa	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
68	HISTORIQUE	68	CHEF_DIV_VISA	Assurer la régularité des démarches administratives	\N	Division Visa	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
69	HISTORIQUE	69	CHEF_DIV_VISA	Traiter les dossiers soumis pour visa	\N	Division Visa	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
70	HISTORIQUE	70	CHEF_DIV_VISA	Vérifier les dossiers soumis pour visa	Checklist de vérification	Division Visa	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
71	HISTORIQUE	71	VERIF_VISA	Archiver les dossiers après signature du Chef de Service	\N	Division Visa	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
72	HISTORIQUE	72	CHEF_DIV_SECOURS	Offrir un soutien aux familles des fonctionnaires décédés	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
73	HISTORIQUE	73	CHEF_DIV_SECOURS	Traiter les démarches de secours de décès	\N	Division Secours	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
74	HISTORIQUE	74	CHEF_DIV_SECOURS	Fournir une assistance financière aux familles	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
75	HISTORIQUE	75	CHEF_DIV_SECOURS	Réceptionner les dossiers venant du contrôle financier	\N	Division Secours	METIER	enregistrer_visa_cf	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
76	HISTORIQUE	76	CHEF_DIV_SECOURS	Contrôler les Décisions visées par le CF	N° visa, signature, date	Division Secours	METIER	enregistrer_visa_cf	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
77	HISTORIQUE	77	CHEF_DIV_SECOURS	Contrôler les États de décompte	\N	Division Secours	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
78	HISTORIQUE	78	CHEF_DIV_SECOURS	Préparer le mandatement	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
79	HISTORIQUE	79	CHEF_DIV_SECOURS	Établir l’État de décompte du mandatement	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
80	HISTORIQUE	80	CHEF_DIV_SECOURS	Établir les différents états de décompte du secours	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
81	HISTORIQUE	81	CHEF_DIV_SECOURS	Insérer les données dans le logiciel secours	Références calculées et report tracé	Division Secours	INTEGRATION	generer_etat_emargement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
82	HISTORIQUE	82	CHEF_DIV_SECOURS	Faire sortir le montant à engager pour la dépense	Répartition calculée depuis les quotes-parts	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
83	HISTORIQUE	83	CHEF_DIV_SECOURS	Faire sortir la liste des bénéficiaires (tiers)	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
84	HISTORIQUE	84	CHEF_DIV_SECOURS	Gérer l’ordonnancement	\N	Division Secours	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
85	HISTORIQUE	85	CHEF_DIV_SECOURS	Gérer la liquidation	\N	Division Secours	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
86	HISTORIQUE	86	CHEF_DIV_SECOURS	Imprimer le TEF	Titre d’Engagement Financier	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
87	HISTORIQUE	87	CHEF_DIV_SECOURS	Imprimer le Mandat de paiement	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
88	HISTORIQUE	88	CHEF_DIV_SECOURS	Imprimer le Bon de caisse	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
89	HISTORIQUE	89	CHEF_DIV_SECOURS	Imprimer le Bordereau des pièces	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
90	HISTORIQUE	90	CHEF_DIV_SECOURS	Imprimer le Bord d’émissions	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
91	HISTORIQUE	91	CHEF_DIV_SECOURS	Imprimer le Bord de mandats	\N	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
92	HISTORIQUE	92	CHEF_DIV_SECOURS	Imprimer l’État d’émargement	\N	Division Secours	METIER	generer_etat_emargement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
93	HISTORIQUE	93	CHEF_DIV_SECOURS	Imprimer les Tickets de mandatement	Guichet unique	Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
94	HISTORIQUE	94	CHEF_DIV_SECOURS	Insérer dans le logiciel secours les références pour l’état d’émargement	\N	Division Secours	INTEGRATION	generer_etat_emargement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
95	HISTORIQUE	95	CHEF_DIV_SECOURS	Faire signer les pièces de mandatement par l’ordonnateur	Permission dédiée : le Chef de Division ne signe pas	Division Secours	METIER	signer_pieces_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
96	HISTORIQUE	96	CHARGE_SECOURS	Traiter les dossiers de secours de décès	\N	Division Secours	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
97	HISTORIQUE	97	CHARGE_SECOURS	Apposer le cachet et la date sur les pièces de mandatement	\N	Division Secours	METIER	apposer_cachet	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
98	HISTORIQUE	98	CHARGE_SECOURS	Apposer le cachet rond, titre et nom de l’ordonnateur	\N	Division Secours	METIER	apposer_cachet	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
99	HISTORIQUE	99	CHARGE_SECOURS	Dépouiller les dossiers (Décision)	Pièce PGA visée par le contrôle financier	Division Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
100	HISTORIQUE	100	CHARGE_SECOURS	Dépouiller les dossiers (État de décompte)	\N	Division Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
101	HISTORIQUE	101	CHARGE_SECOURS	Dépouiller les dossiers (CCETPP)	Certificat de Cessation d’Emploi et de Traitement	Division Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
102	HISTORIQUE	102	CHARGE_SECOURS	Dépouiller les dossiers (Demande de l’intéressé)	\N	Division Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
108	HISTORIQUE	108	CHARGE_SECOURS	Faire cacheter et parapher les documents par le CF	Le CF signe la pièce papier	Division Secours	METIER	\N	HORS_PLATEFORME	Le cachet du contrôle financier est apposé sur la pièce physique. La plateforme ne peut que tracer la demande de cachet.	2026-10-05 10:24:41	2026-10-05 10:24:41
109	HISTORIQUE	109	CHEF_SERVICE	Représenter le SRSP auprès du Ministère	Rapports et statistiques du service	Chef de Service	METIER	consolidate_reports	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
110	HISTORIQUE	110	CHEF_SERVICE	Valider l’ensemble des dossiers traités	\N	Chef de Service	METIER	valider_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
111	HISTORIQUE	111	CHEF_SERVICE	Signer l’ensemble des dossiers traités	Référence de signature obligatoire	Chef de Service	METIER	signer_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
112	HISTORIQUE	112	CHEF_SERVICE	Superviser les dossiers au niveau de chaque Division	\N	Chef de Service	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
113	HISTORIQUE	113	CHEF_SERVICE	Garantir la qualité des procédures administratives	\N	Chef de Service	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
114	HISTORIQUE	114	CHEF_SERVICE	Garantir la conformité des procédures administratives	\N	Chef de Service	METIER	valider_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
115	HISTORIQUE	115	CHEF_SERVICE	Résoudre les problèmes persistants au niveau des Divisions	\N	Chef de Service	METIER	\N	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
116	HISTORIQUE	116	CHEF_SERVICE	Intervenir là où les solutions n’ont pas été résolues	\N	Chef de Service	METIER	\N	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
117	HISTORIQUE	117	CHEF_DIV_VISA	Assurer l’interlocution avec les Chefs de Division	Besoins matériels	Chef de Service	METIER	\N	NON_CONSTRUITE	Aucun circuit de demande de besoin matériel.	2026-10-05 10:24:41	2026-10-05 10:24:41
118	HISTORIQUE	118	CHEF_BAAF	Préparer les documents comptables	\N	Chef BAAF	METIER	manage_documents	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
119	HISTORIQUE	119	CHEF_BAAF	Exploiter les documents comptables	\N	Chef BAAF	METIER	view_stats	PARTIELLE	Les indicateurs de dossiers existent. L’analyse des pièces comptables elle-même n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
120	HISTORIQUE	120	CHEF_BAAF	Archiver les documents comptables	\N	Chef BAAF	METIER	view_archives	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
121	HISTORIQUE	121	CHEF_BAAF	Classer les documents comptables	\N	Chef BAAF	METIER	upload_document	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
122	HISTORIQUE	122	CHEF_BAAF	Effectuer les saisies sur SIIGFP	Système financier de l’État	Chef BAAF	INTEGRATION	\N	HORS_PLATEFORME	SIIGFP est un système externe du Ministère. La plateforme prépare les données à y reporter, elle n’y écrit pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
123	HISTORIQUE	123	CHEF_BAAF	Effectuer les saisies sur SIIGMP	Système de masse salariale	Chef BAAF	INTEGRATION	\N	HORS_PLATEFORME	SIIGMP est un système externe. Même limite que pour SIIGFP.	2026-10-05 10:24:41	2026-10-05 10:24:41
124	HISTORIQUE	124	CHEF_BAAF	Produire les situations trimestrielles (FCC, BCSE)	Fiche de Compte et Budget de Compte Spécial d’Emploi	Chef BAAF	METIER	\N	NON_CONSTRUITE	La nomenclature FCC/BCSE n’est décrite nulle part. Un état produit sans elle ne serait conforme à rien.	2026-10-05 10:24:41	2026-10-05 10:24:41
125	HISTORIQUE	125	CHEF_BAAF	Produire les situations annuelles (FCC, BCSE)	\N	Chef BAAF	METIER	\N	NON_CONSTRUITE	Dépend de la fonction 124, non construite.	2026-10-05 10:24:41	2026-10-05 10:24:41
126	HISTORIQUE	126	CHEF_BAAF	Gérer le personnel (avancement)	\N	Chef BAAF	METIER	manage_personnel	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
127	HISTORIQUE	127	CHEF_BAAF	Gérer le personnel (renouvellement)	Contrats	Chef BAAF	METIER	manage_personnel	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
128	HISTORIQUE	128	CHEF_BAAF	Gérer le personnel (congé)	Droits à congés	Chef BAAF	METIER	\N	NON_CONSTRUITE	Le droit du travail malgache n’est pas documenté. Les droits ne peuvent pas être inventés.	2026-10-05 10:24:41	2026-10-05 10:24:41
129	HISTORIQUE	129	CHEF_BAAF	Gérer le personnel (permission)	Absences	Chef BAAF	METIER	\N	NON_CONSTRUITE	Dépend de la fonction 128, non construite.	2026-10-05 10:24:41	2026-10-05 10:24:41
130	HISTORIQUE	130	CHEF_BAAF	Consolider le rapport d’activités du service	\N	Chef BAAF	METIER	consolidate_reports	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
131	HISTORIQUE	131	CHEF_BAAF	Superviser l’établissement de la comptabilité-matière	Inventaire du matériel	Chef BAAF	METIER	\N	NON_CONSTRUITE	Aucun inventaire de matériel. Entrées, sorties et stock n’existent pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
132	HISTORIQUE	132	CHEF_BAAF	Superviser les travaux de secrétariat	\N	Chef BAAF	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
133	HISTORIQUE	133	CHEF_BAAF	Résoudre les difficultés rencontrées au sein du Bureau	\N	Chef BAAF	METIER	\N	NON_CONSTRUITE	Aucun circuit d’escalade au niveau du bureau.	2026-10-05 10:24:41	2026-10-05 10:24:41
150	HISTORIQUE	150	COORDONNATRICE	Préparer les rapports d’activité pour le Chef de Service	\N	Coordonnatrice	METIER	consolidate_reports	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
151	HISTORIQUE	151	COORDONNATRICE	Préparer les rapports d’activité pour la direction centrale	\N	Coordonnatrice	METIER	consolidate_reports	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
152	HISTORIQUE	152	COORDONNATRICE	Rapporter le nombre de nouveaux dossiers traités	\N	Coordonnatrice	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
153	HISTORIQUE	153	COORDONNATRICE	Rapporter les changements de statut	\N	Coordonnatrice	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
154	HISTORIQUE	154	COORDONNATRICE	Rapporter les problèmes rencontrés	\N	Coordonnatrice	METIER	view_stats	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
155	HISTORIQUE	155	COORDONNATRICE	Rapporter les mesures prises pour résoudre les problèmes	\N	Coordonnatrice	METIER	view_stats	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
160	HISTORIQUE	160	SECRETARIAT	Effectuer tous les travaux de secrétariat du Service	\N	Secrétaire	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
161	HISTORIQUE	161	SECRETARIAT	Réceptionner les dossiers	\N	Secrétaire	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
162	HISTORIQUE	162	SECRETARIAT	Réceptionner les courriers	\N	Secrétaire	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
163	HISTORIQUE	163	SECRETARIAT	Enregistrer les dossiers	\N	Secrétaire	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
164	HISTORIQUE	164	SECRETARIAT	Enregistrer les courriers	\N	Secrétaire	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
165	HISTORIQUE	165	SECRETARIAT	Distribuer les dossiers	\N	Secrétaire	METIER	orienter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
166	HISTORIQUE	166	SECRETARIAT	Distribuer les courriers	\N	Secrétaire	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
167	HISTORIQUE	167	SECRETARIAT	Gérer la chronologie des actes émis par le service	\N	Secrétaire	METIER	\N	NON_CONSTRUITE	Aucune numérotation d’actes. Un numéro d’acte est la référence d’une pièce officielle : sans registre, deux actes peuvent porter le même numéro.	2026-10-05 10:24:41	2026-10-05 10:24:41
168	HISTORIQUE	168	SECRETARIAT	Gérer les numéros BE (Bons d’Émission)	\N	Secrétaire	METIER	\N	NON_CONSTRUITE	Dépend de la fonction 167, non construite.	2026-10-05 10:24:41	2026-10-05 10:24:41
169	HISTORIQUE	169	SECRETARIAT	Gérer les Notes	\N	Secrétaire	METIER	\N	NON_CONSTRUITE	Dépend de la fonction 167, non construite.	2026-10-05 10:24:41	2026-10-05 10:24:41
170	HISTORIQUE	170	SECRETARIAT	Gérer les Lettres	\N	Secrétaire	METIER	\N	NON_CONSTRUITE	Dépend de la fonction 167, non construite.	2026-10-05 10:24:41	2026-10-05 10:24:41
171	HISTORIQUE	171	CHEF_DIV_VISA	Organiser le traitement des dossiers soumis pour visa	\N	Chef Division Visa	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
172	HISTORIQUE	172	CHEF_DIV_VISA	Superviser le traitement des dossiers soumis pour visa	\N	Chef Division Visa	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
173	HISTORIQUE	173	CHEF_DIV_VISA	Vérifier les dossiers soumis pour visa	\N	Chef Division Visa	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
174	HISTORIQUE	174	CHEF_DIV_VISA	Résoudre les difficultés rencontrées au sein de la division	\N	Chef Division Visa	METIER	view_all_dossiers	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
175	HISTORIQUE	175	CHEF_DIV_VISA	Produire le rapport d’activités mensuel	\N	Chef Division Visa	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
176	HISTORIQUE	176	CHEF_DIV_VISA	Produire le rapport d’activités trimestriel	\N	Chef Division Visa	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
177	HISTORIQUE	177	CHEF_DIV_VISA	Produire le rapport d’activités annuel	\N	Chef Division Visa	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
178	HISTORIQUE	178	CHEF_DIV_VISA	Assurer l’interlocution avec le Chef de Service (besoins matériels)	\N	Chef Division Visa	METIER	\N	NON_CONSTRUITE	Aucun circuit de demande de besoin matériel.	2026-10-05 10:24:41	2026-10-05 10:24:41
179	HISTORIQUE	179	CHEF_DIV_VISA	Représenter la Division au sein des réunions	\N	Chef Division Visa	METIER	\N	HORS_PLATEFORME	La représentation se prépare par les rapports et statistiques, mais la réunion elle-même relève du service, pas de la plateforme.	2026-10-05 10:24:41	2026-10-05 10:24:41
180	HISTORIQUE	180	CHEF_DIV_VISA	Représenter la Division au sein des conférences	\N	Chef Division Visa	METIER	\N	HORS_PLATEFORME	Même limite que pour la fonction 179.	2026-10-05 10:24:41	2026-10-05 10:24:41
181	HISTORIQUE	181	CHEF_DIV_VISA	Représenter la Division au sein des séminaires	\N	Chef Division Visa	METIER	\N	HORS_PLATEFORME	Même limite que pour la fonction 179.	2026-10-05 10:24:41	2026-10-05 10:24:41
182	HISTORIQUE	182	CHEF_DIV_VISA	Représenter la Division au sein des ateliers	\N	Chef Division Visa	METIER	\N	HORS_PLATEFORME	Même limite que pour la fonction 179.	2026-10-05 10:24:41	2026-10-05 10:24:41
183	HISTORIQUE	183	CHEF_DIV_VISA	Assurer la bonne conduite des agents	\N	Chef Division Visa	METIER	\N	NON_CONSTRUITE	Aucun registre disciplinaire. Le suivi de la tenue des agents se limite aux indicateurs d’activité.	2026-10-05 10:24:41	2026-10-05 10:24:41
184	HISTORIQUE	184	CHEF_DIV_VISA	Assurer la bonne exécution des tâches des agents	\N	Chef Division Visa	METIER	view_stats	PARTIELLE	Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
185	HISTORIQUE	185	CHEF_DIV_SOLDE	Organiser le traitement des dossiers pour mandatement	\N	Chef Division Solde	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
186	HISTORIQUE	186	CHEF_DIV_SOLDE	Superviser le traitement des dossiers pour mandatement	\N	Chef Division Solde	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
187	HISTORIQUE	187	CHEF_DIV_SOLDE	Vérifier les dossiers soumis pour mandatement	\N	Chef Division Solde	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
188	HISTORIQUE	188	CHEF_DIV_SOLDE	Vérifier les Certificats de Cessation de Paiement	\N	Chef Division Solde	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
189	HISTORIQUE	189	CHEF_DIV_SOLDE	Vérifier les décomptes d’avance de Solde	\N	Chef Division Solde	METIER	controler_decomptes	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
190	HISTORIQUE	190	CHEF_DIV_SOLDE	Vérifier les états de décompte des Soldes trop perçus	\N	Chef Division Solde	METIER	controler_decomptes	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
191	HISTORIQUE	191	CHEF_DIV_SOLDE	Vérifier les Bons de caisse à retourner à la Trésorerie Générale	\N	Chef Division Solde	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
192	HISTORIQUE	192	CHEF_DIV_SOLDE	Assurer l’interlocution avec le Chef de Service	\N	Chef Division Solde	METIER	\N	NON_CONSTRUITE	Aucun circuit de demande de besoin matériel.	2026-10-05 10:24:41	2026-10-05 10:24:41
193	HISTORIQUE	193	CHEF_DIV_SOLDE	Résoudre les difficultés rencontrées au sein de la division	\N	Chef Division Solde	METIER	view_all_dossiers	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
195	HISTORIQUE	195	CHEF_DIV_SOLDE	Classer les demandes de Domiciliation irrévocable de salaire	\N	Chef Division Solde	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
196	HISTORIQUE	196	CHEF_DIV_SOLDE	Produire le rapport d’activités mensuel	\N	Chef Division Solde	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
197	HISTORIQUE	197	CHEF_DIV_SOLDE	Produire le rapport d’activités trimestriel	\N	Chef Division Solde	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
198	HISTORIQUE	198	CHEF_DIV_SOLDE	Produire le rapport d’activités annuel	\N	Chef Division Solde	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
199	HISTORIQUE	199	CHEF_DIV_SOLDE	Représenter la Division	\N	Chef Division Solde	METIER	\N	HORS_PLATEFORME	La représentation se prépare par les rapports, mais la réunion relève du service.	2026-10-05 10:24:41	2026-10-05 10:24:41
200	HISTORIQUE	200	CHEF_DIV_SOLDE	Assurer la bonne conduite des agents	\N	Chef Division Solde	METIER	\N	NON_CONSTRUITE	Aucun registre disciplinaire.	2026-10-05 10:24:41	2026-10-05 10:24:41
201	HISTORIQUE	201	CHEF_DIV_SOLDE	Assurer la bonne exécution des tâches des agents	\N	Chef Division Solde	METIER	view_stats	PARTIELLE	Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
202	HISTORIQUE	202	CHEF_DIV_PENSION	Organiser le traitement des dossiers pour liquidation	\N	Chef Division Pension	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
203	HISTORIQUE	203	CHEF_DIV_PENSION	Superviser le traitement des dossiers pour liquidation	\N	Chef Division Pension	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
204	HISTORIQUE	204	CHEF_DIV_PENSION	Vérifier les dossiers soumis pour liquidation de Pensions	\N	Chef Division Pension	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
205	HISTORIQUE	205	CHEF_DIV_PENSION	Résoudre les difficultés rencontrées au sein de la division	\N	Chef Division Pension	METIER	view_all_dossiers	LIVREE	Un signalement peut être ouvert sur le dossier : type (blocage, interlocution, arbitrage), priorité, motif. Le chef de service le prend en charge et le referme par une résolution écrite. Le signalement ne modifie pas le statut du dossier : il porte la difficulté et sa trace, le dossier suit son workflow.	2026-10-05 10:24:41	2026-10-22 10:26:56
206	HISTORIQUE	206	CHEF_DIV_PENSION	Assurer l’interlocution avec le Chef de Service	\N	Chef Division Pension	METIER	\N	NON_CONSTRUITE	Aucun circuit de demande de besoin matériel.	2026-10-05 10:24:41	2026-10-05 10:24:41
207	HISTORIQUE	207	CHEF_DIV_PENSION	Produire le rapport d’activités mensuel	\N	Chef Division Pension	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
208	HISTORIQUE	208	CHEF_DIV_PENSION	Produire le rapport d’activités trimestriel	\N	Chef Division Pension	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
209	HISTORIQUE	209	CHEF_DIV_PENSION	Produire le rapport d’activités annuel	\N	Chef Division Pension	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
210	HISTORIQUE	210	CHEF_DIV_PENSION	Rédiger toute correspondance d’usage (Lettre de prescription)	\N	Chef Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
211	HISTORIQUE	211	CHEF_DIV_PENSION	Rédiger toute correspondance d’usage (demande de dossier mère)	\N	Chef Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
213	HISTORIQUE	213	CHEF_DIV_PENSION	Envoyer les Derniers arrérages	\N	Chef Division Pension	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
214	HISTORIQUE	214	CHEF_DIV_PENSION	Représenter la Division au sein des réunions	\N	Chef Division Pension	METIER	\N	HORS_PLATEFORME	La représentation se prépare par les rapports, mais la réunion relève du service.	2026-10-05 10:24:41	2026-10-05 10:24:41
215	HISTORIQUE	215	CHEF_DIV_PENSION	Proposer toutes mesures devant être prises et matérialisées par actes	\N	Chef Division Pension	METIER	\N	NON_CONSTRUITE	Aucun circuit de proposition d’une mesure administrative à la hiérarchie.	2026-10-05 10:24:41	2026-10-05 10:24:41
216	HISTORIQUE	216	CHEF_DIV_PENSION	Assurer la bonne conduite des agents	\N	Chef Division Pension	METIER	\N	NON_CONSTRUITE	Aucun registre disciplinaire.	2026-10-05 10:24:41	2026-10-05 10:24:41
217	HISTORIQUE	217	CHEF_DIV_PENSION	Assurer la bonne exécution des tâches des agents	\N	Chef Division Pension	METIER	view_stats	PARTIELLE	Les indicateurs d’activité existent. Le suivi de l’exécution des tâches, en tant que tel, n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
218	HISTORIQUE	218	CHEF_DIV_SECOURS	Réceptionner les dossiers venant du contrôle financier	\N	Chef Division Secours	METIER	enregistrer_visa_cf	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
219	HISTORIQUE	219	CHEF_DIV_SECOURS	Contrôler les Décisions visées par le CF	\N	Chef Division Secours	METIER	enregistrer_visa_cf	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
220	HISTORIQUE	220	CHEF_DIV_SECOURS	Contrôler les États de décompte	\N	Chef Division Secours	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
221	HISTORIQUE	221	CHEF_DIV_SECOURS	Préparer le mandatement	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
222	HISTORIQUE	222	CHEF_DIV_SECOURS	Établir l’État de décompte du mandatement	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
223	HISTORIQUE	223	CHEF_DIV_SECOURS	Établir les différents états de décompte du secours	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
224	HISTORIQUE	224	CHEF_DIV_SECOURS	Insérer les données dans le logiciel secours	\N	Chef Division Secours	METIER	generer_etat_emargement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
225	HISTORIQUE	225	CHEF_DIV_SECOURS	Faire sortir le montant à engager pour la dépense	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
226	HISTORIQUE	226	CHEF_DIV_SECOURS	Faire sortir la liste des bénéficiaires (tiers)	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
227	HISTORIQUE	227	CHEF_DIV_SECOURS	Gérer l’ordonnancement	\N	Chef Division Secours	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
228	HISTORIQUE	228	CHEF_DIV_SECOURS	Gérer la liquidation	\N	Chef Division Secours	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
229	HISTORIQUE	229	CHEF_DIV_SECOURS	Imprimer le TEF	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
230	HISTORIQUE	230	CHEF_DIV_SECOURS	Imprimer le Mandat de paiement	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
231	HISTORIQUE	231	CHEF_DIV_SECOURS	Imprimer le Bon de caisse	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
232	HISTORIQUE	232	CHEF_DIV_SECOURS	Imprimer le Bordereau des pièces	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
233	HISTORIQUE	233	CHEF_DIV_SECOURS	Imprimer le Bord d’émissions	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
234	HISTORIQUE	234	CHEF_DIV_SECOURS	Imprimer le Bord de mandats	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
235	HISTORIQUE	235	CHEF_DIV_SECOURS	Imprimer l’État d’émargement	\N	Chef Division Secours	METIER	generer_etat_emargement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
236	HISTORIQUE	236	CHEF_DIV_SECOURS	Imprimer les Tickets de mandatement	\N	Chef Division Secours	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
237	HISTORIQUE	237	CHEF_DIV_SECOURS	Insérer dans le logiciel secours les références	\N	Chef Division Secours	METIER	generer_etat_emargement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
238	HISTORIQUE	238	CHEF_DIV_SECOURS	Faire signer les pièces de mandatement par l’ordonnateur	\N	Chef Division Secours	METIER	signer_pieces_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
239	HISTORIQUE	239	CHEF_DIV_SECOURS	Superviser les chargés de secours	\N	Chef Division Secours	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
240	HISTORIQUE	240	CHEF_DIV_SECOURS	Assurer la bonne conduite des agents	\N	Chef Division Secours	METIER	\N	NON_CONSTRUITE	Aucun registre disciplinaire.	2026-10-05 10:24:41	2026-10-05 10:24:41
241	HISTORIQUE	241	VERIF_VISA	Exploiter tous les dossiers soumis pour visa	\N	Vérificateurs Visas	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
242	HISTORIQUE	242	VERIF_VISA	Soumettre les dossiers pour vérification du Chef de Division	\N	Vérificateurs Visas	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
243	HISTORIQUE	243	VERIF_VISA	Soumettre les dossiers pour signature du Chef de Service	\N	Vérificateurs Visas	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
244	HISTORIQUE	244	VERIF_VISA	Archiver les dossiers après signature du Chef de Service	\N	Vérificateurs Visas	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
245	HISTORIQUE	245	VERIF_SOLDE	Exploiter tous les dossiers soumis pour mandatement	\N	Vérificateurs Solde	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
246	HISTORIQUE	246	VERIF_SOLDE	Soumettre les dossiers pour vérification du Chef de Division	\N	Vérificateurs Solde	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
247	HISTORIQUE	247	VERIF_SOLDE	Soumettre les dossiers pour signature du Chef de Service	\N	Vérificateurs Solde	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
248	HISTORIQUE	248	VERIF_SOLDE	Préparer les fiches de contrôle de Solde	\N	Vérificateurs Solde	METIER	\N	LIVREE	La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : elle porte ses trois champs propres — date de contrôle, résultat, version produite — et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent depuis Référentiel › Schémas d’opérations, sans développement.	2026-10-05 10:24:41	2026-10-22 10:05:08
250	HISTORIQUE	250	VERIF_SOLDE	Expédier les dossiers mères aux SRSP concernés	\N	Vérificateurs Solde	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
251	HISTORIQUE	251	VERIF_SOLDE	Préparer les dossiers de mandatement pour envoi au niveau central	\N	Vérificateurs Solde	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
252	HISTORIQUE	252	VERIF_SOLDE	Mettre à jour les fiches de contrôle de la Solde	\N	Vérificateurs Solde	METIER	\N	LIVREE	La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : elle porte ses trois champs propres — date de contrôle, résultat, version produite — et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent depuis Référentiel › Schémas d’opérations, sans développement.	2026-10-05 10:24:41	2026-10-22 10:05:08
253	HISTORIQUE	253	VERIF_SOLDE	Réceptionner les fiches de contrôle	\N	Vérificateurs Solde	METIER	\N	LIVREE	La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : elle porte ses trois champs propres — date de contrôle, résultat, version produite — et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent depuis Référentiel › Schémas d’opérations, sans développement.	2026-10-05 10:24:41	2026-10-22 10:05:08
256	HISTORIQUE	256	VERIF_SOLDE	Présenter les décomptes pour vérification du Chef de Division	\N	Vérificateurs Solde	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
257	HISTORIQUE	257	VERIF_SOLDE	Présenter les décomptes pour signature du Chef de Service	\N	Vérificateurs Solde	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
258	HISTORIQUE	258	LIQUIDATEUR	Exploiter tous les dossiers soumis pour liquidation	\N	Liquidateurs Pensions	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
259	HISTORIQUE	259	LIQUIDATEUR	Soumettre les dossiers pour vérification du Chef de Division	\N	Liquidateurs Pensions	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
260	HISTORIQUE	260	LIQUIDATEUR	Traiter les demandes de secours au décès	\N	Liquidateurs Pensions	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
261	HISTORIQUE	261	LIQUIDATEUR	Préparer les demandes de secours pour envoi au SRSP Haute Matsiatra	\N	Liquidateurs Pensions	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
263	HISTORIQUE	263	LIQUIDATEUR	Gérer les bons de caisse en retour	\N	Liquidateurs Pensions	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
264	HISTORIQUE	264	LIQUIDATEUR	Établir les demandes de Certificats de Cessation de Paiement	\N	Liquidateurs Pensions	METIER	liquider_pension	PARTIELLE	La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
265	HISTORIQUE	265	CHARGE_SECOURS	Traiter les dossiers de secours de décès	\N	Chargés de Secours	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
266	HISTORIQUE	266	CHARGE_SECOURS	Apposer le cachet et la date des pièces de mandatements	\N	Chargés de Secours	METIER	apposer_cachet	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
267	HISTORIQUE	267	CHARGE_SECOURS	Apposer le cachet rond, titre et nom de l’ordonnateur	\N	Chargés de Secours	METIER	apposer_cachet	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
268	HISTORIQUE	268	CHARGE_SECOURS	Dépouiller les dossiers (Décision)	\N	Chargés de Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
269	HISTORIQUE	269	CHARGE_SECOURS	Dépouiller les dossiers (État de décompte)	\N	Chargés de Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
270	HISTORIQUE	270	CHARGE_SECOURS	Dépouiller les dossiers (CCETPP)	\N	Chargés de Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
271	HISTORIQUE	271	CHARGE_SECOURS	Dépouiller les dossiers (Demande de l’intéressé)	\N	Chargés de Secours	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
277	HISTORIQUE	277	CHARGE_SECOURS	Faire cacheter et parapher les documents par le CF	\N	Chargés de Secours	METIER	\N	HORS_PLATEFORME	Le cachet du contrôle financier est apposé sur la pièce physique. La plateforme ne peut que tracer la demande de cachet.	2026-10-05 10:24:41	2026-10-05 10:24:41
278	HISTORIQUE	278	MINISTERE	Direction de la Communication	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
279	HISTORIQUE	279	MINISTERE	Cabinet du Ministère	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
280	HISTORIQUE	280	MINISTERE	Autorité de Régulation des Marchés Publics	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
281	HISTORIQUE	281	MINISTERE	Direction Générale du Contrôle Financier	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
282	HISTORIQUE	282	MINISTERE	Direction de l’Audit Interne	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
283	HISTORIQUE	283	MINISTERE	Commission Nationale des Marchés	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
284	HISTORIQUE	284	MINISTERE	Cellule de Coordination des Projets	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
285	HISTORIQUE	285	MINISTERE	Direction des Études et de la Programmation	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
286	HISTORIQUE	286	MINISTERE	Direction d’Appui, de Suivi et d’Évaluation	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
287	HISTORIQUE	287	MINISTERE	Secrétariat Général	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
288	HISTORIQUE	288	MINISTERE	Institut National de la Statistique	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
289	HISTORIQUE	289	MINISTERE	Conseil Supérieur de la Comptabilité	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
290	HISTORIQUE	290	MINISTERE	Direction de l’Imprimerie Nationale	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
291	HISTORIQUE	291	MINISTERE	Direction des Affaires Administratives et Financières	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
292	HISTORIQUE	292	MINISTERE	Direction des Ressources Humaines	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
293	HISTORIQUE	293	MINISTERE	Direction de la Formation et de la Coordination des Réformes	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
294	HISTORIQUE	294	MINISTERE	Direction des Systèmes d’Information	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
295	HISTORIQUE	295	MINISTERE	Direction de la Promotion du Partenariat Public-Privé	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
296	HISTORIQUE	296	MINISTERE	Bureau d’Appui à la Coopération Extérieure	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
297	HISTORIQUE	297	MINISTERE	Direction Générale des Douanes	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
298	HISTORIQUE	298	MINISTERE	Direction Générale des Impôts	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
299	HISTORIQUE	299	MINISTERE	Direction Générale du Budget et des Finances	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
300	HISTORIQUE	300	MINISTERE	Direction du Budget	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
301	HISTORIQUE	301	MINISTERE	Direction de la Gestion des Effectifs des Agents de l’État	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
302	HISTORIQUE	302	MINISTERE	Direction de la Solde et des Pensions	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
303	HISTORIQUE	303	MINISTERE	Direction Générale du Trésor	Ligne de l’organigramme du Ministère	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel : le SRSP ne gère pas les autres directions du Ministère.	2026-10-05 10:24:41	2026-10-05 10:24:41
304	HISTORIQUE	304	MINISTERE	Direction non précisée dans le document source	Ligne réservée par le document sans intitulé	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Le document attribue la ligne 304 à une direction du Ministère mais n’en énumère que 26 entre les lignes 278 et 303. L’écart est constaté, pas comblé.	2026-10-05 10:24:41	2026-10-05 10:24:41
305	HISTORIQUE	305	CHEF_SERVICE	Chef de Service du SRSP	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
306	HISTORIQUE	306	COORDONNATRICE	Coordonnatrice	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
307	HISTORIQUE	307	CHEF_BAAF	Chef BAAF	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
308	HISTORIQUE	308	SECRETARIAT	Secrétariat	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
309	HISTORIQUE	309	ACCUEIL	Accueil	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
310	HISTORIQUE	310	SUIVI_COURRIERS	Suivi des courriers	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
311	HISTORIQUE	311	CHEF_DIV_VISA	Chef de Division VISAS	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
312	HISTORIQUE	312	CHEF_DIV_SOLDE	Chef de Division SOLDE	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
313	HISTORIQUE	313	CHEF_DIV_PENSION	Chef de Division PENSIONS	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
314	HISTORIQUE	314	CHEF_DIV_SECOURS	Chef de Division SECOURS	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
315	HISTORIQUE	315	VERIF_VISA	Vérificateurs Visas	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
316	HISTORIQUE	316	VERIF_SOLDE	Vérificateurs Solde	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
317	HISTORIQUE	317	LIQUIDATEUR	Liquidateurs Pensions	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
318	HISTORIQUE	318	CHARGE_SECOURS	Chargés de Secours	Ligne de l’organigramme du SRSP	Organigramme	STRUCTURE	\N	HORS_PLATEFORME	Ligne d’organigramme officiel. Ce n’est pas une action du logiciel.	2026-10-05 10:24:41	2026-10-05 10:24:41
319	HISTORIQUE	319	CHEF_BAAF	Intégrer les données avec SIIGFP	Système financier de l’État	Intégration	INTEGRATION	\N	HORS_PLATEFORME	La plateforme prépare les données à reporter, elle n’y écrit pas. Le report est tracé, ce qui permet de contrôler ce qui a été saisi.	2026-10-05 10:24:41	2026-10-05 10:24:41
320	HISTORIQUE	320	CHEF_BAAF	Intégrer les données avec SIIGMP	Système de masse salariale	Intégration	INTEGRATION	\N	HORS_PLATEFORME	Même limite que pour SIIGFP.	2026-10-05 10:24:41	2026-10-05 10:24:41
321	HISTORIQUE	321	COORDONNATRICE	Intégrer les données avec Augure	Système de paie et de pensions	Intégration	INTEGRATION	\N	HORS_PLATEFORME	Les données d’insertion augurale sont gérées et validées. Le report dans Augure reste une saisie externe, dont la plateforme trace la préparation.	2026-10-05 10:24:41	2026-10-05 10:24:41
322	HISTORIQUE	322	CHEF_DIV_SECOURS	Intégrer les données avec le logiciel secours	Logiciel de mandatement	Intégration	INTEGRATION	\N	HORS_PLATEFORME	Les références à reporter sont calculées et le report est tracé. L’écriture dans le logiciel reste externe.	2026-10-05 10:24:41	2026-10-05 10:24:41
323	HISTORIQUE	323	LIQUIDATEUR	Transférer les dossiers au SRSP Haute Matsiatra	Dossier de secours	Intégration	INTEGRATION	\N	HORS_PLATEFORME	La préparation et la correspondance existent. Le transfert physique relève du service.	2026-10-05 10:24:41	2026-10-05 10:24:41
324	HISTORIQUE	324	VERIF_SOLDE	Transférer les dossiers aux SRSP concernés	Dossier mère	Intégration	INTEGRATION	\N	HORS_PLATEFORME	La préparation et la correspondance existent. Le transfert physique relève du service.	2026-10-05 10:24:41	2026-10-05 10:24:41
325	HISTORIQUE	325	CHEF_SERVICE	Envoyer les données au niveau central	Rapport d’activités	Intégration	INTEGRATION	\N	HORS_PLATEFORME	La consolidation des rapports existe. L’envoi à la direction centrale se fait hors de la plateforme.	2026-10-05 10:24:41	2026-10-05 10:24:41
326	OBLIGATOIRE	1	OBLIGATOIRE	Connexion par email + mot de passe	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
327	OBLIGATOIRE	2	OBLIGATOIRE	Hachage des mots de passe (bcrypt)	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
328	OBLIGATOIRE	3	OBLIGATOIRE	Génération de token JWT	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
329	OBLIGATOIRE	4	OBLIGATOIRE	Déconnexion	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
330	OBLIGATOIRE	5	OBLIGATOIRE	Expiration de session (8 heures)	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	Le document fixe 8 h. La valeur était 24 h dans le .env comme dans le défaut du code : les deux ont été corrigées, sans quoi un déploiement sans .env retrouvait 24 h.	2026-10-05 10:24:41	2026-10-05 10:24:41
331	OBLIGATOIRE	6	OBLIGATOIRE	Changement de mot de passe	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
332	OBLIGATOIRE	7	OBLIGATOIRE	Verrouillage après 5 tentatives échouées	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
333	OBLIGATOIRE	8	OBLIGATOIRE	Politique de mot de passe fort	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
334	OBLIGATOIRE	9	OBLIGATOIRE	Contrôle d’accès par rôle (RBAC)	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
335	OBLIGATOIRE	10	OBLIGATOIRE	Vérification côté serveur	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
336	OBLIGATOIRE	11	OBLIGATOIRE	Protection CORS	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
337	OBLIGATOIRE	12	OBLIGATOIRE	Validation des données	Fonctionnalité obligatoire : Authentification	Authentification	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
338	OBLIGATOIRE	13	OBLIGATOIRE	Créer un utilisateur	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
339	OBLIGATOIRE	14	OBLIGATOIRE	Lister les utilisateurs	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
340	OBLIGATOIRE	15	OBLIGATOIRE	Modifier un utilisateur	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
341	OBLIGATOIRE	16	OBLIGATOIRE	Activer / désactiver un compte	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
342	OBLIGATOIRE	17	OBLIGATOIRE	Supprimer un utilisateur	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
343	OBLIGATOIRE	18	OBLIGATOIRE	Réinitialiser un mot de passe	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
344	OBLIGATOIRE	19	OBLIGATOIRE	Rôles prédéfinis	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	\N	LIVREE	Le document de projet en décrit 7. Le document d organisation officiel en décrit 13, et la base en compte 13 : quatre chefs de division, quatre postes transversaux, l administrateur, quatre types d agents. Réduire à 7 retirerait des postes réels du SRSP.	2026-10-05 10:24:41	2026-10-05 10:24:41
345	OBLIGATOIRE	20	OBLIGATOIRE	Permissions	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	\N	LIVREE	Le document de projet en compte 19. La base en compte 51 : les 19 du projet plus 32 ajoutées par les documents suivants, toutes liées à des routes testées. Réduire supprimerait des accès utilisés.	2026-10-05 10:24:41	2026-10-05 10:24:41
346	OBLIGATOIRE	21	OBLIGATOIRE	Matrice RBAC	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_roles	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
347	OBLIGATOIRE	22	OBLIGATOIRE	Attribution de rôle	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
348	OBLIGATOIRE	23	OBLIGATOIRE	Quatre divisions (Visa, Solde, Pension, Secours)	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
349	OBLIGATOIRE	24	OBLIGATOIRE	Affectation d’un utilisateur à une division	Fonctionnalité obligatoire : Utilisateurs	Utilisateurs	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
350	OBLIGATOIRE	25	OBLIGATOIRE	Créer un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
351	OBLIGATOIRE	26	OBLIGATOIRE	Génération automatique du numéro unique	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
352	OBLIGATOIRE	27	OBLIGATOIRE	Format {TYPE}-{ANNEE}-{6CAR}	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
353	OBLIGATOIRE	28	OBLIGATOIRE	Quatre types de dossiers	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
354	OBLIGATOIRE	29	OBLIGATOIRE	Quatre niveaux de priorité	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
355	OBLIGATOIRE	30	OBLIGATOIRE	Gestion du demandeur (CIN unique)	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
356	OBLIGATOIRE	31	OBLIGATOIRE	Statut initial RECU	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
357	OBLIGATOIRE	32	OBLIGATOIRE	Date de réception automatique	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
358	OBLIGATOIRE	33	OBLIGATOIRE	Date limite	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
359	OBLIGATOIRE	34	OBLIGATOIRE	Lister tous les dossiers	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
360	OBLIGATOIRE	35	OBLIGATOIRE	Filtrer les dossiers	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
361	OBLIGATOIRE	36	OBLIGATOIRE	Consulter un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
362	OBLIGATOIRE	37	OBLIGATOIRE	Modifier un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	edit_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
363	OBLIGATOIRE	38	OBLIGATOIRE	Voir l’historique	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
364	OBLIGATOIRE	39	OBLIGATOIRE	Voir les documents	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
365	OBLIGATOIRE	40	OBLIGATOIRE	Voir les notifications	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
366	OBLIGATOIRE	41	OBLIGATOIRE	Orienter un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	orienter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
367	OBLIGATOIRE	42	OBLIGATOIRE	Affecter un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	affecter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
368	OBLIGATOIRE	43	OBLIGATOIRE	Traiter un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
369	OBLIGATOIRE	44	OBLIGATOIRE	Soumettre à vérification	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
370	OBLIGATOIRE	45	OBLIGATOIRE	Vérifier un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
371	OBLIGATOIRE	46	OBLIGATOIRE	Corriger un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
372	OBLIGATOIRE	47	OBLIGATOIRE	Valider un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	valider_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
373	OBLIGATOIRE	48	OBLIGATOIRE	Signer un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	signer_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
374	OBLIGATOIRE	49	OBLIGATOIRE	Clôturer un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	cloturer_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
375	OBLIGATOIRE	50	OBLIGATOIRE	Archiver un dossier	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
376	OBLIGATOIRE	51	OBLIGATOIRE	Créer un demandeur	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
377	OBLIGATOIRE	52	OBLIGATOIRE	Rechercher par CIN	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
378	OBLIGATOIRE	53	OBLIGATOIRE	Consulter l’historique du demandeur	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
379	OBLIGATOIRE	54	OBLIGATOIRE	Modifier les informations du demandeur	Fonctionnalité obligatoire : Dossiers	Dossiers	METIER	edit_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
380	OBLIGATOIRE	55	OBLIGATOIRE	Statut RECU	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
381	OBLIGATOIRE	56	OBLIGATOIRE	Statut ENREGISTRE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
382	OBLIGATOIRE	57	OBLIGATOIRE	Statut ORIENTE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
383	OBLIGATOIRE	58	OBLIGATOIRE	Statut AFFECTE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
384	OBLIGATOIRE	59	OBLIGATOIRE	Statut EN_TRAITEMENT	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
385	OBLIGATOIRE	60	OBLIGATOIRE	Statut SOUMIS_A_VERIFICATION	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
386	OBLIGATOIRE	61	OBLIGATOIRE	Statut CORRECTION_DEMANDEE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
387	OBLIGATOIRE	62	OBLIGATOIRE	Statut VALIDE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
388	OBLIGATOIRE	63	OBLIGATOIRE	Statut SIGNE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
389	OBLIGATOIRE	64	OBLIGATOIRE	Statut CLOTURE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
390	OBLIGATOIRE	65	OBLIGATOIRE	Statut ARCHIVE	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
391	OBLIGATOIRE	66	OBLIGATOIRE	Workflow Visa	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.	2026-10-05 10:24:41	2026-10-05 10:24:41
392	OBLIGATOIRE	67	OBLIGATOIRE	Workflow Solde	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.	2026-10-05 10:24:41	2026-10-05 10:24:41
393	OBLIGATOIRE	68	OBLIGATOIRE	Workflow Pension	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	PARTIELLE	Le document annonce 10 étapes pour la Pension contre 11 pour les autres, sans indiquer QUELLE étape manque. Un circuit Pension à 10 étapes serait inventé. Le circuit général des 11 statuts s’applique.	2026-10-05 10:24:41	2026-10-05 10:24:41
394	OBLIGATOIRE	69	OBLIGATOIRE	Workflow Secours	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	Le circuit appliqué est celui des 11 statuts imposés par la partie 4.1.	2026-10-05 10:24:41	2026-10-05 10:24:41
395	OBLIGATOIRE	70	OBLIGATOIRE	Validation des transitions	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
396	OBLIGATOIRE	71	OBLIGATOIRE	Interdiction des transitions invalides	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	CORRECTION_DEMANDEE ne peut pas mener directement à VALIDE : le dossier repasse en traitement.	2026-10-05 10:24:41	2026-10-05 10:24:41
397	OBLIGATOIRE	72	OBLIGATOIRE	Routage Visa vers Division Visa	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
398	OBLIGATOIRE	73	OBLIGATOIRE	Routage Solde vers Division Solde	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
399	OBLIGATOIRE	74	OBLIGATOIRE	Routage Pension vers Division Pension	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
400	OBLIGATOIRE	75	OBLIGATOIRE	Routage Secours vers Division Secours	Fonctionnalité obligatoire : Workflow	Workflow	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
401	OBLIGATOIRE	76	OBLIGATOIRE	Téléverser des documents	Fonctionnalité obligatoire : Documents	Documents	METIER	upload_document	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
402	OBLIGATOIRE	77	OBLIGATOIRE	Formats PDF, DOCX, XLSX, JPG, PNG	Fonctionnalité obligatoire : Documents	Documents	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
403	OBLIGATOIRE	78	OBLIGATOIRE	Taille maximale 5 Mo	Fonctionnalité obligatoire : Documents	Documents	METIER	\N	LIVREE	Le document fixe 5 Mo. La valeur était 10 Mo dans le .env comme dans le défaut du code : les deux ont été corrigées, et alignées sur le référentiel des types de documents.	2026-10-05 10:24:41	2026-10-05 10:24:41
404	OBLIGATOIRE	79	OBLIGATOIRE	Nom de fichier sécurisé (UUID)	Fonctionnalité obligatoire : Documents	Documents	METIER	\N	LIVREE	Le nom était horodatage + aléatoire. Le nom d’origine disparaît désormais : un fichier déposé sous « contrat_secret.docx » ne conserve plus son nom sur le disque du serveur.	2026-10-05 10:24:41	2026-10-05 10:24:41
405	OBLIGATOIRE	80	OBLIGATOIRE	Lien avec le dossier	Fonctionnalité obligatoire : Documents	Documents	METIER	upload_document	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
406	OBLIGATOIRE	81	OBLIGATOIRE	Téléchargement contrôlé	Fonctionnalité obligatoire : Documents	Documents	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
407	OBLIGATOIRE	82	OBLIGATOIRE	Archivage des pièces	Fonctionnalité obligatoire : Documents	Documents	METIER	view_archives	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
408	OBLIGATOIRE	83	OBLIGATOIRE	Créer un courrier entrant	Fonctionnalité obligatoire : Courriers	Courriers	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
409	OBLIGATOIRE	84	OBLIGATOIRE	Créer un courrier sortant	Fonctionnalité obligatoire : Courriers	Courriers	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
410	OBLIGATOIRE	85	OBLIGATOIRE	Lier à un dossier	Fonctionnalité obligatoire : Courriers	Courriers	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
411	OBLIGATOIRE	86	OBLIGATOIRE	Numérotation automatique	Fonctionnalité obligatoire : Courriers	Courriers	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
412	OBLIGATOIRE	87	OBLIGATOIRE	Recherche par référence	Fonctionnalité obligatoire : Courriers	Courriers	METIER	manage_courriers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
413	OBLIGATOIRE	88	OBLIGATOIRE	Notifications personnelles	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
414	OBLIGATOIRE	89	OBLIGATOIRE	Notifications cliquables	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
415	OBLIGATOIRE	90	OBLIGATOIRE	Redirection automatique	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
416	OBLIGATOIRE	91	OBLIGATOIRE	Badge de compteur	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
417	OBLIGATOIRE	92	OBLIGATOIRE	Marquer comme lue	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
418	OBLIGATOIRE	93	OBLIGATOIRE	Tout marquer comme lu	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	Le contrôleur appelait markAllAsRead, le service exporte markAllRead. Une lettre de différence, invisible à la lecture et qui renvoyait 500 à chaque clic.	2026-10-05 10:24:41	2026-10-05 10:24:41
419	OBLIGATOIRE	94	OBLIGATOIRE	Types de notifications	Fonctionnalité obligatoire : Notifications	Notifications	METIER	\N	LIVREE	Neuf types sont en usage : AFFECTATION, VERIFICATION, VALIDATION, CLOTURE, SIGNATURE, INFO, CORRECTION, WORKFLOW, MENTION. Le document en annonce six ; le nombre est une question libre, pas une règle : ce qui compte est la classification, elle existe.	2026-10-05 10:24:41	2026-10-05 10:24:41
420	OBLIGATOIRE	95	OBLIGATOIRE	Recherche par numéro	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
421	OBLIGATOIRE	96	OBLIGATOIRE	Recherche par nom	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
422	OBLIGATOIRE	97	OBLIGATOIRE	Recherche par CIN	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
423	OBLIGATOIRE	98	OBLIGATOIRE	Filtres par type	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
424	OBLIGATOIRE	99	OBLIGATOIRE	Filtres par statut	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
425	OBLIGATOIRE	100	OBLIGATOIRE	Filtres par division	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
426	OBLIGATOIRE	101	OBLIGATOIRE	Filtres par période	Fonctionnalité obligatoire : Recherche	Recherche	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
427	OBLIGATOIRE	102	OBLIGATOIRE	Dashboard Chef de Service	Fonctionnalité obligatoire : Tableaux de bord	Tableaux de bord	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
428	OBLIGATOIRE	103	OBLIGATOIRE	Dashboard Chef de Division	Fonctionnalité obligatoire : Tableaux de bord	Tableaux de bord	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
429	OBLIGATOIRE	104	OBLIGATOIRE	Dashboard Agent	Fonctionnalité obligatoire : Tableaux de bord	Tableaux de bord	METIER	\N	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
430	OBLIGATOIRE	105	OBLIGATOIRE	Dashboard Administrateur	Fonctionnalité obligatoire : Tableaux de bord	Tableaux de bord	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
431	OBLIGATOIRE	106	OBLIGATOIRE	KPI par rôle	Fonctionnalité obligatoire : Tableaux de bord	Tableaux de bord	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
432	OBLIGATOIRE	107	OBLIGATOIRE	Graphiques	Fonctionnalité obligatoire : Tableaux de bord	Tableaux de bord	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
433	OBLIGATOIRE	108	OBLIGATOIRE	Rapport d’activité	Fonctionnalité obligatoire : Rapports	Rapports	METIER	consolidate_reports	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
434	OBLIGATOIRE	109	OBLIGATOIRE	Dossiers reçus	Fonctionnalité obligatoire : Rapports	Rapports	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
435	OBLIGATOIRE	110	OBLIGATOIRE	Dossiers traités	Fonctionnalité obligatoire : Rapports	Rapports	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
436	OBLIGATOIRE	111	OBLIGATOIRE	Dossiers en retard	Fonctionnalité obligatoire : Rapports	Rapports	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
437	OBLIGATOIRE	112	OBLIGATOIRE	Activité par division	Fonctionnalité obligatoire : Rapports	Rapports	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
438	OBLIGATOIRE	113	OBLIGATOIRE	Activité par agent	Fonctionnalité obligatoire : Rapports	Rapports	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
439	OBLIGATOIRE	114	OBLIGATOIRE	Export PDF	Fonctionnalité obligatoire : Rapports	Rapports	METIER	export_data	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
440	OBLIGATOIRE	115	OBLIGATOIRE	Export Excel	Fonctionnalité obligatoire : Rapports	Rapports	METIER	export_data	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
441	OBLIGATOIRE	116	OBLIGATOIRE	Archiver un dossier	Fonctionnalité obligatoire : Archivage	Archivage	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
442	OBLIGATOIRE	117	OBLIGATOIRE	Consulter les archives	Fonctionnalité obligatoire : Archivage	Archivage	METIER	view_archives	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
443	OBLIGATOIRE	118	OBLIGATOIRE	Rechercher dans les archives	Fonctionnalité obligatoire : Archivage	Archivage	METIER	view_archives	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
444	OBLIGATOIRE	119	OBLIGATOIRE	Trier les archives	Fonctionnalité obligatoire : Archivage	Archivage	METIER	view_archives	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
445	OBLIGATOIRE	120	OBLIGATOIRE	Protection des archives	Fonctionnalité obligatoire : Archivage	Archivage	METIER	view_archives	LIVREE	Un dossier ne peut être restauré qu’une fois, et la restauration est tracée.	2026-10-05 10:24:41	2026-10-05 10:24:41
446	OBLIGATOIRE	121	OBLIGATOIRE	Journal des actions	Fonctionnalité obligatoire : Audit	Audit	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
447	OBLIGATOIRE	122	OBLIGATOIRE	Date et heure exactes	Fonctionnalité obligatoire : Audit	Audit	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
448	OBLIGATOIRE	123	OBLIGATOIRE	Agent responsable	Fonctionnalité obligatoire : Audit	Audit	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
449	OBLIGATOIRE	124	OBLIGATOIRE	Historique par dossier	Fonctionnalité obligatoire : Audit	Audit	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
450	OBLIGATOIRE	125	OBLIGATOIRE	Ancienne et nouvelle valeur	Fonctionnalité obligatoire : Audit	Audit	METIER	view_journal	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
451	OBLIGATOIRE	126	OBLIGATOIRE	Gestion des utilisateurs	Fonctionnalité obligatoire : Administration	Administration	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
452	OBLIGATOIRE	127	OBLIGATOIRE	Gestion des rôles	Fonctionnalité obligatoire : Administration	Administration	METIER	manage_roles	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
453	OBLIGATOIRE	128	OBLIGATOIRE	Gestion des permissions	Fonctionnalité obligatoire : Administration	Administration	METIER	manage_roles	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
454	OBLIGATOIRE	129	OBLIGATOIRE	Consultation des logs	Fonctionnalité obligatoire : Administration	Administration	METIER	view_audit	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
455	OBLIGATOIRE	130	OBLIGATOIRE	Consultation de l’audit	Fonctionnalité obligatoire : Administration	Administration	METIER	view_audit	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
456	OBLIGATOIRE	131	OBLIGATOIRE	Sauvegardes	Fonctionnalité obligatoire : Administration	Administration	METIER	system_config	LIVREE	L’API est complète et testée : 47 tables sur 47, pièces jointes comprises. L’écran n’existe pas encore.	2026-10-05 10:24:41	2026-10-05 10:24:41
457	OBLIGATOIRE	132	OBLIGATOIRE	Monitoring	Fonctionnalité obligatoire : Administration	Administration	METIER	\N	PARTIELLE	La performance du service est mesurée (écran Performance : délais, dossiers en retard, répartition par division et par agent). La supervision de la machine — processeur, mémoire, disque — a été retirée : elle relève de l’infrastructure et non de la gestion des dossiers.	2026-10-05 10:24:41	2026-10-22 10:05:08
458	OBLIGATOIRE	133	OBLIGATOIRE	Division Visa — gérer l’intégration	Fonctionnalité obligatoire : Divisions	Divisions	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
459	OBLIGATOIRE	134	OBLIGATOIRE	Division Visa — renouvellement de contrat	Fonctionnalité obligatoire : Divisions	Divisions	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
460	OBLIGATOIRE	135	OBLIGATOIRE	Division Visa — avancement de classe	Fonctionnalité obligatoire : Divisions	Divisions	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
461	OBLIGATOIRE	136	OBLIGATOIRE	Division Visa — vérifier les dossiers	Fonctionnalité obligatoire : Divisions	Divisions	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
462	OBLIGATOIRE	137	OBLIGATOIRE	Division Visa — archiver après signature	Fonctionnalité obligatoire : Divisions	Divisions	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
463	OBLIGATOIRE	138	OBLIGATOIRE	Division Solde — traiter les salaires	Fonctionnalité obligatoire : Divisions	Divisions	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
464	OBLIGATOIRE	139	OBLIGATOIRE	Division Solde — gérer le mandatement	Fonctionnalité obligatoire : Divisions	Divisions	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
465	OBLIGATOIRE	140	OBLIGATOIRE	Division Solde — vérifier les certificats de cessation	Fonctionnalité obligatoire : Divisions	Divisions	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
466	OBLIGATOIRE	141	OBLIGATOIRE	Division Solde — vérifier les décomptes d’avance	Fonctionnalité obligatoire : Divisions	Divisions	METIER	controler_decomptes	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
469	OBLIGATOIRE	144	OBLIGATOIRE	Division Pension — gérer la liquidation	Fonctionnalité obligatoire : Divisions	Divisions	METIER	liquider_pension	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
470	OBLIGATOIRE	145	OBLIGATOIRE	Division Pension — lettres de prescription	Fonctionnalité obligatoire : Divisions	Divisions	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
472	OBLIGATOIRE	147	OBLIGATOIRE	Division Pension — transmettre les derniers arrérages	Fonctionnalité obligatoire : Divisions	Divisions	METIER	gerer_correspondances	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
473	OBLIGATOIRE	148	OBLIGATOIRE	Division Pension — certificats de cessation	Fonctionnalité obligatoire : Divisions	Divisions	METIER	liquider_pension	PARTIELLE	La donnée de cessation est gérée. La production du certificat imprimable n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
474	OBLIGATOIRE	149	OBLIGATOIRE	Division Secours — réceptionner les dossiers du CF	Fonctionnalité obligatoire : Divisions	Divisions	METIER	enregistrer_visa_cf	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
475	OBLIGATOIRE	150	OBLIGATOIRE	Division Secours — préparer le mandatement	Fonctionnalité obligatoire : Divisions	Divisions	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
476	OBLIGATOIRE	151	OBLIGATOIRE	Division Secours — gérer l’ordonnancement	Fonctionnalité obligatoire : Divisions	Divisions	METIER	gerer_ordonnancement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
477	OBLIGATOIRE	152	OBLIGATOIRE	Division Secours — imprimer les huit pièces	Fonctionnalité obligatoire : Divisions	Divisions	METIER	preparer_mandatement	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
478	OBLIGATOIRE	153	OBLIGATOIRE	Division Secours — dépouiller les dossiers	Fonctionnalité obligatoire : Divisions	Divisions	METIER	depouiller_pieces	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
480	OBLIGATOIRE	155	OBLIGATOIRE	Chef de Service — valider les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	valider_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
481	OBLIGATOIRE	156	OBLIGATOIRE	Chef de Service — signer les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	signer_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
482	OBLIGATOIRE	157	OBLIGATOIRE	Chef de Service — clôturer les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	cloturer_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
483	OBLIGATOIRE	158	OBLIGATOIRE	Chef de Service — archiver les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
484	OBLIGATOIRE	159	OBLIGATOIRE	Chef de Service — superviser les divisions	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	view_all_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
485	OBLIGATOIRE	160	OBLIGATOIRE	Secrétaire — réceptionner les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
486	OBLIGATOIRE	161	OBLIGATOIRE	Secrétaire — créer les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
487	OBLIGATOIRE	162	OBLIGATOIRE	Secrétaire — enregistrer les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	create_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
488	OBLIGATOIRE	163	OBLIGATOIRE	Secrétaire — orienter les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	orienter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
490	OBLIGATOIRE	165	OBLIGATOIRE	Chef BAAF — gérer les documents comptables	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	manage_documents	PARTIELLE	Le dépôt et l’archivage des documents fonctionnent. L’analyse des pièces comptables elle-même n’existe pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
491	OBLIGATOIRE	166	OBLIGATOIRE	Chef BAAF — saisir sur SIIGFP	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	\N	HORS_PLATEFORME	SIIGFP est un système financier externe du Ministère. La plateforme prépare les données, elle n’y écrit pas.	2026-10-05 10:24:41	2026-10-05 10:24:41
492	OBLIGATOIRE	167	OBLIGATOIRE	Chef BAAF — saisir sur SIIGMP	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	\N	HORS_PLATEFORME	SIIGMP est un système externe. Même limite que pour SIIGFP.	2026-10-05 10:24:41	2026-10-05 10:24:41
493	OBLIGATOIRE	168	OBLIGATOIRE	Chef BAAF — produire les situations FCC/BCSE	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	\N	NON_CONSTRUITE	La nomenclature FCC/BCSE n’est décrite nulle part. Un état produit sans elle ne serait conforme à rien.	2026-10-05 10:24:41	2026-10-05 10:24:41
494	OBLIGATOIRE	169	OBLIGATOIRE	Chef BAAF — gérer le personnel	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	manage_personnel	PARTIELLE	La gestion des agents existe. Congés et permissions non : le droit du travail malgache n’est pas documenté et les droits ne peuvent pas être inventés.	2026-10-05 10:24:41	2026-10-05 10:24:41
499	OBLIGATOIRE	174	OBLIGATOIRE	Coordonnatrice — préparer les rapports	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	consolidate_reports	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
500	OBLIGATOIRE	175	OBLIGATOIRE	Chefs de Division — affecter les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	affecter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
501	OBLIGATOIRE	176	OBLIGATOIRE	Chefs de Division — vérifier les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
502	OBLIGATOIRE	177	OBLIGATOIRE	Chefs de Division — valider les conformes	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	valider_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
503	OBLIGATOIRE	178	OBLIGATOIRE	Chefs de Division — retourner pour correction	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	verifier_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
504	OBLIGATOIRE	179	OBLIGATOIRE	Chefs de Division — produire les rapports	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	view_stats	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
505	OBLIGATOIRE	180	OBLIGATOIRE	Agents — consulter mes dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	view_assigned_dossiers	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
506	OBLIGATOIRE	181	OBLIGATOIRE	Agents — traiter les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
507	OBLIGATOIRE	182	OBLIGATOIRE	Agents — soumettre à vérification	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	soumettre_verification	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
508	OBLIGATOIRE	183	OBLIGATOIRE	Agents — corriger les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	traiter_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
509	OBLIGATOIRE	184	OBLIGATOIRE	Agents — archiver les dossiers	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	archiver_dossier	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
510	OBLIGATOIRE	185	OBLIGATOIRE	Administrateur — gérer les comptes	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	manage_users	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
511	OBLIGATOIRE	186	OBLIGATOIRE	Administrateur — gérer les rôles	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	manage_roles	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
512	OBLIGATOIRE	187	OBLIGATOIRE	Administrateur — consulter les logs	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	view_audit	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
513	OBLIGATOIRE	188	OBLIGATOIRE	Administrateur — lancer les sauvegardes	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	system_config	LIVREE	\N	2026-10-05 10:24:41	2026-10-05 10:24:41
514	OBLIGATOIRE	189	OBLIGATOIRE	Administrateur — surveiller les performances	Fonctionnalité obligatoire : Par rôle	Par rôle	METIER	\N	LIVREE	L’administrateur dispose de l’écran Performance : indicateurs de traitement, dossiers en retard, répartition par division et par agent, évolution sur douze mois. Tous les chiffres sont restreints au périmètre de chacun.	2026-10-05 10:24:41	2026-10-22 10:05:08
\.


--
-- Data for Name: referentiel_postes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referentiel_postes (id, code, libelle, role_nom, niveau, actif, created_at) FROM stdin;
1	MINISTERE	Ministère de l’Économie et des Finances	\N	0	1	2026-10-05 10:24:41
2	DGB	Direction Générale du Budget et des Finances	\N	1	1	2026-10-05 10:24:41
3	DSP	Direction de la Solde et des Pensions	\N	2	1	2026-10-05 10:24:41
4	CHEF_SERVICE	Chef de Service	CHEF_SERVICE	1	1	2026-10-05 10:24:41
5	CHEF_BAAF	Chef BAAF	CHEF_BAAF	2	1	2026-10-05 10:24:41
6	COORDONNATRICE	Coordonnatrice	COORDINATRICE	2	1	2026-10-05 10:24:41
7	SECRETARIAT	Secrétariat	SECRETAIRE	3	1	2026-10-05 10:24:41
8	CHEF_DIV_VISA	Chef de Division Visas	CHEF_DIVISION_VISA	2	1	2026-10-05 10:24:41
9	CHEF_DIV_SOLDE	Chef de Division Solde	CHEF_DIVISION_SOLDE	2	1	2026-10-05 10:24:41
10	CHEF_DIV_PENSION	Chef de Division Pensions	CHEF_DIVISION_PENSION	2	1	2026-10-05 10:24:41
11	CHEF_DIV_SECOURS	Chef de Division Secours	CHEF_DIVISION_SECOURS	2	1	2026-10-05 10:24:41
12	VERIF_VISA	Vérificateurs Visas	VERIFICATEUR_VISA	3	1	2026-10-05 10:24:41
13	VERIF_SOLDE	Vérificateurs Solde	VERIFICATEUR_SOLDE	3	1	2026-10-05 10:24:41
14	LIQUIDATEUR	Liquidateurs Pensions	LIQUIDATEUR_PENSION	3	1	2026-10-05 10:24:41
15	CHARGE_SECOURS	Chargés de Secours	CHARGE_SECOURS	3	1	2026-10-05 10:24:41
16	ACCUEIL	Accueil	\N	3	1	2026-10-05 10:24:41
17	SUIVI_COURRIERS	Suivi des courriers	\N	3	1	2026-10-05 10:24:41
18	OBLIGATOIRE	Fonctionnalités obligatoires du projet	\N	9	1	2026-10-05 10:24:41
\.


--
-- Data for Name: referentiel_service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referentiel_service (id, cle, libelle, valeur, categorie, ordre) FROM stdin;
1	DENOMINATION	Dénomination	Service Régional de la Solde et des Pensions	IDENTITE	10
2	ACRONYME	Acronyme	SRSP	IDENTITE	20
3	SIGLE_LOGO	Logo	DSP — Direction de la Solde et des Pensions	IDENTITE	30
4	FORME_JURIDIQUE	Forme juridique	Entité gouvernementale relevant de l’administration publique	IDENTITE	40
5	SIEGE_CENTRAL	Siège central	Immeuble Antaninarenina, Antananarivo	COORDONNEES	50
6	SIEGE_SUCCURSALE	Siège succursale	Ambodiaplay, Manakara	COORDONNEES	60
7	TELEPHONES	Téléphones	+261 32 11 090 10 / +261 32 25 469 11	COORDONNEES	70
8	EMAIL	Email	srsp.fitovinany@dgfag.mg	COORDONNEES	80
9	RATTACHEMENT	Rattachement	Ministère de l’Économie et des Finances → Direction Générale du Trésor → Direction de la Solde et des Pensions	IDENTITE	90
10	DATE_CREATION	Établissement	22 septembre 2011	HISTORIQUE	100
11	REGION_ORIGINE	Région d’origine	Vatovavy Fitovinany	HISTORIQUE	110
12	PROVINCE	Province de rattachement	Fianarantsoa	HISTORIQUE	120
13	SCISSION_2022	Scission de 2022	La région Vatovavy et Fitovinany devient deux entités distinctes ; le SRSP est divisé en antennes Mananjary et Manakara	HISTORIQUE	130
14	REGIONS_MALGACHES	Régions de Madagascar	23 depuis 2022	HISTORIQUE	140
15	OBJECTIF_SOLDE	Objectif 1	Calculer et payer les salaires des fonctionnaires et employés du secteur public relevant de sa compétence territoriale	OBJECTIFS	150
16	OBJECTIF_PENSION	Objectif 2	Gérer les pensions de retraite des fonctionnaires	OBJECTIFS	160
17	OBJECTIF_CONFORMITE	Objectif 3	Veiller à la conformité des versements au regard de la réglementation en vigueur et des conventions collectives applicables	OBJECTIFS	170
18	EFFECTIF_2011	Effectif à la création	6 membres	EFFECTIFS	180
19	EFFECTIF_ACTUEL	Effectif actuel	21 membres	EFFECTIFS	190
\.


--
-- Data for Name: reinitialisations_mot_de_passe; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reinitialisations_mot_de_passe (id, user_id, identifiant_saisi, statut, empreinte, code_genere_par, code_genere_le, expire_le, tentatives, utilise_le, motif, ip_address, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
1	22
1	23
1	24
1	25
1	26
1	30
1	83
1	84
1	178
1	179
1	182
1	183
1	186
2	5
2	6
2	8
2	9
2	10
2	11
2	12
2	13
2	21
2	23
2	24
2	25
2	26
2	177
2	185
2	186
3	13
3	18
3	21
3	22
3	23
3	24
3	26
3	83
3	184
3	186
4	2
4	13
4	23
4	24
4	26
4	183
4	184
4	186
5	1
5	2
5	4
5	13
5	21
5	23
6	5
6	8
6	9
6	13
6	23
6	24
6	37
6	180
6	181
6	184
6	186
7	6
7	7
7	12
7	14
7	23
7	37
7	83
7	180
8	5
8	8
8	9
8	13
8	23
8	24
8	27
8	34
8	35
8	180
8	181
8	184
8	186
9	6
9	7
9	14
9	23
9	30
9	34
9	37
9	180
10	5
10	8
10	9
10	13
10	23
10	24
10	30
10	32
10	180
10	181
10	184
10	186
11	6
11	7
11	14
11	23
11	30
11	32
11	35
11	37
11	180
12	5
12	8
12	13
12	23
12	24
12	34
12	35
12	36
12	88
12	89
12	91
12	92
12	180
12	181
12	184
12	186
13	6
13	7
13	14
13	23
13	37
13	90
13	92
13	180
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, nom, description, created_at, updated_at) FROM stdin;
1	ADMIN	Administrateur système du SRSP	2026-10-05 10:24:40	2026-10-05 10:24:40
2	CHEF_SERVICE	Chef de Service SRSP – supervision, validation et signature finale	2026-10-05 10:24:40	2026-10-05 10:24:40
3	CHEF_BAAF	Chef BAAF – documents comptables, rapports, secrétariat	2026-10-05 10:24:40	2026-10-05 10:24:40
4	COORDINATRICE	Coordonnatrice – immatriculation, insertions Augure, changements de paiement	2026-10-05 10:24:40	2026-10-05 10:24:40
5	SECRETAIRE	Secrétaire – réception, enregistrement, distribution et chronologie	2026-10-05 10:24:40	2026-10-05 10:24:40
6	CHEF_DIVISION_VISA	Chef Division Visa – supervision, vérification et rapports Visa	2026-10-05 10:24:40	2026-10-05 10:24:40
7	VERIFICATEUR_VISA	Vérificateur de la Division Visa – exploitation, vérification, archivage	2026-10-05 10:24:40	2026-10-05 10:24:40
8	CHEF_DIVISION_SOLDE	Chef Division Solde – supervision du mandatement, contrôles, bons de caisse	2026-10-05 10:24:40	2026-10-05 10:24:40
9	VERIFICATEUR_SOLDE	Vérificateur de la Division Solde – exploitation, fiches de contrôle, mandatement	2026-10-05 10:24:40	2026-10-05 10:24:40
10	CHEF_DIVISION_PENSION	Chef Division Pension – supervision de la liquidation, vérification	2026-10-05 10:24:40	2026-10-05 10:24:40
11	LIQUIDATEUR_PENSION	Liquidateur de la Division Pension – liquidation, secours, dossiers mères, certificats	2026-10-05 10:24:40	2026-10-05 10:24:40
12	CHEF_DIVISION_SECOURS	Chef Division Secours – réception, préparation, mandatement, ordonnancement	2026-10-05 10:24:40	2026-10-05 10:24:40
13	CHARGE_SECOURS	Chargé de la Division Secours – traitement, dépouillement, archivage des pièces	2026-10-05 10:24:40	2026-10-05 10:24:40
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schema_migrations (id, version, fichier, sha256, lignes, applique_le) FROM stdin;
1	1	001_create_roles.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
2	2	002_create_users.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
3	3	003_create_permissions.sql	5206c54c607f5be0d234d83791175844f9f81e790003531e0769872a1f348251	8	2026-10-05 10:24:40
4	4	004_create_role_permissions.sql	748e49a58ee5c632fb1c19c758a6d1a90d9553ff52d95a2f11e6d822f06a004a	9	2026-10-05 10:24:40
5	5	005_create_divisions.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
6	6	006_create_fonctions.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
7	7	007_create_agents.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
8	8	008_create_types_dossiers.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
9	9	009_create_statuts_dossiers.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
10	10	010_create_priorites.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
11	11	011_create_dossiers.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
12	12	012_create_documents.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
13	13	013_create_courriers.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
14	14	014_create_notifications.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
15	15	015_create_historique.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
16	16	016_create_archives.sql	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	1	2026-10-05 10:24:40
17	17	017_rbac_cahier_v2.sql	2dfeb888875bc6ebfaba614f960e0c596ee62985f8f7abebd422f8c0874b7438	167	2026-10-05 10:24:40
18	18	018_securite_audit_ip.sql	e97245c56de6817762a0053143a081adc1860698bf4754ae14a42a838c972fc7	16	2026-10-05 10:24:40
19	19	019_perimetre_agents.sql	4975ce7ff33c7501e49c344ca4e5aa8a2b37825cf90492898dfde268f79c352e	18	2026-10-05 10:24:40
20	20	020_depouillement.sql	172e083e060b5fe168039b7439adaee99ed79bdd7549b5fbe95e73d6ad7b0fc1	43	2026-10-05 10:24:40
21	21	021_calculs_financiers.sql	d381fdc9c308c21dd6deeb7274312d33ab39a38e9b0a782ff8010be8131c8cdd	75	2026-10-05 10:24:40
22	22	022_officiel_mandatement_correspondances.sql	3665fca76e8628bee9bb0b11e99b7b2013e9ab37739c5b8360a55665cb35d3f2	127	2026-10-05 10:24:40
23	23	023_division_type_dossier.sql	f3fee98ae8abff7afa09045b2aecee235f06145b2c9a7fb177722aba5b788f7c	42	2026-10-05 10:24:40
24	24	024_notifications_personnelles.sql	e2dcfeaf34592468eb4ec5579fef3cb329fcc6a5bdecdc632df7ab20ff712480	54	2026-10-05 10:24:40
25	25	025_notifications_backfill.sql	8a14b2d15e7a100742042db76cf37f8e417ac5e234edfdac3f17d61d5fb764de	43	2026-10-05 10:24:40
26	26	026_securite_urgences_commentaires.sql	f65d8cb2cd32cafb8860fdd61dbc2f83e5f03bdfd7a5c1dc4965dccb41cab2e6	62	2026-10-05 10:24:41
27	27	027_libelles_types_dossiers.sql	9fe24f7291df90d2a8759046ba3ffbc239714be97141fbf162000af3449cd5b0	20	2026-10-05 10:24:41
28	28	028_controle_decompte_chef_service.sql	d52e7e55a208a31e60f908ea77ef950219d9c2ec99d18a918addd1a021aebbaf	28	2026-10-05 10:24:41
29	29	029_responsabilites_par_role.sql	b60a35e2f67c839061f1cfbbc5531ba6af1e5f7f43f2de9c1190e5e29b3b1195	56	2026-10-05 10:24:41
30	30	030_notifications_dossier_integrite.sql	7b37510416f9fd24ddb99e120b82755b1a38a7f860f4f0468c4aa93622335444	28	2026-10-05 10:24:41
31	31	031_consultation_archives.sql	6be0cdd292fe54ae570618685a96bf818a41b4f123d66e57f0c2f4ded6bc929a	32	2026-10-05 10:24:41
32	32	032_unicite_archive_par_dossier.sql	cb7adffd452a5c110723a195e45ff44c053e0147603077669c6f5dc2a0d41944	50	2026-10-05 10:24:41
33	33	033_consultation_journal.sql	04bbc89b16518890a10db64e674b4e348a6beb606b41812df363c43538720f6b	43	2026-10-05 10:24:41
34	34	034_gestion_administrative.sql	d3bb2013e0e5f3f4d991aa55c15ce85c6c914b6728df7afa607583e3b1fceeaa	153	2026-10-05 10:24:41
35	34	034_identification_demandeur.sql	0b59da7bf27797d3f21e36dfa8072b153df408120f6b99ca94b926829e861d18	79	2026-10-05 10:24:41
36	35	035_pieces_deplacement.sql	e1dd92044cc1e3331a1339fe793dd338db509c8db4b7ae36a058a3fa83b652a0	116	2026-10-05 10:24:41
37	36	036_permissions_baaf.sql	ed3831cd1823e90bb9e96a5b98c1c57e9f9921eeaeaeddc5f30378c67784188b	47	2026-10-05 10:24:41
38	37	037_secours_cf_emargement.sql	f25892ecf8efc7d92597ef702a52bcc4c0488eae9f9f7e298b494cdd8d044838	157	2026-10-05 10:24:41
39	38	038_permissions_secours.sql	469ae32080745c37443befd452f8c56f4c19aa37c315061567724ee4eef222aa	46	2026-10-05 10:24:41
40	39	039_signature_mandatement.sql	e22ef1d381ae8b1e65634c60f15ee60f52492cceed5f30766a797764bc9a6213	45	2026-10-05 10:24:41
41	40	040_compteurs_numerotation.sql	5610b266b735f75da743bbc0589407302e28f5559c8e91e173ddde2a10103f11	65	2026-10-05 10:24:41
42	41	041_cles_etrangeres_manquantes.sql	730b1cbb99518101fcaff4f99af417f946ac34c70c7632316d404350cd477fb1	48	2026-10-05 10:24:41
43	42	042_perimetre_geographique.sql	59bb09113eff716b3dda5f76c01b78bd3371c17353e619ab103cccd14509e55d	120	2026-10-05 10:24:41
44	43	043_referentiel_fonctionnalites.sql	392f114628b7a2d08b8e38b6df2a7665cd58c8aa77798846a6429463e1b88988	208	2026-10-05 10:24:41
45	44	044_referentiel_contenu.sql	b3a8e96511ced1fb59219f19e2440a1a4e00f604c53775c62216228ac00153d8	236	2026-10-05 10:24:41
46	45	045_referentiel_contenu_2.sql	dcee9329a92f763268fe7f20fb41127de5f14c09a44475298773002d8ef0673b	342	2026-10-05 10:24:41
47	46	046_fonctionnalites_obligatoires.sql	00a7d894a6f3f58d9e361785e73cd5e0339c11fd8063f6c95f6ce2622ac12cbc	375	2026-10-05 10:24:41
48	47	047_chronologie_actes.sql	b4893dc9d7c8f513d3db722cc29c44a19578c51628e47c39725b7939879f8eeb	118	2026-10-05 10:24:42
\.


--
-- Data for Name: schemas_operations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schemas_operations (id, sous_type_id, cle, libelle, type_champ, requis, options, aide, ordre, created_at) FROM stdin;
1	16	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:23
2	16	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:23
3	16	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:23
4	16	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:23
5	16	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:23
6	16	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:23
7	16	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:23
8	16	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:23
9	16	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:23
10	16	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:23
11	16	numero_mandat	Numéro du mandat	texte	1	\N	\N	110	2026-10-21 11:19:23
12	16	mode_reglement	Mode de règlement	choix	1	Virement|Espèces|Chèque	\N	120	2026-10-21 11:19:23
13	16	date_mandat	Date du mandat	date	1	\N	\N	130	2026-10-21 11:19:23
14	16	service_destinataire	Service destinataire	texte	0	\N	\N	140	2026-10-21 11:19:23
15	17	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:23
16	17	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:23
17	17	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:23
18	17	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:23
19	17	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:23
20	17	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:23
21	17	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:23
22	17	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:23
23	17	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:23
24	17	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:23
25	17	date_controle	Date de contrôle	date	1	\N	\N	110	2026-10-21 11:19:23
26	17	resultat_controle	Résultat du contrôle	choix	1	Conforme|Non conforme|À revoir	\N	120	2026-10-21 11:19:23
27	17	version_produite	Version produite	texte	0	\N	La version de la fiche, telle qu’elle a été produite	130	2026-10-21 11:19:23
28	18	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:23
29	18	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:23
30	18	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:23
31	18	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:23
32	18	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:23
33	18	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:23
34	18	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:23
35	18	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:23
36	18	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:23
37	18	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:23
38	18	emplacement_dossier	Emplacement de conservation	texte	0	\N	\N	110	2026-10-21 11:19:23
39	18	date_archivage_dossier	Date d’archivage	date	0	\N	\N	120	2026-10-21 11:19:23
40	18	mouvements	Mouvements enregistrés	textarea	0	\N	Les mouvements du dossier permanent, selon la procédure validée	130	2026-10-21 11:19:23
41	19	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:23
42	19	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:23
43	19	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:23
44	19	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:23
45	19	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:23
46	19	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:23
47	19	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:23
48	19	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:23
49	19	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
50	19	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
51	19	localite_origine	Localité d’origine	texte	1	\N	\N	110	2026-10-21 11:19:24
52	19	localite_destination	Localité de destination	texte	1	\N	\N	120	2026-10-21 11:19:24
53	19	date_transfert	Date du transfert	date	1	\N	\N	130	2026-10-21 11:19:24
54	19	suivi_transfert	État du suivi	choix	0	Initié|Transmis|Reçu	\N	140	2026-10-21 11:19:24
55	20	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
56	20	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
57	20	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
58	20	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
59	20	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
60	20	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
61	20	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
62	20	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
63	20	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
64	20	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
65	20	duree_mois	Durée (mois)	nombre	1	\N	\N	110	2026-10-21 11:19:24
66	20	mois_rembourses	Mois remboursés	nombre	0	\N	\N	120	2026-10-21 11:19:24
67	20	taux_retenue	Taux de retenue (%)	nombre	0	\N	Le taux appliqué, tel que retenu par l’agent habilité	130	2026-10-21 11:19:24
68	20	decompte_valide	Décompte validé (Ar)	nombre	1	\N	Le décompte, tel qu’il a été calculé ou validé par l’agent habilité	140	2026-10-21 11:19:24
69	21	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
70	21	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
71	21	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
72	21	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
73	21	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
74	21	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
75	21	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
76	21	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
77	21	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
78	21	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
79	21	references_decompte	Références de l’état de décompte	texte	1	\N	\N	110	2026-10-21 11:19:24
80	21	bons_caisse	Bons de caisse adressés	texte	0	\N	\N	120	2026-10-21 11:19:24
81	21	etat_suivi	État du suivi	choix	0	À établir|Transmis|Encaissé	\N	130	2026-10-21 11:19:24
82	22	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
83	22	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
84	22	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
85	22	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
86	22	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
87	22	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
88	22	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
89	22	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
90	22	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
91	22	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
92	22	numero_demande	Numéro de la demande	texte	1	\N	\N	110	2026-10-21 11:19:24
93	22	date_demande	Date de la demande	date	1	\N	\N	120	2026-10-21 11:19:24
94	22	date_controle_certificat	Date du contrôle réalisé	date	0	\N	\N	130	2026-10-21 11:19:24
95	22	date_transmission_certificat	Date de transmission	date	0	\N	\N	140	2026-10-21 11:19:24
96	23	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
97	23	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
98	23	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
99	23	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
100	23	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
101	23	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
102	23	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
103	23	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
104	23	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
105	23	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
106	23	reference_bon	Référence du bon	texte	1	\N	\N	110	2026-10-21 11:19:24
107	23	date_emission_bon	Date d’émission	date	1	\N	\N	120	2026-10-21 11:19:24
108	23	etape_controle_bon	Étape de contrôle	choix	1	À contrôler|Contrôlé|Vu bon à payer	\N	130	2026-10-21 11:19:24
109	23	signataire_bon	Signataire	texte	0	\N	\N	140	2026-10-21 11:19:24
110	23	date_signature_bon	Date de signature	date	0	\N	\N	150	2026-10-21 11:19:24
111	23	motif_retour_bon	Motif du retour	texte	0	\N	\N	160	2026-10-21 11:19:24
112	24	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
113	24	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
114	24	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
115	24	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
116	24	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
117	24	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
118	24	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
119	24	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
120	24	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
121	24	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
122	24	reference_domiciliation	Référence de la demande	texte	1	\N	\N	110	2026-10-21 11:19:24
123	24	date_domiciliation	Date de la demande	date	1	\N	\N	120	2026-10-21 11:19:24
124	24	etat_domiciliation	État du traitement	choix	0	Reçue|Instruite|Classée	\N	130	2026-10-21 11:19:24
125	24	date_classement	Date de classement	date	0	\N	\N	140	2026-10-21 11:19:24
126	25	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
127	25	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
128	25	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
129	25	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
130	25	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
131	25	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
132	25	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
133	25	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
134	25	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
135	25	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
136	25	annees_service	Années de service	nombre	1	\N	\N	110	2026-10-21 11:19:24
137	25	indice_final	Indice final	nombre	0	\N	\N	120	2026-10-21 11:19:24
138	25	pension_brute	Pension brute (Ar)	nombre	0	\N	\N	130	2026-10-21 11:19:24
139	25	retenues	Retenues (Ar)	nombre	0	\N	\N	140	2026-10-21 11:19:24
140	25	date_calcul	Date du calcul	date	1	\N	\N	150	2026-10-21 11:19:24
141	26	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
142	26	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
143	26	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
144	26	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
145	26	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
146	26	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
147	26	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
148	26	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
149	26	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
150	26	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
151	26	emplacement_dossier	Emplacement de conservation	texte	0	\N	\N	110	2026-10-21 11:19:24
152	26	date_archivage_dossier	Date d’archivage	date	0	\N	\N	120	2026-10-21 11:19:24
153	27	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
154	27	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
155	27	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
156	27	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
157	27	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
158	27	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
159	27	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
160	27	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
161	27	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
162	27	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
163	27	type_lettre	Type de lettre	choix	1	Prescription|Notification|Information	\N	110	2026-10-21 11:19:24
164	27	objet_lettre	Objet	texte	1	\N	\N	120	2026-10-21 11:19:24
165	27	date_lettre	Date de la lettre	date	1	\N	\N	130	2026-10-21 11:19:24
166	28	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
167	28	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
168	28	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
169	28	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
170	28	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
171	28	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
172	28	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
173	28	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
174	28	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
175	28	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
176	28	objet_demande_mere	Objet de la demande	texte	1	\N	\N	110	2026-10-21 11:19:24
177	28	date_demande_mere	Date de la demande	date	1	\N	\N	120	2026-10-21 11:19:24
178	28	reponse_demande_mere	Réponse reçue	textarea	0	\N	\N	130	2026-10-21 11:19:24
179	29	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
180	29	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
181	29	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
182	29	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
183	29	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
184	29	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
185	29	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
186	29	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
187	29	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
188	29	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
189	29	type_opposition	Type d’opposition	choix	1	Pension alimentaire|Cession volontaire|Saisie-arrêt	\N	110	2026-10-21 11:19:24
190	29	reference_opposition	Référence de l’opposition	texte	1	\N	\N	120	2026-10-21 11:19:24
191	29	date_signification	Date de signification	date	0	\N	\N	130	2026-10-21 11:19:24
192	29	destinataire_central	Destinataire central	texte	0	\N	\N	140	2026-10-21 11:19:24
193	29	reference_bordereau_central	Référence du bordereau	texte	0	\N	\N	150	2026-10-21 11:19:24
194	30	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
195	30	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
196	30	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
197	30	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
198	30	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
199	30	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
200	30	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
201	30	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
202	30	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
203	30	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
204	30	references_arrerages	Références des arrérages	texte	1	\N	\N	110	2026-10-21 11:19:24
205	30	date_transmission_central	Date de transmission centrale	date	0	\N	\N	120	2026-10-21 11:19:24
206	30	destinataire_central	Destinataire central	texte	0	\N	\N	130	2026-10-21 11:19:24
207	30	reference_bordereau_central	Référence du bordereau	texte	0	\N	\N	140	2026-10-21 11:19:24
208	31	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
209	31	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
210	31	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
211	31	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
212	31	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
213	31	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
214	31	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
215	31	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
216	31	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
217	31	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
218	31	reference_bon_retour	Référence du bon	texte	1	\N	\N	110	2026-10-21 11:19:24
219	31	date_retour_bon	Date de retour	date	1	\N	\N	120	2026-10-21 11:19:24
220	31	motif_retour	Motif du retour	texte	1	\N	\N	130	2026-10-21 11:19:24
221	31	suite_donnee	Suite donnée	textarea	0	\N	\N	140	2026-10-21 11:19:24
222	32	reference_externe	Référence externe	texte	0	\N	La référence de l’opération : bon, mandat, opposition…	10	2026-10-21 11:19:24
223	32	reference_dossier_mere	Référence du dossier mère	texte	0	\N	Le dossier permanent de l’agent, s’il en existe un	20	2026-10-21 11:19:24
224	32	matricule	Matricule	texte	0	\N	\N	30	2026-10-21 11:19:24
225	32	periode	Période concernée	texte	0	\N	\N	40	2026-10-21 11:19:24
226	32	montant	Montant (Ar)	nombre	0	\N	Saisi, jamais calculé	50	2026-10-21 11:19:24
227	32	source_montant	Source du montant	texte	0	\N	D’où vient la somme : un relevé, une décision, un barème	60	2026-10-21 11:19:24
228	32	date_reference	Date de référence	date	0	\N	\N	70	2026-10-21 11:19:24
229	32	destinataire	Destinataire	texte	0	\N	\N	80	2026-10-21 11:19:24
230	32	localisation	Localité	texte	0	\N	\N	90	2026-10-21 11:19:24
231	32	observation	Observation	textarea	0	\N	\N	100	2026-10-21 11:19:24
232	32	numero_demande	Numéro de la demande	texte	1	\N	\N	110	2026-10-21 11:19:24
233	32	date_demande	Date de la demande	date	1	\N	\N	120	2026-10-21 11:19:24
234	32	date_controle_certificat	Date du contrôle réalisé	date	0	\N	\N	130	2026-10-21 11:19:24
235	32	date_transmission_certificat	Date de transmission	date	0	\N	\N	140	2026-10-21 11:19:24
\.


--
-- Data for Name: signalements_dossier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signalements_dossier (id, dossier_id, division_id, signale_par, type, priorite, motif, statut, traite_par, resolution, date_prise_en_charge, date_resolution, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: signatures_ordonnateur; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signatures_ordonnateur (id, mandatement_id, reference_signature, signe_par, signe_le, archive_le, observations, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sous_types_dossiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sous_types_dossiers (id, type_dossier_id, code, libelle, actif, ordre, created_at) FROM stdin;
1	1	VISA_MARIAGE	Visa de mariage	1	10	2026-10-20 16:01:39
2	1	VISA_NAISSANCE	Visa de naissance	1	20	2026-10-20 16:01:39
3	1	VISA_DECES	Visa de décès	1	30	2026-10-20 16:01:39
4	1	VISA_SEJOUR	Visa de séjour	1	40	2026-10-20 16:01:39
5	1	VISA_AUTRE	Autre acte à viser	1	90	2026-10-20 16:01:39
16	2	SOLDE_MANDATEMENT	Mandatement	1	10	2026-10-21 09:57:35
17	2	SOLDE_FICHE_CONTROLE	Fiche de contrôle de solde	1	20	2026-10-21 09:57:35
18	2	SOLDE_DOSSIERE_MERE	Dossier mère	1	30	2026-10-21 09:57:35
19	2	SOLDE_TRANSFERT_LOCALITE	Transfert de localité	1	40	2026-10-21 09:57:35
20	2	SOLDE_AVANCE	Avance de solde	1	50	2026-10-21 09:57:35
21	2	SOLDE_TROP_PERCU	Trop-perçu	1	60	2026-10-21 09:57:35
22	2	SOLDE_CERTIFICAT_CESSATION	Certificat de cessation de paiement	1	70	2026-10-21 09:57:35
23	2	SOLDE_BON_CAISSE	Bon de caisse	1	80	2026-10-21 09:57:35
24	2	SOLDE_DOMICILIATION	Domiciliation irrévocable de salaire	1	90	2026-10-21 09:57:35
25	3	PENSION_LIQUIDATION	Liquidation de pension	1	10	2026-10-21 09:57:35
26	3	PENSION_DOSSIERE_MERE	Dossier mère pension	1	20	2026-10-21 09:57:35
27	3	PENSION_LETTRE_PRESCRIPTION	Lettre de prescription	1	30	2026-10-21 09:57:35
28	3	PENSION_DEMANDE_DOSSIERE_MERE	Demande de dossier mère	1	40	2026-10-21 09:57:35
29	3	PENSION_OPPOSITION	Opposition sur pension	1	50	2026-10-21 09:57:35
30	3	PENSION_DERNIERS_ARRERAGES	Derniers arrérages	1	60	2026-10-21 09:57:35
31	3	PENSION_BON_CAISSE_RETOUR	Bon de caisse en retour	1	70	2026-10-21 09:57:35
32	3	PENSION_CERTIFICAT_CESSATION	Certificat de cessation de paiement	1	80	2026-10-21 09:57:35
\.


--
-- Data for Name: statuts_dossiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.statuts_dossiers (id, code, libelle, ordre) FROM stdin;
1	RECU	Reçu	2
2	ENREGISTRE	Enregistré	3
3	ORIENTE	Orienté	4
4	AFFECTE	Affecté	5
5	EN_TRAITEMENT	En traitement	6
6	SOUMIS_A_VERIFICATION	Soumis à vérification	8
7	CORRECTION_DEMANDEE	Correction demandée	9
8	VALIDE	Validé	10
9	SIGNE	Signé	11
10	CLOTURE	Clôturé	12
11	ARCHIVE	Archivé	13
35	EN_ATTENTE_COMPLEMENT	En attente de complément	7
36	BROUILLON	Brouillon	0
\.


--
-- Data for Name: suppressions_dossiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppressions_dossiers (id, dossier_id, numero, reference_visa, type_code, objet, demandeur, matricule, division_nom, statut_code, agent_nom, date_reception, motif, supprime_par, supprime_par_nom, date_suppression, historique_json, nb_actions_historique) FROM stdin;
\.


--
-- Data for Name: traitements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.traitements (id, dossier_id, agent_id, date_debut, date_fin, observation) FROM stdin;
2	2	1	2026-10-05 08:14:19	2026-10-05 08:14:24	\N
\.


--
-- Data for Name: transferts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transferts (id, dossier_id, ancien_agent_id, nouveau_agent_id, motif, date_transfert) FROM stdin;
\.


--
-- Data for Name: types_courriers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.types_courriers (id, libelle) FROM stdin;
5	CIRCULAIRE
6	DECISION
1	DEMANDE
2	INFORMATION
3	NOTIFICATION
4	RAPPORT
\.


--
-- Data for Name: types_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.types_documents (id, libelle, extensions_autorisees, taille_max) FROM stdin;
1	PIECE_IDENTITE	pdf,jpg,jpeg,png	5242880
2	ACTE_DECES	pdf,jpg,jpeg,png	5242880
3	CERTIFICAT	pdf,jpg,jpeg,png	5242880
4	RAPPORT	pdf,docx,doc	5242880
5	DECOMPTE	xlsx,xls,pdf	5242880
6	BON_CAISSE	pdf,xlsx	5242880
7	AUTRE	pdf,docx,xlsx,jpg,jpeg,png	5242880
\.


--
-- Data for Name: types_dossiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.types_dossiers (id, code, libelle, description, actif) FROM stdin;
1	VISA	Division Visa	Dossiers soumis pour visa et exploitation	1
2	SOLDE	Division Solde	Dossiers de mandatement et avance de solde	1
3	PENSION	Division Pension	Dossiers de liquidation de pension et secours au décès	1
4	SECOURS	Division Secours	Dossiers de secours de décès	1
\.


--
-- Data for Name: types_pieces; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.types_pieces (id, code, libelle, obligatoire, actif, phase, ordre, division_code, type_dossier_id, sous_type_id) FROM stdin;
1	ACTE_DECES	Acte de décès	1	1	ARCHIVAGE	10	SECOURS	4	\N
2	ACTE_MARIAGE	Acte de mariage	1	1	ARCHIVAGE	20	SECOURS	4	\N
3	CERT_NSC	Certificat de NSC	1	1	ARCHIVAGE	30	SECOURS	4	\N
4	CERT_NDIV	Certificat de non-divorce	1	1	ARCHIVAGE	40	SECOURS	4	\N
5	CIN_DEFUNT	CIN du défunt	1	1	ARCHIVAGE	50	SECOURS	4	\N
6	CIN_BENEF	CIN du bénéficiaire	1	1	ARCHIVAGE	60	SECOURS	4	\N
7	DECISION	Décision visée par le contrôle financier	1	1	DEPOUILLEMENT	10	SECOURS	4	\N
8	ETAT_DECOMPTE	État de décompte	1	1	DEPOUILLEMENT	20	SECOURS	4	\N
9	CCETPP	CCETPP	1	1	DEPOUILLEMENT	30	SECOURS	4	\N
10	DEMANDE_INTERESSE	Demande de l'intéressé(e)	1	1	DEPOUILLEMENT	40	SECOURS	4	\N
11	VISA_DEMANDE	Demande de visa	1	1	DEPOUILLEMENT	5	VISAS	1	\N
12	VISA_ACTE_MARIAGE	Acte de mariage	1	1	DEPOUILLEMENT	10	VISAS	1	\N
13	VISA_ACTE_NAISSANCE	Acte de naissance	1	1	DEPOUILLEMENT	20	VISAS	1	\N
14	VISA_CERTIFICAT_MEDICAL	Certificat médical	1	1	DEPOUILLEMENT	30	VISAS	1	\N
15	VISA_DECISION	Décision de visa	1	1	DEPOUILLEMENT	40	VISAS	1	\N
16	VISA_ETAT_SIGNATURE	État de signature	1	1	ARCHIVAGE	10	VISAS	1	\N
17	VISA_PV_RECEPTION	PV de réception	1	1	ARCHIVAGE	20	VISAS	1	\N
18	SOLDE_FICHE_LIQUIDATION	Fiche de liquidation	1	1	DEPOUILLEMENT	10	SOLDE	2	\N
19	SOLDE_DECOMPTE	Décompte de solde	1	1	DEPOUILLEMENT	20	SOLDE	2	\N
20	SOLDE_ETAT_EMARGEMENT	État d'émargement	1	1	DEPOUILLEMENT	30	SOLDE	2	\N
21	SOLDE_CACHET_MANDATEMENT	Cachet de mandatement	1	1	ARCHIVAGE	10	SOLDE	2	\N
22	SOLDE_SIGNATURE_ORDONNATEUR	Signature de l'ordonnateur	1	1	ARCHIVAGE	20	SOLDE	2	\N
23	SOLDE_REF_LOGICIEL	Référence logiciel solde	1	1	ARCHIVAGE	30	SOLDE	2	\N
24	PENSION_DEMANDE	Demande de pension	1	1	DEPOUILLEMENT	10	PENSIONS	3	\N
25	PENSION_ACTE_DECES	Acte de décès	1	1	DEPOUILLEMENT	20	PENSIONS	3	\N
26	PENSION_CERTIF_NON_REMARIAGE	Certificat de non-remariage	1	1	DEPOUILLEMENT	30	PENSIONS	3	\N
27	PENSION_LIQUIDATION	Liquidation de pension	1	1	DEPOUILLEMENT	40	PENSIONS	3	\N
28	PENSION_ETAT_DECOMPTE	État de décompte pension	1	1	ARCHIVAGE	10	PENSIONS	3	\N
29	PENSION_PV_VERIFICATION	PV de vérification	1	1	ARCHIVAGE	20	PENSIONS	3	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password_hash, role_id, actif, derniere_connexion, mot_de_passe_change_le, tentatives_echouees, verrouille_jusqua, created_at, updated_at) FROM stdin;
1	admin	admin@srsp.mg	$2b$10$Gz92O9veiYvVGNzC311z2.oZa3RQKxr7OuvJMdBFtqI497eFpub7m	1	1	2026-10-22 12:01:42	\N	0	\N	2026-10-05 10:24:42	2026-10-22 12:01:42
2	chef.service	chefservice@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	2	1	2026-10-22 12:01:42	\N	0	\N	2026-10-05 10:24:42	2026-10-22 12:01:42
3	chef.baaf	chefbaaf@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	3	1	2026-10-22 11:28:55	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:55
4	coordinatrice	coordinatrice@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	4	1	2026-10-22 11:28:53	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:53
5	secretaire	secretaire@srsp.mg	$2b$10$E7LB9ctqvsWgTnfRvyG3hexah/LK.4rD.80bidKGZHxbYzBgF5TJW	5	1	2026-10-22 12:01:41	2026-10-22 11:03:53.499	0	\N	2026-10-05 10:24:42	2026-10-22 12:01:41
6	chef.visa	chef.visa@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	6	1	2026-10-22 12:01:41	\N	0	\N	2026-10-05 10:24:42	2026-10-22 12:01:41
7	verif.visa	verif.visa@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	7	1	2026-10-22 12:01:42	\N	0	\N	2026-10-05 10:24:42	2026-10-22 12:01:42
8	chef.solde	chef.solde@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	8	1	2026-10-22 12:01:42	\N	0	\N	2026-10-05 10:24:42	2026-10-22 12:01:42
9	verif.solde	verif.solde@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	9	1	2026-10-22 11:28:48	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:48
10	chef.pension	chef.pension@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	10	1	2026-10-22 11:28:48	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:48
11	liquidateur	liquidateur@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	11	1	2026-10-22 11:28:50	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:50
12	chef.secours	chef.secours@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	12	1	2026-10-22 11:28:50	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:50
13	charge.secours	charge.secours@srsp.mg	$2b$10$GJ75FTq6QpCKn7X339wR2Oor1q3OuQZVE7WbMaJhq2ofegF23CgUu	13	1	2026-10-22 11:28:52	\N	0	\N	2026-10-05 10:24:42	2026-10-22 11:28:52
\.


--
-- Data for Name: validations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.validations (id, dossier_id, valide_par, decision, commentaire, date_validation) FROM stdin;
1	2	1	VALIDE	\N	2026-10-05 08:14:30
2	2	1	SIGNE	SRSP	2026-10-05 08:14:38
3	1	1	VALIDE	\N	2026-10-06 06:16:32
4	1	1	SIGNE	SRSP	2026-10-06 06:16:38
\.


--
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verifications (id, dossier_id, agent_id, resultat, observation, date_verification) FROM stdin;
2	2	1	OK	\N	2026-10-05 08:14:24
\.


--
-- Data for Name: visas_controle_financier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visas_controle_financier (id, dossier_id, numero_visa, signe_par, date_visa, commentaire, enregistre_par, created_at) FROM stdin;
\.


--
-- Name: affectations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.affectations_id_seq', 59, true);


--
-- Name: agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agents_id_seq', 13, true);


--
-- Name: antennes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.antennes_id_seq', 2, true);


--
-- Name: archives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.archives_id_seq', 2, true);


--
-- Name: bordereaux_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bordereaux_id_seq', 1, false);


--
-- Name: cachets_mandatement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cachets_mandatement_id_seq', 1, false);


--
-- Name: controles_decompte_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.controles_decompte_id_seq', 1, false);


--
-- Name: correspondances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.correspondances_id_seq', 1, false);


--
-- Name: courriers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courriers_id_seq', 1, false);


--
-- Name: decomptes_avance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.decomptes_avance_id_seq', 1, false);


--
-- Name: delegations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.delegations_id_seq', 1, false);


--
-- Name: depouillements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.depouillements_id_seq', 1, true);


--
-- Name: districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.districts_id_seq', 6, true);


--
-- Name: divisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.divisions_id_seq', 4, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: donnees_operation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.donnees_operation_id_seq', 1, false);


--
-- Name: dossier_commentaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dossier_commentaires_id_seq', 1, false);


--
-- Name: dossiers_districts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dossiers_districts_id_seq', 1, false);


--
-- Name: dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dossiers_id_seq', 57, true);


--
-- Name: emargements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.emargements_id_seq', 1, false);


--
-- Name: etats_emargement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.etats_emargement_id_seq', 1, false);


--
-- Name: fonctions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fonctions_id_seq', 8, true);


--
-- Name: historique_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.historique_actions_id_seq', 761, true);


--
-- Name: immatriculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.immatriculations_id_seq', 1, false);


--
-- Name: insertions_paiement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.insertions_paiement_id_seq', 1, false);


--
-- Name: liquidations_pension_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.liquidations_pension_id_seq', 1, false);


--
-- Name: mandatement_beneficiaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mandatement_beneficiaires_id_seq', 1, false);


--
-- Name: mandatements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mandatements_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: modes_paiement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.modes_paiement_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 236, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 186, true);


--
-- Name: priorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.priorites_id_seq', 4, true);


--
-- Name: references_logiciel_secours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.references_logiciel_secours_id_seq', 1, false);


--
-- Name: referentiel_fonctionnalites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.referentiel_fonctionnalites_id_seq', 514, true);


--
-- Name: referentiel_postes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.referentiel_postes_id_seq', 18, true);


--
-- Name: referentiel_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.referentiel_service_id_seq', 19, true);


--
-- Name: reinitialisations_mot_de_passe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reinitialisations_mot_de_passe_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 13, true);


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schema_migrations_id_seq', 48, true);


--
-- Name: schemas_operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schemas_operations_id_seq', 235, true);


--
-- Name: signalements_dossier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.signalements_dossier_id_seq', 1, false);


--
-- Name: signatures_ordonnateur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.signatures_ordonnateur_id_seq', 1, false);


--
-- Name: sous_types_dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sous_types_dossiers_id_seq', 32, true);


--
-- Name: statuts_dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.statuts_dossiers_id_seq', 36, true);


--
-- Name: suppressions_dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppressions_dossiers_id_seq', 1, false);


--
-- Name: traitements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.traitements_id_seq', 2, true);


--
-- Name: transferts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transferts_id_seq', 1, false);


--
-- Name: types_courriers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.types_courriers_id_seq', 6, true);


--
-- Name: types_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.types_documents_id_seq', 7, true);


--
-- Name: types_dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.types_dossiers_id_seq', 4, true);


--
-- Name: types_pieces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.types_pieces_id_seq', 61, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: validations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.validations_id_seq', 4, true);


--
-- Name: verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.verifications_id_seq', 2, true);


--
-- Name: visas_controle_financier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.visas_controle_financier_id_seq', 1, false);


--
-- Name: affectations pk_affectations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affectations
    ADD CONSTRAINT pk_affectations PRIMARY KEY (id);


--
-- Name: agents pk_agents; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT pk_agents PRIMARY KEY (id);


--
-- Name: antennes pk_antennes; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.antennes
    ADD CONSTRAINT pk_antennes PRIMARY KEY (id);


--
-- Name: archives pk_archives; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archives
    ADD CONSTRAINT pk_archives PRIMARY KEY (id);


--
-- Name: bordereaux pk_bordereaux; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux
    ADD CONSTRAINT pk_bordereaux PRIMARY KEY (id);


--
-- Name: bordereaux_dossiers pk_bordereaux_dossiers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux_dossiers
    ADD CONSTRAINT pk_bordereaux_dossiers PRIMARY KEY (bordereau_id, dossier_id);


--
-- Name: cachets_mandatement pk_cachets_mandatement; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cachets_mandatement
    ADD CONSTRAINT pk_cachets_mandatement PRIMARY KEY (id);


--
-- Name: compteurs_numerotation pk_compteurs_numerotation; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compteurs_numerotation
    ADD CONSTRAINT pk_compteurs_numerotation PRIMARY KEY (cle);


--
-- Name: controles_decompte pk_controles_decompte; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_decompte
    ADD CONSTRAINT pk_controles_decompte PRIMARY KEY (id);


--
-- Name: correspondances pk_correspondances; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.correspondances
    ADD CONSTRAINT pk_correspondances PRIMARY KEY (id);


--
-- Name: courriers pk_courriers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courriers
    ADD CONSTRAINT pk_courriers PRIMARY KEY (id);


--
-- Name: decomptes_avance pk_decomptes_avance; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decomptes_avance
    ADD CONSTRAINT pk_decomptes_avance PRIMARY KEY (id);


--
-- Name: delegations pk_delegations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegations
    ADD CONSTRAINT pk_delegations PRIMARY KEY (id);


--
-- Name: depouillements pk_depouillements; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depouillements
    ADD CONSTRAINT pk_depouillements PRIMARY KEY (id);


--
-- Name: districts pk_districts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT pk_districts PRIMARY KEY (id);


--
-- Name: divisions pk_divisions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT pk_divisions PRIMARY KEY (id);


--
-- Name: documents pk_documents; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT pk_documents PRIMARY KEY (id);


--
-- Name: donnees_operation pk_donnees_operation; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donnees_operation
    ADD CONSTRAINT pk_donnees_operation PRIMARY KEY (id);


--
-- Name: dossier_commentaires pk_dossier_commentaires; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossier_commentaires
    ADD CONSTRAINT pk_dossier_commentaires PRIMARY KEY (id);


--
-- Name: dossiers pk_dossiers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT pk_dossiers PRIMARY KEY (id);


--
-- Name: dossiers_districts pk_dossiers_districts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers_districts
    ADD CONSTRAINT pk_dossiers_districts PRIMARY KEY (id);


--
-- Name: emargements pk_emargements; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emargements
    ADD CONSTRAINT pk_emargements PRIMARY KEY (id);


--
-- Name: etats_emargement pk_etats_emargement; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etats_emargement
    ADD CONSTRAINT pk_etats_emargement PRIMARY KEY (id);


--
-- Name: fonctions pk_fonctions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fonctions
    ADD CONSTRAINT pk_fonctions PRIMARY KEY (id);


--
-- Name: historique_actions pk_historique_actions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT pk_historique_actions PRIMARY KEY (id);


--
-- Name: immatriculations pk_immatriculations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immatriculations
    ADD CONSTRAINT pk_immatriculations PRIMARY KEY (id);


--
-- Name: insertions_paiement pk_insertions_paiement; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insertions_paiement
    ADD CONSTRAINT pk_insertions_paiement PRIMARY KEY (id);


--
-- Name: liquidations_pension pk_liquidations_pension; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidations_pension
    ADD CONSTRAINT pk_liquidations_pension PRIMARY KEY (id);


--
-- Name: mandatement_beneficiaires pk_mandatement_beneficiaires; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatement_beneficiaires
    ADD CONSTRAINT pk_mandatement_beneficiaires PRIMARY KEY (id);


--
-- Name: mandatement_pieces pk_mandatement_pieces; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatement_pieces
    ADD CONSTRAINT pk_mandatement_pieces PRIMARY KEY (code);


--
-- Name: mandatement_pieces_etat pk_mandatement_pieces_etat; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatement_pieces_etat
    ADD CONSTRAINT pk_mandatement_pieces_etat PRIMARY KEY (mandatement_id, piece_code);


--
-- Name: mandatements pk_mandatements; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatements
    ADD CONSTRAINT pk_mandatements PRIMARY KEY (id);


--
-- Name: messages pk_messages; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT pk_messages PRIMARY KEY (id);


--
-- Name: modes_paiement pk_modes_paiement; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modes_paiement
    ADD CONSTRAINT pk_modes_paiement PRIMARY KEY (id);


--
-- Name: notifications pk_notifications; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT pk_notifications PRIMARY KEY (id);


--
-- Name: permissions pk_permissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT pk_permissions PRIMARY KEY (id);


--
-- Name: priorites pk_priorites; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.priorites
    ADD CONSTRAINT pk_priorites PRIMARY KEY (id);


--
-- Name: references_logiciel_secours pk_references_logiciel_secours; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.references_logiciel_secours
    ADD CONSTRAINT pk_references_logiciel_secours PRIMARY KEY (id);


--
-- Name: referentiel_fonctionnalites pk_referentiel_fonctionnalites; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referentiel_fonctionnalites
    ADD CONSTRAINT pk_referentiel_fonctionnalites PRIMARY KEY (id);


--
-- Name: referentiel_postes pk_referentiel_postes; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referentiel_postes
    ADD CONSTRAINT pk_referentiel_postes PRIMARY KEY (id);


--
-- Name: referentiel_service pk_referentiel_service; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referentiel_service
    ADD CONSTRAINT pk_referentiel_service PRIMARY KEY (id);


--
-- Name: reinitialisations_mot_de_passe pk_reinitialisations_mot_de_passe; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinitialisations_mot_de_passe
    ADD CONSTRAINT pk_reinitialisations_mot_de_passe PRIMARY KEY (id);


--
-- Name: role_permissions pk_role_permissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id);


--
-- Name: roles pk_roles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT pk_roles PRIMARY KEY (id);


--
-- Name: schema_migrations pk_schema_migrations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT pk_schema_migrations PRIMARY KEY (id);


--
-- Name: schemas_operations pk_schemas_operations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemas_operations
    ADD CONSTRAINT pk_schemas_operations PRIMARY KEY (id);


--
-- Name: signalements_dossier pk_signalements_dossier; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements_dossier
    ADD CONSTRAINT pk_signalements_dossier PRIMARY KEY (id);


--
-- Name: signatures_ordonnateur pk_signatures_ordonnateur; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures_ordonnateur
    ADD CONSTRAINT pk_signatures_ordonnateur PRIMARY KEY (id);


--
-- Name: sous_types_dossiers pk_sous_types_dossiers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sous_types_dossiers
    ADD CONSTRAINT pk_sous_types_dossiers PRIMARY KEY (id);


--
-- Name: statuts_dossiers pk_statuts_dossiers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statuts_dossiers
    ADD CONSTRAINT pk_statuts_dossiers PRIMARY KEY (id);


--
-- Name: suppressions_dossiers pk_suppressions_dossiers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppressions_dossiers
    ADD CONSTRAINT pk_suppressions_dossiers PRIMARY KEY (id);


--
-- Name: traitements pk_traitements; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT pk_traitements PRIMARY KEY (id);


--
-- Name: transferts pk_transferts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT pk_transferts PRIMARY KEY (id);


--
-- Name: types_courriers pk_types_courriers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_courriers
    ADD CONSTRAINT pk_types_courriers PRIMARY KEY (id);


--
-- Name: types_documents pk_types_documents; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_documents
    ADD CONSTRAINT pk_types_documents PRIMARY KEY (id);


--
-- Name: types_dossiers pk_types_dossiers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_dossiers
    ADD CONSTRAINT pk_types_dossiers PRIMARY KEY (id);


--
-- Name: types_pieces pk_types_pieces; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_pieces
    ADD CONSTRAINT pk_types_pieces PRIMARY KEY (id);


--
-- Name: users pk_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);


--
-- Name: validations pk_validations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validations
    ADD CONSTRAINT pk_validations PRIMARY KEY (id);


--
-- Name: verifications pk_verifications; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT pk_verifications PRIMARY KEY (id);


--
-- Name: visas_controle_financier pk_visas_controle_financier; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visas_controle_financier
    ADD CONSTRAINT pk_visas_controle_financier PRIMARY KEY (id);


--
-- Name: idx_affectations_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affectations_1 ON public.affectations USING btree (agent_id);


--
-- Name: idx_affectations_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affectations_2 ON public.affectations USING btree (division_id);


--
-- Name: idx_affectations_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affectations_3 ON public.affectations USING btree (dossier_id);


--
-- Name: idx_affectations_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_affectations_4 ON public.affectations USING btree (auteur_id);


--
-- Name: idx_agents_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agents_1 ON public.agents USING btree (division_id);


--
-- Name: idx_agents_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agents_2 ON public.agents USING btree (fonction_id);


--
-- Name: idx_agents_3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_agents_3 ON public.agents USING btree (matricule);


--
-- Name: idx_agents_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agents_4 ON public.agents USING btree (user_id);


--
-- Name: idx_antennes_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_antennes_1 ON public.antennes USING btree (code);


--
-- Name: idx_antennes_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_antennes_2 ON public.antennes USING btree (siege);


--
-- Name: idx_archives_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archives_1 ON public.archives USING btree (archive_par);


--
-- Name: idx_archives_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archives_2 ON public.archives USING btree (emplacement_physique);


--
-- Name: idx_archives_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archives_3 ON public.archives USING btree (reference_archivage);


--
-- Name: idx_archives_4; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_archives_4 ON public.archives USING btree (reference_archivage);


--
-- Name: idx_archives_5; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_archives_5 ON public.archives USING btree (dossier_id);


--
-- Name: idx_bordereaux_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bordereaux_1 ON public.bordereaux USING btree (agent_id);


--
-- Name: idx_bordereaux_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bordereaux_2 ON public.bordereaux USING btree (date_transmission);


--
-- Name: idx_bordereaux_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bordereaux_3 ON public.bordereaux USING btree (division_id);


--
-- Name: idx_bordereaux_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bordereaux_4 ON public.bordereaux USING btree (statut);


--
-- Name: idx_bordereaux_5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bordereaux_5 ON public.bordereaux USING btree (recu_par);


--
-- Name: idx_bordereaux_6; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_bordereaux_6 ON public.bordereaux USING btree (reference);


--
-- Name: idx_bordereaux_dossiers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bordereaux_dossiers_1 ON public.bordereaux_dossiers USING btree (dossier_id);


--
-- Name: idx_cachets_mandatement_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cachets_mandatement_1 ON public.cachets_mandatement USING btree (cache_par);


--
-- Name: idx_cachets_mandatement_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_cachets_mandatement_2 ON public.cachets_mandatement USING btree (mandatement_id);


--
-- Name: idx_controles_decompte_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_controles_decompte_1 ON public.controles_decompte USING btree (controleur_id);


--
-- Name: idx_controles_decompte_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_controles_decompte_2 ON public.controles_decompte USING btree (dossier_id);


--
-- Name: idx_correspondances_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correspondances_1 ON public.correspondances USING btree (created_by);


--
-- Name: idx_correspondances_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correspondances_2 ON public.correspondances USING btree (type);


--
-- Name: idx_correspondances_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_correspondances_3 ON public.correspondances USING btree (dossier_id);


--
-- Name: idx_courriers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courriers_1 ON public.courriers USING btree (created_by);


--
-- Name: idx_courriers_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courriers_2 ON public.courriers USING btree (division_id);


--
-- Name: idx_courriers_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courriers_3 ON public.courriers USING btree (document_id);


--
-- Name: idx_courriers_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courriers_4 ON public.courriers USING btree (dossier_id);


--
-- Name: idx_courriers_5; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_courriers_5 ON public.courriers USING btree (numero);


--
-- Name: idx_courriers_6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courriers_6 ON public.courriers USING btree (type_id);


--
-- Name: idx_decomptes_avance_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_decomptes_avance_1 ON public.decomptes_avance USING btree (agent_id);


--
-- Name: idx_decomptes_avance_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_decomptes_avance_2 ON public.decomptes_avance USING btree (dossier_id);


--
-- Name: idx_delegations_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delegations_1 ON public.delegations USING btree (created_by);


--
-- Name: idx_delegations_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delegations_2 ON public.delegations USING btree (agent_id);


--
-- Name: idx_delegations_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delegations_3 ON public.delegations USING btree (remplacant_id);


--
-- Name: idx_depouillements_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_depouillements_1 ON public.depouillements USING btree (agent_id);


--
-- Name: idx_depouillements_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_depouillements_2 ON public.depouillements USING btree (piece);


--
-- Name: idx_depouillements_3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_depouillements_3 ON public.depouillements USING btree (dossier_id, piece);


--
-- Name: idx_districts_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_districts_1 ON public.districts USING btree (antenne_id);


--
-- Name: idx_districts_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_districts_2 ON public.districts USING btree (code);


--
-- Name: idx_divisions_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_divisions_1 ON public.divisions USING btree (code);


--
-- Name: idx_divisions_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_divisions_2 ON public.divisions USING btree (responsable_id);


--
-- Name: idx_divisions_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_divisions_3 ON public.divisions USING btree (type_dossier_id);


--
-- Name: idx_documents_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_1 ON public.documents USING btree (dossier_id);


--
-- Name: idx_documents_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_2 ON public.documents USING btree (courrier_id);


--
-- Name: idx_documents_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_3 ON public.documents USING btree (piece_code);


--
-- Name: idx_documents_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_4 ON public.documents USING btree (dossier_id, version);


--
-- Name: idx_documents_5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_5 ON public.documents USING btree (type_id);


--
-- Name: idx_documents_6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_6 ON public.documents USING btree (upload_par);


--
-- Name: idx_donnees_operation_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donnees_operation_1 ON public.donnees_operation USING btree (controleur_id);


--
-- Name: idx_donnees_operation_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donnees_operation_2 ON public.donnees_operation USING btree (valide_par);


--
-- Name: idx_donnees_operation_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donnees_operation_3 ON public.donnees_operation USING btree (sous_type_id);


--
-- Name: idx_donnees_operation_4; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_donnees_operation_4 ON public.donnees_operation USING btree (dossier_id);


--
-- Name: idx_dossier_commentaires_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossier_commentaires_1 ON public.dossier_commentaires USING btree (auteur_id);


--
-- Name: idx_dossier_commentaires_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossier_commentaires_2 ON public.dossier_commentaires USING btree (dossier_id);


--
-- Name: idx_dossiers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_1 ON public.dossiers USING btree (agent_responsable_id);


--
-- Name: idx_dossiers_10; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_dossiers_10 ON public.dossiers USING btree (numero);


--
-- Name: idx_dossiers_11; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_11 ON public.dossiers USING btree (priorite_id);


--
-- Name: idx_dossiers_12; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_12 ON public.dossiers USING btree (statut_id);


--
-- Name: idx_dossiers_13; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_13 ON public.dossiers USING btree (type_id);


--
-- Name: idx_dossiers_14; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_dossiers_14 ON public.dossiers USING btree (reference_visa);


--
-- Name: idx_dossiers_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_2 ON public.dossiers USING btree (created_by);


--
-- Name: idx_dossiers_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_3 ON public.dossiers USING btree (division_id);


--
-- Name: idx_dossiers_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_4 ON public.dossiers USING btree (demandeur_nom);


--
-- Name: idx_dossiers_5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_5 ON public.dossiers USING btree (demandeur_prenom);


--
-- Name: idx_dossiers_6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_6 ON public.dossiers USING btree (reference_visa);


--
-- Name: idx_dossiers_7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_7 ON public.dossiers USING btree (sous_type_id);


--
-- Name: idx_dossiers_8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_8 ON public.dossiers USING btree (verificateur_id);


--
-- Name: idx_dossiers_9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_9 ON public.dossiers USING btree (date_limite);


--
-- Name: idx_dossiers_districts_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_districts_1 ON public.dossiers_districts USING btree (dossier_id, courante);


--
-- Name: idx_dossiers_districts_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_districts_2 ON public.dossiers_districts USING btree (district_id);


--
-- Name: idx_dossiers_districts_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dossiers_districts_3 ON public.dossiers_districts USING btree (dossier_id);


--
-- Name: idx_dossiers_districts_4; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_dossiers_districts_4 ON public.dossiers_districts USING btree (dossier_id, courante);


--
-- Name: idx_emargements_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emargements_1 ON public.emargements USING btree (beneficiaire_id);


--
-- Name: idx_emargements_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_emargements_2 ON public.emargements USING btree (etat_emargement_id, beneficiaire_id);


--
-- Name: idx_etats_emargement_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_etats_emargement_1 ON public.etats_emargement USING btree (genere_par);


--
-- Name: idx_etats_emargement_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_etats_emargement_2 ON public.etats_emargement USING btree (mandatement_id);


--
-- Name: idx_fonctions_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_fonctions_1 ON public.fonctions USING btree (libelle);


--
-- Name: idx_historique_actions_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historique_actions_1 ON public.historique_actions USING btree (dossier_id);


--
-- Name: idx_historique_actions_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historique_actions_2 ON public.historique_actions USING btree (user_id);


--
-- Name: idx_immatriculations_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_immatriculations_1 ON public.immatriculations USING btree (created_by);


--
-- Name: idx_immatriculations_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_immatriculations_2 ON public.immatriculations USING btree (created_at);


--
-- Name: idx_immatriculations_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_immatriculations_3 ON public.immatriculations USING btree (division_id);


--
-- Name: idx_immatriculations_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_immatriculations_4 ON public.immatriculations USING btree (matricule);


--
-- Name: idx_immatriculations_5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_immatriculations_5 ON public.immatriculations USING btree (statut);


--
-- Name: idx_insertions_paiement_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_insertions_paiement_1 ON public.insertions_paiement USING btree (created_by);


--
-- Name: idx_insertions_paiement_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_insertions_paiement_2 ON public.insertions_paiement USING btree (immatriculation_id);


--
-- Name: idx_liquidations_pension_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_liquidations_pension_1 ON public.liquidations_pension USING btree (agent_id);


--
-- Name: idx_liquidations_pension_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_liquidations_pension_2 ON public.liquidations_pension USING btree (dossier_id);


--
-- Name: idx_mandatement_beneficiaires_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mandatement_beneficiaires_1 ON public.mandatement_beneficiaires USING btree (mandatement_id);


--
-- Name: idx_mandatements_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mandatements_1 ON public.mandatements USING btree (ordonnateur_id);


--
-- Name: idx_mandatements_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_mandatements_2 ON public.mandatements USING btree (dossier_id);


--
-- Name: idx_messages_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_1 ON public.messages USING btree (destinataire_id);


--
-- Name: idx_messages_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_2 ON public.messages USING btree (dossier_id);


--
-- Name: idx_messages_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_3 ON public.messages USING btree (expediteur_id);


--
-- Name: idx_modes_paiement_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modes_paiement_1 ON public.modes_paiement USING btree (created_by);


--
-- Name: idx_modes_paiement_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modes_paiement_2 ON public.modes_paiement USING btree (immatriculation_id);


--
-- Name: idx_notifications_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_1 ON public.notifications USING btree (dossier_id);


--
-- Name: idx_notifications_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_2 ON public.notifications USING btree (user_id, lu);


--
-- Name: idx_notifications_3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_notifications_3 ON public.notifications USING btree (user_id, dossier_id, action);


--
-- Name: idx_permissions_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_permissions_1 ON public.permissions USING btree (nom);


--
-- Name: idx_priorites_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_priorites_1 ON public.priorites USING btree (libelle);


--
-- Name: idx_references_logiciel_secours_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_references_logiciel_secours_1 ON public.references_logiciel_secours USING btree (reporte_par);


--
-- Name: idx_references_logiciel_secours_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_references_logiciel_secours_2 ON public.references_logiciel_secours USING btree (mandatement_id, code);


--
-- Name: idx_referentiel_fonctionnalites_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referentiel_fonctionnalites_1 ON public.referentiel_fonctionnalites USING btree (document);


--
-- Name: idx_referentiel_fonctionnalites_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referentiel_fonctionnalites_2 ON public.referentiel_fonctionnalites USING btree (etat);


--
-- Name: idx_referentiel_fonctionnalites_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referentiel_fonctionnalites_3 ON public.referentiel_fonctionnalites USING btree (nature);


--
-- Name: idx_referentiel_fonctionnalites_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referentiel_fonctionnalites_4 ON public.referentiel_fonctionnalites USING btree (permission_nom);


--
-- Name: idx_referentiel_fonctionnalites_5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referentiel_fonctionnalites_5 ON public.referentiel_fonctionnalites USING btree (poste_code);


--
-- Name: idx_referentiel_fonctionnalites_6; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_referentiel_fonctionnalites_6 ON public.referentiel_fonctionnalites USING btree (document, numero_source);


--
-- Name: idx_referentiel_postes_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_referentiel_postes_1 ON public.referentiel_postes USING btree (role_nom);


--
-- Name: idx_referentiel_postes_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_referentiel_postes_2 ON public.referentiel_postes USING btree (code);


--
-- Name: idx_referentiel_service_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_referentiel_service_1 ON public.referentiel_service USING btree (cle);


--
-- Name: idx_reinitialisations_mot_de_passe_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reinitialisations_mot_de_passe_1 ON public.reinitialisations_mot_de_passe USING btree (code_genere_par);


--
-- Name: idx_reinitialisations_mot_de_passe_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reinitialisations_mot_de_passe_2 ON public.reinitialisations_mot_de_passe USING btree (created_at);


--
-- Name: idx_reinitialisations_mot_de_passe_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reinitialisations_mot_de_passe_3 ON public.reinitialisations_mot_de_passe USING btree (statut);


--
-- Name: idx_reinitialisations_mot_de_passe_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reinitialisations_mot_de_passe_4 ON public.reinitialisations_mot_de_passe USING btree (user_id);


--
-- Name: idx_role_permissions_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_permissions_1 ON public.role_permissions USING btree (permission_id);


--
-- Name: idx_roles_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_roles_1 ON public.roles USING btree (nom);


--
-- Name: idx_schema_migrations_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_schema_migrations_1 ON public.schema_migrations USING btree (fichier);


--
-- Name: idx_schemas_operations_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schemas_operations_1 ON public.schemas_operations USING btree (sous_type_id);


--
-- Name: idx_schemas_operations_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_schemas_operations_2 ON public.schemas_operations USING btree (sous_type_id, cle);


--
-- Name: idx_signalements_dossier_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signalements_dossier_1 ON public.signalements_dossier USING btree (signale_par);


--
-- Name: idx_signalements_dossier_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signalements_dossier_2 ON public.signalements_dossier USING btree (traite_par);


--
-- Name: idx_signalements_dossier_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signalements_dossier_3 ON public.signalements_dossier USING btree (division_id);


--
-- Name: idx_signalements_dossier_4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signalements_dossier_4 ON public.signalements_dossier USING btree (dossier_id);


--
-- Name: idx_signalements_dossier_5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signalements_dossier_5 ON public.signalements_dossier USING btree (statut);


--
-- Name: idx_signatures_ordonnateur_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_ordonnateur_1 ON public.signatures_ordonnateur USING btree (signe_par);


--
-- Name: idx_signatures_ordonnateur_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_ordonnateur_2 ON public.signatures_ordonnateur USING btree (signe_le);


--
-- Name: idx_signatures_ordonnateur_3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_signatures_ordonnateur_3 ON public.signatures_ordonnateur USING btree (mandatement_id);


--
-- Name: idx_signatures_ordonnateur_4; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_signatures_ordonnateur_4 ON public.signatures_ordonnateur USING btree (reference_signature);


--
-- Name: idx_sous_types_dossiers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sous_types_dossiers_1 ON public.sous_types_dossiers USING btree (type_dossier_id);


--
-- Name: idx_sous_types_dossiers_2; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_sous_types_dossiers_2 ON public.sous_types_dossiers USING btree (type_dossier_id, code);


--
-- Name: idx_statuts_dossiers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_statuts_dossiers_1 ON public.statuts_dossiers USING btree (code);


--
-- Name: idx_suppressions_dossiers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppressions_dossiers_1 ON public.suppressions_dossiers USING btree (supprime_par);


--
-- Name: idx_suppressions_dossiers_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppressions_dossiers_2 ON public.suppressions_dossiers USING btree (date_suppression);


--
-- Name: idx_suppressions_dossiers_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppressions_dossiers_3 ON public.suppressions_dossiers USING btree (dossier_id);


--
-- Name: idx_traitements_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_traitements_1 ON public.traitements USING btree (agent_id);


--
-- Name: idx_traitements_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_traitements_2 ON public.traitements USING btree (dossier_id);


--
-- Name: idx_transferts_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transferts_1 ON public.transferts USING btree (ancien_agent_id);


--
-- Name: idx_transferts_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transferts_2 ON public.transferts USING btree (dossier_id);


--
-- Name: idx_transferts_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transferts_3 ON public.transferts USING btree (nouveau_agent_id);


--
-- Name: idx_types_courriers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_types_courriers_1 ON public.types_courriers USING btree (libelle);


--
-- Name: idx_types_documents_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_types_documents_1 ON public.types_documents USING btree (libelle);


--
-- Name: idx_types_dossiers_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_types_dossiers_1 ON public.types_dossiers USING btree (code);


--
-- Name: idx_types_pieces_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_types_pieces_1 ON public.types_pieces USING btree (sous_type_id);


--
-- Name: idx_types_pieces_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_types_pieces_2 ON public.types_pieces USING btree (type_dossier_id);


--
-- Name: idx_types_pieces_3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_types_pieces_3 ON public.types_pieces USING btree (code);


--
-- Name: idx_users_1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_1 ON public.users USING btree (email);


--
-- Name: idx_users_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_2 ON public.users USING btree (verrouille_jusqua);


--
-- Name: idx_users_3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_3 ON public.users USING btree (role_id);


--
-- Name: idx_users_4; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_4 ON public.users USING btree (username);


--
-- Name: idx_validations_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_validations_1 ON public.validations USING btree (dossier_id);


--
-- Name: idx_validations_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_validations_2 ON public.validations USING btree (valide_par);


--
-- Name: idx_verifications_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verifications_1 ON public.verifications USING btree (agent_id);


--
-- Name: idx_verifications_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verifications_2 ON public.verifications USING btree (dossier_id);


--
-- Name: idx_visas_controle_financier_1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_visas_controle_financier_1 ON public.visas_controle_financier USING btree (enregistre_par);


--
-- Name: idx_visas_controle_financier_2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_visas_controle_financier_2 ON public.visas_controle_financier USING btree (numero_visa);


--
-- Name: idx_visas_controle_financier_3; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_visas_controle_financier_3 ON public.visas_controle_financier USING btree (dossier_id);


--
-- Name: idx_visas_controle_financier_4; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_visas_controle_financier_4 ON public.visas_controle_financier USING btree (numero_visa);


--
-- Name: bordereaux trg_bordereaux_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_bordereaux_updated_at BEFORE UPDATE ON public.bordereaux FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cachets_mandatement trg_cachets_mandatement_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cachets_mandatement_updated_at BEFORE UPDATE ON public.cachets_mandatement FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: compteurs_numerotation trg_compteurs_numerotation_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_compteurs_numerotation_updated_at BEFORE UPDATE ON public.compteurs_numerotation FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: decomptes_avance trg_decomptes_avance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_decomptes_avance_updated_at BEFORE UPDATE ON public.decomptes_avance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: donnees_operation trg_donnees_operation_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_donnees_operation_updated_at BEFORE UPDATE ON public.donnees_operation FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: dossiers trg_dossiers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dossiers_updated_at BEFORE UPDATE ON public.dossiers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: emargements trg_emargements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_emargements_updated_at BEFORE UPDATE ON public.emargements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: etats_emargement trg_etats_emargement_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_etats_emargement_updated_at BEFORE UPDATE ON public.etats_emargement FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: immatriculations trg_immatriculations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_immatriculations_updated_at BEFORE UPDATE ON public.immatriculations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: insertions_paiement trg_insertions_paiement_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_insertions_paiement_updated_at BEFORE UPDATE ON public.insertions_paiement FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: liquidations_pension trg_liquidations_pension_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_liquidations_pension_updated_at BEFORE UPDATE ON public.liquidations_pension FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: mandatements trg_mandatements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_mandatements_updated_at BEFORE UPDATE ON public.mandatements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: modes_paiement trg_modes_paiement_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_modes_paiement_updated_at BEFORE UPDATE ON public.modes_paiement FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: referentiel_fonctionnalites trg_referentiel_fonctionnalites_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_referentiel_fonctionnalites_updated_at BEFORE UPDATE ON public.referentiel_fonctionnalites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reinitialisations_mot_de_passe trg_reinitialisations_mot_de_passe_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_reinitialisations_mot_de_passe_updated_at BEFORE UPDATE ON public.reinitialisations_mot_de_passe FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: roles trg_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: signalements_dossier trg_signalements_dossier_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_signalements_dossier_updated_at BEFORE UPDATE ON public.signalements_dossier FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: signatures_ordonnateur trg_signatures_ordonnateur_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_signatures_ordonnateur_updated_at BEFORE UPDATE ON public.signatures_ordonnateur FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: affectations fk_affectations_1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affectations
    ADD CONSTRAINT fk_affectations_1 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: affectations fk_affectations_2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affectations
    ADD CONSTRAINT fk_affectations_2 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: affectations fk_affectations_3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affectations
    ADD CONSTRAINT fk_affectations_3 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: agents fk_agents_4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT fk_agents_4 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: agents fk_agents_5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT fk_agents_5 FOREIGN KEY (fonction_id) REFERENCES public.fonctions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: agents fk_agents_6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT fk_agents_6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: archives fk_archives_7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archives
    ADD CONSTRAINT fk_archives_7 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: archives fk_archives_8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.archives
    ADD CONSTRAINT fk_archives_8 FOREIGN KEY (archive_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: bordereaux fk_bordereaux_10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux
    ADD CONSTRAINT fk_bordereaux_10 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: bordereaux fk_bordereaux_11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux
    ADD CONSTRAINT fk_bordereaux_11 FOREIGN KEY (recu_par) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: bordereaux fk_bordereaux_9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux
    ADD CONSTRAINT fk_bordereaux_9 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: bordereaux_dossiers fk_bordereaux_dossiers_12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux_dossiers
    ADD CONSTRAINT fk_bordereaux_dossiers_12 FOREIGN KEY (bordereau_id) REFERENCES public.bordereaux(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: bordereaux_dossiers fk_bordereaux_dossiers_13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bordereaux_dossiers
    ADD CONSTRAINT fk_bordereaux_dossiers_13 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: cachets_mandatement fk_cachets_mandatement_14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cachets_mandatement
    ADD CONSTRAINT fk_cachets_mandatement_14 FOREIGN KEY (mandatement_id) REFERENCES public.mandatements(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: cachets_mandatement fk_cachets_mandatement_15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cachets_mandatement
    ADD CONSTRAINT fk_cachets_mandatement_15 FOREIGN KEY (cache_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: controles_decompte fk_controles_decompte_16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_decompte
    ADD CONSTRAINT fk_controles_decompte_16 FOREIGN KEY (controleur_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: controles_decompte fk_controles_decompte_17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_decompte
    ADD CONSTRAINT fk_controles_decompte_17 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: correspondances fk_correspondances_18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.correspondances
    ADD CONSTRAINT fk_correspondances_18 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: correspondances fk_correspondances_19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.correspondances
    ADD CONSTRAINT fk_correspondances_19 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: courriers fk_courriers_20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courriers
    ADD CONSTRAINT fk_courriers_20 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: courriers fk_courriers_21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courriers
    ADD CONSTRAINT fk_courriers_21 FOREIGN KEY (document_id) REFERENCES public.documents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: courriers fk_courriers_22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courriers
    ADD CONSTRAINT fk_courriers_22 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: courriers fk_courriers_23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courriers
    ADD CONSTRAINT fk_courriers_23 FOREIGN KEY (type_id) REFERENCES public.types_courriers(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: courriers fk_courriers_24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courriers
    ADD CONSTRAINT fk_courriers_24 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: decomptes_avance fk_decomptes_avance_25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decomptes_avance
    ADD CONSTRAINT fk_decomptes_avance_25 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: decomptes_avance fk_decomptes_avance_26; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decomptes_avance
    ADD CONSTRAINT fk_decomptes_avance_26 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: delegations fk_delegations_27; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegations
    ADD CONSTRAINT fk_delegations_27 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: delegations fk_delegations_28; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegations
    ADD CONSTRAINT fk_delegations_28 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: delegations fk_delegations_29; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegations
    ADD CONSTRAINT fk_delegations_29 FOREIGN KEY (remplacant_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: depouillements fk_depouillements_30; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depouillements
    ADD CONSTRAINT fk_depouillements_30 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: depouillements fk_depouillements_31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depouillements
    ADD CONSTRAINT fk_depouillements_31 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: districts fk_districts_32; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT fk_districts_32 FOREIGN KEY (antenne_id) REFERENCES public.antennes(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: divisions fk_divisions_33; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT fk_divisions_33 FOREIGN KEY (responsable_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: divisions fk_divisions_34; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT fk_divisions_34 FOREIGN KEY (type_dossier_id) REFERENCES public.types_dossiers(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: documents fk_documents_35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_35 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: documents fk_documents_36; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_36 FOREIGN KEY (type_id) REFERENCES public.types_documents(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: documents fk_documents_37; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_37 FOREIGN KEY (upload_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: documents fk_documents_38; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_38 FOREIGN KEY (courrier_id) REFERENCES public.courriers(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: donnees_operation fk_donnees_operation_39; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donnees_operation
    ADD CONSTRAINT fk_donnees_operation_39 FOREIGN KEY (controleur_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: donnees_operation fk_donnees_operation_40; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donnees_operation
    ADD CONSTRAINT fk_donnees_operation_40 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: donnees_operation fk_donnees_operation_41; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donnees_operation
    ADD CONSTRAINT fk_donnees_operation_41 FOREIGN KEY (sous_type_id) REFERENCES public.sous_types_dossiers(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: donnees_operation fk_donnees_operation_42; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donnees_operation
    ADD CONSTRAINT fk_donnees_operation_42 FOREIGN KEY (valide_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: dossier_commentaires fk_dossier_commentaires_51; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossier_commentaires
    ADD CONSTRAINT fk_dossier_commentaires_51 FOREIGN KEY (auteur_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: dossier_commentaires fk_dossier_commentaires_52; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossier_commentaires
    ADD CONSTRAINT fk_dossier_commentaires_52 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: dossiers fk_dossiers_43; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT fk_dossiers_43 FOREIGN KEY (agent_responsable_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: dossiers fk_dossiers_44; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT fk_dossiers_44 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: dossiers fk_dossiers_45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT fk_dossiers_45 FOREIGN KEY (priorite_id) REFERENCES public.priorites(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: dossiers fk_dossiers_46; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT fk_dossiers_46 FOREIGN KEY (statut_id) REFERENCES public.statuts_dossiers(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: dossiers fk_dossiers_47; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT fk_dossiers_47 FOREIGN KEY (type_id) REFERENCES public.types_dossiers(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: dossiers fk_dossiers_48; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT fk_dossiers_48 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: dossiers_districts fk_dossiers_districts_49; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers_districts
    ADD CONSTRAINT fk_dossiers_districts_49 FOREIGN KEY (district_id) REFERENCES public.districts(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: dossiers_districts fk_dossiers_districts_50; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dossiers_districts
    ADD CONSTRAINT fk_dossiers_districts_50 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: emargements fk_emargements_53; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emargements
    ADD CONSTRAINT fk_emargements_53 FOREIGN KEY (beneficiaire_id) REFERENCES public.mandatement_beneficiaires(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: emargements fk_emargements_54; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emargements
    ADD CONSTRAINT fk_emargements_54 FOREIGN KEY (etat_emargement_id) REFERENCES public.etats_emargement(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: etats_emargement fk_etats_emargement_55; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etats_emargement
    ADD CONSTRAINT fk_etats_emargement_55 FOREIGN KEY (genere_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: etats_emargement fk_etats_emargement_56; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.etats_emargement
    ADD CONSTRAINT fk_etats_emargement_56 FOREIGN KEY (mandatement_id) REFERENCES public.mandatements(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: historique_actions fk_historique_actions_57; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT fk_historique_actions_57 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: historique_actions fk_historique_actions_58; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historique_actions
    ADD CONSTRAINT fk_historique_actions_58 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: immatriculations fk_immatriculations_59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immatriculations
    ADD CONSTRAINT fk_immatriculations_59 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: immatriculations fk_immatriculations_60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.immatriculations
    ADD CONSTRAINT fk_immatriculations_60 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: insertions_paiement fk_insertions_paiement_61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insertions_paiement
    ADD CONSTRAINT fk_insertions_paiement_61 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: insertions_paiement fk_insertions_paiement_62; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insertions_paiement
    ADD CONSTRAINT fk_insertions_paiement_62 FOREIGN KEY (immatriculation_id) REFERENCES public.immatriculations(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: liquidations_pension fk_liquidations_pension_63; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidations_pension
    ADD CONSTRAINT fk_liquidations_pension_63 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: liquidations_pension fk_liquidations_pension_64; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.liquidations_pension
    ADD CONSTRAINT fk_liquidations_pension_64 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: mandatement_beneficiaires fk_mandatement_beneficiaires_67; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatement_beneficiaires
    ADD CONSTRAINT fk_mandatement_beneficiaires_67 FOREIGN KEY (mandatement_id) REFERENCES public.mandatements(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: mandatement_pieces_etat fk_mandatement_pieces_etat_68; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatement_pieces_etat
    ADD CONSTRAINT fk_mandatement_pieces_etat_68 FOREIGN KEY (mandatement_id) REFERENCES public.mandatements(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: mandatements fk_mandatements_65; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatements
    ADD CONSTRAINT fk_mandatements_65 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: mandatements fk_mandatements_66; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mandatements
    ADD CONSTRAINT fk_mandatements_66 FOREIGN KEY (ordonnateur_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: messages fk_messages_69; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_69 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: messages fk_messages_70; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_70 FOREIGN KEY (expediteur_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: messages fk_messages_71; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_71 FOREIGN KEY (destinataire_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: modes_paiement fk_modes_paiement_72; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modes_paiement
    ADD CONSTRAINT fk_modes_paiement_72 FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: modes_paiement fk_modes_paiement_73; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modes_paiement
    ADD CONSTRAINT fk_modes_paiement_73 FOREIGN KEY (immatriculation_id) REFERENCES public.immatriculations(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: notifications fk_notifications_74; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_74 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: notifications fk_notifications_75; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_75 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: references_logiciel_secours fk_references_logiciel_secours_76; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.references_logiciel_secours
    ADD CONSTRAINT fk_references_logiciel_secours_76 FOREIGN KEY (mandatement_id) REFERENCES public.mandatements(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: references_logiciel_secours fk_references_logiciel_secours_77; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.references_logiciel_secours
    ADD CONSTRAINT fk_references_logiciel_secours_77 FOREIGN KEY (reporte_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: reinitialisations_mot_de_passe fk_reinitialisations_mot_de_passe_78; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinitialisations_mot_de_passe
    ADD CONSTRAINT fk_reinitialisations_mot_de_passe_78 FOREIGN KEY (code_genere_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: reinitialisations_mot_de_passe fk_reinitialisations_mot_de_passe_79; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reinitialisations_mot_de_passe
    ADD CONSTRAINT fk_reinitialisations_mot_de_passe_79 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: role_permissions fk_role_permissions_80; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_80 FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: role_permissions fk_role_permissions_81; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_81 FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: schemas_operations fk_schemas_operations_82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemas_operations
    ADD CONSTRAINT fk_schemas_operations_82 FOREIGN KEY (sous_type_id) REFERENCES public.sous_types_dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: signalements_dossier fk_signalements_dossier_83; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements_dossier
    ADD CONSTRAINT fk_signalements_dossier_83 FOREIGN KEY (signale_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: signalements_dossier fk_signalements_dossier_84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements_dossier
    ADD CONSTRAINT fk_signalements_dossier_84 FOREIGN KEY (division_id) REFERENCES public.divisions(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: signalements_dossier fk_signalements_dossier_85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements_dossier
    ADD CONSTRAINT fk_signalements_dossier_85 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: signalements_dossier fk_signalements_dossier_86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signalements_dossier
    ADD CONSTRAINT fk_signalements_dossier_86 FOREIGN KEY (traite_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: signatures_ordonnateur fk_signatures_ordonnateur_87; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures_ordonnateur
    ADD CONSTRAINT fk_signatures_ordonnateur_87 FOREIGN KEY (mandatement_id) REFERENCES public.mandatements(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: signatures_ordonnateur fk_signatures_ordonnateur_88; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures_ordonnateur
    ADD CONSTRAINT fk_signatures_ordonnateur_88 FOREIGN KEY (signe_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: sous_types_dossiers fk_sous_types_dossiers_89; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sous_types_dossiers
    ADD CONSTRAINT fk_sous_types_dossiers_89 FOREIGN KEY (type_dossier_id) REFERENCES public.types_dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: suppressions_dossiers fk_suppressions_dossiers_90; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppressions_dossiers
    ADD CONSTRAINT fk_suppressions_dossiers_90 FOREIGN KEY (supprime_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: traitements fk_traitements_91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT fk_traitements_91 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: traitements fk_traitements_92; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.traitements
    ADD CONSTRAINT fk_traitements_92 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: transferts fk_transferts_93; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT fk_transferts_93 FOREIGN KEY (ancien_agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: transferts fk_transferts_94; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT fk_transferts_94 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: transferts fk_transferts_95; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts
    ADD CONSTRAINT fk_transferts_95 FOREIGN KEY (nouveau_agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: users fk_users_96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_96 FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: validations fk_validations_97; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validations
    ADD CONSTRAINT fk_validations_97 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: validations fk_validations_98; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validations
    ADD CONSTRAINT fk_validations_98 FOREIGN KEY (valide_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: verifications fk_verifications_100; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT fk_verifications_100 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: verifications fk_verifications_99; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT fk_verifications_99 FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: visas_controle_financier fk_visas_controle_financier_101; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visas_controle_financier
    ADD CONSTRAINT fk_visas_controle_financier_101 FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: visas_controle_financier fk_visas_controle_financier_102; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visas_controle_financier
    ADD CONSTRAINT fk_visas_controle_financier_102 FOREIGN KEY (enregistre_par) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 2CUkkD5f1KKvDsNDUX6IJyUSsuCV37yFG9cNJFlkdX8BgHQRueh4pXPYIvzG90G

