/**
 * Seed : types de pièces pour VISA, SOLDE, PENSION (en plus des SECOURS existants)
 *
 * Usage (depuis Backend/) :
 *   node scripts/seed-types-pieces.mjs            → dry-run
 *   node scripts/seed-types-pieces.mjs --apply    → insère en base
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const typesPieces = [
  // --- VISA ---
  { code: 'VISA_ACTE_MARIAGE', libelle: 'Acte de mariage', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 10, division_code: 'VISA' },
  { code: 'VISA_ACTE_NAISSANCE', libelle: 'Acte de naissance', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 20, division_code: 'VISA' },
  { code: 'VISA_CERTIFICAT_MEDICAL', libelle: 'Certificat médical', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 30, division_code: 'VISA' },
  { code: 'VISA_DECISION', libelle: 'Décision de visa', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 40, division_code: 'VISA' },
  { code: 'VISA_ETAT_SIGNATURE', libelle: 'État de signature', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 10, division_code: 'VISA' },
  { code: 'VISA_PV_RECEPTION', libelle: 'PV de réception', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 20, division_code: 'VISA' },

  // --- SOLDE ---
  { code: 'SOLDE_FICHE_LIQUIDATION', libelle: 'Fiche de liquidation', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 10, division_code: 'SOLDE' },
  { code: 'SOLDE_DECOMPTE', libelle: 'Décompte de solde', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 20, division_code: 'SOLDE' },
  { code: 'SOLDE_ETAT_EMARGEMENT', libelle: 'État d\'émargement', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 30, division_code: 'SOLDE' },
  { code: 'SOLDE_CACHET_MANDATEMENT', libelle: 'Cachet de mandatement', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 10, division_code: 'SOLDE' },
  { code: 'SOLDE_SIGNATURE_ORDONNATEUR', libelle: 'Signature de l\'ordonnateur', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 20, division_code: 'SOLDE' },
  { code: 'SOLDE_REF_LOGICIEL', libelle: 'Référence logiciel solde', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 30, division_code: 'SOLDE' },

  // --- PENSION ---
  { code: 'PENSION_DEMANDE', libelle: 'Demande de pension', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 10, division_code: 'PENSION' },
  { code: 'PENSION_ACTE_DECES', libelle: 'Acte de décès', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 20, division_code: 'PENSION' },
  { code: 'PENSION_CERTIF_NON_REMARIAGE', libelle: 'Certificat de non-remariage', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 30, division_code: 'PENSION' },
  { code: 'PENSION_LIQUIDATION', libelle: 'Liquidation de pension', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 40, division_code: 'PENSION' },
  { code: 'PENSION_ETAT_DECOMPTE', libelle: 'État de décompte pension', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 10, division_code: 'PENSION' },
  { code: 'PENSION_PV_VERIFICATION', libelle: 'PV de vérification', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 20, division_code: 'PENSION' },

  // --- SECOURS (complément aux existants) ---
  { code: 'SECOURS_CERTIFICAT_VIE', libelle: 'Certificat de vie', obligatoire: 1, phase: 'DEPOUILLEMENT', ordre: 50, division_code: 'SECOURS' },
  { code: 'SECOURS_PROCURATION', libelle: 'Procuration', obligatoire: 0, phase: 'DEPOUILLEMENT', ordre: 60, division_code: 'SECOURS' },
  { code: 'SECOURS_RIB', libelle: 'RIB du bénéficiaire', obligatoire: 1, phase: 'ARCHIVAGE', ordre: 30, division_code: 'SECOURS' },
];

async function main() {
  console.log(APPLY ? '=== INSERTION TYPES PIÈCES ===' : '=== DRY-RUN (aucun écriture) ===');

  let insere = 0, ignore = 0;
  for (const tp of typesPieces) {
    const [exist] = await db.query(
      `SELECT id FROM types_pieces WHERE code = ? AND division_code = ?`,
      [tp.code, tp.division_code]
    );
    if (exist) {
      console.log(`⊘ ${tp.division_code} / ${tp.code} : existe déjà`);
      ignore++;
      continue;
    }

    if (APPLY) {
      await db.query(
        `INSERT INTO types_pieces (code, libelle, obligatoire, phase, ordre, division_code)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tp.code, tp.libelle, tp.obligatoire, tp.phase, tp.ordre, tp.division_code]
      );
    }
    console.log(`${APPLY ? '✅' : '→'} ${tp.division_code} / ${tp.code} : ${tp.libelle}`);
    insere++;
  }

  console.log(`\n${APPLY ? 'Insérés' : 'À insérer'} : ${insere} | Ignorés (existants) : ${ignore}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  });