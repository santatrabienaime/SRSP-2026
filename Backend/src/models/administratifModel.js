import db from '../config/db.js';
import * as historiqueModel from './historiqueModel.js';

/**
 * Gestion administrative : immatriculation, insertion Augure, mode de paiement.
 *
 * Ces trois activités n'existaient que comme permissions, sans aucune
 * implémentation. Elles portent le même objet — la personne fonctionnaire — et
 * le même suivi, d'où un modèle unique plutôt que trois modules sans lien.
 */

/** Statuts partagés, pour que l'interface puisse les traduire une seule fois. */
export const STATUTS_IMM = { EN_ATTENTE: 'EN_ATTENTE', ACTIVE: 'ACTIVE', REJETEE: 'REJETEE' };
export const STATUTS_AUGURE = { A_INSERER: 'A_INSERER', INSERE: 'INSERE', REJETE: 'REJETE' };
export const STATUTS_PAIEMENT = { EN_ATTENTE: 'EN_ATTENTE', APPROUVE: 'APPROUVE', REJETE: 'REJETE' };

/* ------------------------------------------------------------------ */
/* Immatriculation                                                    */
/* ------------------------------------------------------------------ */

/**
 * Numéro d'immatriculation.
 *
 * Format : AAAA-XX-NNNNNN, où XX est le code de la division et NNNNNN un
 * compteur. Il est calculé en base et non à la saisie : un numéro saisi à la
 * main finit toujours par se dupliquer, et la contrainte d'unicité renverrait
 * alors une erreur que la Coordinatrice ne peut pas comprendre.
 */
async function genererNumeroImmatriculation(divisionId) {
  const annee = new Date().getFullYear();
  let code = 'GEN';
  if (divisionId) {
    const [div] = await db.query('SELECT code FROM divisions WHERE id = ?', [divisionId]);
    if (div?.code) code = div.code.slice(0, 6);
  }
  const [compte] = await db.query(
    `SELECT COUNT(*) AS total FROM immatriculations
     WHERE numero LIKE ?`,
    [`${annee}-${code}-%`]
  );
  const n = (compte?.total || 0) + 1;
  return `${annee}-${code}-${String(n).padStart(6, '0')}`;
}

export async function listerImmatriculations(filtres = {}) {
  const params = [];
  let where = 'WHERE 1=1';
  if (filtres.statut) { where += ' AND i.statut = ?'; params.push(filtres.statut); }
  if (filtres.division_id) { where += ' AND i.division_id = ?'; params.push(Number(filtres.division_id)); }
  if (filtres.search) {
    const motif = `%${String(filtres.search).trim()}%`;
    where += ` AND (i.numero LIKE ? OR i.nom LIKE ? OR i.prenom LIKE ?
                      OR i.cin LIKE ? OR i.corps LIKE ? OR i.grade LIKE ?)`;
    params.push(motif, motif, motif, motif, motif, motif);
  }
  return db.query(
    `SELECT i.*, dv.nom AS division_nom, dv.code AS division_code,
            au.username AS cree_par,
            a.matricule_augure, a.statut AS statut_augure
     FROM immatriculations i
     LEFT JOIN divisions dv ON dv.id = i.division_id
     LEFT JOIN users au ON au.id = i.created_by
     LEFT JOIN insertions_augure a ON a.immatriculation_id = i.id
     ${where}
     ORDER BY i.created_at DESC, i.id DESC`,
    params
  );
}

export async function immatriculationParId(id) {
  const [ligne] = await db.query(
    `SELECT i.*, dv.nom AS division_nom, dv.code AS division_code
     FROM immatriculations i
     LEFT JOIN divisions dv ON dv.id = i.division_id
     WHERE i.id = ?`,
    [id]
  );
  return ligne || null;
}

export async function immatriculationParNumero(numero) {
  const [ligne] = await db.query('SELECT * FROM immatriculations WHERE numero = ?', [numero]);
  return ligne || null;
}

/**
 * Un CIN déjà connu ?
 *
 * L'interrogation sert d'AIDE, pas de blocage : une même personne peut être
 * réimmatriculée après une erreur de saisie, et la Coordinatrice doit pouvoir
 * le voir avant de décider. C'est pourquoi elle renvoie l'information sans
 * empêcher l'écriture.
 */
export async function cinDejaImmatricule(cin) {
  const compact = String(cin || '').replace(/[\s.-]/g, '').toUpperCase();
  if (!compact) return { existe: false };
  const lignes = await db.query(
    `SELECT id, numero, nom, prenom, statut FROM immatriculations
     WHERE REPLACE(REPLACE(REPLACE(IFNULL(cin, ''), ' ', ''), '-', ''), '.', '') = ?
     LIMIT 5`,
    [compact]
  );
  return { existe: lignes.length > 0, fiches: lignes };
}

