import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function TypesCourriersPage() {
  const { toastSuccess, toastError } = useNotification();
  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  const chargerTypes = useCallback(async () => {
    setChargement(true);
    try {
      const liste = await referentielService.typesCourriers();
      setTypes(liste || []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  }, [toastError]);

  useEffect(() => {
    Promise.resolve().then(chargerTypes);
  }, [chargerTypes]);

  const ajouterType = async () => {
    if (!nouveauLibelle.trim()) return;
    try {
      await referentielService.ajouterTypeCourrier({ libelle: nouveauLibelle.trim() });
      toastSuccess('Type de courrier créé.');
      setNouveauLibelle('');
      await chargerTypes();
    } catch (err) {
      toastError(err.message);
    }
  };

  const supprimerType = async () => {
    setSuppressionEnCours(true);
    try {
      await referentielService.supprimerTypeCourrier(aSupprimer.id);
      toastSuccess('Type supprimé.');
      setASupprimer(null);
      await chargerTypes();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

  return (
    <AnimatedCard
      title="Types de courriers"
      subtitle="Libellés proposés dans le formulaire d'enregistrement d'un courrier."
      delay={0}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Libellé"
              value={nouveauLibelle}
              onChange={(e) => setNouveauLibelle(e.target.value)}
              placeholder="Demande"
            />
          </div>
          <Button onClick={ajouterType} disabled={!nouveauLibelle.trim()}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <Card title="Types de courriers existants">
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement…" />
            </div>
          ) : types.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Aucun type de courrier configuré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Libellé</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2 text-sm text-slate-600">{t.libelle}</td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setASupprimer(t)}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400"
                          aria-label={`Supprimer le type ${t.libelle}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={aSupprimer !== null}
        onClose={() => !suppressionEnCours && setASupprimer(null)}
        onConfirm={supprimerType}
        loading={suppressionEnCours}
        danger
        title="Supprimer le type de courrier"
        message={`Supprimer le type « ${aSupprimer?.libelle || ''} » ? Les courriers qui l'utilisent empêcheront la suppression.`}
        confirmLabel="Supprimer"
      />
    </AnimatedCard>
  );
}

export default TypesCourriersPage;
