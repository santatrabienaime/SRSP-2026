import { execFile, spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';

const execFileAsync = promisify(execFile);

/** Dossier de stockage des sauvegardes. */
export const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');

/**
 * Tables techniques de MariaDB, exclues de la sauvegarde.
 *
 * Elles appartiennent au moteur et non à l'application : les reconstruire ne
 * ferait qu'allourdir le fichier, et une version différente pourrait les
 * rendre illisibles. Tout ce qui n'est pas dans cette liste est sauvegardé.
 */
const TABLES_TECHNIQUES = [
  'information_schema', 'performance_schema', 'mysql', 'sys',
];

/**
 * Toutes les tables applicatives, découvertes à l'instant de la sauvegarde.
 *
 * La liste était écrite en dur, et figée : elle comptait 23 tables sur 47. Les
 * 24 autres — immatriculations, insertions Augure, modes de paiement, ordres
 * de déplacement, visa du contrôle financier, correspondance, décomptes — n
 * étaient pas dans la sauvegarde. Un mois de travail s'aurait perdu sans
 * message d'erreur : mysqldump ne prévient pas quand on lui donne une liste
 * partielle, il produit un fichier valide et incomplet.
 *
 * Découvrir les tables supprime le risque à la source. Une table créée demain
 * est sauvegardée sans qu'on ait à la rajouter.
 */
async function tablesApplicatives() {
  const lignes = await db.query(
    'SHOW TABLES'
  );
  return lignes
    .map((l) => Object.values(l)[0])
    .filter((nom) => !TABLES_TECHNIQUES.includes(nom));
}

/**
 * Crée une sauvegarde SQL de la base applicative.
 * Utilise mysqldump si disponible ; sinon renvoie une erreur explicite
 * (on ne produit jamais de fichier vide silencieux).
 */
export async function createBackup(userId) {
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `srsp-${stamp}.sql`);

  const TABLES = await tablesApplicatives();

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
  const { size: tailleSql } = await fs.stat(file);

  /* Les PIÈCES JOINTES sont sauvegardées à part.
     Le dump SQL ne contient que le CHEMIN des fichiers : les octets des PDF et
     des scans vivent dans Backend/src/uploads/documents/. Une restauration
     depuis le seul .sql redonnerait une base cohérente dont aucun document ne
     s'ouvre — un état pire qu'une absence, car il a l'air complet.

     On archive donc les pièces dans une archive à côté du dump, et on le dit
     dans le journal : une sauvegarde annoncée sans ses documents serait un
     mensonge. */
  const archive = await archiverPieces(file);
  const taille = archive ? tailleSql + archive.taille : tailleSql;

  await historiqueModel.log({
    user_id: userId,
    action: 'SAUVEGARDE_DB',
    details:
      `Sauvegarde créée : ${path.basename(file)} (${taille} octets)` +
      (archive ? `, pièces jointes incluses (${archive.nb_fichiers} fichier(s)).` : ', AUCUNE pièce jointe incluse.'),
  });

  return {
    fichier: path.basename(file),
    chemin: file,
    taille,
    date: new Date(),
    pieces_jointes: archive
      ? { archive: path.basename(archive.chemin), nb_fichiers: archive.nb_fichiers, taille: archive.taille }
      : { archive: null, nb_fichiers: 0, taille: 0, avertissement: 'Aucune pièce jointe sauvegardée.' },
  };
}

/** Dossier des pièces jointes téléversées. */
export const UPLOADS_DIR = path.resolve(process.cwd(), 'src/uploads/documents');

/**
 * Archive les pièces jointes à côté du dump SQL.
 *
 * `uploads/` contient plusieurs dossiers — documents, courriers, temp — et les
 * fichiers sont DANS ces sous-dossiers. Ne compter que les fichiers du dossier
 * parent donnait toujours zéro, et la sauvegarde annonçait « aucune pièce »
 * alors que sept documents attendaient : l'avertissement a laassé passer
 * l'omission, ce qui est pire que de ne pas archiver du tout.
 *
 * Renvoie null — sans faire échouer la sauvegarde — quand il n'y a rien à
 * archiver : un dossier vide est un cas normal, pas une panne.
 */