export async function creerImmatriculation(data, userId) {
  const numero = await genererNumeroImmatriculation(data.division_id);
  const result = await db.query(
    `INSERT INTO immatriculations
     (numero, nom, prenom, cin, date_naissance, corps, grade, indice,
      date_entree, division_id, statut, observations, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      numero,
      data.nom, data.prenom, data.cin || null, data.date_naissance || null,
      data.corps || null, data.grade || null,
      data.indice ?? null, data.date_entree || null,
      data.division_id || null, data.statut || STATUTS_IMM.EN_ATTENTE,
      data.observations || null, userId,
    ]
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'IMMATRICULATION',
    dossier_id: null,
    nouvelle_valeur: numero,
    details: `Immatriculation ${numero} créée pour ${data.nom} ${data.prenom}.`,
  });
  return { id: result.insertId, numero };
}

export async function majImmatriculation(id, data, userId) {
  const avant = await immatriculationParId(id);
  if (!avant) return null;
  await db.query(
    `UPDATE immatriculations
     SET nom = ?, prenom = ?, cin = ?, date_naissance = ?, corps = ?,
         grade = ?, indice = ?, date_entree = ?, division_id = ?,
         statut = ?, observations = ?
     WHERE id = ?`,
    [
      data.nom ?? avant.nom, data.prenom ?? avant.prenom, data.cin ?? avant.cin,
      data.date_naissance ?? avant.date_naissance, data.corps ?? avant.corps,
      data.grade ?? avant.grade, data.indice ?? avant.indice,
      data.date_entree ?? avant.date_entree, data.division_id ?? avant.division_id,
      data.statut ?? avant.statut, data.observations ?? avant.observations,
      id,
    ]
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'IMMATRICULATION',
    nouvelle_valeur: avant.numero,
    details: `Immatriculation ${avant.numero} modifiée.`,
  });
  return immatriculationParId(id);
}

/* ------------------------------------------------------------------ */
/* Insertion Augure                                                   */
/* ------------------------------------------------------------------ */

export async function listerAugure(filtres = {}) {
  const params = [];
  let where = 'WHERE 1=1';
  if (filtres.statut) { where += ' AND a.statut = ?'; params.push(filtres.statut); }
  if (filtres.search) {
    const motif = `%${String(filtres.search).trim()}%`;
    where += ` AND (i.numero LIKE ? OR i.nom LIKE ? OR i.prenom LIKE ? OR a.matricule_augure LIKE ?)`;
    params.push(motif, motif, motif, motif);
  }
  return db.query(
    `SELECT a.*, i.numero, i.nom, i.prenom, i.cin, i.date_naissance, i.indice, i.grade, i.corps
     FROM insertions_augure a
     JOIN immatriculations i ON i.id = a.immatriculation_id
     ${where}
     ORDER BY a.created_at DESC, a.id DESC`,
    params
  );
}

/**
 * Prépare l'insertion d'un fonctionnaire deja immatricule.
 *
 * L'unicité est posée en base sur immatriculation_id : une seule tentative
 * d'insertion par personne. Rejouer l'insertion sur une fiche deja inseree doit
 * echouer explicitement, pas creer un doublon que personne ne remarkera.
 */
export async function creerInsertionAugure(data, userId) {
  const [existante] = await db.query(
    'SELECT id, statut, matricule_augure FROM insertions_augure WHERE immatriculation_id = ?',
    [data.immatriculation_id]
  );
  if (existante) {
    const e = new Error('Ce fonctionnaire possède déjà une fiche d\'insertion Augure.');
    e.status = 409;
    throw e;
  }
  const result = await db.query(
    `INSERT INTO insertions_augure
     (immatriculation_id, matricule_augure, situation_familiale, adresse,
      telephone, date_naissance, indice_base, salaire_base, statut, observations)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.immatriculation_id, data.matricule_augure || null,
      data.situation_familiale || null, data.adresse || null,
      data.telephone || null, data.date_naissance || null,
      data.indice_base ?? null, data.salaire_base ?? null,
      data.statut || STATUTS_AUGURE.A_INSERER, data.observations || null,
    ]
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'INSERTION_AUGURE',
    nouvelle_valeur: data.matricule_augure || `#${result.insertId}`,
    details: `Insertion Augure préparée pour l'immatriculation #${data.immatriculation_id}.`,
  });
  return { id: result.insertId };
}

