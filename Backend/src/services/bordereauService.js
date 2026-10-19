import * as bordereauModel from '../models/bordereauModel.js';
import * as notificationService from './notificationService.js';
import { httpError } from '../utils/httpError.js';
import db from '../config/db.js';

/**
 * Crée un bordereau en brouillon avec une liste de dossiers.
 * Vérifie que les dossiers appartiennent à la division et sont éligibles.
 */
export async function createBordereau({ division_id, agent_id, observation, dossiers }) {
  // Vérifier division
  const [div] = await db.query(`SELECT id FROM divisions WHERE id = ?`, [division_id]);
  if (!div) throw httpError(422, 'Division inconnue');

  // Vérifier dossiers : tous doivent être de la division et éligibles
  if (dossiers?.length) {
    const eligibles = await bordereauModel.dossiersEligibles(division_id);
    if (!Array.isArray(eligibles)) {
      console.error('dossiersEligibles returned non-array:', eligibles);
      throw httpError(500, 'Erreur interne: eligibles invalide');
    }
    const eligibleIds = new Set(eligibles.map((d) => d.id));
    const invalides = dossiers.filter((d) => !eligibleIds.has(d.id));
    if (invalides.length) {
      throw httpError(422, `Certains dossiers ne sont pas éligibles (déjà dans un bordereau émis ou mauvais statut) : ${invalides.map((d) => d.id).join(', ')}`);
    }
  }

  return bordereauModel.create({ division_id, agent_id, observation, dossiers });
}

/**
 * Liste avec filtres et pagination
 */
export async function listBordereaux(params) {
  return bordereauModel.findAll(params);
}

/**
 * Détail complet
 */
export async function getBordereau(id) {
  const b = await bordereauModel.findById(id);
  if (!b) throw httpError(404, 'Bordereau introuvable');
  return b;
}

/**
 * Modification partielle (brouillon uniquement pour observation/division)
 */
export async function updateBordereau(id, data) {
  const b = await bordereauModel.findById(id);
  if (!b) throw httpError(404, 'Bordereau introuvable');

  // Si on change la division, revérifier éligibilité des dossiers
  if (data.division_id && data.division_id !== b.division_id) {
    const eligibles = await bordereauModel.dossiersEligibles(data.division_id);
    const eligibleIds = new Set(eligibles.map((d) => d.id));
    const actuels = await db.query(
      `SELECT dossier_id FROM bordereaux_dossiers WHERE bordereau_id = ?`,
      [id]
    );
    const invalides = actuels.filter((a) => !eligibleIds.has(a.dossier_id));
    if (invalides.length) {
      throw httpError(422, `Le changement de division invalide ${invalides.length} dossier(s) déjà dans le bordereau`);
    }
  }

  return bordereauModel.update(id, data);
}

/**
 * Ajoute des dossiers à un bordereau en brouillon
 */
export async function addDossiersToBordereau(id, dossiers) {
  const b = await bordereauModel.findById(id);
  if (!b) throw httpError(404, 'Bordereau introuvable');
  if (b.statut !== 'BROUILLON') throw httpError(409, 'Impossible d\'ajouter des dossiers : bordereau déjà émis');

  // Vérifier éligibilité
  const eligibles = await bordereauModel.dossiersEligibles(b.division_id);
  const eligibleIds = new Set(eligibles.map((d) => d.id));
  const invalides = dossiers.filter((d) => !eligibleIds.has(d.id));
  if (invalides.length) {
    throw httpError(422, `${invalides.length} dossier(s) non éligibles`);
  }

  return bordereauModel.addDossiers(id, dossiers);
}

/**
 * Retire un dossier d'un bordereau en brouillon
 */
export async function removeDossierFromBordereau(id, dossierId) {
  const b = await bordereauModel.findById(id);
  if (!b) throw httpError(404, 'Bordereau introuvable');
  if (b.statut !== 'BROUILLON') throw httpError(409, 'Impossible de retirer : bordereau déjà émis');
  return bordereauModel.removeDossier(id, dossierId);
}

/**
 * Émission du bordereau : BROUILLON → EMIS
 * Notifie le responsable de la division
 */
export async function emitBordereau(id, agentId) {
  const b = await bordereauModel.emit(id, agentId);

  // Notification au responsable de division (CHEF_DIVISION_*)
  try {
    await notificationService.notifyDivision(
      b.division_id,
      'BORDEREAU_EMIS',
      `Bordereau ${b.reference} reçu — ${b.dossiers?.length || 0} dossier(s) à traiter`,
      `/bordereaux/${b.id}`
    );
  } catch (e) {
    // Ne pas faire échouer l'émission si notification échoue
    console.warn('Notification bordereau échouée:', e.message);
  }

  return b;
}

/**
 * Accusé réception par la division : EMIS → RECU_PAR_DIVISION
 */
export async function acknowledgeBordereau(id, agentId) {
  return bordereauModel.acknowledge(id, agentId);
}

/**
 * Archive : RECU_PAR_DIVISION → ARCHIVE
 */
export async function archiveBordereau(id) {
  return bordereauModel.archive(id);
}

/**
 * Suppression (brouillon uniquement)
 */
export async function deleteBordereau(id) {
  return bordereauModel.remove(id);
}

/**
 * Dossiers éligibles pour une division
 */
export async function getDossiersEligibles(division_id) {
  return bordereauModel.dossiersEligibles(division_id);
}

/**
 * Stats pour dashboard
 */
export async function getBordereauStats() {
  return bordereauModel.getStats();
}