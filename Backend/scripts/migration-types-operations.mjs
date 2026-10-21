/**
 * Migration : types d'opérations SOLDE et PENSIONS.
 *
 * Le cahier des fonctionnalités distingue, pour chaque division, des
 * **types d'opérations** qui n'ont pas le même circuit :
 *
 *   - Solde (§7.2) : mandatement, fiche de contrôle, dossier mère, transfert
 *     de localité, avance de solde, trop-perçu, certificat de cessation de
 *     paiement, bon de caisse, domiciliation irrévocable de salaire ;
 *   - Pensions (§8.2) : liquidation, dossier mère, lettre de prescription,
 *     demande de dossier mère, opposition sur pension, derniers arrérages,
 *     bon de caisse en retour, certificat de cessation de paiement.
 *
 * Ces types sont des **sous-types** de dossier : c'est le mécanisme déjà en
 * place pour les types d'acte VISA. Un sous-type porte un libellé, un code
 * et une portée sur les pièces obligatoires.
 *
 * Le mécanisme de dépouillement résout déjà les pièces par type ET par
 * sous-type : une pièce sans sous-type s'applique à tous les sous-types du
 * type. Les pièces existantes de Solde et de Pensions restent donc valables,
 * et l'administrateur peut ensuite les différencier par opération depuis
 * l'écran « Référentiel », sans que la présente migration n'invente une
 * liste de pièces que le SRSP n'a pas validée.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-types-operations.mjs            → dry-run
 *   node scripts/migration-types-operations.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

/**
 * Types d'opérations, par division.
 *
 * `code` est stable : il identifie l'opération dans le dossier, et ne sera
 * plus modifié. `libelle` est ce que l'agent voit.
 */
const OPERATIONS = {
  SOLDE: [
    { code: 'SOLDE_MANDATEMENT', libelle: 'Mandatement', ordre: 10 },
    { code: 'SOLDE_FICHE_CONTROLE', libelle: 'Fiche de contrôle de solde', ordre: 20 },
    { code: 'SOLDE_DOSSIERE_MERE', libelle: 'Dossier mère', ordre: 30 },
    { code: 'SOLDE_TRANSFERT_LOCALITE', libelle: 'Transfert de localité', ordre: 40 },
    { code: 'SOLDE_AVANCE', libelle: 'Avance de solde', ordre: 50 },
    { code: 'SOLDE_TROP_PERCU', libelle: 'Trop-perçu', ordre: 60 },
    { code: 'SOLDE_CERTIFICAT_CESSATION', libelle: 'Certificat de cessation de paiement', ordre: 70 },
    { code: 'SOLDE_BON_CAISSE', libelle: 'Bon de caisse', ordre: 80 },
    { code: 'SOLDE_DOMICILIATION', libelle: 'Domiciliation irrévocable de salaire', ordre: 90 },
  ],
  PENSION: [
    { code: 'PENSION_LIQUIDATION', libelle: 'Liquidation de pension', ordre: 10 },
    { code: 'PENSION_DOSSIERE_MERE', libelle: 'Dossier mère pension', ordre: 20 },
    { code: 'PENSION_LETTRE_PRESCRIPTION', libelle: 'Lettre de prescription', ordre: 30 },
    { code: 'PENSION_DEMANDE_DOSSIERE_MERE', libelle: 'Demande de dossier mère', ordre: 40 },
    { code: 'PENSION_OPPOSITION', libelle: 'Opposition sur pension', ordre: 50 },
    { code: 'PENSION_DERNIERS_ARRERAGES', libelle: 'Derniers arrérages', ordre: 60 },
    { code: 'PENSION_BON_CAISSE_RETOUR', libelle: 'Bon de caisse en retour', ordre: 70 },
    { code: 'PENSION_CERTIFICAT_CESSATION', libelle: 'Certificat de cessation de paiement', ordre: 80 },
  ],
};

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION TYPES D\'OPÉRATIONS ===' : '=== DRY-RUN ===');

  for (const [typeCode, operations] of Object.entries(OPERATIONS)) {
    const [type] = await db.query(
      'SELECT id FROM types_dossiers WHERE code = ?',
      [typeCode]
    );
    if (!type) {
      console.warn(`Type de dossier ${typeCode} introuvable : opérations ignorées.`);
      continue;
    }

    for (const op of operations) {
      const rows = await db.query(
        `SELECT id FROM sous_types_dossiers WHERE type_dossier_id = ? AND code = ?`,
        [type.id, op.code]
      );
      if (rows[0]) {
        console.log(`${op.code} : déjà présent`);
        continue;
      }
      if (APPLY) {
        await db.query(
          `INSERT INTO sous_types_dossiers (type_dossier_id, code, libelle, actif, ordre)
           VALUES (?, ?, ?, 1, ?)`,
          [type.id, op.code, op.libelle, op.ordre]
        );
        console.log(`${op.code} : inséré`);
      } else {
        console.log(`Would insert: ${op.code} / ${op.libelle}`);
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
