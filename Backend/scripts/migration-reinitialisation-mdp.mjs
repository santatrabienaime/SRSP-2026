/**
 * Migration : demandes de réinitialisation de mot de passe.
 *
 * Le circuit retenu ne dépend d'aucun envoi d'e-mail ni de SMS — le MVP
 * l'exclut explicitement. L'agent fait sa demande depuis l'écran public, un
 * administrateur vérifie son identité, lui remet un **code à usage unique**,
 * et l'agent choisit lui-même son nouveau mot de passe.
 *
 * Le code n'est jamais stocké en clair : seule son empreinte SHA-256 est
 * conservée, avec une date d'expiration. La demande elle-même est tracée,
 * comme toute action sensible.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-reinitialisation-mdp.mjs            → dry-run
 *   node scripts/migration-reinitialisation-mdp.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const SQL = `CREATE TABLE IF NOT EXISTS reinitialisations_mot_de_passe (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  identifiant_saisi VARCHAR(150) NULL,
  statut ENUM('EN_ATTENTE','CODE_GENERE','UTILISE','ANNULE','EXPIRE') NOT NULL DEFAULT 'EN_ATTENTE',
  empreinte CHAR(64) NULL,
  code_genere_par INT NULL,
  code_genere_le DATETIME NULL,
  expire_le DATETIME NULL,
  tentatives INT NOT NULL DEFAULT 0,
  utilise_le DATETIME NULL,
  motif VARCHAR(500) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reinit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reinit_admin FOREIGN KEY (code_genere_par) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const INDEX = [
  `CREATE INDEX IF NOT EXISTS idx_reinit_user ON reinitialisations_mot_de_passe(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reinit_statut ON reinitialisations_mot_de_passe(statut)`,
  `CREATE INDEX IF NOT EXISTS idx_reinit_created ON reinitialisations_mot_de_passe(created_at)`,
];

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION REINITIALISATION MDP ===' : '=== DRY-RUN ===');

  for (const stmt of [SQL, ...INDEX]) {
    console.log(APPLY ? `→ ${stmt.replace(/\s+/g, ' ').slice(0, 80)}…` : `Would execute: ${stmt.replace(/\s+/g, ' ').slice(0, 80)}…`);
    if (APPLY) await db.query(stmt);
  }

  console.log(APPLY ? '✅ Migration appliquée.' : '⚡ Relancez avec --apply pour écrire.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur migration :', err.message);
    process.exit(1);
  });
