import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound, ArrowLeft, ShieldCheck, MapPin, Phone, Mail,
  Send, Info,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { useInputControl, INPUT_TYPES } from '../../hooks/useInputControl.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

/**
 * Demande de réinitialisation du mot de passe.
 *
 * Le circuit ne repose sur aucun envoi d'e-mail ni de SMS — ces canaux sont
 * exclus du périmètre de la plateforme. L'agent dépose sa demande, un
 * administrateur vérifie son identité et lui remet un **code à usage
 * unique**, que l'agent saisit ensuite pour choisir son nouveau mot de
 * passe.
 *
 * Deux règles de présentation :
 *   - la **même** confirmation s'affiche dans tous les cas, que le compte
 *     existe ou non : une réponse qui dirait « compte inconnu » permettrait
 *     d'énumérer les comptes du service ;
 *   - la page explique la **suite** de la procédure, pour que l'agent sache
 *     quoi faire de sa demande au lieu d'attendre devant un écran.
 */
export function ForgotPasswordPage() {
  const identifiant = useInputControl('', {
    type: INPUT_TYPES.LOWERCASE,
    maxLength: 255,
  });

  const [envoye, setEnvoye] = useState(false);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const premierChamp = useRef(null);

  useEffect(() => {
    if (!envoye) premierChamp.current?.focus();
  }, [envoye]);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    const valeur = identifiant.value.trim();
    if (!valeur) {
      setErreur({ message: 'Veuillez renseigner votre identifiant ou votre e-mail.' });
      return;
    }
    setChargement(true);
    try {
      const reponse = await authService.forgotPassword(valeur);
      setMessage(reponse?.message);
      setEnvoye(true);
    } catch (err) {
      setErreur(err);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="palette-nuit relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 px-4 py-6 sm:py-8">
      {/* Décor identique à LoginPage */}
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
          {/* Monogramme cohérent avec LoginPage */}
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
              <KeyRound className="h-4 w-4 text-cyan-300/80" />
              <h2 className="text-center text-base font-semibold text-white">
                Mot de passe oublié
              </h2>
            </div>
            <p className="mt-1 text-center text-[10px] text-white/45">
              Demande de réinitialisation
            </p>

            {envoye ? (
              /* ── Demande transmise ─────────────────────────────────────── */
              <div className="relative z-10 mt-4 space-y-4">
                <Alert type="success" title="Demande transmise">
                  {message}
                </Alert>

                <ol className="space-y-2 rounded-lg bg-white/[.04] p-3 text-[10px] leading-relaxed text-white/55 ring-1 ring-white/5">
                  <li className="flex gap-2">
                    <span className="font-semibold text-cyan-300">1.</span>
                    <span>
                      L&apos;administrateur du SRSP reçoit la demande et vérifie
                      votre identité.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-cyan-300">2.</span>
                    <span>
                      Il vous remet un <strong className="text-white/80">code à six chiffres</strong>,
                      valable quinze minutes.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-cyan-300">3.</span>
                    <span>
                      Vous saisissez ce code et choisissez votre nouveau mot de
                      passe.
                    </span>
                  </li>
                </ol>

                <Link to="/mot-de-passe-oublie/reset" className="block">
                  <Button variant="accent" className="w-full py-2.5 text-[14px]">
                    <KeyRound className="h-4 w-4" /> Saisir mon code
                  </Button>
                </Link>

                <p className="rounded-lg bg-white/[.04] p-2.5 text-[10px] leading-relaxed text-white/45 ring-1 ring-white/5">
                  Vous n&apos;êtes pas encore en possession du code ? Vous pouvez
                  déposer une nouvelle demande, ou contacter l&apos;administrateur
                  par le numéro ci-dessous.
                </p>

                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full py-2.5 text-[14px]">
                    <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              /* ── Formulaire de demande ────────────────────────────────── */
              <>
                <p className="mt-3 rounded-lg bg-white/[.04] p-2.5 text-[10px] leading-relaxed text-white/50 ring-1 ring-white/5">
                  Saisissez votre identifiant ou votre e-mail. Un administrateur
                  vérifie votre identité et vous remet un code de
                  réinitialisation, que vous utiliserez pour choisir votre
                  nouveau mot de passe.
                </p>

                {erreur && (
                  <div className="relative z-10 mt-3">
                    <Alert type="error" title="Demande impossible">
                      {erreur.message}
                    </Alert>
                  </div>
                )}

                <form onSubmit={soumettre} className="relative z-10 mt-4 space-y-3" noValidate>
                  <Input
                    tone="dark"
                    label="Identifiant ou email"
                    required
                    clearable
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    ref={premierChamp}
                    {...identifiant.inputProps}
                    placeholder="prenom.nom@srsp.mg"
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    loading={chargement}
                    className="mt-1 w-full py-2.5 text-[14px] transition-transform"
                  >
                    <Send className="h-4 w-4" /> Demander un code
                  </Button>
                </form>

                <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-white/40">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>
                    Pour votre sécurité, la réponse est la même que le compte
                    existe ou non : aucun identifiant n&apos;est jamais affiché
                    sur cette page.
                  </span>
                </p>

                <div className="mt-4 text-center">
                  <Link
                    to="/login"
                    className="text-[11px] font-medium text-white/50 transition-colors hover:text-cyan-300"
                  >
                    J&apos;ai mon code de réinitialisation
                  </Link>
                </div>
              </>
            )}
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

export default ForgotPasswordPage;
