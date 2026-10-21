import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

const normaliserCode = (valeur) => String(valeur || '').trim().toUpperCase().replace(/\s+/g, '_');

// --- Types de dossiers ---

export async function listTypesDossiers() {
  return db.query('SELECT id, code, libelle, description, actif FROM types_dossiers ORDER BY id');
}

export async function createTypeDossier(data) {
  const { code, libelle, description } = data;
  const result = await db.query(
    'INSERT INTO types_dossiers (code, libelle, description) VALUES (?, ?, ?)',
    [code, libelle, description || null]
  );
  return { id: result.insertId, code, libelle };
}

export async function deleteTypeDossier(id) {
  await db.query('DELETE FROM types_dossiers WHERE id = ?', [id]);
}

// --- Sous-types de dossiers (types d'acte) ---

/**
 * Liste les sous-types, éventuellement filtrés par type de dossier.
 *
 * Les sous-types ne sont jamais supprimés tant qu'ils sont référencés par un
 * dossier : les désactiver retire le choix du formulaire sans casser
 * l'historique des dossiers déjà enregistrés.
 */
export async function listSousTypes(filtres = {}) {
  const where = [];
  const params = [];
  if (filtres.type_dossier_id) {
    where.push('st.type_dossier_id = ?');
    params.push(filtres.type_dossier_id);
  }
  if (filtres.actif !== undefined && filtres.actif !== '') {
    where.push('st.actif = ?');
    params.push(Number(filtres.actif) ? 1 : 0);
  }
  return db.query(
    `SELECT st.id, st.type_dossier_id, st.code, st.libelle, st.actif, st.ordre,
            t.code AS type_code, t.libelle AS type_libelle,
            (SELECT COUNT(*) FROM dossiers d WHERE d.sous_type_id = st.id) AS nb_dossiers,
            (SELECT COUNT(*) FROM types_pieces tp WHERE tp.sous_type_id = st.id AND tp.actif = 1) AS nb_pieces
     FROM sous_types_dossiers st
     JOIN types_dossiers t ON t.id = st.type_dossier_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY t.libelle, st.ordre, st.libelle`,
    params
  );
}

async function verifierTypeDossier(typeDossierId) {
  const [type] = await db.query('SELECT id FROM types_dossiers WHERE id = ?', [typeDossierId]);
  if (!type) throw httpError(422, 'Type de dossier inconnu.');
  return type;
}

export async function createSousType(data) {
  const typeDossierId = Number(data.type_dossier_id);
  await verifierTypeDossier(typeDossierId);

  const code = normaliserCode(data.code);
  const libelle = String(data.libelle || '').trim();
  if (!code || !libelle) {
    throw httpError(422, 'Le code et le libellé du sous-type sont obligatoires.');
  }

  const existant = await db.query(
    'SELECT id FROM sous_types_dossiers WHERE type_dossier_id = ? AND code = ?',
    [typeDossierId, code]
  );
  if (existant[0]) {
    throw httpError(409, `Le sous-type ${code} existe déjà pour ce type de dossier.`);
  }

  const result = await db.query(
    `INSERT INTO sous_types_dossiers (type_dossier_id, code, libelle, actif, ordre)
     VALUES (?, ?, ?, ?, ?)`,
    [typeDossierId, code, libelle, data.actif === undefined ? 1 : (data.actif ? 1 : 0), Number(data.ordre) || 0]
  );
  return { id: result.insertId, type_dossier_id: typeDossierId, code, libelle };
}

export async function updateSousType(id, data) {
  const [courant] = await db.query('SELECT * FROM sous_types_dossiers WHERE id = ?', [id]);
  if (!courant) throw httpError(404, 'Sous-type introuvable.');

  const sets = [];
  const params = [];
  if (data.libelle !== undefined) {
    const libelle = String(data.libelle || '').trim();
    if (!libelle) throw httpError(422, 'Le libellé du sous-type est obligatoire.');
    sets.push('libelle = ?');
    params.push(libelle);
  }
  if (data.actif !== undefined) {
    sets.push('actif = ?');
    params.push(data.actif ? 1 : 0);
  }
  if (data.ordre !== undefined) {
    sets.push('ordre = ?');
    params.push(Number(data.ordre) || 0);
  }
  if (!sets.length) return { ...courant };

  params.push(id);
  await db.query(`UPDATE sous_types_dossiers SET ${sets.join(', ')} WHERE id = ?`, params);
  return { ...courant, ...data, id };
}

