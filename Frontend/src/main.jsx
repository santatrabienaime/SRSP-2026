import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TempsReelProvider } from './contexts/TempsReelContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { UIProvider } from './contexts/UIContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          {/* Le canal temps réel est ouvert par l'application entière :
              le contexte des notifications n'en est qu'un consommateur
              parmi d'autres (tableau de bord, boîte de travail, liste
              des dossiers). */}
          <TempsReelProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </TempsReelProvider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  </StrictMode>
);