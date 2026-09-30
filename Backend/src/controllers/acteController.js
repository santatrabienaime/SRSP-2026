import * as M from '../models/acteModel.js';
import { log } from '../models/historiqueModel.js';

export async function list(req, res, next) {
  try {
    res.json(await M.findActes(req.query));
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const acte = await M.findActeById(req.params.id);
    if (!acte) return res.status(404).json({ message: "Acte introuvable." });
    return res.json(acte);
  } catch (e) { return next(e); }
}

/**
 * Le registre lui-même : l'état de chaque famille d'actes, et les trous.
 *
 * C'est la vue que la secrétaire consulte en ouverture de poste. Un numéro
 * manquant ne se remarque pas dans une liste d'actes, où l'on voit des lignes
 * sans voir ce qui n'est pas là.
 */
export async function chronologie(req, res, next) {
  try {
    const annee = Number(req.query.annee) || new Date().getFullYear();
    const familles = await M.etatRegistre(annee);
    const avecTrous = [];
    for (const f of familles) {
      // Un trou n'a de sens que s'il est compris entre deux numéros attribués.
      // Avant le premier acte d'une famille, l'absence de numéro ne prouve
      // rien : personne n'a encore écrit de note de service.
      avecTrous.push({ ...f, trous: await M.trousRegistre(f.type_acte_id, annee) });
    }
    return res.json({ annee, familles: avecTrous });
  } catch (e) { return next(e); }
}

export async function create(req, res, next) {
  try {
    const acte = await M.createActe({ ...req.body, created_by: req.user.id });
    const cree = await M.findActeById(acte.id);

    await log({
      user_id: req.user.id,
      action: 'ACTE_ENREGISTRE',
      dossier_id: req.body.dossier_id || null,
      details: { acte: acte.numero, objet: req.body.objet, type: cree.type_libelle },
      ip_address: req.ip,
    });

    return res.status(201).json(cree);
  } catch (e) { return next(e); }
}

export async function annuler(req, res, next) {
  try {
    const avant = await M.findActeById(req.params.id);
    if (!avant) return res.status(404).json({ message: 'Acte introuvable.' });

    const acte = await M.annulerActe(req.params.id, req.body.motif);

    await log({
      user_id: req.user.id,
      action: 'ACTE_ANNULE',
      dossier_id: acte.dossier_id || null,
      details: { acte: acte.numero, motif: req.body.motif },
      ip_address: req.ip,
    });

    return res.json(acte);
  } catch (e) { return next(e); }
}

export async function listTypes(req, res, next) {
  try {
    res.json(await M.getTypesActes({ inactifs: req.query.inactifs === '1' }));
  } catch (e) { next(e); }
}

export async function createType(req, res, next) {
  try {
    const type = await M.createTypeActe(req.body);
    res.status(201).json(await M.findTypeActe(type.id));
  } catch (e) {
    // Deux types ne peuvent pas ouvrir la même série de numéros : le registre
    // ne pourrait plus dire de quelle famille il s'agit.
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: "Ce code ou ce préfixe est déjà porté par un type d'acte.",
      });
    }
    return next(e);
  }
}
