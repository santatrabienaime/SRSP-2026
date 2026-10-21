/**
 * Contrôle de l'encodage des sources.
 *
 * Un редаiteur ou un shell qui relit un fichier avec le mauvais jeu de
 * caractères le dégrade silencieusement : les accents deviennent « Ã© »,
 * les flèches perdent un octet. Le code compile, les tests passent — et les
 * messages affichés à l'agent sont illisibles.
 *
 * Ce contrôle le détecte : caractère de remplacement, octet de contrôle
 * inattendu, et double encodage caractéristique.
 */
import fs from 'node:fs';
import path from 'node:path';

const RACINES = ['src', 'scripts', '../Frontend/src', '../docs'];
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.md']);

let problemes = 0;
let fichiers = 0;

function parcourir(cible) {
  if (!fs.existsSync(cible)) return;
  for (const entree of fs.readdirSync(cible, { withFileTypes: true })) {
    const chemin = path.join(cible, entree.name);
    /* Le contrôleur contient lui-même les motifs qu'il cherche : il ne peut
       pas s'analyser lui-même. */
    if (chemin.endsWith('verifier-encodage.mjs')) continue;
    if (entree.isDirectory()) {
      parcourir(chemin);
      continue;
    }
    if (!EXTENSIONS.has(path.extname(entree.name))) continue;

    fichiers += 1;
    const texte = fs.readFileSync(chemin, 'utf8');

    const remplacement = (texte.match(/�/g) || []).length;
    const controles = (texte.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
    const double = (texte.match(/Ã[\u0080-\u00BF]|â[\u0080-\u00BF]{2}/g) || []).length;

    /* Une apostrophe élidée devenue un tiret trahit la même dégradation :
       le symptôme le plus discret, parce que le code compile et que le
       message reste lisible. */
    const apostrophes = (texte.match(/[a-zA-Zàâéèêëîïôûùç]—[a-zA-Zàâéèêëîïôûùçé]/g) || []).length;

    /* Un caractère CJK dans un document français trahit un copier-coller
       accidentel : il n'a rien à y faire ici. */
    const cjk = (texte.match(/[一-鿿]/g) || []).length;

    if (remplacement || controles || double || apostrophes || cjk) {
      problemes += 1;
      console.log(
        `⚠️  ${chemin} : ${remplacement} remplacement(s), ${controles} contrôle(s), `
        + `${double} double(s), ${apostrophes} apostrophe(s), ${cjk} caractère(s) CJK`
      );
      texte.split('\n').forEach((l, i) => {
        if (/�|[\u0000-\u0008\u000B\u000C\u000E-\u001F]|Ã[\u0080-\u00BF]|[a-zA-Zàâéèêëîïôûùç]—[a-zA-Zàâéèêëîïôûùçé]|[一-鿿]/.test(l)) {
          console.log(`    ${i + 1}: ${l.trim().slice(0, 110)}`);
        }
      });
    }
  }
}

for (const racine of RACINES) parcourir(racine);

console.log(`\n${fichiers} fichier(s) vérifié(s), ${problemes} avec un défaut d'encodage.`);
process.exit(problemes === 0 ? 0 : 1);
