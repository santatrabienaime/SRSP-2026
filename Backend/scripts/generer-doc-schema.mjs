/**
 * Produit la documentation du schéma de base de données.
 *
 * La documentation est extraite de la base vivante : elle ne peut donc pas
 * diverger de ce que l'application utilise réellement. Chaque table est
 * décrite avec ses colonnes, ses clés étrangères et ses index.
 *
 * Usage (depuis Backend/) :
 *   node scripts/generer-doc-schema.mjs > ../docs/BASE_DE_DONNEES.md
 */
import fs from 'fs';
import db from '../src/config/db.js';

const COMMENTAIRES = {
  users: "Comptes de connexion. `role_id` désigne le rôle, qui porte les permissions.",
  roles: "Rôles métier (13 postes).",
  permissions: "Permissions unitaires, accordées aux rôles par `role_permissions`.",
  role_permissions: "Table d'association rôle ↔ permission.",
  agents: "Fiches des agents. `user_id` relie éventuellement la fiche au compte de connexion.",
  divisions: "Divisions du service. `type_dossier_id` détermine le type de dossier traité.",
  types_dossiers: "Types de dossiers (VISA, SOLDE, PENSION, SECOURS).",
  sous_types_dossiers: "Sous-types de dossiers (types d'acte) : « Visa de mariage », « Visa de naissance »…",
  statuts_dossiers: "Statuts du workflow. `ordre` fixe l'ordre de lecture.",
  priorites: "Priorités des dossiers.",
  dossiers: "Dossiers. Porte les données communes et les champs VISA (`reference_visa`, `type_acte`, `verificateur_id`…).",
  historique_actions: "Journal des actions. `dossier_id` est supprimé en cascade avec le dossier : la trace de suppression est conservée ailleurs, dans `suppressions_dossiers`.",
  suppressions_dossiers: "Trace durable des suppressions : motif, auteur, date et instantané du journal. Aucune clé étrangère vers `dossiers` — la trace survit à la suppression.",
  depouillements: "Contrôle des pièces : un enregistrement par (dossier, pièce), avec l'un des quatre états et son motif.",
  types_pieces: "Pièces requises, par phase, par type de dossier et par sous-type. `actif = 0` désactive sans effacer.",
  documents: "Pièces jointes déposées sur un dossier. Le fichier est sur disque sous un nom UUID.",
  archives: "Archives. `reference_archivage` est la référence d'archivage.",
  notifications: "Notifications internes, avec accusé de lecture.",
  messages: "Messages internes entre comptes.",
  dossier_commentaires: "Commentaires internes sur un dossier.",
  affectations: "Affectations. `ancien_agent_id` conserve l'agent précédent lors d'un transfert.",
  transferts: "Transferts de dossier entre agents, avec motif.",
  traitements: "Ouverture et clôture d'un traitement.",
  courriers: "Courriers entrants et sortants.",
  types_courriers: "Types de courriers.",
  types_documents: "Types de documents.",
  bordereaux: "Bordereaux de transmission d'un dossier à une division.",
  bordereaux_dossiers: "Dossiers contenus dans un bordereau.",
  mandatement: "Mandatement (division Secours).",
};

const TABLES_METIERS = [
  'users', 'roles', 'permissions', 'role_permissions', 'agents', 'divisions',
  'types_dossiers', 'sous_types_dossiers', 'statuts_dossiers', 'priorites',
  'dossiers', 'historique_actions', 'suppressions_dossiers', 'depouillements',
  'types_pieces', 'documents', 'archives', 'notifications', 'messages',
  'dossier_commentaires', 'affectations', 'transferts', 'traitements',
  'courriers', 'types_courriers', 'types_documents', 'bordereaux',
  'bordereaux_dossiers', 'mandatements', 'fonctions',
];

async function tableInfo(nom) {
  const colonnes = await db.query(`SHOW FULL COLUMNS FROM \`${nom}\``);
  const fk = await db.query(
    `SELECT k.CONSTRAINT_NAME AS cn, k.COLUMN_NAME AS col, k.REFERENCED_TABLE_NAME AS ref,
            c.DELETE_RULE AS rule, c.UPDATE_RULE AS urule
     FROM information_schema.KEY_COLUMN_USAGE k
     JOIN information_schema.REFERENTIAL_CONSTRAINTS c
       ON c.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND c.CONSTRAINT_SCHEMA = k.TABLE_SCHEMA
     WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME = ?`,
    [nom]
  );
  const index = await db.query(`SHOW INDEX FROM \`${nom}\``);
  const lignes = await db.query(`SELECT COUNT(*) AS n FROM \`${nom}\``);
  return { colonnes, fk, index, lignes: lignes[0]?.n ?? 0 };
}

