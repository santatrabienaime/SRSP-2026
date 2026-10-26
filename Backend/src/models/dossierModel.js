import db from '../config/db.js';
import { generateDossierNumber } from '../utils/generateDossierNumber.js';
import { normaliserMatricule } from '../validators/dossierValidators.js';
import { LIBELLES_ACTIONS } from '../utils/libellesActions.js';
import { ETATS_PIECE_VALIDES_SQL } from '../utils/constants.js';

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
     WHERE REPLACE(REPLACE(REPLACE(COALESCE(d.matricule, ''), ' ', ''), '-', ''), '.', '') = ?
     ORDER BY d.date_reception DESC, d.id DESC
     LIMIT 50`,
    [compact]
  );
}

const STATUTS = [
  'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'EN_ATTENTE_COMPLEMENT', 'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE',
  'VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE',
];

export async function findDossiers(filters = {}) {
  let query = `
    SELECT d.id, d.numero, d.reference_visa, d.objet, d.demandeur, d.matricule,
           d.date_reception, d.date_heure_reception, d.sous_type_id,
           d.type_acte, d.annee_reference, d.verificateur_id,
           d.beneficiaire, d.organisme,
           d.demandeur_nom, d.demandeur_prenom, d.demandeur_tel,
           d.demandeur_email, d.demandeur_adresse,
           d.observation, d.date_limite, d.date_cloture, d.date_archivage, d.created_at,
           d.agent_responsable_id, d.priorite_id, p.niveau AS priorite_niveau,
           (CURRENT_DATE - d.date_reception::date) AS age_jours,
           t.libelle AS type_libelle, t.code AS type_code,
           st.libelle AS sous_type_libelle,
           s.libelle AS statut_libelle, s.code AS statut_code,
           dv.nom AS division_nom, p.libelle AS priorite_libelle,
           a.nom AS agent_nom, a.prenom AS agent_prenom,
           v.nom AS verificateur_nom, v.prenom AS verificateur_prenom,
           /* Dernier acte du dossier : il dit où le dossier circule
              aujourd'hui. Une sous-requête latérale par dossier coûte moins
              qu'une seconde requête par ligne. */
           dm.date_action AS dernier_mouvement,
           dm.action AS derniere_action
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     LEFT JOIN sous_types_dossiers st ON st.id = d.sous_type_id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN priorites p ON d.priorite_id = p.id
     LEFT JOIN agents a ON d.agent_responsable_id = a.id
     LEFT JOIN agents v ON v.id = d.verificateur_id
     LEFT JOIN LATERAL (
       SELECT h.date_action, h.action
         FROM historique_actions h
        WHERE h.dossier_id = d.id
        ORDER BY h.date_action DESC, h.id DESC
        LIMIT 1
     ) dm ON true
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
        'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT', 'EN_ATTENTE_COMPLEMENT',
        'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE',
      ],
      EN_ATTENTE_COMPLEMENT: ['EN_ATTENTE_COMPLEMENT'],
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
  if (filters.sous_type_id) {
    query += ' AND d.sous_type_id = ?';
    params.push(filters.sous_type_id);
  }
  if (filters.reference) {
    query += ' AND (d.numero LIKE ? OR d.reference_visa LIKE ?)';
    const ref = `%${filters.reference}%`;
    params.push(ref, ref);
  }
  if (filters.annee_reference) {
    query += ' AND d.annee_reference = ?';
    params.push(filters.annee_reference);
  }
  if (filters.verificateur_id) {
    query += ' AND d.verificateur_id = ?';
    params.push(filters.verificateur_id);
  }
  if (filters.priorite_id) {
    query += ' AND d.priorite_id = ?';
    params.push(filters.priorite_id);
  }
  /* Le niveau de priorité (4 = URGENTE, 1 = BASSE) est un filtre à part
     entière : un chef de division peut vouloir ne voir que les urgents, sans
     trier. */
  if (filters.niveau) {
    const niveau = Number(filters.niveau);
    if (Number.isInteger(niveau) && niveau > 0) {
      query += ' AND p.niveau = ?';
      params.push(niveau);
    }
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
    /* Une pièce obligatoire de dépouillement est incomplète si elle n'a pas été
       contrôlée « présente » : absente du dépouillement, manquante, illisible ou
       à corriger. L'ancienne requête ne regardait que les lignes existantes et
       laissait donc passer les pièces jamais contrôlées. */
    query += ` AND EXISTS (
      SELECT 1 FROM types_pieces tp
      WHERE tp.obligatoire = 1
        AND tp.actif = 1
        AND tp.phase = 'DEPOUILLEMENT'
        AND (tp.type_dossier_id IS NULL OR tp.type_dossier_id = d.type_id)
        AND (tp.sous_type_id IS NULL OR tp.sous_type_id = d.sous_type_id)
        AND NOT EXISTS (
          SELECT 1 FROM depouillements dp
          WHERE dp.dossier_id = d.id AND dp.piece = tp.code
            AND dp.etat IN (${ETATS_PIECE_VALIDES_SQL})
        )
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
    query += ` AND (d.numero LIKE ? OR d.reference_visa LIKE ? OR d.objet LIKE ? OR d.demandeur LIKE ?
                        OR d.demandeur_nom LIKE ? OR d.demandeur_prenom LIKE ?
                        OR d.beneficiaire LIKE ? OR d.organisme LIKE ?
                        OR d.matricule LIKE ?)`;
    const s = `%${filters.search}%`;
    params.push(s, s, s, s, s, s, s, s, s);
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
    /* Classer par statut : l'ordre du circuit (statuts_dossiers.ordre), pas
       l'ordre alphabétique des libellés. Un agent qui trie par statut voit
       d'abord ce qui doit être repris, puis ce qui attend une décision, puis
       ce qui est terminé. */
    statut: 's.ordre ASC, p.niveau DESC, d.date_reception ASC, d.id ASC',
    statut_desc: 's.ordre DESC, p.niveau DESC, d.date_reception ASC, d.id ASC',
    /* Classer par type de dossier : la file d'une division se lit alors par
       nature de demande. */
    type: 't.libelle ASC, s.ordre ASC, d.id ASC',
    /* Classer par priorité : la file se lit du plus urgent au moins urgent. */
    priorite: 'p.niveau DESC, s.ordre ASC, d.date_reception ASC, d.id ASC',
    /* Classer par NIVEAU seul : l'urgence d'abord, puis l'ancienneté. Le
       niveau vient du référentiel (URGENTE = 4, BASSE = 1) : un tri
       décroissant place donc les urgents en tête. `niveau_asc` fait
       l'inverse, pour relire une file du moins prioritaire au plus urgent. */
    niveau: 'p.niveau DESC, d.date_reception ASC, d.id ASC',
    niveau_asc: 'p.niveau ASC, d.date_reception ASC, d.id ASC',
    /* Classer par demandeur : utile au service de la secrétaire, qui saisit
       beaucoup de demandes pour une même personne. */
    demandeur: 'd.demandeur_nom ASC, d.demandeur_prenom ASC, d.id ASC',
    /* Les dossiers signalés d'abord : ils attendent une décision de la
       hiérarchie et n'avancent pas tout seuls. Un signalement traité
       (résolu ou rejeté) ne les retarde plus. */
    signalement:
      `(EXISTS (SELECT 1 FROM signalements_dossier sg
                 WHERE sg.dossier_id = d.id
                   AND sg.statut IN ('OUVERT', 'EN_COURS'))) DESC, ` +
      'p.niveau DESC, s.ordre ASC, d.date_reception ASC, d.id ASC',
  };
  if (filters.recus_depuis_jours) {
    const jours = Number(filters.recus_depuis_jours);
    if (Number.isInteger(jours) && jours > 0) {
      query += ' AND d.date_reception >= CURRENT_DATE - make_interval(days => ?)';
      params.push(jours);
    }
  }

  /* Brouillons.
     *
     * Un brouillon n'est pas dans le circuit : il ne doit apparaître ni dans
     * les files d'attente, ni dans les tableaux de bord, ni dans les
     * statistiques. Il est réservé à son auteur, qui le retrouve dans
     * « Mes brouillons » pour le terminer.
     *
     * Le filtre est donc appliqué par défaut (on exclut les brouillons) et
     * inverti quand la liste demande explicitement les brouillons — auquel
     * cas il est restreint à l'auteur demandé. */
  const statutDemande = String(filters.statut || '').toUpperCase();
  if (filters.brouillon || statutDemande.includes('BROUILLON')) {
    query += ' AND s.code = ? AND d.created_by = ?';
    params.push('BROUILLON', filters.auteur_id || 0);
  } else {
    query += ' AND s.code <> ?';
    params.push('BROUILLON');
  }
  /* Le tri est positionné en DERNIER : la clause doit suivre tous les filtres,
     sinon la requête est rejetée. La liste des tris est fermée, la colonne
     n'est donc jamais concaténée depuis l'extérieur. */
  query += ` ORDER BY ${TRIS[filters.tri] || TRIS.prioritaire}`;
  const lignes = await db.query(query, params);

  /* Le dernier acte est stocké en code technique (VALIDATION) : le frontend
     n'a pas à connaître ce vocabulaire. On le traduit ici, une fois, comme le
     fait déjà le journal des actions. */
  return lignes.map((ligne) => ({
    ...ligne,
    derniere_action_libelle: ligne.derniere_action
      ? (LIBELLES_ACTIONS[ligne.derniere_action] || ligne.derniere_action)
      : null,
  }));
}

export async function findDossierById(id) {
  const rows = await db.query(
    `SELECT d.*, t.code AS type_code, t.libelle AS type_libelle,
            st.libelle AS sous_type_libelle,
            s.libelle AS statut_libelle, s.code AS statut_code,
            dv.nom AS division_nom, dv.code AS division_code, p.libelle AS priorite_libelle,
            a.nom AS agent_nom, a.prenom AS agent_prenom,
            v.nom AS verificateur_nom, v.prenom AS verificateur_prenom,
            u.username AS signataire_username,
            ar.reference_archivage, ar.emplacement_physique, ar.localisation_numerique,
            ar.date_archivage AS date_archivage_registre, ar.restaure AS archive_restaure,
            au.username AS archive_par_username,
            (CURRENT_DATE - d.date_reception::date) AS age_jours
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     LEFT JOIN sous_types_dossiers st ON st.id = d.sous_type_id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN priorites p ON d.priorite_id = p.id
     LEFT JOIN agents a ON a.id = d.agent_responsable_id
     LEFT JOIN agents v ON v.id = d.verificateur_id
     LEFT JOIN users u ON u.id = d.signataire_id
     LEFT JOIN archives ar ON ar.dossier_id = d.id AND ar.restaure = 0
     LEFT JOIN users au ON au.id = ar.archive_par
     WHERE d.id = ?`,
    [id]
  );
  return rows[0];
}

export async function createDossier(data) {
  const {
    type_id, sous_type_id, objet, demandeur, matricule, date_reception, date_limite,
    division_id, priorite_id, observation, created_by,
    demandeur_nom, demandeur_prenom, demandeur_tel,
    demandeur_email, demandeur_adresse,
    date_heure_reception, origine_presentateur, comptable_presentateur,
    type_acte, annee_reference, reference_visa, verificateur_id,
    beneficiaire, organisme,
  } = data;

  const numero = await generateDossierNumber(type_id);

  /* La référence VISA est unique. Le numéro de dossier en est une : il est
     déjà unique, lisible et stable. Pour les autres divisions, le champ reste
     vide plutôt que de dupliquer une information sans usage. */
  const [type] = await db.query('SELECT code FROM types_dossiers WHERE id = ?', [type_id]);
  const reference = reference_visa
    || (String(type?.code).toUpperCase() === 'VISA' ? numero : null);

  /* Le type d'acte découle du sous-type quand celui-ci est choisi. Le champ
     libre reste accepté pour les dossiers antérieurs ou les actes hors
     référentiel, mais il ne doit pas être ressaisi quand la liste suffit. */
  let typeActe = String(type_acte || '').trim() || null;
  if (!typeActe && sous_type_id) {
    const [sousType] = await db.query(
      'SELECT libelle FROM sous_types_dossiers WHERE id = ?',
      [sous_type_id]
    );
    typeActe = sousType?.libelle || null;
  }

  const rows = await db.query(
    `SELECT id FROM statuts_dossiers WHERE code = 'RECU'`
  );
  const statutId = rows[0]?.id;

  /* Le pilote refuse une valeur `undefined` : il faut `null` pour écrire NULL.
     Or tous les champs facultatifs peuvent être absents de la requête — un
     dossier créé sans matricule ni échéance plantait la création sur une
     erreur SQL, au lieu d'être enregistré avec des colonnes vides. On
     normalise donc une fois, ici, plutôt que de multiplier les `|| null`
     partout : le risque d'en oublier un est réel. */
  const nul = (v) => (v === undefined ? null : v);
  const vide = (v) => (v === null || v === undefined || String(v).trim() === '' ? null : v);

  /* `db.query` renvoie déjà le résultat de l'INSERT (un OkPacket) : il n'est
     pas déstructurable comme un jeu de lignes. */
  const result = await db.query(
    `INSERT INTO dossiers (numero, reference_visa, type_id, sous_type_id, objet, demandeur,
                           matricule, date_reception, date_heure_reception, date_limite,
                           division_id, priorite_id, observation, created_by,
                           demandeur_nom, demandeur_prenom, demandeur_tel,
                           demandeur_email, demandeur_adresse,
                           origine_presentateur, comptable_presentateur, type_acte,
                           annee_reference, beneficiaire, organisme, verificateur_id, statut_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      numero, reference, type_id, sous_type_id || null, objet, demandeur,
      vide(matricule), date_reception, date_heure_reception || new Date(), vide(date_limite),
      division_id, priorite_id, vide(observation), created_by,
      vide(demandeur_nom), vide(demandeur_prenom), vide(demandeur_tel),
      vide(demandeur_email), vide(demandeur_adresse),
      vide(origine_presentateur), vide(comptable_presentateur), typeActe,
      annee_reference || null, vide(beneficiaire), vide(organisme), verificateur_id || null, statutId,
    ]
  );
  return { id: result.insertId, numero, reference_visa: reference, type_acte: typeActe };
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
     WHERE REPLACE(REPLACE(REPLACE(COALESCE(matricule, ''), ' ', ''), '-', ''), '.', '') = ?`,
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
    'type_id', 'sous_type_id', 'objet', 'demandeur', 'matricule', 'date_reception',
    'date_heure_reception', 'date_limite', 'division_id', 'priorite_id', 'observation',
    'demandeur_nom', 'demandeur_prenom', 'demandeur_tel',
    'demandeur_email', 'demandeur_adresse',
    'origine_presentateur', 'comptable_presentateur', 'type_acte',
    'annee_reference', 'reference_visa', 'beneficiaire', 'organisme',
    'verificateur_id',
  ];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (sets.length === 0) return findDossierById(id);
  params.push(id);
  await db.query(`UPDATE dossiers SET ${sets.join(', ')} WHERE id = ?`, params);
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

/**
 * Met un dossier en brouillon.
 *
 * Un brouillon reste dans la numérotation — la référence interne ne doit
 * jamais être réutilisée — mais il quitte le circuit : ni notification, ni
 * orientation, ni apparition dans les files.
 */
export async function setStatutBrouillon(id) {
  const rows = await db.query(`SELECT id FROM statuts_dossiers WHERE code = ?`, ['BROUILLON']);
  if (!rows[0]) throw new Error('Statut inconnu: BROUILLON');
  await db.query(`UPDATE dossiers SET statut_id = ? WHERE id = ?`, [rows[0].id, id]);
  return findDossierById(id);
}

/* ── Mutations utilisées par le workflow et le module VISA ───────────── */

export async function findDivisionOfDossier(id) {
  const rows = await db.query(
    `SELECT division_id, agent_responsable_id FROM dossiers WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Comptes_users concernés par un dossier, pour le canal temps réel.
 *
 * Ce sont les personnes dont l'écran de travail peut changer du fait de ce
 * dossier : l'agent qui le traite, le chef de sa division, les autres agents
 * de cette division, et le chef de service qui suit le dossier jusqu'à la
 * signature.
 *
 * La liste est calculée en base et non reconstituée par l'appelant : c'est
 * la seule façon d'atteindre tous les agents d'une division sans les
 * énumérer en JavaScript.
 */