export async function majInsertionAugure(id, data, userId) {
  const [avant] = await db.query('SELECT * FROM insertions_augure WHERE id = ?', [id]);
  if (!avant) return null;
  await db.query(
    `UPDATE insertions_augure
     SET matricule_augure = ?, situation_familiale = ?, adresse = ?, telephone = ?,
         date_naissance = ?, indice_base = ?, salaire_base = ?, statut = ?, observations = ?
     WHERE id = ?`,
    [
      data.matricule_augure ?? avant.matricule_augure,
      data.situation_familiale ?? avant.situation_familiale,
      data.adresse ?? avant.adresse, data.telephone ?? avant.telephone,
      data.date_naissance ?? avant.date_naissance,
      data.indice_base ?? avant.indice_base, data.salaire_base ?? avant.salaire_base,
      data.statut ?? avant.statut, data.observations ?? avant.observations, id,
    ]
  );
  // Marquer l'insertion comme faite fige le trait : l'agent et l'instant y sont
  // inscrits, sinon rien ne distingue une insertion prepared d'une insertion reelle.
  if (data.statut === STATUTS_AUGURE.INSERE) {
    await db.query(
      'UPDATE insertions_augure SET insere_par = ?, insere_le = NOW() WHERE id = ?',
      [userId, id]
    );
  }
  await historiqueModel.log({
    user_id: userId,
    action: 'INSERTION_AUGURE',
    details: `Insertion Augure #${id} : statut ${data.statut ?? avant.statut}.`,
  });
  return { id, statut: data.statut ?? avant.statut };
}

/* ------------------------------------------------------------------ */
/* Mode de paiement                                                   */
/* ------------------------------------------------------------------ */

export async function listerPaiements(filtres = {}) {
  const params = [];
  let where = 'WHERE 1=1';
  if (filtres.statut) { where += ' AND p.statut = ?'; params.push(filtres.statut); }
  if (filtres.search) {
    const motif = `%${String(filtres.search).trim()}%`;
    where += ` AND (i.numero LIKE ? OR i.nom LIKE ? OR i.prenom LIKE ? OR p.compte_bancaire LIKE ?)`;
    params.push(motif, motif, motif, motif);
  }
  return db.query(
    `SELECT p.*, i.numero, i.nom, i.prenom, i.cin
     FROM modes_paiement p
     JOIN immatriculations i ON i.id = p.immatriculation_id
     ${where}
     ORDER BY p.created_at DESC, p.id DESC`,
    params
  );
}

export async function creerModePaiement(data, userId) {
  const result = await db.query(
    `INSERT INTO modes_paiement
     (immatriculation_id, mode, banque, compte_bancaire, motif, statut)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.immatriculation_id, data.mode, data.banque || null,
      data.compte_bancaire || null, data.motif,
      data.statut || STATUTS_PAIEMENT.EN_ATTENTE,
    ]
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'CHANGEMENT_PAIEMENT',
    details: `Changement de mode de paiement demandé (${data.mode}) pour l'immatriculation #${data.immatriculation_id}.`,
  });
  return { id: result.insertId };
}

/**
 * Approuve ou rejette une demande de changement de paiement.
 *
 * L'approbation décommissionne les demandes en attente précédentes de la même
 * personne. Sans cela, une personne pouvait avoir deux demandes « en attente »
 * approuvables, dont la première deviendrait muette : son virement partirait
 * vers l'ancien compte sans que personne ne s'en aperçoive.
 */
export async function traiterModePaiement(id, statut, userId, observations) {
  const [avant] = await db.query('SELECT * FROM modes_paiement WHERE id = ?', [id]);
  if (!avant) return null;
  if (avant.statut !== STATUTS_PAIEMENT.EN_ATTENTE) {
    const e = new Error(`Demande déjà traitée (statut : ${avant.statut}).`);
    e.status = 409;
    throw e;
  }

  if (statut === STATUTS_PAIEMENT.APPROUVE) {
    await db.query(
      `UPDATE modes_paiement SET statut = 'REJETE', traite_par = ?, traite_le = NOW(),
              observations = CONCAT('Remplacée par la demande #', ?)
       WHERE immatriculation_id = ? AND statut = 'EN_ATTENTE' AND id <> ?`,
      [userId, id, avant.immatriculation_id, id]
    );
  }

  await db.query(
    'UPDATE modes_paiement SET statut = ?, traite_par = ?, traite_le = NOW(), observations = ? WHERE id = ?',
    [statut, userId, observations || null, id]
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'CHANGEMENT_PAIEMENT',
    nouvelle_valeur: statut,
    details: `Demande de paiement #${id} (${avant.mode}) : ${statut}.`,
  });
  return { id, statut };
}

/** Situation d'ensemble : ce que la Coordinatrice a à faire aujourd'hui. */
export async function tableauDeBord() {
  const [compteurs] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM immatriculations) AS immatriculations,
       (SELECT COUNT(*) FROM immatriculations WHERE statut = 'EN_ATTENTE') AS imm_attente,
       (SELECT COUNT(*) FROM insertions_augure) AS augure,
       (SELECT COUNT(*) FROM insertions_augure WHERE statut = 'A_INSERER') AS augure_restant,
       (SELECT COUNT(*) FROM modes_paiement) AS paiements,
       (SELECT COUNT(*) FROM modes_paiement WHERE statut = 'EN_ATTENTE') AS paiements_attente`
  );
  return compteurs || {};
}
