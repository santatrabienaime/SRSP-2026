import { useState, useEffect } from 'react';
import { Database, Download, RefreshCcw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { backupService } from '../../services/backupService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

export function BackupPage() {
  const { toastSuccess, toastError } = useNotification();
  const [sauvegardes, setSauvegardes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(null); // 'creer' | 'restaurer' | 'supprimer'

  const chargerSauvegardes = async () => {
    setChargement(true);
    try {
      const liste = await backupService.list();
      setSauvegardes(liste || []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  };

  const creerSauvegarde = async () => {
    setEnCours('creer');
    try {
      await backupService.creer();
      toastSuccess('Sauvegarde créée avec succès.');
      await chargerSauvegardes();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const restaurerSauvegarde = async (nom) => {
    if (!window.confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Toutes les données actuelles seront remplacées.')) return;
    setEnCours('restaurer');
    try {
      await backupService.restaurer(nom);
      toastSuccess('Sauvegarde restaurée avec succès.');
      await chargerSauvegardes();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const supprimerSauvegarde = async (nom) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) return;
    setEnCours('supprimer');
    try {
      await backupService.supprimer(nom);
      toastSuccess('Sauvegarde supprimée.');
      await chargerSauvegardes();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const telechargerSauvegarde = async (nom) => {
    try {
      const blob = await backupService.telecharger(nom);
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = nom;
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toastError(err.message);
    }
  };

  useEffect(() => {
    chargerSauvegardes();
  }, []);

  return (
    <AnimatedCard title="Sauvegarde et restauration" subtitle="Gestion des sauvegardes de la base de données SRSP" delay={0}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Gestion des sauvegardes</h2>
            <p className="text-sm text-slate-500">
              Créez, restaurez et téléchargez des sauvegardes de la base de données. Conforme au CDC §16.
            </p>
          </div>
          <Button
            onClick={creerSauvegarde}
            loading={enCours === 'creer'}
            disabled={enCours !== null}
          >
            <Database className="h-4 w-4" /> Nouvelle sauvegarde
          </Button>
        </div>

        {chargement ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner label="Chargement des sauvegardes…" />
          </div>
        ) : sauvegardes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Database className="w-16 h-16 text-slate-400" />
            <p className="mt-3 text-sm text-slate-500">Aucune sauvegarde disponible.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Nom du fichier</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Date</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Taille</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sauvegardes.map((s) => (
                  <tr key={s.nom} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{s.nom}</span>
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-500">
                      {s.date ? formatDateTime(s.date) : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-500">
                      {s.taille ? (s.taille / 1024 / 1024).toFixed(2) + ' Mo' : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => telechargerSauvegarde(s.nom)}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400"
                        >
                          <Download className="h-3.5 w-3.5" /> Télécharger
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restaurerSauvegarde(s.nom)}
                          loading={enCours === 'restaurer' && s.nom === s.nom}
                          disabled={enCours === 'restaurer' && s.nom !== s.nom}
                          className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
                        >
                          Restaurer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => supprimerSauvegarde(s.nom)}
                          loading={enCours === 'supprimer' && s.nom === s.nom}
                          disabled={enCours === 'supprimer' && s.nom !== s.nom}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

export default BackupPage;