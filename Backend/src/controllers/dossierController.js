import * as dossierService from '../services/dossierService.js';

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

export async function verifier(req, res, next) {
  try {
    await dossierService.verifier(req.params.id, req.body, req.user.id);
    res.json({ message: 'Vérification enregistrée.' });
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