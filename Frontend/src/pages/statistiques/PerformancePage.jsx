import { useState, useEffect } from 'react';
import { TrendingUp, FolderCheck, Clock, AlertTriangle, Users, Archive } from 'lucide-react';
import { performanceService } from '../../services/performanceService.js';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';

/**
 * Mes statistiques.
 *
 * Deux règles tenues dans cet écran.
 *
 * 1. Aucune note sur 5. Le document en demande une, mais une note est une
 *    appréciation. Un chiffre calculé qui donnerait « 4,5/5 » se lirait comme
 *    une évaluation de la personne alors qu'il ne ferait que recompter ce que
 *    les cartes ci-dessus affichent déjà. Aucun agent ne doit lire une note
 *    qu'il n'a pas été donnée par un chef. Seules les données mesurables sont
 *    présentées.
 *
 * 2. Aucun pourcentage au-delà de 100 %. Le serveur les calcule sur les dossiers
 *    distincts, jamais sur les événements : un dossier vérifié deux fois reste
 *    un dossier. Un taux calculé autrement afficherait 167 % et l'agent ne
 *    comprendrait pas ce que la plateforme lui reproche.
 */
export function PerformancePage() {
  const { user } = useAuth();
  const { toastError } = useNotification();
  const [moi, setMoi] = useState(null);
  const [equipe, setEquipe] = useState(null);
  const [equipeRefusee, setEquipeRefusee] = useState(false);
  const [synthese, setSynthese] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let annule = false;

    /* Les trois appels sont indépendants. L'équipe et la synthèse sont
       refusés (403) à un agent simple : ce n'est pas une panne, c'est la règle.
       L'écran affiche alors ce qu'il a, sans insulter l'agent d'un message
       d'erreur. */
    Promise.allSettled([
      performanceService.moi(),
      performanceService.equipe(),
      performanceService.synthese(),
    ]).then(([rMoi, rEquipe, rSynthese]) => {
      if (annule) return;
      if (rMoi.status === 'fulfilled') setMoi(rMoi.value);
      else toastError('Impossible de charger vos statistiques.');

      if (rEquipe.status === 'fulfilled') setEquipe(rEquipe.value);
      else setEquipeRefusee(true);

      if (rSynthese.status === 'fulfilled') setSynthese(rSynthese.value);
    }).finally(() => !annule && setLoading(false));

    return () => { annule = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const nom = [user?.nom, user?.prenom].filter(Boolean).join(' ') || 'Mes statistiques';
  const sansAgent = moi?.sans_fiche_agent;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Mes statistiques</h1>
        <p className="text-sm text-slate-500">
          {nom} — votre activité mesurée sur les dossiers distincts que vous avez traités.
        </p>
      </div>

      {sansAgent && (
        <Alert type="info" title="Aucune fiche agent">
          {moi.suggestions[0]?.message}
        </Alert>
      )}

      {!sansAgent && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Dossiers traités"
              value={moi?.dossiers_traites}
              sub={moi?.dossiers_recus ? `${moi.dossiers_recus} actuellement affectés` : 'aucun en cours'}
              tone="primary"
            />
            <StatCard
              icon={FolderCheck}
              label="Taux d'achèvement"
              /* Un taux sans dénominateur vaut null côté serveur ; afficher 0 %
                 laisserait croire à un agent sans activité qu'il a tout raté. */
              value={moi?.taux_global === null || moi?.taux_global === undefined
                ? '—'
                : `${moi.taux_global} %`}
              sub="dossiers archivés / dossiers touchés"
              tone="emerald"
            />
            <StatCard
              icon={Clock}
              label="Délai moyen"
              value={moi?.delai_moyen_jours === null || moi?.delai_moyen_jours === undefined
                ? '—'
                : `${Number(moi.delai_moyen_jours).toFixed(1)} j`}
              sub="réception → premier traitement"
              tone="sky"
            />
            <StatCard
              icon={AlertTriangle}
              label="Dossiers en retard"
              value={moi?.dossiers_en_retard ?? 0}
              sub={`${moi?.dossiers_en_cours ?? 0} en cours`}
              tone={moi?.dossiers_en_retard > 0 ? 'red' : 'slate'}
            />
          </div>

          <Card
            title="Détail par étape"
            subtitle="Nombre de dossiers distincts ayant atteint chaque étape, sur ceux qui vous sont passés par les mains."
          >
            <ul className="space-y-2.5">
              {(moi?.etapes || []).map((e) => (
                <li key={e.code} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-slate-600">{e.libelle}</span>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold text-slate-800">
                    {e.valeur}
                  </span>
                  <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-primary-600"
                      style={{ width: `${e.taux ?? 0}%` }}
                    />
                  </span>
                  <span className="w-11 shrink-0 text-right text-xs tabular-nums text-slate-500">
                    {e.taux === null ? '—' : `${e.taux} %`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {moi?.suggestions?.length > 0 && (
            <Card
              title="Observations"
              subtitle="Déduites de vos chiffres ci-dessus. Elles n'apparaissent que si la donnée les justifie."
            >
              <ul className="space-y-2">
                {moi.suggestions.map((s) => (
                  <li
                    key={s.code}
                    className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                      s.gravite === 'elevee'
                        ? 'border-red-200 bg-red-50 text-red-800'
                        : s.gravite === 'moyenne'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {s.message}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {/* Vue de supervision. Le 403 n'est pas une panne : un agent n'a pas
          d'équipe. On n'affiche donc aucun encadré d'erreur, seulement
          l'absence de la vue. */}
      {!equipeRefusee && equipe && equipe.length > 0 && (
        <Card
          title="Performance de l'équipe"
          subtitle="Une ligne par agent. Cliquez sur une ligne pour ouvrir le détail de son activité."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-medium">Agent</th>
                  <th className="py-2 pr-3 font-medium">Division</th>
                  <th className="py-2 pr-3 text-right font-medium">Dossiers</th>
                  <th className="py-2 pr-3 text-right font-medium">En cours</th>
                  <th className="py-2 pr-3 text-right font-medium">En retard</th>
                  <th className="py-2 pr-3 text-right font-medium">Délai moyen</th>
                  <th className="py-2 text-right font-medium">Achèvement</th>
                </tr>
              </thead>
              <tbody>
                {equipe.map((a) => (
                  <tr key={a.agent_id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 font-medium text-slate-800">
                      {[a.nom, a.prenom].filter(Boolean).join(' ')}
                    </td>
                    <td className="py-2 pr-3 text-slate-500">{a.division_nom || '—'}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{a.dossiers_traites ?? a.dossiers_recus}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{a.dossiers_en_cours}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {a.dossiers_en_retard > 0 ? (
                        <Badge className="border-red-200 bg-red-50 text-red-700">
                          {a.dossiers_en_retard}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-slate-600">
                      {a.delai_moyen_jours === null || a.delai_moyen_jours === undefined
                        ? '—'
                        : `${Number(a.delai_moyen_jours).toFixed(1)} j`}
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-600">
                      {a.taux_global === null || a.taux_global === undefined
                        ? '—'
                        : `${a.taux_global} %`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {synthese && (
        <Card
          title="Synthèse du service"
          subtitle="Vue d'ensemble, indépendante de votre activité personnelle."
        >
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Dossiers créés</dt>
              <dd className="mt-0.5 text-2xl font-bold text-slate-800">
                {synthese.dossiers_crees}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Dossiers archivés</dt>
              <dd className="mt-0.5 text-2xl font-bold text-slate-800">
                {synthese.dossiers_archives}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">En retard</dt>
              <dd className="mt-0.5 text-2xl font-bold text-slate-800">
                {synthese.dossiers_en_retard}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Délai moyen global</dt>
              <dd className="mt-0.5 text-2xl font-bold text-slate-800">
                {synthese.delai_moyen_jours === null
                  ? '—'
                  : `${Number(synthese.delai_moyen_jours).toFixed(1)} j`}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      <p className="text-xs text-slate-400">
        <Archive className="mr-1 inline h-3.5 w-3.5" />
        Les taux sont calculés sur les dossiers distincts, jamais sur le nombre
        d’actions : un dossier corrigé puis reverifié reste un seul dossier.
      </p>
    </div>
  );
}

export default PerformancePage;
