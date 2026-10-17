import AppRouter from './routes/AppRouter.jsx';
import { Toaster } from './components/ui/Toaster.jsx';
import { PageLoader } from './components/ui/PageLoader.jsx';

export default function App() {
  return (
    <>
      <PageLoader>
        <AppRouter />
        <Toaster />
      </PageLoader>
    </>
  );
}