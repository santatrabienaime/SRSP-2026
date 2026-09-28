import * as model from '../models/archiveModel.js';
import * as dossierModel from '../models/dossierModel.js';
import * as scopeService from './scopeService.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

/**
 * Consultation, restauration et export des archives.
 *
 * Cloisonnement : un chef de division ne voit que les archives de SA division.
 * La permission `view_archives` ouvre la consultation ; elle ne dit rien du
 * périmètre. On applique donc les deux séparément, sinon un chef de division
 * pourrait lire les archives des trois autres divisions en appelant l'API.
 */

/** Filtres acceptés depuis le client. Rien d'autre n'est lu. */
const FILTRES_ACCEPTES = [
  'q', 'type_id', 'type_code', 'division_id', 'annee', 'date_debut', 'date_fin',
  'agent_id', 'demandeur', 'matricule', 'tri', 'restaure',
];

/**
 * Extrait et nettoie les filtres, puis impose le périmètre de l'utilisateur.
 * Le `division_id` du client est ignoré s'il contredit le périmètre.
 */
async function filtresPour(userId, requete = {}) {
  const scope = await scopeService.getScope(userId);
  const filtres = {};
  for (const cle of FILTRES_ACCEPTES) {
    if (requete[cle] !== undefined && requete[cle] !== '') filtres[cle] = requete[cle];
  }

  // Un chef de division est verrouillé sur sa division, quel que soit le
  // division_id demandé.
  if (scope.divisionScoped && scope.divisionId) {
    filtres.division_id = scope.divisionId;
  }

  // Un agent n'a pas view_archives : il n'arrivera pas jusqu'ici (le contrôleur
  // le refuse), mais on ne construit jamais une requête ouverte par défaut.
  if (!scope.permissions.includes('view_archives') && !scope.divisionScoped) {
    throw httpError(403, 'Accès refusé : consultation des archives non autorisée.');
  }

  return { filtres, scope };
}

/** Liste paginée des archives, dans le périmètre de l'utilisateur. */
export async function lister(userId, requete = {}) {
  const { filtres } = await filtresPour(userId, requete);
  const limit = Math.min(Math.max(Number(requete.limit) || 20, 1), 100);
  const offset = Math.max(Number(requete.offset) || 0, 0);
  const { lignes, total } = await model.rechercher(filtres, { limit, offset });
  return { archives: lignes, total, limit, offset };
}

/** Lignes correspondant aux filtres, sans pagination (export). */
export async function lignesPourExport(userId, requete = {}) {
  const { filtres } = await filtresPour(userId, requete);
  return { lignes: await model.tousLesDossiers(filtres), filtres };
}

/** Statistiques d'archives, dans le périmètre. */
export async function statistiques(userId, requete = {}) {
  const { filtres } = await filtresPour(userId, requete);
  return model.statistiques(filtres);
}

/** Alertes de fin de conservation. */
export async function alertes(userId, requete = {}) {
  const { filtres } = await filtresPour(userId, requete);
  return model.alertesConservation(filtres);
}

/** Fiche d'un dossier archivé, dans le périmètre. */
export async function detail(userId, dossierId) {
  if (!await scopeService.accesDossier(userId, dossierId)) {
    throw httpError(403, "Accès refusé : ce dossier n'appartient pas à votre périmètre.");
  }
  const archive = await model.parDossierId(dossierId);
  if (!archive) throw httpError(404, 'Ce dossier ne figure pas aux archives.');
  return archive;
}

/**
 * Restaure un dossier archivé. RÉSERVÉE À L'ADMINISTRATEUR, avec motif
 * obligatoire : une restauration sans motif laisserait un dossier revenir en
 * circulation sans justification.
 *
 * Le dossier retourne au statut CLOTURE, pas à ARCHIVE : c'est l'étape
 * immédiatement avant l'archivage, et c'est ce que demande le document.
 */
export async function restaurer(userId, dossierId, motif) {
  const texte = String(motif || '').trim();
  if (!texte) {
    throw httpError(422, 'Un motif de restauration est obligatoire.');
  }

  const [user] = await db.query(
    `SELECT r.nom AS role_nom
     FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.id = ? LIMIT 1`,
    [userId]
  );
  if (user?.role_nom !== 'ADMIN') {
    throw httpError(403, 'Seul l\'administrateur peut restaurer un dossier archivé.');
  }

  const archive = await model.parDossierId(dossierId);
  if (!archive) throw httpError(404, 'Ce dossier ne figure pas aux archives.');

  await model.marquerRestauration(archive.archive_id, dossierId, userId, texte);

  const [cloture] = await db.query(
    "SELECT id FROM statuts_dossiers WHERE code = 'CLOTURE' LIMIT 1"
  );
  if (!cloture) throw httpError(500, 'Statut CLOTURE introuvable.');

  await db.query(
    'UPDATE dossiers SET statut_id = ?, date_archivage = NULL WHERE id = ?',
    [cloture.id, dossierId]
  );

  return { dossier_id: dossierId, statut: 'CLOTURE', motif: texte };
}

export { model };
