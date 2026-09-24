import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env.js';
import * as historiqueModel from '../models/historiqueModel.js';

const execFileAsync = promisify(execFile);

/** Dossier de stockage des sauvegardes. */
export const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');

/** Noms de tables applicatives sauvegardées (hors tables techniques MariaDB). */
const TABLES = [
  'users', 'roles', 'permissions', 'role_permissions', 'divisions', 'fonctions',
  'agents', 'types_dossiers', 'priorites', 'statuts_dossiers', 'types_courriers',
  'types_documents', 'dossiers', 'courriers', 'documents', 'notifications',
  'historique_actions', 'affectations', 'transferts', 'traitements',
  'verifications', 'validations', 'archives',
];

/**
 * Crée une sauvegarde SQL de la base applicative.
 * Utilise mysqldump si disponible ; sinon renvoie une erreur explicite
 * (on ne produit jamais de fichier vide silencieux).
 */
export async function createBackup(userId) {
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `srsp-${stamp}.sql`);

  const args = [
    `-h${config.db.host || '127.0.0.1'}`,
    `-P${config.db.port || 3307}`,
    `-u${config.db.user}`,
    config.db.name,
    ...TABLES,
    '--single-transaction',
    '--routines',
    '--skip-lock-tables',
  ];

  let dump;
  try {
    // MYSQL_PWD évite d'exposer le mot de passe dans la ligne de commande.
    const { stdout } = await execFileAsync('mysqldump', args, {
      env: { ...process.env, MYSQL_PWD: config.db.password || '' },
      maxBuffer: 1024 * 1024 * 100,
    });
    dump = stdout;
  } catch (error) {
    throw new Error(
      `Sauvegarde impossible (mysqldump indisponible ou échec) : ${error.message}`
    );
  }

  if (!dump || dump.trim().length === 0) {
    throw new Error('Sauvegarde vide :Dump refusé pour ne pas produire de fichier corrompu.');
  }

  await fs.writeFile(file, dump, 'utf8');
  const { size } = await fs.stat(file);

  await historiqueModel.log({
    user_id: userId,
    action: 'SAUVEGARDE_DB',
    details: `Sauvegarde créée : ${path.basename(file)} (${size} octets).`,
  });

  return { fichier: path.basename(file), chemin: file, taille: size, date: new Date() };
}

/** Liste les sauvegardes existantes, de la plus récente à la plus ancienne. */
export async function listBackups() {
  try {
    const entries = await fs.readdir(BACKUP_DIR);
    const files = entries.filter((f) => f.endsWith('.sql'));
    const backups = await Promise.all(
      files.map(async (f) => {
        const st = await fs.stat(path.join(BACKUP_DIR, f));
        return { fichier: f, taille: st.size, date: st.mtime };
      })
    );
    return backups.sort((a, b) => b.date - a.date);
  } catch {
    return [];
  }
}
