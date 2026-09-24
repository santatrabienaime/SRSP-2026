import * as model from '../models/mandatementModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

async function agentIdOf(userId) {
  const rows = await db.query('SELECT id FROM agents WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0]?.id || null;
}

/** Entier positif obligatoire (Ariary). */
function montant(v, champ, { allowZero = false } = {}) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw httpError(400, `${champ} doit être un entier positif en Ariary.`);
  }
  if (!allowZero && n === 0) throw httpError(400, `${champ} doit être supérieur à zéro.`);
  return n;
}

/* ------------------------------------------------------------------ */
/* Mandatement                                                        */
/* ------------------------------------------------------------------ */

export async function getMandatement(dossierId) {
  await model.chargerPiecesReference();
  return model.findMandatement(dossierId);
}

/**
 * Enregistre le mandatement.
 * Règles métier : au moins un bénéficiaire, quotes-parts totalisant 100 %,
 * et somme des montants = montant total.
 */
export async function enregistrerMandatement(dossierId, data, userId) {
  const montant_total = montant(data.montant_total, 'Le montant total');
  const beneficiaires = Array.isArray(data.beneficiaires) ? data.beneficiaires : [];

  if (!beneficiaires.length) {
    throw httpError(400, 'Le mandatement doit comporter au moins un bénéficiaire.');
  }

  let sommeQuotes = 0;
  let sommeMontants = 0;
  for (const b of beneficiaires) {
    if (!b.nom?.trim()) {
      throw httpError(400, 'Chaque bénéficiaire doit avoir un nom.');
    }
    const quote = Number(b.quote_part);
    if (!Number.isFinite(quote) || quote < 0 || quote > 100) {
      throw httpError(400, `Quote-part invalide pour ${b.nom} (attendu entre 0 et 100).`);
    }
    const m = Number(b.montant);
    if (!Number.isInteger(m) || m < 0) {
      throw httpError(400, `Montant invalide pour ${b.nom}.`);
    }
    sommeQuotes += quote;
    sommeMontants += m;
  }

  // Tolérance à l'arrondi : les quotes-parts sont des pourcentages.
  if (Math.abs(sommeQuotes - 100) > 0.01) {
    throw httpError(
      400,
      `Les quotes-parts doivent totaliser 100 % (total obtenu : ${sommeQuotes} %).`
    );
  }
  if (sommeMontants !== montant_total) {
    throw httpError(
      400,
      `La somme des montants des bénéficiaires (${sommeMontants} Ar) doit être égale au montant total (${montant_total} Ar).`
    );
  }

  const resultat = await model.saveMandatement({
    dossier_id: dossierId,
    montant_total,
    observation: data.observation,
    beneficiaires,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'MANDATEMENT',
    dossier_id: dossierId,
    nouvelle_valeur: `${montant_total} Ar / ${beneficiaires.length} bénéficiaire(s)`,
    details: data.observation || null,
  });

  return resultat;
}

export async function marquerPiece(dossierId, pieceCode, userId) {
  const m = await model.findMandatement(dossierId);
  if (!m) throw httpError(404, 'Aucun mandatement pour ce dossier.');
  const connue = m.pieces.some((p) => p.code === pieceCode);
  if (!connue) throw httpError(400, `Pièce inconnue : ${pieceCode}`);

  const res = await model.marquerPieceImprimee(dossierId, pieceCode, true);
  await historiqueModel.log({
    user_id: userId,
    action: 'MANDATEMENT_PIECE',
    dossier_id: dossierId,
    nouvelle_valeur: pieceCode,
    details: 'Pièce générée.',
  });
  return res;
}

export async function ordonnancer(dossierId, userId) {
  const m = await model.findMandatement(dossierId);
  if (!m) throw httpError(404, 'Aucun mandatement à ordonnancer.');
  if (m.etat === 'LIQUIDE') {
    throw httpError(409, 'Ce mandatement est déjà liquidé.');
  }
  if (!m.beneficiaires.length) {
    throw httpError(409, 'Impossible d\'ordonner un mandatement sans bénéficiaire.');
  }
  const res = await model.changerEtatMandatement(dossierId, 'ORDONNANCE', await agentIdOf(userId));
  await historiqueModel.log({
    user_id: userId, action: 'ORDONNANCEMENT', dossier_id: dossierId,
  });
  return res;
}

export async function liquider(dossierId, userId) {
  const m = await model.findMandatement(dossierId);
  if (!m) throw httpError(404, 'Aucun mandatement à liquider.');
  if (m.etat !== 'ORDONNANCE') {
    throw httpError(409, "Le mandatement doit être ordonnancé avant d'être liquidé.");
  }
  const res = await model.changerEtatMandatement(dossierId, 'LIQUIDE', null);
  await historiqueModel.log({
    user_id: userId, action: 'LIQUIDATION_MANDATEMENT', dossier_id: dossierId,
  });
  return res;
}

/* ------------------------------------------------------------------ */
/* Correspondances                                                    */
/* ------------------------------------------------------------------ */

export async function getCorrespondances(dossierId = null) {
  return model.findCorrespondances(dossierId);
}

export async function creerCorrespondance(data, userId) {
  if (!Object.keys(model.TYPES_CORRESPONDANCE).includes(data.type)) {
    throw httpError(400, 'Type de correspondance invalide.');
  }
  if (!data.destinataire?.trim()) {
    throw httpError(400, 'Le destinataire est obligatoire.');
  }
  if (!data.objet?.trim()) {
    throw httpError(400, 'L\'objet est obligatoire.');
  }
  const etat = data.etat === 'ENVOYEE' ? 'ENVOYEE' : 'BROUILLON';

  const res = await model.saveCorrespondance({ ...data, etat }, userId);
  await historiqueModel.log({
    user_id: userId,
    action: 'CORRESPONDANCE',
    dossier_id: data.dossier_id || null,
    nouvelle_valeur: model.TYPES_CORRESPONDANCE[data.type],
    details: etat === 'ENVOYEE'
      ? `Envoyée à ${data.destinataire} : ${data.objet}`
      : `Brouillon : ${data.objet}`,
  });
  return res;
}
