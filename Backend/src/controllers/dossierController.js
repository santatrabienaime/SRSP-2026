import * as dossierService from '../services/dossierService.js';
import * as prochaineActionService from '../services/prochaineActionService.js';
import * as bordereauModel from '../models/bordereauModel.js';
import { genererFicheReception } from '../services/pdfService.js';

export async function list(req, res, next) {
  try {
    const dossiers = await dossierService.getAllDossiers(req.query);
    res.json(dossiers);
  } catch (error) { next(error); }
}

export async function getOne(req, res, next) {
  try {
    const dossier = await dossierService.getDossierById(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable.' });
    res.json(dossier);
  } catch (error) { next(error); }
}

/**
 * Recherche d'un demandeur par son matricule.
 *
 * Sert au pré-remplissage du formulaire de création. Ce n'est PAS une
 * vérification d'unicité bloquante : la réponse indique ce qui est connu, et la
 * secrétaire décide. Bloquer une nouvelle demande parce qu'une personne a déjà
 * un dossier empêcherait de traiter sa pension après son visa.
 */
export async function rechercherParMatricule(req, res, next) {
  try {
    const resultat = await dossierService.rechercherParMatricule(req.query.matricule);
    res.json(resultat);
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  try {
    const dossier = await dossierService.createDossier(req.body, req.user.id);
    res.status(201).json(dossier);
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const dossier = await dossierService.updateDossier(req.params.id, req.body, req.user.id);
    res.json(dossier);
  } catch (error) { next(error); }
}

export async function orienter(req, res, next) {
  try {
    await dossierService.orienter(req.params.id, req.body, req.user.id);
    res.json({ message: 'Dossier orienté.' });
  } catch (error) { next(error); }
}

export async function affecter(req, res, next) {
  try {
    await dossierService.affecter(req.params.id, req.body, req.user.id);
    res.json({ message: 'Dossier affecté.' });
  } catch (error) { next(error); }
}

export async function traiter(req, res, next) {
  try {
    await dossierService.traiter(req.params.id, req.body, req.user.id);
    res.json({ message: 'Dossier en traitement.' });
  } catch (error) { next(error); }
}

export async function demanderComplement(req, res, next) {
  try {
    await dossierService.demanderComplement(req.params.id, req.body, req.user.id);
    res.json({ message: 'Complément demandé.' });
  } catch (error) { next(error); }
}

export async function verifier(req, res, next) {
  try {
    await dossierService.verifier(req.params.id, req.body, req.user.id);
    res.json({ message: 'Vérification enregistrée.' });
  } catch (error) { next(error); }
}

/* ── Actions en masse (référentiel : valider / signer en masse) ──────────
   La même règle s'applique dossier par dossier qu'en individuel : un lot ne
   valide que ce qui est en attente de vérification et ne signe que ce qui est
   validé. Un échec n'annule pas les autres : il est renvoyé identifiant par
   identifiant pour que l'écran montre exactement ce qui reste à traiter. */
const MAX_MASSE = 100;

export async function validerMasse(req, res, next) {
  try {
    const { ids, commentaire } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Aucun dossier sélectionné.' });
    }
    if (ids.length > MAX_MASSE) {
      return res.status(400).json({ message: `Maximum ${MAX_MASSE} dossiers par opération.` });
    }
    const reussis = [];
    const echecs = [];
    for (const id of ids) {
      try {
        await dossierService.valider(String(id), { decision: 'VALIDE', commentaire }, req.user.id);
        reussis.push(id);
      } catch (e) {
        echecs.push({ id, message: e.message });
      }
    }
    res.json({ reussis, echecs });
  } catch (error) { next(error); }
}

export async function signerMasse(req, res, next) {
  try {
    const { ids, reference, observation } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Aucun dossier sélectionné.' });
    }
    if (ids.length > MAX_MASSE) {
      return res.status(400).json({ message: `Maximum ${MAX_MASSE} dossiers par opération.` });
    }
    const reussis = [];
    const echecs = [];
    for (const id of ids) {
      try {
        await dossierService.signer(String(id), { reference, observation }, req.user.id);
        reussis.push(id);
      } catch (e) {
        echecs.push({ id, message: e.message });
      }
    }
    res.json({ reussis, echecs });
  } catch (error) { next(error); }
}

