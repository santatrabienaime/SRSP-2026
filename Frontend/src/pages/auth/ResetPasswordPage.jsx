import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';

/**
 * Page sans correspondance (la réinitialisation se fait par l'admin).
 * Conservée pour la cohérence des routes /mot-de-passe-oublie/*.
 * Style identique à LoginPage / ForgotPasswordPage.
 */
export function ResetPasswordPage() {
  return (
    <div className="palette-nuit relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 px-4 py-6 sm:py-8">
      {/* Décor identique */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#1e3a8a_0%,#0b1220_45%,#020617_100%)]" />
        <div className="absolute inset-0 grille-futur" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl motion-safe:animate-halo" />
        <div
          className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-cyan-600/12 blur-3xl motion-safe:animate-halo"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center justify-center">
        <div className="relative w-full min-h-[18rem] sm:min-h-[20rem] flex flex-col justify-center">
          {/* Monogramme cohérent */}
          <div className="mb-4 flex justify-center">
            <div className="lueur-logo flex h-12 w-12 items-center justify-center rounded-xl bg-white/[.07] text-[13px] font-bold tracking-wider text-white backdrop-blur-md">
              SRSP
            </div>
          </div>

          {/* Carte verre identique */}
          <div className="verre relative rounded-2xl p-4 shadow-xl shadow-slate-950/60 ring-1 ring-white/10 sm:p-6 motion-safe:animate-monte">
            <Link
              to="/login"
              className="group -ml-1 mb-4 inline-flex items-center gap-1.5 text-[10px] font-medium text-white/45 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Retour
            </Link>

            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-300/80" />
              <h2 className="text-center text-base font-semibold text-white">
                Réinitialisation
              </h2>
            </div>
            <p className="mt-1 text-center text-[10px] text-white/45">
              Procédure administrative
            </p>

            <div className="relative z-10 mt-4">
              <Alert type="info" title="Réinitialisation du mot de passe">
                La réinitialisation s&apos;effectue via l&apos;espace
                d&apos;administration (profil → utilisateurs). Aucun lien
                externe n&apos;est disponible.
              </Alert>
            </div>

            <p className="mt-3 rounded-lg bg-white/[.04] p-2.5 text-[10px] leading-relaxed text-white/50 ring-1 ring-white/5">
              Cette page est conservée pour la cohérence des routes.
              Pour toute demande, contactez directement l&apos;administrateur
              du SRSP.
            </p>

            <Link to="/login" className="mt-4 block">
              <Button variant="secondary" className="w-full py-2.5 text-[14px]">
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/35">
          <ShieldCheck className="h-3 w-3 shrink-0" />
          Plateforme interne — accès réservé au personnel autorisé du SRSP.
        </p>

        <footer className="mt-2 w-full text-center text-[10px] text-white/40">
          <address className="not-italic">
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 text-white/30" />
                Ambodiaplay, Manakara
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-white/30" />
                <a href="tel:+261321109010" className="transition-colors hover:text-white">
                  +261 32 11 090 10
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0 text-white/30" />
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

export default ResetPasswordPage;