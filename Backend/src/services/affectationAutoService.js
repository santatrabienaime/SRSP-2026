import db from '../config/db.js';

/**
 * Affectation automatique d'un dossier à un agent de sa division.
 *
 * Le principe : un dossier orienté vers une division doit arriver chez quelqu'un
 * sans qu'un chef de division ait à le prendre un par un dans un menu.
 *
 * La règle n'est PAS inventée, elle se déduit des données existantes :
 *
 *   1. l'agent doit être ACTIF et rattaché à la division du dossier ;
 *   2. son rôle doit porter la permission `traiter_dossier`.
 *
 * Le second point est déterminant. Les chefs de division ne l'ont PAS — leur
 * métier est de vérifier et de valider. Le leur attribuer automatiquement
 * chargerait les chefs du traitement qu'ils n'ont pas à faire, et laisserait
 * les dossiers sans agent de traitement alors que la division en possède un.
 * La liste des rôles concernés est donc lue en base, pas écrite ici.
 *
 * Choix entre plusieurs agents de la division : celui qui porte le moins de
 * dossiers en cours. À charge égale, celui qui n'a rien reçu depuis le plus
 * longtemps, puis le plus ancien identifiant — pour que le résultat soit
 * stable et que deux dossiers créés dans la même seconde n'aillent pas au même
 * agent par hasard.
 */

/** Statuts qui comptent comme « en cours » pour un agent. */
const DOSSIERS_ACTIFS = [
  'ORIENTE', 'AFFECTE', 'EN_TRAITEMENT', 'SOUMIS_A_VERIFICATION',
  'CORRECTION_DEMANDEE', 'VALIDE', 'SIGNE',
];

/**
 * Agents éligibles d'une division, du moins chargé au plus chargé.
 */
export async function agentsEligibles(divisionId) {
  if (!divisionId) return [];
  const placeholders = DOSSIERS_ACTIFS.map(() => '?').join(', ');

  /* Les deux agrégats sont calculés dans des sous-requêtes séparées.
     Réunir « dossiers en cours » et « dernière affectation » dans un seul
     GROUP BY produirait un produit cartésien : un agent ayant 3 dossiers et
     5 affectations verrait compter 15 dossiers en cours. Le classement
     s'appuierait alors sur un nombre faux. */
  return db.query(
    `SELECT a.id, a.nom, a.prenom, r.nom AS role_code,
            COALESCE(charge.en_cours, 0) AS en_cours,
            aff.derniere_affectation
     FROM agents a
     JOIN users u ON u.id = a.user_id
     JOIN roles r ON r.id = u.role_id
     JOIN role_permissions rp ON rp.role_id = r.id
     JOIN permissions p ON p.id = rp.permission_id AND p.nom = 'traiter_dossier'
     LEFT JOIN (
       SELECT d.agent_responsable_id AS agent_id, COUNT(*) AS en_cours
       FROM dossiers d
       JOIN statuts_dossiers s ON s.id = d.statut_id
       WHERE s.code IN (${placeholders})
       GROUP BY d.agent_responsable_id
     ) charge ON charge.agent_id = a.id
     LEFT JOIN (
       SELECT af.agent_id, MAX(af.date_affectation) AS derniere_affectation
       FROM affectations af
       GROUP BY af.agent_id
     ) aff ON aff.agent_id = a.id
     WHERE a.division_id = ? AND a.actif = 1
     ORDER BY en_cours ASC,
              derniere_affectation IS NULL DESC,
              derniere_affectation ASC,
              a.id ASC`,
    [...DOSSIERS_ACTIFS, divisionId]
  );
}

/** L'agent vers lequel router un dossier, ou null si la division n'en a pas. */
export async function choisirAgent(divisionId) {
  const [premier] = await agentsEligibles(divisionId);
  return premier || null;
}

/** Files d'attente par division : nombre de dossiers sans agent désigné. */
export async function filesDAttente() {
  return db.query(
    `SELECT dv.id AS division_id, dv.code, dv.nom,
            COUNT(d.id) AS en_attente
     FROM dossiers d
     JOIN statuts_dossiers s ON s.id = d.statut_id
     JOIN divisions dv ON dv.id = d.division_id
     WHERE s.code = 'ORIENTE' AND d.agent_responsable_id IS NULL
     GROUP BY dv.id, dv.code, dv.nom
     ORDER BY dv.nom`
  );
}
