import { DossierList } from '../../components/dossier/DossierList.jsx';

export function DossierListPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dossiers</h1>
        <p className="text-sm text-slate-500">
          Gestion, suivi et traçabilité des dossiers administratifs.
        </p>
      </div>
      <DossierList />
    </div>
  );
}

export default DossierListPage;