/** Erreur HTTP avec statut explicite (401, 403, 404, 409…). */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Court-circuite la création : httpError(404, 'Dossier introuvable.') */
export const httpError = (status, message) => new HttpError(status, message);