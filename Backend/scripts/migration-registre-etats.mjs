/**
 * Migration : le registre de conformité reflétait un état dépassé.
 *
 * Le registre porte, exigence par exigence, l'état de ce que le cahier
 * demande. Huit entrées n'étaient plus exactes après les travaux
 * récents :
 *
 *   - six exigences de **fiche de contrôle de Solde** disaient « aucune
 *     table de fiche de contrôle ». La fiche existe : c'est l'opération
 *     `SOLDE_FICHE_CONTROLE`, avec ses trois champs propres — date de
 *     contrôle, résultat, version produite — et son cycle complet, saisie
 *     par le vérificateur et contrôlée par le chef de division ;
 *   - l'**administrateur surveillant les performances** n'avait pas d'écran.
 *     Il en a un : l'écran Performance, que le tableau de bord et les
 *     rapports alimentent ;
 *   - le **monitoring** était tenu pour non construit. La performance du
 *     service est mesurée ; celle de la machine ne l'est plus, l'écran de
 *     supervision ayant été retiré comme hors du thème du projet. L'exigence
 *     devient donc partielle, et le motif le dit.
 *
 * On ne marque « livrée » que ce que l'on peut prouver : le cycle de la
 * fiche de contrôle est vérifié par le script `test-e2e-operations` et
 * par la campagne de contrôle des écrans.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-registre-etats.mjs            → relevé
 *   node scripts/migration-registre-etats.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

/**
 * Les corrections, entrée par entrée.
 *
 * `etat` est le nouvel état ; `motif` la raison, écrite pour qu'elle reste
 * lisible dans le registre.
 */
const CORRECTIONS = [
  {
    document: 'HISTORIQUE',
    numero: 39,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'HISTORIQUE',
    numero: 43,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'HISTORIQUE',
    numero: 44,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'HISTORIQUE',
    numero: 248,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'HISTORIQUE',
    numero: 252,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'HISTORIQUE',
    numero: 253,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'OBLIGATOIRE',
    numero: 189,
    etat: 'LIVREE',
    motif: null,
  },
  {
    document: 'OBLIGATOIRE',
    numero: 132,
    etat: 'PARTIELLE',
    motif: 'La performance du service est mesurée (écran Performance : délais, dossiers en '
      + 'retard, répartition par division et par agent). La supervision de la machine '
      + '— processeur, mémoire, disque — a été retirée : elle relève de l’infrastructure '
      + 'et non de la gestion des dossiers.',
  },
];

/** Le motif commun aux six exigences de fiche de contrôle. */
const MOTIF_FICHE = 'La fiche de contrôle de Solde est l’opération SOLDE_FICHE_CONTROLE : '
  + 'elle porte ses trois champs propres — date de contrôle, résultat, version produite — '
  + 'et suit le cycle commun, saisie par le vérificateur et contrôlée par le chef de '
  + 'division, qui ne peut pas contrôler sa propre saisie. Les rubriques se règlent '
  + 'depuis Référentiel › Schémas d’opérations, sans développement.';

async function main() {
  console.log(APPLY
    ? '=== APPLICATION MIGRATION ÉTATS DU REGISTRE ==='
    : '=== RELEVÉ (dry-run) ===');

  let corriges = 0;
  let deja = 0;
  let absents = 0;

  for (const correction of CORRECTIONS) {
    const [entree] = await db.query(
      `SELECT id, etat, motif, libelle FROM referentiel_fonctionnalites
       WHERE document = ? AND numero_source = ?`,
      [correction.document, correction.numero]
    );

    if (!entree) {
      console.log(`  ⚠️  ${correction.document}/${correction.numero} : introuvable`);
      absents += 1;
      continue;
    }

    const motif = correction.motif !== null
      ? correction.motif
      : (correction.numero === 189
        ? 'L’administrateur dispose de l’écran Performance : indicateurs de traitement, '
          + 'dossiers en retard, répartition par division et par agent, évolution sur douze '
          + 'mois. Tous les chiffres sont restreints au périmètre de chacun.'
        : MOTIF_FICHE);

    if (entree.etat === correction.etat && (entree.motif || null) === (motif || null)) {
      deja += 1;
      console.log(`  =    ${correction.document}/${correction.numero} déjà à jour`);
      continue;
    }

    console.log(`  ${entree.etat} → ${correction.etat}  ${correction.document}/${correction.numero}`);
    console.log(`       ${entree.libelle}`);

    if (APPLY) {
      await db.query(
        'UPDATE referentiel_fonctionnalites SET etat = ?, motif = ? WHERE id = ?',
        [correction.etat, motif, entree.id]
      );
    }
    corriges += 1;
  }

  console.log(APPLY
    ? `\n✅ ${corriges} entrée(s) corrigée(s), ${deja} déjà à jour, ${absents} introuvable(s).`
    : `\n⚡ ${corriges} entrée(s) à corriger, ${deja} déjà à jour, ${absents} introuvable(s).`);

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
