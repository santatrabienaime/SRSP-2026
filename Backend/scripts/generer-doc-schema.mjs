/**
 * Produit la documentation du schéma de base de données PostgreSQL.
 *
 * La documentation est extraite de la base vivante : elle ne peut donc pas
 * diverger de ce que l'application utilise réellement. Chaque table est
 * décrite avec ses colonnes, ses clés étrangères et ses index.
 *
 * Usage (depuis Backend/) :
 *   node scripts/generer-doc-schema.mjs
 */
import fs from 'fs';
import db from '../src/config/db.js';

const COMMENTAIRES = {
  users: "Comptes de connexion. `role_id` désigne le rôle, qui porte les permissions.",
  roles: "Rôles métier (13 postes).",
  permissions: "Permissions unitaires, accordées aux rôles par `role_permissions`.",
  role_permissions: "Table d'association rôle → permission.",
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
  mandatements: "Mandatement (division Secours).",
  schemas_operations: "Configuration des champs et pièces propres à chaque type d'opération.",
  donnees_operation: "Valeurs saisies pour une opération, contrôlées puis validées par le chef de division.",
  signalements_dossier: "Signalements de blocage, d'interlocution ou d'arbitrage, rattachés à un dossier.",
  immatriculations: "Demandes d'immatriculation de la Coordination.",
  reinitialisations_mot_de_passe: "Demandes de réinitialisation et codes à usage unique.",
};

const TABLES_METIERS = [
  'users', 'roles', 'permissions', 'role_permissions', 'agents', 'divisions',
  'types_dossiers', 'sous_types_dossiers', 'statuts_dossiers', 'priorites',
  'dossiers', 'historique_actions', 'suppressions_dossiers', 'depouillements',
  'types_pieces', 'documents', 'archives', 'notifications', 'messages',
  'dossier_commentaires', 'affectations', 'transferts', 'traitements',
  'courriers', 'types_courriers', 'types_documents', 'bordereaux',
  'bordereaux_dossiers', 'mandatements', 'fonctions', 'schemas_operations',
  'donnees_operation', 'signalements_dossier', 'immatriculations',
  'reinitialisations_mot_de_passe',
];

function identifiant(nom) {
  return `"${String(nom).replace(/"/g, '""')}"`;
}

async function tableInfo(nom) {
  const colonnes = await db.query(
    `SELECT a.attname AS "Field",
            format_type(a.atttypid, a.atttypmod) AS "Type",
            CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END AS "Null",
            pg_get_expr(d.adbin, d.adrelid) AS "Default",
            col_description(a.attrelid, a.attnum) AS "Comment"
       FROM pg_attribute a
       JOIN pg_class c ON c.oid = a.attrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE n.nspname = 'public'
        AND c.relname = ?
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum`,
    [nom]
  );

  const fk = await db.query(
    `SELECT con.conname AS "cn",
            att.attname AS "col",
            ref.relname AS "ref",
            CASE con.confdeltype
              WHEN 'c' THEN 'CASCADE'
              WHEN 'n' THEN 'SET NULL'
              WHEN 'r' THEN 'RESTRICT'
              WHEN 'a' THEN 'NO ACTION'
              WHEN 'd' THEN 'SET DEFAULT'
            END AS "rule"
       FROM pg_constraint con
       JOIN pg_class rel ON rel.oid = con.conrelid
       JOIN pg_namespace n ON n.oid = rel.relnamespace
       JOIN pg_class ref ON ref.oid = con.confrelid
       JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
      WHERE con.contype = 'f'
        AND n.nspname = 'public'
        AND rel.relname = ?
      ORDER BY con.conname`,
    [nom]
  );

  const index = await db.query(
    `SELECT indexname, indexdef
       FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = ?
      ORDER BY indexname`,
    [nom]
  );

  const lignes = await db.query(`SELECT COUNT(*) AS n FROM ${identifiant(nom)}`);
  return { colonnes, fk, index, lignes: Number(lignes[0]?.n ?? 0) };
}

