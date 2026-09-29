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
 *
 * Règles métier : au moins un bénéficiaire, quotes-parts totalisant 100 %.
 *
 * Les MONTANTS sont calculés, pas saisis. L'interface de mandatement du
 * document montre un total et des pourcentages, et dit que « le système calcule
 * automatiquement le montant à engager » : demander à l'agent de répartir
 * 5 000 000 Ar entre trois bénéficiaires à la main lui fait faire une division
 * dont il ne peut vérifier le résultat, et l inviting à saisir un total qui ne
 * correspond plus à la somme — ce que le serveur rejetait jusqu'ici.
 *
 * Le montant de chaque bénéficiaire est donc déduit de sa quote-part, arrondi à
 * l'ariary. L'arrondi est distributions, pas prélevé : les parts sont arrondies
 * à la baisse, et le reliquat est ajouté à la plus grande part. Sans cela, cinq
 * bénéficiaires à 33,33 % donneraient 4 999 985 Ar au lieu de 5 000 000, et le
 * mandat ne correspondrait pas au montant annoncé.
 */
/**
 * Répartit un montant entre les bénéficiaires selon leurs quotes-parts.
 *
 * Les parts sont arrondies à l'ariary, ce qui perd au plus quelques unités. Le
 * reliquat revient à la plus grande part : arrondir en répartissant au hasard
 * ferait que deux saisies identiques du même dossier donnent des mandats
 * différents, et un mandat ne peut pas varier d'un enregistrement à l'autre.
 *
 * L'ordre est conservé : le bénéficiaire listé en premier reste le premier.
 */
function repartirMontants(beneficiaires, montantTotal) {
  const quotes = beneficiaires.map((b) => Number(b.quote_part));
  const parts = quotes.map((q) => Math.floor((montantTotal * q) / 100));
  const distribue = parts.reduce((s, p) => s + p, 0);

  /* Le reliquat va à la plus grande quote-part. À quote-parts égales, au premier
     bénéficiaire : la règle doit être déterministe. */
  let cible = 0;
  for (let i = 1; i < quotes.length; i++) {
    if (quotes[i] > quotes[cible]) cible = i;
  }
  parts[cible] += montantTotal - distribue;

  return beneficiaires.map((b, i) => ({
    ...b,
    quote_part: quotes[i],
    montant: parts[i],
  }));
}

export async function enregistrerMandatement(dossierId, data, userId) {
  const montant_total = montant(data.montant_total, 'Le montant total');
  const saisie = Array.isArray(data.beneficiaires) ? data.beneficiaires : [];

  if (!saisie.length) {
    throw httpError(400, 'Le mandatement doit comporter au moins un bénéficiaire.');
  }

  let sommeQuotes = 0;
  for (const b of saisie) {
    if (!b.nom?.trim()) {
      throw httpError(400, 'Chaque bénéficiaire doit avoir un nom.');
    }
    const quote = Number(b.quote_part);
    if (!Number.isFinite(quote) || quote < 0 || quote > 100) {
      throw httpError(400, `Quote-part invalide pour ${b.nom} (attendu entre 0 et 100).`);
    }
    sommeQuotes += quote;
  }

  // Tolérance à l'arrondi : les quotes-parts sont des pourcentages.
  if (Math.abs(sommeQuotes - 100) > 0.01) {
    throw httpError(
      400,
      `Les quotes-parts doivent totaliser 100 % (total obtenu : ${sommeQuotes} %).`
    );
  }

  const beneficiaires = repartirMontants(saisie, montant_total);
  const sommeMontants = beneficiaires.reduce((s, b) => s + b.montant, 0);

  /* Garde-fou : la répartition doit tomber juste. Si elle ne tombe pas juste,
     c'est que la logique de distribution est fausse — on préfère le dire que
     laisser un mandat dont les parts ne reconstruisent pas le total. */
  if (sommeMontants !== montant_total) {
    throw httpError(
      500,
      `Répartition incohérente : les parts totalisent ${sommeMontants} Ar au lieu de ${montant_total} Ar.`
    );
  }

  const enregistre = await model.saveMandatement({
    dossier_id: dossierId,
    montant_total,
    observation: data.observation,
    beneficiaires,
  });

  /* Le mandatement prepare attend d'etre ordonnance. L'etat A_ORDONNANCER
     existe en base depuis le debut mais n etait atteint par rien : le mandat
     restait BROUILLON jusqu'a l'ordonnancement, sans etape intermediaire ou le
     chef puisse voir ce qui l'attend. On le pose ici, et on ne le pose que si
     le mandatement n'a pas deja ete ordonnance : reordonner un mandat deja
     signe le ferait revenir en arriere. On RELIT ensuite, plutot que de
     renvoyer l'objet capture avant le changement : c'etait ce qui faisait
     paraitre l'etat inchange alors qu'il venait d'etre pose. */
  if (enregistre?.etat === 'BROUILLON') {
    await model.changerEtatMandatement(dossierId, 'A_ORDONNANCER', null);
  }

  await historiqueModel.log({
    user_id: userId,
    action: 'MANDATEMENT',
    dossier_id: dossierId,
    nouvelle_valeur: `${montant_total} Ar / ${beneficiaires.length} bénéficiaire(s)`,
    details: data.observation || null,
  });

  return model.findMandatement(dossierId);
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
