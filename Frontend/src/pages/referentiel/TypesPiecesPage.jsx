import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Power, PowerOff, PencilLine, Filter } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { ReferenceInput, TextInput } from '../../components/fields/index.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/* La colonne `phase` est un enum en base : seules ces deux valeurs passent. */
const PHASES = {
  DEPOUILLEMENT: 'Dépouillement',
  ARCHIVAGE: 'Archivage',
};

/**
 * Types de pièces requises.
 *
 * Une pièce se rattache à un type de dossier, éventuellement à un sous-type
 * (type d'acte), et à une phase. Le dépouillement ne demande que les pièces
 * qui s'appliquent : un dossier VISA « mariage » ne contrôle pas les pièces
 * du Secours.
 *
 * Une pièce n'est jamais effacée. La suppression la désactive : elle disparaît
 * des nouveaux dossiers, mais les dépouillements qui la mentionnent restent
 * lisibles. Effacer une pièce ferait disparaître de l'historique la preuve
 * qu'elle était attendue.
 */
export function TypesPiecesPage() {
  const { toastSuccess, toastError } = useNotification();
  const [pieces, setPieces] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [typesDossiers, setTypesDossiers] = useState([]);
  const [sousTypes, setSousTypes] = useState([]);
  const [chargement, setChargement] = useState(true);

  /* Filtres de périmètre : type de dossier, sous-type, division. */
  const [filtreType, setFiltreType] = useState('');
  const [filtreSousType, setFiltreSousType] = useState('');
  const [filtreDivision, setFiltreDivision] = useState('');

  const [nouveauCode, setNouveauCode] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [nouvellePhase, setNouvellePhase] = useState('ARCHIVAGE');
  const [nouvelleDivision, setNouvelleDivision] = useState('');
  const [nouveauTypeDossier, setNouveauTypeDossier] = useState('');
  const [nouveauSousType, setNouveauSousType] = useState('');
  const [nouveauObligatoire, setNouveauObligatoire] = useState(true);
  const [nouvelOrdre, setNouvelOrdre] = useState('0');

  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [libelleEdition, setLibelleEdition] = useState('');
  const [obligatoireEdition, setObligatoireEdition] = useState(true);
  const [phaseEdition, setPhaseEdition] = useState('DEPOUILLEMENT');
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const [p, d, t, s] = await Promise.all([
        referentielService.typesPieces(),
        referentielService.divisions(),
        referentielService.typesDossiers(),
        referentielService.sousTypes(),
      ]);
      setPieces(Array.isArray(p) ? p : []);
      setDivisions(Array.isArray(d) ? d : []);
      setTypesDossiers(Array.isArray(t) ? t : []);
      setSousTypes(Array.isArray(s) ? s : []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  }, [toastError]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  /* Les sous-types proposés dépendent du type de dossier retenu : un
     sous-type « Visa de mariage » n'a pas de sens sous « Secours ». */
  const sousTypesDuType = filtreType
    ? sousTypes.filter((s) => String(s.type_dossier_id) === String(filtreType))
    : sousTypes;

  const sousTypesFormulaire = nouveauTypeDossier
    ? sousTypes.filter((s) => String(s.type_dossier_id) === String(nouveauTypeDossier))
    : sousTypes;

  const ajouterType = async () => {
    if (!nouveauCode.trim() || !nouveauLibelle.trim()) return;
    try {
      await referentielService.ajouterTypePiece({
        code: nouveauCode,
        libelle: nouveauLibelle,
        phase: nouvellePhase,
        obligatoire: nouveauObligatoire ? 1 : 0,
        division_code: nouvelleDivision || null,
        type_dossier_id: nouveauTypeDossier || null,
        sous_type_id: nouveauSousType || null,
        ordre: Number(nouvelOrdre) || 0,
      });
      toastSuccess('Type de pièce créé.');
      setNouveauCode('');
      setNouveauLibelle('');
      setNouvellePhase('ARCHIVAGE');
      setNouvelleDivision('');
      setNouveauTypeDossier('');
      setNouveauSousType('');
      setNouveauObligatoire(true);
      setNouvelOrdre('0');
      await charger();
    } catch (err) {
      toastError(err.message);
    }
  };

  const desactiverType = async () => {
    if (!aSupprimer) return;
    setSuppressionEnCours(true);
    try {
      await referentielService.desactiverTypePiece(aSupprimer.id);
      toastSuccess('Pièce désactivée : elle n’est plus proposée, son historique reste consultable.');
      setASupprimer(null);
      await charger();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const basculerActif = async (t) => {
    try {
      await referentielService.modifierTypePiece(t.id, { actif: t.actif ? 0 : 1 });
      toastSuccess(t.actif ? 'Pièce désactivée.' : 'Pièce réactivée.');
      await charger();
    } catch (err) {
      toastError(err.message);
    }
  };

  const ouvrirEdition = (t) => {
    setEnEdition(t);
    setLibelleEdition(t.libelle || '');
    setObligatoireEdition(Boolean(t.obligatoire));
    setPhaseEdition(t.phase || 'DEPOUILLEMENT');
  };

  const enregistrerEdition = async () => {
    if (!enEdition) return;
    setEnregistrement(true);
    try {
      await referentielService.modifierTypePiece(enEdition.id, {
        libelle: libelleEdition,
        obligatoire: obligatoireEdition ? 1 : 0,
        phase: phaseEdition,
      });
      toastSuccess('Pièce mise à jour.');
      setEnEdition(null);
      await charger();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnregistrement(false);
    }
  };

  /* Filtrage côté client : la liste reste petite, et le filtre doit rester
     disponible même quand aucune pièce ne correspond à un type précis. */
  const visibles = pieces.filter((t) => {
    if (filtreType && String(t.type_dossier_id) !== String(filtreType)) return false;
    if (filtreSousType && String(t.sous_type_id) !== String(filtreSousType)) return false;
    if (filtreDivision && t.division_code !== filtreDivision) return false;
    return true;
  });

  const creationValide = Boolean(nouveauCode.trim()) && Boolean(nouveauLibelle.trim());

  return (
    <AnimatedCard
      title="Types de pièces"
      subtitle="Pièces requises par type de dossier, par type d'acte et par phase"
      delay={0}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <ReferenceInput
            label="Code (ex: CIN, FACTURE)"
            value={nouveauCode}
            onChange={(v) => setNouveauCode(v)}
            placeholder="CIN"
            maxLength={20}
          />
          <TextInput
            label="Libellé"
            value={nouveauLibelle}
            onChange={(v) => setNouveauLibelle(v)}
            placeholder="Carte d'identité nationale"
            maxLength={150}
          />
          <Select label="Phase" value={nouvellePhase} onChange={(e) => setNouvellePhase(e.target.value)}>
            {Object.entries(PHASES).map(([code, libelle]) => (
              <option key={code} value={code}>{libelle}</option>
            ))}
          </Select>
          <TextInput
            label="Ordre"
            value={nouvelOrdre}
            onChange={(v) => setNouvelOrdre(v)}
            maxLength={4}
            hint="Ordre d'affichage"
          />
          <Select
            label="Type de dossier"
            value={nouveauTypeDossier}
            onChange={(e) => {
              setNouveauTypeDossier(e.target.value);
              setNouveauSousType('');
            }}
          >
            <option value="">Tous les types</option>
            {typesDossiers.map((t) => (
              <option key={t.id} value={t.id}>{t.libelle}</option>
            ))}
          </Select>
          <Select
            label="Type d'acte (sous-type)"
            value={nouveauSousType}
            onChange={(e) => setNouveauSousType(e.target.value)}
          >
            <option value="">Tous les types d'acte</option>
            {sousTypesFormulaire.map((s) => (
              <option key={s.id} value={s.id}>{s.libelle}</option>
            ))}
          </Select>
          <Select label="Division" value={nouvelleDivision} onChange={(e) => setNouvelleDivision(e.target.value)}>
            <option value="">Toutes</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.code}>{d.nom}</option>
            ))}
          </Select>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={nouveauObligatoire}
                onChange={(e) => setNouveauObligatoire(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600"
              />
              Obligatoire
            </label>
            <Button onClick={ajouterType} disabled={!creationValide} className="mb-1.5">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </div>
        </div>

        {/* Filtres de périmètre de la liste. */}
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <Select label="Filtrer — type de dossier" value={filtreType} onChange={(e) => {
            setFiltreType(e.target.value);
            setFiltreSousType('');
          }}>
            <option value="">Tous les types</option>
            {typesDossiers.map((t) => (
              <option key={t.id} value={t.id}>{t.libelle}</option>
            ))}
          </Select>
          <Select label="Filtrer — type d'acte" value={filtreSousType} onChange={(e) => setFiltreSousType(e.target.value)}>
            <option value="">Tous les types d'acte</option>
            {sousTypesDuType.map((s) => (
              <option key={s.id} value={s.id}>{s.libelle}</option>
            ))}
          </Select>
          <Select label="Filtrer — division" value={filtreDivision} onChange={(e) => setFiltreDivision(e.target.value)}>
            <option value="">Toutes</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.code}>{d.nom}</option>
            ))}
          </Select>
        </div>

        <Card
          title="Types de pièces existants"
          actions={
            (filtreType || filtreSousType || filtreDivision) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltreType('');
                  setFiltreSousType('');
                  setFiltreDivision('');
                }}
              >
                <Filter className="h-4 w-4" /> Effacer les filtres
              </Button>
            ) : null
          }
        >
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement…" />
            </div>
          ) : visibles.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Aucun type de pièce configuré pour ce périmètre.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Code</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Libellé</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Phase</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Type / acte</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Division</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Obligatoire</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">État</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2 text-sm font-medium text-slate-700">
                        <Badge className="border-slate-200 bg-slate-50">{t.code}</Badge>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">{t.libelle}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">
                        {PHASES[t.phase] || t.phase || '—'}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-500">
                        {t.sous_type_libelle || t.type_libelle || 'Tous'}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-500">{t.division_code || 'Toutes'}</td>
                      <td className="px-3 py-2">
                        {t.obligatoire ? (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">Obligatoire</Badge>
                        ) : (
                          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Facultative</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {t.actif === 0 ? (
                          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Désactivée</Badge>
                        ) : (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => ouvrirEdition(t)}
                            aria-label={`Modifier ${t.code}`}
                            title="Modifier"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => basculerActif(t)}
                            aria-label={`${t.actif === 0 ? 'Réactiver' : 'Désactiver'} ${t.code}`}
                            title={t.actif === 0 ? 'Réactiver' : 'Désactiver'}
                          >
                            {t.actif === 0 ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setASupprimer(t)}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400"
                            aria-label={`Désactiver ${t.code}`}
                            title="Désactiver"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={enEdition !== null}
        onClose={() => !enregistrement && setEnEdition(null)}
        title={`Modifier — ${enEdition?.code || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEnEdition(null)} disabled={enregistrement}>
              Annuler
            </Button>
            <Button onClick={enregistrerEdition} loading={enregistrement} disabled={!libelleEdition.trim()}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput
            label="Libellé"
            required
            value={libelleEdition}
            onChange={setLibelleEdition}
            maxLength={150}
          />
          <Select label="Phase" value={phaseEdition} onChange={(e) => setPhaseEdition(e.target.value)}>
            {Object.entries(PHASES).map(([code, libelle]) => (
              <option key={code} value={code}>{libelle}</option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={obligatoireEdition}
              onChange={(e) => setObligatoireEdition(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-600"
            />
            Pièce obligatoire
          </label>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Le code n'est pas modifiable : il désigne la pièce dans les
            dépouillements déjà enregistrés.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={aSupprimer !== null}
        onClose={() => !suppressionEnCours && setASupprimer(null)}
        onConfirm={desactiverType}
        loading={suppressionEnCours}
        danger
        title="Désactiver le type de pièce"
        message={`Désactiver « ${aSupprimer?.libelle || aSupprimer?.code || ''} » ? La pièce ne sera plus proposée aux nouveaux dossiers ; les dépouillements qui la mentionnent restent consultables. Pour la réactiver, utilisez le bouton d'activation.`}
        confirmLabel="Désactiver"
      />
    </AnimatedCard>
  );
}

export default TypesPiecesPage;
