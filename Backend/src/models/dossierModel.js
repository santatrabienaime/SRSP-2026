import db from '../config/db.js';
import { generateDossierNumber } from '../utils/generateDossierNumber.js';
import { normaliserMatricule } from '../validators/dossierValidators.js';

/**
 * Dossiers d'une personne, identifiés par son matricule compacté.
 *
 * Le matricule est stocké tantôt avec espaces, tantôt sans : la comparaison se
 * fait sur la valeur compactée des deux côtés, sinon « 222 222 222 » ne
 * retrouverait pas « 222222222 ».
 */
export async function findDossiersParMatricule(matriculeNormalise) {
  const compact = String(matriculeNormalise).replace(/[\s.-]/g, '').toUpperCase();
  if (!compact) return [];
  return db.query(
    `SELECT d.id, d.numero, d.demandeur, d.demandeur_nom, d.demandeur_prenom,
            d.demandeur_tel, d.demandeur_email, d.demandeur_adresse,
            d.date_reception, d.matricule,
            t.libelle AS type_libelle, s.libelle AS statut_libelle, s.code AS statut_code
     FROM dossiers d
     JOIN types_dossiers t ON t.id = d.type_id
     JOIN statuts_dossiers s ON s.id = d.statut_id
     WHERE REPLACE(REPLACE(REPLACE(IFNULL(d.matricule, ''), ' ', ''), '-', ''), '.', '') = ?
     ORDER BY d.date_reception DESC, d.id DESC
     LIMIT 50`,
    [compact]
  );
}

const STATUTS = [
  'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE', 'VALIDE', 'SIGNE',
  'CLOTURE', 'ARCHIVE',
];

export async function findDossiers(filters = {}) {
  let query = `
    SELECT d.id, d.numero, d.objet, d.demandeur, d.matricule, d.date_reception,
           d.demandeur_nom, d.demandeur_prenom, d.demandeur_tel,
           d.demandeur_email, d.demandeur_adresse,
           d.observation, d.date_limite, d.date_cloture, d.date_archivage, d.created_at,
           d.agent_responsable_id, d.priorite_id,
           t.libelle AS type_libelle, s.libelle AS statut_libelle, s.code AS statut_code,
           dv.nom AS division_nom, p.libelle AS priorite_libelle,
           a.nom AS agent_nom, a.prenom AS agent_prenom
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN priorites p ON d.priorite_id = p.id
     LEFT JOIN agents a ON d.agent_responsable_id = a.id
     WHERE 1=1
  `;
  const params = [];

  if (filters.statut_id) {
    query += ' AND d.statut_id = ?';
    params.push(filters.statut_id);
  }
  if (filters.statut) {
    const codes = Array.isArray(filters.statut)
      ? filters.statut
      : String(filters.statut)
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);

    const groupes = {
      NOUVEAUX: ['RECU', 'ENREGISTRE'],
      A_AFFECTER: ['ENREGISTRE', 'ORIENTE'],
      EN_COURS: [
        'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
        'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE',
      ],
      TERMINES: ['VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE'],
    };

    const codesRequis = codes.flatMap((c) => groupes[c] || c);
    if (codesRequis.length === 1) {
      query += ' AND s.code = ?';
      params.push(codesRequis[0]);
    } else if (codesRequis.length > 1) {
      query += ` AND s.code IN (${codesRequis.map(() => '?').join(',')})`;
      params.push(...codesRequis);
    }
  }
  if (filters.type_id) {
    query += ' AND d.type_id = ?';
    params.push(filters.type_id);
  }
  if (filters.type) {
    query += ' AND t.code = ?';
    params.push(filters.type);
  }
  if (filters.priorite_id) {
    query += ' AND d.priorite_id = ?';
    params.push(filters.priorite_id);
  }
  if (filters.division_id) {
    query += ' AND d.division_id = ?';
    params.push(filters.division_id);
  }
  if (filters.agent_id) {
    query += ' AND d.agent_responsable_id = ?';
    params.push(filters.agent_id);
  }
  if (filters.priorite_haute) {
    query += ' AND p.niveau >= 3';
  }
  if (filters.incomplets) {
    query += ` AND EXISTS (
      SELECT 1 FROM depouillements dp
      JOIN types_pieces tp ON tp.code = dp.piece
      WHERE dp.dossier_id = d.id
        AND tp.obligatoire = 1
        AND dp.presente = 0
    )`;
  }
  if (filters.echeance === 'depassee') {
    query += ` AND d.date_limite IS NOT NULL AND d.date_limite < CURDATE()
               AND s.code NOT IN ('CLOTURE', 'ARCHIVE')`;
  }
  if (filters.date_debut) {
    query += ' AND d.date_reception >= ?';
    params.push(filters.date_debut);
  }
  if (filters.date_fin) {
    query += ' AND d.date_reception <= ?';
    params.push(filters.date_fin);
  }
  if (filters.search) {
    query += ` AND (d.numero LIKE ? OR d.objet LIKE ? OR d.demandeur LIKE ?
                        OR d.demandeur_nom LIKE ? OR d.demandeur_prenom LIKE ?
                        OR d.matricule LIKE ?)`;
    const s = `%${filters.search}%`;
    params.push(s, s, s, s, s, s);
  }

  const TRIS = {
    prioritaire:
      'p.niveau DESC, ' +
      '(CASE WHEN d.date_limite IS NULL THEN 1 ELSE 0 END) ASC, ' +
      'd.date_limite ASC, ' +
      'd.date_reception ASC, d.id ASC',
    recent: 'd.date_reception DESC, d.id DESC',
    ancien: 'd.date_reception ASC, d.id ASC',
    numero: 'd.numero ASC',
    numero_desc: 'd.numero DESC',
    echeance: '(CASE WHEN d.date_limite IS NULL THEN 1 ELSE 0 END) ASC, d.date_limite ASC, d.id ASC',
    division: 'dv.nom ASC, p.niveau DESC, d.id ASC',
    agent: '(a.nom IS NULL) ASC, a.nom ASC, p.niveau DESC, d.id ASC',
  };
  if (filters.recus_depuis_jours) {
    const jours = Number(filters.recus_depuis_jours);
    if (Number.isInteger(jours) && jours > 0) {
      query += ' AND d.date_reception >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
      params.push(jours);
    }
  }
  if (filters.priorite_haute) {
    query += ' AND p.niveau >= 3';
  }
  if (filters.echeance === 'depassee') {
    query += ` AND d.date_limite IS NOT NULL AND d.date_limite < CURDATE()
               AND s.code NOT IN ('CLOTURE', 'ARCHIVE')`;
  }
  if (filters.date_debut) {
    query += ' AND d.date_reception >= ?';
    params.push(filters.date_debut);
  }
  if (filters.date_fin) {
    query += ' AND d.date_reception <= ?';
    params.push(filters.date_fin);
  }
  /* Le tri est positionné en DERNIER : la clause doit suivre tous les filtres,
     sinon la requête est rejetée. La liste des tris est fermée, la colonne
     n'est donc jamais concaténée depuis l'extérieur. */
  query += ` ORDER BY ${TRIS[filters.tri] || TRIS.prioritaire}`;
  return db.query(query, params);
}

