import fs from 'fs';
import upload, { MAX_SIZE, messageTropGros } from '../config/multer.js';

/* Le refus exact d'un fichier trop lourd.
 *
 * Multer arrête le flux dès que la limite est atteinte, ce qui produit un
 * fichier tronqué sur le disque et une erreur LIMIT_FILE_SIZE. La limite qu'il
 * surveille est volontairement d'un octet au-dessus de la limite annoncée, pour
 * que la taille réelle soit connue. C'est ici que la règle « 5 Mo maximum »
 * s'applique : un fichier de 5 Mo exactement est accepté, un fichier de
 * 5 Mo plus un octet est refusé.
 *
 * Le fichier déjà écrit est supprimé avant de répondre. Le refuser sans le
 * retirer laisserait sur le disque une pièce que personne n'a validée, dans un
 * dossier dont elle ne fait pas partie : invisible pour l'agent, impossible à
 * retrouver ensuite. */
function refuserSiTropGros(req, res, next) {
  const fichiers = [req.file, ...(req.files || [])].filter(Boolean);
  const tropGros = fichiers.find((f) => Number(f.size) > MAX_SIZE);

  if (!tropGros) return next();

  for (const f of fichiers) {
    // Un effacement qui échoue ne doit pas masquer le refus : le fichier sera de
    // toute façon absent du dossier.
    try {
      fs.unlinkSync(f.path);
    } catch {
      /* le fichier a déjà disparu : rien à nettoyer */
    }
  }

  return res.status(413).json({ message: messageTropGros() });
}

export const uploadSingle = (field) => (req, res, next) =>
  upload.single(field)(req, res, (err) => {
    if (err) return next(err);
    return refuserSiTropGros(req, res, next);
  });

export const uploadMultiple = (field, max) => (req, res, next) =>
  upload.array(field, max)(req, res, (err) => {
    if (err) return next(err);
    return refuserSiTropGros(req, res, next);
  });
