import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Power, PowerOff, PencilLine } from 'lucide-react';
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

/**
 * Sous-types de dossiers (types d'acte).
 *
 * Un sous-type affine un type de dossier : « Visa » devient « Visa de
 * mariage », « Visa de naissance »… C'est ce qui permet d'exiger des pièces
 * différentes selon l'acte, et de nommer précisément l'acte dans la fiche.
 *
 * Un sous-type qui porte déjà des dossiers n'est jamais supprimé : il est
 * désactivé. Le supprimer effacerait le type d'acte de dossiers existants —
 * le serveur refuse d'ailleurs l'opération. L'historique prime.
 */
export function SousTypesPage() {
  const { toastSuccess, toastError } = useNotification();
  const [types, setTypes] = useState([]);
  const [sousTypes, setSousTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtreType, setFiltreType] = useState('');

  const [nouveauTypeId, setNouveauTypeId] = useState('');
  const [nouveauCode, setNouveauCode] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [nouvelOrdre, setNouvelOrdre] = useState('0');

  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [libelleEdition, setLibelleEdition] = useState('');
  const [ordreEdition, setOrdreEdition] = useState('0');
  const [enregistrement, setEnregistrement] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const [t, s] = await Promise.all([
        referentielService.typesDossiers(),
        referentielService.sousTypes(),
      ]);
      setTypes(Array.isArray(t) ? t : []);
      setSousTypes(Array.isArray(s) ? s : []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  }, [toastError]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const visibles = filtreType
    ? sousTypes.filter((s) => String(s.type_dossier_id) === String(filtreType))
    : sousTypes;

  const ajouter = async () => {
    if (!nouveauTypeId || !nouveauCode.trim() || !nouveauLibelle.trim()) return;
    try {
      await referentielService.ajouterSousType({
        type_dossier_id: Number(nouveauTypeId),
        code: nouveauCode,
        libelle: nouveauLibelle,
        ordre: Number(nouvelOrdre) || 0,
      });
      toastSuccess('Sous-type créé.');
      setNouveauCode('');
      setNouveauLibelle('');
      setNouvelOrdre('0');
      await charger();
    } catch (err) {
      toastError(err.message);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setSuppressionEnCours(true);
    try {
      await referentielService.supprimerSousType(aSupprimer.id);
      toastSuccess('Sous-type supprimé.');
      setASupprimer(null);
      await charger();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const basculerActif = async (st) => {
    try {
      await referentielService.modifierSousType(st.id, { actif: st.actif ? 0 : 1 });
      toastSuccess(st.actif ? 'Sous-type désactivé.' : 'Sous-type activé.');
      await charger();
    } catch (err) {
      toastError(err.message);
    }
  };

  const ouvrirEdition = (st) => {
    setEnEdition(st);
    setLibelleEdition(st.libelle || '');
    setOrdreEdition(String(st.ordre ?? 0));
  };

  const enregistrerEdition = async () => {
    if (!enEdition) return;
    setEnregistrement(true);
    try {
      await referentielService.modifierSousType(enEdition.id, {
        libelle: libelleEdition,
        ordre: Number(ordreEdition) || 0,
      });
      toastSuccess('Sous-type mis à jour.');
      setEnEdition(null);
      await charger();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnregistrement(false);
    }
  };

  const creationValide =
    Boolean(nouveauTypeId) && Boolean(nouveauCode.trim()) && Boolean(nouveauLibelle.trim());

  return (
    <AnimatedCard
      title="Sous-types de dossiers (types d'acte)"
      subtitle="Affiner un type de dossier par type d'acte — VISA : mariage, naissance, décès…"
      delay={0}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <Select
            label="Type de dossier"
            required
            value={nouveauTypeId}
            onChange={(e) => setNouveauTypeId(e.target.value)}
          >
            <option value="">Sélectionner…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.libelle}</option>
            ))}
          </Select>
          <ReferenceInput
            label="Code"
            value={nouveauCode}
            onChange={(v) => setNouveauCode(v)}
            placeholder="VISA_MARIAGE"
            maxLength={50}
          />
          <TextInput
            label="Libellé"
            value={nouveauLibelle}
            onChange={(v) => setNouveauLibelle(v)}
            placeholder="Visa de mariage"
            maxLength={150}
          />
          <TextInput
            label="Ordre"
            value={nouvelOrdre}
            onChange={(v) => setNouvelOrdre(v)}
            maxLength={4}
            hint="Ordre d'affichage"
          />
          <Button onClick={ajouter} disabled={!creationValide}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <Card title="Sous-types existants">
          <div className="mb-3 w-full sm:w-64">
            <Select
              label="Filtrer par type de dossier"
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
            >
              <option value="">Tous les types</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.libelle}</option>
              ))}
            </Select>
          </div>

          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement…" />
            </div>
          ) : visibles.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Aucun sous-type configuré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Code</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Libellé</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Type de dossier</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Dossiers</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Pièces</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">État</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((st) => (
                    <tr key={st.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2 text-sm font-medium text-slate-700">
                        <Badge className="border-slate-200 bg-slate-50">{st.code}</Badge>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">{st.libelle}</td>
                      <td className="px-3 py-2 text-sm text-slate-500">{st.type_libelle}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">{st.nb_dossiers ?? 0}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">{st.nb_pieces ?? 0}</td>
                      <td className="px-3 py-2">
                        {st.actif ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
                        ) : (
                          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Désactivé</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => ouvrirEdition(st)}
                            aria-label={`Modifier ${st.code}`}
                            title="Modifier"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => basculerActif(st)}
                            aria-label={`${st.actif ? 'Désactiver' : 'Activer'} ${st.code}`}
                            title={st.actif ? 'Désactiver' : 'Activer'}
                          >
                            {st.actif ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setASupprimer(st)}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400"
                            aria-label={`Supprimer ${st.code}`}
                            title="Supprimer"
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
          <TextInput
            label="Ordre"
            value={ordreEdition}
            onChange={setOrdreEdition}
            maxLength={4}
            hint="Ordre d'affichage dans le formulaire"
          />
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Le code n'est pas modifiable : il désigne le sous-type dans les
            dossiers déjà enregistrés.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={aSupprimer !== null}
        onClose={() => !suppressionEnCours && setASupprimer(null)}
        onConfirm={supprimer}
        loading={suppressionEnCours}
        danger
        title="Supprimer le sous-type"
        message={`Supprimer « ${aSupprimer?.libelle || aSupprimer?.code || ''} » ? Si des dossiers ou des pièces le référencent, le serveur refusera : désactivez-le dans ce cas.`}
        confirmLabel="Supprimer"
      />
    </AnimatedCard>
  );
}

export default SousTypesPage;
