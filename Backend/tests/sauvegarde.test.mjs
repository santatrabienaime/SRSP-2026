/* La sauvegarde doit couvrir TOUT, et le dire quand elle ne couvre pas.
 *
 * Ce test a été écrit après avoir constaté que la liste de tables était figée :
 * mysqldump ne prévient pas quand on lui donne une liste partielle, il produit
 * un fichier valide et incomplet. Le seul contrôle possible est de compter ce
 * que le dump contient réellement, et de le comparer à ce que la base holds. */
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
import { createBackup, listBackups, BACKUP_DIR } from '../src/services/backupService.js';
import db from '../src/config/db.js';

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};

const login = async (email, motDePasse) => (await (await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifiant: email, password: motDePasse }),
})).json());
const admin = await login('admin@srsp.mg', 'Admin123!');

console.log('=== 1. La sauvegarde couvre toutes les tables ===');
const avant = await listBackups();
const resultat = await createBackup(admin.user.id);
v('sauvegarde produite', !!resultat.fichier, resultat.fichier);
v('le fichier existe', await fs.stat(resultat.chemin).then(() => true).catch(() => false));

const dump = await fs.readFile(resultat.chemin, 'utf8');
const tablesReelles = (await db.query('SHOW TABLES')).map((l) => Object.values(l)[0]);
const techniques = ['information_schema', 'performance_schema', 'mysql', 'sys'];
const attendues = tablesReelles.filter((t) => !techniques.includes(t));

const couvertes = attendues.filter((t) => dump.includes(`CREATE TABLE \`${t}\``));
const manquantes = attendues.filter((t) => !couvertes.includes(t));
v(`toutes les tables applicatives sont dans le dump (${couvertes.length}/${attendues.length})`,
  manquantes.length === 0, manquantes.join(', ') || 'aucune manquante');

/* Les tables creees recemment etaient precisement celles qui manquaient. */
for (const critique of [
  'immatriculations', 'insertions_augure', 'modes_paiement',
  'ordres_deplacement', 'visas_controle_financier', 'types_pieces',
  'mandatements', 'correspondances',
]) {
  v(`  ${critique}`, couvertes.includes(critique));
}

