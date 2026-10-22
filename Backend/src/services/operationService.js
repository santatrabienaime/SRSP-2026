/**
 * Données propres à l'opération d'un dossier — service piloté par le schéma.
 *
 * Deux gestes distincts, et c'est le fond de la chose :
 *
 *   - l'agent qui instruit le dossier **prépare** l'opération ;
 *   - le chef de division **la contrôle** : il enregistre sa décision, et
 *     c'est cette décision qui fait foi.
 *
 * Confondre les deux laisserait l'agent valider sa propre saisie. Le cahier
 * est explicite : « elle ne doit pas remplacer les décisions des agents
 * habilités ».
 *
 * **Aucun calcul n'est fait ici.** Le montant est saisi par l'agent, sa
 * source est conservée, et le contrôle atteste qu'il a été vu. Aucune
 * formule réglementaire n'est appliquée : le cahier l'interdit tant qu'elle
 * n'est pas validée.
 *
 * Les **champs** ne sont pas figés dans le code : le schéma de l'opération
 * les décrit, et le formulaire se construit dessus. Une opération qui
 * n'a pas de schéma ne montre que les champs communs.
 */
import * as operationModel from '../models/operationModel.js';
import * as dossierModel from '../models/dossierModel.js';
import * as historiqueModel from '../models/historiqueModel.js';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

/** Permissions de l'agent connecté. */
async function permissionsDe(userId) {
  const rows = await db.query(
    `SELECT p.nom
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = (SELECT role_id FROM users WHERE id = ?)`,
    [userId]
  );
  return rows.map((r) => r.nom);
}

/** Le dossier existe-t-il ? */
async function exigerDossier(dossierId) {
  const dossier = await dossierModel.findDossierById(dossierId);
  if (!dossier) throw httpError(404, 'Dossier introuvable.');
  return dossier;
}

/**
 * Répartit les valeurs entre les colonnes et le champ JSON.
 *
 * Un champ dont le nom est une colonne générique y va ; les autres vont
 * dans `donnees`. Les valeurs inconnues du schéma sont ignorées : le
 * serveur ne doit pas accepter un champ que l'écran ne montre pas.
 */
function repartir(valeurs, champsSchema) {
  const connues = new Set(champsSchema.map((c) => c.cle));
  const colonnes = {};
  const json = {};

  for (const [cle, valeur] of Object.entries(valeurs || {})) {
    if (!connues.has(cle)) continue;
    const vide = valeur === '' || valeur === undefined || valeur === null;
    if (operationModel.COLONNES_EDITABLES.includes(cle)) {
      colonnes[cle] = vide ? null : valeur;
    } else {
      json[cle] = vide ? null : valeur;
    }
  }
  return { colonnes, json };
}

/**
 * Lecture des données d'opération, avec le schéma de l'opération.
 *
 * L'écran a besoin des deux : les valeurs à afficher, et la liste des
 * champs à proposer.
 */
export async function lire(dossierId) {
  const dossier = await exigerDossier(dossierId);
  const ligne = await operationModel.findParDossier(dossierId);
  const operation = await operationModel.schemaAvecOperation(dossier.sous_type_id);

  /* Les valeurs sont rendues dans un objet plat, indexé par la clé du
     champ : l'écran n'a plus à savoir quelles valeurs sont dans une colonne
     et lesquelles sont dans le JSON. */
  const valeurs = {};
  for (const champ of operation?.champs || []) {
    const colonne = ligne?.[champ.cle];
    const json = ligne?.donnees?.[champ.cle];
    valeurs[champ.cle] = colonne !== undefined && colonne !== null
      ? colonne
      : (json ?? '');
  }

  return {
    dossier_id: Number(dossierId),
    operation: operation
      ? { id: operation.id, code: operation.code, libelle: operation.libelle }
      : null,
    schema: operation?.champs || [],
    valeurs,
    donnees: ligne,
  };
}

/**
 * Saisie des données d'opération.
 *
 * Le type d'opération est repris du dossier : il ne se saisit pas
 * indépendamment, sinon le dossier et sa donnée risqueraient de ne pas
 * d'accord.
 */
/**
 * Les droits dédiés à certaines opérations.
 *
 * Le cahier distingue, dans une même division, le droit de **préparer** et
 * le droit de **vérifier** : le vérificateur de Solde prépare les décomptes,
 * le chef de division les vérifie ; le liquidateur établit la liquidation,
 * le chef de division la gère.
 *
 * Le droit générique (`saisir_donnees_operation`, `controler_donnees_operation`)
 * reste la porte d'entrée ; le droit dédié s'y ajoute pour les opérations
 * concernées. Sans cela, `liquider_pension` et `controler_decomptes` ne
 * mèneraient nulle part : le registre de conformité dirait « inerte » sur
 * des fonctions qui sont, elles, livrées.
 *
 * `ecriture` : le droit qu'il faut pour saisir les données de l'opération.
 * `lecture`  : le droit qu'il faut pour les contrôler.
 */
const DROITS_DEDIES = {
  PENSION_LIQUIDATION: { ecriture: 'liquider_pension', lecture: 'liquider_pension' },
  SOLDE_AVANCE: { lecture: 'controler_decomptes' },
  SOLDE_TROP_PERCU: { lecture: 'controler_decomptes' },
};