export async function valider(req, res, next) {
  try {
    await dossierService.valider(req.params.id, req.body, req.user.id);
    res.json({ message: 'Décision enregistrée.' });
  } catch (error) { next(error); }
}

export async function signer(req, res, next) {
  try {
    await dossierService.signer(req.params.id, req.body, req.user.id);
    res.json({ message: 'Dossier signé.' });
  } catch (error) { next(error); }
}

export async function cloturer(req, res, next) {
  try {
    await dossierService.cloturer(req.params.id, req.user.id);
    res.json({ message: 'Dossier clôturé.' });
  } catch (error) { next(error); }
}

export async function archiver(req, res, next) {
  try {
    await dossierService.archiver(req.params.id, req.user.id);
    res.json({ message: 'Dossier archivé.' });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    const resultat = await dossierService.deleteDossier(req.params.id, req.user.id, req.body?.motif);
    // 200 et non 204 : la réponse porte la confirmation et le rappel de la
    // trace conservée, que l'écran affiche à l'administrateur.
    res.json(resultat);
  } catch (error) { next(error); }
}

/**
 * Trace des suppressions de dossiers.
 *
 * Ces dossiers n'existent plus : sans cette table, leur suppression serait
 * muette. La trace reste consultable par l'audit, avec son motif et
 * l'instantané du journal.
 */
export async function suppressions(req, res, next) {
  try {
    res.json(await dossierService.listSuppressions({ limite: req.query.limite }));
  } catch (error) { next(error); }
}

export async function suppression(req, res, next) {
  try {
    const ligne = await dossierService.getSuppression(req.params.id);
    if (!ligne) return res.status(404).json({ message: 'Suppression introuvable.' });
    res.json(ligne);
  } catch (error) { next(error); }
}

export async function statut(req, res, next) {
  try {
    const statut = await dossierService.getStatutDossier(req.params.id);
    const transitions = await dossierService.getTransitionsAutorisees(req.params.id);
    res.json({ statut: statut || null, transitions_autorisees: transitions });
  } catch (error) { next(error); }
}

export async function tracabilite(req, res, next) {
  try {
    const dossier = await dossierService.getDossierById(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable.' });
    const timeline = await dossierService.getTracabilite(req.params.id);
    res.json(timeline);
  } catch (error) { next(error); }
}

/**
 * « À faire ensuite » : la prochaine action du dossier, et l'acteur qui doit
 * l'accomplir. La règle est calculée par le service, en un seul endroit.
 */
export async function prochaineAction(req, res, next) {
  try {
    const dossier = await dossierService.getDossierById(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable.' });
    res.json(await prochaineActionService.prochaineAction(dossier, req.user));
  } catch (error) { next(error); }
}

/**
 * Transmissions du dossier : bordereaux, expéditeur, destinataire, date et
 * référence. C'est l'historique des passages d'un dossier d'un service à
 * l'autre, sans avoir à chercher dans plusieurs registres.
 */
export async function transmissions(req, res, next) {
  try {
    const dossier = await dossierService.getDossierById(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable.' });
    res.json(await bordereauModel.transmissionsDossier(req.params.id));
  } catch (error) { next(error); }
}

/** Publication d'un brouillon : il entre dans le circuit. */
export async function publier(req, res, next) {
  try {
    res.json(await dossierService.publier(req.params.id, req.user.id));
  } catch (error) { next(error); }
}

/**
 * Génère et retourne le PDF de la fiche de réception / récépissé.
 */
export async function ficheReceptionPDF(req, res, next) {
  try {
    const dossier = await dossierService.getDossierById(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable.' });

    const pdfBuffer = await genererFicheReception(dossier);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="recepisse-${dossier.numero}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) { next(error); }
}