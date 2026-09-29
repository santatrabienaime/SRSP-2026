import db from '../config/db.js';

/**
 * Performance par utilisateur.
 *
 * Le document demande des « pourcentages », des « notes » et des « suggestions ».
 * Deux de ces trois choses sont calculables, une ne l'est pas.
 *
 * CALCULABLE, et c'est ce qui est fait ici :
 *   - le nombre de dossiers reçus par la personne ;
 *   - le nombre atteignant chaque étape du circuit ;
 *   - le pourcentage d'avancement, défini comme « dossiers ayant atteint cette
 *     étape / dossiers reçus ». C'est la seule définition qui rende les ratios du
 *     document cohérents entre eux, et elle est vérifiable sur les données.
 *   - le délai moyen entre la réception et l'étape atteinte.
 *
 * NON CALCULABLE, et donc absent de la réponse :
 *   - la « note sur 5 ». C'est une appréciation humaine. Un algorithme qui
 *     sortirait 4,5/5 donnerait l'illusion d'une évaluation alors qu'il se
 *     contente de recompter des chiffres déjà affichés plus haut. Aucun agent
 *     ne doit lire une note qu'il n'a pas été donnée. Les suggestions, elles,
 *     sont déduites des indicateurs réels et ne prétendent pas être une note.
 */

/** Étapes du circuit, dans l'ordre où elles se produisent. */
export const ETAPES = [
  { code: 'CREATION', libelle: 'Dossiers créés' },
  { code: 'AFFECTATION', libelle: 'Dossiers affectés' },
  { code: 'TRAITEMENT', libelle: 'Dossiers traités' },
  { code: 'VERIFICATION', libelle: 'Dossiers vérifiés' },
  { code: 'VALIDATION', libelle: 'Dossiers validés' },
  { code: 'SIGNATURE', libelle: 'Dossiers signés' },
  { code: 'CLOTURE', libelle: 'Dossiers clôturés' },
  { code: 'ARCHIVAGE', libelle: 'Dossiers archivés' },
];

/** Statuts qui marquent la fin d'un dossier. */
const TERMINES = ['VALIDE', 'SIGNE', 'CLOTURE', 'ARCHIVE'];

/**
 * Indicateurs d'une personne.
 *
 * `userId` est optionnel : sans lui, la fonction rend les indicateurs du
 * service, ce qui n'a de sens que pour un rôle de pilotage — le contrôle est
 * fait en amont par `controlePerimetre`.
 */