/**
 * Désactivation. Un sous-type utilisé ne peut pas être supprimé : ses dossiers
 * perdraient leur type d'acte. La désactivation le retire des formulaires tout
 * en conservant la donnée historique.
 */
export async function deleteSousType(id) {
  const [courant] = await db.query('SELECT id FROM sous_types_dossiers WHERE id = ?', [id]);
  if (!courant) throw httpError(404, 'Sous-type introuvable.');

  const [usage] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM dossiers WHERE sous_type_id = ?) AS dossiers,
       (SELECT COUNT(*) FROM types_pieces WHERE sous_type_id = ? AND actif = 1) AS pieces_actives,
       (SELECT COUNT(*) FROM types_pieces WHERE sous_type_id = ?) AS pieces`,
    [id, id, id]
  );
  if (Number(usage.dossiers) > 0) {
    throw httpError(
      409,
      `Ce sous-type est utilisé par ${usage.dossiers} dossier(s) : désactivez-le au lieu de le supprimer.`
    );
  }
  if (Number(usage.pieces_actives) > 0) {
    throw httpError(
      409,
      'Des pièces requises actives sont rattachées à ce sous-type : retirez-les ou désactivez-les.'
    );
  }

  /* Une pièce désactivée conserve encore la référence du sous-type. La
     supprimer laisserait un identifiant pointant sur une ligne disparue :
     on détache donc ces pièces avant la suppression, pour qu'aucune ligne ne
     référence un sous-type qui n'existe plus. */
  if (Number(usage.pieces) > 0) {
    await db.query(
      'UPDATE types_pieces SET sous_type_id = NULL WHERE sous_type_id = ?',
      [id]
    );
  }

  await db.query('DELETE FROM sous_types_dossiers WHERE id = ?', [id]);
}

// --- Types de pieces ---

export async function listTypesPieces(filtres = {}) {
  const where = [];
  const params = [];
  if (filtres.type_dossier_id) {
    where.push('(tp.type_dossier_id IS NULL OR tp.type_dossier_id = ?)');
    params.push(filtres.type_dossier_id);
  }
  if (filtres.sous_type_id) {
    where.push('(tp.sous_type_id IS NULL OR tp.sous_type_id = ?)');
    params.push(filtres.sous_type_id);
  }
  if (filtres.division_code) {
    where.push('tp.division_code = ?');
    params.push(filtres.division_code);
  }
  if (filtres.actif !== undefined && filtres.actif !== '') {
    where.push('tp.actif = ?');
    params.push(Number(filtres.actif) ? 1 : 0);
  }
  return db.query(
    `SELECT tp.*, t.code AS type_code, t.libelle AS type_libelle,
            st.libelle AS sous_type_libelle
     FROM types_pieces tp
     LEFT JOIN types_dossiers t ON t.id = tp.type_dossier_id
     LEFT JOIN sous_types_dossiers st ON st.id = tp.sous_type_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY tp.division_code, tp.phase, tp.ordre, tp.libelle`,
    params
  );
}

/**
 * Crée une pièce requise. Le code est l'identifiant stable utilisé par le
 * dépouillement : il n'est jamais modifié ensuite, sinon les contrôles déjà
 * enregistrés désigneraient une autre pièce.
 */
export async function createTypePiece(data) {
  const code = normaliserCode(data.code);
  const libelle = String(data.libelle || '').trim();
  if (!code || !libelle) {
    throw httpError(422, 'Le code et le libellé de la pièce sont obligatoires.');
  }
  if (!['DEPOUILLEMENT', 'ARCHIVAGE'].includes(data.phase)) {
    throw httpError(422, 'La phase doit être DEPOUILLEMENT ou ARCHIVAGE.');
  }

  let typeDossierId = data.type_dossier_id ? Number(data.type_dossier_id) : null;
  if (!typeDossierId && data.division_code) {
    const [division] = await db.query(
      'SELECT type_dossier_id FROM divisions WHERE code = ?',
      [data.division_code]
    );
    typeDossierId = division?.type_dossier_id || null;
  }
  if (typeDossierId) await verifierTypeDossier(typeDossierId);

  let sousTypeId = data.sous_type_id ? Number(data.sous_type_id) : null;
  if (sousTypeId) {
    const [sousType] = await db.query(
      'SELECT id, type_dossier_id FROM sous_types_dossiers WHERE id = ?',
      [sousTypeId]
    );
    if (!sousType) throw httpError(422, 'Sous-type inconnu.');
    if (typeDossierId && Number(sousType.type_dossier_id) !== typeDossierId) {
      throw httpError(422, "Le sous-type n'appartient pas au type de dossier choisi.");
    }
    typeDossierId = typeDossierId || sousType.type_dossier_id;
  }

  const existant = await db.query('SELECT id FROM types_pieces WHERE code = ?', [code]);
  if (existant[0]) throw httpError(409, `La pièce ${code} existe déjà.`);

  const result = await db.query(
    `INSERT INTO types_pieces
       (code, libelle, obligatoire, actif, phase, ordre, division_code, type_dossier_id, sous_type_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      libelle,
      data.obligatoire === undefined ? 1 : (data.obligatoire ? 1 : 0),
      data.actif === undefined ? 1 : (data.actif ? 1 : 0),
      data.phase,
      Number(data.ordre) || 0,
      data.division_code || null,
      typeDossierId,
      sousTypeId,
    ]
  );
  return { id: result.insertId, code, libelle, type_dossier_id: typeDossierId, sous_type_id: sousTypeId };
}

