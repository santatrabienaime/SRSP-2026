import { useState, useEffect } from 'react';
import { FolderKanban, FileText, Plus, Trash2, Edit3 } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function TypesDossiersPage() {
  const { toastSuccess, toastError } = useNotification();
  const [types, setTypes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');

  const chargerTypes = async () => {
    setChargement(true);
    try {
      const liste = await referentielService.typesDossiers();
      setTypes(liste || []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  };

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

  const supprimerType = async (id) => {
    if (!window.confirm('Supprimer ce type de dossier ?')) return;
    try {
      await referentielService.supprimerTypeDossier(id);
      toastSuccess('Type supprimé.');
      await chargerTypes();
    } catch (err) {
      toastError(err.message);
    }
  };

  useEffect(() => {
    chargerTypes();
  }, []);

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
          <Button onClick={ajouterType}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <Card title="Types de dossiers existants">
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement..." />
            </div>
          ) : types.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Aucun type de dossier configuré.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Code</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Libellé</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="px-3 py-2 text-sm font-medium text-slate-700">{t.code}</td>
                    <td className="px-3 py-2 text-sm text-slate-600">{t.libelle}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => supprimerType(t.id)}
                        className="text-red-600 hover:bg-red-50 dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

export default TypesDossiersPage;