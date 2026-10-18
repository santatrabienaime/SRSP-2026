import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function TypesPiecesPage() {
  const { toastSuccess, toastError } = useNotification();
  const [pieces, setPieces] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');

  const chargerPieces = async () => {
    setChargement(true);
    try {
      const liste = await referentielService.typesPieces();
      setPieces(liste || []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  };

  const ajouterType = async () => {
    if (!nouveauNom.trim() || !nouveauLibelle.trim()) return;
    try {
      await referentielService.ajouterTypePiece({ code: nouveauNom, libelle: nouveauLibelle });
      toastSuccess('Type de pièce créé.');
      setNouveauNom('');
      setNouveauLibelle('');
      await chargerPieces();
    } catch (err) {
      toastError(err.message);
    }
  };

  const supprimerType = async (id) => {
    if (!window.confirm('Supprimer ce type de pièce ?')) return;
    try {
      await referentielService.supprimerTypePiece(id);
      toastSuccess('Type supprimé.');
      await chargerPieces();
    } catch (err) {
      toastError(err.message);
    }
  };

  useEffect(() => {
    chargerPieces();
  }, []);

  return (
    <AnimatedCard title="Types de pièces" subtitle="Gestion des types de pièces justificatives du référentiel." delay={0}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Code (ex: CIN, FACTURE)"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              placeholder="CIN"
            />
          </div>
          <div className="flex-1">
            <Input
              label="Libellé"
              value={nouveauLibelle}
              onChange={(e) => setNouveauLibelle(e.target.value)}
              placeholder="Carte d'identité nationale"
            />
          </div>
          <Button onClick={ajouterType}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        <Card title="Types de pièces existants">
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement..." />
            </div>
          ) : pieces.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Aucun type de pièce configuré.
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
                {pieces.map((t) => (
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

export default TypesPiecesPage;