function typeLisible(type) {
  const t = String(type).toLowerCase();
  if (/^(smallint|integer|bigint|serial|bigserial)/.test(t)) return 'entier';
  if (/^(numeric|decimal|real|double precision)/.test(t)) return 'nombre';
  if (/^(character varying|character|text|varchar|char)/.test(t)) return 'texte';
  if (t.startsWith('timestamp')) return 'horodatage';
  if (t === 'date') return 'date';
  if (t.startsWith('time')) return 'heure';
  if (t === 'boolean') return 'booléen';
  if (t === 'jsonb' || t === 'json') return 'JSON';
  return t;
}

function defaultLisible(valeur) {
  if (valeur === null || valeur === undefined) return '—';
  if (/^nextval\(/i.test(valeur)) return 'séquence';
  return String(valeur).replace(
    /::(character varying|text|bpchar|timestamp without time zone|date|smallint|integer|bigint)/gi,
    ''
  );
}

function cellule(valeur) {
  return String(valeur ?? '—').replace(/\|/g, '\\|');
}

async function main() {
  const sortie = [
    '# Schéma de la base de données — `srsp_db`',
    '',
    'Document **généré automatiquement** à partir de la base PostgreSQL vivante :',
    '`node Backend/scripts/generer-doc-schema.mjs`.',
    '',
    "Il ne peut donc pas diverger de ce que l'application utilise réellement.",
    '',
    '## Conventions',
    '',
    '| Convention | Règle |',
    '|---|---|',
    '| SGBD | PostgreSQL 18, base `srsp_db`, schéma `public`. |',
    '| Noms de tables | `snake_case` au singulier. |',
    '| Clés primaires | `id` entier, `GENERATED BY DEFAULT AS IDENTITY` (séquence PostgreSQL). |',
    '| Horodatage | `timestamp without time zone`, heure locale du service ; `date_action` pour le journal. |',
    '| Collation | Colonnes texte en `COLLATE ci` : recherche insensible à la casse et aux accents. |',
    '| Suppression | `ON DELETE CASCADE` quand l\'enfant n\'a aucun sens sans son parent ; `SET NULL` quand la trace doit survivre ; `RESTRICT` quand la référence est structurante. |',
    '| Montants | `numeric`, jamais `double precision`. |',
    '| Dates de service | `date` pour un jour, `timestamp` sans fuseau pour un horodatage. |',
    '',
  ];

  const toutes = await db.query(
    `SELECT tablename
       FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename`
  );
  const noms = toutes.map((r) => r.tablename);
  const metier = TABLES_METIERS.filter((t) => noms.includes(t));
  const autres = noms.filter((t) => !metier.includes(t));

  for (const groupe of [
    {
      titre: 'Référentiel et comptes',
      tables: metier.filter((t) => [
        'users', 'roles', 'permissions', 'role_permissions', 'agents', 'divisions',
        'types_dossiers', 'sous_types_dossiers', 'statuts_dossiers', 'priorites',
        'fonctions', 'types_courriers', 'types_documents',
      ].includes(t)),
    },
    {
      titre: 'Dossiers et circuit',
      tables: metier.filter((t) => [
        'dossiers', 'historique_actions', 'suppressions_dossiers', 'depouillements',
        'types_pieces', 'documents', 'archives', 'affectations', 'transferts',
        'traitements', 'dossier_commentaires', 'notifications', 'messages',
        'bordereaux', 'bordereaux_dossiers', 'courriers', 'mandatements',
        'schemas_operations', 'donnees_operation', 'signalements_dossier',
        'immatriculations', 'reinitialisations_mot_de_passe',
      ].includes(t)),
    },
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
          `| \`${c.Field}\` | ${typeLisible(c.Type)} | ${c.Null === 'YES' ? 'oui' : 'non'} | ` +
          `${defaultLisible(c.Default)} | ${cellule(c.Comment)} |`
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
      const indexUniques = info.index
        .filter((i) => /^CREATE UNIQUE INDEX/i.test(i.indexdef))
        .map((i) => i.indexname);
      if (indexUniques.length) {
        sortie.push(`**Index uniques** : ${indexUniques.map((i) => `\`${i}\``).join(', ')}.`);
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
