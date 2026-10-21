import { useState, useEffect, useCallback } from 'react';
import { Cpu, HardDrive, MemoryStick, Timer, RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

/**
 * Informations système.
 *
 * L'application tourne sur l'ordinateur de l'agent : savoir quel espace
 * reste sur le disque, et si la machine tient debout, n'est pas une
 * curiosité d'administrateur — c'est ce qui explique un export qui ne
 * finit pas, ou une machine qui s'est arrêtée de répondre.
 *
 * Le bloc n'est disponible que pour qui administre la plateforme : ces
 * chiffres décrivent la machine, pas le service.
 */

/** Une taille en octets, lisible. */
function formaterOctets(octets) {
  if (!octets && octets !== 0) return '—';
  const unites = ['o', 'Ko', 'Mo', 'Go', 'To'];
  let valeur = Number(octets);
  let i = 0;
  while (valeur >= 1024 && i < unites.length - 1) { valeur /= 1024; i += 1; }
  return `${valeur.toFixed(i === 0 ? 0 : 1)} ${unites[i]}`;
}

/** Une durée en secondes, lisible. */
function formaterDuree(secondes) {
  if (secondes === null || secondes === undefined) return '—';
  const s = Math.floor(secondes);
  const j = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (j > 0) return `${j} j ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

export function SystemInfoCard() {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const r = await apiClient.get('/admin/system');
      setDonnees(r.data || null);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  return (
    <Card
      title="Système"
      subtitle="La machine qui sert l'application"
      actions={
        <Button variant="ghost" size="sm" onClick={charger} title="Actualiser">
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
    >
      {chargement ? (
        <Spinner className="py-4" />
      ) : erreur ? (
        <Alert type="warning" title="Informations indisponibles">
          {erreur.message}
        </Alert>
      ) : !donnees ? (
        <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
          Aucune information système disponible.
        </p>
      ) : (
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-2">
            <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-500">Processeur</dt>
              <dd className="text-slate-800">
                {donnees.coeurs} cœur{donnees.coeurs > 1 ? 's' : ''}
                {donnees.charge_pct !== null && (
                  <Badge className="ml-2 border-slate-200 bg-slate-50 text-slate-600">
                    {donnees.charge_pct} % de charge
                  </Badge>
                )}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MemoryStick className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-500">Mémoire</dt>
              <dd className="text-slate-800">
                {formaterOctets(donnees.memoire?.disponible)} disponibles
                {donnees.memoire_utilisee_pct !== null && (
                  <Badge className="ml-2 border-slate-200 bg-slate-50 text-slate-600">
                    {donnees.memoire_utilisee_pct} % utilisés
                  </Badge>
                )}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-500">Disque</dt>
              <dd className="text-slate-800">
                {donnees.disque
                  ? `${formaterOctets(donnees.disque.libre)} libres sur ${formaterOctets(donnees.disque.total)}`
                  : 'Non mesurable sur cette machine'}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Timer className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-500">Application</dt>
              <dd className="text-slate-800">
                ouverte depuis {formaterDuree(donnees.uptime_processus)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Timer className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-500">Machine</dt>
              <dd className="text-slate-800">
                allumée depuis {formaterDuree(donnees.uptime_systeme)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <dt className="text-xs text-slate-500">Exécution</dt>
              <dd className="text-slate-800">{donnees.node}</dd>
            </div>
          </div>
        </dl>
      )}
    </Card>
  );
}

export default SystemInfoCard;
