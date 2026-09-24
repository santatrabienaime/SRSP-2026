-- 018_sécurité_audit_ip.sql
-- Verrouillage temporaire du compte après N échecs de connexion
-- + traçabilité de l'adresse IP dans le journal des actions.

-- 1. Verrouillage de compte ----------------------------------------------------
ALTER TABLE users
  ADD COLUMN tentatives_echouees TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER derniere_connexion,
  ADD COLUMN verrouille_jusqua DATETIME NULL DEFAULT NULL AFTER tentatives_echouees;

-- 2. Adresse IP dans le journal d'audit ---------------------------------------
ALTER TABLE historique_actions
  ADD COLUMN ip_address VARCHAR(45) NULL DEFAULT NULL AFTER details;

-- 3. Compteur d'échecs pré-indexé pour les contrôles de sécurité --------------
CREATE INDEX idx_users_verrouille ON users (verrouille_jusqua);