export async function performanceDe(userId) {
  /* Les indicateurs se comptent en DOSSIERS DISTINCTS, jamais en événements.

     Un vérificateur qui renvoie un dossier pour correction puis le reverifie
     produit deux lignes d'historique pour un seul dossier. Compter les lignes
     et le diviser par le nombre de dossiers reçus donnait 167 % : un pourcentage
     au-dessus de 100 % se remarque dans l'écran, mais l'agent ne comprend pas ce
     que la plateforme lui reproche.

     Les tables métier sont préférées au journal parce qu'elles disent QUI et QUOI,
     pas seulement QUOI. Le journal ne sert que pour les étapes qui n'ont pas de
     table (signature, clôture, archivage) et pour la création. */
  const parEtape = userId ? await dossiersParEtape(userId) : [];

  const touche = new Set();
  for (const e of parEtape) for (const d of e.dossiers) touche.add(d);
  const totalDossiers = touche.size;

  /* Dossiers reçus : ceux dont la personne est l'agent responsable. C'est la
     bonne mesure pour un agent de traitement et pour un chef de division, qui
     recoit les dossiers de sa division. */
  const [recus] = await db.query(
    `SELECT COUNT(*) AS n FROM dossiers WHERE agent_responsable_id = ?`,
    [userId]
  );
  const dossiersRecus = recus?.n || 0;

  /* Dossiers encore en cours, et dont l'échéance est dépassée. Une échéance
     passée n'est pas un retard si le dossier est terminé : on ne compte donc
     que ceux qui sont encore ouverts. */
  const [enCours] = await db.query(
    `SELECT COUNT(*) AS n,
            SUM(CASE WHEN date_limite IS NOT NULL AND date_limite < CURDATE() THEN 1 ELSE 0 END) AS en_retard
     FROM dossiers
     WHERE agent_responsable_id = ?
       AND statut_id NOT IN (SELECT id FROM statuts_dossiers WHERE code IN (?, ?, ?, ?))`,
    [userId, ...TERMINES]
  );

  /* Délai moyen : de la réception à la première entrée en traitement.
     C'est le délai que l'agent maîtrise — celui de la division ou du service ne
     l'est pas.

     Le premier traitement est retenu par dossier dans une sous-requête : sans
     elle, un dossier retraité trois fois pèserait trois fois dans la moyenne, et
     l'agent qui a le plus repris de dossiers verrait son délai artificiellement
     allongé. MySQL refuse par ailleurs MIN() imbriqué dans AVG(). */
  const [delai] = await db.query(
    `SELECT AVG(duree) AS jours FROM (
       SELECT DATEDIFF(premier_traitement, reception) AS duree
       FROM (
         SELECT t.dossier_id,
                MIN(t.date_debut) AS premier_traitement,
                d.date_reception AS reception
         FROM traitements t
         JOIN dossiers d ON d.id = t.dossier_id
         WHERE t.agent_id = ? AND d.date_reception IS NOT NULL
         GROUP BY t.dossier_id, d.date_reception
       ) par_dossier
       WHERE premier_traitement IS NOT NULL
     ) ecarts`,
    [userId]
  );

  /* Le dénominateur est le nombre de dossiers sur lesquels la personne a
     travaillé, pas le nombre de dossiers qui lui sont affectés aujourd'hui.

     La différence n'est pas académique : l'agent 7 avait vérifié le dossier 1
     avant qu'il ne soit affecté à quelqu'un d'autre. Le compter au numérateur
     mais pas au dénominateur produisait 167 %. Un pourcentage se lit comme une
     mesure de la personne ; il doit donc porter sur son périmètre réel, pas sur
     une photo prise à un instant qui exclut une partie de son travail. */
  const etapes = ETAPES.map((e) => {
    const dossiers = dossiersPour(parEtape, e.code);
    return {
      code: e.code,
      libelle: e.libelle,
      valeur: dossiers.length,
      // Un pourcentage sans dénominateur ne veut rien dire : il vaut null
      // plutôt que 0, pour que l'interface n'affiche pas « 0 % » là où il
      // n'y a rien à mesurer.
      taux: totalDossiers > 0 ? Math.round((dossiers.length / totalDossiers) * 100) : null,
    };
  });

  /* Taux d'avancement : part des dossiers touchés qui sont arrivés au bout du
     circuit. Le mot « bout » est l'archivage, dernière étape de la liste. */
  const archives = dossiersPour(parEtape, 'ARCHIVAGE').length;
  const tauxGlobal = totalDossiers > 0 ? Math.round((archives / totalDossiers) * 100) : null;

  return {
    agent_id: userId,
    dossiers_recus: dossiersRecus,
    dossiers_traites: totalDossiers,
    dossiers_en_cours: enCours?.n || 0,
    dossiers_en_retard: enCours?.en_retard || 0,
    delai_moyen_jours: delai?.jours === null || delai?.jours === undefined ? null : Number(delai.jours),
    taux_global: tauxGlobal,
    etapes,
    suggestions: suggerer({ dossiersRecus, totalDossiers, etapes, parEtape, enCours, delai }),
  };
}

/**
 * Dossiers distincts touchés par la personne, étape par étape.
 *
 * Une étape sans table métier est lue dans le journal, et dédupliquée sur le
 * dossier — c'est exactement le cas qui produisait le 167 %.
 */