/**
 * Met à jour une pièce. Le code reste inchangé ; `actif` permet de retirer une
 * pièce des nouveaux dépouillements sans effacer les contrôles passés.
 */
export async function updateTypePiece(id, data) {
  const [courant] = await db.query('SELECT * FROM types_pieces WHERE id = ?', [id]);
  if (!courant) throw httpError(404, 'Pièce introuvable.');

  const sets = [];
  const params = [];
  if (data.libelle !== undefined) {
    const libelle = String(data.libelle || '').trim();
    if (!libelle) throw httpError(422, 'Le libellé de la pièce est obligatoire.');
    sets.push('libelle = ?');
    params.push(libelle);
  }
  if (data.obligatoire !== undefined) {
    sets.push('obligatoire = ?');
    params.push(data.obligatoire ? 1 : 0);
  }
  if (data.actif !== undefined) {
    sets.push('actif = ?');
    params.push(data.actif ? 1 : 0);
  }
  if (data.phase !== undefined) {
    if (!['DEPOUILLEMENT', 'ARCHIVAGE'].includes(data.phase)) {
      throw httpError(422, 'La phase doit être DEPOUILLEMENT ou ARCHIVAGE.');
    }
    sets.push('phase = ?');
    params.push(data.phase);
  }
  if (data.ordre !== undefined) {
    sets.push('ordre = ?');
    params.push(Number(data.ordre) || 0);
  }
  if (data.division_code !== undefined) {
    sets.push('division_code = ?');
    params.push(data.division_code || null);
  }
  if (data.type_dossier_id !== undefined) {
    const typeDossierId = data.type_dossier_id ? Number(data.type_dossier_id) : null;
    if (typeDossierId) await verifierTypeDossier(typeDossierId);
    sets.push('type_dossier_id = ?');
    params.push(typeDossierId);
  }
  if (data.sous_type_id !== undefined) {
    const sousTypeId = data.sous_type_id ? Number(data.sous_type_id) : null;
    if (sousTypeId) {
      const [sousType] = await db.query(
        'SELECT id FROM sous_types_dossiers WHERE id = ?',
        [sousTypeId]
      );
      if (!sousType) throw httpError(422, 'Sous-type inconnu.');
    }
    sets.push('sous_type_id = ?');
    params.push(sousTypeId);
  }
  if (!sets.length) return courant;

  params.push(id);
  await db.query(`UPDATE types_pieces SET ${sets.join(', ')} WHERE id = ?`, params);
  return { ...courant, ...data, id };
}

/**
 * Désactivation d'une pièce. La suppression physique n'est pas proposée : les
 * dépouillements historiques la référencent, et l'historique doit rester
 * consultable. L'opération est idempotente.
 */
export async function deleteTypePiece(id) {
  const [courant] = await db.query('SELECT id, code FROM types_pieces WHERE id = ?', [id]);
  if (!courant) throw httpError(404, 'Pièce introuvable.');
  await db.query('UPDATE types_pieces SET actif = 0 WHERE id = ?', [id]);
  return { id, code: courant.code, actif: 0 };
}

// --- Types de courriers ---

export async function listTypesCourriers() {
  return db.query('SELECT id, libelle FROM types_courriers ORDER BY libelle');
}

export async function createTypeCourrier(data) {
  const { libelle } = data;
  const result = await db.query(
    'INSERT INTO types_courriers (libelle) VALUES (?)',
    [libelle]
  );
  return { id: result.insertId, libelle };
}

export async function deleteTypeCourrier(id) {
  await db.query('DELETE FROM types_courriers WHERE id = ?', [id]);
}
