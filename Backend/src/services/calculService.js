import * as model from '../models/calculModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

/** Résout l'agent (agents.id) lié à l'utilisateur qui agit. */
async function agentIdOf(userId) {
  const rows = await db.query('SELECT id FROM agents WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0]?.id || null;
}

/** Entier non négatif ou erreur explicite (les calculs ne doivent jamais
 *  recevoir de valeur négative, inexistante ou textuelle). */
function montant(v, champ, { allowZero = true } = {}) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw httpError(400, `${champ} doit être un entier positif en Ariary.`);
  }
  if (!allowZero && n === 0) {
    throw httpError(400, `${champ} doit être supérieur à zéro.`);
  }
  return n;
}

/* ------------------------------------------------------------------ */
/* Liquidation de pension                                             */
/* ------------------------------------------------------------------ */

export async function getLiquidation(dossierId) {
  return model.findLiquidation(dossierId);
}

export async function calculerLiquidation(dossierId, data, userId) {
  const pension_brute = montant(data.pension_brute, 'La pension brute');
  const retenues = montant(data.retenues, 'Les retenues');
  const annees_service = Number(data.annees_service || 0);

  if (!Number.isInteger(annees_service) || annees_service < 0 || annees_service > 60) {
    throw httpError(400, "Le nombre d'années de service doit être compris entre 0 et 60.");
  }
  if (retenues > pension_brute) {
    throw httpError(400, 'Les retenues ne peuvent pas dépasser la pension brute.');
  }

  const resultat = await model.saveLiquidation({
    dossier_id: dossierId,
    agent_id: await agentIdOf(userId),
    annees_service,
    indice_final: data.indice_final ? Number(data.indice_final) : null,
    pension_brute,
    retenues,
    observation: data.observation,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'LIQUIDATION_PENSION',
    dossier_id: dossierId,
    nouvelle_valeur: `Net ${resultat.pension_nette} Ar`,
    details: `Brute ${pension_brute} - retenues ${retenues} sur ${annees_service} an(s).`,
  });

  return resultat;
}

/* ------------------------------------------------------------------ */
/* Décompte d'avance                                                  */
/* ------------------------------------------------------------------ */

export async function getDecompte(dossierId) {
  return model.findDecompte(dossierId);
}

export async function calculerAvance(dossierId, data, userId) {
  const salaire_mensuel = montant(data.salaire_mensuel, 'Le salaire mensuel', { allowZero: false });
  const avance_demandee = montant(data.avance_demandee, "L'avance demandée", { allowZero: false });
  const retenue_mensuelle = montant(data.retenue_mensuelle, 'La retenue mensuelle');
  const duree_mois = Number(data.duree_mois || 0);
  const mois_rembourses = Number(data.mois_rembourses || 0);

  if (!Number.isInteger(duree_mois) || duree_mois < 1 || duree_mois > 60) {
    throw httpError(400, 'La durée doit être comprise entre 1 et 60 mois.');
  }
  if (!Number.isInteger(mois_rembourses) || mois_rembourses < 0 || mois_rembourses > duree_mois) {
    throw httpError(400, 'Le nombre de mois remboursés doit être compris entre 0 et la durée.');
  }
  if (retenue_mensuelle > salaire_mensuel) {
    throw httpError(400, 'La retenue mensuelle ne peut pas dépasser le salaire mensuel.');
  }
  if (avance_demandee > salaire_mensuel * duree_mois) {
    throw httpError(
      400,
      "L'avance demandée dépasse le total des retenues prévues sur la durée."
    );
  }

  const resultat = await model.saveDecompte({
    dossier_id: dossierId,
    agent_id: await agentIdOf(userId),
    salaire_mensuel,
    indice: data.indice ? Number(data.indice) : null,
    echelon: data.echelon ? Number(data.echelon) : null,
    avance_demandee,
    retenue_mensuelle,
    duree_mois,
    mois_rembourses,
    observation: data.observation,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'DECOMPTE_AVANCE',
    dossier_id: dossierId,
    nouvelle_valeur: `Net ${resultat.net_a_payer} Ar`,
    details: `Avance ${avance_demandee} Ar, retenue ${retenue_mensuelle} Ar × ${duree_mois} mois.`,
  });

  return resultat;
}

/* ------------------------------------------------------------------ */
/* Contrôle de décompte                                               */
/* ------------------------------------------------------------------ */

export async function getControles(dossierId) {
  return model.findControle(dossierId);
}

export async function controlerDecompte(dossierId, data, userId) {
  const decision = data.decision;
  if (!['APPROUVE', 'RETOURNE'].includes(decision)) {
    throw httpError(400, 'La décision doit être APPROUVE ou RETOURNE.');
  }

  const checklist = {
    calculs_verifies: !!data.calculs_verifies,
    pieces_justificatives: !!data.pieces_justificatives,
    certificat_cessation: !!data.certificat_cessation,
  };

  // Un contrôle « retour » doit être motivé : sinon l'agent ne peut pas
  // comprendre ce qu'il doit corriger.
  if (decision === 'RETOURNE' && !data.observation?.trim()) {
    throw httpError(400, 'Une observation est obligatoire pour retourner un dossier.');
  }

  const resultat = await model.saveControle({
    dossier_id: dossierId,
    controleur_id: await agentIdOf(userId),
    decision,
    ...checklist,
    observation: data.observation,
  });

  await historiqueModel.log({
    user_id: userId,
    action: decision === 'APPROUVE' ? 'CONTROL_APPROUVE' : 'CONTROL_RETURNE',
    dossier_id: dossierId,
    nouvelle_valeur: decision,
    details: data.observation || null,
  });

  return resultat;
}