export async function utilisateursConcernes(dossierId) {
  const rows = await db.query(
    `SELECT DISTINCT u.id
     FROM dossiers d
     JOIN agents a ON a.division_id = d.division_id
     JOIN users u ON u.id = a.user_id AND u.actif = 1
     WHERE d.id = ?
     UNION
     SELECT u2.id
     FROM users u2
     JOIN roles r ON r.id = u2.role_id
     WHERE r.nom = 'CHEF_SERVICE' AND u2.actif = 1`,
    [dossierId]
  );
  return rows.map((r) => r.id);
}

export async function setDivision(id, divisionId) {
  await db.query(`UPDATE dossiers SET division_id = ? WHERE id = ?`, [divisionId, id]);
}

export async function setAgentResponsable(id, agentId) {
  await db.query(`UPDATE dossiers SET agent_responsable_id = ? WHERE id = ?`, [agentId, id]);
  /* Pour un dossier VISA, le vérificateur est l'agent qui exploite le dossier.
     On le conserve séparément : l'affectation peut changer sans effacer la
     trace du vérificateur qui a instruit le dossier. */
  await db.query(
    `UPDATE dossiers d
     SET verificateur_id = COALESCE(d.verificateur_id, ?)
     FROM types_dossiers t
     WHERE t.id = d.type_id AND d.id = ? AND t.code = 'VISA'`,
    [agentId, id]
  );
}

export async function cloturer(id) {
  await db.query(`UPDATE dossiers SET date_cloture = CURDATE() WHERE id = ?`, [id]);
}

export async function archiver(id) {
  await db.query(`UPDATE dossiers SET date_archivage = CURDATE() WHERE id = ?`, [id]);
}

export async function setSignature(id, { signataireId, reference }) {
  await db.query(
    `UPDATE dossiers
     SET date_signature = NOW(), signataire_id = ?, reference_signature = ?
     WHERE id = ?`,
    [signataireId, reference || null, id]
  );
}

export async function setExceptionValidation(id, { motif, userId }) {
  await db.query(
    `UPDATE dossiers
     SET exception_validation = ?, exception_autorisee_par = ?, date_exception = NOW()
     WHERE id = ?`,
    [motif, userId, id]
  );
}

export async function setComplement(id, motif) {
  await db.query(`UPDATE dossiers SET motif_complement = ? WHERE id = ?`, [motif, id]);
}

export async function clearComplement(id) {
  await db.query(`UPDATE dossiers SET motif_complement = NULL WHERE id = ?`, [id]);
}
