/**
 * Migration de conformité VISA (idempotente).
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-visa-conformite.mjs            → dry-run (affiche les actions)
 *   node scripts/migration-visa-conformite.mjs --apply    → applique les changements
 *
 * Cette migration prépare le terrain du module VISA tel que décrit au cahier
 * des charges :
 *   - statut « En attente de complément » ;
 *   - sous-types de dossiers (type d'acte configurable) ;
 *   - champs VISA sur `dossiers` (référence, origine, comptable, année de
 *     référence, vérificateur, signature, exception tracée) ;
 *   - états des pièces au dépouillement (présente / manquante / illisible /
 *     à corriger) et rattachement d'un document à une pièce ;
 *   - traçabilité des réaffectations (ancien agent, auteur, motif) ;
 *   - rattachement des types de pièces au type de dossier et au sous-type ;
 *   - permissions : séparation de la suppression, retrait des pouvoirs métier
 *     de l'administrateur, archivage confié au vérificateur VISA, exception de
 *     validation réservée au Chef de Service.
 *
 * Toutes les opérations sont vérifiées avant exécution : relancer le script ne
 * produit ni doublon ni erreur.
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const log = (msg) => console.log(`${APPLY ? '✅' : '→'} ${msg}`);

async function tableExists(nom) {
  const rows = await db.query(
    `SELECT COUNT(*) AS n FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [nom]
  );
  return rows[0].n > 0;
}

async function columnExists(table, colonne) {
  const rows = await db.query(
    `SELECT COUNT(*) AS n FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, colonne]
  );
  return rows[0].n > 0;
}

async function indexExists(table, index) {
  const rows = await db.query(
    `SELECT COUNT(*) AS n FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [table, index]
  );
  return rows[0].n > 0;
}

async function exec(sql, params = []) {
  if (APPLY) await db.query(sql, params);
}

async function addColumn(table, colonne, definition) {
  if (await columnExists(table, colonne)) {
    log(`colonne ${table}.${colonne} : déjà présente`);
    return;
  }
  log(`colonne ${table}.${colonne} : ajout (${definition})`);
  await exec(`ALTER TABLE ${table} ADD COLUMN ${colonne} ${definition}`);
}

async function addIndex(table, index, definition) {
  if (await indexExists(table, index)) {
    log(`index ${table}.${index} : déjà présent`);
    return;
  }
  log(`index ${table}.${index} : ajout`);
  await exec(`ALTER TABLE ${table} ADD INDEX ${index} ${definition}`);
}

/* ─────────────────────────── 1. Statuts ─────────────────────────── */

async function migrerStatuts() {
  const rows = await db.query(`SELECT id FROM statuts_dossiers WHERE code = 'EN_ATTENTE_COMPLEMENT'`);
  if (rows[0]) {
    log('statut EN_ATTENTE_COMPLEMENT : déjà présent');
    return;
  }
  log('statut EN_ATTENTE_COMPLEMENT : ajout');
  await exec(
    `INSERT INTO statuts_dossiers (code, libelle, ordre) VALUES ('EN_ATTENTE_COMPLEMENT', 'En attente de complément', 6)`
  );
  // Décale les statuts suivants pour conserver un ordre de lecture cohérent.
  await exec(
    `UPDATE statuts_dossiers SET ordre = ordre + 1
     WHERE ordre >= 6 AND code <> 'EN_ATTENTE_COMPLEMENT'`
  );
}

/* ─────────────────── 2. Sous-types de dossiers ──────────────────── */

