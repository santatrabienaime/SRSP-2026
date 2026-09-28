import { useState } from 'react';
import { KeyRound, UserCircle2, ShieldCheck, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { authService } from '../../services/authService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import {
  passwordRules, isStrongPassword, PASSWORD_MESSAGE,
} from '../../utils/password.js';

export function ProfilePage() {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const [form, setForm] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.ancien || !form.nouveau) {
      setError({ message: 'Tous les champs sont obligatoires.' });
      return;
    }
    if (!isStrongPassword(form.nouveau)) {
      setError({ message: PASSWORD_MESSAGE });
      return;
    }
    if (form.nouveau === form.ancien) {
      setError({ message: "Le nouveau mot de passe doit être différent de l'ancien." });
      return;
    }
    if (form.nouveau !== form.confirmation) {
      setError({ message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword(form.ancien, form.nouveau);
      toastSuccess('Mot de passe modifié.');
      setForm({ ancien: '', nouveau: '', confirmation: '' });
    } catch (err) {
      setError(err);
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const motDePasseExpire = user?.mot_de_passe?.a_changer;
  const joursRestants = user?.mot_de_passe?.jours_restants;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Mon profil</h1>
        <p className="text-sm text-slate-500">Informations du compte et changement de mot de passe.</p>
      </div>

      <Card title="Compte">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <UserCircle2 className="h-8 w-8" />
          </span>
          <div>
            <p className="text-base font-semibold text-slate-800">{user?.email}</p>
            <p className="text-sm text-slate-500">Identifiant : {user?.username}</p>
            <div className="mt-1">
              <Badge className="border-primary-200 bg-primary-50 text-primary-700">
                <ShieldCheck className="mr-1 h-3 w-3" /> {user?.role_nom}
              </Badge>
            </div>
          </div>
        </div>
        {user?.derniere_connexion && (
          <p className="mt-4 text-xs text-slate-400">
            Dernière connexion : {formatDateTime(user.derniere_connexion)}
          </p>
        )}
      </Card>

      <Card title="Changer le mot de passe">
        {motDePasseExpire ? (
          <Alert type="warning" title="Renouvellement obligatoire">
            Votre mot de passe a atteint sa durée de validité. Merci de le
            renouveler pour continuer à travailler en sécurité.
          </Alert>
        ) : (
          joursRestants !== undefined && joursRestants <= 15 && (
            <Alert type="info" title="Renouvellement à prévoir">
              Il vous reste {joursRestants} jour(s) avant le renouvellement
              obligatoire du mot de passe.
            </Alert>
          )
        )}

        {error && <Alert type="error" title="Modification impossible">{error.message}</Alert>}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            required
            value={form.ancien}
            onChange={(e) => setForm((f) => ({ ...f, ancien: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nouveau mot de passe"
              type="password"
              required
              value={form.nouveau}
              onChange={(e) => setForm((f) => ({ ...f, nouveau: e.target.value }))}
            />
            <Input
              label="Confirmation"
              type="password"
              required
              value={form.confirmation}
              onChange={(e) => setForm((f) => ({ ...f, confirmation: e.target.value }))}
            />
          </div>

          {/* Règles de la politique de mot de passe, vérifiées en direct. */}
          <ul className="space-y-1 rounded-md bg-slate-50 p-3">
            {passwordRules.map((r) => {
              const ok = r.test(form.nouveau);
              return (
                <li
                  key={r.label}
                  className={`flex items-center gap-2 text-xs ${
                    ok ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {ok
                    ? <Check className="h-3.5 w-3.5" />
                    : <X className="h-3.5 w-3.5" />}
                  {r.label}
                </li>
              );
            })}
          </ul>

          <Button type="submit" loading={saving}>
            <KeyRound className="h-4 w-4" /> Mettre à jour le mot de passe
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ProfilePage;