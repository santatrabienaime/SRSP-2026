/**
 * Migration : schémas de données par type d'opération.
 *
 * Le cahier (§ 7.2, § 8.2) décrit, pour chaque opération, les données qui lui
 * sont propres : une fiche de contrôle a sa date et sa version, un transfert
 * de localité a une localité d'origine et une de destination, un bon de caisse
 * a une mention « Vu bon à payer » et une signature.
 *
 * Until là, l'écran de saisie portait les mêmes champs pour toutes les
 * opérations : un agent qui instruit une domiciliation voyait un champ
 * « période concernée » qui ne le concernait pas, et ne voyait pas le champ
 * qui le concernait.
 *
 * Un **schéma par opération** décrit les champs qui s'appliquent, leur
 * libellé, leur type, leur caractère obligatoire et leur aide. Le formulaire
 * est alors tiré du schéma : il ne montre que ce qui concerne l'opération en
 * cours, et il evolve quand l'administration le fait évoluer — sans
 * développement.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-schemas-operations.mjs            → dry-run
 *   node scripts/migration-schemas-operations.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const SQL = `CREATE TABLE IF NOT EXISTS schemas_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sous_type_id INT NOT NULL,
  cle VARCHAR(60) NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  type_champ VARCHAR(20) NOT NULL DEFAULT 'texte',
  requis TINYINT(1) NOT NULL DEFAULT 0,
  options VARCHAR(500) NULL,
  aide VARCHAR(255) NULL,
  ordre SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_schema_champ (sous_type_id, cle),
  KEY idx_schema_sous_type (sous_type_id),
  CONSTRAINT fk_schema_sous_type FOREIGN KEY (sous_type_id) REFERENCES sous_types_dossiers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

/**
 * Les champs communs, que le panneau ajoute à ceux de l'opération.
 *
 * Ce sont les dénominateurs communs à toutes les opérations d'une division
 * (cahier § 7.5, § 8.5) : la référence externe, le dossier mère, la période,
 * le montant et sa source, la date de référence, le destinataire, la
 * localité.
 */
const CHAMPS_COMMUNS = [
  { cle: 'reference_externe', libelle: 'Référence externe', type_champ: 'texte', ordre: 10, aide: 'La référence de l’opération : bon, mandat, opposition…' },
  { cle: 'reference_dossier_mere', libelle: 'Référence du dossier mère', type_champ: 'texte', ordre: 20, aide: 'Le dossier permanent de l’agent, s’il en existe un' },
  { cle: 'matricule', libelle: 'Matricule', type_champ: 'texte', ordre: 30 },
  { cle: 'periode', libelle: 'Période concernée', type_champ: 'texte', ordre: 40 },
  { cle: 'montant', libelle: 'Montant (Ar)', type_champ: 'nombre', ordre: 50, aide: 'Saisi, jamais calculé' },
  { cle: 'source_montant', libelle: 'Source du montant', type_champ: 'texte', ordre: 60, aide: 'D’où vient la somme : un relevé, une décision, un barème' },
  { cle: 'date_reference', libelle: 'Date de référence', type_champ: 'date', ordre: 70 },
  { cle: 'destinataire', libelle: 'Destinataire', type_champ: 'texte', ordre: 80 },
  { cle: 'localisation', libelle: 'Localité', type_champ: 'texte', ordre: 90 },
  { cle: 'observation', libelle: 'Observation', type_champ: 'textarea', ordre: 100 },
];

/**
 * Les champs propres à chaque opération, d'après la description du cahier.
 *
 * Les libellés et les aides viennent du texte du cahier lui-même : une fiche
 * de contrôle « marque la date de contrôle, conserve les observations et la
 * version produite ».
 */
