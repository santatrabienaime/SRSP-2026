/**
 * Migration : trace durable des suppressions de dossiers.
 *
 * Le cahier des charges est explicite : « aucune suppression silencieuse, aucune
 * modification de l'historique ». Or `historique_actions` est lié à `dossiers`
 * par une clé étrangère `ON DELETE CASCADE` : supprimer un dossier effaçait
 * son journal, et la trace de la suppression elle-même disparaissait avec lui.
 *
 * Cette table ne porte AUCUNE clé étrangère vers `dossiers` : elle survit à la
 * suppression et conserve l'instantané du dossier et de son journal.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-trace-suppressions.mjs            → dry-run
 *   node scripts/migration-trace-suppressions.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const SQL = `CREATE TABLE IF NOT EXISTS suppressions_dossiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  numero VARCHAR(50) NOT NULL,
  reference_visa VARCHAR(50) NULL,
  type_code VARCHAR(30) NULL,
  objet VARCHAR(500) NULL,
  demandeur VARCHAR(150) NULL,
  matricule VARCHAR(50) NULL,
  division_nom VARCHAR(150) NULL,
  statut_code VARCHAR(30) NULL,
  agent_nom VARCHAR(100) NULL,
  date_reception DATE NULL,
  motif VARCHAR(500) NOT NULL,
  supprime_par INT NULL,
  supprime_par_nom VARCHAR(150) NULL,
  date_suppression TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  historique_json LONGTEXT NULL,
  nb_actions_historique INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_suppression_user FOREIGN KEY (supprime_par) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const INDEX = [
  `CREATE INDEX IF NOT EXISTS idx_suppressions_dossier ON suppressions_dossiers(dossier_id)`,
  `CREATE INDEX IF NOT EXISTS idx_suppressions_date ON suppressions_dossiers(date_suppression)`,
];

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION TRACE DES SUPPRESSIONS ===' : '=== DRY-RUN ===');

  for (const stmt of [SQL, ...INDEX]) {
    console.log(APPLY ? `→ ${stmt.replace(/\s+/g, ' ').slice(0, 90)}…` : `Would execute: ${stmt.replace(/\s+/g, ' ').slice(0, 90)}…`);
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
