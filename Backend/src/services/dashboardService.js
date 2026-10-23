import db from '../config/db.js';
import {
  filterFor, perimetrePour, HORS_STATUT_BROUILLON,
} from './scopeService.js';

/**
 * Agrégats du tableau de bord, restreints au périmètre de l'utilisateur.
 * Le périmètre est fourni par scopeService (agent, division, ou global).
 */

const CODES = [
  'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'EN_ATTENTE_COMPLEMENT', 'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE',
  'VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE',
];

/** Condition SQL d'incomplétude : une pièce obligatoire non « présente ». */
const CONDITION_INCOMPLET = `EXISTS (
  SELECT 1 FROM types_pieces tp
  WHERE tp.obligatoire = 1
    AND tp.phase = 'DEPOUILLEMENT'
    AND (tp.type_dossier_id IS NULL OR tp.type_dossier_id = d.type_id)
    AND (tp.sous_type_id IS NULL OR tp.sous_type_id = d.sous_type_id)
    AND NOT EXISTS (
      SELECT 1 FROM depouillements dp
      WHERE dp.dossier_id = d.id AND dp.piece = tp.code AND dp.etat = 'PRESENTE'
    )
)`;

/**
 * Condition « à traiter par moi », adaptée au rôle.
 *
 * Pour un agent, c'est le travail affecté qui n'est pas terminé. Pour un chef
 * de division, ce sont les dossiers soumis à sa vérification ; pour le chef de
 * service, ceux qui attendent sa signature ; pour le secrétariat, les dossiers
 * à enregistrer ou orienter. Le tableau de bord ne doit pas appeler « à traiter
 * par moi » une file que l'utilisateur ne peut pas traiter.
 */
function conditionATraiter(scope) {
  if (scope.agentScoped && scope.agentId) {
    return {
      where: ` AND d.agent_responsable_id = ?
               AND s.code IN ('AFFECTE', 'EN_TRAITEMENT', 'CORRECTION_DEMANDEE')`,
      params: [scope.agentId],
    };
  }
  if (scope.roleNom === 'CHEF_SERVICE') {
    return { where: ` AND s.code = 'VALIDE'`, params: [] };
  }
  if (scope.roleNom?.startsWith('CHEF_DIVISION_')) {
    return { where: ` AND s.code = 'SOUMIS_A_VERIFICATION'`, params: [] };
  }
  if (scope.roleNom === 'SECRETAIRE') {
    return {
      where: ` AND s.code IN ('RECU', 'ENREGISTRE', 'ORIENTE')`,
      params: [],
    };
  }
  if (scope.agentId) {
    return {
      where: ` AND d.agent_responsable_id = ?
               AND s.code NOT IN ('CLOTURE', 'ARCHIVE')`,
      params: [scope.agentId],
    };
  }
  return { where: ` AND s.code NOT IN ('CLOTURE', 'ARCHIVE')`, params: [] };
}

