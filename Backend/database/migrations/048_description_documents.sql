-- 048_description_documents.sql
-- Référentiel FRONTEND-COMPLET : description d'un document (§5.4).
-- Le formulaire d'envoi envoyait déjà le champ ; la base ne l'avait pas.

ALTER TABLE documents
  ADD COLUMN description VARCHAR(500) NULL DEFAULT NULL AFTER taille;
