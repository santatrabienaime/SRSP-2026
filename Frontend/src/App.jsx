import AppRouter from './routes/AppRouter.jsx';
import { Toaster } from './components/ui/Toaster.jsx';

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}