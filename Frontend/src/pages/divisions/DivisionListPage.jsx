import { DivisionList } from '../../components/division/DivisionList.jsx';

export function DivisionListPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Divisions</h1>
        <p className="text-sm text-slate-500">Les 4 divisions du SRSP et leurs responsables.</p>
      </div>
      <DivisionList />
    </div>
  );
}

export default DivisionListPage;