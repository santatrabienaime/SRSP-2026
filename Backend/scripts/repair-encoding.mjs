/**
 * Répare les caractères corrompus lors de l'import de `srsp_db.sql`.
 *
 * L'import initial a fait transiter le texte par la chaîne
 *   UTF-8  ->  cp850  ->  UTF-8  ->  cp1252  ->  UTF-8
 * ce qui transforme par exemple « Reçu » en « Reâ”œÂºu » et
 * « système » en « systâ”œÂ¿me ».
 *
 * Ce script applique exactement la transformation inverse, valeur par valeur,
 * avec une double validation : si l'un des décodages UTF-8 échoue, la valeur
 * est considérée comme déjà correcte et laissée intacte.
 *
 * Usage (depuis le dossier `Backend`) :
 *   node scripts/repair-encoding.mjs           # simulation, aucune écriture
 *   node scripts/repair-encoding.mjs --apply   # applique les corrections
 */
import mysql from 'mysql2/promise';
import { config } from '../src/config/env.js';

const APPLY = process.argv.includes('--apply');
const MAX_SAMPLES = Number(process.env.SAMPLES ?? 6);

const utf8Strict = new TextDecoder('utf-8', { fatal: true });

// --- cp1252 (MySQL appelle ce jeu « latin1 ») -----------------------------
const cp1252Decoder = new TextDecoder('windows-1252');
const cp1252ToByte = new Map();
for (let b = 0; b < 256; b += 1) {
  cp1252ToByte.set(cp1252Decoder.decode(Uint8Array.of(b)), b);
}

const conn = await mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  charset: 'utf8mb4',
});

// --- cp850 (absent de Node : on demande la table à MariaDB) ---------------
const cp850ToByte = new Map();
{
  const [rows] = await conn.query(
    `WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 255)
     SELECT n, HEX(CONVERT(CHAR(n USING cp850) USING utf8mb4)) AS h FROM seq`,
  );
  for (const row of rows) {
    cp850ToByte.set(utf8Strict.decode(Buffer.from(row.h, 'hex')), row.n);
  }
}

/** Applique la chaîne inverse ; renvoie null si la valeur est déjà correcte. */
function repair(value) {
  if (typeof value !== 'string' || value === '') return null;
  // Une valeur purement ASCII n'a jamais été touchée par la corruption.
  if (!/[^\x00-\x7F]/.test(value)) return null;

  // 1. caractères -> octets cp1252
  const b1 = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    const byte = cp1252ToByte.get(value[i]);
    if (byte === undefined) return null;
    b1[i] = byte;
  }

  // 2. ces octets, relus comme de l'UTF-8, redonnent le texte cp850
  let intermediate;
  try {
    intermediate = utf8Strict.decode(b1);
  } catch {
    return null;
  }

  // 3. caractères cp850 -> octets cp850
  const b2 = new Uint8Array(intermediate.length);
  for (let i = 0; i < intermediate.length; i += 1) {
    const byte = cp850ToByte.get(intermediate[i]);
    if (byte === undefined) return null;
    b2[i] = byte;
  }

  // 4. ces octets, relus comme de l'UTF-8, redonnent le texte d'origine
  let fixed;
  try {
    fixed = utf8Strict.decode(b2);
  } catch {
    return null;
  }

  if (fixed === value) return null;
  // Garde-fou supplémentaire : un texte valide ne contient pas de demi-paire
  // de substitution. Si c'est le cas, on ne touche à rien.
  if (fixed.includes('\uFFFD')) return null;
  return fixed;
}

const TEXT_TYPES = `('char','varchar','tinytext','text','mediumtext','longtext','enum','set')`;

const [columns] = await conn.query(
  `SELECT TABLE_NAME AS t, COLUMN_NAME AS c
     FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND DATA_TYPE IN ${TEXT_TYPES}
    ORDER BY TABLE_NAME, ORDINAL_POSITION`,
);

const byTable = new Map();
for (const { t, c } of columns) {
  if (!byTable.has(t)) byTable.set(t, []);
  byTable.get(t).push(c);
}

let totalChanged = 0;
const summary = [];

for (const [table, cols] of byTable) {
  const [pkCols] = await conn.query(
    `SELECT COLUMN_NAME AS c
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
      ORDER BY ORDINAL_POSITION`,
    [table],
  );
  if (pkCols.length === 0) {
    summary.push({ table, skipped: 'aucune clé primaire' });
    continue;
  }
  const pks = pkCols.map((r) => r.c);
  const select = [...pks, ...cols].map((c) => `\`${c}\``).join(', ');
  const [rows] = await conn.query(`SELECT ${select} FROM \`${table}\``);

  for (const col of cols) {
    const changes = [];
    for (const row of rows) {
      const before = row[col];
      const after = repair(before);
      if (after !== null) changes.push({ pk: pks.map((p) => row[p]), before, after });
    }
    if (changes.length === 0) continue;
    totalChanged += changes.length;
    summary.push({ table, column: col, count: changes.length, samples: changes.slice(0, MAX_SAMPLES) });

    if (APPLY) {
      for (const change of changes) {
        const where = pks.map((p) => `\`${p}\` = ?`).join(' AND ');
        await conn.query(`UPDATE \`${table}\` SET \`${col}\` = ? WHERE ${where}`, [change.after, ...change.pk]);
      }
    }
  }
}

console.log(`\n=== ${APPLY ? 'CORRECTIONS APPLIQUÉES' : 'SIMULATION (aucune écriture)'} ===\n`);
for (const entry of summary) {
  if (entry.skipped) {
    console.log(`- ${entry.table} : ignorée (${entry.skipped})`);
    continue;
  }
  console.log(`- ${entry.table}.${entry.column} : ${entry.count} valeur(s)`);
  for (const s of entry.samples) {
    console.log(`    ${JSON.stringify(s.before)}  ->  ${JSON.stringify(s.after)}`);
  }
}
console.log(`\nTotal : ${totalChanged} valeur(s) ${APPLY ? 'corrigée(s)' : 'à corriger'}.`);

await conn.end();
