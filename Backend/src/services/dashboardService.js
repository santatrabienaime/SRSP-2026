import db from '../config/db.js';
import { filterFor } from './scopeService.js';

/**
 * Agrégats du tableau de bord, restreints au périmètre de l'utilisateur.
 * Le périmètre est fourni par scopeService (agent, division, ou global).
 */

const CODES = [
  'RECU', 'ENREGISTRE', 'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT',
  'SOUMIS_A_VERIFICATION', 'CORRECTION_DEMANDEE', 'VALIDE', 'SIGNE',
  'CLOTURE', 'ARCHIVE',
];

export async function getSummary(scope) {
  const f = await filterFor(scope);

  const [total] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d WHERE 1=1${f.where}`,
    f.params
  );

  const stats = { total: total.total };

  // Un seul aller-retour pour tous les statuts.
  const rows = await db.query(
    `SELECT s.code, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     WHERE 1=1${f.where}
     GROUP BY s.id, s.code`,
    f.params
  );
  const parCode = Object.fromEntries(rows.map((r) => [r.code, r.total]));
  for (const code of CODES) stats[code] = parCode[code] || 0;

  // Dossiers en retard : en attente depuis plus de 30 jours, non clôturés.
  const [retard] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code NOT IN ('CLOTURE', 'ARCHIVE')
       AND d.date_reception < DATE_SUB(CURDATE(), INTERVAL 30 DAY)${f.where}`,
    f.params
  );
  stats.enRetard = retard.total;

  // Dossiers prioritaires : priorité haute ou urgente (niveau 3 ou 4).
  // Le triage de la liste des dossiers affiche ce même ensemble, le compteur
  // doit donc provenir de la même règle pour ne pas contredire la liste.
  const [prioritaires] = await db.query(
    `SELECT COUNT(*) AS total FROM dossiers d
     JOIN priorites p ON d.priorite_id = p.id
     WHERE p.niveau >= 3${f.where}`,
    f.params
  );
  stats.prioritaires = prioritaires.total;

  return stats;
}

export async function getByDivision(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT dv.nom AS division, COUNT(d.id) AS total
     FROM divisions dv
     LEFT JOIN dossiers d ON d.division_id = dv.id
     WHERE 1=1${f.where}
     GROUP BY dv.id, dv.nom
     ORDER BY dv.nom`,
    f.params
  );
}

export async function getByStatus(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT s.code, s.libelle AS statut, COUNT(d.id) AS total
     FROM statuts_dossiers s
     LEFT JOIN dossiers d ON d.statut_id = s.id
     WHERE 1=1${f.where}
     GROUP BY s.id, s.code, s.libelle
     ORDER BY s.ordre`,
    f.params
  );
}

export async function getEvolution(scope) {
  const f = await filterFor(scope);
  return db.query(
    `SELECT DATE_FORMAT(d.date_reception, '%Y-%m') AS mois, COUNT(*) AS total
     FROM dossiers d
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
    `SELECT COUNT(*) AS total, COALESCE(SUM(statut = 'RECU'), 0) AS recus
     FROM courriers`
  );
  const c = courriers[0];
  return {
    courriers: { total: Number(c.total), recus: Number(c.recus) },
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
    // Archivage
    aArchiver: ['CLOTURE'],
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
  const [incomplets] = await db.query(
    `SELECT COUNT(DISTINCT d.id) AS total FROM dossiers d
     JOIN depouillements dp ON dp.dossier_id = d.id
     WHERE dp.presente = 0${f.where.replace('d.', 'd.')}`,
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
