import db from '../config/db.js';
import * as historiqueModel from './historiqueModel.js';

/**
 * Division Secours : visa du contrôle financier, état d'émargement, cachet et
 * date, références du logiciel secours, signature de l'ordonnateur.
 *
 * Ces cinq objets sont regroupés ici parce qu'ils décrivent tous la même chose
 * vue de cinq côtés : ce qu'un mandat de secours devient sur un bureau. Les
 * mettre dans cinq modèles séparés les ferait oublier les uns les autres — on
 * appose un cachet sur des pièces non imprimées, on signe un mandat qui n'a
 * pas de bénéficiaires.
 */

/* ------------------------------------------------------------------ */
/* 1.1 — Visa du contrôle financier                                    */
/* ------------------------------------------------------------------ */

/**
 * Enregistre le visa du CF sur un dossier.
 *
 * Le numéro de visa est unique dans toute la plateforme, pas seulement par
 * dossier : c'est une référence officielle, et deux dossiers portant le même
 * numéro rendraient la traçabilité impossible. La contrainte est en base ;
 * ici on ne fait que transformer l'échec en message lisible.
 */
export async function enregistrerVisa(dossierId, data, userId) {
  try {
    const resultat = await db.query(
      `INSERT INTO visas_controle_financier
       (dossier_id, numero_visa, signe_par, date_visa, commentaire, enregistre_par)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dossierId, data.numero_visa,
        // La signature du CF est un nom porté sur la pièce papier : ce n'est
        // pas un compte de la plateforme, et il n'y a donc pas d'agent à lier.
        data.signe_par || null, data.date_visa,
        data.commentaire || null, userId,
      ]
    );
    await tracer(userId, dossierId, 'VISA_CF',
      `Visa ${data.numero_visa} enregistré (signature : ${data.signe_par || 'non renseignée'}).`);
    return { id: resultat.insertId };
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      const e2 = new Error(
        `Le numéro de visa ${data.numero_visa} est déjà utilisé sur un autre dossier, ou ce dossier est déjà visé.`
      );
      e2.status = 409;
      throw e2;
    }
    throw e;
  }
}

export async function findVisa(dossierId) {
  const lignes = await db.query(
    `SELECT v.*, u.username AS auteur
     FROM visas_controle_financier v
     LEFT JOIN users u ON u.id = v.enregistre_par
     WHERE v.dossier_id = ?`,
    [dossierId]
  );
  return lignes[0] || null;
}

/**
 * Dossier réceptionnable ?
 *
 * Le contrôle de complétude du document porte sur les quatre pièces du PGA
 * (Décision, État de décompte, CCETPP, Demande) et sur le visa du CF. Le visa
 * est vérifié à part car c'est le document lui-même qui est visé, non une
 * pièce jointe.
 */
export async function etatReception(dossierId) {
  const visa = await findVisa(dossierId);
  const lignes = await db.query(
    `SELECT p.code, p.libelle, d.presente
     FROM types_pieces p
     LEFT JOIN depouillements d
       ON d.dossier_id = ? AND d.piece = p.code
     WHERE p.phase = 'DEPOUILLEMENT' AND p.division_code = 'SECOURS'
     ORDER BY p.ordre`,
    [dossierId]
  );
  const manquantes = lignes.filter((l) => !l.presente).map((l) => l.libelle);
  return {
    visa: visa || null,
    pieces_attendues: lignes.length,
    pieces_manquantes: manquantes,
    complet: Boolean(visa) && manquantes.length === 0,
  };
}

/* ------------------------------------------------------------------ */
/* 1.6 — Références du logiciel secours et état d'émargement           */
/* ------------------------------------------------------------------ */

/**
 * Références que l'agent doit reporter dans le logiciel secours.
 *
 * Le logiciel secours est EXTERNE. La plateforme n'y écrit pas et ne le
 * pilotera pas : elle calcule les valeurs et trace ce que l'agent a dit y avoir
 * reporté. Annoncer une « intégration au logiciel secours » serait promettre une
 * connexion qui n'existe pas.
 */
export async function calculerReferences(mandatementId) {
  /* `db.query` renvoie DÉJÀ le tableau des lignes (voir config/db.js) :
     `[mandat]` prendrait la première ligne entière et non l'objet, et
     `beneficiaires.map` échouerait sur un objet. D'où les deux écritures
     distinctes : `await` seul quand on veut toutes les lignes, `[0]` quand on
     veut la première. */
  const mandat = (await db.query(
    'SELECT id, montant_total FROM mandatements WHERE id = ?', [mandatementId]
  ))[0];
  if (!mandat) return null;

  const beneficiaires = await db.query(
    `SELECT b.id, b.nom, b.prenom, b.lien, b.quote_part, b.montant
     FROM mandatement_beneficiaires b WHERE b.mandatement_id = ? ORDER BY b.id`,
    [mandatementId]
  );
  const dossier = (await db.query(
    'SELECT numero FROM dossiers WHERE id = (SELECT dossier_id FROM mandatements WHERE id = ?)',
    [mandatementId]
  ))[0];

  const montantTotal = Number(mandat.montant_total);
  const pad = (n) => String(n).padStart(3, '0');

  return {
    mandatement_id: mandatementId,
    references: [
      { code: 'NUMERO_MANDAT', libelle: 'Numéro de mandat', valeur: String(mandatementId) },
      { code: 'DOSSIER', libelle: 'N° dossier', valeur: dossier?.numero || '' },
      { code: 'MONTANT_TOTAL', libelle: 'Montant à engager', valeur: montantTotal.toLocaleString('fr-FR') },
      { code: 'NB_BENEFICIAIRES', libelle: 'Nombre de bénéficiaires', valeur: String(beneficiaires.length) },
      ...beneficiaires.map((b, i) => ({
        code: `BENEFICIAIRE_${pad(i + 1)}`,
        libelle: `Bénéficiaire ${i + 1} — ${b.nom} ${b.prenom || ''}`.trim(),
        valeur: `${b.lien || 'sans lien'} : ${Number(b.montant).toLocaleString('fr-FR')}`,
      })),
    ],
  };
}

/** Trace ce que l'agent déclare avoir reporté dans le logiciel externe. */
export async function marquerReferenceReportee(mandatementId, code, userId) {
  const resultat = await db.query(
    `INSERT INTO references_logiciel_secours
     (mandatement_id, code, libelle, valeur, reporte_par, reporte_le)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       valeur = VALUES(valeur), reporte_par = VALUES(reporte_par), reporte_le = NOW()`,
    [mandatementId, code, code, '', userId]
  );
  return { mandatement_id: mandatementId, code, enregistre: resultat.affectedRows > 0 };
}

export async function listerReferencesReportees(mandatementId) {
  return db.query(
    `SELECT code, reporte_par, reporte_le FROM references_logiciel_secours
     WHERE mandatement_id = ? ORDER BY code`,
    [mandatementId]
  );
}

/**
 * Génère l'état d'émargement : une ligne par bénéficiaire, à signer.
 *
 * Un état d'émargement existe pour prouver QUI a touché l'argent. Il est donc
 * créé à partir de la liste des bénéficiaires DU MANDATEMENT, pas d'une liste
 * saisie à part : les deux pourraient diverger, et l'état d'émargement
 * mentionnerait alors un bénéficiaire qui ne touche rien.
 */
export async function genererEtatEmargement(mandatementId, userId) {
  const mandat = (await db.query(
    'SELECT dossier_id FROM mandatements WHERE id = ?', [mandatementId]
  ))[0];
  if (!mandat) {
    const e = new Error('Mandatement introuvable.');
    e.status = 404;
    throw e;
  }

  const beneficiaires = await db.query(
    'SELECT id FROM mandatement_beneficiaires WHERE mandatement_id = ? ORDER BY id',
    [mandatementId]
  );
  if (!beneficiaires.length) {
    const e = new Error(
      "Un état d'émargement ne peut pas être généré : le mandatement n'a aucun bénéficiaire."
    );
    e.status = 422;
    throw e;
  }

  await db.query(
    `INSERT INTO etats_emargement (mandatement_id, genere_par, genere_le)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE genere_par = VALUES(genere_par), genere_le = NOW()`,
    [mandatementId, userId]
  );
  const etat = (await db.query(
    'SELECT id FROM etats_emargement WHERE mandatement_id = ?', [mandatementId]
  ))[0];

  for (const b of beneficiaires) {
    await db.query(
      'INSERT IGNORE INTO emargements (etat_emargement_id, beneficiaire_id) VALUES (?, ?)',
      [etat.id, b.id]
    );
  }

  await tracer(userId, mandat.dossier_id, 'ETAT_EMARGEMENT',
    `État d'émargement généré pour ${beneficiaires.length} bénéficiaire(s).`);
  return findEtatEmargement(mandatementId);
}

export async function findEtatEmargement(mandatementId) {
  const etat = (await db.query(
    `SELECT e.*, u.username AS auteur
     FROM etats_emargement e
     LEFT JOIN users u ON u.id = e.genere_par
     WHERE e.mandatement_id = ?`,
    [mandatementId]
  ))[0];
  if (!etat) return null;

  const lignes = await db.query(
    `SELECT em.id, em.signataire, em.signe_le, em.observation,
            b.nom, b.prenom, b.lien, b.quote_part, b.montant
     FROM emargements em
     JOIN mandatement_beneficiaires b ON b.id = em.beneficiaire_id
     WHERE em.etat_emargement_id = ?
     ORDER BY b.id`,
    [etat.id]
  );
  return {
    ...etat,
    lignes,
    signs: lignes.filter((l) => l.signe_le).length,
    total: lignes.length,
  };
}

/**
 * Enregistre la signature d'un bénéficiaire sur l'état d'émargement.
 *
 * Le signataire est du texte libre : un bénéficiaire est le plus souvent un
 * membre de la famille du défunt, sans compte sur la plateforme. En revanche la
 * date est obligatoire — un émargement sans date ne prouve pas que la somme a
 * été remise le jour où l'on soutient qu'elle l'a été.
 */
export async function signerEmargement(mandatementId, beneficiaireId, data) {
  const etat = await findEtatEmargement(mandatementId);
  if (!etat) {
    const e = new Error("L'état d'émargement n'a pas été généré.");
    e.status = 409;
    throw e;
  }
  const ligne = etat.lignes.find((l) => l.id === beneficiaireId);
  if (!ligne) {
    const e = new Error("Ce bénéficiaire ne figure pas sur l'état d'émargement.");
    e.status = 404;
    throw e;
  }

  await db.query(
    'UPDATE emargements SET signataire = ?, signe_le = ?, observation = ? WHERE id = ?',
    [data.signataire, data.signe_le, data.observation || null, beneficiaireId]
  );
  return findEtatEmargement(mandatementId);
}

/* ------------------------------------------------------------------ */
/* 1.7 — Signature des pièces par l'ordonnateur                        */
/* ------------------------------------------------------------------ */

/**
 * Enregistre la signature de l'ordonnateur sur les pièces de mandatement.
 *
 * La référence est unique dans toute la plateforme : une référence de signature
 * qui sert deux fois ne prouve plus rien. Même règle que pour les ordres de
 * déplacement du Chef BAAF, appliquée de la même façon.
 */
export async function enregistrerSignatureOrdonnateur(mandatementId, data, userId) {
  const mandat = (await db.query(
    'SELECT dossier_id FROM mandatements WHERE id = ?', [mandatementId]
  ))[0];
  if (!mandat) {
    const e = new Error('Mandatement introuvable.');
    e.status = 404;
    throw e;
  }

  try {
    await db.query(
      `INSERT INTO signatures_ordonnateur
       (mandatement_id, reference_signature, signe_par, signe_le, observations)
       VALUES (?, ?, ?, NOW(), ?)`,
      [mandatementId, data.reference_signature, userId, data.observations || null]
    );
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      const e2 = new Error(
        `La référence ${data.reference_signature} est déjà utilisée, ou ce mandat est déjà signé.`
      );
      e2.status = 409;
      throw e2;
    }
    throw e;
  }

  await tracer(userId, mandat.dossier_id, 'SIGNATURE_MANDATEMENT',
    `Pièces de mandatement signées sous la référence ${data.reference_signature}.`);
  return findSignature(mandatementId);
}

export async function findSignature(mandatementId) {
  const lignes = await db.query(
    `SELECT s.*, u.username AS signataire
     FROM signatures_ordonnateur s
     LEFT JOIN users u ON u.id = s.signe_par
     WHERE s.mandatement_id = ?`,
    [mandatementId]
  );
  return lignes[0] || null;
}

/** Archive la copie signée (1.7, étape 5). */
export async function archiverCopieSignee(mandatementId) {
  const signature = await findSignature(mandatementId);
  if (!signature) {
    const e = new Error("Le mandatement n'est pas encore signé : il n'y a rien à archiver.");
    e.status = 409;
    throw e;
  }
  if (signature.archive_le) return signature;
  await db.query('UPDATE signatures_ordonnateur SET archive_le = NOW() WHERE id = ?', [signature.id]);
  return findSignature(mandatementId);
}

/* ------------------------------------------------------------------ */
/* 2.4 — Cachet, titre et date de l'ordonnateur                        */
/* ------------------------------------------------------------------ */

/**
 * Appose le cachet sur les pièces de mandatement.
 *
 * Le titre et le nom de l'ordonnateur sont obligatoires : une pièce portant un
 * simple cachet rond sans nom n'indique pas qui a ordonné la dépense, et c'est
 * précisément l'identification que le document demande d'inscrire.
 */
export async function apposerCachet(mandatementId, data, userId) {
  const mandat = (await db.query(
    'SELECT dossier_id FROM mandatements WHERE id = ?', [mandatementId]
  ))[0];
  if (!mandat) {
    const e = new Error('Mandatement introuvable.');
    e.status = 404;
    throw e;
  }

  await db.query(
    `INSERT INTO cachets_mandatement
     (mandatement_id, cache_par, date_cachet, titre_ordonnateur, nom_ordonnateur, observations)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       cache_par = VALUES(cache_par), date_cachet = VALUES(date_cachet),
       titre_ordonnateur = VALUES(titre_ordonnateur),
       nom_ordonnateur = VALUES(nom_ordonnateur), observations = VALUES(observations)`,
    [mandatementId, userId, data.date_cachet, data.titre_ordonnateur,
      data.nom_ordonnateur, data.observations || null]
  );

  await tracer(userId, mandat.dossier_id, 'CACHET_MANDATEMENT',
    `Cachet apposé le ${data.date_cachet} — ${data.titre_ordonnateur} ${data.nom_ordonnateur}.`);
  return findCachet(mandatementId);
}

export async function findCachet(mandatementId) {
  const lignes = await db.query(
    `SELECT c.*, u.username AS auteur
     FROM cachets_mandatement c
     LEFT JOIN users u ON u.id = c.cache_par
     WHERE c.mandatement_id = ?`,
    [mandatementId]
  );
  return lignes[0] || null;
}

/* ------------------------------------------------------------------ */
/* Vue d'ensemble du mandatement                                        */
/* ------------------------------------------------------------------ */

/**
 * État complet d'un mandatement, pour un écran unique.
 *
 * Les cinq étapes sont réunies ici parce que c'est ainsi qu'un agent les vit :
 * il ne se demande pas « le cachet est-il posé ? », il regarde où en est le
 * mandat. Les cinq requêtes existent par ailleurs.
 */
export async function etatMandatement(mandatementId) {
  const mandat = (await db.query(
    'SELECT * FROM mandatements WHERE id = ?', [mandatementId]
  ))[0];
  if (!mandat) return null;

  return {
    mandatement: mandat,
    visa: await findVisa(mandat.dossier_id),
    emargement: await findEtatEmargement(mandatementId),
    signature: await findSignature(mandatementId),
    cachet: await findCachet(mandatementId),
    references: await listerReferencesReportees(mandatementId),
  };
}

/** Trace dans l'historique du dossier, sans échouer si l'écriture échoue. */
async function tracer(userId, dossierId, action, details) {
  try {
    await historiqueModel.log({ user_id: userId, action, dossier_id, details });
  } catch {
    /* L'historique ne doit jamais faire perdre une opération faite. */
  }
}
