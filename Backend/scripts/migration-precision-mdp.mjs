/**
 * Migration : précision à la milliseconde sur la date de changement de mot
 * de passe.
 *
 * Le jeton JWT porte un `iat` en **secondes**. Or la révocation des sessions
 * compare l'instant d'émission du jeton à la date du dernier changement de
 * mot de passe. Avec une résolution à la seconde, les deux cas « émis
 * juste avant » et « émis juste après » sont indiscernables : un jeton émis
 * dans la même seconde que le changement peut être pris pour antérieur — ou
 * pour postérieur.
 *
 * Le cas se produit, et il est concret : un administrateur réinitialise le
 * mot de passe d'un agent, et l'agent se connecte dans la même seconde. Son
 * jeton, émis à `T` alors que le changement est daté de `T`, était traité
 * comme antérieur : sa session était refusée à l'instant même de sa
 * connexion.
 *
 * La correction est de passer la colonne en millisecondes, et d'horodater le
 * jeton au millième près (`iatMs`). La comparaison devient exacte : plus
 * aucune fenêtre d'ambiguïté.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-precision-mdp.mjs            → dry-run
 *   node scripts/migration-precision-mdp.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const SQL = `ALTER TABLE users
  MODIFY COLUMN mot_de_passe_change_le DATETIME(3) NULL DEFAULT NULL`;

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION PRÉCISION MOT DE PASSE ===' : '=== DRY-RUN ===');

  const columns = await db.query(
    "SHOW COLUMNS FROM users LIKE 'mot_de_passe_change_le'"
  );
  const type = columns[0]?.Type || 'inconnue';
  console.log(`Type actuel : ${type}`);

  if (type.startsWith('datetime(3)')) {
    console.log('✅ La colonne est déjà en millisecondes : rien à faire.');
    process.exit(0);
  }

  if (APPLY) {
    await db.query(SQL);
    console.log('✅ Colonne convertie en DATETIME(3).');
  } else {
    console.log(`Would execute: ${SQL.replace(/\s+/g, ' ')}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