export async function getSummary(scope) {
  const f = await filterFor(scope);

  const [total] = await db.query(
    `SELECT COUNT(*) AS total
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE 1=1${f.where}`,
    f.params
  );

  const stats = { total: total.total };

  /* Un seul aller-retour pour tous les statuts.
     La répartition porte sur des **statuts** : c'est le pseudo-statut
     BROUILLON qu'on retire de la liste, et non les dossiers qu'il contient.
     Les statuts sans dossier restent listés, avec un total nul — le
     tableau doit montrer le circuit complet, pas seulement ce qui est
     occupé aujourd'hui. */
  const perimetre = await perimetrePour(scope);
  const rows = await db.query(
    `SELECT s.code, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     WHERE 1=1${perimetre.where}${HORS_STATUT_BROUILLON}
     GROUP BY s.id, s.code`,
    perimetre.params
  );
  const parCode = Object.fromEntries(rows.map((r) => [r.code, r.total]));
  for (const code of CODES) stats[code] = parCode[code] || 0;

  /* Ancienneté des dossiers ouverts, en tranches. Le cahier des charges ne
     valide pas de délai : on affiche l'âge réel, on ne qualifie pas
     arbitrairement un dossier de « en retard ». */
  const [ages] = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE DATEDIFF(CURRENT_DATE, d.date_reception) < 7) AS moins_7,
       COUNT(*) FILTER (WHERE DATEDIFF(CURRENT_DATE, d.date_reception) BETWEEN 7 AND 30) AS de_7_a_30,
       COUNT(*) FILTER (WHERE DATEDIFF(CURRENT_DATE, d.date_reception) BETWEEN 31 AND 90) AS de_31_a_90,
       COUNT(*) FILTER (WHERE DATEDIFF(CURRENT_DATE, d.date_reception) > 90) AS plus_90,
       COALESCE(ROUND(AVG(DATEDIFF(CURRENT_DATE, d.date_reception))), 0) AS age_moyen
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code NOT IN ('CLOTURE', 'ARCHIVE')${f.where}`,
    f.params
  );
  stats.anciennete = {
    moins_7_jours: Number(ages.moins_7),
    de_7_a_30_jours: Number(ages.de_7_a_30),
    de_31_a_90_jours: Number(ages.de_31_a_90),
    plus_90_jours: Number(ages.plus_90),
    age_moyen_jours: Number(ages.age_moyen),
  };
  // Conservé pour les anciens écrans ; il désigne désormais la tranche > 30 j.
  stats.enRetard = stats.anciennete.de_31_a_90_jours + stats.anciennete.plus_90_jours;

  const [incomplets] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code NOT IN ('CLOTURE', 'ARCHIVE')
       AND ${CONDITION_INCOMPLET}${f.where}`,
    f.params
  );
  stats.incomplets = Number(incomplets.total);

  const [cloturesRecents] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code IN ('CLOTURE', 'ARCHIVE')
       AND COALESCE(d.date_cloture, d.date_archivage, d.updated_at)
           >= CURRENT_DATE - INTERVAL '30 days'${f.where}`,
    f.params
  );
  stats.cloturesRecents = Number(cloturesRecents.total);

  const aTraiter = conditionATraiter(scope);
  const [aTraiterParMoi] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE 1=1${f.where}${aTraiter.where}`,
    [...f.params, ...aTraiter.params]
  );
  stats.aTraiterParMoi = Number(aTraiterParMoi.total);

  // Dossiers prioritaires : priorité haute ou urgente (niveau 3 ou 4).
  // Le triage de la liste des dossiers affiche ce même ensemble, le compteur
  // doit donc provenir de la même règle pour ne pas contredire la liste.
  const [prioritaires] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN priorites p ON d.priorite_id = p.id
     WHERE p.niveau >= 3${f.where}`,
    f.params
  );
  stats.prioritaires = prioritaires.total;

  /* Répartition par type de dossier.
   *
   * Le secrétariat instruit les quatre types : ses onglets sont les types,
   * et le compteur de chaque onglet doit dire exactement ce que la liste
   * montrera. Le calcul est fait sur le même périmètre et avec la même
   * exclusion des brouillons que la répartition par statut — les deux cartes
   * ne doivent pas se contredire. */
  const parType = await db.query(
    `SELECT t.code AS type_code, t.libelle AS type_libelle, COUNT(d.id) AS total
       FROM types_dossiers t
       LEFT JOIN dossiers d
         ON d.type_id = t.id
        AND d.statut_id <> COALESCE(
              (SELECT id FROM statuts_dossiers WHERE code = 'BROUILLON'), -1)
        ${perimetre.where}
      GROUP BY t.id, t.code, t.libelle
      ORDER BY t.libelle`,
    perimetre.params
  );
  stats.par_type = parType.map((r) => ({
    type_code: r.type_code,
    type_libelle: r.type_libelle,
    total: Number(r.total),
  }));

  return stats;
}

export async function getByDivision(scope) {
  /* Cette requête part des **divisions** et joint les dossiers à gauche :
     une division sans dossier doit rester visible, avec un total nul. La
     règle « hors brouillons » est donc appliquée dans la clause ON — sinon
     elle filtrerait la division entière, et le tableau mentirait sur
     l'existence d'une division sans aucun dossier.

     C'est pour cela que la règle est exprimée sur `d.statut_id` et non sur un
     alias de table : elle s'applique aussi bien ici, dans la clause ON, que
     dans les requêtes qui comptent les dossiers, dans la clause WHERE. */
  const f = await perimetrePour(scope);
  return db.query(
    `SELECT dv.nom AS division, COUNT(d.id) AS total
     FROM divisions dv
     LEFT JOIN dossiers d
       ON d.division_id = dv.id
      AND d.statut_id <> COALESCE(
            (SELECT id FROM statuts_dossiers WHERE code = 'BROUILLON'), -1)
     WHERE 1=1${f.where}
     GROUP BY dv.id, dv.nom
     ORDER BY dv.nom`,
    f.params
  );
}

export async function getByStatus(scope) {
  /* Comme le compteur de statuts du résumé : on liste des statuts, donc on
     retire le pseudo-statut BROUILLON, et les statuts sans dossier restent
     listés avec un total nul. */
  const perimetre = await perimetrePour(scope);
  return db.query(
    `SELECT s.code, s.libelle AS statut, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     WHERE 1=1${perimetre.where}${HORS_STATUT_BROUILLON}
     GROUP BY s.id, s.code, s.libelle
     ORDER BY s.ordre`,
    perimetre.params
  );
}

export async function getEvolution(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT TO_CHAR(d.date_reception, 'YYYY-MM') AS mois, COUNT(*) AS total
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE 1=1${f.where}
     GROUP BY mois
     ORDER BY mois ASC
     LIMIT 12`,
    f.params
  );
}