async function dossiersParEtape(userId) {
  const parCode = Object.fromEntries(ETAPES.map((e) => [e.code, []]));

  const sqlParEtape = {
    AFFECTATION: 'SELECT DISTINCT dossier_id FROM affectations WHERE agent_id = ?',
    TRAITEMENT: 'SELECT DISTINCT dossier_id FROM traitements WHERE agent_id = ?',
    VERIFICATION: 'SELECT DISTINCT dossier_id FROM verifications WHERE agent_id = ?',
    VALIDATION: "SELECT DISTINCT dossier_id FROM validations WHERE valide_par = ? AND decision = 'VALIDE'",
  };

  for (const [code, sql] of Object.entries(sqlParEtape)) {
    const lignes = await db.query(sql, [userId]);
    parCode[code] = lignes.map((l) => l.dossier_id).filter((d) => d !== null);
  }

  /* Les étapes sans table métier viennent du journal. Le journal note
     l'évènement, pas le dossier : DISTINCT est donc indispensable, et
     CREATION_DOSSIER est le nom réel de l'action de création. */
  const actionsJournal = {
    CREATION: 'CREATION_DOSSIER',
    SIGNATURE: 'SIGNATURE',
    CLOTURE: 'CLOTURE',
    ARCHIVAGE: 'ARCHIVAGE',
  };
  for (const [code, action] of Object.entries(actionsJournal)) {
    const lignes = await db.query(
      'SELECT DISTINCT dossier_id FROM historique_actions WHERE user_id = ? AND action = ?',
      [userId, action]
    );
    parCode[code] = lignes.map((l) => l.dossier_id).filter((d) => d !== null);
  }

  return ETAPES.map((e) => ({ code: e.code, dossiers: parCode[e.code] }));
}

const dossiersPour = (parEtape, code) =>
  parEtape.find((e) => e.code === code)?.dossiers || [];

/**
 * Suggestions déduites des indicateurs.
 *
 * Elles ne sont pas recopiées d'une liste figée : chacune n'apparaît que si la
 * donnée la justifie. Un agent dont tous les dossiers avancent normalement ne
 * reçoit aucun conseil — un conseil sans fondement se lit comme une critique.
 */
function suggerer({ dossiersRecus, totalDossiers, etapes, parEtape, enCours, delai }) {
  const conseils = [];
  const parCode = Object.fromEntries(etapes.map((e) => [e.code, e]));

  if (totalDossiers === 0) {
    return [{ code: 'AUCUN_DOSSIER', message: 'Aucun dossier ne vous est actuellement affecté.' }];
  }

  const enRetard = enCours?.en_retard || 0;
  if (enRetard > 0) {
    conseils.push({
      code: 'RETARDS',
      message: `${enRetard} dossier${enRetard > 1 ? 's' : ''} en cours ${enRetard > 1 ? 'ont' : 'a'} dépassé l'échéance. La file de tri « À traiter en premier » les place en tête.`,
      gravite: 'elevee',
    });
  }

  /* Le taux de traitement s'arrête avant la vérification : c'est là que se
     joue la qualité du travail remis au chef. */
  const traites = parCode.TRAITEMENT?.valeur || 0;
  const verifies = parCode.VERIFICATION?.valeur || 0;
  const restants = traites - verifies;
  if (traites > 0 && verifieRatio(verifies, traites) < 80) {
    conseils.push({
      code: 'SOUMISSION',
      message: `${restants} dossier${restants > 1 ? 's' : ''} traité${restants > 1 ? 's' : ''} ${restants > 1 ? 'n’ont' : 'n’a'} pas encore été soumis à vérification.`,
      gravite: 'moyenne',
    });
  }

  if (delai?.jours !== null && delai?.jours !== undefined && Number(delai.jours) > 7) {
    conseils.push({
      code: 'DELAI',
      message: `Votre délai moyen de traitement est de ${Number(delai.jours).toFixed(1)} jours, au-delà d’une semaine.`,
      gravite: 'moyenne',
    });
  }

  /* Un dossier vérifié puis renvoyé pour correction repart en traitement : s’il
     n’y est pas revenu, il est arrêté en chemin. C’est le seul endroit où la
     donnée révèle un dossier bloqué, et un dossier bloqué ne se voit plus dans
     la file de travail une fois sorti de la vue de l’agent. */
  const traitesSet = dossiersPour(parEtape, 'TRAITEMENT');
  const verifiesSet = dossiersPour(parEtape, 'VERIFICATION');
  const validesSet = dossiersPour(parEtape, 'VALIDATION');
  const bloques = traitesSet.filter((d) => !verifiesSet.includes(d) && !validesSet.includes(d));
  if (bloques.length > 0) {
    conseils.push({
      code: 'BLOQUES',
      message: `${bloques.length} dossier${bloques.length > 1 ? 's' : ''} traité${bloques.length > 1 ? 's' : ''} ${bloques.length > 1 ? 'n’ont' : 'n’a'} jamais été soumis à vérification.`,
      gravite: 'moyenne',
    });
  }

  if (!conseils.length) {
    conseils.push({
      code: 'CONFORME',
      message: 'Aucun retard et aucune étape en attente : votre file de travail est à jour.',
      gravite: 'information',
    });
  }
  return conseils;
}

