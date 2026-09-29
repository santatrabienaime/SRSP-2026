import * as S from '../services/performanceService.js';
import db from '../config/db.js';
import { getScope } from '../services/scopeService.js';

/**
 * Mes statistiques.
 *
 * Un agent ne peut voir que les siennes. Le cloisonnement est fait ici, à la
 * porte, et non dans le service : le service rend ce qu'on lui demande, et deux
 * endroits qui implémentent la même règle finissent toujours par diverger.
 */
export async function getMiennes(req, res, next) {
  try {
    const scope = await getScope(req.user.id);
    if (!scope.agentId) {
      // Un compte sans fiche agent (administrateur système, par exemple) n'a
      // pas d'activité dossier à mesurer. Le dire vaut mieux que renvoyer des
      // zéros, que l'écran afficherait « 0 % de réussite » sans explication.
      return res.json({
        agent_id: null,
        sans_fiche_agent: true,
        dossiers_recus: 0,
        dossiers_traites: 0,
        etapes: [],
        suggestions: [{
          code: 'SANS_AGENT',
          message: "Votre compte n'est rattaché à aucune fiche agent : il n'y a pas d'activité à mesurer.",
          gravite: 'information',
        }],
      });
    }
    return res.json(await S.performanceDe(scope.agentId));
  } catch (e) { next(e); }
}

/**
 * Performance d'un agent précis.
 *
 * Réservé à qui supervise. Un agentScoped ne peut l'appeler que sur lui-même.
 */
export async function getParAgent(req, res, next) {
  try {
    const scope = await getScope(req.user.id);
    const cible = Number(req.params.id);

    if (scope.agentScoped && cible !== scope.agentId) {
      return res.status(403).json({
        message: "Vous ne pouvez consulter que vos propres statistiques.",
      });
    }
    /* Un chef de division ne consulte que sa division.

       Le test ne se pose pas en « division ET pas global » : un chef de division
       possède view_all_dossiers, nécessaire pour superviser les dossiers de son
       service. Se fier à `global` rendait le contrôle inopérant — il ne se
       déclenchait jamais, et le chef pouvait lire le rendement d'un agent d'un
       autre service.

       La permission porte sur les DOSSIERS, pas sur les PERSONNES. Un chef qui
       voit tous les dossiers n'a pas pour autant le droit de juger le travail
       d'un collègue qui n'est pas le sien. */
    const division = await divisionDe(cible);
    if (division === INEXISTANT) {
      return res.status(404).json({ message: 'Agent introuvable.' });
    }

    /* L'agent lui-même est toujours autorisé, même s'il est détaché d'une
       division : il ne pourrait pas consulter ses propres statistiques sinon. */
    const cibleEstHorsDivision =
      scope.divisionScoped && cible !== scope.agentId && division !== scope.divisionId;

    if (cibleEstHorsDivision) {
      return res.status(403).json({
        message: 'Vous ne pouvez consulter que les statistiques de votre division.',
      });
    }
    return res.json(await S.performanceDe(cible));
  } catch (e) { next(e); }
}

/**
 * Marqueur d'un agent inexistant.
 *
 * Un symbole plutôt que null : null signifie « cet agent existe mais n'est
 * rattaché à aucune division », ce qui est une situation réelle — le SRSP
 * central. Confondre les deux ferait répondre 403 « hors de votre division » à
 * un identifiant simplement erroné.
 */
const INEXISTANT = Symbol('agent-inexistant');

/**
 * Division d'un agent, ou null s'il n'est rattaché à aucune.
 *
 * Un agent sans division (le SRSP lui-même) n'appartient donc à aucune division
 * supervisable : un chef qui le demanderait est refusé, ce qui est correct —
 * il n'a pas autorité sur le personnel de l'administration centrale.
 */
async function divisionDe(agentId) {
  const [agent] = await db.query('SELECT division_id FROM agents WHERE id = ?', [agentId]);
  if (!agent) return INEXISTANT;
  return agent.division_id ?? null;
}

/** Tableau de bord d'une division : un agent par ligne. */
export async function getEquipe(req, res, next) {
  try {
    const scope = await getScope(req.user.id);
    if (scope.agentScoped) {
      return res.status(403).json({
        message: "Cette vue est réservée aux rôles de supervision.",
      });
    }
    return res.json(await S.performanceParAgent(scope.divisionScoped ? scope.divisionId : null));
  } catch (e) { next(e); }
}

/** Synthèse du service : le tableau 3.2 du document. */
export async function getSynthese(req, res, next) {
  try {
    const scope = await getScope(req.user.id);
    if (scope.agentScoped) {
      return res.status(403).json({
        message: "La synthèse du service est réservée aux rôles de pilotage.",
      });
    }
    return res.json(await S.syntheseGlobale());
  } catch (e) { next(e); }
}
