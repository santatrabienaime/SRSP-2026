/**
 * Migration : statut « brouillon ».
 *
 * Le cahier des fonctionnalités demande, au §2.2 et au §4.1, de permettre
 * « l'enregistrement en brouillon lorsque le processus le permet ». Un
 * brouillon est un dossier saisi mais pas encore publié : il ne déclenche
 * aucune notification, n'est orienté vers personne, et n'apparaît que chez
 * son auteur.
 *
 * Il conserve son numéro : la référence interne ne doit jamais être
 * réutilisée, un brouillon abandonné ne rend donc pas son numéro disponible.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-brouillon.mjs            → dry-run
 *   node scripts/migration-brouillon.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION BROUILLON ===' : '=== DRY-RUN ===');

  const rows = await db.query(
    "SELECT id, code, libelle, ordre FROM statuts_dossiers WHERE code = 'BROUILLON'"
  );

  if (rows[0]) {
    console.log(`Statut BROUILLON déjà présent (id ${rows[0].id}).`);
  } else {
    if (APPLY) {
      /* Le brouillon précède tout : il occupe la première place de l'ordre,
         pour que les écrans le placent avant « Reçu ». */
      await db.query(
        `INSERT INTO statuts_dossiers (code, libelle, ordre) VALUES ('BROUILLON', 'Brouillon', 0)`
      );
      await db.query('UPDATE statuts_dossiers SET ordre = ordre + 1 WHERE ordre >= 0');
      await db.query(
        `UPDATE statuts_dossiers SET ordre = 0 WHERE code = 'BROUILLON'`
      );
      console.log('Statut BROUILLON inséré.');
    } else {
      console.log("Would insert: BROUILLON / 'Brouillon' / ordre 0");
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
