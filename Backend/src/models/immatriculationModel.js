import db from '../config/db.js';

/**
 * Immatriculations, insertions en paie et changements de mode de paiement.
 *
 * Les trois objets appartiennent à la même mission — faire entrer un agent
 * dans le service et le payer du bon moyen — mais ils se suivent dans le
 * temps : une immatriculation, puis son insertion, puis ses changements de
 * mode de paiement.
 *
 * La **référence attribuée** (le matricule) est conservée sur
 * l'immatriculation, même quand elle est rejetée : une attribution ne se
 * rend pas, elle se trace. C'est ce qui permet de dire, plus tard, quel
 * numéro a été donné et à qui.
 */

/** Immatriculations, avec leur division et leur insertion en paie. */
export async function listImmatriculations({ statut, division_id, search, limite = 200 } = {}) {
  const where = [];
  const params = [];

  if (statut) {
    where.push('i.statut = ?');
    params.push(String(statut).toUpperCase());
  }
  if (division_id) {
    where.push('i.division_id = ?');
    params.push(Number(division_id));
  }
  if (search) {
    const s = `%${String(search).trim()}%`;
    where.push('(i.nom LIKE ? OR i.prenom LIKE ? OR i.cin LIKE ? OR i.matricule LIKE ?)');
    params.push(s, s, s, s);
  }

  return db.query(
    `SELECT i.*, dv.nom AS division_nom,
            ip.id AS insertion_id, ip.statut AS insertion_statut,
            ip.matricule_augure, ip.salaire_base
     FROM immatriculations i
     LEFT JOIN divisions dv ON dv.id = i.division_id
     LEFT JOIN insertions_paiement ip ON ip.immatriculation_id = i.id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY i.created_at DESC
     LIMIT ?`,
    [...params, Number(limite) || 200]
  );
}

/** Une immatriculation et son historique de paiement. */
export async function findImmatriculation(id) {
  const [imma] = await db.query(
    `SELECT i.*, dv.nom AS division_nom, u.username AS auteur
     FROM immatriculations i
     LEFT JOIN divisions dv ON dv.id = i.division_id
     LEFT JOIN users u ON u.id = i.created_by
     WHERE i.id = ?`,
    [id]
  );
  if (!imma) return null;

  const [insertion] = await db.query(
    'SELECT * FROM insertions_paiement WHERE immatriculation_id = ? ORDER BY id DESC LIMIT 1',
    [id]
  );
  const paiements = await db.query(
    'SELECT * FROM modes_paiement WHERE immatriculation_id = ? ORDER BY id DESC',
    [id]
  );
  return { ...imma, insertion: insertion || null, paiements };
}

/**
 * Le matricule attribué est-il déjà pris ?
 *
 * Le contrôle est fait **avant** l'attribution : deux personnes ne peuvent
 * pas porter le même numéro, et le signaler à l'écrite est plus sûr que de
 * le découvrir à la paie.
 */
export async function matriculeDejaAttribue(matricule, exceptId = null) {
  if (!matricule) return null;
  const params = [String(matricule).trim()];
  let requete = `SELECT id, nom, prenom FROM immatriculations
                 WHERE matricule = ? AND statut <> 'REJETEE'`;
  if (exceptId) {
    requete += ' AND id <> ?';
    params.push(Number(exceptId));
  }
  const rows = await db.query(requete, params);
  return rows[0] || null;
}

/**
 * Le CIN est-il déjà connu ?
 *
 * Même raison que pour le matricule : le CIN est l'identifiant national, il
 * ne peut pas être partagé.
 */
export async function cinDejaConnu(cin, exceptId = null) {
  if (!cin) return null;
  const compact = String(cin).replace(/[\s.-]/g, '').toUpperCase();
  const params = [compact];
  let requete = `SELECT id, nom, prenom FROM immatriculations
                 WHERE UPPER(REPLACE(REPLACE(IFNULL(cin, ''), ' ', ''), '-', '')) = ?`;
  if (exceptId) {
    requete += ' AND id <> ?';
    params.push(Number(exceptId));
  }
  const rows = await db.query(requete, params);
  return rows[0] || null;
}

/** Enregistre une immatriculation. */
export async function createImmatriculation(data, userId) {
  const result = await db.query(
    `INSERT INTO immatriculations
       (nom, prenom, cin, date_naissance, corps, grade, indice, date_entree,
        division_id, matricule, statut, observations, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nom, data.prenom, data.cin || null, data.date_naissance || null,
      data.corps || null, data.grade || null,
      data.indice === '' || data.indice === undefined ? null : data.indice,
      data.date_entree || null, data.division_id || null,
      data.matricule || null, data.statut || 'EN_ATTENTE',
      data.observations || null, userId || null,
    ]
  );
  return { id: result.insertId };
}

/** Met à jour une immatriculation. */
export async function updateImmatriculation(id, data) {
  const champs = [
    'nom', 'prenom', 'cin', 'date_naissance', 'corps', 'grade', 'indice',
    'date_entree', 'division_id', 'matricule', 'statut', 'observations',
  ];
  const sets = [];
  const params = [];
  for (const champ of champs) {
    if (data[champ] === undefined) continue;
    sets.push(`${champ} = ?`);
    params.push(data[champ] === '' ? null : data[champ]);
  }
  if (!sets.length) return findImmatriculation(id);
  params.push(id);
  await db.query(`UPDATE immatriculations SET ${sets.join(', ')} WHERE id = ?`, params);
  return findImmatriculation(id);
}

/** Enregistre l'insertion en paie d'un nouvel arrivant. */
export async function createInsertion(data, userId) {
  const result = await db.query(
    `INSERT INTO insertions_paiement
       (immatriculation_id, matricule_augure, situation_familiale, adresse,
        telephone, date_naissance, indice_base, salaire_base, statut,
        observations, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.immatriculation_id, data.matricule_augure || null,
      data.situation_familiale || null, data.adresse || null,
      data.telephone || null, data.date_naissance || null,
      data.indice_base === '' || data.indice_base === undefined ? null : data.indice_base,
      data.salaire_base === '' || data.salaire_base === undefined ? null : data.salaire_base,
      data.statut || 'A_INSERER', data.observations || null, userId || null,
    ]
  );
  return { id: result.insertId };
}

