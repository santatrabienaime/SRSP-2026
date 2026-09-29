import db from '../config/db.js';
import * as historiqueModel from './historiqueModel.js';

/**
 * Ordres de route, ordres de mission, autorisations de retrait de bon de caisse
 * et notes d'interim (piece 3.9 du Chef BAAF).
 *
 * Ces quatre pieces partagent un seul et meme circuit : le BAAF les etablit, le
 * Chef de Service les signe, l'agent part, et l'ordre se clot au retour. Les
 * traiter dans une table unique evite d'avoir quatre circuits quasi identiques
 * qui divergent des qu'une regle change.
 */

/** Types de pieces, lus depuis le referentiel pour ne pas les dupliquer ici. */
export async function listerTypes() {
  return db.query(
    'SELECT id, code, libelle, description FROM types_pieces_deplacement ORDER BY id'
  );
}

/**
 * Numero d'ordre : ORD-2026-000001.
 *
 * Un compteur par annee et par type, pris sur le nombre de lignes existantes.
 * Deux agents qui creent au meme instant obtiendraient le meme numero ; la
 * contrainte d'unicite renvoie alors une erreur explicite plutot que de laisser
 * deux pieces sans numero, ce qui est le comportement voulu : mieux vaut un
 * echec visible qu'une piece non tracable.
 */
async function genererNumero(code) {
  const annee = new Date().getFullYear();
  const prefixe = `ORD-${annee}-${code.slice(0, 3)}`;
  const [compte] = await db.query(
    'SELECT COUNT(*) AS total FROM ordres_deplacement WHERE numero LIKE ?',
    [`${prefixe}-%`]
  );
  return `${prefixe}-${String((compte?.total || 0) + 1).padStart(6, '0')}`;
}

/**
 * Cree un ordre.
 *
 * La colonne CIN de la piece est left vide, volontairement. La table `agents`
 * ne porte aucun CIN : les identifiants des agents du SRSP sont aujourd'hui
 * dans leur dossier, pas dans leur fiche. Ecrire un CIN ici obligerait soit a
 * le saisir a la main sur chaque piece — et donc a risquer d ecrire un numero
 * faux sur une piece officielle — soit a en inventer un. Les deux sont
 * evites : tant que la fiche agent ne portera pas de CIN fiable, la piece
 * officielle s identifie par son numero et le nom de l agent.
 *
 * La colonne reste en base pour le jour ou la fiche sera completee.
 */
export async function creer(data, userId) {
  const agent = await db.query('SELECT id FROM agents WHERE id = ?', [data.agent_id]);
  if (!agent.length) {
    const e = new Error('Agent introuvable.');
    e.status = 404;
    throw e;
  }

  const [type] = await db.query(
    'SELECT code FROM types_pieces_deplacement WHERE id = ?', [data.type_id]
  );
  if (!type) {
    const e = new Error('Type de piece inconnu.');
    e.status = 400;
    throw e;
  }

  const numero = await genererNumero(type.code);
  const resultat = await db.query(
    `INSERT INTO ordres_deplacement
     (numero, type_id, dossier_id, agent_id, cin_agent, lieu_depart, lieu_destination,
      date_depart, date_retour, objet, observations, montant_avance, cree_par)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      numero, data.type_id, data.dossier_id, data.agent_id, null,
      data.lieu_depart, data.lieu_destination, data.date_depart, data.date_retour,
      data.objet, data.observations || null, data.montant_avance ?? null, userId,
    ]
  );

  await historiqueModel.log({
    user_id: userId,
    action: 'ORDRE_DEPLACEMENT',
    dossier_id: data.dossier_id,
    nouvelle_valeur: numero,
    details: `${type.code} ${numero} etabli pour l'agent #${data.agent_id} sur ${data.lieu_destination}.`,
  });

  return { id: resultat.insertId, numero };
}

