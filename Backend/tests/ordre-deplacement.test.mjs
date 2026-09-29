/* Validation des pièces de déplacement : ce que le serveur accepte et refuse.
 *
 * La distinction est entre ACCEPTE et REFUSE : une suite qui ne compte que les
 * succès laisse passer un schéma qui refuse tout, et une suite qui ne compte que
 * les refus laisse passer un schéma qui accepte tout. */
import { ordreSchema, transitionSchema, verifierCoherenceOrdre } from '../src/validators/ordreDeplacementValidators.js';

let ko = 0;
/* accepteAttendu = true si le schéma doit valider la saisie, false s'il doit la refuser. */
const t = (libelle, schema, saisie, accepteAttendu) => {
  const r = schema.validate(saisie);
  const accepte = !r.error;
  const conforme = accepte === accepteAttendu;
  if (!conforme) ko++;
  console.log(
    `  ${conforme ? '✅' : '❌'} ${libelle}` +
    (r.error && !conforme ? ` — ${r.error.details.map((d) => d.message).join(' | ')}` : '')
  );
};

const base = {
  type_id: 1, dossier_id: 1, agent_id: 7,
  lieu_depart: 'Fianarantsoa', lieu_destination: 'Antananarivo',
  date_depart: '2026-10-01', date_retour: '2026-10-05',
  objet: 'Recuperation de pieces justificatives',
};

console.log('=== Le module se charge sans erreur (piege Joi : accent dans required) ===');
t('ordre complet accepte', ordreSchema, base, true);
t('ordre sans objet refuse', ordreSchema, { ...base, objet: undefined }, false);
t('objet trop court refuse', ordreSchema, { ...base, objet: 'ab' }, false);
t('lieu de depart manquant refuse', ordreSchema, { ...base, lieu_depart: '' }, false);
t('date mal formee refusee', ordreSchema, { ...base, date_depart: '01/10/2026' }, false);
t('montant negatif refuse', ordreSchema, { ...base, montant_avance: -5 }, false);
t('montant absent accepte (avance non demandee)', ordreSchema, { ...base, montant_avance: null }, true);
t('champ inconnu refuse (unknown false)', ordreSchema, { ...base, pirate: 1 }, false);
t('dossier manquant refuse', ordreSchema, { ...base, dossier_id: undefined }, false);
t('type_id non entier refuse', ordreSchema, { ...base, type_id: 'un' }, false);

console.log('=== Transitions du circuit ===');
t('soumission acceptee', transitionSchema, { statut: 'SOUMIS' }, true);
t('signature avec reference acceptee', transitionSchema, { statut: 'SIGNE', reference_signature: 'SIG-2026-0001' }, true);
t('statut hors circuit refuse', transitionSchema, { statut: 'PERDU' }, false);
t('transition sans statut refusee', transitionSchema, {}, false);
t('champ inconnu refuse', transitionSchema, { statut: 'SOUMIS', pirate: 1 }, false);

console.log('=== Coherence des dates (hors de portee de Joi) ===');
const retourAvant = verifierCoherenceOrdre({ date_depart: '2026-10-05', date_retour: '2026-10-01' });
const casCorrect = verifierCoherenceOrdre(base);
const v1 = retourAvant !== null; if (!v1) ko++;
console.log(`  ${v1 ? '✅' : '❌'} retour anterieur au depart detecte — ${retourAvant}`);
const v2 = casCorrect === null; if (!v2) ko++;
console.log(`  ${v2 ? '✅' : '❌'} dates correctes acceptees`);
const memeJour = verifierCoherenceOrdre({ date_depart: '2026-10-05', date_retour: '2026-10-05' });
const v3 = memeJour === null; if (!v3) ko++;
console.log(`  ${v3 ? '✅' : '❌'} depart et retour le meme jour acceptes (aller-retour dans la journee)`);

console.log(ko === 0 ? '  TOUT CONFORME' : `  ❌ ${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);
