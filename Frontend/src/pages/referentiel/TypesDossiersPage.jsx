import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function TypesDossiersPage() {
  const { toastSuccess, toastError } = useNotification();
  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  const chargerTypes = useCallback(async () => {
    setChargement(true);
    try {
      const liste = await referentielService.typesDossiers();
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
    if (!nouveauNom.trim() || !nouveauLibelle.trim()) return;
    try {
      await referentielService.ajouterTypeDossier({ code: nouveauNom, libelle: nouveauLibelle });
      toastSuccess('Type de dossier créé.');
      setNouveauNom('');
      setNouveauLibelle('');
      await chargerTypes();
    } catch (err) {
      toastError(err.message);
    }
  };

  const supprimerType = async () => {
    setSuppressionEnCours(true);
    try {
      await referentielService.supprimerTypeDossier(aSupprimer.id);
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
    <AnimatedCard title="Types de dossiers" subtitle="Gestion des catégories de dossiers du référentiel." delay={0}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Code (ex: VISA, SOLDE)"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              placeholder="VISA"
            />
          </div>
          <div className="flex-1">
            <Input
              label="Libellé"
              value={nouveauLibelle}
              onChange={(e) => setNouveauLibelle(e.target.value)}
              placeholder="Dossier de visa"
            />
          </div>
          <Button onClick={ajouterType} disabled={!nouveauNom.trim() || !nouveauLibelle.trim()}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <Card title="Types de dossiers existants">
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement…" />
            </div>
          ) : types.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Aucun type de dossier configuré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Code</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Libellé</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Description</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Statut</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2 text-sm font-medium text-slate-700">
                        <Badge className="border-slate-200 bg-slate-50">{t.code}</Badge>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">{t.libelle}</td>
                      <td className="px-3 py-2 text-sm text-slate-500">{t.description || '—'}</td>
                      <td className="px-3 py-2">
                        {t.actif ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Actif</Badge>
                        ) : (
                          <Badge className="border-slate-200 bg-slate-100 text-slate-500">Inactif</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setASupprimer(t)}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400"
                          aria-label={`Supprimer le type ${t.code}`}
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
        title="Supprimer le type de dossier"
        message={`Supprimer le type « ${aSupprimer?.libelle || aSupprimer?.code || ''} » ? Les dossiers qui l'utilisent empêcheront la suppression.`}
        confirmLabel="Supprimer"
      />
    </AnimatedCard>
  );
}

export default TypesDossiersPage;
