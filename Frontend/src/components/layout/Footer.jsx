export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400">
      SRSP Fitovinany — Service de la Solde et des Pensions ·{' '}
      {new Date().getFullYear()}
    </footer>
  );
}

export default Footer;