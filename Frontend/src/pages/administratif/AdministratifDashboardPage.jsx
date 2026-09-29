import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus, BookUser, FileCheck2, Wallet, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { administratifService } from '../../services/administratifService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';

/**
 * Point d'entrée de la Coordinatrice : ce qu'elle a à faire aujourd'hui.
 *
 * Les compteurs portent sur ce qui RESTE À FAIRE, pas sur le total. Une
 * Coordinatrice qui arrive le matin doit voir d'un coup d'œil ce qui l'attend,
 * pas apprendre qu'elle a déjà traité 40 dossiers.
 */
export function AdministratifDashboard() {
  const { toastError } = useNotification();
  const [tdb, setTdb] = useState(null);
  const [immatriculations, setImmatriculations] = useState([]);
  const [augure, setAugure] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      administratifService.tableauDeBord(),
      administratifService.immatriculations.lister({ limit: 5 }),
      administratifService.augure.lister(),
      administratifService.paiements.lister(),
    ])
      .then(([t, i, a, p]) => {
        setTdb(t);
        setImmatriculations(Array.isArray(i) ? i.slice(0, 5) : []);
        setAugure(Array.isArray(a) ? a.filter((x) => x.statut === 'A_INSERER').slice(0, 5) : []);
        setPaiements(Array.isArray(p) ? p.filter((x) => x.statut === 'EN_ATTENTE').slice(0, 5) : []);
      })
      .catch((e) => { setError(e); toastError(e.message); })
      .finally(() => setLoading(false));
  }, [toastError]);

  if (loading) return <Spinner label="Chargement…" />;
  if (error) {
    return (
      <Alert type="error" title="Chargement impossible">
        {error.message}
      </Alert>
    );
  }

  const actions = [
    {
      to: '/administratif/immatriculations',
      titre: 'Immatriculations',
      icon: BookUser,
      restant: tdb?.imm_attente || 0,
      total: tdb?.immatriculations || 0,
      libelle: 'en attente',
      detail: 'Fonctionnaires à immatriculer',
    },
    {
      to: '/administratif/augure',
      titre: 'Insertions Augure',
      icon: FileCheck2,
      restant: tdb?.augure_restant || 0,
      total: tdb?.augure || 0,
      libelle: 'à insérer',
      detail: 'Fiches à saisir dans Augure',
    },
    {
      to: '/administratif/paiements',
      titre: 'Modes de paiement',
      icon: Wallet,
      restant: tdb?.paiements_attente || 0,
      total: tdb?.paiements || 0,
      libelle: 'à traiter',
      detail: 'Changements de mode de paiement',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Gestion administrative</h1>
        <p className="text-sm text-slate-500">
          Immatriculation des fonctionnaires, insertions Augure et changements de mode de paiement.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.titre} to={a.to} className="block">
              <Card className="h-full transition hover:border-primary-300 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{a.titre}</p>
                      <p className="text-[11px] text-slate-500">{a.detail}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-800">{a.restant}</p>
                <p className="text-xs text-slate-500">
                  {a.libelle} · {a.total} au total
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Link to="/administratif/immatriculations">
          <Button>
            <UserPlus className="h-4 w-4" /> Immatriculer un fonctionnaire
          </Button>
        </Link>
      </div>

      {augure.length > 0 && (
        <Card title={`Insertions Augure à faire (${augure.length})`}>
          <ul className="divide-y divide-slate-100">
            {augure.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm text-slate-700">
                  <span className="font-medium">{a.nom} {a.prenom}</span>
                  <span className="text-slate-400"> — {a.numero}</span>
                </span>
                <span className="text-xs text-amber-700">Pas encore inséré</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {paiements.length > 0 && (
        <Card
          title={`Changements de paiement à traiter (${paiements.length})`}
          actions={
            <Link to="/administratif/paiements">
              <Button size="sm" variant="secondary">Traiter</Button>
            </Link>
          }
        >
          <ul className="divide-y divide-slate-100">
            {paiements.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm text-slate-700">
                  <span className="font-medium">{p.nom} {p.prenom}</span>
                  <span className="text-slate-400"> — {p.mode}</span>
                </span>
                <span className="text-xs text-slate-500">{p.motif}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tdb?.imm_attente === 0 && tdb?.augure_restant === 0 && tdb?.paiements_attente === 0 && (
        <Alert type="success" title="Rien à faire aujourd'hui">
          Aucune immatriculation, aucune insertion Augure et aucun changement de paiement
          ne sont en attente.
        </Alert>
      )}

      {paiements.length === 0 && tdb?.paiements_attente > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          Certaines demandes de paiement dépassent la liste affichée.
        </p>
      )}
    </div>
  );
}

export default AdministratifDashboard;