console.log('\n=== 2. Les donnees reellement presentes sont sauvegardees ===');
for (const [table, colonne] of [
  ['immatriculations', 'numero'],
  ['agents', 'nom'],
  ['dossiers', 'numero'],
]) {
  const n = (await db.query(`SELECT COUNT(*) AS n FROM \`${table}\``))[0].n;
  if (n === 0) { v(`${table} (vide, rien a verifier)`, true); continue; }
  const valeurs = await db.query(`SELECT \`${colonne}\` AS v FROM \`${table}\` LIMIT 3`);
  const trouvees = valeurs.filter((l) => dump.includes(String(l.v).replace(/'/g, ''))).length;
  v(`${table} : valeurs presentes dans le dump`, trouvees > 0, `${trouvees}/${valeurs.length} retrouvees`);
}

console.log('\n=== 3. Les pieces jointes sont sauvegardees ===');
const dossier = new URL('../src/uploads/documents/', import.meta.url).pathname;
const fichiers = await fs.readdir(dossier).catch(() => []);
v('le dossier des pieces existe', fichiers.length > 0, `${fichiers.length} fichier(s)`);
const pieces = resultat.pieces_jointes;
v('l archive des pieces est declaree', !!pieces.archive, pieces.archive || 'AUCUNE');
v('l archive annonce le nombre de fichiers', pieces.nb_fichiers === fichiers.length,
  `${pieces.nb_fichiers} annonce / ${fichiers.length} reels`);
if (pieces.archive) {
  const existe = await fs.stat(`${BACKUP_DIR}/${pieces.archive}`).then(() => true).catch(() => false);
  v('le fichier archive existe sur le disque', existe);
  if (existe) {
    /* Le point qui compte : l'archive contient-elle les octets, ou seulement
       des noms ? Une archive de noms ne restituerait aucun document. */
    const contenu = await execFileAsync('tar', ['-tzf', `${BACKUP_DIR}/${pieces.archive}`]);
    const liste = contenu.stdout.trim().split('\n');
    v('l archive contient les fichiers', liste.length >= fichiers.length,
      `${liste.length} entree(s) dans l archive`);
  }
}

console.log('\n=== 4. La restauration est possible ===');
/* On restaure VRAIMENT le dump dans une base temporaire, puis on compare les
   nombres de lignes avec la source. C'est le seul contrôle qui compte : un
   fichier de sauvegarde valide et vide se restaure sans la moindre erreur, et
   le perdant s'en aperçoit le jour où il a besoin des dossiers.

   Le dump passe par un fichier et non par l'entrée standard : `execFile` et
   `mariadb` ne s'entendent pas sur ce flux, et l'opération se termine en
   timeout sans message — très difficile à distinguer d'une vraie panne. */
const baseTest = 'srsp_restore_test';
const MYSQL = { ...process.env, MYSQL_PWD: 'kirikoukuna\\james' };
const mariadb = (args, input) =>
  execFileAsync('mariadb', ['--ssl=0', '-h127.0.0.1', '-P3307', '-uroot', ...args],
    { env: MYSQL, timeout: 90000, maxBuffer: 1024 * 1024 * 300, ...(input ? { input } : {}) });

try {
  await mariadb(['-e', `DROP DATABASE IF EXISTS ${baseTest}; CREATE DATABASE ${baseTest} CHARACTER SET utf8mb4;`]);

  // Le client MariaDB lit `-e` et le fichier, mais pas les deux : on écrit le
  // dump dans un fichier temporaire et on le fait executer.
  const fichierTmp = `${BACKUP_DIR}/.restauration-test.sql`;
  await fs.writeFile(fichierTmp, dump, 'utf8');
  // Le shell est necessaire ici : `execFile` n'interprete pas la redirection
  // `<`. C'est le seul endroit du projet ou un shell est employe, et la
  // commande est construite a partir de noms connus, jamais de saisie.
  const { exec: execShell } = await import('node:child_process');
  await new Promise((resolve, reject) => {
    execShell(`mariadb --ssl=0 -h127.0.0.1 -P3307 -uroot ${baseTest} < ${fichierTmp}`,
      { env: MYSQL, timeout: 120000, maxBuffer: 1024 * 1024 * 300 },
      (e, stdout, stderr) => (e ? reject(new Error(stderr || e.message)) : resolve()));
  });
  await fs.unlink(fichierTmp).catch(() => {});

  const compte = async (requete, base = baseTest) =>
    Number((await mariadb(['-N', '-B', base, '-e', requete])).stdout.trim());

  const nbTables = await compte(
    `SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${baseTest}'`
  );
  v('le dump se restaure sans erreur', true, `${nbTables} table(s) restauree(s)`);
  v('la restauration retrouve toutes les tables', nbTables === tablesReelles.length,
    `${nbTables} restaurees / ${tablesReelles.length} dans la source`);

  /* Le contrôle décisif : la base restaurée contient-elle les MÊMES nombres de
     lignes que la source ? Une restauration « réussie » qui vide les dossiers
     ne lève aucune erreur. */
  for (const table of ['dossiers', 'agents', 'permissions', 'immatriculations', 'ordres_deplacement']) {
    const src = (await db.query(`SELECT COUNT(*) AS n FROM \`${table}\``))[0].n;
    const ligne = await compte(`SELECT COUNT(*) FROM \`${table}\``);
    v(`${table} : mêmes lignes après restauration`, ligne === src, `${ligne} restauré / ${src} source`);
  }
} catch (e) {
  v('la restauration fonctionne', false, String(e.message).slice(0, 200));
} finally {
  await mariadb(['-e', `DROP DATABASE IF EXISTS ${baseTest};`]).catch(() => {});
}

console.log('\n=== Nettoyage : la sauvegarde de test est retiree ===');
await fs.unlink(resultat.chemin).catch(() => {});
if (resultat.pieces_jointes.archive) {
  await fs.unlink(`${BACKUP_DIR}/${resultat.pieces_jointes.archive}`).catch(() => {});
}
const restant = await listBackups();
v('les sauvegardes d avant sont intactes', restant.length === avant.length,
  `${avant.length} avant / ${restant.length} apres`);

await db.pool.end();
console.log(ko === 0 ? '\n  TOUT CONFORME' : `\n  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);