async function archiverPieces(dumpFile) {
  const racine = path.dirname(UPLOADS_DIR);

  // On ne descend que d'un niveau : `temp` ne contient que des fichiers
  // d'échange en cours de téléversement, sans valeur, et les archiver gonflerait
  // la sauvegarde pour rien.
  const A_ARCHIVER = ['documents', 'courriers'];
  let aArchiver = [];
  for (const nom of A_ARCHIVER) {
    const chemin = path.join(racine, nom);
    const entrees = await fs.readdir(chemin, { withFileTypes: true }).catch(() => []);
    aArchiver.push(...entrees.filter((e) => e.isFile()).map((e) => path.join(nom, e.name)));
  }
  if (!aArchiver.length) return null;

  const archive = dumpFile.replace(/\.sql$/, '-pieces.tar.gz');
  /* `tar` est externe au projet. S'il échoue, le SQL est tout de même produit :
     mieux vaut une sauvegarde partielle et signalée qu'aucune sauvegarde.

     L'échec est PROPAGÉ quand `tar` lui-même a échoué, et non avalé. Un
     `.catch(() => null)` avait masqué une ReferenceError — un nom de variable
     oublié — qui rendait l'archive invisible alors que tout le reste
     fonctionnait. Un garde-fou qui avale les vraies causes donne l'illusion
     d'une dégradation propre. */
  await execFileAsync('tar', ['-czf', archive, '-C', racine, ...aArchiver], {
    maxBuffer: 1024 * 1024 * 100,
  });

  const { size } = await fs.stat(archive);
  return { chemin: archive, taille: size, nb_fichiers: aArchiver.length };
}

/** Liste les sauvegardes existantes, de la plus récente à la plus ancienne. */
/**
 * Restauration d'une sauvegarde SQL (opération destructive).
 *
 * Trois barrières avant que la base ne soit touchée : nom de fichier
 * strictement borné au dossier des sauvegardes, existence vérifiée, puis une
 * sauvegarde de sécurité créée automatiquement — si la restauration se révèle
 * mauvaise, on revient à l'état d'avant en une opération.
 *
 * Le dump est rejoué tel quel par le client mysql (stdin) : il contient les
 * DROP/CREATE des tables sauvegardées. Les tables créées APRÈS la sauvegarde
 * ne sont pas dans le dump et survivent à la restauration — c'est volontaire :
 * effacer une table qui n'existe pas dans le dump serait une perte cachée.
 */
export async function restoreBackup(nomFichier, userId) {
  const nom = path.basename(String(nomFichier || ''));
  if (!/^srsp-[A-Za-z0-9._-]+\.sql$/.test(nom)) {
    throw new Error('Nom de sauvegarde invalide.');
  }
  const file = path.join(BACKUP_DIR, nom);
  try {
    await fs.access(file);
  } catch {
    throw new Error('Sauvegarde introuvable.');
  }

  const securite = await createBackup(userId);

  const args = [
    `-h${config.db.host || '127.0.0.1'}`,
    `-P${config.db.port || 3307}`,
    `-u${config.db.user}`,
    config.db.name,
  ];
  await new Promise((resolve, reject) => {
    const child = spawn('mysql', args, {
      env: { ...process.env, MYSQL_PWD: config.db.password || '' },
    });
    // EPIPE si mysql échoue avant la fin du flux : le rejet vient du code.
    child.stdin.on('error', () => {});
    createReadStream(file).pipe(child.stdin);
    child.on('error', (err) => reject(new Error(`Client mysql indisponible : ${err.message}`)));
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`Restauration échouée (mysql, code ${code}).`))
    );
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'RESTAURATION_DB',
    details: `Restauration depuis ${nom} (sauvegarde de sécurité créée : ${securite.fichier}).`,
  });

  return {
    message: 'Base restaurée.',
    restaure: nom,
    sauvegarde_securite: securite.fichier,
  };
}

export async function listBackups() {
  try {
    const entries = await fs.readdir(BACKUP_DIR);
    // Les archives de pièces sont listées aussi : une sauvegarde dont les
    // documents manquent n'est pas une sauvegarde, et l'écran doit le montrer.
    const files = entries.filter((f) => f.endsWith('.sql') || f.endsWith('-pieces.tar.gz'));
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