/** Met à jour l'insertion en paie. */
export async function updateInsertion(id, data) {
  const champs = [
    'matricule_augure', 'situation_familiale', 'adresse', 'telephone',
    'date_naissance', 'indice_base', 'salaire_base', 'statut', 'observations',
  ];
  const sets = [];
  const params = [];
  for (const champ of champs) {
    if (data[champ] === undefined) continue;
    sets.push(`${champ} = ?`);
    params.push(data[champ] === '' ? null : data[champ]);
  }
  if (!sets.length) return null;
  params.push(id);
  await db.query(`UPDATE insertions_paiement SET ${sets.join(', ')} WHERE id = ?`, params);
  const rows = await db.query('SELECT * FROM insertions_paiement WHERE id = ?', [id]);
  return rows[0] || null;
}

/** Enregistre une demande de changement de mode de paiement. */
export async function createChangementPaiement(data, userId) {
  const result = await db.query(
    `INSERT INTO modes_paiement
       (immatriculation_id, mode, banque, compte_bancaire, motif,
        pieces_verifiees, statut, observations, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.immatriculation_id, data.mode, data.banque || null,
      data.compte_bancaire || null, data.motif,
      data.pieces_verifiees ? 1 : 0, data.statut || 'EN_ATTENTE',
      data.observations || null, userId || null,
    ]
  );
  return { id: result.insertId };
}

/** Met à jour une demande de changement de mode de paiement. */
export async function updateChangementPaiement(id, data) {
  const champs = [
    'mode', 'banque', 'compte_bancaire', 'motif', 'pieces_verifiees',
    'statut', 'observations',
  ];
  const sets = [];
  const params = [];
  for (const champ of champs) {
    if (data[champ] === undefined) continue;
    sets.push(`${champ} = ?`);
    params.push(data[champ] === '' ? null : data[champ]);
  }
  if (!sets.length) return null;
  params.push(id);
  await db.query(`UPDATE modes_paiement SET ${sets.join(', ')} WHERE id = ?`, params);
  const rows = await db.query('SELECT * FROM modes_paiement WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Attribue la prochaine référence d'immatriculation.
 *
 * Le compteur est dans `compteurs_numerotation`, comme celui des dossiers : la
 * numérotation est unique dans toute la plateforme, et ne se rend pas.
 */
export async function attribuerReference() {
  await db.query(
    `INSERT INTO compteurs_numerotation (cle, valeur) VALUES ('IMMATRICULATION', 1)
     ON DUPLICATE KEY UPDATE valeur = valeur + 1`
  );
  const [compteur] = await db.query(
    "SELECT valeur FROM compteurs_numerotation WHERE cle = 'IMMATRICULATION'"
  );
  return `IMMA-${String(compteur?.valeur || 1).padStart(6, '0')}`;
}

/**
 * Volumes par type de demande, période et division.
 *
 * Le cahier (§ 11.2) demande de « consulter les volumes par type de demande,
 * période et division ». L'« type de demande » est ici la nature de la
 * demande : immatriculation, insertion en paie, changement de mode de
 * paiement.
 */
export async function volumes({ dateDebut, dateFin, division_id } = {}) {
  const where = [];
  const params = [];
  if (dateDebut) {
    where.push('i.created_at >= ?');
    params.push(dateDebut);
  }
  if (dateFin) {
    where.push('i.created_at <= ?');
    params.push(`${dateFin} 23:59:59`);
  }
  if (division_id) {
    where.push('i.division_id = ?');
    params.push(Number(division_id));
  }
  const condition = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const parDivision = await db.query(
    `SELECT COALESCE(dv.nom, '—') AS division, COUNT(*) AS total,
            SUM(i.statut = 'ACTIVE') AS actives,
            SUM(i.statut = 'EN_ATTENTE') AS en_attente
     FROM immatriculations i
     LEFT JOIN divisions dv ON dv.id = i.division_id
     ${condition}
     GROUP BY dv.id, dv.nom
     ORDER BY total DESC`,
    params
  );

  const parType = await db.query(
    `SELECT 'Immatriculation' AS type, COUNT(*) AS total
       FROM immatriculations i ${condition}
     UNION ALL
     SELECT 'Insertion en paie', COUNT(*)
       FROM insertions_paiement ip
       JOIN immatriculations i ON i.id = ip.immatriculation_id ${condition}
     UNION ALL
     SELECT 'Changement de mode de paiement', COUNT(*)
       FROM modes_paiement mp
       JOIN immatriculations i ON i.id = mp.immatriculation_id ${condition}`,
    [...params, ...params, ...params]
  );

  const parMois = await db.query(
    `SELECT DATE_FORMAT(i.created_at, '%Y-%m') AS mois, COUNT(*) AS total
     FROM immatriculations i
     ${condition}
     GROUP BY mois
     ORDER BY mois DESC
     LIMIT 12`,
    params
  );

  return { par_division: parDivision, par_type: parType, par_mois: parMois };
}
