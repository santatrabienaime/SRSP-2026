import db from '../config/db.js';
import { generateDossierNumber } from '../utils/generateDossierNumber.js';

/**
 * Dossiers d'une personne, identifiés par son CIN compacté.
 *
 * Le CIN est stocké tantôt avec espaces, tantôt sans : la comparaison se fait
 * sur la valeur compactée des deux côtés, sinon « 101 234 567 890 » ne
 * retrouverait pas « 101234567890 ».
 */
export async function findDossiersParCIN(cinNormalise) {
  const compact = String(cinNormalise).replace(/[\s.-]/g, '').toUpperCase();
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

export async function findDossiers(filters = {}) {
  let query = `
    SELECT d.id, d.numero, d.objet, d.demandeur, d.matricule, d.date_reception,
           d.demandeur_nom, d.demandeur_prenom, d.demandeur_tel,
           d.demandeur_email, d.demandeur_adresse,
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
    // Plusieurs statuts possibles : "RECU,ENREGISTRE" ou le nom d'un groupe
    // ("NOUVEAUX", "EN_COURS", "TERMINES").
    const codes = Array.isArray(filters.statut)
      ? filters.statut
      : String(filters.statut)
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);

    const groupes = {
      NOUVEAUX: ['RECU', 'ENREGISTRE'],
      // File d'attente du chef de division apres le routage automatique :
      // le dossier est oriente et attend son affectation a un agent. Ce groupe
      // est une VUE supplementaire sur EN_COURS, il ne le remplace pas.
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
  if (filters.search) {
    /* Les colonnes séparées sont consultées en plus de `demandeur` : une
       personne saisie « Jean RAKOTO » doit être retrouvée par « RAKOTO » comme
       par « Jean ». */
    query += ` AND (d.numero LIKE ? OR d.objet LIKE ? OR d.demandeur LIKE ?
                       OR d.demandeur_nom LIKE ? OR d.demandeur_prenom LIKE ?
                       OR d.matricule LIKE ?)`;
    const s = `%${filters.search}%`;
    params.push(s, s, s, s, s, s);
  }

  /* Tri.
     Par défaut la liste suit la date de réception du plus récent au plus
     ancien, ce qui est naturel pour une recherche mais pas pour un agent qui
     doit décider par quoi commencer.

     Le tri « prioritaire » répond à cette question : ce qui doit être traité
     aujourd'hui arrive en tête. L'ordre combine trois éléments, dans cet ordre
     de poids décroissant :
       1. la priorité déclarée (niveau décroissant) ;
       2. l'échéance — un dossier en retard passe avant un dossier qui ne l'est
          pas, et une échéance proche avant une échéance lointaine ;
       3. l'ancienneté, pour qu'aucun dossier ne reste indéfiniment en bas.

     Un dossier sans échéance n'est pas pénalisé : il se range après ceux qui
     en ont une, à égalité de priorité et d'ancienneté. */
  const TRIS = {
    prioritaire:
      'p.niveau DESC, ' +
      // En retard d'abord, puis l'échéance la plus proche, puis sans échéance.
      '(CASE WHEN d.date_limite IS NULL THEN 1 ELSE 0 END) ASC, ' +
      'd.date_limite ASC, ' +
      'd.date_reception ASC, d.id ASC',
    recent: 'd.date_reception DESC, d.id DESC',
    ancien: 'd.date_reception ASC, d.id ASC',
    numero: 'd.numero ASC',
    echeance: '(CASE WHEN d.date_limite IS NULL THEN 1 ELSE 0 END) ASC, d.date_limite ASC, d.id ASC',
    division: 'dv.nom ASC, p.niveau DESC, d.id ASC',
    agent: '(a.nom IS NULL) ASC, a.nom ASC, p.niveau DESC, d.id ASC',
  };
  // Article 2.1 : dossiers recus dans les N derniers jours.
  if (filters.recus_depuis_jours) {
    const jours = Number(filters.recus_depuis_jours);
    if (Number.isInteger(jours) && jours > 0) {
      query += ' AND d.date_reception >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
      params.push(jours);
    }
  }
  // Article 2.4 : priorites haute ou urgente.
  // priorites est indexee par niveau : 1 BASSE, 2 NORMALE, 3 HAUTE, 4 URGENTE.
  if (filters.priorite_haute) {
    query += ' AND p.niveau >= 3';
  }
  // Article 2.4 : echeance depassee.
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
  /* Le tri est positionne en DERNIER : la clause doit suivre tous les filtres,
     sinon la requete est rejetee. La liste des tris est fermee, la colonne
     n'est donc jamais concatenee depuis l'exterieur. */
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
     /* Agent responsable : la fiche doit afficher son nom. Sans cette jointure,
        la liste des dossiers le montrait mais la fiche affiche « — », et rien
        n'explique pourquoi un agent affecté disparaît sur la page du dossier. */
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
  const statutNouveau = rows[0].id;
  const result = await db.query(
    `INSERT INTO dossiers
     (numero, type_id, objet, demandeur, matricule, date_reception, date_limite,
      division_id, priorite_id, statut_id, observation, created_by,
      demandeur_nom, demandeur_prenom, demandeur_tel, demandeur_email, demandeur_adresse)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [numero, type_id, objet, demandeur, matricule ?? null, date_reception,
     date_limite ?? null, division_id, priorite_id, statutNouveau,
     observation ?? null, created_by,
     demandeur_nom || null, demandeur_prenom || null, demandeur_tel || null,
     demandeur_email || null, demandeur_adresse || null]
  );
  return { id: result.insertId, numero };
}

/**
 * Met à jour un dossier.
 *
 * Les colonnes d'identité (nom, prénom, téléphone, email, adresse) sont
 * enregistrées ici aussi. Elles ne l'étaient pas : le formulaire de
 * modification les affichait et la sauvegarde les perdait, si bien qu'une
 * correction d'un champ annexe effaçait silencieusement les coordonnées du
 * demandeur.
 *
 * Chaque paramètre non transmis devient explicitement NULL. Une valeur
 * `undefined` fait échouer mysql2 (« Bind parameters must not contain
 * undefined ») : le champ laissé vide par un formulaire devient, selon le
 * champ, soit un null qui vide la donnée, soit une erreur 500.
 */
export async function updateDossier(id, data) {
  const {
    type_id, objet, demandeur, matricule, division_id, priorite_id, observation,
    demandeur_nom, demandeur_prenom, demandeur_tel, demandeur_email, demandeur_adresse,
  } = data;
  await db.query(
    `UPDATE dossiers
     SET type_id = ?, objet = ?, demandeur = ?, matricule = ?,
         division_id = ?, priorite_id = ?, observation = ?,
         demandeur_nom = ?, demandeur_prenom = ?, demandeur_tel = ?,
         demandeur_email = ?, demandeur_adresse = ?
     WHERE id = ?`,
    [
      type_id ?? null,
      objet ?? null,
      demandeur ?? null,
      matricule || null,
      division_id || null,
      priorite_id ?? null,
      observation || null,
      demandeur_nom || null,
      demandeur_prenom || null,
      demandeur_tel || null,
      demandeur_email || null,
      demandeur_adresse || null,
      id,
    ]
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