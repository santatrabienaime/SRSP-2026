import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/* La colonne `phase` est un enum en base : seules ces deux valeurs passent. */
const PHASES = {
  DEPOUILLEMENT: 'Dépouillement',
  ARCHIVAGE: 'Archivage',
};

export function TypesPiecesPage() {
  const { toastSuccess, toastError } = useNotification();
  const [pieces, setPieces] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [nouvellePhase, setNouvellePhase] = useState('ARCHIVAGE');
  const [nouvelleDivision, setNouvelleDivision] = useState('');
  const [nouveauObligatoire, setNouveauObligatoire] = useState(true);
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  const chargerPieces = useCallback(async () => {
    setChargement(true);
    try {
      const liste = await referentielService.typesPieces();
      setPieces(liste || []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  }, [toastError]);

  useEffect(() => {
    Promise.resolve().then(chargerPieces);
  }, [chargerPieces]);

  useEffect(() => {
    referentielService
      .divisions()
      .then((d) => setDivisions(Array.isArray(d) ? d : []))
      .catch(() => { /* filtre indisponible : le reste de la page fonctionne */ });
  }, []);

  const ajouterType = async () => {
    if (!nouveauNom.trim() || !nouveauLibelle.trim()) return;
    try {
      await referentielService.ajouterTypePiece({
        code: nouveauNom,
        libelle: nouveauLibelle,
        phase: nouvellePhase,
        obligatoire: nouveauObligatoire ? 1 : 0,
        division_code: nouvelleDivision || null,
      });
      toastSuccess('Type de pièce créé.');
      setNouveauNom('');
      setNouveauLibelle('');
      setNouvellePhase('ARCHIVAGE');
      setNouvelleDivision('');
      setNouveauObligatoire(true);
      await chargerPieces();
    } catch (err) {
      toastError(err.message);
    }
  };

  const supprimerType = async () => {
    setSuppressionEnCours(true);
    try {
      await referentielService.supprimerTypePiece(aSupprimer.id);
      toastSuccess('Type supprimé.');
      setASupprimer(null);
      await chargerPieces();
    } catch (err) {
      toastError(err.message);
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const creationValide = Boolean(nouveauNom.trim()) && Boolean(nouveauLibelle.trim());

  return (
    <AnimatedCard title="Types de pièces" subtitle="Gestion des types de pièces justificatives du référentiel." delay={0}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <Input
            label="Code (ex: CIN, FACTURE)"
            value={nouveauNom}
            onChange={(e) => setNouveauNom(e.target.value)}
            placeholder="CIN"
          />
          <Input
            label="Libellé"
            value={nouveauLibelle}
            onChange={(e) => setNouveauLibelle(e.target.value)}
            placeholder="Carte d'identité nationale"
          />
          <Select label="Phase" value={nouvellePhase} onChange={(e) => setNouvellePhase(e.target.value)}>
            {Object.entries(PHASES).map(([code, libelle]) => (
              <option key={code} value={code}>{libelle}</option>
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

        <Card title="Types de pièces existants">
          {chargement ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner label="Chargement…" />
            </div>
          ) : pieces.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Aucun type de pièce configuré.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Code</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Libellé</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Phase</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Division</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Obligatoire</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pieces.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2 text-sm font-medium text-slate-700">
                        <Badge className="border-slate-200 bg-slate-50">{t.code}</Badge>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600">{t.libelle}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">
                        {PHASES[t.phase] || t.phase || '—'}
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
        title="Supprimer le type de pièce"
        message={`Supprimer le type « ${aSupprimer?.libelle || aSupprimer?.code || ''} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </AnimatedCard>
  );
}

export default TypesPiecesPage;
