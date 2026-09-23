import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { Footer } from './Footer.jsx';
import { Outlet } from 'react-router-dom';

/** Gabarit principal des pages authentifiées. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default AppLayout;