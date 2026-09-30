import db from '../config/db.js';

/**
 * La chronologie des actes.
 *
 * Le numéro d'un acte est attribué par un COMPTEUR EN BASE, comme celui des
 * dossiers, et pour la même raison : `COUNT(*) + 1` n'est pas atomique. Sur les
 * courriers, la numérotation est restée longtemps ainsi — le test
 * `numero-dossier-concurrence` l'a démontré pour les dossiers, et le défaut
 * est le même ici.
 *
 * Le compteur est donc incrémenté par `LAST_INSERT_ID(valeur + 1)`, qui renvoie
 * la valeur neuve et verrouille la ligne pour la durée de l'instruction.
 */
async function attribuerNumero(prefixe, annee, runner = db) {
  const cle = `ACTE-${prefixe}-${annee}`;

  // La ligne est créée si elle n'existe pas. LAST_INSERT_ID 0 évite qu'un
  // INSERT ... ON DUPLICATE sans valeur initiale n'écrase un compteur déjà
  // avancé par un appel concurrent.
  await runner.query(
    'INSERT INTO compteurs_numerotation (cle, valeur) VALUES (?, 0) ON DUPLICATE KEY UPDATE cle = cle',
    [cle]
  );

  await runner.query(
    'UPDATE compteurs_numerotation SET valeur = LAST_INSERT_ID(valeur + 1) WHERE cle = ?',
    [cle]
  );

  const lignes = await runner.query('SELECT LAST_INSERT_ID() AS n');
  const n = Number(lignes[0]?.n || 1);

  return { cle, numero: `${prefixe}-${annee}-${String(n).padStart(6, '0')}` };
}

export async function getTypesActes({ inactifs = false } = {}) {
  return db.query(
    `SELECT * FROM types_actes ${inactifs ? '' : 'WHERE actif = 1'} ORDER BY libelle`
  );
}