async function migrerSousTypes() {
  if (await tableExists('sous_types_dossiers')) {
    log('table sous_types_dossiers : déjà présente');
  } else {
    log('table sous_types_dossiers : création');
    await exec(`
      CREATE TABLE sous_types_dossiers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_dossier_id INT NOT NULL,
        code VARCHAR(50) NOT NULL,
        libelle VARCHAR(150) NOT NULL,
        actif TINYINT(1) NOT NULL DEFAULT 1,
        ordre SMALLINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_sous_type (type_dossier_id, code),
        KEY idx_sous_type_type (type_dossier_id),
        CONSTRAINT fk_sous_type_type FOREIGN KEY (type_dossier_id) REFERENCES types_dossiers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  /* Types d'acte VISA initiaux. Ils sont modifiables par l'administrateur
     (création, libellé, désactivation) : ces lignes ne sont qu'un point de
     départ, pas une liste fermée. La clé (type, code) rend le seed idempotent. */
  const SOUS_TYPES_VISA = [
    { code: 'VISA_MARIAGE', libelle: 'Visa de mariage', ordre: 10 },
    { code: 'VISA_NAISSANCE', libelle: 'Visa de naissance', ordre: 20 },
    { code: 'VISA_DECES', libelle: 'Visa de décès', ordre: 30 },
    { code: 'VISA_SEJOUR', libelle: 'Visa de séjour', ordre: 40 },
    { code: 'VISA_AUTRE', libelle: 'Autre acte à viser', ordre: 90 },
  ];
  for (const st of SOUS_TYPES_VISA) {
    const rows = await db.query(
      `SELECT st.id FROM sous_types_dossiers st
       JOIN types_dossiers t ON t.id = st.type_dossier_id
       WHERE t.code = 'VISA' AND st.code = ?`,
      [st.code]
    );
    if (rows[0]) {
      log(`sous-type VISA ${st.code} : déjà présent`);
      continue;
    }
    log(`sous-type VISA ${st.code} : insertion (${st.libelle})`);
    await exec(
      `INSERT INTO sous_types_dossiers (type_dossier_id, code, libelle, ordre)
       SELECT id, ?, ?, ? FROM types_dossiers WHERE code = 'VISA' LIMIT 1`,
      [st.code, st.libelle, st.ordre]
    );
  }
}

/* ─────────────── 3. Champs VISA sur dossiers ────────────────────── */

async function migrerDossiers() {
  await addColumn('dossiers', 'sous_type_id', 'INT NULL AFTER type_id');
  await addColumn('dossiers', 'reference_visa', 'VARCHAR(50) NULL AFTER numero');
  await addColumn('dossiers', 'date_heure_reception', 'DATETIME NULL AFTER date_reception');
  await addColumn('dossiers', 'origine_presentateur', 'VARCHAR(200) NULL');
  await addColumn('dossiers', 'comptable_presentateur', 'VARCHAR(200) NULL');
  await addColumn('dossiers', 'type_acte', 'VARCHAR(150) NULL');
  await addColumn('dossiers', 'annee_reference', 'SMALLINT NULL');
  await addColumn('dossiers', 'beneficiaire', 'VARCHAR(200) NULL');
  await addColumn('dossiers', 'organisme', 'VARCHAR(200) NULL');
  await addColumn('dossiers', 'verificateur_id', 'INT NULL');
  await addColumn('dossiers', 'date_signature', 'DATETIME NULL');
  await addColumn('dossiers', 'signataire_id', 'INT NULL');
  await addColumn('dossiers', 'reference_signature', 'VARCHAR(100) NULL');
  await addColumn('dossiers', 'exception_validation', 'TEXT NULL');
  await addColumn('dossiers', 'exception_autorisee_par', 'INT NULL');
  await addColumn('dossiers', 'date_exception', 'DATETIME NULL');
  await addColumn('dossiers', 'motif_complement', 'TEXT NULL');

  /* Les dossiers VISA antérieurs à la mise en conformité n'avaient pas de
     référence. Le numéro de dossier est déjà unique et lisible : il devient la
     référence, comme pour les créations nouvelles. */
  log('dossiers VISA : référence VISA initialisée depuis le numéro');
  await exec(`
    UPDATE dossiers d
    JOIN types_dossiers t ON t.id = d.type_id
    SET d.reference_visa = d.numero
    WHERE t.code = 'VISA' AND (d.reference_visa IS NULL OR d.reference_visa = '')
  `);

  await addIndex('dossiers', 'idx_dossiers_reference_visa', '(reference_visa)');
  if (!(await indexExists('dossiers', 'uk_dossiers_reference_visa'))) {
    log('index unique dossiers.uk_dossiers_reference_visa : ajout');
    await exec('ALTER TABLE dossiers ADD UNIQUE INDEX uk_dossiers_reference_visa (reference_visa)');
  } else {
    log('index unique dossiers.uk_dossiers_reference_visa : déjà présent');
  }
  await addIndex('dossiers', 'idx_dossiers_sous_type', '(sous_type_id)');
  await addIndex('dossiers', 'idx_dossiers_verificateur', '(verificateur_id)');
}

/* ─────────── 4. États des pièces au dépouillement ───────────────── */

async function migrerDepouillements() {
  if (!(await columnExists('depouillements', 'etat'))) {
    log('colonne depouillements.etat : ajout');
    await exec(`
      ALTER TABLE depouillements
      ADD COLUMN etat ENUM('PRESENTE','MANQUANTE','ILLISIBLE','A_CORRIGER')
        NOT NULL DEFAULT 'MANQUANTE' AFTER presente
    `);
  } else {
    log('colonne depouillements.etat : déjà présente');
  }
  await addColumn('depouillements', 'motif', 'VARCHAR(500) NULL AFTER observation');
  // Aligne l'état sur l'ancien booléen pour les lignes existantes.
  log('depouillements : synchronisation etat <- presente (lignes historiques)');
  await exec(`
    UPDATE depouillements
    SET etat = CASE WHEN presente = 1 THEN 'PRESENTE' ELSE 'MANQUANTE' END
    WHERE etat = 'MANQUANTE' AND presente = 1
  `);
}

/* ───────────── 5. Rattachement des documents à une pièce ────────── */

async function migrerDocuments() {
  await addColumn('documents', 'piece_code', 'VARCHAR(80) NULL AFTER type_id');
  await addIndex('documents', 'idx_documents_piece', '(piece_code)');
}

/* ───────── 6. Traçabilité des réaffectations ────────────────────── */

async function migrerAffectations() {
  await addColumn('affectations', 'ancien_agent_id', 'INT NULL AFTER agent_id');
  await addColumn('affectations', 'auteur_id', 'INT NULL AFTER motif');
  await addIndex('affectations', 'idx_affectations_auteur', '(auteur_id)');
}

/* ───── 7. Types de pièces : rattachement type/sous-type ─────────── */

async function migrerTypesPieces() {
  await addColumn('types_pieces', 'type_dossier_id', 'INT NULL AFTER division_code');
  await addColumn('types_pieces', 'sous_type_id', 'INT NULL AFTER type_dossier_id');
  /* Une pièce n'est jamais supprimée : elle est désactivée. Les dossiers déjà
     dépouillés gardent ainsi la trace de ce qui a été contrôlé, même si le
     référentiel ne la propose plus aux nouveaux dossiers. */
  await addColumn('types_pieces', 'actif', 'TINYINT(1) NOT NULL DEFAULT 1 AFTER obligatoire');
  await addIndex('types_pieces', 'idx_types_pieces_type', '(type_dossier_id)');
  await addIndex('types_pieces', 'idx_types_pieces_sous_type', '(sous_type_id)');

  // Rattache les pièces existantes au type de dossier de leur division.
  log('types_pieces : rattachement au type de dossier par division');
  await exec(`
    UPDATE types_pieces tp
    JOIN divisions d ON d.code = tp.division_code
    SET tp.type_dossier_id = d.type_dossier_id
    WHERE tp.type_dossier_id IS NULL
  `);
  // La division VISA a pour code VISAS (et non VISA) : on corrige la donnée.
  log("types_pieces : correction du code division 'VISA' -> 'VISAS'");
  await exec(`UPDATE types_pieces SET division_code = 'VISAS' WHERE division_code = 'VISA'`);
  await exec(`
    UPDATE types_pieces tp
    JOIN divisions d ON d.code = 'VISAS'
    SET tp.type_dossier_id = d.type_dossier_id
    WHERE tp.type_dossier_id IS NULL AND tp.division_code = 'VISAS'
  `);
}

/* ─────────────── 8. Pièces VISA / SOLDE / PENSION ───────────────── */

const PIECES_A_SEED = [
  // VISA
  { code: 'VISA_DEMANDE', libelle: 'Demande de visa', phase: 'DEPOUILLEMENT', ordre: 5, division: 'VISAS' },
  { code: 'VISA_ACTE_MARIAGE', libelle: 'Acte de mariage', phase: 'DEPOUILLEMENT', ordre: 10, division: 'VISAS' },
  { code: 'VISA_ACTE_NAISSANCE', libelle: 'Acte de naissance', phase: 'DEPOUILLEMENT', ordre: 20, division: 'VISAS' },
  { code: 'VISA_CERTIFICAT_MEDICAL', libelle: 'Certificat médical', phase: 'DEPOUILLEMENT', ordre: 30, division: 'VISAS' },
  { code: 'VISA_DECISION', libelle: 'Décision de visa', phase: 'DEPOUILLEMENT', ordre: 40, division: 'VISAS' },
  { code: 'VISA_ETAT_SIGNATURE', libelle: 'État de signature', phase: 'ARCHIVAGE', ordre: 10, division: 'VISAS' },
  { code: 'VISA_PV_RECEPTION', libelle: 'PV de réception', phase: 'ARCHIVAGE', ordre: 20, division: 'VISAS' },
  // SOLDE
  { code: 'SOLDE_FICHE_LIQUIDATION', libelle: 'Fiche de liquidation', phase: 'DEPOUILLEMENT', ordre: 10, division: 'SOLDE' },
  { code: 'SOLDE_DECOMPTE', libelle: 'Décompte de solde', phase: 'DEPOUILLEMENT', ordre: 20, division: 'SOLDE' },
  { code: 'SOLDE_ETAT_EMARGEMENT', libelle: "État d'émargement", phase: 'DEPOUILLEMENT', ordre: 30, division: 'SOLDE' },
  { code: 'SOLDE_CACHET_MANDATEMENT', libelle: 'Cachet de mandatement', phase: 'ARCHIVAGE', ordre: 10, division: 'SOLDE' },
  { code: 'SOLDE_SIGNATURE_ORDONNATEUR', libelle: "Signature de l'ordonnateur", phase: 'ARCHIVAGE', ordre: 20, division: 'SOLDE' },
  { code: 'SOLDE_REF_LOGICIEL', libelle: 'Référence logiciel solde', phase: 'ARCHIVAGE', ordre: 30, division: 'SOLDE' },
  // PENSION
  { code: 'PENSION_DEMANDE', libelle: 'Demande de pension', phase: 'DEPOUILLEMENT', ordre: 10, division: 'PENSIONS' },
  { code: 'PENSION_ACTE_DECES', libelle: 'Acte de décès', phase: 'DEPOUILLEMENT', ordre: 20, division: 'PENSIONS' },
  { code: 'PENSION_CERTIF_NON_REMARIAGE', libelle: 'Certificat de non-remariage', phase: 'DEPOUILLEMENT', ordre: 30, division: 'PENSIONS' },
  { code: 'PENSION_LIQUIDATION', libelle: 'Liquidation de pension', phase: 'DEPOUILLEMENT', ordre: 40, division: 'PENSIONS' },
  { code: 'PENSION_ETAT_DECOMPTE', libelle: 'État de décompte pension', phase: 'ARCHIVAGE', ordre: 10, division: 'PENSIONS' },
  { code: 'PENSION_PV_VERIFICATION', libelle: 'PV de vérification', phase: 'ARCHIVAGE', ordre: 20, division: 'PENSIONS' },
];

async function seederPieces() {
  for (const p of PIECES_A_SEED) {
    const rows = await db.query(`SELECT id FROM types_pieces WHERE code = ?`, [p.code]);
    if (rows[0]) {
      log(`pièce ${p.code} : déjà présente`);
      continue;
    }
    log(`pièce ${p.code} : insertion (${p.libelle})`);
    await exec(
      `INSERT INTO types_pieces (code, libelle, obligatoire, phase, ordre, division_code, type_dossier_id)
       SELECT ?, ?, 1, ?, ?, d.code, d.type_dossier_id
       FROM divisions d WHERE d.code = ?
       LIMIT 1`,
      [p.code, p.libelle, p.phase, p.ordre, p.division]
    );
  }
}

/* ─────────────────────── 9. Permissions ─────────────────────────── */

const PERMISSIONS_A_CREER = [
  ['deroger_validation', 'Autoriser, à titre exceptionnel et tracé, la validation malgré des pièces manquantes'],
  ['configurer_pieces', 'Configurer les types de pièces requis par type et sous-type de dossier'],
  ['gerer_sous_types', 'Gérer les sous-types de dossiers (types d’acte)'],
];

/** Pouvoirs métier retirés de l'administrateur technique. */
const PERMISSIONS_METIER_RETIREES_ADMIN = [
  'affecter_dossier', 'apposer_cachet', 'archiver_copie_mandatement',
  'archiver_dossier', 'cloturer_dossier', 'controler_decomptes',
  'depouiller_pieces', 'enregistrer_visa_cf', 'generer_etat_emargement',
  'gerer_ordonnancement', 'liquider_pension', 'orienter_dossier',
  'preparer_mandatement', 'signer_dossier', 'signer_pieces_mandatement',
  'soumettre_verification', 'suivre_signature', 'traiter_dossier',
  'valider_dossier', 'verifier_dossier',
];

async function migrerPermissions() {
  for (const [nom, description] of PERMISSIONS_A_CREER) {
    const rows = await db.query(`SELECT id FROM permissions WHERE nom = ?`, [nom]);
    if (rows[0]) {
      log(`permission ${nom} : déjà présente`);
      continue;
    }
    log(`permission ${nom} : création`);
    await exec(`INSERT INTO permissions (nom, description) VALUES (?, ?)`, [nom, description]);
  }

  const roleId = async (nom) => {
    const rows = await db.query(`SELECT id FROM roles WHERE nom = ?`, [nom]);
    return rows[0]?.id || null;
  };
  const permId = async (nom) => {
    const rows = await db.query(`SELECT id FROM permissions WHERE nom = ?`, [nom]);
    return rows[0]?.id || null;
  };
  const accorder = async (role, permission) => {
    const r = await roleId(role);
    const p = await permId(permission);
    if (!r || !p) return;
    const rows = await db.query(
      `SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?`,
      [r, p]
    );
    if (rows[0]) {
      log(`permission ${permission} → ${role} : déjà accordée`);
      return;
    }
    log(`permission ${permission} → ${role} : attribution`);
    await exec(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [r, p]);
  };
  const retirer = async (role, permission) => {
    const r = await roleId(role);
    const p = await permId(permission);
    if (!r || !p) return;
    log(`permission ${permission} → ${role} : retrait`);
    await exec(`DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`, [r, p]);
  };

  // Exception de validation : réservée au Chef de Service.
  await accorder('CHEF_SERVICE', 'deroger_validation');
  // Configuration du référentiel : administrateur technique.
  await accorder('ADMIN', 'configurer_pieces');
  await accorder('ADMIN', 'gerer_sous_types');

  // Archivage VISA : le vérificateur archive les dossiers signés de sa division.
  await accorder('VERIFICATEUR_VISA', 'archiver_dossier');
  await accorder('VERIFICATEUR_VISA', 'view_archives');
  // Le vérificateur contrôle les pièces du dossier qu'il instruit.
  await accorder('VERIFICATEUR_VISA', 'depouiller_pieces');
  // Le chef de division Visa consulte le dépouillement de sa division.
  await accorder('CHEF_DIVISION_VISA', 'depouiller_pieces');
  // Le chef de division Pension décide de la validation (gap constaté).
  await accorder('CHEF_DIVISION_PENSION', 'valider_dossier');

  // L'administrateur technique ne détient plus de pouvoir métier de décision.
  for (const permission of PERMISSIONS_METIER_RETIREES_ADMIN) {
    await retirer('ADMIN', permission);
  }
}

/* ──────────────────────────── Exécution ─────────────────────────── */

async function main() {
  console.log(APPLY
    ? '=== APPLICATION DE LA MIGRATION VISA ==='
    : '=== DRY-RUN (aucune écriture) ===');

  await migrerStatuts();
  await migrerSousTypes();
  await migrerDossiers();
  await migrerDepouillements();
  await migrerDocuments();
  await migrerAffectations();
  await migrerTypesPieces();
  await seederPieces();
  await migrerPermissions();

  console.log(APPLY
    ? '✅ Migration VISA appliquée.'
    : '⚡ Dry-run terminé. Relancez avec --apply pour écrire.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur migration :', err.message);
    process.exit(1);
  });
