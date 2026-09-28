import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, MapPin, Phone, Mail, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
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

  // Écran d'accueil : les informations du service et un seul bouton. Le
  // formulaire n'existe qu'après un clic : rien à saisir n'est proposé avant
  // que l'utilisateur ait choisi de se connecter.
  const [etape, setEtape] = useState('accueil');
  const premierChamp = useRef(null);
  const boutonAccueil = useRef(null);

  const from = location.state?.from?.pathname || null;

  // Le focus suit l'étape : sans cela, la tabulation repartirait du début de la
  // page après l'apparition du formulaire.
  useEffect(() => {
    if (etape === 'formulaire') premierChamp.current?.focus();
  }, [etape]);

  const ouvrirFormulaire = () => {
    setError(null);
    setEtape('formulaire');
  };

  const revenir = () => {
    setError(null);
    setEtape('accueil');
    boutonAccueil.current?.focus();
  };

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
    <div className="palette-nuit relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 px-4 py-8 sm:px-6 sm:py-10">
      {/* Décor : fond dégradé, trame technique et halos. aria-hidden : c'est de
          la décoration, elle ne doit pas être lue. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1e3a8a_0%,#0b1220_45%,#020617_100%)]" />
        <div className="absolute inset-0 grille-futur" />
        <div className="absolute -left-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-primary-600/25 blur-3xl motion-safe:animate-halo" />
        <div
          className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-600/15 blur-3xl motion-safe:animate-halo"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      {/* Bloc centré : la carte, la mention et les contacts forment un seul
          ensemble centré horizontalement ET verticalement. */}
      <div className="relative flex w-full max-w-lg flex-col items-center justify-center">
        {/* Les deux panneaux sont superposés : le panneau inactif est en
            position absolue, donc il n'ajoute aucune hauteur. Seul le panneau
            visible est interactif (inert sur l'autre). */}
        {/* Sur un petit écran en hauteur, un minimum de 28 rem forçait un
            défilement dès l'accueil. Le minimum disparait en dessous de
            640 px de haut, où le contenu se contente de tenir. */}
        <div className="relative w-full min-h-[24rem] sm:min-h-[28rem]">
          {/* ================= ÉTAPE 1 : accueil ================= */}
          <section
            aria-hidden={etape !== 'accueil'}
            inert={etape !== 'accueil'}
            className={`flex flex-col items-center justify-center px-1 text-center transition-all duration-500 ease-out motion-reduce:transition-none ${
              etape === 'accueil'
                ? 'relative z-10 translate-y-0 scale-100 opacity-100 blur-0'
                : 'pointer-events-none absolute inset-0 z-0 -translate-y-4 scale-[.97] opacity-0 blur-md'
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 motion-safe:animate-ligne">
              République de Madagascar
            </p>
            <p className="mt-1.5 text-sm italic text-white/40 motion-safe:animate-ligne" style={{ animationDelay: '60ms' }}>
              Fitiavana &mdash; Tanindrazana &mdash; Fandrosoana
            </p>

            {/* Double filet : il se trace depuis le centre à l'arrivée. */}
            <div aria-hidden="true" className="my-6 w-full max-w-[19rem] space-y-[3px]">
              <div className="h-px w-full origin-left scale-x-0 bg-gradient-to-r from-white/45 to-transparent motion-safe:animate-[monte_.7s_.2s_cubic-bezier(.22,1,.36,1)_forwards]" />
              <div className="h-px w-full origin-right scale-x-0 bg-gradient-to-l from-white/20 to-transparent motion-safe:animate-[monte_.7s_.28s_cubic-bezier(.22,1,.36,1)_forwards]" />
            </div>

            <p className="max-w-sm text-[13px] font-bold uppercase leading-relaxed tracking-wide text-white/85 motion-safe:animate-ligne" style={{ animationDelay: '340ms' }}>
              Ministère de l&apos;Économie et des Finances
            </p>
            <h1
              className="mt-2 max-w-md text-[22px] font-semibold leading-tight motion-safe:animate-ligne texte-degrade sm:text-[26px]"
              style={{ animationDelay: '400ms' }}
            >
              Service Régional de la Solde et des Pensions Fitovinany
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45 motion-safe:animate-ligne sm:mt-6" style={{ animationDelay: '460ms' }}>
              Plateforme de gestion des dossiers administratifs : réception,
              orientation, instruction, validation et archivage, avec
              traçabilité complète des actes.
            </p>

            {/* Unique action de l'écran d'accueil. Au survol, le bouton se
                remplit du dégradé d'accent (variante « accent »). */}
            <Button
              ref={boutonAccueil}
              type="button"
              variant="accent"
              onClick={ouvrirFormulaire}
              className="group mt-7 w-full px-8 py-3.5 text-[15px] transition-transform motion-safe:animate-monte sm:mt-9 sm:w-auto"
              style={{ animationDelay: '540ms' }}
            >
              <LogIn className="h-4 w-4" />
              Se connecter
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </section>

          {/* ================= ÉTAPE 2 : formulaire ================= */}
          <section
            aria-hidden={etape !== 'formulaire'}
            inert={etape !== 'formulaire'}
            className={`flex flex-col justify-center px-1 transition-all duration-500 ease-out motion-reduce:transition-none ${
              etape === 'formulaire'
                ? 'relative z-10 translate-y-0 scale-100 opacity-100 blur-0'
                : 'pointer-events-none absolute inset-x-0 top-0 z-0 translate-y-6 scale-[.97] opacity-0 blur-md'
            }`}
          >
            {/* Monogramme : hors de la carte, juste au-dessus. Il n'apparaît
                qu'à l'étape du formulaire, l'écran d'accueil reste purement
                administratif. À remplacer par le logo officiel. */}
            <div className="mb-5 flex justify-center">
              <div className="lueur-logo flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[.07] text-base font-bold tracking-wider text-white backdrop-blur-md">
                SRSP
              </div>
            </div>

            {/* La carte s'ouvre en fondu et monte. */}
            <div className="verre relative rounded-[18px] p-5 shadow-2xl shadow-slate-950/60 ring-1 ring-white/10 sm:p-8 motion-safe:animate-monte">
              <button
                type="button"
                onClick={revenir}
                className="group -ml-1 mb-6 inline-flex items-center gap-1.5 text-[11px] font-medium text-white/45 transition-colors hover:text-cyan-300"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Retour
              </button>

              <h2 className="text-center text-lg font-semibold text-white">
                Connexion
              </h2>
              <p className="mt-1 text-center text-[11px] text-white/45">
                Accédez à votre espace de travail
              </p>

              {/* role=alert : le message est lu par les lecteurs d'écran dès
                  qu'il apparaît. */}
              <div role="alert" aria-live="assertive" className="relative z-10 mt-5 empty:mt-0">
                {error && (
                  <div className="mb-1 motion-safe:animate-secousse">
                    <Alert type="error" title="Connexion impossible">
                      {error.message}
                    </Alert>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 mt-6 space-y-4" noValidate>
                <Input
                  tone="dark"
                  label="Identifiant ou email"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  ref={premierChamp}
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="prenom.nom@srsp.mg"
                />
                <Input
                  tone="dark"
                  label="Mot de passe"
                  required
                  type="password"
                  revealPassword
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
            </div>
          </section>
        </div>

        <p className="mt-7 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/35">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          Plateforme interne — accès réservé au personnel autorisé du SRSP.
        </p>

        {/* Contacts du service : sous la carte, pas dedans. Un utilisateur qui
            échoue à se connecter a besoin de pouvoir appeler. */}
        <footer className="mt-3 w-full text-center text-[11px] text-white/40">
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
    </div>
  );
}

export default LoginPage;
