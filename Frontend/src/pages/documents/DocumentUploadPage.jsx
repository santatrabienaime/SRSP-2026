import { DocumentList } from '../../components/document/DocumentList.jsx';
import { DocumentUpload } from '../../components/document/DocumentUpload.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { useState } from 'react';

/**
 * Page d'upload de documents sans dossier prédéfini :
 * le fichier est rattaché directement (courrier ou dossier indiqué dans la liste).
 */
export function DocumentUploadPage() {
  const [key, setKey] = useState(0);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Téléverser un document</h1>
        <p className="text-sm text-slate-500">
          Joindre un document au registre (rattaché à un dossier ou un courrier depuis la page concernée).
        </p>
      </div>
      <Card title="Nouveau document">
        <DocumentUpload onUploaded={() => setKey((k) => k + 1)} />
        <p className="mt-2 text-xs text-slate-400">
          Conseil : joignez vos documents depuis la fiche du dossier ou du courrier pour les rattacher automatiquement.
        </p>
      </Card>
      <Card title="Documents récents">
        <DocumentList key={key} />
      </Card>
    </div>
  );
}

export default DocumentUploadPage;