/** Liste filtree. Le périmètre est appliqué par l'appelant. */
export async function lister(filtres = {}) {
  const where = [];
  const params = [];

  if (filtres.dossier_id) { where.push('o.dossier_id = ?'); params.push(filtres.dossier_id); }
  if (filtres.agent_id) { where.push('o.agent_id = ?'); params.push(filtres.agent_id); }
  if (filtres.type_id) { where.push('o.type_id = ?'); params.push(filtres.type_id); }
  if (filtres.statut) { where.push('o.statut = ?'); params.push(filtres.statut); }

  /* Un ordre « en attente de signature » est precisement celui qui presse : sa
     date de depart est proche et il bloque le depart tant que le Chef de
     Service ne l'a pas signe. */
  if (filtres.a_signer) {
    where.push("o.statut = 'REDIGE' AND o.date_depart <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)");
  }

  const sql = `SELECT o.*, t.code AS type_code, t.libelle AS type_libelle,
                      d.numero AS dossier_numero,
                      CONCAT(a.nom, ' ', a.prenom) AS agent_nom,
                      au.username AS auteur_nom
               FROM ordres_deplacement o
               JOIN types_pieces_deplacement t ON t.id = o.type_id
               JOIN dossiers d ON d.id = o.dossier_id
               JOIN agents a ON a.id = o.agent_id
               LEFT JOIN users au ON au.id = o.cree_par
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY o.date_depart DESC, o.id DESC`;
  return db.query(sql, params);
}

export async function findById(id) {
  const [ordre] = await db.query(
    `SELECT o.*, t.code AS type_code, t.libelle AS type_libelle,
            d.numero AS dossier_numero,
            CONCAT(a.nom, ' ', a.prenom) AS agent_nom,
            au.username AS auteur_nom,
            CONCAT(COALESCE(sa.nom, su.username), ' ', COALESCE(sa.prenom, '')) AS signataire_nom
     FROM ordres_deplacement o
     JOIN types_pieces_deplacement t ON t.id = o.type_id
     JOIN dossiers d ON d.id = o.dossier_id
     JOIN agents a ON a.id = o.agent_id
     LEFT JOIN users au ON au.id = o.cree_par
     LEFT JOIN users su ON su.id = o.signe_par
     LEFT JOIN agents sa ON sa.user_id = su.id
     WHERE o.id = ?`,
    [id]
  );
  return ordre || null;
}

/**
 * Transitions autorisees.
 *
 * Le circuit est declare ici et nulle part ailleurs. Une regle ecrite dans le
 * controleur, dans le service et dans l'interface finit toujours par diverger :
 * l'interface proposerait alors un bouton que le serveur refuse.
 */
const TRANSITIONS = {
  REDIGE: ['SOUMIS', 'REJETEE'],
  SOUMIS: ['SIGNE', 'REJETEE'],
  SIGNE: ['EXECUTEE', 'CLOTUREE'],
  EXECUTEE: ['CLOTUREE'],
  CLOTUREE: [],
  REJETEE: [],
};

export async function transitionner(id, vers, userId, complement = {}) {
  const avant = await findById(id);
  if (!avant) {
    const e = new Error('Ordre introuvable.');
    e.status = 404;
    throw e;
  }

  if (!TRANSITIONS[avant.statut]?.includes(vers)) {
    const e = new Error(
      `Un ordre au statut ${avant.statut} ne peut pas passer à ${vers}.`
    );
    e.status = 409;
    throw e;
  }

  /* La signature exige une reference. Sans elle, la piece est signee mais
     invérifiable : l'agent ne peut pas prouver plus tard que c'est bien celle
     qui a ete delivree. Le document (1.2) l'exige explicitement. */
  if (vers === 'SIGNE' && !complement.reference_signature) {
    const e = new Error(
      'La référence de signature est obligatoire : une pièce signée sans référence est invérifiable.'
    );
    e.status = 422;
    throw e;
  }

  /* Une reference de signature ne peut pas servir deux fois. */
  if (vers === 'SIGNE') {
    const [doublon] = await db.query(
      'SELECT id, numero FROM ordres_deplacement WHERE reference_signature = ? AND id <> ?',
      [complement.reference_signature, id]
    );
    if (doublon) {
      const e = new Error(
        `La référence ${complement.reference_signature} est déjà utilisée par l'ordre ${doublon.numero}.`
      );
      e.status = 409;
      throw e;
    }
  }

  /* Executer suppose d etre parti : une date de retour dans l futur signifie
     que la mission n a pas eu lieu, et declarer une depense engagee pour un
     voyage qui n a pas eu lieu fausserait les comptes du service. */
  if (vers === 'EXECUTEE' && avant.date_retour > new Date().toISOString().slice(0, 10)) {
    const e = new Error(
      `La date de retour (${avant.date_retour}) est dans le futur : la mission n'a pas encore eu lieu.`
    );
    e.status = 422;
    throw e;
  }

  const champs = { statut: vers };
  if (vers === 'SIGNE') {
    champs.reference_signature = complement.reference_signature;
    champs.signe_par = userId;
    champs.signe_le = new Date();
  }
  if (vers === 'EXECUTEE') {
    champs.executee_le = new Date();
    if (complement.montant_reel !== undefined && complement.montant_reel !== null) {
      champs.montant_reel = complement.montant_reel;
    }
  }
  if (vers === 'CLOTUREE') {
    champs.motif_cloture = complement.motif_cloture || null;
  }

  const set = Object.keys(champs).map((c) => `${c} = ?`).join(', ');
  await db.query(`UPDATE ordres_deplacement SET ${set} WHERE id = ?`, [
    ...Object.values(champs), id,
  ]);

  await historiqueModel.log({
    user_id: userId,
    action: 'ORDRE_DEPLACEMENT',
    dossier_id: avant.dossier_id,
    ancienne_valeur: avant.statut,
    nouvelle_valeur: vers,
    details: complement.observations
      ? `Ordre ${avant.numero} : ${avant.statut} -> ${vers}. ${complement.observations}`
      : `Ordre ${avant.numero} : ${avant.statut} -> ${vers}.`,
  });

  return { id, statut: vers };
}