function typeLisible(col) {
  const t = String(col.Type).toLowerCase();
  if (t.startsWith('int') || t.startsWith('bigint') || t.startsWith('tinyint')) return 'entier';
  if (t.startsWith('decimal') || t.startsWith('numeric')) return 'nombre';
  if (t.startsWith('varchar') || t.startsWith('char') || t.startsWith('text') || t.startsWith('longtext')) return 'texte';
  if (t.startsWith('datetime') || t.startsWith('timestamp') || t.startsWith('date')) return 'date';
  if (t.startsWith('enum') || t.startsWith('set')) return t;
  return t;
}

async function main() {
  const sortie = [
    '# Schéma de la base de données — `srsp_db`',
    '',
    'Document **généré automatiquement** à partir de la base vivante :',
    '`node Backend/scripts/generer-doc-schema.mjs`.',
    '',
    'Il ne peut donc pas diverger de ce que l\'application utilise réellement.',
    '',
    '## Conventions',
    '',
    '| Convention | Règle |',
    '|---|---|',
    '| Noms de tables | `snake_case` au singulier. |',
    '| Clés primaires | `id` en `INT AUTO_INCREMENT`. |',
    '| Horodatage | `created_at` / `updated_at` (MySQL), `date_action` pour le journal. |',
    '| Suppression | `ON DELETE CASCADE` quand l\'enfant n\'a aucun sens sans son parent ; `SET NULL` quand la trace doit survivre ; `RESTRICT` quand la référence est structurante. |',
    '| Montants | `DECIMAL`, jamais `FLOAT`. |',
    '| Dates de service | `DATE` pour un jour, `DATETIME` pour un horodatage. |',
    '',
  ];

  const toutes = await db.query('SHOW TABLES');
  const noms = toutes.map((r) => Object.values(r)[0]);
  const metier = TABLES_METIERS.filter((t) => noms.includes(t));
  const autres = noms.filter((t) => !metier.includes(t));

  for (const groupe of [
    { titre: 'Référentiel et comptes', tables: metier.filter((t) => ['users', 'roles', 'permissions', 'role_permissions', 'agents', 'divisions', 'types_dossiers', 'sous_types_dossiers', 'statuts_dossiers', 'priorites', 'fonctions', 'types_courriers', 'types_documents'].includes(t)) },
    { titre: 'Dossiers et circuit', tables: metier.filter((t) => ['dossiers', 'historique_actions', 'suppressions_dossiers', 'depouillements', 'types_pieces', 'documents', 'archives', 'affectations', 'transferts', 'traitements', 'dossier_commentaires', 'notifications', 'messages', 'bordereaux', 'bordereaux_dossiers', 'courriers', 'mandatements'].includes(t)) },
    { titre: 'Autres tables', tables: autres },
  ]) {
    if (!groupe.tables.length) continue;
    sortie.push(`## ${groupe.titre}`);
    sortie.push('');
    for (const nom of groupe.tables) {
      const info = await tableInfo(nom);
      sortie.push(`### \`${nom}\``);
      sortie.push('');
      if (COMMENTAIRES[nom]) {
        sortie.push(COMMENTAIRES[nom]);
        sortie.push('');
      }
      sortie.push(`*${info.lignes} ligne(s) en base.*`);
      sortie.push('');
      sortie.push('| Colonne | Type | Null | Défaut | Commentaire |');
      sortie.push('|---|---|---|---|---|');
      for (const c of info.colonnes) {
        sortie.push(
          `| \`${c.Field}\` | ${typeLisible(c)} | ${c.Null === 'YES' ? 'oui' : 'non'} | ` +
          `${c.Default === null ? '—' : `\`${c.Default}\``} | ${c.Comment || '—'} |`
        );
      }
      sortie.push('');
      if (info.fk.length) {
        sortie.push('**Clés étrangères**');
        sortie.push('');
        sortie.push('| Contrainte | Colonne | Référence | Suppression |');
        sortie.push('|---|---|---|---|');
        for (const f of info.fk) {
          sortie.push(`| \`${f.cn}\` | \`${f.col}\` | \`${f.ref}\` | ${f.rule} |`);
        }
        sortie.push('');
      }
      const indexUniques = [...new Set(
        info.index.filter((i) => i.Key_name === 'PRIMARY' || i.Non_unique === 0).map((i) => i.Key_name)
      )];
      if (indexUniques.length) {
        sortie.push(`**Index** : ${indexUniques.map((i) => `\`${i}\``).join(', ')}.`);
        sortie.push('');
      }
    }
  }

  /* Écriture directe en UTF-8 : une redirection shell produirait un fichier
     UTF-16, illisible pour Git et pour les éditeurs. */
  const chemin = process.argv[2]
    ? process.argv[2]
    : new URL('../../docs/BASE_DE_DONNEES.md', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  fs.writeFileSync(chemin, `${sortie.join('\n')}\n`, 'utf8');
  console.log(`Documentation du schéma écrite dans ${chemin} (${sortie.length} lignes).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
