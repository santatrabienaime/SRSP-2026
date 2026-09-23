import { CourrierList } from '../../components/courrier/CourrierList.jsx';

export function CourrierListPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Courriers</h1>
        <p className="text-sm text-slate-500">
          Registre des courriers entrants et sortants, liés aux dossiers.
        </p>
      </div>
      <CourrierList />
    </div>
  );
}

export default CourrierListPage;