import { DocumentList } from '../../components/document/DocumentList.jsx';
import { Card } from '../../components/ui/Card.jsx';

/** Liste globale des documents (tous dossiers, tous courriers). */
export function DocumentListPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Documents</h1>
        <p className="text-sm text-slate-500">
          Pièces jointes uploadées sur les dossiers et les courriers.
        </p>
      </div>
      <Card>
        <DocumentList />
      </Card>
    </div>
  );
}

export default DocumentListPage;