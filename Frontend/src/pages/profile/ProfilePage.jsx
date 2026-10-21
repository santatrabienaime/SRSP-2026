import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, UserCircle2, ShieldCheck, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { authService } from '../../services/authService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { PasswordInput } from '../../components/fields/index.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { formatDateTime } from '../../utils/formatDate.js';
import {
  passwordRules, isStrongPassword, PASSWORD_MESSAGE,
} from '../../utils/password.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const navigate = useNavigate();
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
      toastSuccess('Mot de passe modifié. Reconnectez-vous.');
      setForm({ ancien: '', nouveau: '', confirmation: '' });
      /* Changer son mot de passe ferme les sessions ouvertes — y compris
         celle-ci. Sans cette déconnexion, la requête suivante échouerait
         avec un 401 et l'utilisateur serait renvoyé à l'écran de
         connexion sans comprendre pourquoi. */
      await logout();
      navigate('/login', { replace: true });
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
    <AnimatedCard title="Mon profil" subtitle="Informations du compte et changement de mot de passe." delay={0}>
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
            revealPassword
            clearable
            autoComplete="current-password"
            value={form.ancien}
            onChange={(e) => setForm((f) => ({ ...f, ancien: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput
              label="Nouveau mot de passe"
              required
              showStrength={false}
              value={form.nouveau}
              onChange={(v) => setForm((f) => ({ ...f, nouveau: v }))}
            />
            <Input
              label="Confirmation"
              type="password"
              required
              revealPassword
              clearable
              autoComplete="new-password"
              value={form.confirmation}
              onChange={(e) => setForm((f) => ({ ...f, confirmation: e.target.value }))}
              success={Boolean(form.confirmation) && form.confirmation === form.nouveau}
              successMessage="Les deux mots de passe correspondent."
              error={
                form.confirmation && form.confirmation !== form.nouveau
                  ? 'Les deux mots de passe ne correspondent pas.'
                  : undefined
              }
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
    </AnimatedCard>
  );
}

export default ProfilePage;