const SCHEMAS = {
  /* ── Solde (§ 7.2) ─────────────────────────────────────────────── */
  SOLDE_MANDATEMENT: [
    { cle: 'numero_mandat', libelle: 'Numéro du mandat', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'mode_reglement', libelle: 'Mode de règlement', type_champ: 'choix', options: 'Virement|Espèces|Chèque', requis: 1, ordre: 120 },
    { cle: 'date_mandat', libelle: 'Date du mandat', type_champ: 'date', requis: 1, ordre: 130 },
    { cle: 'service_destinataire', libelle: 'Service destinataire', type_champ: 'texte', ordre: 140 },
  ],
  SOLDE_FICHE_CONTROLE: [
    { cle: 'date_controle', libelle: 'Date de contrôle', type_champ: 'date', requis: 1, ordre: 110 },
    { cle: 'resultat_controle', libelle: 'Résultat du contrôle', type_champ: 'choix', options: 'Conforme|Non conforme|À revoir', requis: 1, ordre: 120 },
    { cle: 'version_produite', libelle: 'Version produite', type_champ: 'texte', ordre: 130, aide: 'La version de la fiche, telle qu’elle a été produite' },
  ],
  SOLDE_DOSSIERE_MERE: [
    { cle: 'emplacement_dossier', libelle: 'Emplacement de conservation', type_champ: 'texte', ordre: 110 },
    { cle: 'date_archivage_dossier', libelle: 'Date d’archivage', type_champ: 'date', ordre: 120 },
    { cle: 'mouvements', libelle: 'Mouvements enregistrés', type_champ: 'textarea', ordre: 130, aide: 'Les mouvements du dossier permanent, selon la procédure validée' },
  ],
  SOLDE_TRANSFERT_LOCALITE: [
    { cle: 'localite_origine', libelle: 'Localité d’origine', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'localite_destination', libelle: 'Localité de destination', type_champ: 'texte', requis: 1, ordre: 120 },
    { cle: 'date_transfert', libelle: 'Date du transfert', type_champ: 'date', requis: 1, ordre: 130 },
    { cle: 'suivi_transfert', libelle: 'État du suivi', type_champ: 'choix', options: 'Initié|Transmis|Reçu', ordre: 140 },
  ],
  SOLDE_AVANCE: [
    { cle: 'duree_mois', libelle: 'Durée (mois)', type_champ: 'nombre', requis: 1, ordre: 110 },
    { cle: 'mois_rembourses', libelle: 'Mois remboursés', type_champ: 'nombre', ordre: 120 },
    { cle: 'taux_retenue', libelle: 'Taux de retenue (%)', type_champ: 'nombre', ordre: 130, aide: 'Le taux appliqué, tel que retenu par l’agent habilité' },
    { cle: 'decompte_valide', libelle: 'Décompte validé (Ar)', type_champ: 'nombre', requis: 1, ordre: 140, aide: 'Le décompte, tel qu’il a été calculé ou validé par l’agent habilité' },
  ],
  SOLDE_TROP_PERCU: [
    { cle: 'references_decompte', libelle: 'Références de l’état de décompte', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'bons_caisse', libelle: 'Bons de caisse adressés', type_champ: 'texte', ordre: 120 },
    { cle: 'etat_suivi', libelle: 'État du suivi', type_champ: 'choix', options: 'À établir|Transmis|Encaissé', ordre: 130 },
  ],
  SOLDE_CERTIFICAT_CESSATION: [
    { cle: 'numero_demande', libelle: 'Numéro de la demande', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_demande', libelle: 'Date de la demande', type_champ: 'date', requis: 1, ordre: 120 },
    { cle: 'date_controle_certificat', libelle: 'Date du contrôle réalisé', type_champ: 'date', ordre: 130 },
    { cle: 'date_transmission_certificat', libelle: 'Date de transmission', type_champ: 'date', ordre: 140 },
  ],
  SOLDE_BON_CAISSE: [
    { cle: 'reference_bon', libelle: 'Référence du bon', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_emission_bon', libelle: 'Date d’émission', type_champ: 'date', requis: 1, ordre: 120 },
    { cle: 'etape_controle_bon', libelle: 'Étape de contrôle', type_champ: 'choix', options: 'À contrôler|Contrôlé|Vu bon à payer', requis: 1, ordre: 130 },
    { cle: 'signataire_bon', libelle: 'Signataire', type_champ: 'texte', ordre: 140 },
    { cle: 'date_signature_bon', libelle: 'Date de signature', type_champ: 'date', ordre: 150 },
    { cle: 'motif_retour_bon', libelle: 'Motif du retour', type_champ: 'texte', ordre: 160 },
  ],
  SOLDE_DOMICILIATION: [
    { cle: 'reference_domiciliation', libelle: 'Référence de la demande', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_domiciliation', libelle: 'Date de la demande', type_champ: 'date', requis: 1, ordre: 120 },
    { cle: 'etat_domiciliation', libelle: 'État du traitement', type_champ: 'choix', options: 'Reçue|Instruite|Classée', ordre: 130 },
    { cle: 'date_classement', libelle: 'Date de classement', type_champ: 'date', ordre: 140 },
  ],

  /* ── Pensions (§ 8.2) ──────────────────────────────────────────── */
  PENSION_LIQUIDATION: [
    { cle: 'annees_service', libelle: 'Années de service', type_champ: 'nombre', requis: 1, ordre: 110 },
    { cle: 'indice_final', libelle: 'Indice final', type_champ: 'nombre', ordre: 120 },
    { cle: 'pension_brute', libelle: 'Pension brute (Ar)', type_champ: 'nombre', ordre: 130 },
    { cle: 'retenues', libelle: 'Retenues (Ar)', type_champ: 'nombre', ordre: 140 },
    { cle: 'date_calcul', libelle: 'Date du calcul', type_champ: 'date', requis: 1, ordre: 150 },
  ],
  PENSION_DOSSIERE_MERE: [
    { cle: 'emplacement_dossier', libelle: 'Emplacement de conservation', type_champ: 'texte', ordre: 110 },
    { cle: 'date_archivage_dossier', libelle: 'Date d’archivage', type_champ: 'date', ordre: 120 },
  ],
  PENSION_LETTRE_PRESCRIPTION: [
    { cle: 'type_lettre', libelle: 'Type de lettre', type_champ: 'choix', options: 'Prescription|Notification|Information', requis: 1, ordre: 110 },
    { cle: 'objet_lettre', libelle: 'Objet', type_champ: 'texte', requis: 1, ordre: 120 },
    { cle: 'date_lettre', libelle: 'Date de la lettre', type_champ: 'date', requis: 1, ordre: 130 },
  ],
  PENSION_DEMANDE_DOSSIERE_MERE: [
    { cle: 'objet_demande_mere', libelle: 'Objet de la demande', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_demande_mere', libelle: 'Date de la demande', type_champ: 'date', requis: 1, ordre: 120 },
    { cle: 'reponse_demande_mere', libelle: 'Réponse reçue', type_champ: 'textarea', ordre: 130 },
  ],
  PENSION_OPPOSITION: [
    { cle: 'type_opposition', libelle: 'Type d’opposition', type_champ: 'choix', options: 'Pension alimentaire|Cession volontaire|Saisie-arrêt', requis: 1, ordre: 110 },
    { cle: 'reference_opposition', libelle: 'Référence de l’opposition', type_champ: 'texte', requis: 1, ordre: 120 },
    { cle: 'date_signification', libelle: 'Date de signification', type_champ: 'date', ordre: 130 },
    { cle: 'destinataire_central', libelle: 'Destinataire central', type_champ: 'texte', ordre: 140 },
    { cle: 'reference_bordereau_central', libelle: 'Référence du bordereau', type_champ: 'texte', ordre: 150 },
  ],
  PENSION_DERNIERS_ARRERAGES: [
    { cle: 'references_arrerages', libelle: 'Références des arrérages', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_transmission_central', libelle: 'Date de transmission centrale', type_champ: 'date', ordre: 120 },
    { cle: 'destinataire_central', libelle: 'Destinataire central', type_champ: 'texte', ordre: 130 },
    { cle: 'reference_bordereau_central', libelle: 'Référence du bordereau', type_champ: 'texte', ordre: 140 },
  ],
  PENSION_BON_CAISSE_RETOUR: [
    { cle: 'reference_bon_retour', libelle: 'Référence du bon', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_retour_bon', libelle: 'Date de retour', type_champ: 'date', requis: 1, ordre: 120 },
    { cle: 'motif_retour', libelle: 'Motif du retour', type_champ: 'texte', requis: 1, ordre: 130 },
    { cle: 'suite_donnee', libelle: 'Suite donnée', type_champ: 'textarea', ordre: 140 },
  ],
  PENSION_CERTIFICAT_CESSATION: [
    { cle: 'numero_demande', libelle: 'Numéro de la demande', type_champ: 'texte', requis: 1, ordre: 110 },
    { cle: 'date_demande', libelle: 'Date de la demande', type_champ: 'date', requis: 1, ordre: 120 },
    { cle: 'date_controle_certificat', libelle: 'Date du contrôle réalisé', type_champ: 'date', ordre: 130 },
    { cle: 'date_transmission_certificat', libelle: 'Date de transmission', type_champ: 'date', ordre: 140 },
  ],
};

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION SCHÉMAS D\'OPÉRATIONS ===' : '=== DRY-RUN ===');

  if (APPLY) {
    await db.query(SQL);
    console.log('→ Table schemas_operations créée');
  } else {
    console.log(`Would execute: ${SQL.replace(/\s+/g, ' ').slice(0, 90)}…`);
  }

  /* Les sous-types sont recherchés par code : le seed doit rester
     idempotent et lisible. */
  const sousTypes = await db.query(
    `SELECT st.id, st.code FROM sous_types_dossiers st`
  );
  const parCode = new Map(sousTypes.map((s) => [s.code, s.id]));

  let inserees = 0;
  let synchronisees = 0;

  for (const [codeOperation, champs] of Object.entries(SCHEMAS)) {
    const sousTypeId = parCode.get(codeOperation);
    if (!sousTypeId) {
      console.warn(`Sous-type ${codeOperation} introuvable : schéma ignoré.`);
      continue;
    }
    const tous = [...CHAMPS_COMMUNS, ...champs];
    for (const champ of tous) {
      const cle = String(champ.cle || '').trim().toLowerCase().replace(/\s+/g, '_');
      const [existant] = await db.query(
        'SELECT id FROM schemas_operations WHERE sous_type_id = ? AND cle = ?',
        [sousTypeId, cle]
      );
      if (existant) {
        /* Le schéma est **synchronisé**, pas seulement inséré : relancer la
           migration après avoir corrigé un libellé ou un caractère obligatoire
           doit mettre le schéma à jour, sans créer de doublon. */
        if (APPLY) {
          await db.query(
            `UPDATE schemas_operations
             SET libelle = ?, type_champ = ?, requis = ?, options = ?, aide = ?, ordre = ?
             WHERE id = ?`,
            [
              champ.libelle,
              champ.type_champ || 'texte',
              champ.requis ? 1 : 0,
              champ.options || null,
              champ.aide || null,
              champ.ordre || 0,
              existant.id,
            ]
          );
          synchronisees += 1;
        }
        continue;
      }
      if (APPLY) {
        await db.query(
          `INSERT INTO schemas_operations
             (sous_type_id, cle, libelle, type_champ, requis, options, aide, ordre)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sousTypeId,
            cle,
            champ.libelle,
            champ.type_champ || 'texte',
            champ.requis ? 1 : 0,
            champ.options || null,
            champ.aide || null,
            champ.ordre || 0,
          ]
        );
        inserees += 1;
      } else {
        ecrites += 1;
      }
    }
  }

  console.log(APPLY
    ? `✅ ${inserees} champ(s) insérés, ${synchronisees} synchronisé(s).`
    : `Would insert ${ecrites} champ(s) de schéma.`);

  /* La permission de configuration des schémas. Elle est distincte de
     `configurer_pieces` : les pièces et les formulaires d'opération sont deux
     objets de référence différents, et les faire évoluer est deux Gestes
     distincts — dont la trace doit rester lisible dans le journal d'audit. */
  const [permission] = await db.query(
    "SELECT id FROM permissions WHERE nom = 'configurer_operations'"
  );
  if (!permission) {
    if (APPLY) {
      await db.query(
        'INSERT INTO permissions (nom, description) VALUES (?, ?)',
        [
          'configurer_operations',
          'Configurer les champs de saisie des opérations, par type d\'opération',
        ]
      );
      console.log('Permission configurer_operations : créée');
    }
  }

  const [roleAdmin] = await db.query("SELECT id FROM roles WHERE nom = 'ADMIN'");
  if (roleAdmin) {
    const [p] = await db.query(
      "SELECT id FROM permissions WHERE nom = 'configurer_operations'"
    );
    if (p) {
      const deja = await db.query(
        'SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [roleAdmin.id, p.id]
      );
      if (!deja[0]) {
        if (APPLY) {
          await db.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [roleAdmin.id, p.id]
          );
          console.log('Permission configurer_operations → ADMIN');
        }
      }
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
