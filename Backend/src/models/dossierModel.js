import db from '../config/db.js';
import { generateDossierNumber } from '../utils/generateDossierNumber.js';

export async function findDossiers(filters = {}) {
  let query = `
    SELECT d.id, d.numero, d.objet, d.demandeur, d.matricule, d.date_reception,
           d.observation, d.date_cloture, d.date_archivage, d.created_at,
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
    query += ' AND s.code = ?';
    params.push(filters.statut);
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
  if (filters.search) {
    query += ' AND (d.numero LIKE ? OR d.objet LIKE ? OR d.demandeur LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }
  if (filters.date_debut) {
    query += ' AND d.date_reception >= ?';
    params.push(filters.date_debut);
  }
  if (filters.date_fin) {
    query += ' AND d.date_reception <= ?';
    params.push(filters.date_fin);
  }
  query += ' ORDER BY d.date_reception DESC';
  return db.query(query, params);
}

export async function findDossierById(id) {
  const rows = await db.query(
    `SELECT d.*, t.code AS type_code, t.libelle AS type_libelle,
            s.libelle AS statut_libelle, s.code AS statut_code,
            dv.nom AS division_nom, dv.code AS division_code, p.libelle AS priorite_libelle
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN priorites p ON d.priorite_id = p.id
     WHERE d.id = ?`,
    [id]
  );
  return rows[0];
}

export async function createDossier(data) {
  const {
    type_id, objet, demandeur, matricule, date_reception,
    division_id, priorite_id, observation, created_by,
  } = data;
  const numero = await generateDossierNumber(type_id);
  const rows = await db.query(
    `SELECT id FROM statuts_dossiers WHERE code = 'RECU'`
  );
  const statutNouveau = rows[0].id;
  const result = await db.query(
    `INSERT INTO dossiers
     (numero, type_id, objet, demandeur, matricule, date_reception,
      division_id, priorite_id, statut_id, observation, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [numero, type_id, objet, demandeur, matricule ?? null, date_reception,
     division_id, priorite_id, statutNouveau, observation ?? null, created_by]
  );
  return { id: result.insertId, numero };
}

export async function updateDossier(id, data) {
  const { type_id, objet, demandeur, matricule, division_id, priorite_id, observation } = data;
  await db.query(
    `UPDATE dossiers
     SET type_id = ?, objet = ?, demandeur = ?, matricule = ?,
         division_id = ?, priorite_id = ?, observation = ?
     WHERE id = ?`,
    [type_id, objet, demandeur, matricule ?? null, division_id, priorite_id, observation ?? null, id]
  );
  return findDossierById(id);
}

export async function updateStatut(id, statutCode) {
  const rows = await db.query('SELECT id FROM statuts_dossiers WHERE code = ?', [statutCode]);
  if (!rows[0]) throw new Error(`Statut inconnu : ${statutCode}`);
  await db.query('UPDATE dossiers SET statut_id = ? WHERE id = ?', [rows[0].id, id]);
}

export async function setAgentResponsable(id, agentId) {
  await db.query('UPDATE dossiers SET agent_responsable_id = ? WHERE id = ?', [agentId, id]);
}

export async function setDivision(id, divisionId) {
  await db.query('UPDATE dossiers SET division_id = ? WHERE id = ?', [divisionId, id]);
}

export async function findDivisionOfDossier(id) {
  const rows = await db.query('SELECT division_id, agent_responsable_id FROM dossiers WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function cloturer(id) {
  await db.query('UPDATE dossiers SET date_cloture = NOW() WHERE id = ?', [id]);
}

export async function archiver(id) {
  await db.query('UPDATE dossiers SET date_archivage = NOW() WHERE id = ?', [id]);
}