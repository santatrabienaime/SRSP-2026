/**
 * Migration : données propres aux opérations, versionnage des pièces,
 * enrichissement des correspondances, état « non applicable ».
 *
 * Le cahier des fonctionnalités décrit, pour chaque division, des champs qui
 * n'appartiennent qu'à certaines opérations (§ 7.5 pour Solde, § 8.5 pour
 * Pensions) :
 *
 *   - la référence du dossier mère de l'agent ;
 *   - la période concernée ;
 *   - le montant et sa source ;
 *   - la localité, pour un transfert ;
 *   - le contrôle et sa décision ;
 *   - la signature et la transmission.
 *
 * Ces champs sont **communs à toutes les opérations d'une division**, et
 * diffèrent seulement par ceux qui s'appliquent. Une table par opération
 * aurait produit dix-sept tables presque identiques, et dix-sept formulaires
 * à maintenir.
 *
 * Une seule table, `donnees_operation`, porte donc ces champs ; le champ
 * `donnees` (JSON) accueille les specifics d'une opération, et le type
 * d'opération reste porté par le dossier lui-même.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-donnees-operations.mjs            → dry-run
 *   node scripts/migration-donnees-operations.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const SQL = [
  /* ── 1. Données propres à l'opération ─────────────────────────────── */
  `CREATE TABLE IF NOT EXISTS donnees_operation (
     id INT AUTO_INCREMENT PRIMARY KEY,
     dossier_id INT NOT NULL,
     sous_type_id INT NULL,
     reference_externe VARCHAR(150) NULL,
     reference_dossier_mere VARCHAR(150) NULL,
     matricule VARCHAR(50) NULL,
     periode VARCHAR(100) NULL,
     montant DECIMAL(15,2) NULL,
     source_montant VARCHAR(255) NULL,
     date_reference DATE NULL,
     destinataire VARCHAR(200) NULL,
     date_transmission DATETIME NULL,
     reference_transmission VARCHAR(100) NULL,
     etat_transmission VARCHAR(30) NULL,
     localisation VARCHAR(200) NULL,
     observation TEXT NULL,
     controleur_id INT NULL,
     date_controle DATETIME NULL,
     observations_controle TEXT NULL,
     decision_controle VARCHAR(30) NULL,
     valide_par INT NULL,
     date_validation DATETIME NULL,
     donnees JSON NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     UNIQUE KEY uk_operation_dossier (dossier_id),
     KEY idx_operation_sous_type (sous_type_id),
     CONSTRAINT fk_operation_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
     CONSTRAINT fk_operation_sous_type FOREIGN KEY (sous_type_id) REFERENCES sous_types_dossiers(id) ON DELETE SET NULL,
     CONSTRAINT fk_operation_controleur FOREIGN KEY (controleur_id) REFERENCES users(id) ON DELETE SET NULL,
     CONSTRAINT fk_operation_valideur FOREIGN KEY (valide_par) REFERENCES users(id) ON DELETE SET NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  /* ── 2. Correspondances : ce que le cahier demande en plus ────────
     Référence, pièce liée, état de réponse, transmission centrale. */
  `ALTER TABLE correspondances
     ADD COLUMN IF NOT EXISTS reference VARCHAR(100) NULL AFTER type,
     ADD COLUMN IF NOT EXISTS document_id INT NULL AFTER reference,
     ADD COLUMN IF NOT EXISTS etat_reponse VARCHAR(30) NULL,
     ADD COLUMN IF NOT EXISTS date_reponse DATETIME NULL,
     ADD COLUMN IF NOT EXISTS reponse TEXT NULL,
     ADD COLUMN IF NOT EXISTS date_transmission_central DATETIME NULL,
     ADD COLUMN IF NOT EXISTS destinataire_central VARCHAR(150) NULL,
     ADD COLUMN IF NOT EXISTS reference_bordereau VARCHAR(100) NULL,
     ADD COLUMN IF NOT EXISTS etat_reception_central VARCHAR(30) NULL`,

  /* ── 3. Documents : versionnage ─────────────────────────────────────
     Le cahier demande, pour un document remplacé, de « conserver la trace de
     la version précédente ». La version et le lien de remplacement portent
     cette trace. */
  `ALTER TABLE documents
     ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1 AFTER piece_code,
     ADD COLUMN IF NOT EXISTS remplace INT NULL AFTER version,
     ADD COLUMN IF NOT EXISTS motif_remplacement VARCHAR(500) NULL AFTER remplace`,

  /* ── 4. Pièces : l'état « non applicable » ─────────────────────────
     Une pièce qui ne s'applique pas à ce dossier ne doit pas être traitée
     comme une pièce manquante : elle ne bloque pas la validation et ne
     demande pas de motif. */
  `ALTER TABLE depouillements
     MODIFY COLUMN etat ENUM('PRESENTE','MANQUANTE','ILLISIBLE','A_CORRIGER','NON_APPLICABLE')
     NOT NULL DEFAULT 'MANQUANTE'`,
];

const INDEX = [
  `CREATE INDEX IF NOT EXISTS idx_correspondances_type ON correspondances(type)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(dossier_id, version)`,
];

/**
 * Permissions de la saisie et du contrôle des données d'opération.
 *
 * Deux permissions, parce que deux gestes différents : l'agent qui instruit
 * le dossier **prépare** l'opération ; le chef de division **la contrôle**.
 * Confondre les deux reviendrait à laisser l'agent valider sa propre saisie —
 * exactement ce que le cahier refuse (« ne remplace pas les décisions des
 * agents habilités »).
 */
const PERMISSIONS = [
  ['saisir_donnees_operation', 'Saisir les données propres à l\'opération d\'un dossier (référence, période, montant, pièces)'],
  ['controler_donnees_operation', 'Contrôler et valider les données d\'opération d\'un dossier'],
];

/** Rôles qui saisissent, et rôles qui contrôlent. */
const ROLES_SAISIR = [
  'VERIFICATEUR_SOLDE', 'LIQUIDATEUR_PENSION', 'CHARGE_SECOURS', 'VERIFICATEUR_VISA',
  'CHEF_DIVISION_SOLDE', 'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS', 'CHEF_DIVISION_VISA',
];
const ROLES_CONTROLER = [
  'CHEF_DIVISION_SOLDE', 'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS', 'CHEF_DIVISION_VISA',
];

async function migrerPermissions() {
  for (const [nom, description] of PERMISSIONS) {
    const rows = await db.query('SELECT id FROM permissions WHERE nom = ?', [nom]);
    if (rows[0]) continue;
    await db.query('INSERT INTO permissions (nom, description) VALUES (?, ?)', [nom, description]);
    console.log(`Permission ${nom} : créée`);
  }

  const attribuer = async (role, permission) => {
    const [r] = await db.query('SELECT id FROM roles WHERE nom = ?', [role]);
    const [p] = await db.query('SELECT id FROM permissions WHERE nom = ?', [permission]);
    if (!r || !p) return;
    const deja = await db.query(
      'SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [r.id, p.id]
    );
    if (deja[0]) return;
    await db.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [r.id, p.id]
    );
    console.log(`Permission ${permission} → ${role}`);
  };

  for (const role of ROLES_SAISIR) await attribuer(role, 'saisir_donnees_operation');
  for (const role of ROLES_CONTROLER) await attribuer(role, 'controler_donnees_operation');
}

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION DONNÉES D\'OPÉRATIONS ===' : '=== DRY-RUN ===');

  for (const stmt of [...SQL, ...INDEX]) {
    const apercu = stmt.replace(/\s+/g, ' ').slice(0, 88);
    if (APPLY) {
      try {
        await db.query(stmt);
        console.log(`→ ${apercu}…`);
      } catch (e) {
        /* Une colonne déjà existante n'est pas une erreur : la migration
           doit pouvoir être rejouée sans damaging rien. */
        console.warn(`⚠️  ${apercu}… : ${e.message}`);
      }
    } else {
      console.log(`Would execute: ${apercu}…`);
    }
  }

  if (APPLY) {
    await migrerPermissions();
  } else {
    console.log(`Would create: ${PERMISSIONS.map((p) => p[0]).join(', ')}`);
  }

  console.log(APPLY ? '✅ Migration appliquée.' : '⚡ Relancez avec --apply pour écrire.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
