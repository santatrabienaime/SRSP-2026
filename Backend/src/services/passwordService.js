import { motDePasseFort } from '../validators/authValidators.js';
import { httpError } from '../utils/httpError.js';

export function validerMotDePasse(pwd) {
  const { error } = motDePasseFort.validate(pwd);
  if (error) throw httpError(422, error.details[0].message);
  return true;
}

export default validerMotDePasse;