export async function findTypeActe(id) {
  const rows = await db.query('SELECT * FROM types_actes WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Un type d'acte est une nomenclature, pas une donnée d'exploitation.
 *
 * `prefixe` est court et unique : c'est lui qui ouvre le numéro. Deux types ne
 * peuvent pas partager un préfixe, sans quoi le registre ne distingue plus
 * deux familles d'actes qui porteraient le même numéro de série. La base
 * refuse cette collision.
 */
export async function createTypeActe({ code, libelle, prefixe, description = null }) {
  const result = await db.query(
    `INSERT INTO types_actes (code, libelle, prefixe, description) VALUES (?, ?, ?, ?)`,
    [code, libelle, prefixe.toUpperCase(), description]
  );
  return { id: result.insertId };
}

export async function findActes(filtres = {}) {
  const where = ['1=1'];
  const params = [];

  if (filtres.type_acte_id) { where.push('a.type_acte_id = ?'); params.push(filtres.type_acte_id); }
  if (filtres.annee) { where.push('a.annee = ?'); params.push(filtres.annee); }
  if (filtres.statut) { where.push('a.statut = ?'); params.push(filtres.statut); }
  if (filtres.dossier_id) { where.push('a.dossier_id = ?'); params.push(filtres.dossier_id); }
  if (filtres.division_id) { where.push('a.division_id = ?'); params.push(filtres.division_id); }
  if (filtres.du) { where.push('a.date_acte >= ?'); params.push(filtres.du); }
  if (filtres.au) { where.push('a.date_acte <= ?'); params.push(filtres.au); }

  /* La recherche porte sur le numéro ET sur l'objet. Un acte se retrouve par
     l'un ou l'autre : la secrétaire qui reçoit une réclamation a en main la
     référence de la note, le chef de service a le texte. */
  if (filtres.recherche) {
    where.push('(a.numero LIKE ? OR a.objet LIKE ? OR a.destinataire LIKE ?)');
    const motif = `%${filtres.recherche}%`;
    params.push(motif, motif, motif);
  }

  const limite = Math.min(Number(filtres.limite) || 200, 1000);
  const offset = Number(filtres.offset) || 0;

  const lignes = await db.query(
    `SELECT a.*, t.libelle AS type_libelle, t.code AS type_code, t.prefixe,
            d.numero AS dossier_numero, dv.nom AS division_nom,
            u.username AS auteur_username,
            ag.nom AS auteur_nom, ag.prenom AS auteur_prenom
     FROM actes a
     JOIN types_actes t ON t.id = a.type_acte_id
     LEFT JOIN dossiers d ON d.id = a.dossier_id
     LEFT JOIN divisions dv ON dv.id = a.division_id
     LEFT JOIN users u ON u.id = a.created_by
     LEFT JOIN agents ag ON ag.user_id = a.created_by
     WHERE ${where.join(' AND ')}
     ORDER BY a.date_acte DESC, a.id DESC
     LIMIT ${limite} OFFSET ${offset}`,
    params
  );

  const [total] = await db.query(
    `SELECT COUNT(*) AS n FROM actes a WHERE ${where.join(' AND ')}`,
    params
  );

  return { lignes, total: Number(total.n) };
}

export async function findActeById(id) {
  const rows = await db.query(
    `SELECT a.*, t.libelle AS type_libelle, t.code AS type_code, t.prefixe,
            d.numero AS dossier_numero, dv.nom AS division_nom,
            u.username AS auteur_username,
            ag.nom AS auteur_nom, ag.prenom AS auteur_prenom
     FROM actes a
     JOIN types_actes t ON t.id = a.type_acte_id
     LEFT JOIN dossiers d ON d.id = a.dossier_id
     LEFT JOIN divisions dv ON dv.id = a.division_id
     LEFT JOIN users u ON u.id = a.created_by
     LEFT JOIN agents ag ON ag.user_id = a.created_by
     WHERE a.id = ?`,
    [id]
  );
  return rows[0];
}

export async function findActeByNumero(numero) {
  const rows = await db.query('SELECT * FROM actes WHERE numero = ?', [numero]);
  return rows[0];
}

/**
 * Un jour, au format que la colonne DATE attend.
 *
 * Joi rend une date soit en objet Date, soit en chaîne ISO complète
 * « 2026-09-30T00:00:00.000Z ». MariaDB refuse cette seconde forme sur une
 * colonne DATE : « Incorrect date value ». La conversion est faite ici, une
 * seule fois, plutôt que laissée à chaque appelant — c'est un piège qui
 * reviendrait à chaque nouvelle saisie.
 */
function jourISO(valeur) {
  if (valeur instanceof Date) {
    // getFullYear, et non toISOString : celle-ci décale d'un jour les dates
    // situées à l'ouest de Greenwich, soit un acte daté du 1er janvier enregistré
    // au Madagascar comme daté du 31 décembre de l'année précédente.
    const mois = String(valeur.getMonth() + 1).padStart(2, '0');
    const jour = String(valeur.getDate()).padStart(2, '0');
    return `${valeur.getFullYear()}-${mois}-${jour}`;
  }
  return String(valeur).slice(0, 10);
}

export async function createActe(data, runner = db) {
  return db.withTransaction((tx) => insererActe(data, tx, runner));
}

async function insererActe(data, tx, runner) {
  const {
    type_acte_id, objet, dossier_id = null, division_id = null, observations = null,
  } = data;

  const dateActe = jourISO(data.date_acte);

  /* L'année est celle de la date de l'acte, pas celle du jour. Un acte daté du
     2 janvier et enregistré le 3 est numéroté dans la série 2026 ; l'inverse
     donnerait un numéro 2026 dans un registre 2027, que la recherche par année
     ne retrouverait pas. Le calcul est ici, et non dans le contrôleur, pour
     qu'aucun autre appelant puisse l'oublier. */
  const annee = Number(dateActe.slice(0, 4));

  const type = await findTypeActe(type_acte_id);
  if (!type) throw Object.assign(new Error("Type d'acte inconnu."), { status: 400 });
  if (!type.actif) {
    throw Object.assign(new Error(`Le type d'acte « ${type.libelle} » n'est plus en service.`), { status: 400 });
  }

  const { numero } = await attribuerNumero(type.prefixe, annee, tx);

  const result = await tx.query(
    `INSERT INTO actes
       (numero, type_acte_id, annee, date_acte, objet, destinataire, expediteur,
        dossier_id, division_id, created_by, observations)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      numero, type_acte_id, annee, dateActe, objet,
      data.destinataire ?? null, data.expediteur ?? null,
      dossier_id, division_id, data.created_by ?? null, observations,
    ]
  );

  return { id: result.insertId, numero };
}

/**
 * Annuler un acte, jamais le supprimer.
 *
 * Le numéro d'un acte enregistré reste réservé. Le retirer laisserait un trou au
 * registre, et ce trou aurait deux lectures possibles — un acte jamais
 * enregistré, ou un acte retiré de la circulation — que rien dans la plateforme
 * ne permet de distinguer. L'acte annulé reste visible, avec sa date, son
 * objet et le motif de l'annulation.
 */
export async function annulerActe(id, motif) {
  const lignes = await db.query(
    `UPDATE actes SET statut = 'ANNULE', observations = ? WHERE id = ? AND statut = 'ENREGISTRE'`,
    [motif, id]
  );
  if (!lignes.affectedRows) {
    throw Object.assign(
      new Error("Cet acte est déjà annulé, ou n'existe pas : un numéro du registre ne se réattribue pas."),
      { status: 409 }
    );
  }
  return findActeById(id);
}

/**
 * L'état du registre : le prochain numéro, et les trous.
 *
 * Un registre sert d'abord à prouver qu'il est complet. Un numéro manquant
 * entre deux actes est un acte jamais enregistré, un acte sorti du registre, ou
 * un saut de numérotation : dans les trois cas, l'agent doit le voir, sinon
 * c'est la référence citée dans une lettre qui devient invérifiable.
 */
export async function etatRegistre(annee = new Date().getFullYear()) {
  const types = await db.query(
    `SELECT t.*, COUNT(a.id) AS total,
            COALESCE(MAX(CAST(SUBSTRING_INDEX(a.numero, '-', -1) AS UNSIGNED)), 0) AS dernier
     FROM types_actes t
     LEFT JOIN actes a ON a.type_acte_id = t.id AND a.annee = ?
     WHERE t.actif = 1
     GROUP BY t.id, t.code, t.libelle, t.prefixe, t.actif
     ORDER BY t.libelle`,
    [annee]
  );

  return types.map((t) => {
    // Le compteur fait foi, pas le dernier numéro_inscrit : un acte annulé
    // reste compté, et un compteur.resynchronise après restauration peut être
    // en avance sur le registre.
    return {
      type_acte_id: t.id,
      code: t.code,
      libelle: t.libelle,
      prefixe: t.prefixe,
      total: Number(t.total),
      dernier_numero: Number(t.dernier),
      annee,
    };
  });
}

/**
 * Les numéros manquants d'une famille.
 *
 * Un acte ANNULÉ est compté : il est au registre, barré, et son numéro est
 * réservé. Ne retenir que les actes ENREGISTRE ferait apparaître comme manquant
 * le numéro de tout acte annulé — c'est-à-dire qu'une annulation ordinary
 * produirait l'alerte « pièce disparue » qu'un registre est censé lever. Un
 * numéro est donc manquant seulement si AUCUN acte ne le porte, quel qu'en soit
 * le statut.
 */
export async function trousRegistre(type_acte_id, annee) {
  const lignes = await db.query(
    `SELECT numero FROM actes
     WHERE type_acte_id = ? AND annee = ?
     ORDER BY numero`,
    [type_acte_id, annee]
  );
  if (!lignes.length) return [];

  const numeros = lignes.map((l) => Number(String(l.numero).split('-').pop()));
  const trous = [];
  for (let i = numeros[0]; i <= numeros[numeros.length - 1]; i++) {
    if (!numeros.includes(i)) trous.push(i);
  }
  return trous;
}
