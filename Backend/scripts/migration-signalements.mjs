/**
 * Migration : la remontée des dossiers bloqués.
 *
 * Le problème
 * -----------
 * La plateforme savait qu'un dossier bloquait — `EN_ATTENTE_COMPLEMENT`,
 * `CORRECTION_DEMANDEE`, échéance dépassée — mais **rien ne le remontait**.
 * Le chef de division voyait le blocage dans sa liste, le chef de service ne
 * le voyait pas ; chaque division réglait ses difficultés par téléphone ou
 * par couloir. Le cahier confie pourtant explicitement à la hiérarchie le
 * traitement de ces situations :
 *
 *   115  Chef de Service — résoudre les problèmes persistants des divisions
 *   116  Chef de Service — intervenir là où les solutions n'ont pas abouti
 *   154  Coordination    — rapporter les problèmes rencontrés
 *   155  Coordination    — rapporter les mesures prises pour les résoudre
 *   174  Chef Division Visa    — résoudre les difficultés de sa division
 *   193  Chef Division Solde   — idem
 *   205  Chef Division Pension — idem
 *
 * Ce que construit cette migration
 * --------------------------------
 * Un **signalement** est une fiche qu'un responsable ouvre sur un dossier
 * bloqué, et que la hiérarchie prend en charge puis referme avec une
 * résolution écrite. Trois types :
 *
 *   BLOCAGE       le dossier ne peut pas avancer (pièce, décision, tiers)
 *   INTERLOCUTION une division demande l'arbitrage ou l'appui d'une autre
 *   ARBITRAGE     deux services ne s'accordent pas sur la suite
 *
 * Le circuit est volontairement court : OUVERT → EN_COURS → RESOLU ou REJETE.
 * Un signalement ne modifie pas le statut du dossier — il ne s'y substitue
 * pas. Il porte la difficulté, la décision et sa trace ; le dossier continue
 * de suivre son propre workflow, et son journal reçoit chaque étape.
 *
 * Les droits
 * ----------
 *   signaler_dossier      les chefs de division, le chef BAAF et la
 *                         coordination — ceux qui constatent la difficulté
 *   traiter_signalement   le chef de service, seul à arbitrer au-dessus des
 *                         divisions (registre 115, 116)
 *   consulter_signalements les précédents, plus l'administrateur technique
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-signalements.mjs            → relevé
 *   node scripts/migration-signalements.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

const TABLE = `
  CREATE TABLE IF NOT EXISTS signalements_dossier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dossier_id INT NOT NULL,
    division_id INT NULL,
    signale_par INT NOT NULL,
    type ENUM('BLOCAGE', 'INTERLOCUTION', 'ARBITRAGE') NOT NULL DEFAULT 'BLOCAGE',
    priorite ENUM('NORMALE', 'HAUTE', 'CRITIQUE') NOT NULL DEFAULT 'NORMALE',
    motif TEXT NOT NULL,
    statut ENUM('OUVERT', 'EN_COURS', 'RESOLU', 'REJETE') NOT NULL DEFAULT 'OUVERT',
    traite_par INT NULL,
    resolution TEXT NULL,
    date_prise_en_charge DATETIME NULL,
    date_resolution DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_signalement_dossier FOREIGN KEY (dossier_id)
      REFERENCES dossiers(id) ON DELETE CASCADE,
    CONSTRAINT fk_signalement_division FOREIGN KEY (division_id)
      REFERENCES divisions(id) ON DELETE SET NULL,
    CONSTRAINT fk_signalement_auteur FOREIGN KEY (signale_par)
      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_signalement_traiteur FOREIGN KEY (traite_par)
      REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_signalement_dossier (dossier_id),
    INDEX idx_signalement_statut (statut),
    INDEX idx_signalement_division (division_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/** Les permissions, avec la raison de chacune. */
const PERMISSIONS = [
  {
    nom: 'signaler_dossier',
    description: 'Remonter à la hiérarchie un dossier bloqué, avec son motif '
      + '(registre 115, 116, 154, 174, 193, 205).',
  },
  {
    nom: 'traiter_signalement',
    description: 'Prendre en charge et refermer un signalement : décision et '
      + 'mesures prises (registre 115, 116, 155).',
  },
  {
    nom: 'consulter_signalements',
    description: 'Consulter les signalements de son périmètre et leur état.',
  },
];