export async function findDossierById(id) {
  const rows = await db.query(
    `SELECT d.*, t.code AS type_code, t.libelle AS type_libelle,
            s.libelle AS statut_libelle, s.code AS statut_code,
            dv.nom AS division_nom, dv.code AS division_code, p.libelle AS priorite_libelle,
            a.nom AS agent_nom, a.prenom AS agent_prenom
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN priorites p ON d.priorite_id = p.id
     LEFT JOIN agents a ON a.id = d.agent_responsable_id
     WHERE d.id = ?`,
    [id]
  );
  return rows[0];
}

export async function createDossier(data) {
  const {
    type_id, objet, demandeur, matricule, date_reception, date_limite,
    division_id, priorite_id, observation, created_by,
    demandeur_nom, demandeur_prenom, demandeur_tel,
    demandeur_email, demandeur_adresse,
  } = data;
  const numero = await generateDossierNumber(type_id);
  const rows = await db.query(
    `SELECT id FROM statuts_dossiers WHERE code = 'RECU'`
  );
  const statutId = rows[0]?.id;
  const [result] = await db.query(
    `INSERT INTO dossiers (numero, type_id, objet, demandeur, matricule, date_reception,
                           date_limite, division_id, priorite_id, observation, created_by,
                           demandeur_nom, demandeur_prenom, demandeur_tel,
                           demandeur_email, demandeur_adresse, statut_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      numero, type_id, objet, demandeur, matricule, date_reception,
      date_limite, division_id, priorite_id, observation, created_by,
      demandeur_nom, demandeur_prenom, demandeur_tel,
      demandeur_email, demandeur_adresse, statutId,
    ]
  );
  return { id: result.insertId, numero };
}

function harmoniserDemandeur(data) {
  const nom = (data.demandeur_nom || '').trim();
  const prenom = (data.demandeur_prenom || '').trim();
  if (!nom && !prenom) return data;
  if (!nom || !prenom) return { ...data, demandeur: (nom || prenom).slice(0, 150) };
  return { ...data, demandeur: `${nom} ${prenom}`.trim().slice(0, 150) };
}

const MESSAGE_MATRICULE =
  'Le matricule doit comporter 2 à 10 caractères (chiffres et lettres).';

async function verifierMatricule(matricule) {
  const compact = normaliserMatricule(matricule);
  if (!compact) return;
  if (compact.length < 2 || compact.length > 10) {
    const err = new Error(MESSAGE_MATRICULE);
    err.status = 422;
    throw err;
  }
  const rows = await db.query(
    `SELECT id, demandeur_nom, demandeur_prenom FROM dossiers
     WHERE REPLACE(REPLACE(REPLACE(IFNULL(matricule, ''), ' ', ''), '-', ''), '.', '') = ?`,
    [compact]
  );
  if (rows[0]) {
    const err = new Error(`Le matricule ${compact} est déjà attribué à ${rows[0].demandeur_nom} ${rows[0].demandeur_prenom}.`);
    err.status = 409;
    throw err;
  }
}

export async function updateDossier(id, data) {
  const allowed = [
    'type_id', 'objet', 'demandeur', 'matricule', 'date_reception', 'date_limite',
    'division_id', 'priorite_id', 'observation',
    'demandeur_nom', 'demandeur_prenom', 'demandeur_tel',
    'demandeur_email', 'demandeur_adresse',
  ];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`d.${key} = ?`);
      params.push(data[key]);
    }
  }
  if (sets.length === 0) return findDossierById(id);
  params.push(id);
  await db.query(`UPDATE dossiers d SET ${sets.join(', ')} WHERE d.id = ?`, params);
  return findDossierById(id);
}

export async function deleteDossier(id) {
  await db.query(`DELETE FROM dossiers WHERE id = ?`, [id]);
  return { message: 'Dossier supprimé.' };
}

export async function updateStatut(id, code) {
  const rows = await db.query(`SELECT id FROM statuts_dossiers WHERE code = ?`, [code]);
  if (!rows[0]) throw new Error(`Statut inconnu: ${code}`);
  await db.query(`UPDATE dossiers SET statut_id = ? WHERE id = ?`, [rows[0].id, id]);
  return findDossierById(id);
}