/**
 * Comptes transverses des tableaux de bord hors périmètre dossier
 * (courriers) : ensembles ouverts au service entier,
 * deux requêtes COUNT suffisent, et le résultat n'a rien de sensible —
 * les listes elles-mêmes restent protégées par leurs permissions.
 */
export async function getRessources() {
  const courriers = await db.query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE statut = 'RECU') AS recus
     FROM courriers`
  );
  const c = courriers[0];
  return {
    courriers: { total: Number(c.total), recus: Number(c.recus) },
  };
}

/**
 * Boîte de travail : les quatre files que le tableau de bord doit montrer.
 *
 * « À traiter par moi », « En attente de validation », « Incomplets » et
 * « Clôturés récemment » sont calculés dans le périmètre de l'utilisateur, avec
 * un aperçu des dossiers concernés et un total. Les liens de l'interface
 * renvoient vers la liste filtrée correspondante.
 */
const SELECT_BOITE = `
  SELECT d.id, d.numero, d.reference_visa, d.objet, d.demandeur,
         d.date_reception, d.date_heure_reception, d.date_limite,
         DATEDIFF(CURDATE(), DATE(d.date_reception)) AS age_jours,
         t.code AS type_code, t.libelle AS type_libelle,
         s.code AS statut_code, s.libelle AS statut_libelle, s.ordre AS statut_ordre,
         dv.nom AS division_nom,
         p.libelle AS priorite_libelle, p.niveau AS priorite_niveau,
         a.nom AS agent_nom, a.prenom AS agent_prenom
  FROM dossiers d
  JOIN types_dossiers t ON t.id = d.type_id
  JOIN statuts_dossiers s ON d.statut_id = s.id
  JOIN divisions dv ON dv.id = d.division_id
  JOIN priorites p ON p.id = d.priorite_id
  LEFT JOIN agents a ON a.id = d.agent_responsable_id
`;

/**
 * Tris de la boîte de travail.
 *
 * Même liste que la liste des dossiers : un ordre d'affichage, jamais une
 * règle. La colonne est choisie par liste blanche, jamais concaténée depuis
 * l'extérieur. L'ordre par défaut reste « à traiter en premier ».
 */
const TRIS_BOITE = {
  prioritaire:
    'p.niveau DESC, ' +
    '(CASE WHEN d.date_limite IS NULL THEN 1 ELSE 0 END) ASC, ' +
    'd.date_limite ASC, d.date_reception ASC, d.id ASC',
  statut: 's.ordre ASC, p.niveau DESC, d.date_reception ASC, d.id ASC',
  statut_desc: 's.ordre DESC, p.niveau DESC, d.date_reception ASC, d.id ASC',
  echeance:
    '(CASE WHEN d.date_limite IS NULL THEN 1 ELSE 0 END) ASC, d.date_limite ASC, d.id ASC',
  priorite: 'p.niveau DESC, s.ordre ASC, d.date_reception ASC, d.id ASC',
  niveau: 'p.niveau DESC, d.date_reception ASC, d.id ASC',
  niveau_asc: 'p.niveau ASC, d.date_reception ASC, d.id ASC',
  ancien: 'd.date_reception ASC, d.id ASC',
  recent: 'd.date_reception DESC, d.id DESC',
  numero: 'd.numero ASC',
  type: 't.libelle ASC, s.ordre ASC, d.id ASC',
  division: 'dv.nom ASC, p.niveau DESC, d.id ASC',
  agent: '(a.nom IS NULL) ASC, a.nom ASC, p.niveau DESC, d.id ASC',
  demandeur: 'd.demandeur ASC, d.id ASC',
};

async function fileDossiers(scope, condition, params, limit = 8, tri = 'prioritaire') {
  const f = await filterFor(scope);
  const dossiers = await db.query(
    `${SELECT_BOITE}
     WHERE 1=1${f.where}${condition}
     ORDER BY ${TRIS_BOITE[tri] || TRIS_BOITE.prioritaire}
     LIMIT ?`,
    [...f.params, ...params, Number(limit)]
  );
  const [total] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE 1=1${f.where}${condition}`,
    [...f.params, ...params]
  );
  return { total: Number(total.total), dossiers };
}