/**
 * Annulation d'un ordre non encore signe.
 *
 * Une erreur de saisie sur une pièce officielle doit rester rattrapable : sans
 * cela, un ordre établi pour le mauvais dossier serait définitivement fausse,
 * et il ne resterait qu'à le laisser signer. D'où l'annulation, possible jusqu'à
 * la signature. Après signature, l'ordre n'est plus modifiable : il se clôture
 * ou se rejette, ce qui laisse une trace.
 */
export async function annuler(id, userId, motif) {
  const ordre = await findById(id);
  if (!ordre) {
    const e = new Error('Ordre introuvable.');
    e.status = 404;
    throw e;
  }

  if (['SIGNE', 'EXECUTEE', 'CLOTUREE'].includes(ordre.statut)) {
    const e = new Error(
      `Un ordre ${ordre.statut} ne peut plus être annulé : il faut le clôturer au retour, ou demander son rejet au signataire.`
    );
    e.status = 409;
    throw e;
  }

  /* Une annulation sans motif ferait disparaître une pièce sans explication :
     le décompte des ordres établis ne correspondrait plus à rien. */
  if (!motif) {
    const e = new Error("L'annulation d'un ordre exige un motif.");
    e.status = 422;
    throw e;
  }

  await db.query(
    "UPDATE ordres_deplacement SET statut = 'REJETEE', motif_cloture = ? WHERE id = ?",
    [motif, id]
  );
  await historiqueModel.log({
    user_id: userId,
    action: 'ORDRE_DEPLACEMENT',
    dossier_id: ordre.dossier_id,
    ancienne_valeur: ordre.statut,
    nouvelle_valeur: 'REJETEE',
    details: `Ordre ${ordre.numero} annulé : ${motif}`,
  });
  return { id, statut: 'REJETEE' };
}

/**
 * Comptes pour le tableau de bord du BAAF.
 *
 * Les retards sont calcules sur la date de depart et le statut : un ordre signe
 * dont la date de depart est passe sans avoir ete execute est le vrai retard,
 * et il n apparait dans aucun autre ecran.
 */
export async function tableauDeBord() {
  const lignes = await db.query(
    'SELECT statut, COUNT(*) AS n FROM ordres_deplacement GROUP BY statut'
  );
  const parStatut = Object.fromEntries(lignes.map((l) => [l.statut, l.n]));

  const [aSigner] = await db.query(
    `SELECT COUNT(*) AS n FROM ordres_deplacement
     WHERE statut = 'REDIGE' AND date_depart <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
  );
  const [retards] = await db.query(
    `SELECT COUNT(*) AS n FROM ordres_deplacement
     WHERE statut = 'SIGNE' AND date_depart < CURDATE()`
  );

  return {
    par_statut: parStatut,
    total: lignes.reduce((s, l) => s + l.n, 0),
    a_signer: aSigner?.n || 0,
    en_retard: retards?.n || 0,
  };
}
