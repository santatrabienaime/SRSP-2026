import * as rapportService from '../services/rapportService.js';

export async function pdf(req, res, next) {
  try { await rapportService.generatePDF(res, req.query); } catch (e) { next(e); }
}

export async function excel(req, res, next) {
  try { await rapportService.generateExcel(res); } catch (e) { next(e); }
}