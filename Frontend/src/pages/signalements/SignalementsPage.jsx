import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { signalementService } from '../../services/signalementService.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import {
  CarteSignalement, ModaleResolution,
} from '../../components/dossier/SignalementsPanel.jsx';

/**
 * File des dossiers bloqués remontés à la hiérarchie.
 *
 * Le chef de service y voit ce qui n'avance pas dans les divisions, le prend
 * en charge et le referme. Chaque chef de division n'y voit que sa division :
 * le serveur applique ce cloisonnement, l'écran ne fait pas semblant.
 *
 * Un signalement n'est pas un dossier : il ne change pas le statut du dossier
 * et ne remplace pas le workflow. C'est une difficulté nommée, avec un
 * responsable et une décision écrite.
 */
export function SignalementsPage() {
  const { hasAnyPermission } = useAuth();
  const { toastSuccess, toastError } = useNotification();

  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('OUVERT');
  const [filtreType, setFiltreType] = useState('');
  const [filtrePriorite, setFiltrePriorite] = useState('');
  const [cible, setCible] = useState(null);
  const [traitement, setTraitement] = useState(false);

  const peutTraiter = hasAnyPermission(['traiter_signalement']);

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      setListe(await signalementService.list({
        statut: filtreStatut || undefined,
        type: filtreType || undefined,
        priorite: filtrePriorite || undefined,
      }));
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [filtreStatut, filtreType, filtrePriorite]);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const prendre = async (signalement) => {
    setTraitement(true);
    try {
      await signalementService.prendre(signalement.id);
      toastSuccess('Signalement pris en charge.');
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setTraitement(false);
    }
  };

  const refermer = async (resolution) => {
    if (!cible) return;
    setTraitement(true);
    try {
      await signalementService.resoudre(cible.signalement.id, {
        statut: cible.statut,
        resolution,
      });
      toastSuccess(cible.statut === 'REJETE' ? 'Signalement rejeté.' : 'Signalement résolu.');
      setCible(null);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Signalements</h1>
            <p className="text-xs text-slate-500">
              Dossiers bloqués remontés à la hiérarchie
              {liste.length > 0 ? ` · ${liste.length} affiché(s)` : ''}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={charger} title="Recharger la file">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label="Statut"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="OUVERT">Ouverts</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLU">Résolus</option>
            <option value="REJETE">Rejetés</option>
          </Select>
          <Select
            label="Nature"
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
          >
            <option value="">Toutes les natures</option>
            <option value="BLOCAGE">Dossier bloqué</option>
            <option value="INTERLOCUTION">Interlocution</option>
            <option value="ARBITRAGE">Arbitrage</option>
          </Select>
          <Select
            label="Priorité"
            value={filtrePriorite}
            onChange={(e) => setFiltrePriorite(e.target.value)}
          >
            <option value="">Toutes les priorités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="HAUTE">Haute</option>
            <option value="NORMALE">Normale</option>
          </Select>
        </div>
      </Card>

      {chargement ? (
        <Spinner label="Chargement des signalements…" />
      ) : erreur ? (
        <Alert type="error" title="File indisponible">{erreur.message}</Alert>
      ) : liste.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-slate-500">
            Aucun signalement ne correspond à ces filtres.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {liste.map((signalement) => (
            <CarteSignalement
              key={signalement.id}
              signalement={signalement}
              avecDossier
              peutTraiter={peutTraiter}
              onPrendre={prendre}
              onRefermer={(s, statut) => setCible({ signalement: s, statut })}
              enCours={traitement}
            />
          ))}
        </div>
      )}

      <ModaleResolution
        cible={cible}
        enCours={traitement}
        onClose={() => setCible(null)}
        onConfirm={refermer}
      />
    </div>
  );
}

export default SignalementsPage;
