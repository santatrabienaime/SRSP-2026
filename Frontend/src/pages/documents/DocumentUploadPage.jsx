import { useEffect, useState } from 'react';
import { DocumentList } from '../../components/document/DocumentList.jsx';
import { DocumentUpload } from '../../components/document/DocumentUpload.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { dossierService } from '../../services/dossierService.js';
import { courrierService } from '../../services/courrierService.js';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Page d'upload de documents : le fichier peut être rattaché à un dossier ou
 * à un courrier, comme indiqué ici (le composant accepte les deux identifiants).
 */
export function DocumentUploadPage() {
  const [key, setKey] = useState(0);
  const [dossiers, setDossiers] = useState([]);
  const [courriers, setCourriers] = useState([]);
  const [dossierId, setDossierId] = useState('');
  const [courrierId, setCourrierId] = useState('');

  useEffect(() => {
    Promise.all([
      dossierService.list({}).catch(() => []),
      courrierService.list({}).catch(() => []),
    ]).then(([ds, cs]) => {
      setDossiers(Array.isArray(ds) ? ds : []);
      setCourriers(Array.isArray(cs) ? cs : []);
    });
  }, []);

  return (
    <AnimatedCard title="Téléverser un document" subtitle="Joindre un document au registre (rattaché à un dossier ou un courrier)." delay={0}>
      <Card title="Nouveau document">
        <DocumentUpload
          dossierId={dossierId || undefined}
          courrierId={courrierId || undefined}
          onUploaded={() => setKey((k) => k + 1)}
        />
        <div className="mt-4 space-y-1">
          <Select
            label="Rattacher à un dossier"
            value={dossierId}
            onChange={(e) => setDossierId(e.target.value)}
          >
            <option value="">Aucun (document indépendant)</option>
            {dossiers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.numero} — {d.objet}
              </option>
            ))}
          </Select>
          <Select
            label="Rattacher à un courrier"
            value={courrierId}
            onChange={(e) => setCourrierId(e.target.value)}
          >
            <option value="">Aucun (document non rattaché)</option>
            {courriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero} — {c.objet}
              </option>
            ))}
          </Select>
        </div>
      </Card>
      <Card title="Documents récents">
        <DocumentList key={key} />
      </Card>
    </AnimatedCard>
  );
}

export default DocumentUploadPage;