export async function getBoiteTravail(scope, tri = 'prioritaire') {
  const aTraiter = conditionATraiter(scope);
  const ordre = TRIS_BOITE[tri] ? tri : 'prioritaire';

  const [aTraiterParMoi, enAttenteValidation, incomplets, cloturesRecents] =
    await Promise.all([
      fileDossiers(scope, aTraiter.where, aTraiter.params, 8, ordre),
      fileDossiers(scope, ` AND s.code = 'SOUMIS_A_VERIFICATION'`, [], 8, ordre),
      fileDossiers(
        scope,
        ` AND s.code NOT IN ('CLOTURE', 'ARCHIVE') AND ${CONDITION_INCOMPLET}`,
        [],
        8,
        ordre
      ),
      fileDossiers(
        scope,
        ` AND s.code IN ('CLOTURE', 'ARCHIVE')
          AND COALESCE(d.date_cloture, d.date_archivage, d.updated_at)
              >= CURRENT_DATE - INTERVAL '30 days'`,
        [],
        8,
        ordre
      ),
    ]);

  const f = await filterFor(scope);
  const [lignesCategories, parStatut] = await Promise.all([
    db.query(
      `SELECT t.code AS type_code, t.libelle AS type_libelle,
              s.code AS statut_code, COUNT(*) AS total
       FROM dossiers d
       JOIN types_dossiers t ON t.id = d.type_id
       JOIN statuts_dossiers s ON d.statut_id = s.id
       WHERE 1=1${f.where}
       GROUP BY t.id, t.code, t.libelle, s.id, s.code, s.ordre
       ORDER BY t.libelle, s.ordre`,
      f.params
    ),
    getByStatus(scope),
  ]);

  const categories = [];
  for (const ligne of lignesCategories) {
    let categorie = categories.find((c) => c.type_code === ligne.type_code);
    if (!categorie) {
      categorie = {
        type_code: ligne.type_code,
        type_libelle: ligne.type_libelle,
        total: 0,
        statuts: {},
      };
      categories.push(categorie);
    }
    categorie.statuts[ligne.statut_code] = Number(ligne.total);
    categorie.total += Number(ligne.total);
  }

  return {
    a_traiter_par_moi: aTraiterParMoi,
    en_attente_validation: enAttenteValidation,
    incomplets,
    clotures_recents: cloturesRecents,
    par_categorie: categories,
    par_statut: parStatut,
  };
}

/**
 * Files d'attente par rôle (écrans décrits dans le cahier des charges).
 * Les libellés sont construits pour être affichés tels quels.
 */
export async function getFilesAttente(scope) {
  const f = await filterFor(scope);

  const files = {
    // Secrétariat : à orienter
    aOrienter: ['ENREGISTRE', 'ORIENTE'],
    // Chef de division : à affecter
    aAffecter: ['ENREGISTRE', 'ORIENTE'],
    // Agent : à prendre en charge
    aTraiter: ['AFFECTE'],
    // Agent : en cours
    enCours: ['EN_TRAITEMENT'],
    // Dossier bloqué par une pièce ou une information à rapporter
    enAttenteComplement: ['EN_ATTENTE_COMPLEMENT'],
    // Agent / chef : retours à corriger
    aCorriger: ['CORRECTION_DEMANDEE'],
    // Chef de division : contrôle
    aVerifier: ['SOUMIS_A_VERIFICATION'],
    // Chef de service : validation
    aValider: ['SOUMIS_A_VERIFICATION'],
    // Chef de service : signature
    aSigner: ['VALIDE'],
    // Clôture
    aCloturer: ['SIGNE'],
    // Archivage après clôture
    aArchiver: ['CLOTURE'],
    // VISA : le dossier signé s'archive directement
    aArchiverSignes: ['SIGNE'],
    // Terminés
    termines: ['SIGNE', 'CLOTURE', 'ARCHIVE'],
  };

  const cles = Object.keys(files);
  const valeurs = files;

  const lignes = [];
  for (const cle of cles) {
    const codes = valeurs[cle];
    if (!codes.length) { lignes.push([cle, 0]); continue; }
    const placeholders = codes.map(() => '?').join(',');
    const [r] = await db.query(
      `SELECT COUNT(*) AS total FROM dossiers d
       JOIN statuts_dossiers s ON d.statut_id = s.id
       WHERE s.code IN (${placeholders})${f.where}`,
      [...codes, ...f.params]
    );
    lignes.push([cle, r.total]);
  }

  return Object.fromEntries(lignes);
}

