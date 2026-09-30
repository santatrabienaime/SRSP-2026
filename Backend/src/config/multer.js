import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '..', 'uploads');

['documents', 'courriers', 'temp'].forEach((dir) => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.baseUrl.includes('courriers') ? 'courriers' : 'documents';
    cb(null, path.join(uploadDir, type));
  },
  filename: (req, file, cb) => {
    /* UUID, et non horodatage plus nombre aléatoire.
     *
     * L'exigence du document est explicite, et elle a une raison : un nom
     * construit à partir de `Date.now()` devine le nom de la personne qui a
     * déposé la pièce — l'horodatage est celui du dépôt. Un nom de fichier
     * officiel ne doit rien révéler de celui qui l'a déposé, et il ne doit
     * pas dépendre d'un tirage aléatoire pour être unique.
     *
     * Le nom d'origine est également perdu : seul le type MIME et l'extension
     * sont conservés. Un fichier déposé sous « contrat_secret.docx » garderait
     * sinon son nom sur le disque du serveur.
     */
    const nom = randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, nom + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error(`Extension non autorisée. Autorisées : ${allowed.join(', ')}`));
};

/* La limite annoncée est de 5 Mo : un fichier de 5 Mo piles doit donc être
 * accepté, et un fichier de 5 Mo plus un octet refusé.
 *
 * Multer, lui, refuse dès que le flux atteint la limite : vérifié, un fichier
 * de 100 octets passe sous une limite de 100, mais un fichier de 100 octets
 * exactement est rejeté en LIMIT_FILE_SIZE. La limite est donc relevée d'un
 * octet pour laisser passer le cas limite, et le refus exact est appliqué par
 * le middleware d'upload, qui connaît la taille réelle du fichier.
 *
 * D'un octet seulement : un dépôt de 100 Mo s'arrête toujours après 5 Mo et
 * un octet d'écriture, et le fichier est supprimé. Une limite relevée
 * franchement, ou l'absence de limite, laisserait un agent sans contrôle
 * remplir le disque du serveur. */
export const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

/* Le message de refus est écrit ici, une seule fois.
 *
 * Un fichier trop lourd peut être refusé par deux voies : le middleware, quand
 * sa taille est connue, et le gestionnaire d'erreurs, quand le flux a été coupé
 * avant. Deux libellés pour un même refus oblige l'agent à croire qu'il a
 * rencontré deux problèmes différents. */
export const messageTropGros = () =>
  `Pièce trop volumineuse : la taille maximale est de ${(MAX_SIZE / (1024 * 1024)).toFixed(0)} Mo.`;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE + 1,
  },
});

export default upload;