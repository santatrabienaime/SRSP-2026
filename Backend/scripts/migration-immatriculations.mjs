/**
 * Migration : module d'immatriculation de la Coordination.
 *
 * Le cahier (§ 11.2) confie à la Coordination : l'attribution des numéros
 * d'immatriculation aux nouveaux agents publics, l'insertion des nouveaux
 * arrivants dans les systèmes de paie et de pension, les changements de mode
 * de paiement, et les rapports d'activité.
 *
 * Le module avait été retiré de l'application ; ses validateurs, eux, sont
 * restés. Ce sont eux qui font foi : ils décrivent le domaine tel que le
 * cahier l'a décrit — et ils sont plus exigeants que ce qu'une simple
 * immatriculation devrait être (le CIN contrôlé, le motif obligatoire du
 * changement de paiement, la cohérence virement / compte bancaire).
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-immatriculations.mjs            → dry-run
 *   node scripts/migration-immatriculations.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const SQL = [
  `CREATE TABLE IF NOT EXISTS immatriculations (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nom VARCHAR(100) NOT NULL,
     prenom VARCHAR(100) NOT NULL,
     cin VARCHAR(50) NULL,
     date_naissance DATE NULL,
     corps VARCHAR(100) NULL,
     grade VARCHAR(100) NULL,
     indice INT NULL,
     date_entree DATE NULL,
     division_id INT NULL,
     matricule VARCHAR(50) NULL,
     statut ENUM('EN_ATTENTE','ACTIVE','REJETEE') NOT NULL DEFAULT 'EN_ATTENTE',
     observations TEXT NULL,
     created_by INT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     KEY idx_imma_statut (statut),
     KEY idx_imma_matricule (matricule),
     CONSTRAINT fk_imma_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
     CONSTRAINT fk_imma_auteur FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS insertions_paiement (
     id INT AUTO_INCREMENT PRIMARY KEY,
     immatriculation_id INT NOT NULL,
     matricule_augure VARCHAR(50) NULL,
     situation_familiale VARCHAR(100) NULL,
     adresse VARCHAR(255) NULL,
     telephone VARCHAR(30) NULL,
     date_naissance DATE NULL,
     indice_base INT NULL,
     salaire_base DECIMAL(15,2) NULL,
     statut ENUM('A_INSERER','INSERE','REJETE') NOT NULL DEFAULT 'A_INSERER',
     observations TEXT NULL,
     created_by INT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     KEY idx_insertion_imma (immatriculation_id),
     CONSTRAINT fk_insertion_imma FOREIGN KEY (immatriculation_id) REFERENCES immatriculations(id) ON DELETE CASCADE,
     CONSTRAINT fk_insertion_auteur FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS modes_paiement (
     id INT AUTO_INCREMENT PRIMARY KEY,
     immatriculation_id INT NOT NULL,
     mode ENUM('VIREMENT','CHEQUE','ESPECES','MANDAT') NOT NULL,
     banque VARCHAR(100) NULL,
     compte_bancaire VARCHAR(50) NULL,
     motif VARCHAR(1000) NOT NULL,
     pieces_verifiees TINYINT(1) NOT NULL DEFAULT 0,
     statut ENUM('EN_ATTENTE','APPROUVE','REJETE') NOT NULL DEFAULT 'EN_ATTENTE',
     observations TEXT NULL,
     created_by INT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     KEY idx_mode_imma (immatriculation_id),
     CONSTRAINT fk_mode_imma FOREIGN KEY (immatriculation_id) REFERENCES immatriculations(id) ON DELETE CASCADE,
     CONSTRAINT fk_mode_auteur FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const INDEX = [
  `CREATE INDEX IF NOT EXISTS idx_imma_divisions ON immatriculations(division_id)`,
  `CREATE INDEX IF NOT EXISTS idx_imma_date ON immatriculations(created_at)`,
];

const PERMISSIONS = [
  ['gerer_immatriculations', 'Enregistrer et suivre les immatriculations, insertions et changements de mode de paiement'],
];

async function main() {
  console.log(APPLY ? '=== APPLICATION MIGRATION IMMATRICULATIONS ===' : '=== DRY-RUN ===');

  for (const stmt of [...SQL, ...INDEX]) {
    if (APPLY) {
      await db.query(stmt);
      console.log(`→ ${stmt.replace(/\s+/g, ' ').slice(0, 80)}…`);
    } else {
      console.log(`Would execute: ${stmt.replace(/\s+/g, ' ').slice(0, 80)}…`);
    }
  }

  /* La permission appartient à la Coordination : c'est sa mission, et elle
     ne touche à aucun dossier ni à aucune décision métier.

     L'administrateur la porte aussi, comme `gerer_correspondances` : il
     administre les rôles, il doit donc pouvoir ouvrir le module qu'il
     attribue — et non dépendre d'un autre profil pour le consulter. */
  for (const [nom, description] of PERMISSIONS) {
    const [existante] = await db.query(
      'SELECT id FROM permissions WHERE nom = ?', [nom]
    );
    if (!existante) {
      if (APPLY) {
        await db.query(
          'INSERT INTO permissions (nom, description) VALUES (?, ?)', [nom, description]
        );
        console.log(`Permission ${nom} : créée`);
      }
      /* On ne s'arrête pas là : l'attribution doit suivre, sinon la
         permission resterait orpheline — elle serait créée sans jamais être
         portée par un rôle. */
    }

    const [permission] = await db.query(
      'SELECT id FROM permissions WHERE nom = ?', [nom]
    );
    if (!permission) continue;

    for (const nomRole of ['COORDINATRICE', 'ADMIN']) {
      const [role] = await db.query(
        'SELECT id FROM roles WHERE nom = ?', [nomRole]
      );
      if (!role) continue;

      const deja = await db.query(
        'SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, permission.id]
      );
      if (!deja[0] && APPLY) {
        await db.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [role.id, permission.id]
        );
        console.log(`Permission ${nom} → ${nomRole}`);
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
