import { useState, useEffect, useCallback } from 'react';
import { Database, Download, Trash2, ShieldCheck } from 'lucide-react';
import { backupService } from '../../services/backupService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { formatDateTime } from '../../utils/formatDate.js';

/**
 * Sauvegarde et restauration de la base (CDC §16).
 *
 * `enCours` mémorise l'action ET le fichier visé : sans le nom, toutes les
 * lignes du tableau afficheraient l'indicateur de chargement pendant qu'une
 * seule sauvegarde est traitée.
 */
export function BackupPage() {
  const { toastSuccess, toastError } = useNotification();
  const [sauvegardes, setSauvegardes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(null); // { action: 'creer' | 'restaurer' | 'supprimer' | 'verifier', nom? }
  // Confirmation avant un acte destructeur (restauration, suppression).
  const [confirm, setConfirm] = useState(null); // { action, nom }
  const [verifications, setVerifications] = useState({}); // nom -> { valide, taille }

  const chargerSauvegardes = useCallback(async () => {
    setChargement(true);
    try {
      const liste = await backupService.list();
      setSauvegardes(liste || []);
    } catch (err) {
      toastError(err.message);
    } finally {
      setChargement(false);
    }
  }, [toastError]);

  useEffect(() => {
    Promise.resolve().then(chargerSauvegardes);
  }, [chargerSauvegardes]);

  const creerSauvegarde = async () => {
    setEnCours({ action: 'creer' });
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

  const executer = async () => {
    const { action, nom } = confirm;
    setEnCours({ action, nom });
    try {
      if (action === 'restaurer') {
        await backupService.restaurer(nom);
        toastSuccess('Sauvegarde restaurée avec succès.');
      } else {
        await backupService.supprimer(nom);
        toastSuccess('Sauvegarde supprimée.');
      }
      setConfirm(null);
      await chargerSauvegardes();
    } catch (err) {
      toastError(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const verifierSauvegarde = async (nom) => {
    setEnCours({ action: 'verifier', nom });
    try {
      const r = await backupService.verifier(nom);
      const valide = Boolean(r?.valide);
      setVerifications((v) => ({ ...v, [nom]: valide }));
      if (valide) toastSuccess(`Sauvegarde « ${nom} » intègre.`);
      else toastError(`Sauvegarde « ${nom} » vide ou corrompue.`);
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

  const actif = (action, nom) => enCours?.action === action && enCours?.nom === nom;

  return (
    <AnimatedCard
      title="Sauvegarde et restauration"
      subtitle="Gestion des sauvegardes de la base de données SRSP"
      delay={0}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Gestion des sauvegardes</h2>
            <p className="text-sm text-slate-500">
              Créez, vérifiez, restaurez et téléchargez des sauvegardes de la base de données. Conforme au CDC §16.
            </p>
          </div>
          <Button
            onClick={creerSauvegarde}
            loading={enCours?.action === 'creer'}
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
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Nom du fichier</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Date</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Taille</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Intégrité</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sauvegardes.map((s) => (
                  <tr
                    key={s.nom}
                    className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{s.nom}</span>
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-500">
                      {s.date ? formatDateTime(s.date) : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-500">
                      {s.taille ? (s.taille / 1024 / 1024).toFixed(2) + ' Mo' : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {verifications[s.nom] === undefined ? (
                        <span className="text-slate-400">—</span>
                      ) : verifications[s.nom] ? (
                        <span className="font-medium text-emerald-600">Intègre</span>
                      ) : (
                        <span className="font-medium text-red-600">Corrompue</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => telechargerSauvegarde(s.nom)}
                          disabled={enCours !== null}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400"
                        >
                          <Download className="h-3.5 w-3.5" /> Télécharger
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifierSauvegarde(s.nom)}
                          loading={actif('verifier', s.nom)}
                          disabled={enCours !== null && !actif('verifier', s.nom)}
                          className="text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Vérifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirm({ action: 'restaurer', nom: s.nom })}
                          loading={actif('restaurer', s.nom)}
                          disabled={enCours !== null && !actif('restaurer', s.nom)}
                          className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
                        >
                          Restaurer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirm({ action: 'supprimer', nom: s.nom })}
                          loading={actif('supprimer', s.nom)}
                          disabled={enCours !== null && !actif('supprimer', s.nom)}
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

        <ConfirmDialog
          open={confirm !== null}
          onClose={() => !enCours && setConfirm(null)}
          onConfirm={executer}
          loading={enCours !== null}
          danger
          title={confirm?.action === 'restaurer' ? 'Restaurer la sauvegarde' : 'Supprimer la sauvegarde'}
          message={
            confirm?.action === 'restaurer'
              ? `Restaurer « ${confirm?.nom} » ? Toutes les données actuelles seront remplacées par le contenu de ce dump.`
              : `Supprimer définitivement « ${confirm?.nom} » ? Cette action est irréversible.`
          }
          confirmLabel={confirm?.action === 'restaurer' ? 'Restaurer' : 'Supprimer'}
        />
      </div>
    </AnimatedCard>
  );
}

export default BackupPage;
