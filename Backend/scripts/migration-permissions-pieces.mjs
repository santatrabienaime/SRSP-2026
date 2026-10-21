/**
 * Migration : permissions manquantes pour le contrôle des pièces et les
 * correspondances.
 *
 * Le cahier (§ 7.3) confie explicitement au vérificateur Solde : « Consulter
 * les pièces et mettre à jour la checklist ». La permission
 * `depouiller_pieces` lui manquait : il pouvait traiter un dossier, mais pas
 * en contrôler les pièces — ce qui rendait son travail inutilisable.
 *
 * Même correction pour le liquidateur Pensions, qui tient la même mission
 * sur les pièces de liquidation.
 *
 * Le cahier (§ 8.3) confie aussi au liquidateur : « Produire ou rattacher
 * les correspondances d'usage, demandes de dossier mère et lettres de
 * prescription ». La permission `gerer_correspondances` n'était détenue que
 * par le chef de division : le liquidateur ne pouvait pas produire ce que
 * le dossier demandait.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-permissions-pieces.mjs            → dry-run
 *   node scripts/migration-permissions-pieces.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

/** Rôle → permissions à accorder. */
const ATTRIBUTIONS = [
  ['VERIFICATEUR_SOLDE', ['depouiller_pieces']],
  ['LIQUIDATEUR_PENSION', ['depouiller_pieces', 'gerer_correspondances']],
];

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION PERMISSIONS ===' : '=== DRY-RUN ===');

  for (const [role, permissions] of ATTRIBUTIONS) {
    const [r] = await db.query('SELECT id FROM roles WHERE nom = ?', [role]);
    if (!r) {
      console.warn(`Rôle ${role} introuvable : ignoré.`);
      continue;
    }
    for (const permission of permissions) {
      const [p] = await db.query('SELECT id FROM permissions WHERE nom = ?', [permission]);
      if (!p) {
        console.warn(`Permission ${permission} introuvable : ignorée.`);
        continue;
      }
      const deja = await db.query(
        'SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [r.id, p.id]
      );
      if (deja[0]) {
        console.log(`${role} : possède déjà ${permission}`);
        continue;
      }
      if (APPLY) {
        await db.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [r.id, p.id]
        );
        console.log(`${role} : ${permission} accordée`);
      } else {
        console.log(`Would grant ${permission} → ${role}`);
      }
    }
  }

  console.log(APPLY ? '✅ Migration appliquée.' : '⚡ Relancez avec --apply pour écrire.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