/** Qui porte quoi, et pourquoi. */
const ATTRIBUTIONS = [
  {
    permission: 'signaler_dossier',
    roles: [
      'CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE',
      'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS',
      'CHEF_BAAF', 'COORDINATRICE',
    ],
    motif: 'Ceux qui constatent la difficulté : les chefs de division (174, 193, 205), '
      + 'le chef BAAF (133) et la coordination (154).',
  },
  {
    permission: 'traiter_signalement',
    roles: ['CHEF_SERVICE'],
    motif: 'Le Chef de Service résout les problèmes persistants des divisions et '
      + 'intervient là où les solutions n’ont pas abouti (115, 116).',
  },
  {
    permission: 'consulter_signalements',
    roles: [
      'ADMIN', 'CHEF_SERVICE', 'CHEF_BAAF', 'COORDINATRICE',
      'CHEF_DIVISION_VISA', 'CHEF_DIVISION_SOLDE',
      'CHEF_DIVISION_PENSION', 'CHEF_DIVISION_SECOURS',
    ],
    motif: 'Le suivi des signalements est ouvert à ceux qui les ouvrent, à ceux '
      + 'qui les traitent, et à l’administrateur technique.',
  },
];

/**
 * Les exigences que ce circuit referme.
 *
 * On ne marque « livrée » que ce que le circuit fait réellement : signaler un
 * dossier bloqué, le prendre en charge, écrire la résolution. Les exigences
 * d'interlocution sur les **besoins matériels** (117, 178, 192) restent
 * ouvertes : elles ne portent pas sur un dossier.
 */
const EXIGENCES = [
  [115, 'Résoudre les problèmes persistants au niveau des Divisions'],
  [116, 'Intervenir là où les solutions n’ont pas été résolues'],
  [154, 'Rapporter les problèmes rencontrés'],
  [155, 'Rapporter les mesures prises pour résoudre les problèmes'],
  [174, 'Résoudre les difficultés rencontrées au sein de la division'],
  [193, 'Résoudre les difficultés rencontrées au sein de la division'],
  [205, 'Résoudre les difficultés rencontrées au sein de la division'],
];

const MOTIF = 'Un signalement peut être ouvert sur le dossier : type (blocage, '
  + 'interlocution, arbitrage), priorité, motif. Le chef de service le prend en '
  + 'charge et le referme par une résolution écrite. Le signalement ne modifie '
  + 'pas le statut du dossier : il porte la difficulté et sa trace, le dossier '
  + 'suit son workflow.';

async function main() {
  console.log(APPLY
    ? '=== APPLICATION MIGRATION SIGNALEMENTS ==='
    : '=== RELEVÉ (dry-run) ===');

  if (APPLY) {
    await db.query(TABLE);
    console.log('  + table signalements_dossier');
  } else {
    const [existe] = await db.query(
      `SELECT COUNT(*) AS n FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'signalements_dossier'`
    );
    console.log(`  ${existe.n ? '=' : '+'} table signalements_dossier ${existe.n ? 'déjà présente' : 'à créer'}`);
  }

  const roles = await db.query('SELECT id, nom FROM roles');

  for (const permission of PERMISSIONS) {
    const [deja] = await db.query('SELECT id FROM permissions WHERE nom = ?', [permission.nom]);
    console.log(`  ${deja ? '=' : '+'} permission ${permission.nom}`);
    if (!deja && APPLY) {
      await db.query(
        'INSERT INTO permissions (nom, description) VALUES (?, ?)',
        [permission.nom, permission.description]
      );
    }
  }

  const permissions = await db.query('SELECT id, nom FROM permissions');

  for (const attribution of ATTRIBUTIONS) {
    const permission = permissions.find((p) => p.nom === attribution.permission);
    if (!permission) {
      console.log(`  ⚠️  permission ${attribution.permission} absente`);
      continue;
    }
    for (const nomRole of attribution.roles) {
      const role = roles.find((r) => r.nom === nomRole);
      if (!role) {
        console.log(`  ⚠️  rôle ${nomRole} absent`);
        continue;
      }
      const [deja] = await db.query(
        'SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, permission.id]
      );
      console.log(`  ${deja ? '=' : '+'} ${nomRole} ← ${attribution.permission}`);
      if (!deja && APPLY) {
        await db.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [role.id, permission.id]
        );
      }
    }
  }

  for (const [numero] of EXIGENCES) {
    const [entree] = await db.query(
      `SELECT id, etat, libelle FROM referentiel_fonctionnalites
       WHERE document = 'HISTORIQUE' AND numero_source = ?`,
      [numero]
    );
    if (!entree) {
      console.log(`  ⚠️  HISTORIQUE/${numero} introuvable`);
      continue;
    }
    console.log(`  ${entree.etat === 'LIVREE' ? '=' : `${entree.etat} → LIVREE`} HISTORIQUE/${numero} — ${entree.libelle}`);
    if (APPLY) {
      await db.query(
        'UPDATE referentiel_fonctionnalites SET etat = ?, motif = ? WHERE id = ?',
        ['LIVREE', MOTIF, entree.id]
      );
    }
  }

  console.log(APPLY ? '\n✅ Migration appliquée.' : '\n⚡ Relancez avec --apply pour exécuter.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});
