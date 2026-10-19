/**
 * Migration : tables bordereaux + bordereaux_dossiers
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-bordereaux.mjs            → dry-run (affiche le SQL)
 *   node scripts/migration-bordereaux.mjs --apply    → exécute la migration
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const sql = [
  // Table bordereaux
  `CREATE TABLE IF NOT EXISTS bordereaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,
    division_id INT NOT NULL,
    agent_id INT,
    date_transmission DATETIME DEFAULT CURRENT_TIMESTAMP,
    observation TEXT,
    statut ENUM('BROUILLON','EMIS','RECU_PAR_DIVISION','ARCHIVE') DEFAULT 'BROUILLON',
    date_reception_division DATETIME NULL,
    recu_par INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (recu_par) REFERENCES agents(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Table de liaison bordereaux_dossiers
  `CREATE TABLE IF NOT EXISTS bordereaux_dossiers (
    bordereau_id INT NOT NULL,
    dossier_id INT NOT NULL,
    ordre INT DEFAULT 0,
    PRIMARY KEY (bordereau_id, dossier_id),
    FOREIGN KEY (bordereau_id) REFERENCES bordereaux(id) ON DELETE CASCADE,
    FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Index utiles
  `CREATE INDEX IF NOT EXISTS idx_bordereaux_division ON bordereaux(division_id);`,
  `CREATE INDEX IF NOT EXISTS idx_bordereaux_statut ON bordereaux(statut);`,
  `CREATE INDEX IF NOT EXISTS idx_bordereaux_date ON bordereaux(date_transmission);`,
  `CREATE INDEX IF NOT EXISTS idx_bordereaux_dossiers_dossier ON bordereaux_dossiers(dossier_id);`,
];

async function main() {
  console.log(APPLY ? '=== APPLICATION DE LA MIGRATION ===' : '=== DRY-RUN (aucun écriture) ===');

  for (const stmt of sql) {
    const oneLine = stmt.replace(/\s+/g, ' ').trim();
    console.log(APPLY ? `→ ${oneLine}` : `Would execute: ${oneLine}`);
    if (APPLY) {
      await db.query(stmt);
    }
  }

  if (APPLY) {
    console.log('✅ Migration appliquée avec succès.');
  } else {
    console.log('⚡ Dry-run terminé. Relancez avec --apply pour écrire.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur migration :', err.message);
    process.exit(1);
  });