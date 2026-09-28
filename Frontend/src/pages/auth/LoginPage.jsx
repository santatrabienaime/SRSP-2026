import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { landingPathFor } from '../../utils/landing.js';

export function LoginPage() {
  const { login } = useAuth();
  const { toastSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const id = identifiant.trim();
    if (!id || !password) {
      setError({ message: 'Veuillez renseigner votre identifiant et votre mot de passe.' });
      return;
    }
    setLoading(true);
    try {
      const profil = await login(id, password);
      toastSuccess('Connexion réussie.');
      // On conduit l'utilisateur vers l'interface qui le concerne, et non vers
      // la page demandée qui pourrait être hors de son périmètre (page vide,
      // redirection ou erreur).
      navigate(landingPathFor(profil, from), { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:py-12">
      {/* Décor : fond dégradé, trame technique, halos et vignette basse.
          aria-hidden : c'est de la décoration, elle ne doit pas être lue. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1e3a8a_0%,#0b1220_45%,#020617_100%)]" />
        <div className="absolute inset-0 grille-futur" />
        <div className="absolute -left-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-primary-600/25 blur-3xl motion-safe:animate-halo" />
        <div
          className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-600/15 blur-3xl motion-safe:animate-halo"
          style={{ animationDelay: '-7s' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
        {/* ---- Colonne identité (masquée sur mobile : la carte-prime) ---- */}
        <section className="hidden lg:block motion-safe:animate-ligne">
          {/* Emplacement réservé au logo officiel (armoiries / ministère).
              À remplacer par l'image réelle. */}
          <div className="lueur-logo mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[.07] text-lg font-bold tracking-wider text-white backdrop-blur-md">
            SRSP
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
            République de Madagascar
          </p>
          <p className="mt-1.5 text-sm italic text-white/40">
            Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
          </p>

          <div aria-hidden="true" className="my-6 max-w-[18rem] space-y-[3px]">
            <div className="h-px w-full bg-gradient-to-r from-white/40 to-transparent" />
            <div className="h-px w-full bg-gradient-to-r from-transparent to-white/20" />
          </div>

          <h2 className="max-w-md text-sm font-bold uppercase leading-relaxed tracking-wide text-white/90">
            Ministère de l&apos;Économie et des Finances
          </h2>
          <p className="mt-2 max-w-md text-2xl font-semibold leading-tight motion-safe:animate-defilement texte-degrade">
            Service Régional de la Solde et des Pensions Fitovinany
          </p>

          <p className="mt-7 max-w-sm text-sm leading-relaxed text-white/45">
            Plateforme de gestion des dossiers administratifs : réception,
            orientation, instruction, validation et archivage, avec
            traçabilité complète des actes.
          </p>
        </section>

        {/* ---- Colonne formulaire ---- */}
        <section className="relative w-full motion-safe:animate-monte">
          {/* Balayage lumineux sur le pourtour de la carte. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-[19px] opacity-60 blur-[1px] motion-safe:animate-bordure"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, #3b82f6 60deg, #22d3ee 120deg, transparent 200deg, transparent 360deg)',
            }}
          />

          <div className="verre relative rounded-[18px] p-7 shadow-2xl shadow-slate-950/60 ring-1 ring-white/10 sm:p-8">
            {/* En-tête officiel, version mobile de l'identité. */}
            <header className="mb-7 text-center lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                République de Madagascar
              </p>
              <p className="mt-1 text-[11px] italic text-white/40">
                Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
              </p>
              <div aria-hidden="true" className="mx-auto my-4 max-w-[13rem] space-y-[3px]">
                <div className="h-px w-full bg-white/25" />
                <div className="h-px w-full bg-white/15" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/85">
                Ministère de l&apos;Économie et des Finances
              </p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm font-semibold leading-snug texte-degrade">
                Service Régional de la Solde et des Pensions Fitovinany
              </p>
            </header>

            <h1 className="text-center text-lg font-semibold text-white">
              Connexion
            </h1>
            <p className="mt-1 text-center text-[11px] text-white/45">
              Accédez à votre espace de travail
            </p>

            {/* role=alert : le message est lu par les lecteurs d'écran dès
                qu'il apparaît. */}
            <div role="alert" aria-live="assertive" className="mt-5 empty:mt-0">
              {error && (
                <div className="mb-1 motion-safe:animate-secousse">
                  <Alert type="error" title="Connexion impossible">
                    {error.message}
                  </Alert>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                tone="dark"
                label="Identifiant ou email"
                required
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="prenom.nom@srsp.mg"
              />
              <Input
                tone="dark"
                label="Mot de passe"
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="accent"
                loading={loading}
                className="mt-1 w-full py-3 text-[15px] transition-transform"
              >
                <LogIn className="h-4 w-4" /> Se connecter
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/mot-de-passe-oublie"
                className="text-xs font-medium text-white/50 transition-colors hover:text-cyan-300"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-white/10 pt-5 text-[10px] text-white/35">
              <ShieldCheck className="h-3.5 w-3.5" />
              Connexion chiffrée — accès réservé au personnel autorisé
            </p>
          </div>
        </section>
      </div>

      {/* Pied de page : les coordonnées du service. Un utilisateur qui échoue à
          se connecter a besoin de pouvoir appeler — les numéros ne doivent pas
          être enfermés dans la carte. */}
      <footer className="relative mt-10 w-full max-w-5xl text-center text-[11px] text-white/40">
        <address className="not-italic">
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-white/30" />
              Ambodiaplay, Manakara
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-white/30" />
              <a href="tel:+261321109010" className="transition-colors hover:text-white">
                +261 32 11 090 10
              </a>
              <span aria-hidden="true" className="text-white/20">/</span>
              <a href="tel:+261322546911" className="transition-colors hover:text-white">
                +261 32 25 469 11
              </a>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-white/30" />
              <a
                href="mailto:srsp.fitovinany@dgfag.mg"
                className="transition-colors hover:text-white"
              >
                srsp.fitovinany@dgfag.mg
              </a>
            </span>
          </p>
        </address>
      </footer>
    </div>
  );
}

export default LoginPage;