/**
 * Indicateurs spécifiques au Secrétaire (cahier des charges §1).
 * Retourne un objet avec les 10 compteurs demandés.
 */
export async function getSecretaireKPIs(scope) {
  const f = await filterFor(scope);

  // 1. Total dossiers reçus (statut RECU)
  const [totalRecus] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'RECU'${f.where}`,
    f.params
  );

  // 2. Reçus aujourd'hui
  const [recusAujourdhui] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'RECU'
       AND DATE(d.date_reception) = CURDATE()${f.where}`,
    f.params
  );

  // 3. En attente d'enregistrement complet (RECU + ENREGISTRE non orientés)
  // Un dossier est "complètement enregistré" quand il a été orienté (ORIENTE+)
  const [attenteEnregistrement] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code IN ('RECU', 'ENREGISTRE')${f.where}`,
    f.params
  );

  // 4. À transmettre aux divisions (orientés mais pas encore transmis/affectés)
  // = ORIENTE (le secrétariat a orienté, mais pas encore transmis physiquement/bordereau)
  // On utilise aOrienter qui inclut ENREGISTRE+ORIENTE, mais pour "à transmettre" c'est ORIENTE
  const [aTransmettre] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'ORIENTE'${f.where}`,
    f.params
  );

  // 5. Dossiers incomplets (pièces manquantes au dépouillement)
  // Un dossier peut avoir plusieurs pièces dépouillées : on compte les
  // dossiers distincts, pas les pièces.
  const [incomplets] = await db.query(
    `SELECT COUNT(DISTINCT d.id) AS total FROM dossiers d
     JOIN depouillements dp ON dp.dossier_id = d.id
     WHERE dp.presente = 0${f.where}`,
    f.params
  );

  // 6. Retournés par les divisions (CORRECTION_DEMANDEE)
  const [retournes] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'CORRECTION_DEMANDEE'${f.where}`,
    f.params
  );

  // 7. Transmis dont la réception reste à confirmer
  // Dossiers ORIENTE qui ont un bordereau mais pas de confirmation
  // Pour l'instant, on approxime par ORIENTE sans bordereau (à affiner avec table bordereaux)
  const [transmisAttenteConfirmation] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'ORIENTE'${f.where}`,
    f.params
  );

  // 8. Clôturés en attente d'archivage
  const [cloturesAttenteArchivage] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'CLOTURE'${f.where}`,
    f.params
  );

  // 9. Notifications récentes non lues (pour le secrétaire connecté)
  // Note: scope contient userId
  let notificationsNonLues = 0;
  if (scope.userId) {
    const [notif] = await db.query(
      `SELECT COUNT(*) AS total FROM notifications
       WHERE user_id = ? AND lu = 0`,
      [scope.userId]
    );
    notificationsNonLues = notif.total;
  }

  // 10. Tâches prioritaires (dossiers priorité haute/urgente en attente d'action secrétaire)
  // = dossiers priorité >= 3 qui sont en RECU, ENREGISTRE ou ORIENTE
  const [tachesPrioritaires] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN priorites p ON d.priorite_id = p.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE p.niveau >= 3
       AND s.code IN ('RECU', 'ENREGISTRE', 'ORIENTE')${f.where}`,
    f.params
  );

  return {
    totalRecus: Number(totalRecus.total),
    recusAujourdhui: Number(recusAujourdhui.total),
    attenteEnregistrementComplet: Number(attenteEnregistrement.total),
    aTransmettreDivisions: Number(aTransmettre.total),
    incomplets: Number(incomplets.total),
    retournesDivisions: Number(retournes.total),
    transmisAttenteConfirmation: Number(transmisAttenteConfirmation.total),
    cloturesAttenteArchivage: Number(cloturesAttenteArchivage.total),
    notificationsNonLues,
    tachesPrioritaires: Number(tachesPrioritaires.total),
  };
}
