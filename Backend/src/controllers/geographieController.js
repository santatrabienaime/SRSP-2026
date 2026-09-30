import * as G from '../models/geographieModel.js';
import { accesDossier } from '../services/scopeService.js';

export async function referentiel(req, res, next) {
  try { res.json(await G.referentielGeographique()); } catch (e) { next(e); }
}

export async function antennes(req, res, next) {
  try { res.json(await G.listerAntennes()); } catch (e) { next(e); }
}

export async function districts(req, res, next) {
  try {
    res.json(await G.listerDistricts({
      antenneId: req.query.antenne_id ? Number(req.query.antenne_id) : null,
    }));
  } catch (e) { next(e); }
}

export async function rattacher(req, res, next) {
  try {
    const dossierId = Number(req.params.id);
    const autorise = await accesDossier(req.user.id, dossierId);
    if (!autorise) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce dossier." });
    }
    const resultat = await G.rattacherDossier(dossierId, Number(req.body.district_id), {
      dateRattachement: req.body.date_rattachement || null,
      origine: req.body.origine || 'SAISIE',
    });
    res.status(201).json(resultat);
  } catch (e) { next(e); }
}

export async function districtDuDossier(req, res, next) {
  try { res.json(await G.districtCourant(Number(req.params.id))); } catch (e) { next(e); }
}

export async function historique(req, res, next) {
  try { res.json(await G.historiqueRattachement(Number(req.params.id))); } catch (e) { next(e); }
}

export async function synthese(req, res, next) {
  try {
    res.json(await G.syntheseParAntenne(
      req.query.division_id ? Number(req.query.division_id) : null
    ));
  } catch (e) { next(e); }
}
