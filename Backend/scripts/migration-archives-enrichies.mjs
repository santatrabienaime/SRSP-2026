/**
 * Migration : enrichissement table archives
 *
 * Ajoute : reference_archivage, emplacement_physique, localisation_numerique
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-archives-enrichies.mjs            → dry-run
 *   node scripts/migration-archives-enrichies.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const sql = [
  // reference_archivage : ex. ARCH-2026-000001
  `ALTER TABLE archives 
   ADD COLUMN IF NOT EXISTS reference_archivage VARCHAR(50) UNIQUE 
   AFTER date_archivage;`,

  // emplacement_physique : armoire, boîte, étagère, référence interne
  `ALTER TABLE archives 
   ADD COLUMN IF NOT EXISTS emplacement_physique VARCHAR(255) 
   AFTER reference_archivage;`,

  // localisation_numerique : chemin/URL vers le fichier numérique
  `ALTER TABLE archives 
   ADD COLUMN IF NOT EXISTS localisation_numerique VARCHAR(500) 
   AFTER emplacement_physique;`,

  // Index pour recherche par référence
  `CREATE INDEX IF NOT EXISTS idx_archives_reference ON archives(reference_archivage);`,

  // Index pour tri/filtre par emplacement
  `CREATE INDEX IF NOT EXISTS idx_archives_emplacement ON archives(emplacement_physique);`,

  // Générer les références pour les archives existantes (si --apply)
  ...(APPLY ? [
    `UPDATE archives a
     JOIN (
       SELECT id, ROW_NUMBER() OVER (ORDER BY date_archivage) AS rn
       FROM archives
       WHERE reference_archivage IS NULL OR reference_archivage = ''
     ) b ON a.id = b.id
     SET a.reference_archivage = CONCAT('ARCH-', YEAR(date_archivage), '-', LPAD(b.rn, 6, '0'));`
  ] : []),
];

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION ARCHIVES ENRICHIES ===' : '=== DRY-RUN (aucun écriture) ===');

  for (const stmt of sql) {
    const oneLine = stmt.replace(/\s+/g, ' ').trim();
    console.log(APPLY ? `→ ${oneLine}` : `Would execute: ${oneLine}`);
    if (APPLY) {
      try {
        await db.query(stmt);
      } catch (e) {
        console.warn('⚠️  Ignoré (peut-être déjà appliqué) :', e.message);
      }
    }
  }

  if (APPLY) {
    console.log('✅ Migration archives enrichies appliquée.');
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