/** Le droit dédié qu'exige cette opération, s'il y en a un. */
function droitDedie(operationCode, nature) {
  const droits = DROITS_DEDIES[operationCode];
  if (!droits) return null;
  return droits[nature] || null;
}

export async function saisir(dossierId, corps, userId) {
  const dossier = await exigerDossier(dossierId);
  const permissions = await permissionsDe(userId);
  if (!permissions.includes('saisir_donnees_operation')) {
    throw httpError(
      403,
      'Saisir les données d’une opération n’est pas de votre ressort.'
    );
  }

  const operation = await operationModel.schemaAvecOperation(dossier.sous_type_id);
  const champs = operation?.champs || [];

  const dedie = droitDedie(operation?.code, 'ecriture');
  if (dedie && !permissions.includes(dedie)) {
    throw httpError(
      403,
      `Cette opération relève d’un droit qui n’est pas le vôtre.`
    );
  }

  /* Deux formes acceptées : `valeurs` (la forme déclarative) et le corps
     plat (la forme historique). Le frontend a employer's la première ; la
     seconde garde la compatibilité avec ce qui existe déjà. */
  const valeurs = corps?.valeurs && typeof corps.valeurs === 'object'
    ? corps.valeurs
    : (corps || {});

  /* Les champs obligatoires de l'opération sont contrôlés ici, et non par
     l'écran : un formulaire peut être contourne, une règle de gestion ne
     doit pas l'être. */
  const manquants = champs
    .filter((c) => c.requis)
    .filter((c) => {
      const v = valeurs[c.cle];
      return v === undefined || v === null || String(v).trim() === '';
    })
    .map((c) => c.libelle);
  if (manquants.length) {
    throw httpError(422, `Renseignez : ${manquants.join(', ')}.`);
  }

  const { colonnes, json } = repartir(valeurs, champs);

  const enregistrement = await operationModel.enregistrer(dossierId, {
    ...colonnes,
    donnees: Object.keys(json).length ? json : undefined,
    sous_type_id: dossier.sous_type_id || null,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'DONNEES_OPERATION',
    dossier_id: dossierId,
    details: `Données de l’opération ${operation?.libelle || ''} enregistrées.`.trim(),
  });

  return enregistrement;
}

/**
 * Contrôle de l'opération par le chef de division.
 *
 * La décision est conservée avec son auteur et sa date : c'est elle qui
 * distingue une opération vérifiée d'une opération seulement saisie.
 */
export async function controler(dossierId, { decision, observations, date_controle }, userId) {
  const dossier = await exigerDossier(dossierId);
  const permissions = await permissionsDe(userId);
  if (!permissions.includes('controler_donnees_operation')) {
    throw httpError(
      403,
      'Contrôler les données d’une opération n’est pas de votre ressort.'
    );
  }

  /* Le droit dédié de l'opération s'ajoute au droit générique : vérifier
     un décompte n'est pas la même chose que contrôler une donnée
     d'opération, et le cahier les distingue. */
  const operation = await operationModel.schemaAvecOperation(dossier.sous_type_id);
  const dedie = droitDedie(operation?.code, 'lecture');
  if (dedie && !permissions.includes(dedie)) {
    throw httpError(
      403,
      'Contrôler cette opération relève d’un droit qui n’est pas le vôtre.'
    );
  }

  if (!String(decision || '').trim()) {
    throw httpError(422, 'La décision de contrôle est requise.');
  }

  const resultat = await operationModel.controler(dossierId, {
    controleurId: userId,
    decision,
    observations,
    /* La date du contrôle est celle que l'agent a portée sur son contrôle :
       c'est elle qui fait foi. À défaut, c'est l'heure du serveur. */
    dateControle: date_controle || new Date(),
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'CONTROLE_OPERATION',
    dossier_id: dossierId,
    nouvelle_valeur: decision,
    details: observations || null,
  });

  return resultat;
}

/**
 * Validation d'un montant ou d'un décompte.
 *
 * On ne valide que ce qui a été saisi : un montant non saisi n'a rien à
 * valider, et le dire serait un mensonge.
 */
export async function validerMontant(dossierId, { observations, date_validation }, userId) {
  const donnees = await operationModel.findParDossier(dossierId);
  if (!donnees) {
    throw httpError(422, 'Ce dossier ne comporte pas encore de données d’opération.');
  }
  if (donnees.montant === null || donnees.montant === undefined) {
    throw httpError(422, 'Aucun montant n’est saisi : il n’y a rien à valider.');
  }

  const permissions = await permissionsDe(userId);
  if (!permissions.includes('controler_donnees_operation')) {
    throw httpError(403, 'Valider un montant n’est pas de votre ressort.');
  }

  const resultat = await operationModel.valider(dossierId, {
    validePar: userId,
    dateValidation: date_validation || new Date(),
    observations,
  });

  await historiqueModel.log({
    user_id: userId,
    action: 'VALIDATION_MONTANT',
    dossier_id: dossierId,
    details: `Montant validé : ${donnees.montant}.`,
  });

  return resultat;
}

/** Agrégat par type d'opération, pour les rapports de division. */
export async function agreger(options) {
  return operationModel.agregatParOperation(options);
}
