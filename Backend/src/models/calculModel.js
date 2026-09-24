import db from '../config/db.js';

/* ------------------------------------------------------------------ */
/* Liquidation de pension                                             */
/* ------------------------------------------------------------------ */

/**
 * Pension nette = pension brute - retenues.
 * Le calcul est fait ici (et non en colonne générée) pour rester compatible
 * avec toutes les versions de MariaDB et pour être testable unitairement.
 */
export function calculerPension({ pension_brute, retenues }) {
  return Math.max(0, Number(pension_brute) - Number(retenues));
}

export async function saveLiquidation({
  dossier_id, agent_id, annees_service, indice_final,
  pension_brute, retenues, observation,
}) {
  const pension_nette = calculerPension({ pension_brute, retenues });

  await db.query(
    `INSERT INTO liquidations_pension
       (dossier_id, agent_id, annees_service, indice_final,
        pension_brute, retenues, observation)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       agent_id = VALUES(agent_id),
       annees_service = VALUES(annees_service),
       indice_final = VALUES(indice_final),
       pension_brute = VALUES(pension_brute),
       retenues = VALUES(retenues),
       observation = VALUES(observation),
       date_calcul = NOW()`,
    [dossier_id, agent_id || null, annees_service, indice_final || null,
     pension_brute, retenues, observation || null]
  );

  return findLiquidation(dossier_id);
}

export async function findLiquidation(dossier_id) {
  const rows = await db.query(
    `SELECT lp.*, ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM liquidations_pension lp
     LEFT JOIN agents ag ON ag.id = lp.agent_id
     WHERE lp.dossier_id = ?`,
    [dossier_id]
  );
  const l = rows[0];
  if (!l) return null;
  return { ...l, pension_nette: calculerPension(l) };
}

/* ------------------------------------------------------------------ */
/* Décompte d'avance (Solde)                                          */
/* ------------------------------------------------------------------ */

/**
 * net_a_payer        = salaire mensuel - retenue mensuelle
 * reste_a_rembourser = avance demandée - (retenue mensuelle × mois déjà remboursés)
 */
export function calculerDecompte({ salaire_mensuel, retenue_mensuelle, avance_demandee, mois_rembourses }) {
  const net = Math.max(0, Number(salaire_mensuel) - Number(retenue_mensuelle));
  const reste = Math.max(
    0,
    Number(avance_demandee) - Number(retenue_mensuelle) * Number(mois_rembourses)
  );
  return { net_a_payer: net, reste_a_rembourser: reste };
}

export async function saveDecompte({
  dossier_id, agent_id, salaire_mensuel, indice, echelon,
  avance_demandee, retenue_mensuelle, duree_mois, mois_rembourses, observation,
}) {
  const { net_a_payer, reste_a_rembourser } = calculerDecompte({
    salaire_mensuel, retenue_mensuelle, avance_demandee, mois_rembourses,
  });

  await db.query(
    `INSERT INTO decomptes_avance
       (dossier_id, agent_id, salaire_mensuel, indice, echelon,
        avance_demandee, retenue_mensuelle, duree_mois, mois_rembourses,
        net_a_payer, reste_a_rembourser, observation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       agent_id = VALUES(agent_id),
       salaire_mensuel = VALUES(salaire_mensuel),
       indice = VALUES(indice),
       echelon = VALUES(echelon),
       avance_demandee = VALUES(avance_demandee),
       retenue_mensuelle = VALUES(retenue_mensuelle),
       duree_mois = VALUES(duree_mois),
       mois_rembourses = VALUES(mois_rembourses),
       net_a_payer = VALUES(net_a_payer),
       reste_a_rembourser = VALUES(reste_a_rembourser),
       observation = VALUES(observation),
       date_calcul = NOW()`,
    [dossier_id, agent_id || null, salaire_mensuel, indice || null, echelon || null,
     avance_demandee, retenue_mensuelle, duree_mois, mois_rembourses,
     net_a_payer, reste_a_rembourser, observation || null]
  );

  return findDecompte(dossier_id);
}

export async function findDecompte(dossier_id) {
  const rows = await db.query(
    `SELECT da.*, ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM decomptes_avance da
     LEFT JOIN agents ag ON ag.id = da.agent_id
     WHERE da.dossier_id = ?`,
    [dossier_id]
  );
  if (!rows[0]) return null;
  return { ...rows[0], ...calculerDecompte(rows[0]) };
}

/* ------------------------------------------------------------------ */
/* Contrôle de décompte (Chef de Division Solde)                       */
/* ------------------------------------------------------------------ */

export async function saveControle({
  dossier_id, controleur_id, decision,
  calculs_verifies, pieces_justificatives, certificat_cessation, observation,
}) {
  await db.query(
    `INSERT INTO controles_decompte
       (dossier_id, controleur_id, decision, calculs_verifies,
        pieces_justificatives, certificat_cessation, observation)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dossier_id, controleur_id || null, decision,
     calculs_verifies ? 1 : 0, pieces_justificatives ? 1 : 0,
     certificat_cessation ? 1 : 0, observation || null]
  );
  return findControle(dossier_id);
}

export async function findControle(dossier_id) {
  const rows = await db.query(
    `SELECT cd.*, ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM controles_decompte cd
     LEFT JOIN agents ag ON ag.id = cd.controleur_id
     WHERE cd.dossier_id = ?
     ORDER BY cd.date_controle DESC`,
    [dossier_id]
  );
  return rows;
}
