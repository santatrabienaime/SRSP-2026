# Frontend — React + Vite (SRSP Fitovinany)

Interface React (Vite + Tailwind CSS) de la plateforme SRSP Fitovinany :
tableau de bord, dossiers, workflow, documents, courriers, notifications,
statistiques, rapports, administration.

## Prérequis

- Node.js 18+
- Le backend doit être démarré (`Backend/`)

## Installation & lancement

```bash
npm install
npm run dev     # serveur de dev Vite sur http://localhost:5173 (proxy /api + /socket.io)
npm run build   # build de production
npm run preview # aperçu du build
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production |
| `npm run preview` | Serveur de preview du build |
| `npm test` | Tests unitaires (Vitest) |
| `npm run lint` | Linter (oxlint) |

## Structure

- `src/pages` — pages par domaine (dossiers, documents, workflow, …)
- `src/components` — composants réutilisables
- `src/services` — appels API (axios) et hooks métier
- `src/routes` — routeurs React Router (+ garde de rôle RBAC)
- `src/contexts` — contexts (auth, UI)

## Tests

```bash
npm test
```