const verifieRatio = (numerateur, denominateur) =>
  denominateur > 0 ? Math.round((numerateur / denominateur) * 100) : 100;

/**
 * Performance de toute une division, agent par agent.
 *
 * Réservé aux rôles qui supervisent. Le service ne filtre pas : il rend ce
 * qu'on lui demande, et l'appelant doit avoir vérifié le périmètre. Filtrer
 * ici en double créerait deux endroits où la règle pourrait diverger.
 */
export async function performanceParAgent(divisionId = null) {
  const params = [];
  let where = 'WHERE a.actif = 1';
  if (divisionId) { where += ' AND a.division_id = ?'; params.push(divisionId); }

  const agents = await db.query(
    `SELECT a.id, a.nom, a.prenom, dv.nom AS division_nom
     FROM agents a
     LEFT JOIN divisions dv ON dv.id = a.division_id
     ${where}
     ORDER BY dv.nom, a.nom`,
    params
  );

  const resultat = [];
  for (const agent of agents) {
    // Un chef de division ne « traite » pas : son activité est l'affectation et
    // la vérification. Le calcul reste le même, il affichera simplement zéro sur
    // les étapes qui ne le concernent pas.
    const p = await performanceDe(agent.id);
    resultat.push({
      agent_id: agent.id,
      nom: agent.nom,
      prenom: agent.prenom,
      division_nom: agent.division_nom,
      dossiers_recus: p.dossiers_recus,
      dossiers_en_cours: p.dossiers_en_cours,
      dossiers_en_retard: p.dossiers_en_retard,
      delai_moyen_jours: p.delai_moyen_jours,
      taux_global: p.taux_global,
    });
  }
  return resultat;
}

/** Synthèse du service : le tableau 3.2 du document. */
export async function syntheseGlobale() {
  const [total] = await db.query(
    `SELECT COUNT(*) AS total,
            SUM(statut_id IN (SELECT id FROM statuts_dossiers WHERE code = 'ARCHIVE')) AS archives
     FROM dossiers`
  );
  const [delai] = await db.query(
    `SELECT AVG(DATEDIFF(COALESCE(d.date_cloture, CURDATE()), d.date_reception)) AS jours
     FROM dossiers d WHERE d.date_reception IS NOT NULL`
  );
  const [retard] = await db.query(
    `SELECT COUNT(*) AS n FROM dossiers
     WHERE date_limite IS NOT NULL AND date_limite < CURDATE()
       AND statut_id NOT IN (SELECT id FROM statuts_dossiers WHERE code IN (?, ?, ?, ?))`,
    TERMINES
  );
  return {
    dossiers_crees: total?.total || 0,
    dossiers_archives: total?.archives || 0,
    dossiers_en_retard: retard?.n || 0,
    delai_moyen_jours: delai?.jours === null || delai?.jours === undefined ? null : Number(delai.jours),
    taux_archives: total?.total > 0 ? Math.round(((total.archives || 0) / total.total) * 100) : null,
  };
}
